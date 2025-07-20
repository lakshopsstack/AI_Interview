from fastapi import APIRouter, Depends, Request, Query, UploadFile, File, HTTPException
from sqlalchemy.orm import Session, selectinload
from sqlalchemy import select, insert, update, delete, or_, func
from datetime import datetime, timedelta

from app import database
from app.models import (
    HigherEducation, HSCEducation, SSCEducation, EmploymentDetail, Internship, Project, Certification, ClubAndCommittee, CompetitiveExam, AcademicAchievement, JobSeeker, Job, JobApplication, Company
)
from app.job_seeker import schemas
from app.lib.security import hash_password, verify_password
from app.lib.errors import CustomException
from app.config import settings
from app.job_seeker.dependencies import authorize_jobseeker
from app.job_seeker.services import upload_resume_to_gcs
from app.dependencies.authorization import authorize_company
from app.lib import jwt as app_jwt

router = APIRouter()

@router.post("")
def create_jobseeker(jobseeker: schemas.JobSeekerCreate, db: Session = Depends(database.get_db)):
    jobseeker_data = jobseeker.dict()
    # Normalize email to lowercase
    if "email" in jobseeker_data and jobseeker_data["email"]:
        jobseeker_data["email"] = jobseeker_data["email"].lower()
    password_hash = hash_password(jobseeker_data.pop("password"))
    jobseeker_data["password_hash"] = password_hash
    # Only keep fields that are actual columns in the JobSeeker model
    valid_columns = [
        'firstname', 'lastname', 'gender', 'date_of_birth', 'password_hash', 'email', 'email_otp', 'email_otp_expiry',
        'email_verified', 'country_code', 'phone', 'phone_otp', 'phone_otp_expiry', 'phone_verified', 'dob',
        'current_location', 'home_town', 'country', 'career_preference_internships', 'career_preference_jobs',
        'min_duration_months', 'preferred_work_location', 'work_experience_yrs', 'updates_subscription',
        'key_skills', 'languages', 'profile_summary', 'awards_and_accomplishments', 'resume_url', 'profile_picture_url'
    ]
    filtered_data = {k: v for k, v in jobseeker_data.items() if k in valid_columns}
    stmt = insert(JobSeeker).values(**filtered_data).returning(JobSeeker)
    result = db.execute(stmt)
    db.commit()
    db_jobseeker = result.mappings().first()
    if db_jobseeker is None:
        raise CustomException('Failed to create JobSeeker', code=500)
    return db_jobseeker

@router.get('')
def get_jobseeker(jobseeker_id: int = Query(...), db: Session = Depends(database.get_db)):
    stmt = select(JobSeeker).where(JobSeeker.id == jobseeker_id)
    jobseeker = db.scalars(stmt).first()
    if not jobseeker:
        raise CustomException('JobSeeker not found', code=404)
    return serialize_jobseeker(jobseeker)

@router.get('/all')
def list_jobseekers(db: Session = Depends(database.get_db)):
    stmt = select(JobSeeker)
    jobseekers = db.scalars(stmt).all()
    return [serialize_jobseeker(js) for js in jobseekers]

