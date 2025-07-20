from fastapi import APIRouter, Depends, HTTPException, status, Request
from sqlalchemy.orm import Session, joinedload
from sqlalchemy import and_, insert, select, update, delete
from app import models, database, schemas
from app.job_seeker.schemas import JobSeekerOut, JobSeekerUpdate
from app.company.schemas import CompanyOut, CompanyBase, JobOut, JobBase, AiInterviewedJobOut, AiInterviewedJobBase
from app.interview.schemas import InterviewOut, InterviewBase, QuizQuestionOut, QuizQuestionBase, DSAQuestionOut, DSAQuestionBase, InterviewQuestionOut, InterviewQuestionBase
from app.schemas import JobApplicationOut, JobApplicationBase
from app.models import AdminUser, DSAPoolQuestion, DSAPoolTestCase
from app.lib import jwt as app_jwt
from app.lib.security import verify_password
from pydantic import BaseModel
from typing import Optional, List
from sqlalchemy import and_, insert, select, update, delete

router = APIRouter(tags=["Admin"])

class AdminLoginRequest(BaseModel):
    email: str
    password: str

@router.post("/login")
def admin_login(data: AdminLoginRequest, db: Session = Depends(database.get_db)):
    admin = db.query(AdminUser).filter(AdminUser.email == data.email, AdminUser.is_active == True).first()
    if not admin or not verify_password(data.password, admin.password_hash):
        raise HTTPException(status_code=401, detail="Invalid credentials")
    token = app_jwt.encode({"sub": str(admin.id), "role": admin.role, "is_admin": True})
    return {"access_token": token, "token_type": "bearer"}

def authorize_admin(request: Request, db: Session = Depends(database.get_db)):
    auth_header = request.headers.get("authorization")
    if not auth_header or not auth_header.startswith("Bearer "):
        raise HTTPException(status_code=401, detail="Missing or invalid Authorization header")
    token = auth_header.split("Bearer ", 1)[1]
    try:
        payload = app_jwt.decode(token)
        admin_id = int(payload.get("sub"))
        is_admin = payload.get("is_admin", False)
        role = payload.get("role", "")
    except Exception:
        raise HTTPException(status_code=401, detail="Invalid token")
    if not is_admin:
        raise HTTPException(status_code=403, detail="Not an admin user")
    admin = db.query(AdminUser).filter(AdminUser.id == admin_id, AdminUser.is_active == True).first()
    if not admin:
        raise HTTPException(status_code=403, detail="Admin user not found or inactive")
    return admin

def serialize_jobseeker_for_admin(js):
    return {
        'id': js.id,
        'firstname': js.firstname,
        'lastname': js.lastname,
        'email': js.email,
        'phone': js.phone,
        'country_code': js.country_code,
        'work_experience_yrs': js.work_experience_yrs,
        'email_verified': js.email_verified,
        'phone_verified': js.phone_verified,
        'profile_picture_url': js.profile_picture_url,
        'gender': js.gender,
        'date_of_birth': js.date_of_birth.isoformat() if js.date_of_birth else '',
        'current_location': js.current_location,
        'home_town': js.home_town,
        'country': js.country,
        'key_skills': js.key_skills,
        'languages': js.languages,
        'profile_summary': js.profile_summary,
        'resume_url': js.resume_url,
        'preferred_work_location': js.preferred_work_location,
        'career_preference_jobs': js.career_preference_jobs,
        'career_preference_internships': js.career_preference_internships,
        'min_duration_months': js.min_duration_months,
        'awards_and_accomplishments': js.awards_and_accomplishments,
        'updates_subscription': js.updates_subscription,
        'is_suspended': js.is_suspended,
        'is_verified': js.is_verified,
        'is_deleted': js.is_deleted,
        'admin_notes': js.admin_notes,
        'created_at': js.created_at.isoformat() if js.created_at else None,
        'updated_at': js.updated_at.isoformat() if js.updated_at else None,
    }

def serialize_job_application_for_admin(app):
    return {
        'id': app.id,
        'job_seeker_id': app.job_seeker_id,
        'job_id': app.job_id,
        'status': app.status,
        'resume_url': app.resume_url,
        'applied_at': app.applied_at.isoformat() if app.applied_at else '',
        'is_flagged': app.is_flagged,
        'admin_notes': app.admin_notes,
    }

# --- JobSeeker Endpoints ---
@router.get("/jobseekers", response_model=list[JobSeekerOut])
def list_jobseekers(db: Session = Depends(database.get_db), admin=Depends(authorize_admin)):
    jobseekers = db.query(models.JobSeeker).all()
    return [serialize_jobseeker_for_admin(js) for js in jobseekers]

