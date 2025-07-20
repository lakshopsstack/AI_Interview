export interface InterviewQuestion {
  id?: number;
  question?: string;
  question_type?: "technical" | "behavioral" | "problem_solving" | "custom";
  order_number?: number;
}

export interface TestCase {
  id?: number;
  input?: string;
  expected_output?: string;
}

export interface DSAQuestion {
  id?: number;
  title?: string;
  description?: string;
  difficulty?: string;
  time_minutes?: number;
  test_cases?: TestCase[];
}

export interface MCQuestion {
  id?: number;
  description?: string;
  type?: "single" | "multiple" | "true_false";
  category?: "technical" | "aptitude";
  time_seconds?: number;
  options?: { id?: number; label?: string; correct?: boolean }[];
  image_url?: string;
}

export interface MCQResponse {
  id: number;
  question_id: number;
  option_id: number;
  interview_id: number;
}

export interface AiInterviewedJobData {
  id?: number;
  title?: string;
  description?: string;
  department?: string;
  city?: string;
  location?: string;
  type?: string;
  min_experience?: number;
  max_experience?: number;
  duration_months?: number;
  key_qualification?: string;
  salary_min?: string | number | null;
  salary_max?: string | number | null;
  currency?: string;
  show_salary?: boolean;
  requirements?: string;
  benefits?: string;
  status?: string;
  createdAt?: string;
  requires_dsa?: boolean;
  requires_mcq?: boolean;
  dsa_questions?: DSAQuestion[];
  mcq_questions?: MCQuestion[];
  custom_interview_questions?: InterviewQuestion[];
  quiz_time_minutes?: number | null;
  mcq_timing_mode?: "per_question" | "whole_test";
  company_id?: number;
  updated_at?: string;
  hasQuiz?: boolean;
  hasDSATest?: boolean;
}

export interface AiInterviewedCandidateJobData {
  id?: number;
  title?: string;
  department?: string;
  location?: string;
  type?: string;
  description?: string;
  requirements?: string;
  benefits?: string;
  salaryMin?: number;
  salaryMax?: number;
  currency?: string;
  createdAt?: string;
  requires_dsa?: boolean;
  city?: string;
  min_experience?: number;
  max_experience?: number;
  dsa_questions?: Array<{
    title: string;
    description: string;
    difficulty: string;
    time_minutes?: number;
    test_cases: Array<{
      input: string;
      expected_output: string;
    }>;
  }>;

  companyId: number;
  companyName: string;
  companyLogo: string | null;
}
