import datetime
import random
from typing import Literal, Optional
from fastapi import (
    APIRouter,
    Depends,
    Request,
    HTTPException,
    status,
    Form,
    File,
    UploadFile,
    Response,
    Query
)
from sqlalchemy import (
    Float,
    asc,
    delete,
    desc,
    func,
    insert,
    select,
    update,
    case,
    and_,
)
from sqlalchemy.orm import Session, joinedload
from app.configs import openai
import os
from os import path
import uuid

from app import database, config
from app.company import services
from app.company import schemas
from app.dependencies.authorization import authorize_company
from app.lib import jwt, security
from app.lib.errors import CustomException
from app.company import services
from app.models import (
    AiInterviewedJob,
    DSAQuestion,
    DSATestCase,
    DSAResponse,
    Interview,
    QuizQuestion,
    Company,
    QuizOption,
    QuizResponse,
    InterviewQuestionAndResponse,
    Job,
    JobApplication,
    JobSeeker,
)
from app.services import brevo
from app.services import gcs as gcs_service
from app.company.schemas import CandidateInviteRequest
from app.lib.security import hash_password
from app.job_seeker.schemas import JobSeekerOut


router = APIRouter()


@router.post("/dsa-question")
async def create_dsa_question(
    dsa_question_data: schemas.CreateDSAQuestion,
    db: Session = Depends(database.get_db),
    recruiter_id=Depends(authorize_company),
):
    stmt = (
        insert(DSAQuestion)
        .values(
            title=dsa_question_data.title,
            description=dsa_question_data.description,
            difficulty=dsa_question_data.difficulty,
            time_minutes=dsa_question_data.time_minutes,
            ai_interviewed_job_id=dsa_question_data.ai_interviewed_job_id,
        )
        .returning(
            DSAQuestion.id,
            DSAQuestion.title,
            DSAQuestion.description,
            DSAQuestion.difficulty,
            DSAQuestion.time_minutes,
            DSAQuestion.ai_interviewed_job_id,
        )
    )
    result = db.execute(stmt)
    db.commit()
    dsa_question = result.mappings().one()

    data = dict(dsa_question)
    data["test_cases"] = []

    for test_case in dsa_question_data.test_cases:
        stmt = (
            insert(DSATestCase)
            .values(
                input=test_case.input,
                expected_output=test_case.expected_output,
                dsa_question_id=dsa_question["id"],
            )
            .returning(
                DSATestCase.id,
                DSATestCase.input,
                DSATestCase.expected_output,
                DSATestCase.dsa_question_id,
            )
        )
        result = db.execute(stmt)
        db.commit()
        dsa_test_case = result.mappings().one()
        data["test_cases"].append(dict(dsa_test_case))
    return data


@router.get("/dsa-question")
async def get_dsa_question(ai_interviewed_job_id: str, db: Session = Depends(database.get_db)):
    stmt = (
        select(
            DSAQuestion.id,
            DSAQuestion.title,
            DSAQuestion.description,
            DSAQuestion.difficulty,
            DSAQuestion.time_minutes,
        )
        .where(DSAQuestion.ai_interviewed_job_id == int(ai_interviewed_job_id))
        .order_by(DSAQuestion.id)
    )
    result = db.execute(stmt)
    dsa_questions = [dict(q) for q in result.mappings().all()]

    for question in dsa_questions:
        stmt = select(
            DSATestCase.id,
            DSATestCase.expected_output,
            DSATestCase.input,
            DSATestCase.dsa_question_id,
        ).where(DSATestCase.dsa_question_id == question["id"])
        result = db.execute(stmt)
        test_cases = [dict(t) for t in result.mappings().all()]
        question["test_cases"] = test_cases

    return dsa_questions


@router.put("/dsa-question")
async def update_dsa_question(
    dsa_question_data: schemas.UpdateDSAQuestion,
    db: Session = Depends(database.get_db),
    recruiter_id=Depends(authorize_company),
):
    dsa_question_data = dsa_question_data.model_dump(exclude_unset=True)
    dsa_question_id = dsa_question_data.pop("id", None)
    stmt = (
        update(DSAQuestion)
        .values(dsa_question_data)
        .where(DSAQuestion.id == dsa_question_id)
        .returning(
            DSAQuestion.id,
            DSAQuestion.title,
            DSAQuestion.description,
            DSAQuestion.difficulty,
            DSAQuestion.time_minutes,
        )
    )
    result = db.execute(stmt)
    dsa_question = result.mappings().one()
    db.commit()
    return dsa_question


@router.delete("/dsa-question")
async def delete_dsa_question(
    id: str,
    db: Session = Depends(database.get_db),
    recruiter_id=Depends(authorize_company),
):
    stmt = delete(DSAQuestion).where(DSAQuestion.id == int(id))
    db.execute(stmt)
    db.commit()
    return {"message": "succesfully deleted dsa question"}


@router.post("/dsa-test-case")
async def create_test_case(
    test_case_data: schemas.CreateDSATestCase,
    db: Session = Depends(database.get_db),
    recruiter_id=Depends(authorize_company),
):
    dsa_test_case = DSATestCase(
        input=test_case_data.input,
        expected_output=test_case_data.expected_output,
        dsa_question_id=test_case_data.dsa_question_id,
    )
    db.add(dsa_test_case)
    db.commit()
    db.refresh(dsa_test_case)
    return dsa_test_case


@router.get("/dsa-test-case")
async def get_test_case(question_id: str, db: Session = Depends(database.get_db)):
    stmt = select(DSATestCase.id, DSATestCase.input, DSATestCase.expected_output).where(
        DSATestCase.dsa_question_id == int(question_id)
    )
    test_cases = db.execute(stmt).all()
    return [test_case._mapping for test_case in test_cases]


@router.put("")
async def update_test_case(
    test_case_data: schemas.UpdateDSATestCase,
    db: Session = Depends(database.get_db),
    recruiter_id=Depends(authorize_company),
):
    stmt = (
        update(DSATestCase)
        .values(
            input=test_case_data.input, expected_output=test_case_data.expected_output
        )
        .where(DSATestCase.id == test_case_data.id)
        .returning(
            DSATestCase.id,
            DSATestCase.input,
            DSATestCase.expected_output,
            DSATestCase.dsa_question_id,
        )
    )
    result = db.execute(stmt)
    db.commit()
    test_case = result.all()[0]._mapping
    return test_case


@router.delete("/dsa-test-case")
async def delete_test_case(id: str, db: Session = Depends(database.get_db)):
    stmt = delete(DSATestCase).where(DSATestCase.id == id)
    db.execute(stmt)
    db.commit()
    return {"message": "successfully deleted test case"}


@router.post("/ai-interviewed-job")
async def create_job(
    job_data: schemas.CreateAiInterview,
    db: Session = Depends(database.get_db),
    recruiter_id=Depends(authorize_company),
):
    if job_data.salary_min is not None and job_data.salary_max is not None:
        if job_data.salary_min < 0 or job_data.salary_max > 2000000000:
            raise CustomException(code=400, messag="invalid salary range")

    job = AiInterviewedJob(
        title=job_data.title,
        description=job_data.description,
        department=job_data.department,
        city=job_data.city,
        location=job_data.location,
        type=job_data.type,
        duration_months=job_data.duration_months,
        min_experience=job_data.min_experience,
        max_experience=job_data.max_experience,
        currency=job_data.currency,
        salary_min=job_data.salary_min,
        salary_max=job_data.salary_max,
        show_salary=job_data.show_salary,
        key_qualification=job_data.key_qualification,
        requirements=job_data.requirements,
        benefits=job_data.benefits,
        status=job_data.status,
        company_id=recruiter_id,
    )
    db.add(job)
    db.commit()
    db.refresh(job)
    return job