@router.put('')
def update_jobseeker(jobseeker_id: int = Query(...), jobseeker: schemas.JobSeekerUpdate = None, db: Session = Depends(database.get_db)):
    stmt = select(JobSeeker).where(JobSeeker.id == jobseeker_id)
    db_jobseeker = db.scalars(stmt).first()
    if not db_jobseeker:
        raise CustomException('JobSeeker not found', code=404)
    data = jobseeker.dict(exclude_unset=True)
    # Normalize email to lowercase if present
    if "email" in data and data["email"]:
        data["email"] = data["email"].lower()
    # Simple fields
    simple_fields = [
        'firstname', 'lastname', 'email', 'phone', 'country_code', 'work_experience_yrs', 'email_verified', 'phone_verified',
        'profile_picture_url', 'gender', 'date_of_birth', 'current_location', 'home_town', 'country', 'key_skills', 'languages',
        'profile_summary', 'resume_url', 'preferred_work_location',
        'career_preference_jobs', 'career_preference_internships', 'min_duration_months', 'awards_and_accomplishments', 'updates_subscription'
    ]
    for k in simple_fields:
        if k in data:
            setattr(db_jobseeker, k, data[k])

    # --- Relationships ---
    # Higher Educations (one-to-many)
    if 'higher_educations' in data and data['higher_educations'] is not None:
        db.execute(delete(HigherEducation).where(HigherEducation.job_seeker_id == db_jobseeker.id))
        if data['higher_educations']:
            db.execute(
                insert(HigherEducation),
                [dict(job_seeker_id=db_jobseeker.id, **edu) for edu in data['higher_educations']]
            )

    # HSC Education (one-to-one)
    if 'hsc_education' in data and data['hsc_education'] is not None:
        hsc = db.execute(select(HSCEducation).where(HSCEducation.job_seeker_id == db_jobseeker.id)).scalar_one_or_none()
        if hsc:
            db.execute(
                update(HSCEducation)
                .where(HSCEducation.job_seeker_id == db_jobseeker.id)
                .values(**data['hsc_education'])
            )
        else:
            db.execute(insert(HSCEducation), [{"job_seeker_id": db_jobseeker.id, **data['hsc_education']}])

    # SSC Education (one-to-one)
    if 'ssc_education' in data and data['ssc_education'] is not None:
        ssc = db.execute(select(SSCEducation).where(SSCEducation.job_seeker_id == db_jobseeker.id)).scalar_one_or_none()
        if ssc:
            db.execute(
                update(SSCEducation)
                .where(SSCEducation.job_seeker_id == db_jobseeker.id)
                .values(**data['ssc_education'])
            )
        else:
            db.execute(insert(SSCEducation), [{"job_seeker_id": db_jobseeker.id, **data['ssc_education']}])

    # Employment Details (one-to-many)
    if 'employment_details' in data and data['employment_details'] is not None:
        db.execute(delete(EmploymentDetail).where(EmploymentDetail.job_seeker_id == db_jobseeker.id))
        if data['employment_details']:
            db.execute(
                insert(EmploymentDetail),
                [dict(job_seeker_id=db_jobseeker.id, **emp) for emp in data['employment_details']]
            )

    # Internships (one-to-many)
    if 'internships' in data and data['internships'] is not None:
        db.execute(delete(Internship).where(Internship.job_seeker_id == db_jobseeker.id))
        if data['internships']:
            db.execute(
                insert(Internship),
                [dict(job_seeker_id=db_jobseeker.id, **intern) for intern in data['internships']]
            )

    # Projects (one-to-many)
    if 'projects' in data and data['projects'] is not None:
        db.execute(delete(Project).where(Project.job_seeker_id == db_jobseeker.id))
        if data['projects']:
            db.execute(
                insert(Project),
                [dict(job_seeker_id=db_jobseeker.id, **proj) for proj in data['projects']]
            )

    # Certifications (one-to-many)
    if 'certifications' in data and data['certifications'] is not None:
        db.execute(delete(Certification).where(Certification.job_seeker_id == db_jobseeker.id))
        if data['certifications']:
            db.execute(
                insert(Certification),
                [dict(job_seeker_id=db_jobseeker.id, **cert) for cert in data['certifications']]
            )

    # Clubs and Committees (one-to-many)
    if 'clubs_and_committees' in data and data['clubs_and_committees'] is not None:
        db.execute(delete(ClubAndCommittee).where(ClubAndCommittee.job_seeker_id == db_jobseeker.id))
        if data['clubs_and_committees']:
            db.execute(
                insert(ClubAndCommittee),
                [dict(job_seeker_id=db_jobseeker.id, **club) for club in data['clubs_and_committees']]
            )

    # Competitive Exams (one-to-many)
    if 'competitive_exams' in data and data['competitive_exams'] is not None:
        db.execute(delete(CompetitiveExam).where(CompetitiveExam.job_seeker_id == db_jobseeker.id))
        if data['competitive_exams']:
            db.execute(
                insert(CompetitiveExam),
                [dict(job_seeker_id=db_jobseeker.id, **exam) for exam in data['competitive_exams']]
            )

    # Academic Achievements (one-to-many)
    if 'academic_achievements' in data and data['academic_achievements'] is not None:
        db.execute(delete(AcademicAchievement).where(AcademicAchievement.job_seeker_id == db_jobseeker.id))
        if data['academic_achievements']:
            db.execute(
                insert(AcademicAchievement),
                [dict(job_seeker_id=db_jobseeker.id, **ach) for ach in data['academic_achievements']]
            )

    db.commit()
    db.refresh(db_jobseeker)
    return serialize_jobseeker(db_jobseeker)