@router.get("/jobseekers/{id}", response_model=JobSeekerOut)
def get_jobseeker(id: int, db: Session = Depends(database.get_db), admin=Depends(authorize_admin)):
    js = db.query(models.JobSeeker).get(id)
    if not js:
        raise HTTPException(404, "JobSeeker not found")
    return serialize_jobseeker_for_admin(js)

@router.put("/jobseekers/{id}", response_model=JobSeekerOut)
def update_jobseeker(id: int, data: JobSeekerUpdate, db: Session = Depends(database.get_db), admin=Depends(authorize_admin)):
    js = db.query(models.JobSeeker).get(id)
    if not js:
        raise HTTPException(404, "JobSeeker not found")
    for k, v in data.dict(exclude_unset=True).items():
        setattr(js, k, v)
    db.commit()
    db.refresh(js)
    return serialize_jobseeker_for_admin(js)

@router.delete("/jobseekers/{id}")
def delete_jobseeker(id: int, db: Session = Depends(database.get_db), admin=Depends(authorize_admin)):
    js = db.query(models.JobSeeker).get(id)
    if not js:
        raise HTTPException(404, "JobSeeker not found")
    db.delete(js)
    db.commit()
    return {"ok": True}

@router.post("/jobseekers/{id}/suspend")
def suspend_jobseeker(id: int, suspend: bool, db: Session = Depends(database.get_db), admin=Depends(authorize_admin)):
    js = db.query(models.JobSeeker).get(id)
    if not js:
        raise HTTPException(404, "JobSeeker not found")
    js.is_suspended = suspend
    db.commit()
    return {"id": id, "is_suspended": suspend}

@router.post("/jobseekers/{id}/verify")
def verify_jobseeker(id: int, verify: bool, db: Session = Depends(database.get_db), admin=Depends(authorize_admin)):
    js = db.query(models.JobSeeker).get(id)
    if not js:
        raise HTTPException(404, "JobSeeker not found")
    js.is_verified = verify
    db.commit()
    return {"id": id, "is_verified": verify}

@router.get("/jobseekers/{id}/applications", response_model=list[JobApplicationOut])
def get_jobseeker_applications(id: int, db: Session = Depends(database.get_db), admin=Depends(authorize_admin)):
    apps = db.query(models.JobApplication).filter(models.JobApplication.job_seeker_id == id).all()
    return [serialize_job_application_for_admin(app) for app in apps]

@router.get("/jobseekers/{id}/interviews", response_model=list[InterviewOut])
def get_jobseeker_interviews(id: int, db: Session = Depends(database.get_db), admin=Depends(authorize_admin)):
    interviews = db.query(models.Interview).filter(models.Interview.email == db.query(models.JobSeeker.email).filter(models.JobSeeker.id == id).scalar()).all()
    return [serialize_interview_for_admin(interview) for interview in interviews]

# --- Company Endpoints ---
@router.get("/companies", response_model=list[CompanyOut])
def list_companies(db: Session = Depends(database.get_db), admin=Depends(authorize_admin)):
    return db.query(models.Company).all()

@router.get("/companies/{id}", response_model=CompanyOut)
def get_company(id: int, db: Session = Depends(database.get_db), admin=Depends(authorize_admin)):
    c = db.query(models.Company).get(id)
    if not c:
        raise HTTPException(404, "Company not found")
    return c

@router.put("/companies/{id}", response_model=CompanyOut)
def update_company(id: int, data: CompanyBase, db: Session = Depends(database.get_db), admin=Depends(authorize_admin)):
    c = db.query(models.Company).get(id)
    if not c:
        raise HTTPException(404, "Company not found")
    for k, v in data.dict(exclude_unset=True).items():
        setattr(c, k, v)
    db.commit()
    db.refresh(c)
    return c

@router.delete("/companies/{id}")
def delete_company(id: int, db: Session = Depends(database.get_db), admin=Depends(authorize_admin)):
    c = db.query(models.Company).get(id)
    if not c:
        raise HTTPException(404, "Company not found")
    db.delete(c)
    db.commit()
    return {"ok": True}

@router.post("/companies/{id}/suspend")
def suspend_company(id: int, suspend: bool, db: Session = Depends(database.get_db), admin=Depends(authorize_admin)):
    c = db.query(models.Company).get(id)
    if not c:
        raise HTTPException(404, "Company not found")
    c.is_suspended = suspend
    db.commit()
    return {"id": id, "is_suspended": suspend}