@router.get("/ai-interviewed-job")
async def get_job(
    id: str,
    db: Session = Depends(database.get_db),
    recruiter_id=Depends(authorize_company),
):
    stmt = select(
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
        AiInterviewedJob.currency,
        AiInterviewedJob.salary_min,
        AiInterviewedJob.salary_max,
        AiInterviewedJob.show_salary,
        AiInterviewedJob.key_qualification,
        AiInterviewedJob.requirements,
        AiInterviewedJob.benefits,
        AiInterviewedJob.status,
        AiInterviewedJob.quiz_time_minutes,
        AiInterviewedJob.company_id,
        AiInterviewedJob.created_at,
        AiInterviewedJob.updated_at,
    ).where(AiInterviewedJob.id == int(id))
    result = db.execute(stmt)
    job = result.mappings().one()

    return job


@router.get("/ai-interviewed-job/all")
async def get_all_job(
    start: str = "0",
    limit: str = "10",
    sort_field: Literal[
        "title", "department", "location", "type", "show_salary", "status"
    ] = None,
    sort: str = "ascending",
    search: str = None,
    status: str = None,
    db: Session = Depends(database.get_db),
    recruiter_id=Depends(authorize_company),
):
    try:
        start_int = int(start)
        if start_int < 0:
            start_int = 0
        limit_int = int(limit)
        if limit_int < 1:
            limit_int = 10
    except ValueError:
        start_int = 0
        limit_int = 10

    order_column = AiInterviewedJob.id

    if sort_field == "title":
        order_column = AiInterviewedJob.title
    elif sort_field == "department":
        order_column = AiInterviewedJob.department
    elif sort_field == "location":
        order_column = AiInterviewedJob.location
    elif sort_field == "type":
        order_column = AiInterviewedJob.type
    elif sort_field == "show_salary":
        order_column = AiInterviewedJob.show_salary
    elif sort_field == "status":
        order_column = AiInterviewedJob.status

    # Build base filter
    filters = [AiInterviewedJob.company_id == recruiter_id]
    if search:
        filters.append(AiInterviewedJob.title.ilike(f"%{search}%"))
    if status and status.lower() != "all":
        filters.append(AiInterviewedJob.status == status)

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
            AiInterviewedJob.currency,
            AiInterviewedJob.salary_min,
            AiInterviewedJob.salary_max,
            AiInterviewedJob.show_salary,
            AiInterviewedJob.key_qualification,
            AiInterviewedJob.requirements,
            AiInterviewedJob.benefits,
            AiInterviewedJob.status,
            AiInterviewedJob.quiz_time_minutes,
            AiInterviewedJob.company_id,
            AiInterviewedJob.created_at,
            AiInterviewedJob.updated_at,
        )
        .where(*filters)
        .order_by(desc(order_column) if sort == "descending" else asc(order_column))
        .limit(limit_int)
        .offset(start_int)
    )

    count_stmt = (
        select(func.count())
        .select_from(AiInterviewedJob)
        .where(*filters)
    )
    total_count = db.execute(count_stmt).scalar()

    result = db.execute(stmt)
    jobs = result.mappings().all()

    return {"count": total_count, "jobs": jobs}



@router.post("/generate-ai-interviewed-job-description")
async def generate_description(
    generate_jd_data: schemas.GenerateAiInterviewDescription,
):
    prompt = f"""
    Create a detailed job description for a {generate_jd_data.title} position in the {generate_jd_data.department} department.
    The position is {generate_jd_data.location}-based.
    The qualification requirement is {generate_jd_data.key_qualification} and Experience requirement is {generate_jd_data.min_experience}-{generate_jd_data.max_experience}yrs
    
    Focus ONLY on describing the role, responsibilities, and day-to-day activities.
    Do NOT include requirements, qualifications, or benefits.
    
    Return the content in plain text format only. Do not use any markdown, headers, or special formatting.
    Use simple paragraphs and bullet points with dashes (-) if needed.
    """

    print(f"Making OpenAI API call with model: gpt-3.5-turbo")
    response = await openai.client.chat.completions.create(
        model="gpt-3.5-turbo",
        messages=[
            {
                "role": "system",
                "content": "You are a professional HR assistant specializing in creating compelling job descriptions. Focus only on describing the role and responsibilities. Return plain text only, no markdown or special formatting.",
            },
            {"role": "user", "content": prompt},
        ],
        temperature=0.3,
        max_tokens=500,
    )
    description = response.choices[0].message.content

    return {"description": description}


@router.post("/generate-ai-interviewed-job-requirements")
async def generate_requirements(
    generate_jr_data: schemas.GenerateAiInterviewRequirement,
):
    """Generate job requirements using OpenAI"""
    prompt = f"""
    Create a focused list of requirements for a {generate_jr_data.title} position in the {generate_jr_data.department} department.
    The position is {generate_jr_data.location}-based.
    The qualification requirement is {generate_jr_data.key_qualification} and Experience requirement is {generate_jr_data.min_experience}-{generate_jr_data.max_experience}yrs
    
    {f"Additional keywords to consider: {generate_jr_data.keywords}" if generate_jr_data.keywords else ""}
    
    Include:
    1. Required qualifications and education
    2. Required experience and skills
    3. Technical requirements
    4. Soft skills and personal attributes
    
    Return the content in plain text format only. Do not use any markdown, headers, or special formatting.
    Use simple bullet points with dashes (-) for each requirement.  Keep the requirements specific and measurable.
    """

    response = await openai.client.chat.completions.create(
        model="gpt-3.5-turbo",
        messages=[
            {
                "role": "system",
                "content": "You are a professional HR assistant specializing in creating detailed job requirements. Focus on specific, measurable requirements. Return plain text only, no markdown or special formatting.",
            },
            {"role": "user", "content": prompt},
        ],
        temperature=0.2,
        max_tokens=300,
    )
    requirements = response.choices[0].message.content
    return {"requirements": requirements}


@router.put("/ai-interviewed-job")
async def update_job(
    job_data: schemas.UpdateAiInterview,
    db: Session = Depends(database.get_db),
    recruiter_id=Depends(authorize_company),
):
    job_data = job_data.model_dump(exclude_unset=True)
    job_id = job_data.pop("id", None)
    stmt = (
        update(AiInterviewedJob)
        .values(job_data)
        .where(
            and_(
                AiInterviewedJob.company_id == recruiter_id,
                AiInterviewedJob.id == job_id,
            )
        )
        .returning(
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
            AiInterviewedJob.currency,
            AiInterviewedJob.salary_min,
            AiInterviewedJob.salary_max,
            AiInterviewedJob.show_salary,
            AiInterviewedJob.key_qualification,
            AiInterviewedJob.requirements,
            AiInterviewedJob.benefits,
            AiInterviewedJob.status,
            AiInterviewedJob.quiz_time_minutes,
            AiInterviewedJob.company_id,
        )
    )
    result = db.execute(stmt)
    db.commit()
    job = result.all()[0]._mapping
    return job


