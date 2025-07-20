import base64
from typing import Dict
from fastapi import APIRouter, Depends, Request, WebSocket, WebSocketDisconnect, Response, File, UploadFile, BackgroundTasks, Query, HTTPException
from sqlalchemy import and_, func, select, update, case
from sqlalchemy.dialects.postgresql import insert
from sqlalchemy.orm import Session
import datetime
import os
import time
import subprocess
import logging
import aiohttp

from app.lib.errors import CustomException
from app import config, database
from app.dependencies.authorization import authorize_candidate
from app.models import DSAResponse, DSATestCase, DSATestCaseResponse, Interview, DSAQuestion, QuizQuestion, AiInterviewedJob, Company, QuizOption, QuizResponse, InterviewQuestionAndResponse, InterviewQuestion, InterviewQuestionResponse
from app.interview import schemas
from app.lib import jwt
from fpdf import FPDF
import unicodedata
import io
from app.configs import openai
import json
import random
from app.services import brevo, gcs
from app import services

from app.services import gcs as gcs_service

router = APIRouter()


class InterviewConnectionManager:
    def __init__(self):
        self.active_connections: Dict[int, WebSocket] = {}

    async def connect(self, interview_id: int, websocket: WebSocket):
        await websocket.accept()
        self.active_connections[interview_id] = websocket

    def disconnect(self, interview_id: int):
        self.active_connections.pop(interview_id, None)

    async def send_data(self, interview_id: int, data):
        websocket = self.active_connections.get(interview_id)
        if websocket:
            await websocket.send_json(data)


interview_connection_manager = InterviewConnectionManager()


@router.websocket("")
async def ws(
    websocket: WebSocket,
    i_token=str,
):
    if not i_token:
        websocket.close(reason="Cannot Authenticate")
    decoded_data = jwt.decode(i_token)

    interview_id = decoded_data["interview_id"]

    await interview_connection_manager.connect(
        interview_id=interview_id, websocket=websocket
    )

    async for data in websocket.iter_json():
        print(data)
        await websocket.send_json({"message": "working..."})


@router.post("/dsa-response")
async def create_dsa_response(
    response_data: schemas.CreateDSAResponse,
    db: Session = Depends(database.get_db),
    interview_id=Depends(authorize_candidate),
):
    stmt = insert(DSAResponse).values(
        code=response_data.code,
        interview_id=interview_id,
        dsa_question_id=response_data.question_id,
    )
    upsert_stmt = stmt.on_conflict_do_update(
        index_elements=["interview_id", "dsa_question_id"],
        set_={
            "code": stmt.excluded.code,
        },
    ).returning(DSAResponse.id)

    result = db.execute(upsert_stmt)
    db.commit()
    dsa_response_id = result.all()[0]._mapping["id"]

    stmt = select(DSATestCase.id, DSATestCase.input, DSATestCase.expected_output).where(
        DSATestCase.dsa_question_id == response_data.question_id
    )
    test_cases = [dict(test_case._mapping) for test_case in db.execute(stmt).all()]

    entries = []
    for test_case in test_cases:
        entries.append(
            {
                "language": response_data.language,
                "runConfig": {
                    "customMatcherToUseForExpectedOutput": "IgnoreWhitespaceAtStartAndEndForEveryLine",
                    "expectedOutputAsBase64UrlEncoded": base64.urlsafe_b64encode(
                        test_case["expected_output"].encode()
                    )
                    .decode()
                    .rstrip("="),
                    "stdinStringAsBase64UrlEncoded": base64.urlsafe_b64encode(
                        test_case["input"].encode()
                    )
                    .decode()
                    .rstrip("="),
                    "callbackUrlOnExecutionCompletion": config.settings.URL
                    + "/interview/dsa-response/callback",
                    "shouldEnablePerProcessAndThreadCpuTimeLimit": False,
                    "shouldEnablePerProcessAndThreadMemoryLimit": False,
                    "shouldAllowInternetAccess": False,
                    # "compilerFlagString": "",
                    "maxFileSizeInKilobytesFilesCreatedOrModified": 1024,
                    "stackSizeLimitInKilobytes": 65536,
                    "cpuTimeLimitInMilliseconds": 2000,
                    "wallTimeLimitInMilliseconds": 5000,
                    "memoryLimitInKilobyte": 131072,
                    "maxProcessesAndOrThreads": 60,
                },
                "sourceCodeAsBase64UrlEncoded": base64.urlsafe_b64encode(
                    response_data.code.encode()
                )
                .decode()
                .rstrip("="),
            }
        )

    async with aiohttp.ClientSession() as session:
        async with session.post(
            "https://backend.codedamn.com/api/public/request-dsa-code-execution-batch",
            headers={"FERMION-API-KEY": config.settings.FERMION_API_KEY},
            json={"data": [{"data": {"entries": entries}}]},
        ) as response:
            result = await response.json()
            taskIds = result[0]["output"]["data"]["taskIds"]

            dsa_test_case_responses = []
            for i in range(len(test_cases)):
                dsa_test_case_responses.append(
                    {
                        "status": "pending",
                        "dsa_response_id": dsa_response_id,
                        "task_id": taskIds[i],
                        "dsa_test_case_id": test_cases[i]["id"],
                    }
                )
            stmt = insert(DSATestCaseResponse).values(dsa_test_case_responses)
            stmt = stmt.on_conflict_do_update(
                index_elements=["dsa_response_id", "dsa_test_case_id"],
                set_={"status": "pending", "task_id": stmt.excluded.task_id},
            )
            db.execute(stmt)
            db.commit()

    return {"message": "executing"}