@router.delete('')
def delete_jobseeker(jobseeker_id: int = Query(...), db: Session = Depends(database.get_db)):
    stmt = select(JobSeeker).where(JobSeeker.id == jobseeker_id)
    db_jobseeker = db.scalars(stmt).first()
    if not db_jobseeker:
        raise CustomException('JobSeeker not found', code=404)
    db.delete(db_jobseeker)
    db.commit()
    return {"ok": True}

@router.post("/login")
def login_jobseeker(login_data: schemas.JobSeekerLogin, db: Session = Depends(database.get_db)):
    # Normalize email to lowercase for login
    normalized_email = login_data.email.lower() if login_data.email else login_data.email
    stmt = (
        select(JobSeeker)
        .where(JobSeeker.email == normalized_email)
        .options(
            selectinload(JobSeeker.higher_educations),
            selectinload(JobSeeker.hsc_education),
            selectinload(JobSeeker.ssc_education),
            selectinload(JobSeeker.employment_details),
            selectinload(JobSeeker.internships),
            selectinload(JobSeeker.projects),
            selectinload(JobSeeker.certifications),
            selectinload(JobSeeker.clubs_and_committees),
            selectinload(JobSeeker.competitive_exams),
            selectinload(JobSeeker.academic_achievements),
        )
    )
    jobseeker = db.scalars(stmt).first()
    if not jobseeker or not verify_password(login_data.password, jobseeker.password_hash):
        raise CustomException('Invalid credentials', code=401)
    # Generate JWT token
    to_encode = {"sub": str(jobseeker.id), "exp": datetime.utcnow() + timedelta(days=1)}
    token = app_jwt.encode(to_encode)
    from fastapi.responses import JSONResponse
    res = JSONResponse(content=serialize_jobseeker(jobseeker))
    res.headers["Authorization"] = f"Bearer {token}"
    return res

@router.get("/verify-login")
def verify_login_jobseeker(current_job_seeker=Depends(authorize_jobseeker), db: Session = Depends(database.get_db)):
    # Eagerly load relationships for serialization
    stmt = (
        select(JobSeeker)
        .where(JobSeeker.id == current_job_seeker.id)
        .options(
            selectinload(JobSeeker.higher_educations),
            selectinload(JobSeeker.hsc_education),
            selectinload(JobSeeker.ssc_education),
            selectinload(JobSeeker.employment_details),
            selectinload(JobSeeker.internships),
            selectinload(JobSeeker.projects),
            selectinload(JobSeeker.certifications),
            selectinload(JobSeeker.clubs_and_committees),
            selectinload(JobSeeker.competitive_exams),
            selectinload(JobSeeker.academic_achievements),
        )
    )
    jobseeker = db.scalars(stmt).first()
    return serialize_jobseeker(jobseeker)

