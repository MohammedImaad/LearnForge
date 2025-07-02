from fastapi import FastAPI
from pydantic import BaseModel
from typing import List,Dict, Literal
from langchain_openai import ChatOpenAI
from langchain.schema import HumanMessage
import os
import json
import ast
from bson import ObjectId
from db import courses_collection, users_collection
from dotenv import load_dotenv
from ai_chat import chat_router
from auth import auth_router
from fastapi.middleware.cors import CORSMiddleware
from fastapi import Query

# Load environment variables
load_dotenv()
OPENAI_API_KEY = os.getenv("OPENAI_API_KEY")

app = FastAPI()
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Change this to your frontend URL in production
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# === INPUT MODEL ===
class CourseRequest(BaseModel):
    topic: str
    audience: str = "kids aged 8–15"
    weeks: int
    slides_per_week: int
    objectives: List[str]
    prompts: List[str] = []
    resources: List[str] = []

class CoursePayload(BaseModel):
    title: str
    author: str
    course_data: Dict  # Full JSON from GPT output

class UserPayload(BaseModel):
    username: str
    password: str
    type: Literal["teacher", "student"]

# === PROMPT FORMATTER ===
def format_course_prompt(topic: str, audience: str, weeks: int, slides_per_week: int, objectives: List[str], prompts: List[str],resources: List[str]) -> str:
    if len(objectives) != weeks:
        return "Error: Number of objectives must match number of weeks."

    objectives_text = "\n".join([f"- Week {i+1}: {obj}" for i, obj in enumerate(objectives)])
    user_instructions = "\n".join(f"- {p}" for p in prompts)
    resource_text = "\n".join(f"- {r}" for r in resources)

    return f"""
You are a curriculum designer for {audience}.

Create a {weeks}-week beginner course on the topic: "{topic}".

Each week must include:
- "objectives": use exactly what the user provides below
- "slides": approximately {slides_per_week} slides per week
    - each slide either has:
        - "title"
        - "explanation" (simple, fun, use analogies)
        - "extra" (code examples, links, media — optional)
    - or:
        Just a question that they need to search on the internet or a challenge
    The lesson should be mix of both the slides there should challenges in the middle.
    Make the explanations at least 100 characters.
- "quiz": 10 multiple-choice questions per week
    - each with:
        - "question"
        - "options" (4 total)
        - "answer" (correct option)

Weekly learning objectives:
{objectives_text}

Additional Resources (integrate or reference in lessons if relevant):
{resource_text}

User instructions:
{user_instructions}
No Comments in JSON please
No ellipses(...) in the response please.
Return exactly {slides_per_week} slides per week. Do not return fewer.
In Extras add actual examples or resources.
Return ONLY valid JSON in this format which could be parsed with json.loads in python:
{{
  "week1": {{ "objectives": "...", "slides": [...], "quiz": [...] }},
  "week2": {{ "objectives": "...", "slides": [...], "quiz": [...] }},
  ...
}}
"""

# === LLM INSTANCE ===
llm = ChatOpenAI(
    model="gpt-4", 
    temperature=0.5,
    api_key=OPENAI_API_KEY
)

# === MAIN ENDPOINT ===
@app.post("/generate")
async def generate_course(data: CourseRequest):
    try:
        if len(data.objectives) != data.weeks:
            return {"error": "Number of objectives must match number of weeks"}

        prompt = format_course_prompt(
            data.topic,
            data.audience,
            data.weeks,
            data.slides_per_week,
            data.objectives,
            data.prompts,
            data.resources
        )

        response = await llm.ainvoke([HumanMessage(content=prompt)])
        raw_output = response.content.strip()

        # Optional debug print
        print("\n=== RAW OUTPUT ===\n", raw_output)

        # Step 1: If LLM returns a stringified JSON (escaped), unescape it
        if raw_output.startswith('"') and raw_output.endswith('"'):
            raw_output = ast.literal_eval(raw_output)

        # Step 2: Parse it as real JSON
        return json.loads(raw_output)

    except Exception as e:
        return {"error": str(e)}

@app.post("/courses/save")
def save_course(course: CoursePayload):
    result = courses_collection.insert_one({
        "title": course.title,
        "author": course.author,
        "course_data": course.course_data
    })
    return {"message": "Course saved", "id": str(result.inserted_id)}


@app.get("/courses")
def list_courses():
    results = []
    for course in courses_collection.find():
        course["_id"] = str(course["_id"])
        results.append(course)
    return results

@app.get("/courses/by-author")
def get_courses_by_author(author: str = Query(...)):
    results = []
    for course in courses_collection.find({"author": author}):
        course["_id"] = str(course["_id"])
        results.append(course)
    return results

    
app.include_router(chat_router)
app.include_router(auth_router)


