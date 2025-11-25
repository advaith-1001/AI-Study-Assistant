import json
import google.generativeai as genai
from dotenv import load_dotenv
import os

load_dotenv()

genai.configure(api_key=os.getenv("API_KEY"))

async def generate_structured_pathway(user_topics: list[str], pathway_name: str) -> dict:
    """
    Calls the LLM to reorder topics and fill missing ones.
    Returns parsed JSON structure.


    """
    model = genai.GenerativeModel(
        "gemini-2.5-flash",
        # 2. Set the generation config to output JSON
        generation_config=genai.GenerationConfig(
            response_mime_type="application/json"
        )
    )

    prompt = f"""
You are an expert learning path designer.
Given the following unordered topics:

{user_topics}

Reorder them into a logical learning sequence and fill any missing intermediate topics.
Return a **strict JSON** like this:

{{
  "name": "{pathway_name}",
  "topics": [
    {{
      "name": "string",
      "order_number": int,
      "keywords": ["keyword1", "keyword2", ...]
    }}
  ]
}}
"""

    response = await model.generate_content_async(prompt)

    return json.loads(response.text)