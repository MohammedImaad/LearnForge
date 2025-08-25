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
from google.oauth2.credentials import Credentials
from google_auth_oauthlib.flow import InstalledAppFlow
from googleapiclient.discovery import build
import pickle
import os
class SlideDeckRequest(BaseModel):
    course_id: str


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
    user_id:str
    course_data: Dict 

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
- "objectives": use exactly what the user says but frame it better
- "slides": approximately {slides_per_week} slides per week
    - each slide either has:
        - "title"
        - "explanation" (simple, fun, use analogies)
        - "extra" (code examples, links, media — optional)
    - or:
        Just a question that they need to search on the internet or a challenge
    The lesson should be mix of both the slides there should challenges in the middle.
    Make the explanations as descriptive as possible.
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
"title":"Generate a title",
"description":"Generate a description",
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

SCOPES = ['https://www.googleapis.com/auth/presentations']
TOKEN_FILE = 'token.pkl'
CREDENTIALS_FILE = 'credentials.json'

def get_slides_service():
    creds = None
    # Load saved credentials if available
    if os.path.exists(TOKEN_FILE):
        with open(TOKEN_FILE, 'rb') as token:
            creds = pickle.load(token)
    # If not, run OAuth flow
    if not creds or not creds.valid:
        flow = InstalledAppFlow.from_client_secrets_file(CREDENTIALS_FILE, SCOPES)
        creds = flow.run_local_server(port=0)
        with open(TOKEN_FILE, 'wb') as token:
            pickle.dump(creds, token)
    service = build('slides', 'v1', credentials=creds)
    return service


@app.post("/slides/create")
def create_slide_deck(data: SlideDeckRequest):
    try:
        # 1. Find course
        course = courses_collection.find_one({"_id": ObjectId(data.course_id)})
        if not course:
            raise HTTPException(status_code=404, detail="Course not found")

        service = get_slides_service()

        # 2. Create a new presentation
        presentation = service.presentations().create(
            body={"title": course["course_data"].get("courseTitle", "Untitled Course")}
        ).execute()
        presentation_id = presentation['presentationId']

        # 3. Loop through weeks/slides
        for week_key, week_data in course["course_data"].items():
            if not week_key.startswith("week"):
                continue  

            for slide in week_data.get("slides", []):
                slide_title = slide.get("title", "")
                slide_desc = slide.get("explanation", "")

                # 3a. Create a new blank slide (no placeholders)
                create_slide_response = service.presentations().batchUpdate(
                    presentationId=presentation_id,
                    body={
                        "requests": [
                            {
                                "createSlide": {
                                    "slideLayoutReference": {
                                        "predefinedLayout": "BLANK"
                                    }
                                }
                            }
                        ]
                    }
                ).execute()

                new_slide_id = create_slide_response["replies"][0]["createSlide"]["objectId"]

                insert_requests = []

                # 3b. Create title text box
                new_title_id = f"title_{new_slide_id}"
                insert_requests.append({
                    "createShape": {
                        "objectId": new_title_id,
                        "shapeType": "TEXT_BOX",
                        "elementProperties": {
                            "pageObjectId": new_slide_id,
                            "size": {
                                "height": {"magnitude": 80, "unit": "PT"},
                                "width": {"magnitude": 600, "unit": "PT"}
                            },
                            "transform": {
                                "scaleX": 1, "scaleY": 1,
                                "translateX": 50, "translateY": 50,
                                "unit": "PT"
                            }
                        }
                    }
                })
                insert_requests.append({
                    "insertText": {
                        "objectId": new_title_id,
                        "insertionIndex": 0,
                        "text": slide_title
                    }
                })

                # 3c. Create body text box
                new_body_id = f"body_{new_slide_id}"
                insert_requests.append({
                    "createShape": {
                        "objectId": new_body_id,
                        "shapeType": "TEXT_BOX",
                        "elementProperties": {
                            "pageObjectId": new_slide_id,
                            "size": {
                                "height": {"magnitude": 300, "unit": "PT"},
                                "width": {"magnitude": 600, "unit": "PT"}
                            },
                            "transform": {
                                "scaleX": 1, "scaleY": 1,
                                "translateX": 50, "translateY": 150,
                                "unit": "PT"
                            }
                        }
                    }
                })
                insert_requests.append({
                    "insertText": {
                        "objectId": new_body_id,
                        "insertionIndex": 0,
                        "text": slide_desc
                    }
                })

                # 3d. Apply requests
                if insert_requests:
                    service.presentations().batchUpdate(
                        presentationId=presentation_id,
                        body={"requests": insert_requests}
                    ).execute()

        # Convert ObjectId to string for JSON safety
        course["_id"] = str(course["_id"])
        course["user_id"] = str(course["user_id"])

        return {
            "message": "Presentation created with course slides",
            "presentation_id": presentation_id
        }

    except Exception as e:
        return {"error": str(e)}

@app.post("/courses/save")
def save_course(course: CoursePayload):
    result = courses_collection.insert_one({
        "user_id": ObjectId(course.user_id),
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

def convert_objectids(doc):
    """Recursively convert all ObjectId fields to strings."""
    if isinstance(doc, list):
        return [convert_objectids(d) for d in doc]
    elif isinstance(doc, dict):
        new_doc = {}
        for k, v in doc.items():
            if isinstance(v, ObjectId):
                new_doc[k] = str(v)
            else:
                new_doc[k] = convert_objectids(v)
        return new_doc
    else:
        return doc

@app.get("/courses/by-user")
def get_courses_by_user(user_id: str = Query(...)):
    try:
        user_obj_id = ObjectId(user_id)
    except errors.InvalidId:
        raise HTTPException(status_code=400, detail="Invalid user_id format")

    results = []
    for course in courses_collection.find({"user_id": user_obj_id}):
        results.append(convert_objectids(course))
    return results

    
app.include_router(chat_router)
app.include_router(auth_router)


