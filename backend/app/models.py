from sqlalchemy import (
    Boolean,
    Column,
    DateTime,
    ForeignKey,
    Integer,
    String,
    func,
    UniqueConstraint,
)
from sqlalchemy.orm import relationship
from .database import Base


class Company(Base):
    __tablename__ = "companies"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, unique=True, nullable=False)
    password_hash = Column(String, nullable=False)
    email = Column(String, unique=True, nullable=False)
    email_otp = Column(String)
    email_otp_expiry = Column(DateTime)
    email_verified = Column(Boolean, default=False)
    phone = Column(String)
    country_code = Column(String)  # e.g., +1 for US, +91 for India
    phone_otp = Column(String)
    phone_otp_expiry = Column(DateTime)
    phone_verified = Column(Boolean, default=False)
    website = Column(String)
    industry = Column(String)
    min_company_size = Column(Integer)
    max_company_size = Column(Integer)
    country = Column(String)
    state = Column(String)
    city = Column(String)
    zip = Column(String)
    address = Column(String)
    banner_url = Column(String)
    logo_url = Column(String)
    rating = Column(Integer, default=0)  # Average rating from job seekers
    ratings_count = Column(Integer, default=0)  # Number of ratings received
    tagline = Column(String)
    tags = Column(String)  # Comma-separated tags for company
    about_us = Column(String)
    about_us_poster_url = Column(String)
    foundation_year = Column(Integer)
    website_url = Column(String)
    verified = Column(Boolean)
    created_at = Column(DateTime, default=func.now())
    updated_at = Column(DateTime, default=func.now(), onupdate=func.now())
    # Admin fields
    is_suspended = Column(Boolean, default=False)  # Admin: suspend/unsuspend company
    is_deleted = Column(Boolean, default=False)    # Admin: soft delete
    admin_notes = Column(String)                   # Admin: notes about company
    
    # Document fields
    document_type = Column(String)
    document_file_url = Column(String)


    # Relationships
    ai_interviewed_jobs = relationship("AiInterviewedJob", back_populates="company", cascade="all, delete-orphan")
    jobs = relationship("Job", back_populates="company")


class JobSeeker(Base):
    __tablename__ = "job_seekers"

    id = Column(Integer, primary_key=True, index=True)
    firstname = Column(String, nullable=False)
    lastname = Column(String, nullable=False)
    gender = Column(String)
    date_of_birth = Column(DateTime)
    password_hash = Column(String, nullable=False)
    email = Column(String, unique=True, nullable=False)
    email_otp = Column(String)
    email_otp_expiry = Column(DateTime)
    email_verified = Column(Boolean, default=False)
    country_code = Column(String)  # +1 for US, +91 for India
    phone = Column(String, unique=True)
    phone_otp = Column(String)
    phone_otp_expiry = Column(DateTime)
    phone_verified = Column(Boolean, default=False)
    dob = Column(DateTime)
    current_location = Column(String)
    home_town = Column(String)
    country = Column(String)
    career_preference_internships = Column(Boolean, default=False)
    career_preference_jobs = Column(Boolean, default=False)
    min_duration_months = Column(Integer)
    preferred_work_location = Column(String)
    work_experience_yrs = Column(Integer, default=0)
    updates_subscription = Column(Boolean, default=False)
    key_skills = Column(String)  # Comma-separated list of key skills
    languages = Column(String)  # Comma-separated list of languages spoken
    profile_summary = Column(String)
    awards_and_accomplishments = Column(String)
    resume_url = Column(String)
    profile_picture_url = Column(String)
    edudiagno_score = Column(Integer, default=0)  # Score from Edudiagno test
    # Admin fields
    is_suspended = Column(Boolean, default=False)  # Admin: suspend/unsuspend user
    is_verified = Column(Boolean, default=False)   # Admin: manual verification
    is_deleted = Column(Boolean, default=False)    # Admin: soft delete
    admin_notes = Column(String)                   # Admin: notes about user

    created_at = Column(DateTime, default=func.now())
    updated_at = Column(DateTime, default=func.now(), onupdate=func.now())

    hsc_education = relationship(
        "HSCEducation", back_populates="job_seeker", uselist=False
    )
    ssc_education = relationship(
        "SSCEducation", back_populates="job_seeker", uselist=False
    )
    higher_educations = relationship(
        "HigherEducation", back_populates="job_seeker"
    )
    internships = relationship("Internship", back_populates="job_seeker")
    projects = relationship("Project", back_populates="job_seeker")
    certifications = relationship("Certification", back_populates="job_seeker")
    clubs_and_committees = relationship("ClubAndCommittee", back_populates="job_seeker")
    competitive_exams = relationship("CompetitiveExam", back_populates="job_seeker")
    employment_details = relationship("EmploymentDetail", back_populates="job_seeker")
    academic_achievements = relationship(
        "AcademicAchievement", back_populates="job_seeker"
    )
    job_applications = relationship("JobApplication", back_populates="job_seeker")