@router.post("/upload/resume")
def upload_resume(
    jobseeker_id: int = Query(...),
    file: UploadFile = File(...),
    current_jobseeker = Depends(authorize_jobseeker),
    db: Session = Depends(database.get_db),
):
    # --- Auth: Only the jobseeker can upload their own resume ---
    if int(current_jobseeker.id) != int(jobseeker_id):
        raise CustomException("Unauthorized to upload resume for this user", code=403)

    # --- Upload to GCS ---
    old_resume_url = None
    jobseeker = db.query(JobSeeker).filter(JobSeeker.id == jobseeker_id).first()
    if not jobseeker:
        raise CustomException('JobSeeker not found', code=404)
    old_resume_url = jobseeker.resume_url
    public_url = upload_resume_to_gcs(file, jobseeker_id, old_resume_url)

    # --- Update JobSeeker's resume_url ---
    jobseeker.resume_url = public_url
    db.commit()
    db.refresh(jobseeker)
    return {"resume_url": public_url}

@router.post("/upload/profile-picture")
def upload_profile_picture(
    jobseeker_id: int = Query(...),
    file: UploadFile = File(...),
    current_jobseeker = Depends(authorize_jobseeker),
    db: Session = Depends(database.get_db),
):
    # --- Auth: Only the jobseeker can upload their own profile picture ---
    if int(current_jobseeker.id) != int(jobseeker_id):
        raise CustomException("Unauthorized to upload profile picture for this user", code=403)

    # --- Upload to GCS ---
    jobseeker = db.query(JobSeeker).filter(JobSeeker.id == jobseeker_id).first()
    if not jobseeker:
        raise CustomException('JobSeeker not found', code=404)
    old_profile_picture_url = jobseeker.profile_picture_url
    from app.job_seeker.services import upload_profile_picture_to_gcs
    public_url = upload_profile_picture_to_gcs(file, jobseeker_id, old_profile_picture_url)

    # --- Update JobSeeker's profile_picture_url ---
    jobseeker.profile_picture_url = public_url
    db.commit()
    db.refresh(jobseeker)
    return {"profile_picture_url": public_url}

@router.get('/jobs')
def list_jobs_for_jobseeker(
    db: Session = Depends(database.get_db),
    skip: int = Query(0, ge=0),
    limit: int = Query(20, ge=1, le=100),
    search: str = Query(None),
    location: str = Query(None),
    work_mode: str = Query(None),
    min_exp: int = Query(None),
    max_exp: int = Query(None),
    min_salary: int = Query(None),
    max_salary: int = Query(None),
    company_id: int = Query(None),
):
    stmt = select(Job)
    filters = []

    if search:
        filters.append(
            or_(
                Job.job_title.ilike(f"%{search}%"),
                Job.job_role.ilike(f"%{search}%"),
                Job.job_location.ilike(f"%{search}%"),
                Job.work_mode.ilike(f"%{search}%")
            )
        )
    if location:
        filters.append(Job.job_location.ilike(f"%{location}%"))
    if work_mode:
        filters.append(func.lower(Job.work_mode) == work_mode.lower())
    if min_exp is not None:
        filters.append(Job.min_work_experience >= min_exp)
    if max_exp is not None:
        filters.append(Job.max_work_experience <= max_exp)
    if min_salary is not None:
        filters.append(Job.min_salary_per_month >= min_salary)
    if max_salary is not None:
        filters.append(Job.max_salary_per_month <= max_salary)
    if company_id is not None:
        filters.append(Job.company_id == company_id)

    if filters:
        stmt = stmt.where(*filters)
    stmt = stmt.offset(skip).limit(limit)
    jobs = db.scalars(stmt).all()
    return {"jobs": jobs, "skip": skip, "limit": limit}

