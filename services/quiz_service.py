import json
from langchain_core.prompts import ChatPromptTemplate
from langchain_core.output_parsers import StrOutputParser
from langchain_community.vectorstores import Chroma
from langchain_text_splitters import RecursiveCharacterTextSplitter
from langchain_google_genai import ChatGoogleGenerativeAI
from langchain_community.embeddings import SentenceTransformerEmbeddings
from dotenv import load_dotenv
import os

load_dotenv()


embedding_function = SentenceTransformerEmbeddings(
    model_name="all-MiniLM-L6-v2"
)

model = ChatGoogleGenerativeAI(
    model="gemini-2.5-flash",
    google_api_key=os.getenv("API_KEY"),
)

CHROMA_DB_DIR = "./chroma_db"


async def generate_quiz(topic, difficulty, num_questions):
    """
    Uses Chroma RAG + Gemini to generate topic quizzes.
    """

    # 1. Load vector DB collection
    collection_name = f"pathway_{topic.pathway_id}"

    vector_store = Chroma(
        collection_name=collection_name,
        persist_directory=CHROMA_DB_DIR,
        embedding_function=embedding_function
    )

    retriever = vector_store.as_retriever(search_kwargs={"k": 4})

    # 2. Retrieve context
    query = f"{topic.name} {' '.join(topic.keywords or [])}"

    def format_docs(docs):
        return "\n\n".join(d.page_content for d in docs)

    retrieved_context = format_docs(await retriever.ainvoke(query))

    # 3. Build the quiz prompt
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

    prompt_text = QUIZ_PROMPT.format(
        context=retrieved_context,
        topic_name=topic.name,
        difficulty=difficulty,
        num_questions=num_questions
    )

    # 4. Send to Gemini
    resp = await model.ainvoke(prompt_text)

    # 5. Parse JSON automatically
    content = resp.content

    # Debugging: Print what the model actually returned
    print(f"DEBUG: Model Response:\n{content}")

    # Strip Markdown code blocks if present
    if "```" in content:
        content = content.replace("```json", "").replace("```", "").strip()

    return json.loads(content)


async def chat_with_pdfs(topic, user_question: str):
    """
    Answers a user's question using only the uploaded PDFs
    and returns answer with source references.
    """

    collection_name = f"pathway_{topic.pathway_id}"

    vector_store = Chroma(
        collection_name=collection_name,
        persist_directory=CHROMA_DB_DIR,
        embedding_function=embedding_function
    )

    retriever = vector_store.as_retriever(search_kwargs={"k": 4})

    # Retrieve relevant chunks
    docs = await retriever.ainvoke(user_question)

    if not docs:
        return {
            "answer": "I could not find relevant information in your uploaded documents.",
            "sources": []
        }

    # Format context + sources
    context_blocks = []
    sources = []

    for i, doc in enumerate(docs):
        context_blocks.append(
            f"[Source {i+1}] {doc.page_content}"
        )

        sources.append({
            "source_id": i + 1,
            "page": doc.metadata.get("page"),
            "document": doc.metadata.get("source")
        })

    context_text = "\n\n".join(context_blocks)

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

    prompt = CHAT_PROMPT.format(
        context=context_text,
        question=user_question
    )

    response = await model.ainvoke(prompt)
    content = response.content

    # Clean markdown if present
    if "```" in content:
        content = content.replace("```json", "").replace("```", "").strip()

    parsed = json.loads(content)

    return {
        "answer": parsed["answer"],
        "citations": parsed.get("citations", []),
        "sources": sources
    }