@router.delete("/ai-interviewed-job")
async def delete_ai_interviewed_job(
    id: str,
    db: Session = Depends(database.get_db),
    company_id=Depends(authorize_company),
):
    stmt = select(AiInterviewedJob).where(
        and_(
            AiInterviewedJob.id == int(id), AiInterviewedJob.company_id == company_id
        )
    )
    result = db.execute(stmt)
    job = result.scalar_one_or_none()

    if not job:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="AiInterview not found or you don't have permission to delete it",
        )

    # Delete the job
    stmt = delete(AiInterviewedJob).where(
        and_(
            AiInterviewedJob.id == int(id), AiInterviewedJob.company_id == company_id
        )
    )
    db.execute(stmt)
    db.commit()
    return


@router.post("/quiz-question")
async def create_quiz_question(
    description: str = Form(...),
    type: str = Form(...),
    category: str = Form(...),
    ai_interviewed_job_id: int = Form(...),
    time_seconds: Optional[int] = Form(None),
    image: UploadFile = File(None),
    db: Session = Depends(database.get_db),
    recruiter_id=Depends(authorize_company),
):
    quiz_question = QuizQuestion(
        description=description,
        type=type,
        category=category,
        ai_interviewed_job_id=ai_interviewed_job_id,
        time_seconds=time_seconds,
    )
    db.add(quiz_question)
    db.commit()
    db.refresh(quiz_question)

    if image and image.filename:
        if not path.exists(path.join("uploads", "image")):
            os.makedirs(path.join("uploads", "image"))

        with open(
            path.join("uploads", "image", f"quiz_{quiz_question.id}.png"), "wb"
        ) as f:
            for chunk in image.file:
                f.write(chunk)

        quiz_question.image_url = (
            f"{config.settings.URL}/uploads/image/quiz_{quiz_question.id}.png"
        )
        db.commit()
        db.refresh(quiz_question)

    return quiz_question


@router.get("/quiz-question")
async def get_quiz_questions(
    response: Response,
    ai_interviewed_job_id: str = None,
    company_id = Depends(authorize_company),
    db: Session = Depends(database.get_db),
):
    if ai_interviewed_job_id:
        stmt = select(
            QuizQuestion.id,
            QuizQuestion.description,
            QuizQuestion.type,
            QuizQuestion.category,
            QuizQuestion.image_url,
            QuizQuestion.time_seconds,
        ).where(QuizQuestion.ai_interviewed_job_id == int(ai_interviewed_job_id))
    else:
        response.status_code = 400
        return {"msg": "job id is required"}

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


@router.put("")
async def update_quiz_question(
    description: str = Form(),
    type: str = Form(),
    category: str = Form(),
    time_seconds: int = Form(),
    id: int = Form(),
    db: Session = Depends(database.get_db),
    recruiter_id=Depends(authorize_company),
):
    quiz_data = {}
    if description:
        quiz_data["description"] = description
    if type:
        quiz_data["type"] = type
    if category:
        quiz_data["category"] = category
    if time_seconds:
        quiz_data["time_seconds"] = time_seconds

    stmt = (
        update(QuizQuestion)
        .values(quiz_data)
        .where(QuizQuestion.id == id)
        .returning(
            QuizQuestion.description,
            QuizQuestion.type,
            QuizQuestion.category,
            QuizQuestion.image_url,
        )
    )
    result = db.execute(stmt)
    db.commit()
    quiz_question = result.mappings().one()
    return quiz_question


@router.delete("/quiz-question")
async def delete_quiz_question(
    question_id: str,
    db: Session = Depends(database.get_db),
    recruiter_id=Depends(authorize_company),
):
    stmt = delete(QuizQuestion).where(QuizQuestion.id == int(question_id))
    db.execute(stmt)
    db.commit()
    return



from fastapi import Form

@router.post("")
async def register_recruiter(
    name: str = Form(...),
    email: str = Form(...),
    password: str = Form(...),
    phone: str = Form(...),
    industry: str = Form(...),
    country: str = Form(...),
    state: str = Form(...),
    city: str = Form(...),
    zip: str = Form(...),
    address: str = Form(...),
    document: UploadFile = File(None),
    document_type: str = Form(None),
    db: Session = Depends(database.get_db),
):
    password_hash = security.hash_password(password)

    document_file_url = None
    bucket_name = config.settings.GCS_BUCKET_NAME
    if document and document.filename:
        destination_blob_name = f"company_docs/{email}_{document.filename}"
        document_file_url = gcs_service.upload_file_to_gcs(
            bucket_name,
            destination_blob_name,
            document.file,
            document.content_type or "application/octet-stream"
        )

    db_user = Company(
        name=name,
        email=email,
        password_hash=password_hash,
        phone=phone,
        industry=industry,
        country=country,
        state=state,
        city=city,
        zip=zip,
        address=address,
        document_type=document_type,
        document_file_url=document_file_url,
    )
    db.add(db_user)
    db.commit()
    db.refresh(db_user)
    return db_user


@router.post("/login")
async def login_recruiter(
    request: Request,
    response: Response,
    login_data: schemas.RecruiterLogin,
    db: Session = Depends(database.get_db),
):
    stmt = select(
        Company.id,
        Company.name,
        Company.email,
        Company.password_hash,
        Company.email_verified,
        Company.phone,
        Company.logo_url,
        Company.website,
        Company.industry,
        Company.min_company_size,
        Company.max_company_size,
        Company.country,
        Company.state,
        Company.city,
        Company.zip,
        Company.address,
        Company.verified,
        Company.created_at,
        Company.updated_at,
        Company.is_suspended,
    ).where(Company.email == login_data.email)
    company = db.execute(stmt).mappings().one()

    if company.get("is_suspended"):
        response.status_code = 403
        return {"message": "Account suspended. Please contact support."}

    password_match = security.verify_password(
        login_data.password, company["password_hash"]
    )

    if not password_match:
        response.status_code = 500
        return {"message": "invalid credentials"}

    encoded_jwt = jwt.encode(
        {
            "id": company.id,
            "exp": datetime.datetime.now(tz=datetime.timezone.utc)
            + datetime.timedelta(days=1),
        }
    )

    response.headers["Authorization"] = f"Bearer {encoded_jwt}"
    company_data = dict(company)
    company_data.pop("password_hash")
    return company_data


@router.get("")
async def get_recruiter(
    request: Request,
    db: Session = Depends(database.get_db),
    company_id=Depends(authorize_company),
):
    stmt = select(Company).where(Company.id == int(company_id))
    result = db.execute(stmt)
    recruiter = result.scalars().all()[0]

    return recruiter


