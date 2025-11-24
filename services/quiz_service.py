import json
import google.generativeai as genai

genai.configure(api_key="AIzaSyBg626ccfGpU0U8iNE4QUD6D-GezWkxpHM")


async def generate_quiz(topic, difficulty, num_questions, retriever):
    context = retriever.get_relevant_chunks(topic.keywords)

    QUIZ_PROMPT = """
    You are an expert AI tutor. Generate a quiz strictly in JSON only.

    Topic: {topic_name}
    Difficulty: {difficulty}
    Keywords: {keywords}
    Context from user’s PDF:
    -----
    {retrieved_context}
    -----

    Generate {num_questions} questions mixing MCQ, short-answer, and true/false.
    Each question must have:
    - "type": "mcq" | "short" | "true_false"
    - "question": string
    - "options": array (for mcq only)
    - "answer": string
    - "explanation": string

    Return JSON with this shape:

    {
    "topic": "...",
      "questions": [
        {
    "type": "...",
          "question": "...",
          "options": ["..."],
          "answer": "...",
          "explanation": "..."
        }
      ]
    }

    """

    prompt = QUIZ_PROMPT.format(
        topic_name=topic.name,
        difficulty=difficulty,
        keywords=", ".join(topic.keywords),
        retrieved_context=context,
        num_questions=num_questions
    )

    model = genai.GenerativeModel(
        "gemini-2.5-flash",
        # 2. Set the generation config to output JSON
        generation_config=genai.GenerationConfig(
            response_mime_type="application/json"
        )
    )

    response = await model.generate_content_async(prompt)

    return json.loads(response.text)