@router.post("/dsa-response/callback")
async def execution_callback(request: Request, db: Session = Depends(database.get_db)):
    data = await request.json()

    taskUID = data["taskUniqueId"]
    runStatus = data["runResult"]["runStatus"]
    compilation_output = data["runResult"][
        "compilerOutputAfterCompilationBase64UrlEncoded"
    ]
    execution_err = (
        data["runResult"]["programRunData"]["stderrBase64UrlEncoded"]
        if data["runResult"]["programRunData"]
        else ""
    )
    output = (
        data["runResult"]["programRunData"]["stdoutBase64UrlEncoded"]
        if data["runResult"]["programRunData"]
        else ""
    )
    input = data["runConfig"]["stdinStringAsBase64UrlEncoded"]

    stmt = (
        update(DSATestCaseResponse)
        .values({"status": runStatus})
        .where(DSATestCaseResponse.task_id == taskUID)
        .returning(DSATestCaseResponse.dsa_response_id)
    )
    result = db.execute(stmt)
    db.commit()
    dsa_response_id = result.mappings().one()["dsa_response_id"]

    if runStatus != "successful":
        stmt = (
            select(
                Interview.id.label("interview_id"),
                DSATestCaseResponse.dsa_test_case_id,
                DSATestCaseResponse.status,
                DSATestCase.expected_output,
                DSATestCase.input,
            )
            .select_from(DSATestCaseResponse)
            .join(DSAResponse, DSAResponse.id == DSATestCaseResponse.dsa_response_id)
            .join(
                Interview,
                Interview.id == DSAResponse.interview_id,
            )
            .join(DSATestCase, DSATestCase.id == DSATestCaseResponse.dsa_test_case_id)
            .where(DSATestCaseResponse.task_id == taskUID)
        )
        data = db.execute(stmt).mappings().one()
        output: str

        stmt = (
            update(DSAResponse)
            .values(passed=False)
            .where(DSAResponse.id == dsa_response_id)
        )
        db.execute(stmt)
        db.commit()

        await interview_connection_manager.send_data(
            data["interview_id"],
            {
                "taskUID": taskUID,
                "input": base64.urlsafe_b64decode(
                    input + ((4 - (len(input) % 4)) * "=")
                ).decode(),
                "event": "execution_result",
                "status": "failed",
                "failed_test_case": {
                    "test_case_id": data["dsa_test_case_id"],
                    "status": data["status"],
                    "execution_err": (
                        base64.urlsafe_b64decode(
                            execution_err + ((40 - (len(execution_err) % 4)) * "=")
                        ).decode()
                        if execution_err
                        else ""
                    ),
                    "compilation_output": (
                        base64.urlsafe_b64decode(
                            compilation_output
                            + ((40 - (len(compilation_output) % 4)) * "=")
                        ).decode()
                        if compilation_output
                        else ""
                    ),
                    "input": data["input"],
                    "expected_output": data["expected_output"],
                    "output": base64.urlsafe_b64decode(
                        output + ((4 - (len(output) % 4)) * "=")
                    ).decode(),
                },
            },
        )
        return

    stmt = (
        select(
            func.count(DSATestCaseResponse.task_id).label("passed_count"),
            DSAResponse.interview_id,
        )
        .join(DSAResponse, DSAResponse.id == DSATestCaseResponse.dsa_response_id)
        .group_by(DSAResponse.interview_id)
        .where(
            and_(
                DSATestCaseResponse.dsa_response_id == dsa_response_id,
                DSATestCaseResponse.status == "successful",
            )
        )
    )
    data = db.execute(stmt).all()[0]._mapping
    passed_count = data["passed_count"]
    stmt = (
        select(func.count(DSATestCase.id).label("total_count"))
        .join(DSAResponse, DSAResponse.dsa_question_id == DSATestCase.dsa_question_id)
        .where(DSAResponse.id == dsa_response_id)
    )
    total_count = db.execute(stmt).all()[0]._mapping["total_count"]

    if total_count == passed_count:
        stmt = update(DSAResponse).values(passed=True).where(DSAResponse.id == dsa_response_id)
        db.execute(stmt)
        db.commit()

        await interview_connection_manager.send_data(
            data["interview_id"],
            {
                "event": "execution_result",
                "status": "successful",
                "passed_count": passed_count,
            },
        )


@router.get("/dsa-response")
async def get_dsa_response(
    interview_id: str, question_id: str, db: Session = Depends(database.get_db)
):
    stmt = select(
        DSAResponse.id,
        DSAResponse.code,
        DSAResponse.passed,
        DSAResponse.interview_id,
        DSAResponse.question_id,
    ).where(
        and_(
            DSAResponse.interview_id == int(interview_id),
            DSAResponse.question_id == int(question_id),
        )
    )
    response = db.execute(stmt).mappings().one()
    stmt = (
        select(
            DSATestCaseResponse.status, DSATestCase.input, DSATestCase.expected_output
        )
        .join(DSATestCase, DSATestCase.id == DSATestCaseResponse.dsa_test_case_id)
        .where(DSATestCaseResponse.dsa_response_id == response["id"])
    )
    test_case_responses = db.execute(stmt).mappings().all()

    return {"response": response, "test_case_responses": test_case_responses}


# @router.put("")
# async def update_dsa_response(db: Session = Depends(database.get_db)):
#     return {}