@router.put("")
async def upate_recruiter(
    recruiter_data: schemas.UpdateRecruiter = Depends(),
    document: UploadFile = File(None),
    document_type: str = Form(None),
    company_id=Depends(authorize_company),
    db: Session = Depends(database.get_db),
):
    password_hash = None
    if recruiter_data.password:
        password_hash = security.hash_password(recruiter_data.password)

    data = recruiter_data.model_dump(exclude_none=True)
    # Always remove password_hash if present in incoming data
    data.pop("password_hash", None)
    if "password" in data:
        data.pop("password")
    if password_hash:
        data["password_hash"] = password_hash
    
    bucket_name = config.settings.GCS_BUCKET_NAME
    document_file_url = None
    if document and document.filename:
        destination_blob_name = f"company_docs/{company_id}_{document.filename}"
        document_file_url = gcs_service.upload_file_to_gcs(
            bucket_name,
            destination_blob_name,
            document.file,
            document.content_type or "application/octet-stream"
        )
        data["document_file_url"] = document_file_url
        data["document_type"] = document_type

    stmt = (
        update(Company)
        .values(data)
        .where(Company.id == company_id)
        .returning(Company)
    )

    result = db.execute(stmt)
    db.commit()
    company = result.scalars().first()
    if not company:
        raise HTTPException(status_code=404, detail="Company not found")
    # Return updated company profile (public fields)
    return {
        "id": company.id,
        "name": company.name,
        "email": company.email,
        "email_verified": company.email_verified,
        "phone": company.phone,
        "country_code": company.country_code,
        "website": company.website,
        "industry": company.industry,
        "min_company_size": company.min_company_size,
        "max_company_size": company.max_company_size,
        "country": company.country,
        "state": company.state,
        "city": company.city,
        "zip": company.zip,
        "address": company.address,
        "banner_url": company.banner_url,
        "logo_url": company.logo_url,
        "rating": company.rating,
        "ratings_count": company.ratings_count,
        "tagline": company.tagline,
        "tags": company.tags,
        "about_us": company.about_us,
        "about_us_poster_url": company.about_us_poster_url,
        "foundation_year": company.foundation_year,
        "website_url": company.website_url,
        "verified": company.verified,
        "created_at": company.created_at,
        "updated_at": company.updated_at,
        "document_type": company.document_type,
        "document_file_url": company.document_file_url,
    }


@router.get("/verify-token")
async def verify_recruiter_access_token(
    company_id=Depends(authorize_company),
    db: Session = Depends(database.get_db),
):
    stmt = select(Company).where(Company.id == company_id)
    recruiter = db.execute(stmt).scalars().all()[0]

    return recruiter


@router.post("/send-otp")
async def send_otp(
    send_otp_data: schemas.RecruiterSendEmailOtp,
    db: Session = Depends(database.get_db),
):
    otp = str(int(random.random() * 1000000))
    otp = otp + "0" * (6 - len(otp))

    brevo.send_otp_email(send_otp_data.email, otp, "1 min")
    stmt = (
        update(Company)
        .values(
            email_otp=otp,
            email_otp_expiry=datetime.datetime.now()
            .astimezone()
            .astimezone(tz=datetime.timezone.utc)
            .replace(tzinfo=None)
            + datetime.timedelta(seconds=60),
        )
        .where(Company.email == send_otp_data.email)
    )
    db.execute(stmt)
    db.commit()
    return {"message": "successfully sent otp"}


@router.post("/verify-otp")
async def verify_otp(
    response: Response,
    verify_otp_data: schemas.RecruiterVerifyEmailOtp,
    db: Session = Depends(database.get_db),
):
    stmt = select(Company.email_otp, Company.email_otp_expiry).where(
        Company.email == verify_otp_data.email
    )
    recruiter = db.execute(stmt).mappings().one()

    if recruiter["email_otp_expiry"] < datetime.datetime.now().astimezone().astimezone(
        tz=datetime.timezone.utc
    ).replace(tzinfo=None):
        response.status_code = 400
        return {"message": "otp expired"}

    if recruiter["email_otp"] != verify_otp_data.otp:
        response.status_code = 400
        return {"message": "invalid otp"}

    stmt = (
        update(Company)
        .values(email_verified=True)
        .where(Company.email == verify_otp_data.email)
        .returning(Company)
    )
    result = db.execute(stmt)
    db.commit()
    recruiter = result.scalars().all()[0]

    encoded_jwt = jwt.encode(
        {
            "id": recruiter.id,
            "exp": datetime.datetime.now(tz=datetime.timezone.utc)
            + datetime.timedelta(days=1),
        }
    )

    response.headers["Authorization"] = f"Bearer {encoded_jwt}"
    return recruiter


@router.post("/custom-interview-question")
async def create_interview_questions(
    interview_question_data: schemas.CreateInterviewQuestion,
    recruiter_id: int = Depends(authorize_company),
    db: Session = Depends(database.get_db),
):
    return services.create_interview_question(
        interview_question_data, db
    )


@router.put("/interview-question")
async def update_interview_question(
    interview_question_data: schemas.UpdateInterviewQuestion,
    recruiter_id: int = Depends(authorize_company),
    db: Session = Depends(database.get_db),
):
    return services.interview_question.update_interview_question(
        interview_question_data, db
    )


@router.delete("/interview-question")
async def delete_interview_question(
    id: int,
    recruiter_id: int = Depends(authorize_company),
    db: Session = Depends(database.get_db),
):
    return services.delete_interview_question(id, db)


@router.get("/interview-question")
async def get_interview_question_by_job(
    ai_interviewed_job_id: int,
    recruiter_id: int = Depends(authorize_company),
    db: Session = Depends(database.get_db),
):
    return services.get_interview_question_by_job_id(
        ai_interviewed_job_id, db
    )


@router.get("/interview-question-response")
async def get_interview_question_response_by_interview(
    interview_id: int,
    recruiter_id: int = Depends(authorize_company),
    db: Session = Depends(database.get_db),
):
    return services.interview_question_response.get_interview_question_response_by_interview_id(
        interview_id, db
    )


