export interface HigherEducation {
  id?: number;
  course_name?: string;
  college_name?: string;
  starting_year?: number;
  passing_year?: number;
  course_type?: string;
}

export interface HSCEducation {
  id?: number;
  examination_board?: string;
  medium_of_study?: string;
  actual_percentage?: number;
  passing_year?: number;
}

export interface SSCEducation {
  id?: number;
  examination_board?: string;
  medium_of_study?: string;
  actual_percentage?: number;
  passing_year?: number;
}

export interface Project {
  id?: number;
  project_name?: string;
  starting_month?: number;
  starting_year?: number;
  ending_month?: number;
  ending_year?: number;
  project_description?: string;
  key_skills?: string;
  project_url?: string;
}

export interface Certification {
  id?: number;
  certification_name?: string;
  certification_provider?: string;
  completion_id?: string;
  certification_url?: string;
  starting_month?: number;
  starting_year?: number;
  ending_month?: number;
  ending_year?: number;
  certificate_expires?: boolean;
}

export interface ClubAndCommittee {
  id?: number;
  committee_name?: string;
  position?: string;
  starting_month?: number;
  starting_year?: number;
  ending_month?: number;
  ending_year?: number;
  is_currently_working?: boolean;
  responsibility_description?: string;
}

export interface CompetitiveExam {
  id?: number;
  exam_label?: string;
  score?: string;
}

export interface AcademicAchievement {
  id?: number;
  qualification?: string;
  achievements?: string;
}

export interface JobSeekerData {
  id?: number;
  firstname: string;
  lastname: string;
  email: string;
  phone?: string;
  country_code?: string;
  work_experience_yrs?: number;
  email_verified?: boolean;
  phone_verified?: boolean;
  profile_picture_url?: string;
  gender?: string;
  date_of_birth?: string;
  current_location?: string;
  home_town?: string;
  country?: string;
  higher_educations?: HigherEducation[];
  hsc_education?: HSCEducation;
  ssc_education?: SSCEducation;
  key_skills?: string;
  languages?: string;
  profile_summary?: string;
  resume_url?: string;
  last_updated_time?: string;
  incomplete_fields?: string[];
  total_fields?: number;
  employment_details?: EmploymentDetail[];
  internships?: Internship[];
  preferred_work_location?: string;
  career_preference_jobs?: boolean;
  career_preference_internships?: boolean;
  min_duration_months?: number;
  projects?: Project[];
  certifications?: Certification[];
  clubs_and_committees?: ClubAndCommittee[];
  competitive_exams?: CompetitiveExam[];
  academic_achievements?: AcademicAchievement[];
}

export interface Internship {
  id?: number;
  company_name?: string;
  starting_month?: number;
  starting_year?: number;
  ending_month?: number;
  ending_year?: number;
  project_name?: string;
  work_description?: string;
  key_skills?: string;
  project_url?: string;
}

export interface EmploymentDetail {
  id?: number;
  experience_years?: number;
  experience_months?: number;
  company_name?: string;
  designation?: string;
  starting_month?: number;
  starting_year?: number;
  ending_month?: number;
  ending_year?: number;
  is_currently_working?: boolean;
  work_description?: string;
}