@router.post("/generate-interview-questions")
async def generate_interview_questions(
    db: Session = Depends(database.get_db),
    interview_id=Depends(authorize_candidate),
):
    stmt = (
        select(InterviewQuestionAndResponse)
        .where(
            InterviewQuestionAndResponse.interview_id == interview_id
            and InterviewQuestionAndResponse.answer == None
        )
        .order_by(InterviewQuestionAndResponse.order_number)
    )

    questions_and_responses = db.execute(stmt).scalars().all()
    if len(questions_and_responses):
        return questions_and_responses

    stmt = select(Interview).where(Interview.id == interview_id)
    interview = db.execute(stmt).scalars().one()

    stmt = select(AiInterviewedJob).where(AiInterviewedJob.id == interview.ai_interviewed_job_id)
    job = db.execute(stmt).scalars().one()

    stmt = select(InterviewQuestion.question, InterviewQuestion.question_type).where(
        InterviewQuestion.ai_interviewed_job_id == interview.ai_interviewed_job_id
    )
    custom_questions = db.execute(stmt).mappings().all()

    example_questions = ""
    for question in custom_questions:
        example_questions += f"""
        Question: {question.question} (question type: {question.question_type})
"""

    if not interview.resume_text and not job.description:
        return [
            {
                "question": "Could you please tell me about your experience as a Senior Software Engineer?",
                "type": "general",
            }
        ]

    question_types = [
        "technical",
        "technical",
        "technical",
        "technical",
        "technical",
        "technical",
        "behavioral",
        "problem_solving"
    ]

    system_prompt = f"""You are an expert technical interviewer for the position of {job.title}.
Your task is to generate interview questions based on the job description, candidate's resume, and the custom questions provided.

The questions should be:
1. Clear and concise
2. Highly technical and focused on job-specific skills
3. Progressive in difficulty
4. Natural and conversational
5. Similar in style and focus to the custom questions provided
6. Ask more on the tech stack of the job
7. Less on experience and more on required skills- Ask tricky questions and descriptive questions on tech stack.

Question types: {', '.join(question_types)}
Maximum questions to generate: {len(question_types)}

Job Description:
{job.description}

Candidate's Resume:
{interview.resume_text}

Custom Questions to Enhance and Include:
{example_questions}

Instructions for Question Generation:
1. First, analyze the custom questions provided and understand their style, focus, and complexity
2. Generate enhanced versions of these custom questions, making them more specific to the candidate's experience
3. Then generate additional questions that follow the same style and focus as the custom questions
4. Ensure all questions maintain a natural conversation flow
5. For the first question, start with a brief greeting and then ask your first question. Format it as: "Hello! [Greeting message]. [Question]"
6. Focus on technical depth and problem-solving abilities
7. Include specific technical scenarios and challenges relevant to the role
8. Ask about implementation details and technical decision-making
9. Include questions about system design, architecture, and technical trade-offs
10. Ensure questions test both theoretical knowledge and practical experience

The questions should be based on the previous conversation and maintain a natural flow.

If no resume text or job description is provided, generate questions according to the given question types.

Return the questions as a JSON array of objects with "question" and "type" fields. Make sure to return array in correct JSON format. Do not return any other text or explanation."""

    response = await openai.client.chat.completions.create(
        model="gpt-4",
        messages=[
            {"role": "system", "content": system_prompt},
            {
                "role": "user",
                "content": "Generate the interview questions, making sure to include enhanced versions of the custom questions provided. And return a correct JSON array of objects with 'question' and 'type' fields. And also give only specified number and type of questions.",
            },
        ],
        temperature=0.7,
        max_tokens=1000,
    )

    questions = json.loads(response.choices[0].message.content)

    if not questions[0]["question"] or not questions[0]["type"]:
        raise HTTPException(status_code=500, detail="Error while generating questions")
    if not isinstance(questions, list):
        questions = [
            {"question": response.choices[0].message.content, "type": "general"}
        ]

    if not questions:
        raise HTTPException(status_code=500, detail="Failed to generate questions")

    interview_questions_and_responses = [
        InterviewQuestionAndResponse(
            question=question["question"],
            question_type=question["type"],
            order_number=index,
            interview_id=interview_id,
        )
        for index, question in enumerate(questions)
    ]

    db.add_all(interview_questions_and_responses)
    db.commit()

    stmt = select(InterviewQuestionAndResponse).where(
        InterviewQuestionAndResponse.interview_id == interview_id
    )
    interview_questions_and_responses = db.execute(stmt).scalars().all()
    return interview_questions_and_responses


# @router.get("")
# async def get_interview_question_and_response(
#     interview_id: str,
#     db: Session = Depends(database.get_db),
#     recruiter_id=Depends(authorize_company),
# ):
#     stmt = select(InterviewQuestionAndResponse).where(
#         InterviewQuestionAndResponse.interview_id == int(interview_id),
#     )
#     result = db.execute(stmt)
#     interview_question_and_response = result.scalars().all()
#     return interview_question_and_response


@router.put("/interview-question/submit-text-response")
async def text_update_answer(
    data: schemas.UpdateInterviewQuestionResponse,
    db: Session = Depends(database.get_db),
    interview_id=Depends(authorize_candidate),
):
    stmt = select(InterviewQuestionAndResponse).where(
        and_(
            InterviewQuestionAndResponse.interview_id == interview_id,
            InterviewQuestionAndResponse.order_number == data.question_order,
        )
    )
    question = db.execute(stmt).scalars().one()

    if question.answer is not None:
        raise CustomException(
            message="Question already answered", code=400
        )

    stmt = (
        update(InterviewQuestionAndResponse)
        .values(answer=data.answer)
        .where(
            and_(
                InterviewQuestionAndResponse.interview_id == interview_id,
                InterviewQuestionAndResponse.order_number == data.question_order,
                InterviewQuestionAndResponse.answer.is_(None),
            )
        )
        .returning(
            InterviewQuestionAndResponse.question,
            InterviewQuestionAndResponse.question_type,
            InterviewQuestionAndResponse.order_number,
            InterviewQuestionAndResponse.answer,
        )
    )
    result = db.execute(stmt)
    db.commit()
    question_and_response = result.mappings().one()

    return question_and_response



@router.post("")
async def create_interview(
    response: Response,
    interview_data: schemas.CreateInterview,
    db: Session = Depends(database.get_db),
):
    interview = Interview(
        firstname=interview_data.firstname,
        lastname=interview_data.lastname,
        email=interview_data.email,
        phone=interview_data.phone,
        work_experience_yrs=interview_data.work_experience,
        education=interview_data.education,
        skills=interview_data.skills,
        city=interview_data.location,
        linkedin_url=interview_data.linkedin_url,
        portfolio_url=interview_data.portfolio_url,
        resume_text=interview_data.resume_text,
        ai_interviewed_job_id=interview_data.ai_interviewed_job_id,
    )
    db.add(interview)
    db.commit()
    db.refresh(interview)

    encoded_jwt = jwt.encode(
        {
            "interview_id": interview.id,
            "exp": datetime.datetime.now(tz=datetime.timezone.utc)
            + datetime.timedelta(hours=3),
        }
    )

    response.headers["Authorization"] = f"Bearer {encoded_jwt}"
    return interview