@router.get("/analytics")
async def get_analytics(
    recruiter_id: int = Depends(authorize_company),
    db: Session = Depends(database.get_db),
):
    now = datetime.datetime.utcnow()
    first_day_this_month = now.replace(day=1, hour=0, minute=0, second=0, microsecond=0)
    first_day_prev_month = (first_day_this_month - datetime.timedelta(days=1)).replace(
        day=1
    )
    last_day_prev_month = first_day_this_month - datetime.timedelta(seconds=1)

    today = now.date()
    start_of_week = today - datetime.timedelta(days=today.weekday())
    daily_interviews_this_week = []
    for i in range((today - start_of_week).days + 1):
        day = start_of_week + datetime.timedelta(days=i)
        day_start = datetime.datetime.combine(day, datetime.time.min)
        day_end = datetime.datetime.combine(day, datetime.time.max)
        count = db.execute(
            select(func.count(Interview.id))
            .join(AiInterviewedJob, AiInterviewedJob.id == Interview.ai_interviewed_job_id)
            .where(
                AiInterviewedJob.company_id == recruiter_id,
                AiInterviewedJob.created_at >= day_start,
                AiInterviewedJob.created_at <= day_end,
            )
        ).scalar()
        daily_interviews_this_week.append({"date": day.isoformat(), "count": count})

    interviews_completed_this_month = db.execute(
        select(func.count(Interview.id))
        .join(AiInterviewedJob, AiInterviewedJob.id == Interview.ai_interviewed_job_id)
        .where(
            AiInterviewedJob.company_id == recruiter_id,
            Interview.status == "completed",
            Interview.created_at >= first_day_this_month,
            Interview.created_at
            < (first_day_this_month + datetime.timedelta(days=32)).replace(day=1),
        )
    ).scalar()

    interviews_completed_prev_month = db.execute(
        select(func.count(Interview.id))
        .join(AiInterviewedJob, AiInterviewedJob.id == Interview.ai_interviewed_job_id)
        .where(
            AiInterviewedJob.company_id == recruiter_id,
            Interview.status == "completed",
            Interview.created_at >= first_day_prev_month,
            Interview.created_at <= last_day_prev_month,
        )
    ).scalar()

    total_jobs = db.execute(
        select(func.count(AiInterviewedJob.id)).where(
            AiInterviewedJob.company_id == recruiter_id
        )
    ).scalar()

    total_interviews_conducted = db.execute(
        select(func.count(Interview.id))
        .join(AiInterviewedJob, AiInterviewedJob.id == Interview.ai_interviewed_job_id)
        .where(AiInterviewedJob.company_id == recruiter_id)
    ).scalar()

    interviews_conducted_this_month = db.execute(
        select(func.count(Interview.id))
        .join(AiInterviewedJob, AiInterviewedJob.id == Interview.ai_interviewed_job_id)
        .where(
            AiInterviewedJob.company_id == recruiter_id,
            Interview.created_at >= first_day_this_month,
            Interview.created_at
            < (first_day_this_month + datetime.timedelta(days=32)).replace(day=1),
        )
    ).scalar()

    interviews_conducted_prev_month = db.execute(
        select(func.count(Interview.id))
        .join(AiInterviewedJob, AiInterviewedJob.id == Interview.ai_interviewed_job_id)
        .where(
            AiInterviewedJob.company_id == recruiter_id,
            Interview.created_at >= first_day_prev_month,
            Interview.created_at <= last_day_prev_month,
        )
    ).scalar()

    total_interviews_completed = db.execute(
        select(func.count(Interview.id))
        .join(AiInterviewedJob, AiInterviewedJob.id == Interview.ai_interviewed_job_id)
        .where(
            AiInterviewedJob.company_id == recruiter_id,
            Interview.status == "completed",
        )
    ).scalar()

    avg_score = (
        db.execute(
            select(func.avg(Interview.overall_score.cast(Float)))
            .join(AiInterviewedJob, AiInterviewedJob.id == Interview.ai_interviewed_job_id)
            .where(
                AiInterviewedJob.company_id == recruiter_id,
                Interview.status == "completed",
                Interview.created_at >= first_day_this_month,
                Interview.created_at
                < (first_day_this_month + datetime.timedelta(days=32)).replace(day=1),
            )
        ).scalar()
        or 0
    )

    total_candidates = db.execute(
        select(func.count(func.distinct(Interview.email)))
        .join(AiInterviewedJob, AiInterviewedJob.id == Interview.ai_interviewed_job_id)
        .where(
            AiInterviewedJob.company_id == recruiter_id
        )
    ).scalar()

    candidates_this_month = db.execute(
        select(func.count(func.distinct(Interview.email)))
        .join(AiInterviewedJob, AiInterviewedJob.id == Interview.ai_interviewed_job_id)
        .where(
            AiInterviewedJob.company_id == recruiter_id,
            Interview.created_at >= first_day_this_month,
            Interview.created_at
            < (first_day_this_month + datetime.timedelta(days=32)).replace(day=1),
        )
    ).scalar()

    candidates_prev_month = db.execute(
        select(func.count(func.distinct(Interview.email)))
        .join(AiInterviewedJob, AiInterviewedJob.id == Interview.ai_interviewed_job_id)
        .where(
            AiInterviewedJob.company_id == recruiter_id,
            Interview.created_at >= first_day_prev_month,
            Interview.created_at <= last_day_prev_month,
        )
    ).scalar()

    total_open_jobs = db.execute(
        select(func.count(AiInterviewedJob.id)).where(
            AiInterviewedJob.company_id == recruiter_id,
            AiInterviewedJob.status == "active",
        )
    ).scalar()

    total_closed_jobs = db.execute(
        select(func.count(AiInterviewedJob.id)).where(
            AiInterviewedJob.company_id == recruiter_id,
            AiInterviewedJob.status == "closed",
        )
    ).scalar()

    active_jobs_this_month = db.execute(
        select(func.count(AiInterviewedJob.id)).where(
            AiInterviewedJob.company_id == recruiter_id,
            AiInterviewedJob.status == "active",
            AiInterviewedJob.created_at >= first_day_this_month,
            AiInterviewedJob.created_at
            < (first_day_this_month + datetime.timedelta(days=32)).replace(day=1),
        )
    ).scalar()

    active_jobs_prev_month = db.execute(
        select(func.count(AiInterviewedJob.id)).where(
            AiInterviewedJob.company_id == recruiter_id,
            AiInterviewedJob.status == "active",
            AiInterviewedJob.created_at >= first_day_prev_month,
            AiInterviewedJob.created_at <= last_day_prev_month,
        )
    ).scalar()

    return {
        "total_jobs": total_jobs,
        "total_open_jobs": total_open_jobs,
        "total_closed_jobs": total_closed_jobs,
        "total_interviews_conducted": total_interviews_conducted,
        "total_interviews_conducted_this_month": interviews_conducted_this_month,
        "total_interviews_conducted_prev_month": interviews_conducted_prev_month,
        "total_interviews_completed": total_interviews_completed,
        "interviews_completed_this_month": interviews_completed_this_month,
        "interviews_completed_prev_month": interviews_completed_prev_month,
        "total_candidates": total_candidates,
        "average_candidate_score": round(avg_score, 2) if avg_score else 0,
        "active_jobs_this_month": active_jobs_this_month,
        "active_jobs_prev_month": active_jobs_prev_month,
        "candidates_this_month": candidates_this_month,
        "candidates_prev_month": candidates_prev_month,
        "daily_interviews_this_week": daily_interviews_this_week,
    }


@router.post("/quiz-option")
async def create_quiz_option(
    option_data: schemas.CreateQuizOption,
    db: Session = Depends(database.get_db),
    recruiter_id=Depends(authorize_company),
):
    quiz_option = QuizOption(
        label=option_data.label,
        correct=option_data.correct,
        quiz_question_id=option_data.quiz_question_id,
    )
    db.add(quiz_option)
    db.commit()
    db.refresh(quiz_option)
    return quiz_option


@router.put("/quiz-option")
async def update_quiz_option(
    option_data: schemas.UpdateQuizOption,
    db: Session = Depends(database.get_db),
    recruiter_id=Depends(authorize_company),
):
    stmt = (
        update(QuizOption)
        .values(label=option_data.label, correct=option_data.correct)
        .where(QuizOption.id == option_data.id)
        .returning(QuizOption.label, QuizOption.correct)
    )
    result = db.execute(stmt)
    db.commit()
    quiz_option = result.all()[0]._mapping
    return quiz_option


@router.delete("/quiz-option")
async def delete_quiz_option(
    option_id: str,
    db: Session = Depends(database.get_db),
    recruiter_id=Depends(authorize_company),
):
    stmt = delete(QuizOption).where(QuizOption.id == int(option_id))
    db.execute(stmt)
    db.commit()

