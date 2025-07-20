import { config } from "@/config";
import axios from "axios";

import { AiInterviewedJobData } from "@/types/aiInterviewedJob";
import { DSAQuestion, TestCase } from "@/types/aiInterviewedJob";
import { MCQuestion } from "@/types/aiInterviewedJob";
import { CompanyLoginData, CompanyRegistrationData } from "@/types/company";
import { InterviewQuestion } from "@/types/aiInterviewedJob";


export const companyApi = {
  register: async (data: any) => {
    // If FormData, set correct headers
    const isFormData = typeof FormData !== "undefined" && data instanceof FormData;
    await axios.post(`${config.API_BASE_URL}/company`, data, isFormData ? { headers: { "Content-Type": "multipart/form-data" } } : undefined);
  },
  login: async (data: CompanyLoginData) => {
    const res = await axios.post(
      `${config.API_BASE_URL}/company/login`,
      data
    );
    return res;
  },
  verifyLogin: async () => {
    const token = localStorage.getItem("token");
    const res = await axios.get(
      `${config.API_BASE_URL}/company/verify-token`,
      {
        headers: { Authorization: `Bearer ${token}` },
      }
    );
    return res;
  },
  getAnaltyics: async () => {
    const response = await axios.get(
      `${config.API_BASE_URL}/company/analytics`,
      {
        headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
      }
    );
    return response;
  },
  createDSAQuestion: async (ai_interviewed_job_id: string, dsaQuestion: DSAQuestion) => {
    const res = await axios.post(
      `${config.API_BASE_URL}/company/dsa-question`,
      {
        ai_interviewed_job_id,
        ...dsaQuestion,
      },
      { headers: { Authorization: `Bearer ${localStorage.getItem("token")}` } }
    );
    return res;
  },
  updateDSAQuestion: async (data: DSAQuestion) => {
    await axios.put(`${config.API_BASE_URL}/company/dsa-question`, data, {
      headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
    });
  },
  getDSAQuestion: async (ai_interviewed_job_id: string) => {
    const response = await axios.get(`${config.API_BASE_URL}/company/dsa-question`, {
      params: { ai_interviewed_job_id: ai_interviewed_job_id },
      headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
    });
    return response;
  },
  deleteDSAQuestion: async (id: number) => {
    await axios.delete(`${config.API_BASE_URL}/company/dsa-question?id=${id}`, {
      headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
    });
  },
  createTestCase: async (data: TestCase, dsaQuestionId: number) => {
    await axios.post(
      `${config.API_BASE_URL}/company/dsa-test-case`,
      { ...data, dsa_question_id: dsaQuestionId },
      {
        headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
      }
    );
  },
  deleteTestCase: async (id: number) => {
    await axios.delete(`${config.API_BASE_URL}/company/dsa-test-case?id=${id}`, {
      headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
    });
  },
  createCustomInterviewQuestion: async (question: InterviewQuestion, ai_interviewed_job_id: number) => {
    const res = await axios.post(
      `${config.API_BASE_URL}/company/custom-interview-question`,
      {
        question: question.question,
        question_type: question.question_type,
        order_number: question.order_number,
        ai_interviewed_job_id: ai_interviewed_job_id,
      },
      {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      }
    );
    return res;
  },
  getCustomInterviewQuestionByJobId: async (ai_interviewed_job_id: number) => {
    const res = await axios.get(
      `${config.API_BASE_URL}/company/interview-question?ai_interviewed_job_id=${ai_interviewed_job_id}`, { headers: { Authorization: `Bearer ${localStorage.getItem("token")}` } }
    );
    return res;
  },
  createAiInterviewedJob: async (data: AiInterviewedJobData) => {
    const jobData = {
      title: data.title,
      description: data.description,
      department: data.department,
      city: data.city,
      location: data.location,
      type: data.type,
      min_experience: data.min_experience,
      max_experience: data.max_experience,
      duration_months: data.duration_months,
      key_qualification: data.key_qualification,
      salary_min: data.salary_min,
      salary_max: data.salary_max,
      currency: data.currency,
      show_salary: data.show_salary,
      requirements: data.requirements,
      benefits: data.benefits,
      status: data.status || "active",
    };

    const jobResponse = await axios.post(
      `${config.API_BASE_URL}/company/ai-interviewed-job`,
      jobData,
      {
        headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
      }
    );

    return jobResponse;
  },
  getAllAiInterviewedJobs: async (params: {
    start?: number;
    limit?: number;
    sort_field?: "title" | "department" | "city" | "type" | "show_salary" | "status";
    sort?: "ascending" | "descending";
    search?: string;
    status?: string;
  }) => {
    const queryParams = new URLSearchParams();
    if (params?.start !== undefined) queryParams.append("start", String(params.start));
    if (params?.limit !== undefined) queryParams.append("limit", String(params.limit));
    if (params?.sort_field) queryParams.append("sort_field", params.sort_field);
    if (params?.sort) queryParams.append("sort", params.sort);
    if (params?.search) queryParams.append("search", params.search);
    if (params?.status && params.status !== "all") queryParams.append("status", params.status);
    const res = await axios.get(
      `${config.API_BASE_URL}/company/ai-interviewed-job/all?${queryParams.toString()}`,
      {
        headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
      }
    );
    return res;
  },
  getAiInterviewedJobsPaginated: async ({ page, limit, search, status, order }: { page: number; limit: number; search?: string; status?: string; order?: string }) => {
    const response = await axios.get(`${config.API_BASE_URL}/company/ai-interviewed-job/all`, {
      params: { page, limit, search, status, order },
      headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
    });
    return response;
  },
  getAiInterviewedJobById: (ai_interviewed_job_id: string) =>
    axios.get(`${config.API_BASE_URL}/company/ai-interviewed-job?id=${ai_interviewed_job_id}`, {
      headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
    }),
  updateAiInterviewedJob: async (jobId: string, data: AiInterviewedJobData) => {
    const res = await axios.put(
      `${config.API_BASE_URL}/company/ai-interviewed-job`,
      {
        ...data,
        id: parseInt(jobId),
      },
      {
        headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
      }
    );
    return res;
  },
  generateAiInterviewedJobDescription: async (
    jobTitle: string,
    department: string,
    location: string,
    keyQualification: string,
    minExperience: string,
    maxExperience: string
  ) => {
    const res = await axios.post(
      `${config.API_BASE_URL}/company/generate-ai-interviewed-job-description`,
      {
        title: jobTitle,
        department: department,
        location: location,
        key_qualification: keyQualification,
        min_experience: minExperience,
        max_experience: maxExperience,
      },
      {
        headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
      }
    );
    return res;
  },
  generateAiInterviewedJobRequirements: async (
    jobTitle: string,
    department: string,
    location: string,
    keyQualification: string,
    minExperience: string,
    maxExperience: string,
    keywords: string
  ) => {
    const res = await axios.post(
      `${config.API_BASE_URL}/company/generate-ai-interviewed-job-requirements`,
      {
        title: jobTitle,
        department: department,
        location: location,
        key_qualification: keyQualification,
        min_experience: minExperience,
        max_experience: maxExperience,
        keywords: keywords,
      },
      {
        headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
      }
    );
    return res;
  },
  deleteAiInterviewedJob: async (jobId: string) => {
    const res = await axios.delete(`${config.API_BASE_URL}/company/ai-interviewed-job?id=${jobId}`, {
      headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
    });
    return res;
  },
  createQuizQuestion: async (data: MCQuestion, ai_interviewed_job_id: number, file?: File) => {
    if (!data.description || !data.type || !data.category) {
      throw new Error("Missing details");
    }
    const formData = new FormData();
    formData.append("description", data.description);
    formData.append("type", data.type);
    formData.append("category", data.category);
    formData.append("ai_interviewed_job_id", ai_interviewed_job_id.toString());
    if (data.time_seconds) {
      formData.append("time_seconds", data.time_seconds.toString());
    }
    if (file) {
      formData.append("image", file);
    }

    const res = await axios.post(
      `${config.API_BASE_URL}/company/quiz-question`,
      formData,
      {
        headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
      }
    );
    return res;
  },
  deleteQuizQuestion: async (id: number) => {
    await axios.delete(
      `${config.API_BASE_URL}/company/quiz-question?question_id=${id}`,
      {
        headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
      }
    );
  },
  createQuizOption: async (
    option: { label?: string; correct?: boolean },
    quiz_question_id?: number
  ) => {
    if (!option.label || !quiz_question_id) {
      return;
    }
    if (!option.correct) {
      option.correct = false;
    }

    const res = await axios.post(
      `${config.API_BASE_URL}/company/quiz-option`,
      {
        label: option.label,
        correct: option.correct,
        quiz_question_id: quiz_question_id,
      },
      {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      }
    );
    return res;
  },
  getQuizQuestionByAiInterviewedJobId: async (ai_interviewed_job_id: string) => {
    const res = await axios.get(
      `${config.API_BASE_URL}/company/quiz-question?ai_interviewed_job_id=${ai_interviewed_job_id}`,
      {
        headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
      }
    );
    return res;
  },
  getInterview: async (id: string) => {
    const response = await axios.get(
      `${config.API_BASE_URL}/company/interview`,
      {
        params: { id },
        headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
      }
    );
    return response;
  },

  deleteInterview: async (id: string) => {
    const response = await axios.delete(`${config.API_BASE_URL}/company/interview`, {
      params: { id },
      headers: { Authorization: `Bearer ${localStorage.getItem("token")}` }
    });
    return response;
  },

  getQuizResponsesByInterviewId: async (interview_id: string) => {
    const res = await axios.get(
      `${config.API_BASE_URL}/company/quiz-response?interview_id=${interview_id}`,
      {
        headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
      }
    );
    return res;
  },

  getInterviewQuestionsAndResponses: async (interviewId: string) => {
    const token = localStorage.getItem("token");
    const res = await axios.get(
      `${config.API_BASE_URL}/company/interview-question-and-response?interview_id=${interviewId}`,
      {
        headers: { Authorization: `Bearer ${token}` },
      }
    );
    return res;
  },
  createJob: async (data: any) => {
    const res = await axios.post(
      `${config.API_BASE_URL}/company/job`,
      data,
      { headers: { Authorization: `Bearer ${localStorage.getItem("token")}` } }
    );
    return res;
  },
  getJobById: async (jobId: string)=>{
    const res = await axios.get(`${config.API_BASE_URL}/company/job`, {
      params: { job_id: jobId },
      headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
    });
    return res;
  },
  updateJob: async (id: string, data: any) => {
    const res = await axios.put(
      `${config.API_BASE_URL}/company/job?job_id=${id}`,
      data,
      { headers: { Authorization: `Bearer ${localStorage.getItem("token")}` } }
    );
    return res;
  },
  deleteCustomInterviewQuestion: async (id: number) => {
    await axios.delete(
      `${config.API_BASE_URL}/company/interview-question`,
      {
        params: { id },
        headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
      }
    );
  },
  listJobs: async (options?: { search?: string; company_id?: number; limit?: number; offset?: number }) => {
    const params: any = {};
    if (options?.search) params.search = options.search;
    if (options?.company_id) params.company_id = options.company_id;
    if (options?.limit !== undefined) params.limit = options.limit;
    if (options?.offset !== undefined) params.offset = options.offset;
    const res = await axios.get(
      `${config.API_BASE_URL}/company/jobs`,
      {
        params,
        headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
      }
    );
    return res;
  },
  getJobApplications: async (jobId: string) => {
    const res = await axios.get(
      `${config.API_BASE_URL}/company/job/applications`,
      {
        params: { job_id: jobId },
        headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
      }
    );
    return res.data;
  },
  getCandidateDetailsForApplication: async (applicationId: number) => {
    const res = await axios.get(
      `${config.API_BASE_URL}/company/job/application/candidate`,
      {
        params: { application_id: applicationId },
        headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
      }
    );
    return res.data;
  },
  getCompanyById: async (companyId: string | number) => {
    const token = localStorage.getItem("token");
    const res = await axios.get(
      `${config.API_BASE_URL}/company/profile`,
      {
        params: { company_id: companyId },
        headers: { Authorization: `Bearer ${token}` },
      }
    );
    return res.data;
  },
  updateProfile: async (data: Partial<import("@/types/company").CompanyPublicData>, bannerFile?: File, logoFile?: File) => {
    const formData = new FormData();
    Object.entries(data).forEach(([key, value]) => {
      if (value !== undefined && value !== null && key !== "password_hash") {
        formData.append(key, value as string);
      }
    });
    if (bannerFile) {
      formData.append("banner", bannerFile);
    }
    if (logoFile) {
      formData.append("logo", logoFile);
    }
    const token = localStorage.getItem("token");
    const res = await axios.put(
      `${config.API_BASE_URL}/company/profile`,
      formData,
      {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "multipart/form-data",
        },
      }
    );
    return res.data;
  },

  inviteCandidates: async (jobId: number, candidates: { email: string; firstname?: string; lastname?: string }[]) => {
    const token = localStorage.getItem("token");
    const res = await axios.post(
      `${config.API_BASE_URL}/company/invite-candidates/${jobId}`,
      { candidates },
      { headers: { Authorization: `Bearer ${token}` } }
    );
    return res;
  },
  sendOtp: async (email: string)=>{
      const res = await axios.post(`${config.API_BASE_URL}/company/send-otp`, {
        email
      });
      return res;
  },
  verifyOtp: async({email, otp}: {email: string, otp: string})=>{
      const res = await axios.post(`${config.API_BASE_URL}/company/verify-otp`, {
        email,
        otp
      });
      return res;
  },
  getDSAPoolQuestions: async () => {
    const res = await axios.get(`${config.API_BASE_URL}/dsapool-questions`, {
      headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
    });
    return res;
  },
};