class HSCEducation(Base):
    __tablename__ = "hsc_educations"

    id = Column(Integer, primary_key=True, index=True)
    job_seeker_id = Column(
        Integer, ForeignKey("job_seekers.id", ondelete="CASCADE"), unique=True
    )
    examination_board = Column(String)
    medium_of_study = Column(String)
    actual_percentage = Column(String)
    passing_year = Column(Integer)

    job_seeker = relationship("JobSeeker", back_populates="hsc_education")


class SSCEducation(Base):
    __tablename__ = "ssc_educations"

    id = Column(Integer, primary_key=True, index=True)
    job_seeker_id = Column(
        Integer, ForeignKey("job_seekers.id", ondelete="CASCADE"), unique=True
    )
    examination_board = Column(String)
    medium_of_study = Column(String)
    actual_percentage = Column(String)
    passing_year = Column(Integer)

    job_seeker = relationship("JobSeeker", back_populates="ssc_education")


class HigherEducation(Base):
    __tablename__ = "higher_educations"

    id = Column(Integer, primary_key=True, index=True)
    job_seeker_id = Column(Integer, ForeignKey("job_seekers.id", ondelete="CASCADE"))
    qualification = Column(String)  # e.g., Graduate/Diploma, Postgraduate, Doctorate
    course_name = Column(String)
    specialization = Column(String)
    college_name = Column(String)
    grading_system = Column(String)  # e.g., CGPA, Percentage
    grading_system_value = Column(String)
    starting_year = Column(Integer)
    passing_year = Column(Integer)
    course_type = Column(String)  # e.g., Full-time, Part-time

    job_seeker = relationship("JobSeeker", back_populates="higher_educations")
    clubs_and_committees = relationship("ClubAndCommittee", back_populates="education")


class Internship(Base):
    __tablename__ = "internship_experiences"

    id = Column(Integer, primary_key=True, index=True)
    job_seeker_id = Column(
        Integer, ForeignKey("job_seekers.id", ondelete="CASCADE"), nullable=False
    )
    company_name = Column(String)
    starting_month = Column(Integer)
    starting_year = Column(Integer)
    ending_month = Column(Integer)
    ending_year = Column(Integer)
    project_name = Column(String)
    work_description = Column(String)
    key_skills = Column(String)
    project_url = Column(String)

    job_seeker = relationship("JobSeeker", back_populates="internships")


class Project(Base):
    __tablename__ = "projects"

    id = Column(Integer, primary_key=True, index=True)
    job_seeker_id = Column(
        Integer, ForeignKey("job_seekers.id", ondelete="CASCADE"), nullable=False
    )
    project_name = Column(String)
    starting_month = Column(Integer)
    starting_year = Column(Integer)
    ending_month = Column(Integer)
    ending_year = Column(Integer)
    project_description = Column(String)
    key_skills = Column(String)
    project_url = Column(String)

    job_seeker = relationship("JobSeeker", back_populates="projects")


