import os
import tempfile
import uuid
import asyncio
from typing import List, Tuple
import time
from dotenv import load_dotenv
from sqlalchemy.ext.asyncio import create_async_engine
import traceback
from core.db import get_session_context
from models import Pathway, Topic
from models.pathway import EmbeddingStatus

from langchain_community.document_loaders import PyPDFLoader
from langchain_postgres import PGVector
from langchain_text_splitters import RecursiveCharacterTextSplitter
from langchain_core.prompts import ChatPromptTemplate, MessagesPlaceholder
from langchain_core.output_parsers import StrOutputParser
from langchain_google_genai import ChatGoogleGenerativeAI
from langchain_core.messages import HumanMessage, AIMessage
from langchain_huggingface import HuggingFaceEndpointEmbeddings

from schemas.chat_request import ChatMessage

load_dotenv()

embedding_function = HuggingFaceEndpointEmbeddings(
    model="sentence-transformers/all-MiniLM-L6-v2",
    huggingfacehub_api_token=os.getenv("HF_TOKEN")
)

ASYNC_DB_URL = os.getenv("DATABASE_URL")
SYNC_DB_URL = os.getenv("VECTOR_DB_URL")

if not ASYNC_DB_URL or not SYNC_DB_URL:
    raise ValueError("Both DATABASE_URL and VECTOR_DB_URL must be set")

model = ChatGoogleGenerativeAI(
    model="gemini-2.5-flash",
    google_api_key=os.getenv("API_KEY"),
)

async def process_and_embed_pdfs(pathway_id: uuid.UUID, file_contents: List[Tuple[str, bytes]]):
    async with get_session_context() as db:
        try:
            all_chunks = []
            with tempfile.TemporaryDirectory() as temp_dir:
                for filename, contents in file_contents:
                    file_path = os.path.join(temp_dir, filename)
                    with open(file_path, "wb") as f:
                        f.write(contents)

                    loader = PyPDFLoader(file_path)
                    documents = loader.load()

                    text_splitter = RecursiveCharacterTextSplitter(chunk_size=1000, chunk_overlap=100)
                    chunks = text_splitter.split_documents(documents)
                    all_chunks.extend(chunks)

            # --- 🔥 THE CRITICAL FIX: AGGRESSIVE TYPE ENFORCEMENT ---
            sanitized_chunks = []
            for chunk in all_chunks:
                # Force content to string safely
                content = chunk.page_content

                if content is None:
                    continue

                # Convert to string and remove null bytes/whitespace
                clean_text = str(content).replace('\x00', '').strip()

                # REJECT: Empty strings or tiny fragments (less than 10 chars)
                if len(clean_text) < 10:
                    continue

                # Update the object and keep it
                chunk.page_content = clean_text
                sanitized_chunks.append(chunk)

            print(f"🧼 TRACE: Sanitize complete. {len(all_chunks)} -> {len(sanitized_chunks)} chunks.")

            if not sanitized_chunks:
                raise ValueError("No valid text found in the PDFs.")

            def sync_storage_logic():
                print("📡 TRACE: Initializing Sync PGVector Handshake...")
                clean_url = SYNC_DB_URL.replace("postgresql+asyncpg", "postgresql")

                try:
                    # 1. Initialize the VectorStore (without adding docs yet)
                    vector_store = PGVector(
                        embeddings=embedding_function,
                        collection_name=f"pathway_{pathway_id}",
                        connection=clean_url,
                        use_jsonb=True,
                    )

                    # 2. Add documents in batches to avoid 429 errors
                    batch_size = 50  # Stay well under the 1500 RPM limit
                    for i in range(0, len(sanitized_chunks), batch_size):
                        batch = sanitized_chunks[i: i + batch_size]
                        print(f"📦 DEBUG: Embedding batch {i // batch_size + 1}...")

                        vector_store.add_documents(batch)

                        # 3. Small sleep to let the Google API quota "breathe"
                        time.sleep(1)

                    print(f"✅ TRACE: Successfully stored {len(sanitized_chunks)} chunks.")
                    return True
                except Exception as e:
                    print(f"🚨 PGVector INTERNAL ERROR: {type(e).__name__}: {str(e)}")
                    raise e

            await asyncio.to_thread(sync_storage_logic)

            # Update Pathway Status
            pathway = await db.get(Pathway, pathway_id)
            if pathway:
                pathway.embedding_status = EmbeddingStatus.COMPLETED
                await db.commit()
                print("🏁 TRACE: Pathway is now LIVE.")

        except Exception as e:
            print(f"🚨 CRITICAL RAG FAILURE: {str(e)}")
            traceback.print_exc()
            pathway = await db.get(Pathway, pathway_id)
            if pathway:
                pathway.embedding_status = EmbeddingStatus.FAILED
                await db.commit()
# ---------------------------------------------------------
# RAG SUMMARY GENERATION
# ---------------------------------------------------------

async_engine = create_async_engine(os.getenv("DATABASE_URL"))


