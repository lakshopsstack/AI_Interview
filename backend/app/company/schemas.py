from typing import List, Optional
from pydantic import BaseModel
from pydantic import validator
from datetime import datetime


class RecruiterRegistration(BaseModel):
    name: str
    email: str
    password: str
    phone: str
    industry: str
    country: str
    state: str
    city: str
    zip: str
    address: str


class UpdateRecruiter(BaseModel):
    name: Optional[str] = None
    password: Optional[str] = None
    phone: Optional[str] = None
    designation: Optional[str] = None
    company_name: Optional[str] = None
    industry: Optional[str] = None
    country: Optional[str] = None
    state: Optional[str] = None
    city: Optional[str] = None
    zip: Optional[str] = None
    address: Optional[str] = None
    logo_url: Optional[str] = None
    tagline: Optional[str] = None
    tags: Optional[str] = None
    about_us: Optional[str] = None
    about_us_poster_url: Optional[str] = None
    foundation_year: Optional[int] = None
    website_url: Optional[str] = None
    min_company_size: Optional[int] = None
    max_company_size: Optional[int] = None
    banner_url: Optional[str] = None


class RecruiterLogin(BaseModel):
    email: str
    password: str


class Recruiter(BaseModel):
    id: int
    name: Optional[str]
    email: Optional[str]
    phone: Optional[str]
    designation: Optional[str]
    company_name: Optional[str]
    company_logo: Optional[str]
    website: Optional[str]
    industry: Optional[str]
    min_company_size: Optional[int]
    max_company_size: Optional[int]
    country: Optional[str]
    state: Optional[str]
    city: Optional[str]
    zip: Optional[str]
    address: Optional[str]


class RecruiterSendEmailOtp(BaseModel):
    email: str


class RecruiterVerifyEmailOtp(BaseModel):
    email: str
    otp: str


class CreateAiInterview(BaseModel):
    title: str
    description: str
    department: str
    city: str
    location: str
    type: str
    duration_months: Optional[int] = None
    min_experience: int
    max_experience: int
    currency: Optional[str] = None
    salary_min: Optional[int] = None
    salary_max: Optional[int] = None
    show_salary: bool = False
    key_qualification: str
    requirements: str
    benefits: Optional[str] = None
    status: str


class UpdateAiInterview(BaseModel):
    id: int
    title: Optional[str] = None
    description: Optional[str] = None
    department: Optional[str] = None
    city: Optional[str] = None
    location: Optional[str] = None
    type: Optional[str] = None
    duration_months: Optional[int] = None
    min_experience: Optional[int] = None
    max_experience: Optional[int] = None
    currency: Optional[str] = None
    salary_min: Optional[int] = None
    salary_max: Optional[int] = None
    show_salary: Optional[bool] = None
    key_qualification: Optional[str] = None
    requirements: Optional[str] = None
    benefits: Optional[str] = None
    status: Optional[str] = None
    quiz_time_minutes: Optional[int] = None


class CreateInterviewQuestion(BaseModel):
    question: str
    question_type: str
    order_number: int
    ai_interviewed_job_id: int


class UpdateInterviewQuestion(BaseModel):
    id: int
    question: Optional[str] = None
    question_type: Optional[str] = None


class CreateInterviewQuestionResponse(BaseModel):
    question_id: int
    answer: str


class CreateInterview(BaseModel):
    first_name: str
    last_name: str
    email: str
    phone: Optional[str] = None
    work_experience: Optional[int] = None
    education: Optional[str] = None
    skills: Optional[str] = None
    location: Optional[str] = None
    linkedin_url: Optional[str] = None
    portfolio_url: Optional[str] = None
    resume_text: Optional[str] = None
    job_id: int


class UpdateInterview(BaseModel):
    work_experience: Optional[int] = None
    education: Optional[str] = None
    skills: Optional[str] = None
    location: Optional[str] = None
    linkedin_url: Optional[str] = None
    portfolio_url: Optional[str] = None
    resume_url: Optional[str] = None
    resume_text: Optional[str] = None
    resume_match_score: Optional[int] = None
    resume_match_feedback: Optional[str] = None
    overall_score: Optional[int] = None
    feedback: Optional[str] = None


class VerifyOtpCandidate(BaseModel):
    otp: str = None


class TextToSpeech(BaseModel):
    text: str


class GenerateAiInterviewDescription(BaseModel):
    title: str
    department: str
    location: str
    key_qualification: str
    min_experience: str
    max_experience: str


class GenerateAiInterviewRequirement(BaseModel):
    title: str
    department: str
    location: str
    key_qualification: str
    min_experience: str
    max_experience: str
    keywords: str


class UpdateInterviewQuestionResponse(BaseModel):
    question_order: int
    answer: str


class CreateDSATestCase(BaseModel):
    input: str
    expected_output: str
    dsa_question_id: Optional[int] = None


class UpdateDSATestCase(BaseModel):
    input: Optional[str] = None
    expected_output: Optional[str] = None
    id: int


class CreateDSAQuestion(BaseModel):
    title: str
    description: str
    difficulty: str
    time_minutes: Optional[int] = None
    ai_interviewed_job_id: int
    test_cases: List[CreateDSATestCase]


class UpdateDSAQuestion(BaseModel):
    id: int
    title: Optional[str] = None
    description: Optional[str] = None
    difficulty: Optional[str] = None
    time_minutes: Optional[int] = None