class Certification(Base):
    __tablename__ = "certifications"

    id = Column(Integer, primary_key=True, index=True)
    job_seeker_id = Column(
        Integer, ForeignKey("job_seekers.id", ondelete="CASCADE"), nullable=False
    )
    certification_name = Column(String)
    certification_provider = Column(String)
    completion_id = Column(String)
    certification_url = Column(String)
    starting_month = Column(Integer)
    starting_year = Column(Integer)
    ending_month = Column(Integer)
    ending_year = Column(Integer)
    certificate_expires = Column(Boolean, default=False)

    job_seeker = relationship("JobSeeker", back_populates="certifications")


class ClubAndCommittee(Base):
    __tablename__ = "clubs_and_committees"

    id = Column(Integer, primary_key=True, index=True)
    job_seeker_id = Column(
        Integer, ForeignKey("job_seekers.id", ondelete="CASCADE"), nullable=False
    )
    committee_name = Column(String)
    position = Column(String)
    education_id = Column(
        Integer, ForeignKey("higher_educations.id", ondelete="CASCADE")
    )
    starting_month = Column(Integer)
    starting_year = Column(Integer)
    ending_month = Column(Integer)
    ending_year = Column(Integer)
    is_currently_working = Column(Boolean, default=False)
    responsibility_description = Column(String)

    job_seeker = relationship("JobSeeker", back_populates="clubs_and_committees")
    education = relationship("HigherEducation", back_populates="clubs_and_committees")


class CompetitiveExam(Base):
    __tablename__ = "competitive_exams"

    id = Column(Integer, primary_key=True, index=True)
    job_seeker_id = Column(
        Integer, ForeignKey("job_seekers.id", ondelete="CASCADE"), nullable=False
    )
    exam_label = Column(String)  # e.g., GRE, GMAT, SAT
    score = Column(String)

    job_seeker = relationship("JobSeeker", back_populates="competitive_exams")


class EmploymentDetail(Base):
    __tablename__ = "employment_details"

    id = Column(Integer, primary_key=True, index=True)
    job_seeker_id = Column(
        Integer, ForeignKey("job_seekers.id", ondelete="CASCADE"), nullable=False
    )
    experience_years = Column(Integer)
    experience_months = Column(Integer)
    company_name = Column(String)
    designation = Column(String)
    starting_month = Column(Integer)
    starting_year = Column(Integer)
    ending_month = Column(Integer)
    ending_year = Column(Integer)
    is_currently_working = Column(Boolean)
    work_description = Column(String)

    job_seeker = relationship("JobSeeker", back_populates="employment_details")


class AcademicAchievement(Base):
    __tablename__ = "academic_achievements"

    id = Column(Integer, primary_key=True, index=True)
    job_seeker_id = Column(
        Integer, ForeignKey("job_seekers.id", ondelete="CASCADE"), nullable=False
    )
    qualification = Column(String)  # e.g., B.Tech, M.Tech, PhD
    achievements = Column(String)  # e.g., scholarships, awards

    job_seeker = relationship("JobSeeker", back_populates="academic_achievements")


class Job(Base):
    __tablename__ = "jobs"
    id = Column(Integer, primary_key=True, index=True)
    company_id = Column(
        Integer, ForeignKey("companies.id", ondelete="CASCADE"), nullable=False
    )
    job_title = Column(String)
    job_role = Column(String)
    job_location = Column(String)
    job_locality = Column(String)
    work_mode = Column(String)  # e.g., remote, hybrid, on-site
    min_work_experience = Column(Integer)
    max_work_experience = Column(Integer)
    min_salary_per_month = Column(Integer)
    max_salary_per_month = Column(Integer)
    additional_benefits = Column(String)
    skills = Column(String)
    qualification = Column(String)  # e.g., GRADUATE/DIPLOMA, POSTGRADUATE, DOCTORATE
    gender_preference = Column(String)  # e.g., ANY, MA
    candidate_prev_industry = Column(String)
    languages = Column(String)
    education_degree = Column(String)
    job_description = Column(String)
    posted_at = Column(DateTime, default=func.now())
    # Admin fields
    is_featured = Column(Boolean, default=False)   # Admin: feature job
    is_approved = Column(Boolean, default=True)   # Admin: approve job (auto-approved)
    is_closed = Column(Boolean, default=False)     # Admin: close job
    is_deleted = Column(Boolean, default=False)    # Admin: soft delete
    admin_notes = Column(String)                   # Admin: notes about job

    company = relationship("Company", back_populates="jobs")
    job_applications = relationship("JobApplication", back_populates="job")