@router.post("/companies/{id}/verify")
def verify_company(id: int, verify: bool, db: Session = Depends(database.get_db), admin=Depends(authorize_admin)):
    c = db.query(models.Company).get(id)
    if not c:
        raise HTTPException(404, "Company not found")
    c.verified = verify
    db.commit()
    return {"id": id, "verified": verify}

# --- Job Endpoints ---
def serialize_job_for_admin(job):
    return {
        'id': job.id,
        'company_id': job.company_id,
        'job_title': job.job_title,
        'job_role': job.job_role,
        'job_location': job.job_location,
        'job_locality': job.job_locality,
        'work_mode': job.work_mode,
        'min_work_experience': job.min_work_experience,
        'max_work_experience': job.max_work_experience,
        'min_salary_per_month': job.min_salary_per_month,
        'max_salary_per_month': job.max_salary_per_month,
        'additional_benefits': job.additional_benefits,
        'skills': job.skills,
        'qualification': job.qualification,
        'gender_preference': job.gender_preference,
        'candidate_prev_industry': job.candidate_prev_industry,
        'languages': job.languages,
        'education_degree': job.education_degree,
        'job_description': job.job_description,
        'is_featured': job.is_featured,
        'is_approved': job.is_approved,
        'is_closed': job.is_closed,
        'is_deleted': job.is_deleted,
        'admin_notes': job.admin_notes,
        'posted_at': job.posted_at.isoformat() if job.posted_at else '',
    }

@router.get("/jobs", response_model=list[JobOut])
def list_jobs(db: Session = Depends(database.get_db), admin=Depends(authorize_admin)):
    jobs = db.query(models.Job).all()
    return [serialize_job_for_admin(job) for job in jobs]

@router.get("/jobs/{id}", response_model=JobOut)
def get_job(id: int, db: Session = Depends(database.get_db), admin=Depends(authorize_admin)):
    j = db.query(models.Job).get(id)
    if not j:
        raise HTTPException(404, "Job not found")
    return serialize_job_for_admin(j)

@router.put("/jobs/{id}", response_model=JobOut)
def update_job(id: int, data: JobBase, db: Session = Depends(database.get_db), admin=Depends(authorize_admin)):
    j = db.query(models.Job).get(id)
    if not j:
        raise HTTPException(404, "Job not found")
    for k, v in data.dict(exclude_unset=True).items():
        setattr(j, k, v)
    db.commit()
    db.refresh(j)
    return j

@router.delete("/jobs/{id}")
def delete_job(id: int, db: Session = Depends(database.get_db), admin=Depends(authorize_admin)):
    j = db.query(models.Job).get(id)
    if not j:
        raise HTTPException(404, "Job not found")
    db.delete(j)
    db.commit()
    return {"ok": True}

@router.post("/jobs/{id}/approve")
def approve_job(id: int, approve: bool, db: Session = Depends(database.get_db), admin=Depends(authorize_admin)):
    j = db.query(models.Job).get(id)
    if not j:
        raise HTTPException(404, "Job not found")
    j.is_approved = approve
    db.commit()
    return {"id": id, "is_approved": approve}

@router.post("/jobs/{id}/close")
def close_job(id: int, close: bool, db: Session = Depends(database.get_db), admin=Depends(authorize_admin)):
    j = db.query(models.Job).get(id)
    if not j:
        raise HTTPException(404, "Job not found")
    j.is_closed = close
    db.commit()
    return {"id": id, "is_closed": close}

@router.post("/jobs/{id}/feature")
def feature_job(id: int, feature: bool, db: Session = Depends(database.get_db), admin=Depends(authorize_admin)):
    j = db.query(models.Job).get(id)
    if not j:
        raise HTTPException(404, "Job not found")
    j.is_featured = feature
    db.commit()
    return {"id": id, "is_featured": feature}

# --- AiInterviewedJob Endpoints ---
@router.get("/ai-interviewed-jobs", response_model=list[AiInterviewedJobOut])
def list_ai_interviewed_jobs(db: Session = Depends(database.get_db), admin=Depends(authorize_admin)):
    return db.query(models.AiInterviewedJob).all()

@router.get("/ai-interviewed-jobs/{id}", response_model=AiInterviewedJobOut)
def get_ai_interviewed_job(id: int, db: Session = Depends(database.get_db), admin=Depends(authorize_admin)):
    job = db.query(models.AiInterviewedJob).get(id)
    if not job:
        raise HTTPException(404, "AiInterviewedJob not found")
    return job