class CreateDSAResponse(BaseModel):
    language: str
    code: str
    question_id: int


class UpdateDSAResponse(BaseModel):
    code: str
    id: int


class CreateQuizOption(BaseModel):
    label: str
    correct: bool
    quiz_question_id: int


class UpdateQuizOption(BaseModel):
    label: Optional[str] = None
    correct: Optional[bool] = None
    id: int


class CreateQuizResponse(BaseModel):
    question_id: int
    option_id: int


# --- Job Schemas ---
class JobCreate(BaseModel):
    company_id: int
    job_title: Optional[str] = None
    job_role: Optional[str] = None
    job_location: Optional[str] = None
    job_locality: Optional[str] = None
    work_mode: Optional[str] = None
    min_work_experience: Optional[int] = None
    max_work_experience: Optional[int] = None
    min_salary_per_month: Optional[int] = None
    max_salary_per_month: Optional[int] = None
    additional_benefits: Optional[str] = None
    skills: Optional[str] = None
    qualification: Optional[str] = None
    gender_preference: Optional[str] = None
    candidate_prev_industry: Optional[str] = None
    languages: Optional[str] = None
    education_degree: Optional[str] = None
    job_description: Optional[str] = None


class JobUpdate(BaseModel):
    job_title: Optional[str] = None
    job_role: Optional[str] = None
    job_location: Optional[str] = None
    job_locality: Optional[str] = None
    work_mode: Optional[str] = None
    min_work_experience: Optional[int] = None
    max_work_experience: Optional[int] = None
    min_salary_per_month: Optional[int] = None
    max_salary_per_month: Optional[int] = None
    additional_benefits: Optional[str] = None
    skills: Optional[str] = None
    qualification: Optional[str] = None
    gender_preference: Optional[str] = None
    candidate_prev_industry: Optional[str] = None
    languages: Optional[str] = None
    education_degree: Optional[str] = None
    job_description: Optional[str] = None


class CandidateInviteRequest(BaseModel):
    candidates: list[dict]
    # Each dict should have at least 'email', and optionally 'firstname' and 'lastname'

    @validator('candidates', pre=True)
    def validate_candidates(cls, v):
        if not isinstance(v, list):
            raise ValueError('candidates must be a list')
        for c in v:
            if 'email' not in c:
                raise ValueError('Each candidate must have an email')
        return v


class CompanyBase(BaseModel):
    name: Optional[str] = None
    email: Optional[str] = None
    phone: Optional[str] = None
    industry: Optional[str] = None
    country: Optional[str] = None
    state: Optional[str] = None
    city: Optional[str] = None
    zip: Optional[str] = None
    address: Optional[str] = None
    logo_url: Optional[str] = None
    tagline: Optional[str] = None
    tags: Optional[str] = None
    about_us: Optional[str] = None
    about_us_poster_url: Optional[str] = None
    foundation_year: Optional[int] = None
    website_url: Optional[str] = None
    min_company_size: Optional[int] = None
    max_company_size: Optional[int] = None
    banner_url: Optional[str] = None
    verified: Optional[bool] = None
    # Admin fields
    is_suspended: Optional[bool] = None
    is_deleted: Optional[bool] = None
    admin_notes: Optional[str] = None


class CompanyOut(CompanyBase):
    id: int
    created_at: Optional[datetime] = None
    updated_at: Optional[datetime] = None


class JobBase(BaseModel):
    company_id: int
    job_title: Optional[str] = None
    job_role: Optional[str] = None
    job_location: Optional[str] = None
    job_locality: Optional[str] = None
    work_mode: Optional[str] = None
    min_work_experience: Optional[int] = None
    max_work_experience: Optional[int] = None
    min_salary_per_month: Optional[int] = None
    max_salary_per_month: Optional[int] = None
    additional_benefits: Optional[str] = None
    skills: Optional[str] = None
    qualification: Optional[str] = None
    gender_preference: Optional[str] = None
    candidate_prev_industry: Optional[str] = None
    languages: Optional[str] = None
    education_degree: Optional[str] = None
    job_description: Optional[str] = None
    # Admin fields
    is_featured: Optional[bool] = None
    is_approved: Optional[bool] = None
    is_closed: Optional[bool] = None
    is_deleted: Optional[bool] = None
    admin_notes: Optional[str] = None


class JobOut(JobBase):
    id: int
    posted_at: Optional[str] = None


class AiInterviewedJobBase(BaseModel):
    title: Optional[str] = None
    description: Optional[str] = None
    department: Optional[str] = None
    city: Optional[str] = None
    location: Optional[str] = None
    type: Optional[str] = None
    duration_months: Optional[int] = None
    min_experience: Optional[int] = None
    max_experience: Optional[int] = None
    currency: Optional[str] = None
    salary_min: Optional[int] = None
    salary_max: Optional[int] = None
    show_salary: Optional[bool] = None
    key_qualification: Optional[str] = None
    requirements: Optional[str] = None
    benefits: Optional[str] = None
    status: Optional[str] = None
    quiz_time_minutes: Optional[int] = None
    # Admin fields
    is_featured: Optional[bool] = None
    is_approved: Optional[bool] = None
    is_closed: Optional[bool] = None
    is_deleted: Optional[bool] = None
    admin_notes: Optional[str] = None


class AiInterviewedJobOut(AiInterviewedJobBase):
    id: int
    created_at: Optional[datetime] = None
    updated_at: Optional[datetime] = None