@router.get("")
async def get_interview(
    db: Session = Depends(database.get_db),
    interview_id=Depends(authorize_candidate),
):
    stmt = (
        select(
            Interview.id,
            Interview.status,
            Interview.firstname,
            Interview.lastname,
            Interview.email,
            Interview.phone,
            Interview.work_experience_yrs,
            Interview.education,
            Interview.skills,
            Interview.city,
            Interview.linkedin_url,
            Interview.portfolio_url,
            Interview.resume_url,
            Interview.resume_text,
            Interview.resume_match_score,
            Interview.resume_match_feedback,
            Interview.overall_score,
            Interview.feedback,
            Interview.ai_interviewed_job_id,
            Interview.report_file_url,
            AiInterviewedJob.title,
            Company.name,
        )
        .join(AiInterviewedJob, Interview.ai_interviewed_job_id == AiInterviewedJob.id)
        .join(Company, AiInterviewedJob.company_id == Company.id)
        .where(Interview.id == interview_id)
    )
    result = db.execute(stmt)
    interview = result.mappings().one()
    return interview




@router.put("/upload-resume")
async def upload_resume(
    request: Request,
    file: UploadFile = File(...),
    db: Session = Depends(database.get_db),
    interview_id=Depends(authorize_candidate),
):
    if not file:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST, detail="No file provided"
        )

    # Upload file to GCS instead of local storage
    timestamp = datetime.datetime.now().strftime("%Y%m%d_%H%M%S")
    gcs_bucket = config.settings.GCS_BUCKET_NAME  # Ensure this is set in your config
    gcs_blob_name = f"resumes/{interview_id}_{timestamp}_{file.filename}"

    # Upload to GCS using the helper function, passing the file object
    file.file.seek(0)
    gcs_url = gcs_service.upload_file_to_gcs(
        gcs_bucket, gcs_blob_name, file.file, content_type=file.content_type
    )

    stmt = (
        update(Interview)
        .where(Interview.id == interview_id)
        .values(
            resume_url=gcs_url,
        )
        .returning(
            Interview.id,
            Interview.status,
            Interview.firstname,
            Interview.lastname,
            Interview.email,
            Interview.phone,
            Interview.work_experience_yrs,
            Interview.education,
            Interview.skills,
            Interview.city,
            Interview.linkedin_url,
            Interview.portfolio_url,
            Interview.resume_url,
            Interview.resume_text,
            Interview.resume_match_score,
            Interview.resume_match_feedback,
            Interview.overall_score,
            Interview.feedback,
            Interview.ai_interviewed_job_id,
        )
    )
    result = db.execute(stmt)
    db.commit()
    interview = result.scalars().all()[0]

    return interview


@router.put("")
async def update_interview(
    interview_data: schemas.UpdateInterview,
    db: Session = Depends(database.get_db),
    interview_id=Depends(authorize_candidate),
):
    interview_data = interview_data.model_dump(exclude_unset=True)
    print("=" * 20)
    print(interview_data)

    stmt = (
        update(Interview)
        .where(Interview.id == interview_id)
        .values(interview_data)
        .returning(
            Interview.id,
            Interview.status,
            Interview.firstname,
            Interview.lastname,
            Interview.email,
            Interview.phone,
            Interview.work_experience_yrs,
            Interview.education,
            Interview.skills,
            Interview.city,
            Interview.linkedin_url,
            Interview.portfolio_url,
            Interview.resume_url,
            Interview.resume_text,
            Interview.resume_match_score,
            Interview.resume_match_feedback,
            Interview.overall_score,
            Interview.feedback,
            Interview.ai_interviewed_job_id,
        )
    )
    result = db.execute(stmt)
    db.commit()
    interview = result.mappings().one()
    return interview


@router.post("/analyze-resume")
async def analyze_resume(
    db: Session = Depends(database.get_db),
    interview_id=Depends(authorize_candidate),
):
    stmt = (
        select(AiInterviewedJob.description, AiInterviewedJob.requirements, Interview.resume_text)
        .join(Interview)
        .where(Interview.id == interview_id)
    )
    data = db.execute(stmt).one()

    prompt = f"""Analyze how well this resume matches the job description and requirements.
Return ONLY a JSON object with these exact fields:
{{
    "resume_match_score": number between 0 and 100,
    "resume_match_feedback": "A detailed breakdown and justification for the score, as described below."
}}

Resume Text:
{data.resume_text}

Job Description:
{data.description}

Job Requirements:
{data.requirements}

Strict Scoring and Feedback Instructions:
- Be extremely strict: Only award points for clear, direct, and recent evidence of required skills, experience, and achievements relevant to the job.
- Penalize heavily for missing, irrelevant, outdated, or generic content, and for vague or unverifiable claims.
- If the resume is generic, fake, or not tailored to the job, the score should be very low (below 30).
- Do NOT give points for skills or experience not explicitly mentioned or clearly demonstrated in the resume.
- Do NOT give high scores for resumes that lack measurable achievements, relevant keywords, or recent experience.
- If the resume is empty, generic, or irrelevant, the score should be near 0.

Feedback Format (all in the resume_match_feedback string):
- Start with a breakdown in this format (sum must be 100):
  Breakdown: Skills: X/40, Experience: Y/30, Education: Z/10, Achievements: W/10, Other: V/10
- For each part, provide a justification sentence (e.g., "Skills: Only 2 of 8 required skills found; missing X, Y, Z.").
- End with a summary sentence justifying the total score (e.g., "Overall, the resume lacks most required skills and relevant experience, resulting in a low match score.").
- Example feedback string:
  Breakdown: Skills: 10/40, Experience: 5/30, Education: 5/10, Achievements: 0/10, Other: 2/10. Skills: Only 1 of 7 required skills found. Experience: No relevant experience listed. Education: Degree matches requirement. Achievements: No measurable achievements. Other: Resume is generic. Overall, the resume is a poor match for the job.
- Do NOT return arrays or objects in feedback; only a single string as above.

Important:
- Return ONLY the JSON object, no other text
- All fields must be present
- resume_match_score must be a number between 0 and 100, with accurate granularity (e.g. 63, 78, 42) — not rounded or bucketed
- All values must be strings or numbers as specified
- Be strict and critical in both scoring and feedback breakdown
"""

    response = await openai.client.chat.completions.create(
        model="gpt-3.5-turbo",
        messages=[
            {
                "role": "system",
                "content": "You are a helpful assistant that analyzes resume-job matches. You must return a valid JSON object.",
            },
            {"role": "user", "content": prompt},
        ],
        temperature=0.1,
        response_format={"type": "json_object"},
    )

    match_analysis = response.choices[0].message.content
    match_data = json.loads(match_analysis)

    stmt = (
        update(Interview)
        .values(
            resume_match_score=int(match_data["resume_match_score"]),
            resume_match_feedback=match_data["resume_match_feedback"],
        )
        .where(Interview.id == interview_id)
        .returning(
            Interview.id,
            Interview.status,
            Interview.firstname,
            Interview.lastname,
            Interview.email,
            Interview.phone,
            Interview.work_experience_yrs,
            Interview.education,
            Interview.skills,
            Interview.city,
            Interview.linkedin_url,
            Interview.portfolio_url,
            Interview.resume_url,
            Interview.resume_text,
            Interview.resume_match_score,
            Interview.resume_match_feedback,
            Interview.overall_score,
            Interview.feedback,
            Interview.ai_interviewed_job_id,
        )
    )

    result = db.execute(stmt)
    db.commit()
    interview = result.mappings().one()

    return interview