@router.put("/ai-interviewed-jobs/{id}", response_model=AiInterviewedJobOut)
def update_ai_interviewed_job(id: int, data: AiInterviewedJobBase, db: Session = Depends(database.get_db), admin=Depends(authorize_admin)):
    job = db.query(models.AiInterviewedJob).get(id)
    if not job:
        raise HTTPException(404, "AiInterviewedJob not found")
    for k, v in data.dict(exclude_unset=True).items():
        setattr(job, k, v)
    db.commit()
    db.refresh(job)
    return job

@router.delete("/ai-interviewed-jobs/{id}")
def delete_ai_interviewed_job(id: int, db: Session = Depends(database.get_db), admin=Depends(authorize_admin)):
    job = db.query(models.AiInterviewedJob).get(id)
    if not job:
        raise HTTPException(404, "AiInterviewedJob not found")
    db.delete(job)
    db.commit()
    return {"ok": True}

@router.post("/ai-interviewed-jobs/{id}/approve")
def approve_ai_interviewed_job(id: int, approve: bool, db: Session = Depends(database.get_db), admin=Depends(authorize_admin)):
    job = db.query(models.AiInterviewedJob).get(id)
    if not job:
        raise HTTPException(404, "AiInterviewedJob not found")
    job.is_approved = approve
    db.commit()
    return {"id": id, "is_approved": approve}

@router.post("/ai-interviewed-jobs/{id}/close")
def close_ai_interviewed_job(id: int, close: bool, db: Session = Depends(database.get_db), admin=Depends(authorize_admin)):
    job = db.query(models.AiInterviewedJob).get(id)
    if not job:
        raise HTTPException(404, "AiInterviewedJob not found")
    job.is_closed = close
    db.commit()
    return {"id": id, "is_closed": close}

@router.post("/ai-interviewed-jobs/{id}/feature")
def feature_ai_interviewed_job(id: int, feature: bool, db: Session = Depends(database.get_db), admin=Depends(authorize_admin)):
    job = db.query(models.AiInterviewedJob).get(id)
    if not job:
        raise HTTPException(404, "AiInterviewedJob not found")
    job.is_featured = feature
    db.commit()
    return {"id": id, "is_featured": feature}

# --- Interview Endpoints ---
def serialize_interview_for_admin(interview):
    return {
        'id': interview.id,
        'firstname': interview.firstname,
        'lastname': interview.lastname,
        'email': interview.email,
        'phone': interview.phone,
        'work_experience_yrs': interview.work_experience_yrs,
        'education': interview.education,
        'skills': interview.skills,
        'city': interview.city,
        'linkedin_url': interview.linkedin_url,
        'portfolio_url': interview.portfolio_url,
        'resume_url': interview.resume_url,
        'resume_text': interview.resume_text,
        'resume_match_score': interview.resume_match_score,
        'resume_match_feedback': interview.resume_match_feedback,
        'overall_score': interview.overall_score,
        'feedback': interview.feedback,
        'ai_interviewed_job_id': interview.ai_interviewed_job_id,
        'private_link_token': interview.private_link_token,
        'is_flagged': interview.is_flagged,
        'admin_notes': interview.admin_notes,
        'created_at': interview.created_at.isoformat() if interview.created_at else '',
        'updated_at': interview.updated_at.isoformat() if interview.updated_at else '',
    }

@router.get("/interviews", response_model=list[InterviewOut])
def list_interviews(db: Session = Depends(database.get_db), admin=Depends(authorize_admin)):
    interviews = db.query(models.Interview).all()
    return [serialize_interview_for_admin(interview) for interview in interviews]

@router.get("/interviews/{id}", response_model=InterviewOut)
def get_interview(id: int, db: Session = Depends(database.get_db), admin=Depends(authorize_admin)):
    interview = db.query(models.Interview).get(id)
    if not interview:
        raise HTTPException(404, "Interview not found")
    return serialize_interview_for_admin(interview)

@router.put("/interviews/{id}", response_model=InterviewOut)
def update_interview(id: int, data: InterviewBase, db: Session = Depends(database.get_db), admin=Depends(authorize_admin)):
    interview = db.query(models.Interview).get(id)
    if not interview:
        raise HTTPException(404, "Interview not found")
    for k, v in data.dict(exclude_unset=True).items():
        setattr(interview, k, v)
    db.commit()
    db.refresh(interview)
    return interview

@router.delete("/interviews/{id}")
def delete_interview(id: int, db: Session = Depends(database.get_db), admin=Depends(authorize_admin)):
    interview = db.query(models.Interview).get(id)
    if not interview:
        raise HTTPException(404, "Interview not found")
    db.delete(interview)
    db.commit()
    return {"ok": True}

