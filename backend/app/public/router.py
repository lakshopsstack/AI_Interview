import base64
from io import BytesIO
import json
from fastapi import APIRouter, Depends, File, HTTPException, UploadFile
from pypdf import PdfReader
from sqlalchemy import and_, select
from sqlalchemy.orm import Session, joinedload

from app import database, services
from app.configs import openai
from app.models import City, Country, State, DSAPoolQuestion
from app.public import schemas


router = APIRouter()


@router.post("/speech-to-text")
async def speech_to_text(
    audio_file: UploadFile = File(...),
    db: Session = Depends(database.get_db),
):
    if not audio_file.content_type or not (
        audio_file.content_type.startswith("audio/")
        or audio_file.content_type == "application/octet-stream"
    ):
        raise HTTPException(
            status_code=400, detail="Invalid file type. Please upload an audio file."
        )

    if not audio_file.size or audio_file.size < 1000:
        return {"transcript": "no answer"}

    contents = await audio_file.read()
    audio_file_obj = BytesIO(contents)
    audio_file_obj.name = "audio.webm"

    result = await openai.client.audio.transcriptions.create(
        model="whisper-1", file=audio_file_obj, language="en"
    )

    if not result or not result.text:
        raise HTTPException(
            status_code=500, detail="Unable to comprehend, please re-record answer"
        )

    return {"transcript": result.text}


@router.get("/country")
async def get_country(keyword: str = "", db: Session = Depends(database.get_db)):
    stmt = (
        select(Country.id, Country.name, Country.currency)
        .where(Country.name.ilike(f"%{keyword}%"))
        .order_by(Country.name)
    )

    # Only apply limit when searching with a keyword
    if keyword:
        stmt = stmt.offset(0).limit(10)

    countries = db.execute(stmt).mappings().all()
    return countries


@router.get("/state")
async def get_state(
    country_id: str = None,
    keyword: str = "",
    db: Session = Depends(database.get_db),
):
    filters = [State.name.ilike(f"%{keyword}%")]
    if country_id:
        filters.append(
            State.country_id == country_id,
        )

    stmt = (
        select(State.id, State.name, Country.currency)
        .join(Country)
        .where(and_(*filters))
        .order_by(State.name)
        .offset(0)
        .limit(10)
    )
    states = db.execute(stmt).mappings().all()
    return states


@router.get("/city")
async def get_city(
    country_id: str = None,
    state_id: str = None,
    keyword: str = "",
    db: Session = Depends(database.get_db),
):
    filters = [City.name.ilike(f"%{keyword}%")]
    if country_id:
        filters.append(City.country_id == country_id)
    if state_id:
        filters.append(City.state_id == state_id)

    stmt = (
        select(City.id, City.name, Country.currency)
        .join(Country)
        .where(and_(*filters))
        .order_by(City.name)
        .offset(0)
        .limit(10)
    )
    cities = db.execute(stmt).mappings().all()
    return cities


@router.post("/text-to-speech")
async def text_to_speech(text_to_speech_data: schemas.TextToSpeech):
    async with openai.client.audio.speech.with_streaming_response.create(
        model="gpt-4o-mini-tts",
        voice="ash",
        input=text_to_speech_data.text,
        instructions="Speak as an interviewer",
    ) as response:

        speech_file = BytesIO()

        async for chunk in response.iter_bytes():
            speech_file.write(chunk)

        speech_file.seek(0)

        audio_base64 = ""
        if speech_file:
            audio_base64 = base64.b64encode(speech_file.read()).decode("utf-8")

        return {"audio_base64": audio_base64}


@router.post("/parse-resume")
async def parse_resume(file: UploadFile = File(...)):
    if not file:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST, detail="No file provided"
        )

    reader = PdfReader(file.file)
    text = ""
    for page in reader.pages:
        text += page.extract_text()

    prompt = f"""Extract the following structured information from this resume text.  
    Return ONLY a JSON object with these exact fields (all fields should be strings, arrays if the data is not present in resume assign those fields null):

    ```json
    {{
        "firstname": "First name",
        "lastname": "Last name",
        "email": "Email address",
        "phone": "Phone number" // without country code,
        "location": "Location or City or state",
        "linkedin_url": "LinkedIn profile URL",
        "portfolio_url": "Portfolio URL",
        "resume_text": "Full resume text",
        "work_experience": years of experience ex. 1,
        "education": highest qualification,
        "skills": ["List of technical skills"],
    }}
    ```

    Resume text:  
    {text}

    Important:
    - Return ONLY the JSON object, no other text  
    - All fields must be present  
    - Arrays must not be empty — if no data is found, use a single empty string in the array (`[""]`)  
    - All values must be strings  
    - Split the name into `first_name` and `last_name` based on the most likely parsing (first word = first name, last word = last name)  
    - If any value is missing, unclear, or not found, return an empty string for that field (e.g., `"linkedin_url": ""`)  
    - Do not remove fields or return null values — always return the full structure with valid string content
    """

    response = await openai.client.chat.completions.create(
        model="gpt-3.5-turbo",
        messages=[
            {
                "role": "system",
                "content": "You are a helpful assistant that extracts structured information from resumes. You must return a valid JSON object.",
            },
            {"role": "user", "content": prompt},
        ],
        temperature=0.1,
        response_format={"type": "json_object"},
    )

    resume_data = json.loads(response.choices[0].message.content)
    return resume_data


@router.get("/interview-question")
async def get_interview_questions_by_job(
    job_id: int, db: Session = Depends(database.get_db)
):
    return services.interview_question.get_interview_question_by_job_id(job_id, db)


@router.get("/dsapool-questions")
def get_dsapool_questions(db: Session = Depends(database.get_db)):
    # Return all DSA pool questions with their test cases
    questions = db.query(DSAPoolQuestion).options(joinedload(DSAPoolQuestion.test_cases)).all()
    return questions