@router.put("/generate-feedback")
async def generate_feedback(
    request: Request,
    db: Session = Depends(database.get_db),
    interview_id=Depends(authorize_candidate),
):
    body = await request.json()
    transcript = body.get("transcript", "")
    job_requirements = body.get("job_requirements", "")

    stmt = (
        select(
            AiInterviewedJob.title,
            AiInterviewedJob.description,
            AiInterviewedJob.requirements,
            Interview.resume_text,
            Interview.firstname,
            Interview.lastname,
            Interview.created_at,
            Interview.email,
            Interview.phone,
            Interview.city,
            Interview.education,
            Interview.work_experience_yrs,
            Interview.skills,
            Interview.resume_match_score,
            Interview.resume_match_feedback,
        )
        .join(Interview)
        .where(Interview.id == interview_id)
    )
    data = db.execute(stmt).mappings().one()

    stmt = select(
        InterviewQuestionAndResponse.question,
        InterviewQuestionAndResponse.question_type,
        InterviewQuestionAndResponse.answer,
    ).where(InterviewQuestionAndResponse.interview_id == interview_id)
    questions_and_responses = db.execute(stmt).mappings().all()

    stmt = (
        select(
            InterviewQuestion.question,
            InterviewQuestion.question_type,
            InterviewQuestionResponse.answer,
        )
        .join(
            InterviewQuestion,
            InterviewQuestion.id == InterviewQuestionResponse.interview_question_id,
        )
        .where(InterviewQuestionResponse.interview_id == interview_id)
    )
    custom_question_responses = db.execute(stmt).mappings().all()

    conversation = transcript or ""
    if not conversation:
        for question_and_response in questions_and_responses:
            conversation += f"""
                Recruiter: {question_and_response.question} (question type: {question_and_response.question_type})

                Candidate: {question_and_response.answer}
            """

        for response in custom_question_responses:
            conversation += f"""
                Recruiter: {response.question} (question type: {response.question_type})

                Candidate: {response.answer}
            """

    prompt = f"""
        You are evaluating an interview transcript. The candidate is applying for a specific job. Carefully analyze their responses and assess their performance. Be strict and fair — do not assign points unless there's clear evidence.

Follow these rules:
- If the candidate gave minimal or irrelevant responses (e.g., just "yes", "no", or "hello"), reflect that harshly in all scores and feedback.
- Do NOT assign high scores unless the candidate has clearly demonstrated knowledge, relevance, and depth.
- Base scoring strictly on the content: no assumptions should be made if the candidate didn't mention or demonstrate a skill.
- Use the job description and requirements to frame your evaluation.
- If a category (e.g., technicalSkills) wasn't demonstrated at all, the score for that category must be near 0.
- Feedback for the recruiter must provide a fair but critical assessment of the candidate's readiness for the role, with supporting examples.
- Suggestions should help the candidate understand how to improve in future interviews.

Return ONLY a JSON object in the following format:
{{
    "feedback_for_candidate": "Detailed, specific feedback on their performance, mentioning what they did well or poorly",
    "feedback_for_recruiter": "Detailed evaluation of the candidate's responses. Explain whether the candidate is suitable, why or why not, and which areas were lacking or strong.",
    "score": number between 0 and 100,
    "scoreBreakdown": {{
        "technicalSkills": number between 0 and 100,
        "communication": number between 0 and 100,
        "problemSolving": number between 0 and 100,
        "culturalFit": number between 0 and 100
    }},
    "suggestions": [
        "Each item must be a concrete, actionable suggestion for the candidate",
        "Be specific: e.g., 'Provide examples when answering', 'Work on articulating thoughts clearly'"
    ],
    "keywords": [
        {{
            "term": "string",
            "count": number,
            "sentiment": "positive" | "neutral" | "negative"
        }}
    ]
}}

Conversation:
{conversation}

Job Description:
{data.description}

Job Requirements:
{job_requirements or data.requirements}

Important:
- Return ONLY the JSON object, no other text
- All fields must be present
- All scores must be accurate, evidence-based numbers between 0 and 100 — do not round up arbitrarily
- If the candidate gave weak or no answers, most scores should be low, even 0–20
- Suggestions must be actionable and tailored to what the candidate actually said or failed to say
- Keywords must be relevant, pulled from the conversation, and include a count and sentiment
        """

    response = await openai.client.chat.completions.create(
        model="gpt-3.5-turbo",
        messages=[
            {
                "role": "system",
                "content": "You are an expert interviewer and evaluator. Provide detailed, constructive feedback.",
            },
            {"role": "user", "content": prompt},
        ],
        temperature=0.1,
        response_format={"type": "json_object"},
    )

    interview_analysis = response.choices[0].message.content
    interview_data = json.loads(interview_analysis)

    os.makedirs(os.path.join("uploads", "report"), exist_ok=True)

    report_file_path = os.path.join(
        "uploads",
        "report",
        f"{interview_id}_{datetime.datetime.now().strftime('%Y%m%d_%H%M%S')}.pdf",
    )

    stmt = (
        select(
            DSAQuestion.id.label("question_id"),
            DSAQuestion.title,
            DSAQuestion.description,
            DSAQuestion.difficulty,
            DSAQuestion.time_minutes,
            DSAResponse.id,
            DSAResponse.code,
            DSAResponse.passed,
        )
        .join(DSAResponse, DSAResponse.dsa_question_id == DSAQuestion.id)
        .where(DSAResponse.interview_id == int(interview_id))
    )
    dsa_responses = db.execute(stmt).mappings().all()

    dsa_score = len([response for response in dsa_responses if response["passed"]])

    pdf = FPDF(unit="pt")
    pdf.add_page()
    # Replace non-latin-1 characters with closest ASCII equivalents or remove them

    def safe_text(text):
        if not isinstance(text, str):
            text = str(text)
        return (
            unicodedata.normalize("NFKD", text)
            .encode("latin-1", "ignore")
            .decode("latin-1")
        )

    pdf.set_font("Arial", size=18)
    full_width = pdf.w - pdf.l_margin - pdf.r_margin
    half_width = (pdf.w - pdf.l_margin - pdf.r_margin) * 0.5
    pdf.set_font("Arial", size=18)
    pdf.set_text_color(0, 0, 200)
    pdf.cell(
        full_width,
        21.6,
        safe_text("Candidate Interview Report"),
        border=0,
        ln=1,
        align="C",
    )
    pdf.ln(18)
    pdf.set_font("Arial", size=16)
    pdf.cell(
        full_width,
        19.2,
        safe_text(f"{data['firstname']} {data['lastname']}"),
        border=0,
        ln=1,
        align="C",
    )
    pdf.ln(16)
    pdf.set_text_color(0, 0, 0)
    pdf.set_font("Arial", size=14)
    pdf.cell(
        full_width,
        16.8,
        safe_text(f"Position: {data['title']}"),
        border=0,
        ln=1,
        align="C",
    )
    pdf.ln(14)
    pdf.cell(
        full_width,
        16.8,
        safe_text(f"Date: {data['created_at']}"),
        border=0,
        ln=1,
        align="C",
    )
    pdf.ln(14)
    pdf.set_font("Arial", size=16)
    pdf.set_text_color(0, 0, 200)
    pdf.cell(full_width, 19.2, safe_text("Candidate Information"), border=0, ln=1)
    pdf.ln(8)
    pdf.set_text_color(0, 0, 0)
    pdf.set_font("Arial", size=14)
    pdf.cell(half_width, 16.8, safe_text("Email"), border=1)
    pdf.cell(half_width, 16.8, safe_text(data["email"]), border=1, ln=1)
    pdf.cell(half_width, 16.8, safe_text("Phone"), border=1)
    pdf.cell(half_width, 16.8, safe_text(data["phone"]), border=1, ln=1)
    pdf.cell(half_width, 16.8, safe_text("City"), border=1)
    pdf.cell(half_width, 16.8, safe_text(data["city"]), border=1, ln=1)
    pdf.cell(half_width, 16.8, safe_text("Education"), border=1)
    pdf.multi_cell(half_width, 16.8, safe_text(data["education"]), border=1)
    pdf.cell(half_width, 16.8, safe_text("Experience"), border=1)
    pdf.cell(
        half_width, 16.8, safe_text(f"{data['work_experience_yrs']} years"), border=1, ln=1
    )
    pdf.cell(half_width, 16.8, safe_text("Skills"), border=1)
    pdf.multi_cell(half_width, 16.8, safe_text(data["skills"]), border=1)
    pdf.ln(14)
    # pdf.set_font("Arial", size=16)
    # pdf.set_text_color(0, 0, 200)
    # pdf.cell(full_width, 19.2, "MCQ Test Results", border=0, ln=1)
    # pdf.ln(8)
    # pdf.set_text_color(0, 0, 0)
    # pdf.set_font("Arial", size=14)
    # pdf.cell(half_width, 16.8, "Total Score", border=1)
    # pdf.cell(half_width, 16.8, "13", border=1, ln=1)
    # pdf.cell(half_width, 16.8, "Technical Questions", border=1)
    # pdf.cell(half_width, 16.8, "13", border=1, ln=1)
    # pdf.cell(half_width, 16.8, "Aptitude Questions", border=1)
    # pdf.cell(half_width, 16.8, "13", border=1, ln=1)
    # pdf.ln(14)
    pdf.set_font("Arial", size=16)
    pdf.set_text_color(0, 0, 200)
    pdf.cell(full_width, 19.2, safe_text("Assessment Results"), border=0, ln=1)
    pdf.ln(8)
    pdf.set_text_color(0, 0, 0)
    pdf.set_font("Arial", size=14)
    pdf.cell(half_width, 16.8, safe_text("Overall Score"), border=1)
    pdf.cell(
        half_width, 16.8, safe_text(str(interview_data["score"]) + "%"), border=1, ln=1
    )
    pdf.cell(half_width, 16.8, safe_text("Resume match Score"), border=1)
    pdf.cell(
        half_width,
        16.8,
        safe_text(str(data["resume_match_score"]) + "%"),
        border=1,
        ln=1,
    )
    pdf.cell(half_width, 16.8, safe_text("Technical Score"), border=1)
    pdf.cell(
        half_width,
        16.8,
        safe_text(str(interview_data["scoreBreakdown"]["technicalSkills"]) + "%"),
        border=1,
        ln=1,
    )
    pdf.cell(half_width, 16.8, safe_text("Communication Score"), border=1)
    pdf.cell(
        half_width,
        16.8,
        safe_text(str(interview_data["scoreBreakdown"]["communication"]) + "%"),
        border=1,
        ln=1,
    )
    pdf.cell(half_width, 16.8, safe_text("Problem solving Score"), border=1)
    pdf.cell(
        half_width,
        16.8,
        safe_text(str(interview_data["scoreBreakdown"]["problemSolving"]) + "%"),
        border=1,
        ln=1,
    )
    pdf.cell(half_width, 16.8, safe_text("Cultural Fit Score"), border=1)
    pdf.cell(
        half_width,
        16.8,
        safe_text(str(interview_data["scoreBreakdown"]["culturalFit"]) + "%"),
        border=1,
        ln=1,
    )
    pdf.ln(14)
    # pdf.set_font("Arial", size=16)
    # pdf.set_text_color(0, 0, 200)
    # pdf.cell(full_width, 19.2, "MCQ Test Results", border=0, ln=1)
    # pdf.ln(8)
    # pdf.set_text_color(0, 0, 0)
    # pdf.set_font("Arial", size=14)
    # pdf.cell(half_width, 16.8, "Total Score", border=1)
    # pdf.cell(half_width, 16.8, "13", border=1, ln=1)
    # pdf.cell(half_width, 16.8, "Technical Questions", border=1)
    # pdf.cell(half_width, 16.8, "13", border=1, ln=1)
    # pdf.cell(half_width, 16.8, "Aptitude Questions", border=1)
    # pdf.cell(half_width, 16.8, "13", border=1, ln=1)
    # pdf.ln(14)
    pdf.set_font("Arial", size=16)
    pdf.set_text_color(0, 0, 200)
    pdf.cell(full_width, 19.2, safe_text("Feedback"), border=0, ln=1)
    pdf.ln(8)
    pdf.set_text_color(0, 0, 0)
    pdf.set_font("Arial", size=14)
    pdf.multi_cell(
        full_width, 16.8, safe_text(interview_data["feedback_for_candidate"]), border=0
    )
    pdf.ln(14)
    pdf.set_font("Arial", size=16)
    pdf.set_text_color(0, 0, 200)
    pdf.cell(full_width, 19.2, safe_text("Resume match Feedback"), border=0, ln=1)
    pdf.ln(8)
    pdf.set_text_color(0, 0, 0)
    pdf.set_font("Arial", size=14)
    pdf.multi_cell(
        full_width, 16.8, safe_text(str(data["resume_match_feedback"])), border=0
    )

    # Save PDF to a BytesIO buffer (correct way)
    pdf_bytes = pdf.output(dest="S").encode("latin-1")
    pdf_buffer = io.BytesIO(pdf_bytes)
    pdf_buffer.seek(0)

    # Upload PDF buffer to GCS
    gcs_bucket = config.settings.GCS_BUCKET_NAME  # Ensure this is set in your config
    gcs_blob_name = f"reports/{interview_id}_{datetime.datetime.now().strftime('%Y%m%d_%H%M%S')}.pdf"
    gcs_url = gcs.upload_file_to_gcs(
        gcs_bucket, gcs_blob_name, pdf_buffer, content_type="application/pdf"
    )

    stmt = (
        update(Interview)
        .where(Interview.id == interview_id)
        .values(
            status="completed",
            overall_score=int(interview_data["score"]),
            feedback=interview_data["feedback_for_recruiter"],
            technical_skills_score=interview_data["scoreBreakdown"]["technicalSkills"],
            communication_skills_score=interview_data["scoreBreakdown"][
                "communication"
            ],
            problem_solving_skills_score=interview_data["scoreBreakdown"][
                "problemSolving"
            ],
            cultural_fit_score=interview_data["scoreBreakdown"]["culturalFit"],
            report_file_url=gcs_url,
        )
        .returning(
            Interview.id,
            Interview.status,
            Interview.firstname,
            Interview.lastname,
            Interview.email,
            Interview.phone,
            Interview.work_experience_yrs,
            Interview.education,
            Interview.skills,
            Interview.city,
            Interview.linkedin_url,
            Interview.portfolio_url,
            Interview.resume_url,
            Interview.resume_text,
            Interview.resume_match_score,
            Interview.resume_match_feedback,
            Interview.overall_score,
            Interview.feedback,
            Interview.ai_interviewed_job_id,
            Interview.report_file_url,
        )
    )

    db.execute(stmt)
    db.commit()

    return {
        "feedback": interview_data["feedback_for_candidate"],
        "score": interview_data["score"],
        "scoreBreakdown": interview_data["scoreBreakdown"],
        "suggestions": interview_data["suggestions"],
        "keywords": interview_data["keywords"],
    }