@router.post("/interviews/{id}/flag")
def flag_interview(id: int, flag: bool, db: Session = Depends(database.get_db), admin=Depends(authorize_admin)):
    interview = db.query(models.Interview).get(id)
    if not interview:
        raise HTTPException(404, "Interview not found")
    interview.is_flagged = flag
    db.commit()
    return {"id": id, "is_flagged": flag}

# --- QuizQuestion Endpoints ---
@router.get("/quiz-questions", response_model=list[QuizQuestionOut])
def list_quiz_questions(db: Session = Depends(database.get_db), admin=Depends(authorize_admin)):
    return db.query(models.QuizQuestion).all()

@router.get("/quiz-questions/{id}", response_model=QuizQuestionOut)
def get_quiz_question(id: int, db: Session = Depends(database.get_db), admin=Depends(authorize_admin)):
    q = db.query(models.QuizQuestion).get(id)
    if not q:
        raise HTTPException(404, "QuizQuestion not found")
    return q

@router.put("/quiz-questions/{id}", response_model=QuizQuestionOut)
def update_quiz_question(id: int, data: QuizQuestionBase, db: Session = Depends(database.get_db), admin=Depends(authorize_admin)):
    q = db.query(models.QuizQuestion).get(id)
    if not q:
        raise HTTPException(404, "QuizQuestion not found")
    for k, v in data.dict(exclude_unset=True).items():
        setattr(q, k, v)
    db.commit()
    db.refresh(q)
    return q

@router.delete("/quiz-questions/{id}")
def delete_quiz_question(id: int, db: Session = Depends(database.get_db), admin=Depends(authorize_admin)):
    q = db.query(models.QuizQuestion).get(id)
    if not q:
        raise HTTPException(404, "QuizQuestion not found")
    db.delete(q)
    db.commit()
    return {"ok": True}

@router.post("/quiz-questions/{id}/approve")
def approve_quiz_question(id: int, approve: bool, db: Session = Depends(database.get_db), admin=Depends(authorize_admin)):
    q = db.query(models.QuizQuestion).get(id)
    if not q:
        raise HTTPException(404, "QuizQuestion not found")
    q.is_approved = approve
    db.commit()
    return {"id": id, "is_approved": approve}

# --- DSAQuestion Endpoints ---
from pydantic import BaseModel

class DSAQuestionCreate(BaseModel):
    edudiagno_test_id: int
    title: str
    description: str = ""
    difficulty: str
    time_minutes: int
    test_cases: list = []

@router.post("/dsa-questions")
def create_dsa_question(data: DSAQuestionCreate, db: Session = Depends(database.get_db), admin=Depends(authorize_admin)):
    q = models.DSAQuestion(
        edudiagno_test_id=data.edudiagno_test_id,
        title=data.title,
        description=data.description,
        difficulty=data.difficulty,
        time_minutes=data.time_minutes,
    )
    db.add(q)
    db.commit()
    db.refresh(q)
    # Optionally handle test_cases here if needed
    return q
@router.get("/dsa-questions", response_model=list[DSAQuestionOut])
def list_dsa_questions(db: Session = Depends(database.get_db), admin=Depends(authorize_admin)):
    return db.query(models.DSAQuestion).all()

@router.get("/dsa-questions/{id}", response_model=DSAQuestionOut)
def get_dsa_question(id: int, db: Session = Depends(database.get_db), admin=Depends(authorize_admin)):
    q = db.query(models.DSAQuestion).get(id)
    if not q:
        raise HTTPException(404, "DSAQuestion not found")
    return q

@router.put("/dsa-questions/{id}", response_model=DSAQuestionOut)
def update_dsa_question(id: int, data: DSAQuestionBase, db: Session = Depends(database.get_db), admin=Depends(authorize_admin)):
    q = db.query(models.DSAQuestion).get(id)
    if not q:
        raise HTTPException(404, "DSAQuestion not found")
    for k, v in data.dict(exclude_unset=True).items():
        setattr(q, k, v)
    db.commit()
    db.refresh(q)
    return q

@router.delete("/dsa-questions/{id}")
def delete_dsa_question(id: int, db: Session = Depends(database.get_db), admin=Depends(authorize_admin)):
    q = db.query(models.DSAQuestion).get(id)
    if not q:
        raise HTTPException(404, "DSAQuestion not found")
    db.delete(q)
    db.commit()
    return {"ok": True}

@router.post("/dsa-questions/{id}/approve")
def approve_dsa_question(id: int, approve: bool, db: Session = Depends(database.get_db), admin=Depends(authorize_admin)):
    q = db.query(models.DSAQuestion).get(id)
    if not q:
        raise HTTPException(404, "DSAQuestion not found")
    q.is_approved = approve
    db.commit()
    return {"id": id, "is_approved": approve}