class JobApplication(Base):
    __tablename__ = "job_applications"

    id = Column(Integer, primary_key=True, index=True)
    job_seeker_id = Column(
        Integer, ForeignKey("job_seekers.id", ondelete="CASCADE"), nullable=False
    )
    job_id = Column(Integer, ForeignKey("jobs.id", ondelete="CASCADE"), nullable=False)
    status = Column(
        String, default="applied"
    )  # applied, shortlisted, rejected, accepted
    resume_url = Column(String)
    applied_at = Column(DateTime, default=func.now())
    # Admin fields
    is_flagged = Column(Boolean, default=False)    # Admin: flag application
    admin_notes = Column(String)                   # Admin: notes about application

    # Relationships
    job_seeker = relationship("JobSeeker", back_populates="job_applications")
    job = relationship("Job", back_populates="job_applications")

    __table_args__ = (
        UniqueConstraint("job_seeker_id", "job_id", name="uq_job_seeker_job"),
    )


class EdudiagnoTest(Base):
    __tablename__ = "edudiagno_tests"

    id = Column(Integer, primary_key=True, index=True)
    title = Column(String)
    description = Column(String)
    tech_field = Column(String)
    created_at = Column(DateTime, default=func.now())
    updated_at = Column(DateTime, default=func.now(), onupdate=func.now())
    is_closed = Column(Boolean, default=False)     # Admin: close job
    is_deleted = Column(Boolean, default=False)    # Admin: soft delete
    admin_notes = Column(String)                   # Admin: notes about job
    # Relationships
    quiz_questions = relationship(
        "QuizQuestion",
        back_populates="edudiagno_test",
    )
    dsa_questions = relationship(
        "DSAQuestion",
        back_populates="edudiagno_test",
    )
    interview_questions = relationship(
        "InterviewQuestion", back_populates="edudiagno_test"
    )
    responses = relationship(
        "EdudiagnoTestResponse",
        back_populates="edudiagno_test"
    )


class EdudiagnoTestResponse(Base):
    __tablename__ = "edudiagno_test_responses"

    id = Column(Integer, primary_key=True, index=True)
    edudiagno_test_id = Column(Integer, ForeignKey("edudiagno_tests.id", ondelete="CASCADE"), nullable=False)
    job_seeker_id = Column(Integer, ForeignKey("job_seekers.id", ondelete="CASCADE"), nullable=True)
    resume_url = Column(String)
    resume_text = Column(String)
    resume_score = Column(Integer)
    resume_feedback = Column(String)
    edudiagno_score = Column(Integer)
    technical_skills_score = Column(Integer)
    communication_skills_score = Column(Integer)
    problem_solving_skills_score = Column(Integer)
    feedback = Column(String)
    report_file_url = Column(String)
    created_at = Column(DateTime, default=func.now())
    updated_at = Column(DateTime, default=func.now(), onupdate=func.now())

    # Admin fields
    is_flagged = Column(Boolean, default=False)
    admin_notes = Column(String)

    # Relationships
    edudiagno_test = relationship("EdudiagnoTest", back_populates="responses")
    job_seeker = relationship("JobSeeker")
    # No InterviewQuestionAndResponse relationship; use InterviewQuestion and InterviewQuestionResponse
    interview_question_responses = relationship(
        "InterviewQuestionResponse",
        back_populates="edudiagno_test_response",
    )
    quiz_responses = relationship(
        "QuizResponse",
        back_populates="edudiagno_test_response",
    )
    dsa_responses = relationship(
        "DSAResponse",
        back_populates="edudiagno_test_response",
    )

    __table_args__ = (
        UniqueConstraint("job_seeker_id", "edudiagno_test_id", name="uq_jobseeker_test"),
    )


