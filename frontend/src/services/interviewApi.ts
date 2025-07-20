import axios from "axios";
import { GetInterviewsParams, InterviewData } from "@/types/interview";
import { config } from "@/config";

export const interviewApi = {
  createInterview: async (data: InterviewData, jobId: number) => {
    const token = localStorage.getItem("token");
    const res = await axios.post(
      `${config.API_BASE_URL}/interview`,
      {
        ...data,
        job_id: jobId,
      },
      {
        headers: { Authorization: `Bearer ${token}` },
      }
    );
    return res;
  },
  getInterviews: async (params: GetInterviewsParams) => {
    const response = await axios.get(
      `${config.API_BASE_URL}/company/interview/all`,
      {
        params,
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      }
    );
    return response;
  },

  candidateGetInterview: async () => {
    const iToken = localStorage.getItem("i_token");
    const res = await axios.get(`${config.API_BASE_URL}/interview`, {
      headers: { Authorization: `Bearer ${iToken}` },
    });
    return res;
  },

  updateInterview: async (data: Partial<InterviewData>) => {
    const iToken = localStorage.getItem("i_token");
    const res = await axios.put(
      `${config.API_BASE_URL}/interview`,
      data,
      {
        headers: { Authorization: `Bearer ${iToken}` },
      }
    );
    return res;
  },

  extractResumeData: async (resume: File) => {
    const formdata = new FormData();
    formdata.append("file", resume);
    const res = await axios.post(
      `${config.API_BASE_URL}/parse-resume`,
      formdata,
      {
        headers: { "Content-Type": "multipart/form-data" },
      }
    );
    return res;
  },

  uploadResume: async (file: File) => {
    try {
      const formData = new FormData();
      formData.append("file", file);
      const iToken = localStorage.getItem("i_token");
      const response = await axios.put(
        `${config.API_BASE_URL}/interview/upload-resume`,
        formData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
            Authorization: `Bearer ${iToken}`,
          },
        }
      );
      return response;
    } catch (error) {
      console.error("Error uploading resume:", error);
      throw error;
    }
  },

  analyzeCandidate: async () => {
    const iToken = localStorage.getItem("i_token");
    const res = await axios.post(
      `${config.API_BASE_URL}/interview/analyze-resume`,
      undefined,
      {
        headers: { Authorization: `Bearer ${iToken}` },
      }
    );
    return res;
  },

  textToSpeech: async (text: string) => {
    const res = axios.post(`${config.API_BASE_URL}/text-to-speech`, { text });
    return res;
  },

  speechToText: async (file: File) => {
    const formData = new FormData();
    formData.append("audio_file", file);

    const res = await axios.post(
      `${config.API_BASE_URL}/speech-to-text`,
      formData,
      {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("i_token")}`,
          "Content-Type": "multipart/form-data",
        },
      }
    );

    return res;
  },

  submitTextResponse: async (question_order: number, answer: string) => {
    const iToken = localStorage.getItem("i_token");
    const res = await axios.put(
      `${config.API_BASE_URL}/interview/interview-question/submit-text-response`,
      {
        question_order,
        answer,
      },
      {
        headers: { Authorization: `Bearer ${iToken}` },
      }
    );
    return res;
  },

  generateFeedback: async (transcript: string, jobRequirements: string) => {
    const iToken = localStorage.getItem("i_token");
    const res = await axios.put(
      `${config.API_BASE_URL}/interview/generate-feedback`,
      JSON.stringify({
        transcript,
        job_requirements: jobRequirements,
      }),
      {
        headers: {
          Authorization: `Bearer ${iToken}`,
          "Content-Type": "application/json",
          Accept: "application/json",
        },
      }
    );
    return res.data;
  },

  generateQuestions: async () => {
    const iToken = localStorage.getItem("i_token");
    const res = await axios.post(
      `${config.API_BASE_URL}/interview/generate-interview-questions`,
      undefined,
      {
        headers: { Authorization: `Bearer ${iToken}` },
      }
    );
    return res;
  },

  // getInterviewQuestionsAndResponses: async (interviewId: string) => {
  //   const token = localStorage.getItem("token");
  //   const res = await axios.get(
  //     `${config.API_BASE_URL}/interview-question-and-response?interview_id=${interviewId}`,
  //     {
  //       headers: { Authorization: `Bearer ${token}` },
  //     }
  //   );
  //   return res;
  // },
  getAiInterviewedJob: async (jobId: string) => {
    const res = await axios.get(
      `${config.API_BASE_URL}/interview/ai-interviewed-job?id=${jobId}`
    );
    return res;
  },
  submitQuizResponses: async (
    responses: { quiz_question_id: number; quiz_option_id: number }[]
  ) => {
    const res = await axios.post(
      `${config.API_BASE_URL}/interview/quiz-response`,
      responses,
      {
        headers: { Authorization: `Bearer ${localStorage.getItem("i_token")}` },
      }
    );
    return res;
  },

  getDSAQuestion: async (ai_interviewed_job_id: string) => {
    const response = await axios.get(`${config.API_BASE_URL}/company/dsa-question`, {
      params: { ai_interviewed_job_id: ai_interviewed_job_id },
      headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
    });
    return response;
  },
  getQuizQuestionByInterviewId: async (interview_id: string) => {
    const res = await axios.get(
      `${config.API_BASE_URL}/interview/quiz-question?interview_id=${interview_id}`,
      {
        headers: { Authorization: `Bearer ${localStorage.getItem("i_token")}` },
      }
    );
    return res;
  },

  deleteInterview: async (interviewId: string) => {
    const token = localStorage.getItem("token");
    const res = await axios.delete(
      `${config.API_BASE_URL}/company/interview`,
      {
        params: { id: interviewId },
        headers: { Authorization: `Bearer ${token}` },
      }
    );
    return res;
  },
  getInterviewByPrivateLink: async (token: string, email: string) => {
    const res = await axios.get(
      `${config.API_BASE_URL}/interview/private/${token}`,
      { params: { email } }
    );
    return res;
  },
};
