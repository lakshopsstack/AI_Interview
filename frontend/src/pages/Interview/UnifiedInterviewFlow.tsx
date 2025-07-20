import { useState, useEffect } from "react";
import { useSearchParams } from "react-router-dom";

import { toast } from "sonner";
import { ResumeUploadStage } from "@/components/interview/stages/ResumeUploadStage";
import { MatchResultsStage } from "@/components/interview/stages/MatchResultsStage";
import LoadingSpinner from "@/components/common/LoadingSpinner";
import { interviewApi } from "@/services/interviewApi";
import MCQTest from "./MCQTest";
import VideoInterview from "./VideoInterview";
import { ThankYouStage } from "./ThankYouStage";
import DSAPlayground from "./DSAPlayground";
import CandidatePreCheck from "@/components/interview/CandidatePreCheck";

export default function UnifiedInterviewFlow() {
  const [urlSearchParams] = useSearchParams();
  const [isLoading, setIsLoading] = useState(true);
    // Force refresh to clear cache
  const [error, setError] = useState<string | null>(null);
  const [jobId, setJobId] = useState<number>(0);
  const [jobTitle, setJobTitle] = useState<string>("");
  const [companyName, setCompanyName] = useState<string>("");
  const [jobDescription, setJobDescription] = useState<string>("");
  const [currentStage, setCurrentStage] = useState<number>(0);
  const [matchScore, setMatchScore] = useState<number>(0);
  const [matchFeedback, setMatchFeedback] = useState<string>("");
  // Thank you stage data
  const [feedback, setFeedback] = useState("");
  const [score, setScore] = useState(0);
  const [scoreBreakdown, setScoreBreakdown] = useState({
    technicalSkills: 0,
    communication: 0,
    problemSolving: 0,
    culturalFit: 0,
  });
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [keywords, setKeywords] = useState<any[]>([]);
  const [hasDSATest, setHasDSATest] = useState(false);
  const [hasQuiz, setHasQuiz] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [interviewToken, setInterviewToken] = useState<string | null>(null);

  // Build stages array based on what's required
  const getStages = () => {
    const baseStages = ["Resume Upload", "Match Results"];
    
    if (hasQuiz) {
      baseStages.push("MCQ Test");
    }
    
    if (hasDSATest) {
      baseStages.push("DSA Test");
    }
    
    baseStages.push("Device Check", "Video Interview", "Thank You");
    
    return baseStages;
  };

  const stages = getStages();

  // Fullscreen functions
  const enterFullscreen = () => {
    const element = document.documentElement;
    if (element.requestFullscreen) {
      element.requestFullscreen().catch((err) => {
        console.error(`Error attempting to enable fullscreen: ${err.message}`);
      });
    } else if ((element as any).webkitRequestFullscreen) {
      (element as any).webkitRequestFullscreen();
    } else if ((element as any).msRequestFullscreen) {
      (element as any).msRequestFullscreen();
    }
  };

  const exitFullscreen = () => {
    if (document.exitFullscreen) {
      document.exitFullscreen();
    } else if ((document as any).webkitExitFullscreen) {
      (document as any).webkitExitFullscreen();
    } else if ((document as any).msExitFullscreen) {
      (document as any).msExitFullscreen();
    }
  };

  // Handle fullscreen changes and warnings
  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(!!document.fullscreenElement);
      
      // Warn user if they exit fullscreen during interview
      if (currentStage > 0 && !document.fullscreenElement) {
        toast.warning("Please stay in fullscreen mode during the interview");
        // Re-enter fullscreen after a short delay
        setTimeout(() => {
          if (currentStage > 0) {
            enterFullscreen();
          }
        }, 1000);
      }
    };

    document.addEventListener("fullscreenchange", handleFullscreenChange);
    document.addEventListener("webkitfullscreenchange", handleFullscreenChange);
    document.addEventListener("msfullscreenchange", handleFullscreenChange);

    return () => {
      document.removeEventListener("fullscreenchange", handleFullscreenChange);
      document.removeEventListener("webkitfullscreenchange", handleFullscreenChange);
      document.removeEventListener("msfullscreenchange", handleFullscreenChange);
    };
  }, [currentStage]);

  // Enter fullscreen when interview starts (after resume upload)
  useEffect(() => {
    if (currentStage > 0) {
      enterFullscreen();
    }
  }, [currentStage]);

  useEffect(() => {
    const verifyInterviewLink = async () => {
      try {
        // Check for secure token first
        const token = urlSearchParams.get("token");
        const jobId = urlSearchParams.get("job_id");
        
        if (token) {
          // Secure token-based verification
          setInterviewToken(token);
          // Get interview data using the token (without email for basic validation)
          const response = await interviewApi.getInterviewByPrivateLink(token, "");
          if (response.data && response.data.job_id) {
            const jobResponse = await interviewApi.getAiInterviewedJob(response.data.job_id.toString());
            const data = jobResponse.data;
            setJobId(data.id);
            setJobTitle(data.title);
            setCompanyName(data.company_name);
            setJobDescription(data.description);
            setHasDSATest(!!data.hasDSATest);
            setHasQuiz(!!data.hasQuiz);
            setIsLoading(false);
          } else {
            setError("Invalid or expired interview token.");
            setIsLoading(false);
          }
        } else if (jobId) {
          // Legacy insecure job_id-based verification (for backward compatibility)
          console.warn("Using insecure job_id parameter. Please use secure token-based links.");
          toast.warning("This interview link is not secure. Please use the private link provided in your email.");
          const response = await interviewApi.getAiInterviewedJob(jobId);
          const data = response.data;
          setJobId(data.id);
          setJobTitle(data.title);
          setCompanyName(data.company_name);
          setJobDescription(data.description);
          setHasDSATest(!!data.hasDSATest);
          setHasQuiz(!!data.hasQuiz);
          setIsLoading(false);
        } else {
          setError("Missing interview token or job ID. Please use a valid interview link.");
          setIsLoading(false);
        }
      } catch (error) {
        console.error("Interview verification error:", error);
        setError("Invalid interview link");
        setIsLoading(false);
      }
    };
    verifyInterviewLink();
  }, [urlSearchParams]);

  // Helper function to get the next stage after match results
  const getNextStageAfterMatch = () => {
    if (hasQuiz) return stages.indexOf("MCQ Test");
    if (hasDSATest) return stages.indexOf("DSA Test");
    return stages.indexOf("Device Check");
  };

  // Helper function to get the next stage after MCQ
  const getNextStageAfterMCQ = () => {
    if (hasDSATest) return stages.indexOf("DSA Test");
    return stages.indexOf("Device Check");
  };

  // Helper function to get the next stage after DSA
  const getNextStageAfterDSA = () => {
    return stages.indexOf("Device Check");
  };

  // Helper function to get the next stage after device check
  const getNextStageAfterDeviceCheck = () => {
    // Find the index of "Video Interview" in the stages array
    return stages.indexOf("Video Interview");
  };

  // Helper function to get the next stage after video
  const getNextStageAfterVideo = () => {
    return stages.indexOf("Thank You");
  };

  // Handler for when the video interview is complete
  const handleVideoInterviewComplete = (feedbackData?: any) => {
    if (feedbackData) {
      setFeedback(feedbackData.feedback);
      setScore(feedbackData.score);
      setScoreBreakdown(feedbackData.scoreBreakdown);
      setSuggestions(feedbackData.suggestions);
      setKeywords(feedbackData.keywords);
    }
    setCurrentStage(stages.length - 1); // Last stage (Thank You)
  };

  useEffect(() => {
    console.log("[UnifiedInterviewFlow] currentStage:", currentStage, "hasQuiz:", hasQuiz, "hasDSATest:", hasDSATest, "jobId:", jobId);
  }, [currentStage, hasQuiz, hasDSATest, jobId]);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-destructive mb-4">{error}</h1>
          <p className="text-muted-foreground mb-6">
            We recommend reviewing the job requirements and updating your resume
            before trying again.
          </p>
        </div>
      </div>
    );
  }

  // Show security warning if using insecure job_id method
  const showSecurityWarning = !interviewToken && urlSearchParams.get("job_id");

  // Render the current stage
  return (
    <div className={`${currentStage > 0 ? 'fullscreen-interview' : ''}`}>
      {showSecurityWarning && (
        <div className="fixed top-0 left-0 right-0 z-50 bg-yellow-500 text-black p-3 text-center text-sm font-medium">
          ⚠️ Security Warning: This interview link is not secure. Please use the private link provided in your email invitation.
        </div>
      )}
      {currentStage === 0 && (
        (() => { console.log('[UnifiedInterviewFlow] Rendering ResumeUploadStage'); return null; })() ||
        <ResumeUploadStage
          jobTitle={jobTitle}
          companyName={companyName}
          jobId={jobId}
          onComplete={(score: number, feedback: string) => {
            setMatchScore(score);
            setMatchFeedback(feedback);
            setCurrentStage(1);
          }}
        />
      )}
      {currentStage === 1 && (
        (() => { console.log('[UnifiedInterviewFlow] Rendering MatchResultsStage'); return null; })() ||
        <MatchResultsStage
          matchScore={matchScore}
          matchFeedback={matchFeedback}
          jobTitle={jobTitle}
          companyName={companyName}
          interviewId={jobId.toString()}
          onScheduleLater={() => setCurrentStage(getNextStageAfterMatch())}
          onStartInterview={() => setCurrentStage(getNextStageAfterMatch())}
        />
      )}
      {hasQuiz && currentStage === 2 && (
        (() => { console.log('[UnifiedInterviewFlow] Rendering MCQTest'); return null; })() ||
        <MCQTest interviewId={jobId} onComplete={() => setCurrentStage(getNextStageAfterMCQ())} />
      )}
      {hasDSATest && ((hasQuiz && currentStage === 3) || (!hasQuiz && currentStage === 2)) && (
        (() => { console.log('[UnifiedInterviewFlow] Rendering DSAPlayground'); return null; })() ||
        <DSAPlayground interviewId={jobId} onComplete={() => setCurrentStage(getNextStageAfterDSA())} />
      )}
      {((hasQuiz && hasDSATest && currentStage === 4) || 
        (hasQuiz && !hasDSATest && currentStage === 3) || 
        (!hasQuiz && hasDSATest && currentStage === 3) || 
        (!hasQuiz && !hasDSATest && currentStage === 2)) && (
        (() => { console.log('[UnifiedInterviewFlow] Rendering CandidatePreCheck'); return null; })() ||
        <CandidatePreCheck onComplete={() => setCurrentStage(getNextStageAfterDeviceCheck())} />
      )}
      {((hasQuiz && hasDSATest && currentStage === 5) || 
        (hasQuiz && !hasDSATest && currentStage === 4) || 
        (!hasQuiz && hasDSATest && currentStage === 4) || 
        (!hasQuiz && !hasDSATest && currentStage === 3)) && (
        (() => { console.log('[UnifiedInterviewFlow] Rendering VideoInterview'); return null; })() ||
        <VideoInterview onComplete={handleVideoInterviewComplete} />
      )}
      {currentStage === stages.length - 1 && (
        (() => { console.log('[UnifiedInterviewFlow] Rendering ThankYouStage'); return null; })() ||
        <ThankYouStage
          feedback={feedback}
          score={score}
          scoreBreakdown={scoreBreakdown}
          suggestions={suggestions}
          keywords={keywords}
          companyName={companyName}
          jobTitle={jobTitle}
          jobId={jobId.toString()}
        />
      )}
    </div>
  );
} 