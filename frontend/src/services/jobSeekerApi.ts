import { config } from "@/config";
import axios from "axios";

export interface JobSeekerRegistrationData {
  firstname: string;
  lastname: string;
  email: string;
  phone: string;
  country_code: string;
  password: string;
  work_experience_yrs?: number;
}

export interface JobSeekerLoginData {
  email: string;
  password: string;
}

export interface JobSeekerData {
  id: number;
  firstname: string;
  lastname: string;
  email: string;
  phone: string;
  country_code: string;
  work_experience_yrs?: number;
}

export const jobSeekerApi = {
  register: async (data: JobSeekerRegistrationData) => {
    await axios.post(`${config.API_BASE_URL}/jobseeker`, data);
  },
  login: async (data: JobSeekerLoginData) => {
    return axios.post(`${config.API_BASE_URL}/jobseeker/login`, data);
  },
  verifyLogin: async () => {
    const token = localStorage.getItem("jobseeker_token");
    if (!token) throw new Error("No jobseeker token found");
    return axios.get(`${config.API_BASE_URL}/jobseeker/verify-login`, {
      headers: { Authorization: `Bearer ${token}` },
    });
  },
  update: async (data: Partial<JobSeekerData>) => {
    const token = localStorage.getItem("jobseeker_token");
    if (!token) throw new Error("No jobseeker token found");
    return axios.put(
      `${config.API_BASE_URL}/jobseeker?jobseeker_id=${data.id}`,
      data,
      {
        headers: { Authorization: `Bearer ${token}` },
      }
    );
  },
  uploadResume: async (jobseekerId: number, file: File) => {
    const formData = new FormData();
    formData.append("file", file);
    const token = localStorage.getItem("jobseeker_token");
    const response = await axios.post(
      `${config.API_BASE_URL}/jobseeker/upload/resume?jobseeker_id=${jobseekerId}`,
      formData,
      {
        headers: {
          "Content-Type": "multipart/form-data",
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
      }
    );
    return response.data.resume_url;
  },
  uploadProfilePicture: async (jobseekerId: number, file: File) => {
    const formData = new FormData();
    formData.append("file", file);
    const token = localStorage.getItem("jobseeker_token");
    const response = await axios.post(
      `${config.API_BASE_URL}/jobseeker/upload/profile-picture?jobseeker_id=${jobseekerId}`,
      formData,
      {
        headers: {
          "Content-Type": "multipart/form-data",
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
      }
    );
    return response.data.profile_picture_url;
  },
  listJobs: async (
    search?: string,
    skip: number = 0,
    limit: number = 20,
    location?: string,
    workMode?: string,
    minExp?: number,
    maxExp?: number,
    minSalary?: number,
    maxSalary?: number,
    companyId?: string | number
  ) => {
    const params: any = { skip, limit };
    if (search) params.search = search;
    if (location) params.location = location;
    if (workMode) params.work_mode = workMode;
    if (minExp !== undefined) params.min_exp = minExp;
    if (maxExp !== undefined) params.max_exp = maxExp;
    if (minSalary !== undefined) params.min_salary = minSalary;
    if (maxSalary !== undefined) params.max_salary = maxSalary;
    if (companyId !== undefined) params.company_id = companyId;
    const response = await axios.get(`${config.API_BASE_URL}/jobseeker/jobs`, { params });
    return response.data;
  },
  getJob: async (jobId: number, jobSeekerId?: number) => {
    const params: any = { job_id: jobId };
    if (jobSeekerId) params.job_seeker_id = jobSeekerId;
    const response = await axios.get(`${config.API_BASE_URL}/jobseeker/job`, { params });
    return response.data;
  },
  applyToJob: async (jobId: number, jobSeekerId?: number) => {
    const token = localStorage.getItem("jobseeker_token");
    if (!token) throw new Error("No jobseeker token found");
    const params: any = { job_id: jobId };
    if (jobSeekerId) params.job_seeker_id = jobSeekerId;
    const response = await axios.post(
      `${config.API_BASE_URL}/jobseeker/job/apply`,
      null,
      {
        params,
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );
    return response.data;
  },
  listCompanies: async (search?: string) => {
    const params: any = {};
    if (search) params.search = search;
    const res = await axios.get(`${config.API_BASE_URL}/jobseeker/companies`, { params });
    return res.data;
  },
  getCompanyById: async (companyId: number | string) => {
    const res = await axios.get(`${config.API_BASE_URL}/jobseeker/company/${companyId}`);
    return res.data;
  },
  getAppliedJobs: async (jobSeekerId: number) => {
    const response = await axios.get(`${config.API_BASE_URL}/jobseeker/applied-jobs`, {
      params: { job_seeker_id: jobSeekerId },
    });
    return response.data;
  },
  getProfileCompletion: async (jobSeekerId: number) => {
    const response = await axios.get(`${config.API_BASE_URL}/jobseeker/profile-completion`, {
      params: { job_seeker_id: jobSeekerId },
    });
    return response.data;
  },
};