@router.post("/record")
async def record_interview(
    request: Request,
    background_tasks: BackgroundTasks,
    finished: str = "false",
    interview_id=Depends(authorize_candidate),
):
    if finished == "true":
        ffmpeg_command = [
            "ffmpeg",
            "-i",
            os.path.join("uploads", "interview_video", str(interview_id), "video.webm"),
            "-r",
            "30",
            "-hls_time",
            "10",
            "-hls_list_size",
            "0",
            "-f",
            "hls",
            os.path.join("uploads", "interview_video", str(interview_id), "video.m3u8"),
        ]
        background_tasks.add_task(subprocess.Popen(ffmpeg_command))
        return
    data = await request.body()
    os.makedirs(
        os.path.join("uploads", "interview_video", str(interview_id)), exist_ok=True
    )
    file_path = os.path.join(
        "uploads", "interview_video", str(interview_id), "video.webm"
    )

    with open(file_path, "ab") as buffer:
        buffer.write(data)
    return


@router.post("/screenshot")
async def save_screenshot(request: Request, interview_id=Depends(authorize_candidate)):
    try:
        data = await request.body()
        if not data:
            raise CustomException(
                message="No screenshot data provided", code=400
            )

        # Generate filename with timestamp
        timestamp = int(time.time())
        gcs_bucket = (
            config.settings.GCS_BUCKET_NAME
        )  # Ensure this is set in your config
        gcs_blob_name = f"screenshots/{interview_id}/{timestamp}.png"

        # Save the screenshot to GCS

        screenshot_buffer = io.BytesIO(data)
        screenshot_buffer.seek(0)
        gcs_url = gcs.upload_file_to_gcs(
            gcs_bucket, gcs_blob_name, screenshot_buffer, content_type="image/png"
        )

        return {
            "message": "Screenshot saved successfully",
            "timestamp": timestamp,
            "url": gcs_url,
        }
    except Exception as e:
        raise CustomException(
            message=f"Failed to save screenshot: {str(e)}", code=500
        )



