from pydantic import BaseModel
from typing import Optional, List, Dict, Any

# --- Nested and Related Schemas ---
class HSCEducation(BaseModel):
    id: Optional[int] = None
    examination_board: Optional[str] = None
    medium_of_study: Optional[str] = None
    actual_percentage: Optional[str] = None
    passing_year: Optional[int] = None

class SSCEducation(BaseModel):
    id: Optional[int] = None
    examination_board: Optional[str] = None
    medium_of_study: Optional[str] = None
    actual_percentage: Optional[str] = None
    passing_year: Optional[int] = None

class HigherEducation(BaseModel):
    id: Optional[int] = None
    qualification: Optional[str] = None
    course_name: Optional[str] = None
    specialization: Optional[str] = None
    college_name: Optional[str] = None
    grading_system: Optional[str] = None
    grading_system_value: Optional[str] = None
    starting_year: Optional[int] = None
    passing_year: Optional[int] = None
    course_type: Optional[str] = None

class EmploymentDetail(BaseModel):
    id: Optional[int] = None
    experience_years: Optional[int] = None
    experience_months: Optional[int] = None
    company_name: Optional[str] = None
    designation: Optional[str] = None
    starting_month: Optional[int] = None
    starting_year: Optional[int] = None
    ending_month: Optional[int] = None
    ending_year: Optional[int] = None
    is_currently_working: Optional[bool] = None
    work_description: Optional[str] = None

class Internship(BaseModel):
    id: Optional[int] = None
    company_name: Optional[str] = None
    starting_month: Optional[int] = None
    starting_year: Optional[int] = None
    ending_month: Optional[int] = None
    ending_year: Optional[int] = None
    project_name: Optional[str] = None
    work_description: Optional[str] = None
    key_skills: Optional[str] = None
    project_url: Optional[str] = None

class Project(BaseModel):
    id: Optional[int] = None
    project_name: Optional[str] = None
    starting_month: Optional[int] = None
    starting_year: Optional[int] = None
    ending_month: Optional[int] = None
    ending_year: Optional[int] = None
    project_description: Optional[str] = None
    key_skills: Optional[str] = None
    project_url: Optional[str] = None

class Certification(BaseModel):
    id: Optional[int] = None
    certification_name: Optional[str] = None
    certification_provider: Optional[str] = None
    completion_id: Optional[str] = None
    certification_url: Optional[str] = None
    starting_month: Optional[int] = None
    starting_year: Optional[int] = None
    ending_month: Optional[int] = None
    ending_year: Optional[int] = None
    certificate_expires: Optional[bool] = None

class ClubAndCommittee(BaseModel):
    id: Optional[int] = None
    committee_name: Optional[str] = None
    position: Optional[str] = None
    starting_month: Optional[int] = None
    starting_year: Optional[int] = None
    ending_month: Optional[int] = None
    ending_year: Optional[int] = None
    is_currently_working: Optional[bool] = None
    responsibility_description: Optional[str] = None

class CompetitiveExam(BaseModel):
    id: Optional[int] = None
    exam_label: Optional[str] = None
    score: Optional[str] = None

class AcademicAchievement(BaseModel):
    id: Optional[int] = None
    qualification: Optional[str] = None
    achievements: Optional[str] = None

# --- JobSeeker Schemas ---
class JobSeekerBase(BaseModel):
    firstname: Optional[str] = None
    lastname: Optional[str] = None
    email: Optional[str] = None
    phone: Optional[str] = None
    country_code: Optional[str] = None
    work_experience_yrs: Optional[int] = None
    email_verified: Optional[bool] = None
    phone_verified: Optional[bool] = None
    profile_picture_url: Optional[str] = None
    gender: Optional[str] = None
    date_of_birth: Optional[str] = None
    current_location: Optional[str] = None
    home_town: Optional[str] = None
    country: Optional[str] = None
    higher_educations: Optional[List[HigherEducation]] = None
    hsc_education: Optional[HSCEducation] = None
    ssc_education: Optional[SSCEducation] = None
    key_skills: Optional[str] = None
    languages: Optional[str] = None
    profile_summary: Optional[str] = None
    resume_url: Optional[str] = None
    employment_details: Optional[List[EmploymentDetail]] = None
    internships: Optional[List[Internship]] = None
    preferred_work_location: Optional[str] = None
    career_preference_jobs: Optional[bool] = None
    career_preference_internships: Optional[bool] = None
    min_duration_months: Optional[int] = None
    projects: Optional[List[Project]] = None
    certifications: Optional[List[Certification]] = None
    clubs_and_committees: Optional[List[ClubAndCommittee]] = None
    competitive_exams: Optional[List[CompetitiveExam]] = None
    academic_achievements: Optional[List[AcademicAchievement]] = None
    awards_and_accomplishments: Optional[str] = None
    updates_subscription: Optional[bool] = None
    # Admin fields
    is_suspended: Optional[bool] = None
    is_verified: Optional[bool] = None
    is_deleted: Optional[bool] = None
    admin_notes: Optional[str] = None

class JobSeekerCreate(JobSeekerBase):
    firstname: str
    lastname: str
    email: str
    phone: str
    country_code: str
    password: str

class JobSeekerUpdate(JobSeekerBase):
    pass

class JobSeekerOut(JobSeekerBase):
    id: int
    created_at: Optional[str] = None
    updated_at: Optional[str] = None

class JobSeekerLogin(BaseModel):
    email: str
    password: str