# --- InterviewQuestion Endpoints ---

# Create InterviewQuestion (POST)
@router.post("/interview-questions", response_model=InterviewQuestionOut, status_code=201)
def create_interview_question(data: InterviewQuestionBase, db: Session = Depends(database.get_db), admin=Depends(authorize_admin)):
    q = models.InterviewQuestion(
        edudiagno_test_id=getattr(data, "edudiagno_test_id", None),
        question=data.question,
        # Add other fields as needed from InterviewQuestionBase
    )
    db.add(q)
    db.commit()
    db.refresh(q)
    return q

@router.get("/interview-questions", response_model=list[InterviewQuestionOut])
def list_interview_questions(db: Session = Depends(database.get_db), admin=Depends(authorize_admin)):
    return db.query(models.InterviewQuestion).all()

@router.get("/interview-questions/{id}", response_model=InterviewQuestionOut)
def get_interview_question(id: int, db: Session = Depends(database.get_db), admin=Depends(authorize_admin)):
    q = db.query(models.InterviewQuestion).get(id)
    if not q:
        raise HTTPException(404, "InterviewQuestion not found")
    return q

@router.put("/interview-questions/{id}", response_model=InterviewQuestionOut)
def update_interview_question(id: int, data: InterviewQuestionBase, db: Session = Depends(database.get_db), admin=Depends(authorize_admin)):
    q = db.query(models.InterviewQuestion).get(id)
    if not q:
        raise HTTPException(404, "InterviewQuestion not found")
    for k, v in data.dict(exclude_unset=True).items():
        setattr(q, k, v)
    db.commit()
    db.refresh(q)
    return q

@router.delete("/interview-questions/{id}")
def delete_interview_question(id: int, db: Session = Depends(database.get_db), admin=Depends(authorize_admin)):
    q = db.query(models.InterviewQuestion).get(id)
    if not q:
        raise HTTPException(404, "InterviewQuestion not found")
    db.delete(q)
    db.commit()
    return {"ok": True}

@router.post("/interview-questions/{id}/approve")
def approve_interview_question(id: int, approve: bool, db: Session = Depends(database.get_db), admin=Depends(authorize_admin)):
    q = db.query(models.InterviewQuestion).get(id)
    if not q:
        raise HTTPException(404, "InterviewQuestion not found")
    q.is_approved = approve
    db.commit()
    return {"id": id, "is_approved": approve}

# --- JobApplication Endpoints ---
@router.get("/job-applications", response_model=list[JobApplicationOut])
def list_job_applications(db: Session = Depends(database.get_db), admin=Depends(authorize_admin)):
    return db.query(models.JobApplication).all()

@router.get("/job-applications/{id}", response_model=JobApplicationOut)
def get_job_application(id: int, db: Session = Depends(database.get_db), admin=Depends(authorize_admin)):
    app = db.query(models.JobApplication).get(id)
    if not app:
        raise HTTPException(404, "JobApplication not found")
    return app

@router.put("/job-applications/{id}", response_model=JobApplicationOut)
def update_job_application(id: int, data: JobApplicationBase, db: Session = Depends(database.get_db), admin=Depends(authorize_admin)):
    app = db.query(models.JobApplication).get(id)
    if not app:
        raise HTTPException(404, "JobApplication not found")
    for k, v in data.dict(exclude_unset=True).items():
        setattr(app, k, v)
    db.commit()
    db.refresh(app)
    return app

@router.delete("/job-applications/{id}")
def delete_job_application(id: int, db: Session = Depends(database.get_db), admin=Depends(authorize_admin)):
    app = db.query(models.JobApplication).get(id)
    if not app:
        raise HTTPException(404, "JobApplication not found")
    db.delete(app)
    db.commit()
    return {"ok": True}

@router.post("/job-applications/{id}/flag")
def flag_job_application(id: int, flag: bool, db: Session = Depends(database.get_db), admin=Depends(authorize_admin)):
    app = db.query(models.JobApplication).get(id)
    if not app:
        raise HTTPException(404, "JobApplication not found")
    app.is_flagged = flag
    db.commit()
    return {"id": id, "is_flagged": flag}



# --- DSAPoolQuestion Schemas ---

class DSAPoolTestCaseCreate(BaseModel):
    input: str
    expected_output: str

class DSAPoolQuestionCreate(BaseModel):
    title: str
    description: str
    topic: str
    difficulty: str
    time_minutes: int
    test_cases: list[DSAPoolTestCaseCreate] = []

