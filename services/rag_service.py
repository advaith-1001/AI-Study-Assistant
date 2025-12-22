import os
import shutil
import tempfile
import uuid
from typing import List, Tuple

import google.generativeai as genai
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from core.db import get_session, get_session_context  # We need a way to get a new session for background tasks
from models import Pathway, Topic
from models.enums import Status
from models.pathway import EmbeddingStatus  # Import your new enum

# --- RAG Imports ---
from langchain_community.document_loaders import PyPDFLoader
from langchain_community.vectorstores import Chroma
from langchain_community.embeddings import SentenceTransformerEmbeddings
from langchain_text_splitters import RecursiveCharacterTextSplitter
from langchain_core.prompts import ChatPromptTemplate
from langchain_core.output_parsers import StrOutputParser
from langchain_google_genai import ChatGoogleGenerativeAI
from langchain_core.messages import HumanMessage, AIMessage
from langchain_core.prompts import MessagesPlaceholder
from schemas.chat_request import ChatMessage
from dotenv import load_dotenv
import os


load_dotenv()

# Import your LLM, e.g., from langchain_openai or langchain_community.llms
# from langchain_openai import ChatOpenAI
# llm = ChatOpenAI(model="gpt-4o-mini")

# --- Constants ---
CHROMA_DB_DIR = "./chroma_db"
# Initialize embedding model once and reuse
embedding_function = SentenceTransformerEmbeddings(
    model_name="all-MiniLM-L6-v2"
)


model = ChatGoogleGenerativeAI(
    model="gemini-2.5-flash",  # or "gemini-1.5-pro" depending on your access
    google_api_key=os.getenv("API_KEY")
)


# --- Background Task for Embedding ---
async def process_and_embed_pdfs(pathway_id: uuid.UUID, file_contents: List[Tuple[str, bytes]]):
    """
    This runs in the background. It loads PDFs, creates chunks,
    and stores them in a unique Chroma collection for the pathway.
    """
    collection_name = f"pathway_{pathway_id}"
    all_chunks = []

    # Use a new async session for this background task
    async with get_session_context() as db:
        try:
            with tempfile.TemporaryDirectory() as temp_dir:
                for filename, contents in file_contents:
                    file_path = os.path.join(temp_dir, filename)
                    with open(file_path, "wb") as f:
                        f.write(contents)

                    # 1. Load PDF
                    loader = PyPDFLoader(file_path)
                    documents = loader.load()

                    # 2. Split
                    text_splitter = RecursiveCharacterTextSplitter(chunk_size=1000, chunk_overlap=100)
                    chunks = text_splitter.split_documents(documents)
                    all_chunks.extend(chunks)

            if not all_chunks:
                raise ValueError("No text could be extracted from the provided PDFs.")

            # 3. Embed and Store
            vector_store = Chroma.from_documents(
                documents=all_chunks,
                embedding=embedding_function,
                collection_name=collection_name,
                persist_directory=CHROMA_DB_DIR
            )
            vector_store.persist()

            # 4. Update pathway status to COMPLETED
            pathway = await db.get(Pathway, pathway_id)
            if pathway:
                pathway.embedding_status = EmbeddingStatus.COMPLETED
                db.add(pathway)
                await db.commit()
            print(f"Successfully processed PDFs for pathway {pathway_id}")

        except Exception as e:
            # 5. Handle Failure
            print(f"Failed to process PDFs for pathway {pathway_id}: {e}")
            pathway = await db.get(Pathway, pathway_id)
            if pathway:
                pathway.embedding_status = EmbeddingStatus.FAILED
                db.add(pathway)
                await db.commit()


