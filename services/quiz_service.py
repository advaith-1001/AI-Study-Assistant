import os
import json
import uuid
import asyncio
from typing import List, Tuple

from dotenv import load_dotenv
from langchain_huggingface import HuggingFaceEmbeddings
from langchain_postgres import PGVector
from langchain_core.prompts import ChatPromptTemplate
from langchain_core.output_parsers import StrOutputParser
from langchain_google_genai import ChatGoogleGenerativeAI

load_dotenv()

# ---------------- CONFIG ----------------

embedding_function = HuggingFaceEmbeddings(
    model_name="all-MiniLM-L6-v2",
    encode_kwargs={"normalize_embeddings": True}
)

SYNC_DB_URL = os.getenv("VECTOR_DB_URL")

model = ChatGoogleGenerativeAI(
    model="gemini-2.5-flash",
    google_api_key=os.getenv("API_KEY"),
)


# ---------------------------------------------------------
# QUIZ GENERATION SERVICE
# ---------------------------------------------------------

async def generate_quiz(topic, difficulty, num_questions):
    """
    Uses PGVector RAG + Gemini to generate topic quizzes.
    """
    collection_name = f"pathway_{topic.pathway_id}"
    sync_url = SYNC_DB_URL

    # --- THE SYNC THREAD BRIDGE ---
    def get_context_sync():
        try:
            vector_store = PGVector(
                collection_name=collection_name,
                connection=sync_url,
                embeddings=embedding_function,
                use_jsonb=True,
            )

            query = f"{topic.name} {' '.join(topic.keywords or [])}"
            # Retrieve relevant chunks
            docs = vector_store.similarity_search(query, k=4)
            return "\n\n".join(d.page_content for d in docs)
        except Exception as e:
            print(f"❌ Quiz Context Sync Error: {e}")
            return ""

    # 1. Run retrieval in thread to avoid async driver conflicts
    retrieved_context = await asyncio.to_thread(get_context_sync)

    if not retrieved_context:
        print("⚠️ Warning: No context retrieved for quiz generation.")

    # 2. Build the quiz prompt
    QUIZ_PROMPT = """
    You are an expert AI tutor.

    You have access to the following study material:
    -----
    {context}
    -----

    Task:
    - Generate {num_questions} multiple-choice quiz questions for the topic: "{topic_name}".
    - Difficulty: {difficulty}.
    - Questions must be exam-style: natural phrasing, no references to "the text", "the context", or "the figure".
    - Use the study material only as background knowledge. Do not mention it explicitly.
    - Each question should test understanding, application, or reasoning, not just recall.

    Output format:
    {{
      "topic": "{topic_name}",
      "questions": [
        {{
          "type": "mcq",
          "question": "...",
          "options": ["..."],
          "answer": "...",
          "explanation": "..."
        }}
      ]
    }}
    """

    prompt = ChatPromptTemplate.from_template(QUIZ_PROMPT)
    rag_chain = prompt | model | StrOutputParser()

    # 3. Send to Gemini
    content = await rag_chain.ainvoke({
        "context": retrieved_context,
        "topic_name": topic.name,
        "difficulty": difficulty,
        "num_questions": num_questions
    })

    # 4. Parse JSON automatically
    print(f"DEBUG: Model Response:\n{content}")

    # Strip Markdown code blocks if present
    if "```" in content:
        content = content.replace("```json", "").replace("```", "").strip()

    return json.loads(content)


async def chat_with_pdfs(topic, user_question: str):
    """
    Answers a user's question using only the uploaded PDFs
    and returns answer with source references using PGVector.
    """
    collection_name = f"pathway_{topic.pathway_id}"
    sync_url = SYNC_DB_URL

    # --- THE SYNC THREAD BRIDGE ---
    def get_docs_and_context_sync():
        try:
            vector_store = PGVector(
                collection_name=collection_name,
                connection=sync_url,
                embeddings=embedding_function,
                use_jsonb=True,
            )

            # Retrieve relevant chunks
            docs = vector_store.similarity_search(user_question, k=4)

            context_blocks = []
            sources = []
            for i, doc in enumerate(docs):
                context_blocks.append(f"[Source {i + 1}] {doc.page_content}")
                sources.append({
                    "source_id": i + 1,
                    "page": doc.metadata.get("page"),
                    "document": doc.metadata.get("source")
                })

            return "\n\n".join(context_blocks), sources
        except Exception as e:
            print(f"❌ Chat PDFs Sync Error: {e}")
            return "", []

    # 1. Run retrieval in thread
    context_text, sources = await asyncio.to_thread(get_docs_and_context_sync)

    if not context_text:
        return {
            "answer": "I could not find relevant information in your uploaded documents.",
            "sources": []
        }

    # 2. Build the chat prompt
    CHAT_PROMPT = """
    You are a helpful AI study assistant.

    Answer the user's question using ONLY the information
    from the provided sources.

    If the answer is not present in the sources, say:
    "The uploaded documents do not contain this information."

    After answering, cite the source numbers used.

    Sources:
    -----
    {context}
    -----

    Question:
    {question}

    Output JSON format:
    {{
      "answer": "...",
      "citations": [1, 2]
    }}
    """

    prompt = ChatPromptTemplate.from_template(CHAT_PROMPT)
    rag_chain = prompt | model | StrOutputParser()

    # 3. Generate response
    response_content = await rag_chain.ainvoke({
        "context": context_text,
        "question": user_question
    })

    # 4. Clean and parse JSON
    if "```" in response_content:
        response_content = response_content.replace("```json", "").replace("```", "").strip()

    parsed = json.loads(response_content)

    return {
        "answer": parsed["answer"],
        "citations": parsed.get("citations", []),
        "sources": sources
    }