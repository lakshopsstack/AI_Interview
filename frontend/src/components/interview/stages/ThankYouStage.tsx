interface InterviewFeedback {
  overall_feedback: string;
  strengths: string[];
  areas_for_improvement: string[];
  suggestions: string[];
}

interface ThankYouStageProps {
  transcript: Array<{
    role: "user" | "assistant";
    content: string;
  }>;
  companyName: string;
  jobTitle: string;
  feedback: InterviewFeedback;
  onScheduleLater: () => void;
} 