class AiInterviewedJob(Base):
    __tablename__ = "ai_interviewed_jobs"

    id = Column(Integer, primary_key=True, index=True)
    title = Column(String)
    description = Column(String)
    department = Column(String)
    city = Column(String)
    location = Column(String)
    type = Column(String)  # full-time, part-time, contract, etc.
    duration_months = Column(Integer)
    min_experience = Column(Integer)
    max_experience = Column(Integer)
    currency = Column(String)
    salary_min = Column(Integer)
    salary_max = Column(Integer)
    show_salary = Column(Boolean, default=True)
    key_qualification = Column(String)
    requirements = Column(String)
    benefits = Column(String)
    status = Column(String, default="active")  # active, closed, draft
    quiz_time_minutes = Column(Integer)
    created_at = Column(DateTime, default=func.now())
    updated_at = Column(DateTime, default=func.now(), onupdate=func.now())
    company_id = Column(
        Integer, ForeignKey("companies.id", ondelete="CASCADE"), nullable=False
    )
    # Admin fields
    is_featured = Column(Boolean, default=False)   # Admin: feature job
    is_approved = Column(Boolean, default=True)   # Admin: approve job (auto-approved)
    is_closed = Column(Boolean, default=False)     # Admin: close job
    is_deleted = Column(Boolean, default=False)    # Admin: soft delete
    admin_notes = Column(String)                   # Admin: notes about job

    # Relationships
    company = relationship("Company", back_populates="ai_interviewed_jobs")
    interviews = relationship(
        "Interview",
        back_populates="ai_interviewed_job",
        cascade="all, delete-orphan"
    )
    quiz_questions = relationship(
        "QuizQuestion",
        back_populates="ai_interviewed_job",
    )
    dsa_questions = relationship(
        "DSAQuestion",
        back_populates="ai_interviewed_job",
    )
    interview_questions = relationship(
        "InterviewQuestion", back_populates="ai_interviewed_job"
    )


class InterviewQuestion(Base):
    __tablename__ = "interview_questions"

    id = Column(Integer, primary_key=True, index=True)
    question = Column(String)
    question_type = Column(String)  # technical, behavioral, problem_solving, custom
    order_number = Column(Integer)
    ai_interviewed_job_id = Column(
        Integer,
        ForeignKey("ai_interviewed_jobs.id", ondelete="CASCADE")
    )
    edudiagno_test_id = Column(
        Integer, ForeignKey("edudiagno_tests.id", ondelete="CASCADE")
    )
    # Admin fields
    is_approved = Column(Boolean, default=False)   # Admin: approve question
    is_deleted = Column(Boolean, default=False)    # Admin: soft delete
    admin_notes = Column(String)                   # Admin: notes about question

    __table_args__ = (
        UniqueConstraint("order_number", "ai_interviewed_job_id", name="uq_order_job"),
    )

    # Relationships
    ai_interviewed_job = relationship(
        "AiInterviewedJob", back_populates="interview_questions"
    )
    edudiagno_test = relationship("EdudiagnoTest", back_populates="interview_questions")
    interview_question_responses = relationship(
        "InterviewQuestionResponse", back_populates="interview_question"
    )


class InterviewQuestionResponse(Base):
    __tablename__ = "interview_question_responses"

    id = Column(Integer, primary_key=True, autoincrement=True)
    answer = Column(String)
    interview_question_id = Column(
        Integer,
        ForeignKey("interview_questions.id", ondelete="CASCADE"),
        nullable=False,
    )
    interview_id = Column(
        Integer,
        ForeignKey("interviews.id", ondelete="CASCADE"),
        nullable=True
    )
    edudiagno_test_response_id = Column(
        Integer,
        ForeignKey("edudiagno_test_responses.id", ondelete="CASCADE"),
        nullable=True
    )
    created_at = Column(DateTime, default=func.now())

    # Relationships
    interview_question = relationship(
        "InterviewQuestion", back_populates="interview_question_responses"
    )
    interview = relationship("Interview", back_populates="interview_question_responses")
    edudiagno_test_response = relationship(
        "EdudiagnoTestResponse", back_populates="interview_question_responses"
    )

    __table_args__ = (
        UniqueConstraint(
            "interview_question_id", "interview_id", "edudiagno_test_response_id", name="uq_interview_question_response"
        ),
    )