class DSAPoolQuestionUpdate(BaseModel):
    title: Optional[str] = None
    description: Optional[str] = None
    topic: Optional[str] = None
    difficulty: Optional[str] = None
    time_minutes: Optional[int] = None

@router.post("/dsapool-questions")
def create_dsapool_question(data: DSAPoolQuestionCreate, db: Session = Depends(database.get_db), admin=Depends(authorize_admin)):
    stmt = insert(DSAPoolQuestion).values(
        title=data.title,
        description=data.description,
        topic=data.topic,
        difficulty=data.difficulty,
        time_minutes=data.time_minutes,
    ).returning(DSAPoolQuestion.id)
    result = db.execute(stmt)
    question_id = result.scalar()
    # Add test cases
    for tc in data.test_cases:
        db.execute(
            insert(DSAPoolTestCase).values(
                input=tc.input,
                expected_output=tc.expected_output,
                dsa_pool_question_id=question_id
            )
        )
    db.commit()
    # Return the created question with test cases
    stmt = select(DSAPoolQuestion).where(DSAPoolQuestion.id == question_id)
    question = db.execute(stmt).scalar_one_or_none()
    return question

@router.get("/dsapool-questions")
def list_dsapool_questions(
    difficulty: Optional[str] = None,
    search: Optional[str] = None,
    db: Session = Depends(database.get_db),
    admin=Depends(authorize_admin),
):
    query = db.query(DSAPoolQuestion).options(joinedload(DSAPoolQuestion.test_cases))
    if difficulty:
        query = query.filter(DSAPoolQuestion.difficulty == difficulty)
    if search:
        query = query.filter((DSAPoolQuestion.title.ilike(f"%{search}%")) | (DSAPoolQuestion.topic.ilike(f"%{search}%")))
    questions = query.all()
    return questions

@router.get("/dsapool-questions/{question_id}")
def get_dsapool_question(question_id: int, db: Session = Depends(database.get_db), admin=Depends(authorize_admin)):
    stmt = select(DSAPoolQuestion).where(DSAPoolQuestion.id == question_id)
    question = db.execute(stmt).scalar_one_or_none()
    if not question:
        raise HTTPException(404, "DSA Question not found")
    return question

@router.put("/dsapool-questions/{question_id}")
def update_dsapool_question(question_id: int, data: DSAPoolQuestionUpdate, db: Session = Depends(database.get_db), admin=Depends(authorize_admin)):
    update_data = data.dict(exclude_unset=True)
    if not update_data:
        raise HTTPException(400, "No fields to update")
    stmt = (
        update(DSAPoolQuestion)
        .where(DSAPoolQuestion.id == question_id)
        .values(**update_data)
    )
    result = db.execute(stmt)
    db.commit()
    # Return the updated question
    stmt = select(DSAPoolQuestion).where(DSAPoolQuestion.id == question_id)
    question = db.execute(stmt).scalar_one_or_none()
    if not question:
        raise HTTPException(404, "DSA Question not found")
    return question

@router.delete("/dsapool-questions/{question_id}")
def delete_dsapool_question(question_id: int, db: Session = Depends(database.get_db), admin=Depends(authorize_admin)):
    stmt = select(DSAPoolQuestion).where(DSAPoolQuestion.id == question_id)
    question = db.execute(stmt).scalar_one_or_none()
    if not question:
        raise HTTPException(404, "DSA Question not found")
    db.delete(question)
    db.commit()
    return {"ok": True}
# --- DSAPoolTestCase Endpoints ---
@router.post("/dsapool-questions/{question_id}/test-cases")
def add_dsapool_test_case(question_id: int, data: DSAPoolTestCaseCreate, db: Session = Depends(database.get_db), admin=Depends(authorize_admin)):
    stmt = select(DSAPoolQuestion).where(DSAPoolQuestion.id == question_id)
    question = db.execute(stmt).scalar_one_or_none()
    if not question:
        raise HTTPException(404, "DSA Question not found")
    stmt = insert(DSAPoolTestCase).values(
        input=data.input,
        expected_output=data.expected_output,
        dsa_pool_question_id=question_id
    ).returning(DSAPoolTestCase.id)
    result = db.execute(stmt)
    test_case_id = result.scalar()
    db.commit()
    stmt = select(DSAPoolTestCase).where(DSAPoolTestCase.id == test_case_id)
    test_case = db.execute(stmt).scalar_one_or_none()
    return test_case

@router.get("/dsapool-questions/{question_id}/test-cases")
def list_dsapool_test_cases(question_id: int, db: Session = Depends(database.get_db), admin=Depends(authorize_admin)):
    stmt = select(DSAPoolTestCase).where(DSAPoolTestCase.dsa_pool_question_id == question_id)
    result = db.execute(stmt)
    test_cases = result.scalars().all()
    return test_cases