@router.get("/interview/all")
async def get_company_interviews(
    ai_interviewed_job_id: str = None,
    interview_status: str = None,
    location: str = None,
    sort_by: Literal[
        "interview_status",
        "work_experience",
        "resume_match_score",
        "overall_score",
        "created_at",
    ] = None,
    sort_order: Literal["asc", "desc"] = "desc",
    limit: str = "10",
    offset: str = "0",
    db: Session = Depends(database.get_db),
    recruiter_id=Depends(authorize_company),
):
    stmt = select(Interview)
    count = 0

    order_column = Interview.id
    if sort_by == "interview_status":
        order_column = Interview.status
    elif sort_by == "work_experience":
        order_column = Interview.work_experience
    elif sort_by == "resume_match_score":
        order_column = Interview.resume_match_score
    elif sort_by == "overall_score":
        order_column = Interview.overall_score
    elif sort_by == "created_at":
        order_column = Interview.created_at

    if ai_interviewed_job_id:
        stmt = (
            stmt.join(AiInterviewedJob)
            .where(
                and_(
                    AiInterviewedJob.company_id == recruiter_id,
                    Interview.ai_interviewed_job_id == int(ai_interviewed_job_id),
                    Interview.status == interview_status if interview_status else True,
                    Interview.location == location if location else True,
                )
            )
            .limit(int(limit))
            .offset(int(offset))
            .order_by(desc(order_column) if sort_order == "desc" else asc(order_column))
        )
        count_stmt = select(func.count(Interview.id).label("count")).where(
            and_(
                AiInterviewedJob.company_id == recruiter_id,
                Interview.ai_interviewed_job_id == int(ai_interviewed_job_id),
                Interview.status == interview_status if interview_status else True,
                Interview.location == location if location else True,
            )
        )
    else:
        stmt = (
            stmt.join(AiInterviewedJob, AiInterviewedJob.id == Interview.ai_interviewed_job_id)
            .join(Company, Company.id == AiInterviewedJob.company_id)
            .where(
                Company.id == recruiter_id,
                Interview.status == interview_status if interview_status else True,
                Interview.location == location if location else True,
            )
            .limit(int(limit))
            .offset(int(offset))
            .order_by(desc(order_column) if sort_order == "desc" else asc(order_column))
        )
        count_stmt = (
            select(func.count(Interview.id).label("count"))
            .join(AiInterviewedJob, AiInterviewedJob.id == Interview.ai_interviewed_job_id)
            .join(Company, Company.id == AiInterviewedJob.company_id)
            .where(
                and_(
                    Company.id == recruiter_id,
                    Interview.status == interview_status if interview_status else True,
                    Interview.location == location if location else True,
                )
            )
        )
    result = db.execute(stmt)
    interviews = result.scalars().all()
    count = db.execute(count_stmt).mappings().one_or_none() or count

    return {"interviews": interviews, "count": count["count"]}

@router.get("/interview-question-and-response")
async def get_interview_question_and_response(
    interview_id: str,
    db: Session = Depends(database.get_db),
    recruiter_id=Depends(authorize_company),
):
    stmt = select(InterviewQuestionAndResponse).where(
        InterviewQuestionAndResponse.interview_id == int(interview_id),
    )
    result = db.execute(stmt)
    interview_question_and_response = result.scalars().all()
    return interview_question_and_response

@router.get("/interview")
async def get_interview_recruiter_view(
    id: str,
    db: Session = Depends(database.get_db),
    recruiter_id=Depends(authorize_company),
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
            Interview.technical_skills_score,
            Interview.communication_skills_score,
            Interview.problem_solving_skills_score,
            Interview.cultural_fit_score,
            Interview.feedback,
            Interview.ai_interviewed_job_id,
            Interview.report_file_url,
            Interview.updated_at,
            AiInterviewedJob.title.label('job_title'),
            AiInterviewedJob.description.label('job_description'),
            AiInterviewedJob.department.label('job_department'),
            AiInterviewedJob.city.label('job_city'),
            AiInterviewedJob.location.label('job_location'),
            AiInterviewedJob.type.label('job_type'),
            AiInterviewedJob.duration_months.label('job_duration_months'),
            AiInterviewedJob.min_experience,
            AiInterviewedJob.max_experience,
            AiInterviewedJob.currency,
            AiInterviewedJob.salary_min,
            AiInterviewedJob.salary_max,
            AiInterviewedJob.show_salary,
            AiInterviewedJob.key_qualification.label('job_key_qualification'),
            AiInterviewedJob.requirements,
            AiInterviewedJob.benefits,
            AiInterviewedJob.quiz_time_minutes,
        )
        .join(AiInterviewedJob, Interview.ai_interviewed_job_id == AiInterviewedJob.id)
        .join(Company, Company.id == AiInterviewedJob.company_id)
        .where(and_(Interview.id == int(id), Company.id == recruiter_id))
    )

    result = db.execute(stmt)
    interview = dict(result.mappings().one())
    if os.path.exists(f"uploads/interview_video/{int(id)}/video.m3u8"):
        interview["video_url"] = (
            f"{config.settings.URL}/uploads/interview_video/{int(id)}/video.m3u8"
        )


    gcs_bucket = config.settings.GCS_BUCKET_NAME
    gcs_prefix = f"screenshots/{int(id)}/"
    screenshot_blob_names = gcs_service.list_blobs_with_prefix(gcs_bucket, gcs_prefix)
    screenshot_urls = [
        gcs_service.get_blob_public_url(gcs_bucket, blob_name)
        for blob_name in screenshot_blob_names
    ]
    interview["screenshot_urls"] = screenshot_urls

    stmt = select(InterviewQuestionAndResponse).where(
        InterviewQuestionAndResponse.interview_id == int(id),
    )
    result = db.execute(stmt)
    interview_question_and_responses = result.scalars().all()
    interview["interview_question_and_responses"] = interview_question_and_responses

    stmt = (
        select(
            QuizQuestion.id,
            QuizQuestion.description,
            QuizQuestion.type,
            QuizQuestion.category,
            QuizQuestion.image_url,
            QuizQuestion.time_seconds,
        )
        .where(QuizQuestion.ai_interviewed_job_id == interview["ai_interviewed_job_id"])
    )
    quiz_responses = db.execute(stmt).scalars().all()
    quiz_responses = [
        dict(quiz_response._mapping) for quiz_response in db.execute(stmt).all()
    ]
    for quiz_response in quiz_responses:
        stmt = select(QuizOption.id, QuizOption.label, QuizOption.correct).where(
            QuizOption.quiz_question_id == quiz_response["id"]
        )
        options = [option._mapping for option in db.execute(stmt).all()]
        quiz_response["options"] = options
        stmt = (
            select(QuizResponse.quiz_option_id)
            .where(QuizResponse.quiz_question_id == quiz_response["id"])
        )
        selected_options = db.execute(stmt).mappings().all()
        quiz_response["selected_options"] = selected_options

    interview["quiz_responses"] = quiz_responses

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
        .where(DSAResponse.interview_id == int(id))
    )
    dsa_responses = db.execute(stmt).mappings().all()

    interview["dsa_responses"] = dsa_responses

    return interview

@router.post("/generate-private-link/{interview_id}")
async def generate_private_link(
    interview_id: int,
    db: Session = Depends(database.get_db),
    recruiter_id=Depends(authorize_company),
):
    stmt = select(Interview).where(Interview.id == interview_id)
    result = db.execute(stmt)
    interview = result.scalar_one_or_none()
    if not interview:
        raise HTTPException(status_code=404, detail="Interview not found")
    token = str(uuid.uuid4())
    interview.private_link_token = token
    db.commit()
    return {"private_link": f"/interview/private/{token}"}