# --- RAG Function for Generating Content ---
async def generate_summary_for_topic(topic: Topic) -> str:
    """
    Performs RAG to generate a summary for a specific topic.
    """
    collection_name = f"pathway_{topic.pathway_id}"
    collection_path = os.path.join(CHROMA_DB_DIR, "index")  # Chroma stores it in an 'index' subdir

    # Check if the vector store exists
    try:
        vector_store = Chroma(
            collection_name=collection_name,
            persist_directory=CHROMA_DB_DIR,
            embedding_function=embedding_function
        )
        # Optional: check if collection has documents
        if not vector_store._collection.count():
            return "Error: No documents found in the vector store."
    except Exception as e:
        return f"Error loading vector store: {e}"

    # 1. Load the existing vector store
    vector_store = Chroma(
        collection_name=collection_name,
        persist_directory=CHROMA_DB_DIR,
        embedding_function=embedding_function
    )

    # 2. Create a retriever
    retriever = vector_store.as_retriever(search_kwargs={"k": 4})  # Get top 4 chunks

    # 3. Formulate the search query from the topic
    search_query = f"{topic.name} {' '.join(topic.keywords or [])}"

    # 4. Define the RAG prompt
    prompt_template = """
    You are a study assistant. Produce a detailed, structured summary for the topic: "{topic_name}".

    Write ONLY from the provided context. Do not use outside knowledge. If information is missing, state that explicitly.

    Requirements:
    - Length: 600–900 words.
    - Structure: Use clear headings and subsections.
    - Depth: Explain concepts, mechanisms, and relationships; include examples from the context.
    - Precision: Quote or reference specific lines/sections from the context when supporting claims.
    - Clarity: Avoid generic filler; prioritize technical accuracy and concrete details.

    Context:
    {context}

    Output format:
    # {topic_name}: in-depth summary based on provided context

    ## Overview
    - Key idea and scope from the context.

    ## Core concepts and mechanisms
    - Definitions and how they connect.
    - Processes/algorithms/workflows described.

    ## Examples and evidence from the context
    - Concrete examples or cases (quote short snippets where relevant).

    ## Nuances, limitations, and edge cases
    - Ambiguities, trade-offs, or assumptions mentioned.

    ## Practical implications or applications
    - How to use or apply the ideas as stated in the context.

    ## Quick recap
    - 5–7 bullet points capturing the most important takeaways from the context.
    """
    prompt = ChatPromptTemplate.from_template(prompt_template)

    # 5. Build the RAG chain
    # This chain will:
    # 1. Take the "topic_name"
    # 2. Pass it to the retriever to get relevant docs
    # 3. Format the docs into a "context" string
    # 4. Plug "context" and "topic_name" into the prompt
    # 5. Send the prompt to the LLM
    # 6. Parse the output

    def format_docs(docs):
        return "\n\n---\n\n".join(doc.page_content for doc in docs)

    rag_chain = (
            {"context": retriever | format_docs, "topic_name": lambda x: x}
            | prompt
            | model  # Your LLM model
            | StrOutputParser()
    )

    # 6. Run the chain
    summary = await rag_chain.ainvoke(search_query)  # Use ainovke for async
    return summary


# services/rag_service.py

async def chat_with_pathway_pdfs(pathway_id: uuid.UUID, user_query: str, chat_history: List[ChatMessage] = []) -> str:
    collection_name = f"pathway_{pathway_id}"

    # 1. Load Vector Store
    vector_store = Chroma(
        collection_name=collection_name,
        persist_directory=CHROMA_DB_DIR,
        embedding_function=embedding_function
    )
    retriever = vector_store.as_retriever(search_kwargs={"k": 5})

    # 2. Convert Pydantic history to LangChain message objects
    # We only take the last 5-6 messages to stay within token limits
    langchain_history = []
    for msg in chat_history[-6:]:
        if msg.role == "user":
            langchain_history.append(HumanMessage(content=msg.content))
        else:
            langchain_history.append(AIMessage(content=msg.content))

    # 3. Contextualize Question (The Re-phrasing Step)
    contextualize_q_system_prompt = """Given a chat history and the latest user question \
    which might reference context in the chat history, formulate a standalone question \
    which can be understood without the chat history. Do NOT answer the question, \
    just reformulate it if needed and otherwise return it as is."""

    contextualize_q_prompt = ChatPromptTemplate.from_messages([
        ("system", contextualize_q_system_prompt),
        MessagesPlaceholder("chat_history"),
        ("human", "{input}"),
    ])

    # This sub-chain creates a search term that makes sense for the PDF
    history_aware_retriever = (
            contextualize_q_prompt
            | model
            | StrOutputParser()
            | retriever
    )

    # 4. Final Answer Chain
    qa_system_prompt = """You are an expert tutor. Use the following pieces of retrieved context \
    to answer the question. If you don't know the answer, say that you don't know. \
    Keep the answer concise.

    Context:
    {context}"""

    qa_prompt = ChatPromptTemplate.from_messages([
        ("system", qa_system_prompt),
        MessagesPlaceholder("chat_history"),
        ("human", "{input}"),
    ])

    def format_docs(docs):
        return "\n\n".join(doc.page_content for doc in docs)

    # Full Chain Construction
    rag_chain = (
            {
                "context": history_aware_retriever | format_docs,
                "chat_history": lambda x: x["chat_history"],
                "input": lambda x: x["input"]
            }
            | qa_prompt
            | model
            | StrOutputParser()
    )

    # 5. Invoke
    answer = await rag_chain.ainvoke({
        "input": user_query,
        "chat_history": langchain_history
    })

    return answer