@router.get('/job')
def get_job_for_jobseeker(job_id: int = Query(...), job_seeker_id: int = Query(None), db: Session = Depends(database.get_db)):
    stmt = select(Job).where(Job.id == job_id)
    job = db.scalars(stmt).first()
    if not job:
        raise HTTPException(status_code=404, detail="Job not found")
    applied = False
    if job_seeker_id is not None:
        from app.models import JobApplication
        exists_stmt = select(JobApplication).where(JobApplication.job_id == job_id, JobApplication.job_seeker_id == job_seeker_id)
        exists = db.scalars(exists_stmt).first()
        if exists:
            applied = True
    return {"job": job, "applied": applied}

@router.post('/job/apply')
def apply_to_job(job_id: int = Query(...), job_seeker_id: int = Query(...), db: Session = Depends(database.get_db)):
    from app.models import JobApplication
    # Check if job exists
    stmt = select(Job).where(Job.id == job_id)
    job = db.scalars(stmt).first()
    if not job:
        raise HTTPException(status_code=404, detail="Job not found")
    # Check if already applied
    exists_stmt = select(JobApplication).where(JobApplication.job_id == job_id, JobApplication.job_seeker_id == job_seeker_id)
    exists = db.scalars(exists_stmt).first()
    if exists:
        raise HTTPException(status_code=400, detail="Already applied to this job")
    # Create application
    insert_stmt = insert(JobApplication).values(job_id=job_id, job_seeker_id=job_seeker_id).returning(JobApplication.id)
    result = db.execute(insert_stmt)
    db.commit()
    application_id = result.scalar()
    return {"applied": True, "application_id": application_id}

@router.get('/companies')
def list_companies_for_jobseeker(
    db: Session = Depends(database.get_db),
    search: str = Query(None)
):
    stmt = select(Company)
    if search:
        stmt = stmt.where(
            or_(
                Company.name.ilike(f"%{search}%"),
                Company.industry.ilike(f"%{search}%"),
                Company.city.ilike(f"%{search}%")
            )
        )
    companies = db.scalars(stmt).all()
    return [
        {
            "id": c.id,
            "name": c.name,
            "companyLogo": getattr(c, "company_logo", None) or getattr(c, "logo_url", None),
            "website": c.website,
            "industry": c.industry,
            "address": c.address,
            "city": c.city,
            "state": c.state,
            "country": c.country,
            "description": getattr(c, "description", None),
        }
        for c in companies
    ]

@router.get('/company/{company_id}')
def get_company_for_jobseeker(company_id: int, db: Session = Depends(database.get_db)):
    c = db.get(Company, company_id)
    if not c:
        raise HTTPException(status_code=404, detail="Company not found")
    return {
        "id": c.id,
        "name": c.name,
        "companyLogo": getattr(c, "company_logo", None) or getattr(c, "logo_url", None),
        "bannerUrl": getattr(c, "banner_url", None),
        "tagline": getattr(c, "tagline", None),
        "aboutUs": getattr(c, "about_us", None),
        "aboutUsPosterUrl": getattr(c, "about_us_poster_url", None),
        "website": c.website or getattr(c, "website_url", None),
        "industry": c.industry,
        "minCompanySize": c.min_company_size,
        "maxCompanySize": c.max_company_size,
        "address": c.address,
        "city": c.city,
        "state": c.state,
        "country": c.country,
        "zip": c.zip,
        "email": c.email,
        "phone": c.phone,
        "rating": c.rating,
        "ratingsCount": c.ratings_count,
        "tags": c.tags,
        "foundationYear": c.foundation_year,
        "verified": c.verified,
        "createdAt": c.created_at.isoformat() if c.created_at else None,
        "updatedAt": c.updated_at.isoformat() if c.updated_at else None,
    }

@router.get('/applied-jobs')
def list_applied_jobs_for_jobseeker(job_seeker_id: int = Query(...), db: Session = Depends(database.get_db)):
    from app.models import JobApplication, Job
    stmt = select(JobApplication).where(JobApplication.job_seeker_id == job_seeker_id)
    applications = db.scalars(stmt).all()
    job_ids = [a.job_id for a in applications]
    if not job_ids:
        return []
    jobs_stmt = select(Job).where(Job.id.in_(job_ids))
    jobs = db.scalars(jobs_stmt).all()
    # Optionally, return application status as well
    job_id_to_status = {a.job_id: a.status for a in applications}
    result = []
    for job in jobs:
        job_dict = job.__dict__.copy()
        job_dict['application_status'] = job_id_to_status.get(job.id, None)
        result.append(job_dict)
    return result