@router.post("/interview-question-response")
async def create_interview_question_response(
    response_data: schemas.CreateInterviewQuestionResponse,
    interview_id: int = Depends(authorize_candidate),
    db: Session = Depends(database.get_db),
):
    return services.interview_question_response.create_interview_question_response(
        response_data, interview_id, db
    )



@router.get("/private/{token}")
async def get_interview_by_private_link(
    token: str,
    email: str = Query(None, description="Candidate's email for verification"),
    db: Session = Depends(database.get_db)
):
    logging.warning(f"/private/{{token}} called with token={token} and email={email}")
    stmt = select(Interview).where(Interview.private_link_token == token)
    result = db.execute(stmt)
    interview = result.scalar_one_or_none()
    logging.warning(f"DB result for token: {interview}")
    if not interview:
        logging.error(f"Token not found: {token}")
        raise HTTPException(status_code=404, detail="Invalid or expired private link")
    # Check if the associated job is closed
    job = db.execute(select(AiInterviewedJob).where(AiInterviewedJob.id == interview.ai_interviewed_job_id)).scalar_one_or_none()
    if job and getattr(job, "is_closed", False):
        raise HTTPException(status_code=403, detail="Job is closed")
    if email is None or email.strip() == "":
        logging.info(f"Token valid, email not provided. Interview ID: {interview.id}")
        return {
            "token_valid": True,
            "interview_id": interview.id,
            "first_name": interview.firstname,
            "last_name": interview.lastname,
            "job_id": interview.ai_interviewed_job_id
        }
    if interview.email != email:
        logging.error(f"Email mismatch: interview.email={interview.email}, provided={email}")
        raise HTTPException(status_code=404, detail="Email mismatch for this private link")
    logging.info(f"Token and email match for interview ID: {interview.id}")
    encoded_jwt = jwt.encode(
        {
            "interview_id": interview.id,
            "exp": datetime.datetime.now(tz=datetime.timezone.utc)
            + datetime.timedelta(hours=3),
        }
    )
    return {
        "id": interview.id,
        "first_name": interview.firstname,
        "last_name": interview.lastname,
        "email": interview.email,
        "status": interview.status,
        "job_id": interview.ai_interviewed_job_id,
        "token": encoded_jwt,
    }