async def generate_summary_for_topic(topic: Topic) -> str:
    collection_name = f"pathway_{topic.pathway_id}"
    print(f"🔍 TRACE: Generating summary for {topic.name}")

    # Use the clean Sync URL (port 5432 or 6543, no asyncpg)
    sync_url = SYNC_DB_URL

    # This inner function handles all the "Sync" work of PGVector
    def get_context_sync():
        try:
            vector_store = PGVector(
                collection_name=collection_name,
                connection=sync_url,
                embeddings=embedding_function,  # Ensure this is 'embeddings'
                use_jsonb=True,
            )

            search_query = f"{topic.name} {' '.join(topic.keywords or [])}"
            # Use k=5 for better context
            docs = vector_store.similarity_search(search_query, k=5)
            return "\n\n".join(doc.page_content for doc in docs)
        except Exception as e:
            print(f"❌ Inner Sync Error: {e}")
            return ""

    # 1. Run the retrieval in a thread to avoid driver/async conflicts
    context = await asyncio.to_thread(get_context_sync)

    if not context:
        return "Could not retrieve context from the study materials."

    # 2. Now use the LLM to process the context (this part is safe to await)
    prompt_template = """
    You are an expert academic mentor and technical writer. Your goal is to transform the provided context into a high-quality, comprehensive study guide for the topic: "{topic_name}".

    ### INSTRUCTIONS:
    1.  **Tone & Voice:** Use a professional yet conversational human tone. Avoid robotic phrases like "Here is the summary" or "Based on the context provided." Write as if you are a mentor explaining a complex concept to a bright student.
    2.  **Detail Level:** Be exhaustive. Don't just summarize; synthesize. If the context contains nuances, examples, or technical steps, include them.
    3.  **Structure:** Use clear Markdown formatting. Use hierarchical headings (##, ###), bold text for emphasis, and bullet points for lists.
    4.  **No Hallucinations:** Use ONLY the provided context. If the context doesn't contain enough information to explain a specific sub-point, stick to what is available rather than making things up.
    5.  **Flow:** Ensure smooth transitions between sections so it reads like a cohesive chapter from a modern textbook.

    ### STUDY GUIDE STRUCTURE:
    - **Executive Overview:** A high-level introduction to the topic and why it matters.
    - **Deep Dive:** A detailed breakdown of the core concepts, mechanisms, or theories found in the context.
    - **Key Technical Details:** Mention specific terminologies, formulas, or configurations if present.
    - **Practical Implications/Examples:** How this topic is applied in the real world (based on the context).
    - **Summary Checklist:** A few bullet points of the "Must-Know" takeaways.

    ### CONTEXT:
    {context}

    ### OUTPUT (Markdown Format):
    """

    prompt = ChatPromptTemplate.from_template(prompt_template)
    rag_chain = prompt | model | StrOutputParser()

    return await rag_chain.ainvoke({
        "context": context,
        "topic_name": topic.name
    })


# ---------------------------------------------------------
# CHAT WITH PATHWAY PDFS
# ---------------------------------------------------------

async def chat_with_pathway_pdfs(
        pathway_id: uuid.UUID,
        user_query: str,
        chat_history: List[ChatMessage] = [],
) -> str:
    collection_name = f"pathway_{pathway_id}"
    sync_url = SYNC_DB_URL  # Ensure this is your clean sync URL

    # 1. Convert our ChatMessage objects to LangChain Message objects
    langchain_history = []
    for msg in chat_history[-6:]:
        if msg.role == "user":
            langchain_history.append(HumanMessage(content=msg.content))
        else:
            langchain_history.append(AIMessage(content=msg.content))

    # --- THE SYNC THREAD BRIDGE ---
    def get_context_and_standalone_query_sync():
        try:
            # Re-initialize the sync vector store
            vector_store = PGVector(
                collection_name=collection_name,
                connection=sync_url,
                embeddings=embedding_function,
                use_jsonb=True,
            )

            # Step A: Contextualize the question (handle "it", "they", etc.)
            # If history exists, ask the model to re-write the query
            standalone_query = user_query
            if langchain_history:
                condense_prompt = ChatPromptTemplate.from_messages([
                    ("system",
                     "Given the chat history and a follow-up question, rephrase the follow-up to be a standalone question."),
                    MessagesPlaceholder("chat_history"),
                    ("human", "{input}")
                ])
                # We can run a small chain here or just use the model directly
                chain = condense_prompt | model | StrOutputParser()
                standalone_query = chain.invoke({"chat_history": langchain_history, "input": user_query})

            # Step B: Perform Similarity Search
            docs = vector_store.similarity_search(standalone_query, k=5)
            context = "\n\n".join(doc.page_content for doc in docs)

            return context, standalone_query
        except Exception as e:
            print(f"❌ Chat Sync Error: {e}")
            return "", user_query

    # 2. Run the DB/Context work in a thread
    context, final_query = await asyncio.to_thread(get_context_and_standalone_query_sync)

    if not context:
        return "I'm sorry, I couldn't find any relevant information in the uploaded documents to answer that."

    # --- FINAL GENERATION ---
    # 3. Use the LLM to generate the final answer with the retrieved context
    qa_prompt = ChatPromptTemplate.from_messages([
        ("system",
         "You are a helpful study assistant. Answer the question ONLY using the provided context. If the answer isn't in the context, say you don't know.\n\nContext:\n{context}"),
        MessagesPlaceholder("chat_history"),
        ("human", "{input}")
    ])

    rag_chain = qa_prompt | model | StrOutputParser()

    return await rag_chain.ainvoke({
        "context": context,
        "chat_history": langchain_history,
        "input": final_query
    })