class QuizQuestion(Base):
    __tablename__ = "quiz_questions"

    id = Column(Integer, primary_key=True)
    description = Column(String)
    type = Column(String)
    category = Column(String)
    time_seconds = Column(Integer)
    image_url = Column(String)

    ai_interviewed_job_id = Column(
        Integer, ForeignKey("ai_interviewed_jobs.id", ondelete="CASCADE")
    )
    edudiagno_test_id = Column(
        Integer, ForeignKey("edudiagno_tests.id", ondelete="CASCADE")
    )

    created_at = Column(DateTime, default=func.now())
    # Admin fields
    is_approved = Column(Boolean, default=False)   # Admin: approve question
    is_deleted = Column(Boolean, default=False)    # Admin: soft delete
    admin_notes = Column(String)                   # Admin: notes about question

    ai_interviewed_job = relationship(
        "AiInterviewedJob", back_populates="quiz_questions"
    )
    edudiagno_test = relationship("EdudiagnoTest", back_populates="quiz_questions")
    quiz_options = relationship(
        "QuizOption",
        back_populates="quiz_question",
    )
    quiz_responses = relationship(
        "QuizResponse",
        back_populates="quiz_question",
    )


class QuizOption(Base):
    __tablename__ = "quiz_options"

    id = Column(Integer, primary_key=True)
    label = Column(String)
    correct = Column(Boolean, default=False)
    quiz_question_id = Column(
        Integer, ForeignKey("quiz_questions.id", ondelete="CASCADE")
    )

    quiz_question = relationship("QuizQuestion", back_populates="quiz_options")
    quiz_responses = relationship(
        "QuizResponse",
        back_populates="quiz_option",
    )


class DSAQuestion(Base):
    __tablename__ = "dsa_questions"

    id = Column(Integer, primary_key=True)
    title = Column(String)
    description = Column(String)
    difficulty = Column(String)
    time_minutes = Column(Integer)
    created_at = Column(DateTime, default=func.now())
    ai_interviewed_job_id = Column(
        Integer, ForeignKey("ai_interviewed_jobs.id", ondelete="CASCADE")
    )
    edudiagno_test_id = Column(
        Integer, ForeignKey("edudiagno_tests.id", ondelete="CASCADE")
    )
    # Admin fields
    is_approved = Column(Boolean, default=False)   # Admin: approve question
    is_deleted = Column(Boolean, default=False)    # Admin: soft delete
    admin_notes = Column(String)                   # Admin: notes about question

    ai_interviewed_job = relationship(
        "AiInterviewedJob", back_populates="dsa_questions"
    )
    edudiagno_test = relationship("EdudiagnoTest", back_populates="dsa_questions")
    dsa_test_cases = relationship(
        "DSATestCase",
        back_populates="dsa_question",
    )
    dsa_responses = relationship(
        "DSAResponse",
        back_populates="dsa_question",
    )


class DSATestCase(Base):
    __tablename__ = "dsa_test_cases"

    id = Column(Integer, primary_key=True)
    input = Column(String)
    expected_output = Column(String)
    dsa_question_id = Column(
        Integer, ForeignKey("dsa_questions.id", ondelete="CASCADE")
    )

    dsa_question = relationship("DSAQuestion", back_populates="dsa_test_cases")
    dsa_test_case_responses = relationship(
        "DSATestCaseResponse",
        back_populates="dsa_test_case",
    )


