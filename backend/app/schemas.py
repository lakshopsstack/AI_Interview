from typing import List, Optional
from pydantic import BaseModel
from pydantic import validator


class RecruiterRegistration(BaseModel):
    name: str
    email: str
    password: str
    phone: str
    designation: str
    company_name: str
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
    job_id: int


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
    job_id: int
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



# Quiz question types: "single", "multiple", "boolean"
class CreateQuizQuestion(BaseModel):
    edudiagno_test_id: int
    question: str
    type: str  # "single", "multiple", "boolean"
    category: Optional[str] = None
    time_seconds: Optional[int] = None
    image_url: Optional[str] = None

class CreateQuizOption(BaseModel):
    label: str
    correct: bool
    question_id: int


class UpdateQuizOption(BaseModel):
    label: Optional[str] = None
    correct: Optional[bool] = None
    id: int


class CreateQuizResponse(BaseModel):
    question_id: int
    option_id: int


class JobApplicationBase(BaseModel):
    job_seeker_id: Optional[int] = None
    job_id: Optional[int] = None
    status: Optional[str] = None
    resume_url: Optional[str] = None
    applied_at: Optional[str] = None
    # Admin fields
    is_flagged: Optional[bool] = None
    admin_notes: Optional[str] = None


class JobApplicationOut(JobApplicationBase):
    id: int