@router.get('/profile-completion')
def get_profile_completion(job_seeker_id: int = Query(...), db: Session = Depends(database.get_db)):
    stmt = select(JobSeeker).where(JobSeeker.id == job_seeker_id)
    jobseeker = db.scalars(stmt).first()
    if not jobseeker:
        raise CustomException('JobSeeker not found', code=404)
    # Define required fields for profile completion
    required_fields = [
        ("profile_picture_url", "Profile Picture"),
        ("firstname", "First Name"),
        ("lastname", "Last Name"),
        ("email", "Email"),
        ("phone", "Phone Number"),
        ("country_code", "Country Code"),
        ("work_experience_yrs", "Work Experience"),
        ("profile_summary", "Profile Summary"),
        ("resume_url", "Resume"),
        ("key_skills", "Key Skills"),
        ("languages", "Languages"),
        ("current_location", "Current Location"),
        ("education", "Education"),
    ]
    # Check which fields are missing
    missing = []
    filled = 0
    for field, label in required_fields:
        value = getattr(jobseeker, field, None)
        if field == "education":
            # Check higher_educations, hsc_education, or ssc_education
            if not (getattr(jobseeker, "higher_educations", None) or getattr(jobseeker, "hsc_education", None) or getattr(jobseeker, "ssc_education", None)):
                missing.append(label)
            else:
                filled += 1
        elif not value or (isinstance(value, str) and not value.strip()):
            missing.append(label)
        else:
            filled += 1
    percent = int((filled / len(required_fields)) * 100)
    return {"completion": percent, "missing_fields": missing}