@router.get("/quiz-response")
async def get_quiz_response_recruiter_view(
    interview_id: str,
    recruiter_id=Depends(authorize_company),
    db: Session = Depends(database.get_db),
):
    stmt = select(QuizResponse).where(QuizResponse.interview_id == int(interview_id))
    responses = db.execute(stmt).scalars().all()
    return [
        {
            "question_id": response.quiz_question_id,
            "option_id": response.quiz_option_id,
            "interview_id": response.interview_id,
        }
        for response in responses
    ]


@router.post('/job')
def create_job(job: schemas.JobCreate, db: Session = Depends(database.get_db)):
    db_job = Job(**job.dict())
    db.add(db_job)
    db.commit()
    db.refresh(db_job)
    return db_job

@router.get('/job')
def get_job(job_id: int = Query(...), db: Session = Depends(database.get_db)):
    stmt = select(Job).where(Job.id == job_id)
    job = db.scalars(stmt).first()
    if not job:
        raise HTTPException(status_code=404, detail='Job not found')
    return job

@router.get('/jobs')
def list_jobs(
    db: Session = Depends(database.get_db),
    company_id: int = None,
    search: str = None,
    limit: int = 50,
    offset: int = 0,
):
    stmt = select(Job)
    filters = []
    if company_id:
        filters.append(Job.company_id == company_id)
    if search:
        filters.append(Job.title.ilike(f"%{search}%"))
    if filters:
        stmt = stmt.where(*filters)
    stmt = stmt.limit(limit).offset(offset)
    jobs = db.execute(stmt).scalars().all()
    return [
        {
            "id": job.id,
            "company_id": job.company_id,
            "job_title": job.job_title,
            "job_role": job.job_role,
            "job_location": job.job_location,
            "job_locality": job.job_locality,
            "work_mode": job.work_mode,
            "min_work_experience": job.min_work_experience,
            "max_work_experience": job.max_work_experience,
            "min_salary_per_month": job.min_salary_per_month,
            "max_salary_per_month": job.max_salary_per_month,
            "additional_benefits": job.additional_benefits,
            "skills": job.skills,
            "qualification": job.qualification,
            "gender_preference": job.gender_preference,
            "candidate_prev_industry": job.candidate_prev_industry,
            "languages": job.languages,
            "education_degree": job.education_degree,
            "job_description": job.job_description,
            "posted_at": job.posted_at,
        }
        for job in jobs
    ]

@router.put('/job')
def update_job(job_id: int = Query(...), job: schemas.JobUpdate = None, db: Session = Depends(database.get_db)):
    stmt = select(Job).where(Job.id == job_id)
    db_job = db.scalars(stmt).first()
    if not db_job:
        raise HTTPException(status_code=404, detail='Job not found')
    for k, v in job.dict(exclude_unset=True).items():
        setattr(db_job, k, v)
    db.commit()
    db.refresh(db_job)
    return db_job

@router.delete('/job')
def delete_job(job_id: int = Query(...), db: Session = Depends(database.get_db)):
    stmt = select(Job).where(Job.id == job_id)
    db_job = db.scalars(stmt).first()
    if not db_job:
        raise HTTPException(status_code=404, detail='Job not found')
    db.delete(db_job)
    db.commit()
    return {"ok": True}

@router.delete("/interview")
async def delete_interview(
    id: int,
    recruiter_id: int = Depends(authorize_company),
    db: Session = Depends(database.get_db),
):
    rowcount = services.delete_interview(id, recruiter_id, db)
    if rowcount == 0:
        raise HTTPException(status_code=404, detail="Interview not found or you don't have permission to delete it")
    return {"detail": "Interview deleted successfully"}

@router.get("/job/applications")
def get_applications_for_job(
    job_id: int,
    db: Session = Depends(database.get_db),
    company_id: int = Depends(authorize_company)
):
    # Ensure the job belongs to the company
    job_stmt = select(Job).where(Job.id == job_id, Job.company_id == company_id)
    job_obj = db.scalars(job_stmt).first()
    if not job_obj:
        raise HTTPException(status_code=404, detail="Job not found or not authorized")

    # Fetch applications with jobseeker info
    stmt = (
        select(JobApplication)
        .where(JobApplication.job_id == job_id)
        .options(joinedload(JobApplication.job_seeker))
    )
    applications = db.scalars(stmt).all()
    return [
        {
            "id": app.id,
            "status": app.status,
            "applied_at": app.applied_at,
            "resume_url": app.resume_url,
            "job_seeker": {
                "id": app.job_seeker.id,
                "firstname": app.job_seeker.firstname,
                "lastname": app.job_seeker.lastname,
                "email": app.job_seeker.email,
                "phone": app.job_seeker.phone,
                "profile_picture_url": app.job_seeker.profile_picture_url,
            }
        }
        for app in applications
    ]

@router.get("/job/application/candidate")
def get_candidate_details_for_application(
    application_id: int,
    db: Session = Depends(database.get_db),
    company_id: int = Depends(authorize_company)
):
    # Fetch the application and join the jobseeker
    stmt = (
        select(JobApplication)
        .where(JobApplication.id == application_id)
        .options(joinedload(JobApplication.job_seeker))
    )
    app_obj = db.scalars(stmt).first()
    if not app_obj:
        raise HTTPException(status_code=404, detail="Application not found")
    # Optionally: check that the job belongs to the company

    js = app_obj.job_seeker
    return {
        "id": js.id,
        "firstname": js.firstname,
        "lastname": js.lastname,
        "email": js.email,
        "phone": js.phone,
        "profile_picture_url": js.profile_picture_url,
        "gender": js.gender,
        "date_of_birth": js.date_of_birth,
        "current_location": js.current_location,
        "home_town": js.home_town,
        "country": js.country,
        "work_experience_yrs": js.work_experience_yrs,
        "key_skills": js.key_skills,
        "languages": js.languages,
        "profile_summary": js.profile_summary,
        "awards_and_accomplishments": js.awards_and_accomplishments,
        "resume_url": js.resume_url,
        # Add more fields as needed
    }

@router.get("/profile")
async def get_company_profile(
    company_id: int = Depends(authorize_company),
    db: Session = Depends(database.get_db),
):
    stmt = select(Company).where(Company.id == company_id)
    result = db.execute(stmt)
    company = result.scalars().first()
    if not company:
        raise HTTPException(status_code=404, detail="Company not found")
    # Return all model fields except sensitive ones
    return {
        "id": company.id,
        "name": company.name,
        "email": company.email,
        "email_verified": company.email_verified,
        "phone": company.phone,
        "country_code": company.country_code,
        "website": company.website,
        "industry": company.industry,
        "min_company_size": company.min_company_size,
        "max_company_size": company.max_company_size,
        "country": company.country,
        "state": company.state,
        "city": company.city,
        "zip": company.zip,
        "address": company.address,
        "banner_url": company.banner_url,
        "logo_url": company.logo_url,
        "rating": company.rating,
        "ratings_count": company.ratings_count,
        "tagline": company.tagline,
        "tags": company.tags,
        "about_us": company.about_us,
        "about_us_poster_url": company.about_us_poster_url,
        "foundation_year": company.foundation_year,
        "website_url": company.website_url,
        "verified": company.verified,
        "created_at": company.created_at,
        "updated_at": company.updated_at,
        "document_type": company.document_type,
        "document_file_url": company.document_file_url,
    }