@router.delete("/dsapool-questions/{question_id}/test-cases/{test_case_id}")
def delete_dsapool_test_case(question_id: int, test_case_id: int, db: Session = Depends(database.get_db), admin=Depends(authorize_admin)):
    stmt = select(DSAPoolTestCase).where(DSAPoolTestCase.id == test_case_id, DSAPoolTestCase.dsa_pool_question_id == question_id)
    test_case = db.execute(stmt).scalar_one_or_none()
    if not test_case:
        raise HTTPException(404, "Test case not found")
    db.delete(test_case)
    db.commit()
    return {"ok": True}

# --- EdudiagnoTest Endpoints ---
class EdudiagnoTestCreate(BaseModel):
    title: str
    description: Optional[str] = None
    tech_field: str

@router.delete("/tests/{id}")
def delete_test(id: int, db: Session = Depends(database.get_db), admin=Depends(authorize_admin)):
    test = db.query(models.EdudiagnoTest).filter_by(id=id).first()
    if not test:
        return {"error": "Test not found"}
    db.delete(test)
    db.commit()
    return {"ok": True}
    id: int
    title: str
    description: Optional[str]
    tech_field: str
    created_at: Optional[str]
    updated_at: Optional[str]

@router.post("/tests")
def create_test(data: EdudiagnoTestCreate, db: Session = Depends(database.get_db), admin=Depends(authorize_admin)):
    test = models.EdudiagnoTest(
        title=data.title,
        description=data.description,
        tech_field=data.tech_field,
    )
    db.add(test)
    db.commit()
    db.refresh(test)
    # Ensure datetime fields are returned as ISO strings
    return {
        "id": test.id,
        "title": test.title,
        "description": test.description,
        "tech_field": test.tech_field if test.tech_field is not None else "",
        "created_at": test.created_at.isoformat() if test.created_at else None,
        "updated_at": test.updated_at.isoformat() if test.updated_at else None,
    }

@router.get("/tests")
def list_tests(db: Session = Depends(database.get_db), admin=Depends(authorize_admin)):
    tests = db.query(models.EdudiagnoTest).all()
    return [
        {
            "id": t.id,
            "title": t.title,
            "description": t.description,
            "tech_field": t.tech_field if t.tech_field is not None else "",
            "created_at": t.created_at.isoformat() if t.created_at else None,
            "updated_at": t.updated_at.isoformat() if t.updated_at else None,
        }
        for t in tests
    ]


from app.schemas import CreateQuizOption, CreateQuizQuestion
# --- QuizQuestion Endpoints ---
@router.post("/quiz-questions", status_code=201)
def create_quiz_question(data: CreateQuizQuestion, db: Session = Depends(database.get_db), admin=Depends(authorize_admin)):
    question = models.QuizQuestion(
        edudiagno_test_id=data.edudiagno_test_id,
        description=data.question,
        type=data.type,
        category=data.category,
        time_seconds=data.time_seconds,
        image_url=data.image_url,
    )
    db.add(question)
    db.commit()
    db.refresh(question)
    return {
        "id": question.id,
        "description": question.description,
        "type": question.type,
        "category": question.category,
        "time_seconds": question.time_seconds,
        "image_url": question.image_url,
        "edudiagno_test_id": question.edudiagno_test_id,
    }
# --- QuizOption Endpoints ---
@router.post("/quiz-options", status_code=201)
def create_quiz_option(data: CreateQuizOption, db: Session = Depends(database.get_db), admin=Depends(authorize_admin)):
    question = db.query(models.QuizQuestion).get(data.question_id)
    if not question:
        raise HTTPException(404, "QuizQuestion not found")

    # Enforce 4 options and only one correct for single type
    if question.type == "single":
        existing_options = db.query(models.QuizOption).filter_by(quiz_question_id=data.question_id).all()
        if len(existing_options) >= 4:
            raise HTTPException(400, "Single correct questions must have exactly 4 options.")
        if data.correct:
            already_correct = any(opt.correct for opt in existing_options)
            if already_correct:
                raise HTTPException(400, "Only one option can be marked correct for single correct questions.")

    option = models.QuizOption(
        label=data.label,
        correct=data.correct,
        quiz_question_id=data.question_id
    )
    db.add(option)
    db.commit()
    db.refresh(option)
    return {
        "id": option.id,
        "label": option.label,
        "correct": option.correct,
        "quiz_question_id": option.quiz_question_id
    }