def serialize_jobseeker(jobseeker):
    return {
        "id": jobseeker.id,
        "firstname": jobseeker.firstname,
        "lastname": jobseeker.lastname,
        "email": jobseeker.email,
        "phone": jobseeker.phone,
        "country_code": jobseeker.country_code,
        "work_experience_yrs": jobseeker.work_experience_yrs,
        "email_verified": jobseeker.email_verified,
        "phone_verified": jobseeker.phone_verified,
        "profile_picture_url": getattr(jobseeker, "profile_picture_url", None),
        "gender": getattr(jobseeker, "gender", None),
        "date_of_birth": str(getattr(jobseeker, "date_of_birth", "") or ""),
        "current_location": getattr(jobseeker, "current_location", None),
        "home_town": getattr(jobseeker, "home_town", None),
        "country": getattr(jobseeker, "country", None),
        "higher_educations": [
            {
                "id": he.id,
                "qualification": he.qualification,
                "course_name": he.course_name,
                "specialization": he.specialization,
                "college_name": he.college_name,
                "grading_system": he.grading_system,
                "grading_system_value": he.grading_system_value,
                "starting_year": he.starting_year,
                "passing_year": he.passing_year,
                "course_type": he.course_type,
            }
            for he in (getattr(jobseeker, "higher_educations", []) or [])
        ],
        "hsc_education": (
            {
                "id": jobseeker.hsc_education.id,
                "examination_board": jobseeker.hsc_education.examination_board,
                "medium_of_study": jobseeker.hsc_education.medium_of_study,
                "actual_percentage": jobseeker.hsc_education.actual_percentage,
                "passing_year": jobseeker.hsc_education.passing_year,
            }
            if getattr(jobseeker, "hsc_education", None) else None
        ),
        "ssc_education": (
            {
                "id": jobseeker.ssc_education.id,
                "examination_board": jobseeker.ssc_education.examination_board,
                "medium_of_study": jobseeker.ssc_education.medium_of_study,
                "actual_percentage": jobseeker.ssc_education.actual_percentage,
                "passing_year": jobseeker.ssc_education.passing_year,
            }
            if getattr(jobseeker, "ssc_education", None) else None
        ),
        "key_skills": getattr(jobseeker, "key_skills", None),
        "languages": getattr(jobseeker, "languages", None),
        "profile_summary": getattr(jobseeker, "profile_summary", None),
        "resume_url": getattr(jobseeker, "resume_url", None),
        "last_updated_time": str(getattr(jobseeker, "updated_at", "") or ""),
        "employment_details": [
            {
                "id": emp.id,
                "company_name": emp.company_name,
                "designation": emp.designation,
                "starting_month": emp.starting_month,
                "starting_year": emp.starting_year,
                "ending_month": emp.ending_month,
                "ending_year": emp.ending_year,
                "is_currently_working": emp.is_currently_working,
                "work_description": emp.work_description,
                "experience_years": emp.experience_years,
                "experience_months": emp.experience_months,
            }
            for emp in (getattr(jobseeker, "employment_details", []) or [])
        ],
        "internships": [
            {
                "id": intern.id,
                "company_name": intern.company_name,
                "starting_month": intern.starting_month,
                "starting_year": intern.starting_year,
                "ending_month": intern.ending_month,
                "ending_year": intern.ending_year,
                "project_name": intern.project_name,
                "work_description": intern.work_description,
                "key_skills": intern.key_skills,
                "project_url": intern.project_url,
            }
            for intern in (getattr(jobseeker, "internships", []) or [])
        ],
        "projects": [
            {
                "id": p.id,
                "project_name": p.project_name,
                "starting_month": p.starting_month,
                "starting_year": p.starting_year,
                "ending_month": p.ending_month,
                "ending_year": p.ending_year,
                "project_description": p.project_description,
                "key_skills": p.key_skills,
                "project_url": p.project_url,
            }
            for p in (getattr(jobseeker, "projects", []) or [])
        ],
        "certifications": [
            {
                "id": c.id,
                "certification_name": c.certification_name,
                "certification_provider": c.certification_provider,
                "completion_id": c.completion_id,
                "certification_url": c.certification_url,
                "starting_month": c.starting_month,
                "starting_year": c.starting_year,
                "ending_month": c.ending_month,
                "ending_year": c.ending_year,
                "certificate_expires": c.certificate_expires,
            }
            for c in (getattr(jobseeker, "certifications", []) or [])
        ],
        "clubs_and_committees": [
            {
                "id": club.id,
                "committee_name": club.committee_name,
                "position": club.position,
                "starting_month": club.starting_month,
                "starting_year": club.starting_year,
                "ending_month": club.ending_month,
                "ending_year": club.ending_year,
                "is_currently_working": club.is_currently_working,
                "responsibility_description": club.responsibility_description,
            }
            for club in (getattr(jobseeker, "clubs_and_committees", []) or [])
        ],
        "competitive_exams": [
            {
                "id": exam.id,
                "exam_label": exam.exam_label,
                "score": exam.score,
            }
            for exam in (getattr(jobseeker, "competitive_exams", []) or [])
        ],
        "academic_achievements": [
            {
                "id": ach.id,
                "qualification": ach.qualification,
                "achievements": ach.achievements,
            }
            for ach in (getattr(jobseeker, "academic_achievements", []) or [])
        ],
        "preferred_work_location": getattr(jobseeker, "preferred_work_location", None),
        "career_preference_jobs": getattr(jobseeker, "career_preference_jobs", None),
        "career_preference_internships": getattr(jobseeker, "career_preference_internships", None),
        "min_duration_months": getattr(jobseeker, "min_duration_months", None),
        "awards_and_accomplishments": getattr(jobseeker, "awards_and_accomplishments", None),
        "updates_subscription": getattr(jobseeker, "updates_subscription", None),
    }