@router.put("/profile")
async def update_company_profile(
    logo: UploadFile = File(None),
    banner: UploadFile = File(None),
    name: Optional[str] = Form(None),
    password: Optional[str] = Form(None),
    phone: Optional[str] = Form(None),
    designation: Optional[str] = Form(None),
    company_name: Optional[str] = Form(None),
    industry: Optional[str] = Form(None),
    country: Optional[str] = Form(None),
    state: Optional[str] = Form(None),
    city: Optional[str] = Form(None),
    zip: Optional[str] = Form(None),
    address: Optional[str] = Form(None),
    tagline: Optional[str] = Form(None),
    tags: Optional[str] = Form(None),
    about_us: Optional[str] = Form(None),
    about_us_poster_url: Optional[str] = Form(None),
    foundation_year: Optional[int] = Form(None),
    website: Optional[str] = Form(None),
    website_url: Optional[str] = Form(None),
    min_company_size: Optional[int] = Form(None),
    max_company_size: Optional[int] = Form(None),
    email: Optional[str] = Form(None),
    email_verified: Optional[bool] = Form(None),
    country_code: Optional[str] = Form(None),
    phone_verified: Optional[bool] = Form(None),
    rating: Optional[int] = Form(None),
    ratings_count: Optional[int] = Form(None),
    verified: Optional[bool] = Form(None),
    # created_at and updated_at should not be updated by user
    company_id=Depends(authorize_company),
    db: Session = Depends(database.get_db),
):
    update_data = {
        "name": name,
        "password": password,
        "phone": phone,
        "designation": designation,
        "company_name": company_name,
        "industry": industry,
        "country": country,
        "state": state,
        "city": city,
        "zip": zip,
        "address": address,
        "tagline": tagline,
        "tags": tags,
        "about_us": about_us,
        "about_us_poster_url": about_us_poster_url,
        "foundation_year": foundation_year,
        "website": website,
        "website_url": website_url,
        "min_company_size": min_company_size,
        "max_company_size": max_company_size,
        "email": email,
        "email_verified": email_verified,
        "country_code": country_code,
        "phone_verified": phone_verified,
        "rating": rating,
        "ratings_count": ratings_count,
        "verified": verified,
    }
    update_data = {k: v for k, v in update_data.items() if v is not None}

    # Handle password hashing
    if "password" in update_data:
        update_data["password_hash"] = hash_password(update_data.pop("password"))

    # Handle logo upload
    if logo is not None:
        bucket = config.settings.GCS_BUCKET_NAME
        ext = logo.filename.split(".")[-1]
        dest = f"company/logo_{company_id}.{ext}"
        url = gcs_service.upload_file_to_gcs(bucket, dest, logo.file, logo.content_type)
        update_data["logo_url"] = url

    # Handle banner upload
    if banner is not None:
        bucket = config.settings.GCS_BUCKET_NAME
        ext = banner.filename.split(".")[-1]
        dest = f"company/banner_{company_id}.{ext}"
        url = gcs_service.upload_file_to_gcs(bucket, dest, banner.file, banner.content_type)
        update_data["banner_url"] = url

    stmt = (
        update(Company)
        .values(update_data)
        .where(Company.id == company_id)
        .returning(Company)
    )
    result = db.execute(stmt)
    db.commit()
    company = result.scalars().first()
    if not company:
        raise HTTPException(status_code=404, detail="Company not found")
    return {
        "id": company.id,
        "name": company.name,
        "email": company.email,
        "email_verified": company.email_verified,
        "phone": company.phone,
        "country_code": company.country_code,
        "website": company.website,
        "industry": company.industry,
        "min_company_size": company.min_company_size,
        "max_company_size": company.max_company_size,
        "country": company.country,
        "state": company.state,
        "city": company.city,
        "zip": company.zip,
        "address": company.address,
        "banner_url": company.banner_url,
        "logo_url": company.logo_url,
        "rating": company.rating,
        "ratings_count": company.ratings_count,
        "tagline": company.tagline,
        "tags": company.tags,
        "about_us": company.about_us,
        "about_us_poster_url": company.about_us_poster_url,
        "foundation_year": company.foundation_year,
        "website_url": company.website_url,
        "verified": company.verified,
        "created_at": company.created_at,
        "updated_at": company.updated_at,
        "document_type": company.document_type,
        "document_file_url": company.document_file_url,
    }


@router.post("/invite-candidates/{ai_interviewed_job_id}")
async def invite_candidates(
    ai_interviewed_job_id: int,
    invite_data: CandidateInviteRequest,
    db: Session = Depends(database.get_db),
    recruiter_id=Depends(authorize_company),
):
    job = db.execute(select(AiInterviewedJob).where(AiInterviewedJob.id == ai_interviewed_job_id, AiInterviewedJob.company_id == recruiter_id)).scalar_one_or_none()
    if not job:
        raise HTTPException(status_code=404, detail="Job not found or unauthorized")

    sent_links = []
    for candidate in invite_data.candidates:
        email = candidate["email"].strip().lower()
        firstname = candidate.get("firstname", "Candidate")
        lastname = candidate.get("lastname", "")
        # Check if interview already exists for this job and email
        interview = db.execute(
            select(Interview).where(
                Interview.email == email,
                Interview.ai_interviewed_job_id == ai_interviewed_job_id
            )
        ).scalar_one_or_none()
        if not interview:
            token = str(uuid.uuid4())
            interview = Interview(
                firstname=firstname,
                lastname=lastname,
                email=email,
                ai_interviewed_job_id=ai_interviewed_job_id,
                private_link_token=token
            )
            db.add(interview)
            db.commit()
            db.refresh(interview)
        else:
            # If already exists, update the token
            interview.private_link_token = str(uuid.uuid4())
            db.commit()
            db.refresh(interview)
        # Always use the value from the DB
        private_link = f"{config.settings.FRONTEND_URL}/interview/private/{interview.private_link_token}"
        html_content = f"""
            <h1>Edudiagno Interview Invitation</h1>
            <p>Dear {firstname},</p>
            <p>You have been invited to participate in an interview for the position: <b>{job.title}</b>.</p>
            <p>Please use the following private link to access your interview:</p>
            <a href='{private_link}'>{private_link}</a>
            <p>This link is unique to you and should not be shared.</p>
            <p>Best regards,<br/>Edudiagno Team</p>
            <hr>
            <p>🌐 Check us out: https://edudiagno.com</p>
            <p>📱 Follow on IG: https://lnkd.in/gsJV9Pnr</p>
            <p>🔗 LinkedIn: https://lnkd.in/ggMYfJ29</p>
            <p>💼 Contact us: contact@edudiagno.com</p>
        """
        try:
            send_smtp_email = brevo.brevo_python.SendSmtpEmail(
                sender={
                    "name": config.settings.MAIL_SENDER_NAME,
                    "email": config.settings.MAIL_SENDER_EMAIL,
                },
                to=[{"email": email}],
                html_content=html_content,
                subject=f"Interview Invitation for {job.title}",
            )
            brevo.api_instance.send_transac_email(send_smtp_email)
            sent_links.append({"email": email, "link": private_link, "status": "sent"})
        except Exception as e:
            sent_links.append({"email": email, "link": private_link, "status": f"failed: {str(e)}"})
    return {"results": sent_links}