class Interview(Base):
    __tablename__ = "interviews"

    id = Column(Integer, primary_key=True, index=True)
    status = Column(String, default="incomplete")  # incomplete, completed
    firstname = Column(String, nullable=False)
    lastname = Column(String, nullable=False)
    email = Column(String, nullable=False)
    email_otp = Column(String)
    email_otp_expiry = Column(DateTime)
    email_verified = Column(String, default=False)
    phone = Column(String)
    phone_otp = Column(String)
    phone_otp_expiry = Column(DateTime)
    phone_verified = Column(Boolean, default=False)
    work_experience_yrs = Column(Integer)
    education = Column(String)
    skills = Column(String)  # Comma-separated list of skills
    city = Column(String)
    linkedin_url = Column(String)
    portfolio_url = Column(String)
    resume_url = Column(String)
    resume_text = Column(String)
    resume_match_score = Column(Integer)
    resume_match_feedback = Column(String)
    overall_score = Column(Integer)
    technical_skills_score = Column(Integer)
    communication_skills_score = Column(Integer)
    problem_solving_skills_score = Column(Integer)
    cultural_fit_score = Column(Integer)
    feedback = Column(String)
    quiz_score = Column(Integer)
    dsa_score = Column(Integer)
    report_file_url = Column(String)
    created_at = Column(DateTime, default=func.now())
    updated_at = Column(DateTime, default=func.now(), onupdate=func.now())
    ai_interviewed_job_id = Column(
        Integer,
        ForeignKey("ai_interviewed_jobs.id", ondelete="CASCADE"),
        nullable=False,
    )
    private_link_token = Column(String, unique=True)
    # Admin fields
    is_flagged = Column(Boolean, default=False)    # Admin: flag interview
    admin_notes = Column(String)                   # Admin: notes about interview

    ai_interviewed_job = relationship("AiInterviewedJob", back_populates="interviews")
    interview_question_and_responses = relationship(
        "InterviewQuestionAndResponse",
        back_populates="interview",
    )
    interview_question_responses = relationship(
        "InterviewQuestionResponse",
        back_populates="interview",
    )
    quiz_responses = relationship(
        "QuizResponse",
        back_populates="interview",
    )
    dsa_responses = relationship(
        "DSAResponse",
        back_populates="interview",
    )

    __table_args__ = (
        UniqueConstraint("email", "ai_interviewed_job_id", name="uq_email_job"),
    )


class InterviewQuestionAndResponse(Base):
    __tablename__ = "interview_question_and_responses"

    question = Column(String, nullable=False)
    question_type = Column(String)  # technical, behavioral, problem_solving, custom
    order_number = Column(Integer, primary_key=True)
    answer = Column(String)
    created_at = Column(DateTime, default=func.now())
    interview_id = Column(
        Integer,
        ForeignKey("interviews.id", ondelete="CASCADE"),
        primary_key=True,
        nullable=False,
    )

    # Relationships
    interview = relationship(
        "Interview", back_populates="interview_question_and_responses"
    )


class DSAResponse(Base):
    __tablename__ = "dsa_responses"

    id = Column(Integer, primary_key=True)
    code = Column(String)
    passed = Column(Boolean, default=False)
    test_cases_passed = Column(Integer, default=0)
    test_cases_total = Column(Integer, default=0)
    time_taken_seconds = Column(Integer, default=0)
    memory_used_kb = Column(Integer, default=0)
    interview_id = Column(Integer, ForeignKey("interviews.id", ondelete="CASCADE"))
    edudiagno_test_response_id = Column(
        Integer, ForeignKey("edudiagno_test_responses.id", ondelete="CASCADE")
    )
    dsa_question_id = Column(
        Integer, ForeignKey("dsa_questions.id", ondelete="CASCADE")
    )

    interview = relationship("Interview", back_populates="dsa_responses")
    edudiagno_test_response = relationship(
        "EdudiagnoTestResponse",
        back_populates="dsa_responses",
    )
    dsa_question = relationship("DSAQuestion", back_populates="dsa_responses")
    dsa_test_case_responses = relationship(
        "DSATestCaseResponse",
        back_populates="dsa_response",
    )

    __table_args__ = (
        UniqueConstraint(
            "interview_id", "dsa_question_id", name="uq_interview_and_question"
        ),
    )