@router.get("/ai-interviewed-job")
async def get_ai_interviewed_job(id: str, db: Session = Depends(database.get_db)):
    hasDSATest = False
    hasQuiz = False

    stmt = select(DSAQuestion.id).where(DSAQuestion.ai_interviewed_job_id == int(id))
    result = db.execute(stmt).all()
    if len(result):
        hasDSATest = True

    stmt = select(QuizQuestion.id).where(QuizQuestion.ai_interviewed_job_id == int(id))
    result = db.execute(stmt).all()
    if len(result):
        hasQuiz = True

    stmt = (
        select(
            AiInterviewedJob.id,
            AiInterviewedJob.title,
            AiInterviewedJob.description,
            AiInterviewedJob.department,
            AiInterviewedJob.city,
            AiInterviewedJob.location,
            AiInterviewedJob.type,
            AiInterviewedJob.duration_months,
            AiInterviewedJob.min_experience,
            AiInterviewedJob.max_experience,
            case(
                (AiInterviewedJob.show_salary == True, AiInterviewedJob.currency),
                else_=None,
            ).label("currency"),
            case(
                (AiInterviewedJob.show_salary == True, AiInterviewedJob.salary_min),
                else_=None,
            ).label("salary_min"),
            case(
                (AiInterviewedJob.show_salary == True, AiInterviewedJob.salary_max),
                else_=None,
            ).label("salary_max"),
            AiInterviewedJob.key_qualification,
            AiInterviewedJob.requirements,
            AiInterviewedJob.benefits,
            AiInterviewedJob.quiz_time_minutes,
            AiInterviewedJob.created_at,
            AiInterviewedJob.company_id,
            Company.name,
            Company.logo_url,
        )
        .join(Company, Company.id == AiInterviewedJob.company_id)
        .where(AiInterviewedJob.id == int(id))
    )
    result = db.execute(stmt)
    job = dict(result.all()[0]._mapping)
    job["hasDSATest"] = hasDSATest
    job["hasQuiz"] = hasQuiz
    return job

@router.post("/quiz-response")
async def create_quiz_response(
    quiz_responses: list[schemas.CreateQuizResponse],
    interview_id=Depends(authorize_candidate),
    db: Session = Depends(database.get_db),
):
    quiz_responses = [
        QuizResponse(
            interview_id=interview_id,
            quiz_question_id=response.quiz_question_id,
            quiz_option_id=response.quiz_option_id,
        )
        for response in quiz_responses
    ]
    db.add_all(quiz_responses)
    db.commit()
    for quiz_response in quiz_responses:
        db.refresh(quiz_response)

    return quiz_responses


@router.get("/quiz-question")
async def get_quiz_questions(
    response: Response,
    interview_id = Depends(authorize_candidate),
    db: Session = Depends(database.get_db),
):
    if interview_id:
        stmt = (
            select(
                QuizQuestion.id,
                QuizQuestion.description,
                QuizQuestion.type,
                QuizQuestion.category,
                QuizQuestion.time_seconds,
                QuizQuestion.image_url,
            )
            .join(AiInterviewedJob, QuizQuestion.ai_interviewed_job_id == AiInterviewedJob.id)
            .join(Interview, Interview.ai_interviewed_job_id == AiInterviewedJob.id)
            .where(Interview.id == int(interview_id))
        )
    else:
        response.status_code = 400
        return {"msg": "interview id is required"}

    quiz_questions = [
        dict(quiz_question._mapping) for quiz_question in db.execute(stmt).all()
    ]

    for quiz_question in quiz_questions:
        stmt = select(QuizOption.id, QuizOption.label, QuizOption.correct).where(
            QuizOption.quiz_question_id == quiz_question["id"]
        )
        options = [option._mapping for option in db.execute(stmt).all()]
        quiz_question["options"] = options

    return quiz_questions
