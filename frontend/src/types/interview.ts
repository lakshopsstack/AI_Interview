export interface InterviewData {
  id?: number;
  status?: string;
  firstname?: string;
  lastname?: string;
  email?: string;
  phone?: string;
  work_experience_yrs?: number;
  education?: string;
  skills?: string;
  city?: string;
  linkedin_url?: string;
  portfolio_url?: string;
  resume_url?: string;
  resume_text?: string;
  resume_match_score?: number;
  resume_match_feedback?: string;
  overall_score?: number;
  technical_skills_score?: number;
  communication_skills_score?: number;
  problem_solving_skills_score?: number;
  cultural_fit_score?: number;
  feedback?: string;
  updated_at?: string;
  ai_interviewed_job_id?: number;
  video_url?: string;
  screenshot_urls?: string[];
  report_file_url?: string;
  job_title?: string;
  job_description?: string;
  job_department?: string;
  job_city?: string;
  job_location?: string;
  job_type?: string;
  job_duration_months?: number;
  min_experience?: number;
  max_experience?: number;
  currency?: string;
  salary_min?: number;
  salary_max?: number;
  show_salary?: boolean;
  job_key_qualification?: string;
  requirements?: string;
  benefits?: string;
  quiz_time_minutes?: string;
  interview_question_and_response?: any[];
  quiz_responses?: {
      selected_options?: {quiz_option_id: number}[];
      id?: number;
      description?: string;
      type?: string;
      category?: string;
      image_url?: string;
      time_seconds?: string;
      options?: {
          id: number;
          label: string;
          correct: boolean;
      }[];
  }[];
  dsa_responses?: {
      id?: number;
      question_id?: number;
      title?: string;
      description?: string;
      time_minutes?: string;
      code?: string;
      passed?: boolean;
      difficulty?: string;
  }[]
}

export interface GetInterviewsParams {
  ai_interviewed_job_id?: string;
  search?: string;
  score?: string;
  department?: string;
  job?: string;
  offset?: number;
  limit?: number;
}