class DSATestCaseResponse(Base):
    __tablename__ = "dsa_test_case_responses"

    status = Column(String)
    dsa_response_id = Column(
        Integer, ForeignKey("dsa_responses.id", ondelete="CASCADE"), primary_key=True
    )
    task_id = Column(String)
    dsa_test_case_id = Column(
        Integer, ForeignKey("dsa_test_cases.id", ondelete="CASCADE"), primary_key=True
    )

    dsa_response = relationship(
        "DSAResponse",
        back_populates="dsa_test_case_responses",
    )
    dsa_test_case = relationship("DSATestCase", back_populates="dsa_test_case_responses")


class QuizResponse(Base):
    __tablename__ = "quiz_responses"

    id = Column(Integer, primary_key=True, autoincrement=True)
    interview_id = Column(
        Integer, ForeignKey("interviews.id", ondelete="CASCADE"), nullable=True
    )
    edudiagno_test_response_id = Column(
        Integer, ForeignKey("edudiagno_test_responses.id", ondelete="CASCADE"), nullable=True
    )
    quiz_question_id = Column(
        Integer, ForeignKey("quiz_questions.id", ondelete="CASCADE"), nullable=False
    )
    quiz_option_id = Column(
        Integer, ForeignKey("quiz_options.id", ondelete="CASCADE"), nullable=False
    )

    interview = relationship("Interview", back_populates="quiz_responses")
    edudiagno_test_response = relationship(
        "EdudiagnoTestResponse", back_populates="quiz_responses"
    )
    quiz_question = relationship("QuizQuestion", back_populates="quiz_responses")
    quiz_option = relationship("QuizOption", back_populates="quiz_responses")

    __table_args__ = (
        UniqueConstraint(
            "quiz_question_id", "interview_id", "edudiagno_test_response_id", name="uq_quiz_response"
        ),
    )


class Country(Base):
    __tablename__ = "countries"

    id = Column(Integer, primary_key=True)
    name = Column(String)
    iso3 = Column(String)
    phonecode = Column(String)
    currency = Column(String)

    states = relationship("State", back_populates="country")
    cities = relationship("City", back_populates="country")


class State(Base):
    __tablename__ = "states"

    id = Column(Integer, primary_key=True)
    name = Column(String)
    country_id = Column(Integer, ForeignKey("countries.id"))

    country = relationship("Country", back_populates="states")
    cities = relationship("City", back_populates="state")


class City(Base):
    __tablename__ = "cities"

    id = Column(Integer, primary_key=True)
    name = Column(String)
    state_id = Column(Integer, ForeignKey("states.id"))
    country_id = Column(Integer, ForeignKey("countries.id"))

    country = relationship("Country", back_populates="cities")
    state = relationship("State", back_populates="cities")


class AdminUser(Base):
    __tablename__ = "admin_users"
    id = Column(Integer, primary_key=True, index=True)
    email = Column(String, unique=True, nullable=False)
    password_hash = Column(String, nullable=False)
    is_active = Column(Boolean, default=True)
    role = Column(String, default="admin")  # e.g., admin, superadmin
    created_at = Column(DateTime, default=func.now())
    updated_at = Column(DateTime, default=func.now(), onupdate=func.now())


class DSAPoolQuestion(Base):
    __tablename__ = "dsa_pool_questions"

    id = Column(Integer, primary_key=True)
    title = Column(String)
    description = Column(String)
    topic = Column(String)
    difficulty = Column(String)
    time_minutes = Column(Integer)

    created_at = Column(DateTime, default=func.now())

    # Relationships
    test_cases = relationship("DSAPoolTestCase", back_populates="dsa_pool_question")


# Model for DSA Pool Test Cases
class DSAPoolTestCase(Base):
    __tablename__ = "dsa_pool_test_cases"

    id = Column(Integer, primary_key=True)
    input = Column(String, nullable=False)
    expected_output = Column(String, nullable=False)
    dsa_pool_question_id = Column(Integer, ForeignKey("dsa_pool_questions.id", ondelete="CASCADE"), nullable=False)

    # Relationships
    dsa_pool_question = relationship("DSAPoolQuestion", back_populates="test_cases")