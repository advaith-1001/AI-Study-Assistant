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

    Using ONLY this context from the student's uploaded study material:
    -----
    {context}
    -----

    Generate {num_questions} quiz questions for the topic: "{topic_name}".
    Difficulty: {difficulty}

    Each question must be STRICT JSON with this shape:

    {{
      "type": "mcq" | "short" | "true_false",
      "question": "...",
      "options": ["..."],  # only for mcq
      "answer": "...",
      "explanation": "..."
    }}

    Return final output as:

    {{
      "topic": "{topic_name}",
      "questions": [ ... ]
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
