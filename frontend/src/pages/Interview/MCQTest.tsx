import React, { useState, useEffect, useRef } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
  CardFooter,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { Timer, Brain, Award, AlertCircle } from "lucide-react";
import { motion } from "framer-motion";
import { Badge } from "@/components/ui/badge";
import html2canvas from "html2canvas";
import DraggableCameraFeed from "@/components/interview/DraggableCameraFeed";
import { interviewApi } from "@/services/interviewApi";
import { config } from "@/config";
import { AiInterviewedJobData } from "@/types/aiInterviewedJob";

interface QuizQuestion {
  id: number;
  description: string;
  options: {
    id: number;
    label: string;
    correct: boolean;
  }[];
  type: "single" | "multiple" | "true_false";
  category: "technical" | "aptitude";
  answerType: "single" | "multiple" | "true_false";
  time_seconds: number;
  image_url?: string;
}

interface QuestionTimer {
  questionId: number;
  timeLeft: number;
  isActive: boolean;
  isExpired: boolean;
}

interface MCQTestProps {
  onComplete?: () => void;
  interviewId?: string | number;
}

const MCQTest = ({ onComplete, interviewId: propInterviewId }: MCQTestProps) => {
  const navigate = useNavigate();
  const location = useLocation();
  const searchParams = new URLSearchParams(location.search);
  // Prefer prop, then URL param, then state
  const interviewId = propInterviewId?.toString() || searchParams.get("i_id") || (location.state && location.state.interviewId);
  const companyName = searchParams.get("company");
  const { interviewId: existingInterviewId, companyName: existingCompanyName } =
    location.state || {};
  const [questions, setQuestions] = useState<{
    technical: QuizQuestion[];
    aptitude: QuizQuestion[];
  }>({ technical: [], aptitude: [] });
  const [currentSection, setCurrentSection] = useState<
    "technical" | "aptitude"
  >(() => {
    // Always start with aptitude if available, otherwise technical
    return "aptitude";
  });
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [answers, setAnswers] = useState<{
    technical: (number | number[])[];
    aptitude: (number | number[])[];
  }>({ technical: [], aptitude: [] });
  const [questionTimers, setQuestionTimers] = useState<QuestionTimer[]>([]);
  const [isTestStarted, setIsTestStarted] = useState(false);
  const [showConfirmation, setShowConfirmation] = useState(false);
  const [countdown, setCountdown] = useState(3);
  const [isCountingDown, setIsCountingDown] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [warningShown, setWarningShown] = useState(false);
  const [markedForLater, setMarkedForLater] = useState<{
    technical: boolean[];
    aptitude: boolean[];
  }>({ technical: [], aptitude: [] });
  const [timingMode, setTimingMode] = useState<"per_question" | "whole_test">(
    "per_question"
  );
  const [wholeTestTimeLeft, setWholeTestTimeLeft] = useState<number>(0);
  const [screenshotInterval, setScreenshotInterval] =
    useState<NodeJS.Timeout | null>(null);
  const mainContentRef = useRef<HTMLDivElement>(null);
  const [showCamera, setShowCamera] = useState(false);

  useEffect(() => {
    const handleFullscreenChange = () => {
      if (
        !document.fullscreenElement &&
        !(document as any).webkitFullscreenElement &&
        !(document as any).msFullscreenElement
      ) {
        toast.warning("Please stay in fullscreen mode during the test");
      }
    };

    document.addEventListener("fullscreenchange", handleFullscreenChange);
    document.addEventListener("webkitfullscreenchange", handleFullscreenChange);
    document.addEventListener("msfullscreenchange", handleFullscreenChange);

    return () => {
      document.removeEventListener("fullscreenchange", handleFullscreenChange);
      document.removeEventListener(
        "webkitfullscreenchange",
        handleFullscreenChange
      );
      document.removeEventListener(
        "msfullscreenchange",
        handleFullscreenChange
      );
    };
  }, []);

  useEffect(() => {
    const fetchQuestions = async () => {
      try {
        console.log("Fetching quiz questions...");
        const response = await interviewApi.getQuizQuestionByInterviewId(interviewId || "");
        console.log("Raw quiz questions response:", response);
        console.log("Quiz questions data:", response.data);

        // First get the job ID from the interview
        const interviewResponse = await interviewApi.candidateGetInterview();
        const jobId = interviewResponse.data.ai_interviewed_job_id;
        console.log("Job ID from interview:", jobId);

        // Then fetch job details using the job ID
        const jobResponse = await interviewApi.getAiInterviewedJob(jobId.toString());
        console.log("Job details response:", jobResponse.data);

        // Check both mcq_timing_mode and quiz_time_minutes
        const timingMode = jobResponse.data.mcq_timing_mode || "per_question";
        const quizTimeMinutes = jobResponse.data.quiz_time_minutes;

        console.log("Job timing mode:", timingMode);
        console.log("Job quiz time minutes:", quizTimeMinutes);

        // Set timing mode based on job settings
        setTimingMode(timingMode);

        // If quiz_time_minutes exists, use whole test mode regardless of mcq_timing_mode
        if (quizTimeMinutes) {
          const totalSeconds = quizTimeMinutes * 60;
          console.log("Setting whole test time to:", totalSeconds, "seconds");
          setWholeTestTimeLeft(totalSeconds);
          setTimingMode("whole_test");
        }

        const processedQuestions = response.data.map((question: any) => {
          const answerType = question.type;
          const category = question.category.toLowerCase();
          // Only use question time if we're in per-question mode and there's no quiz_time_minutes
          const time_seconds =
            timingMode === "whole_test" || quizTimeMinutes
              ? 0
              : question.time_seconds || 60;
          console.log(`Question ${question.id} time_seconds:`, time_seconds);

          return {
            ...question,
            answerType,
            category,
            time_seconds,
          };
        });

        const technicalQuestions = processedQuestions.filter(
          (q: QuizQuestion) => q.category.toLowerCase() === "technical"
        );
        const aptitudeQuestions = processedQuestions.filter(
          (q: QuizQuestion) => q.category.toLowerCase() === "aptitude"
        );

        console.log("Technical questions:", technicalQuestions);
        console.log("Aptitude questions:", aptitudeQuestions);

        // Set questions first
        setQuestions({
          technical: technicalQuestions,
          aptitude: aptitudeQuestions,
        });

        // Set initial section based on available questions - always start with aptitude if available
        if (aptitudeQuestions.length > 0) {
          setCurrentSection("aptitude");
        } else if (technicalQuestions.length > 0) {
          setCurrentSection("technical");
        }

        // Set answers with proper initialization
        setAnswers({
          technical: technicalQuestions.map((q: QuizQuestion) =>
            q.answerType === "multiple" ? [] : -1
          ),
          aptitude: aptitudeQuestions.map((q: QuizQuestion) =>
            q.answerType === "multiple" ? [] : -1
          ),
        });

        // Initialize markedForLater with proper checks
        setMarkedForLater({
          technical:
            technicalQuestions.length > 0
              ? new Array(technicalQuestions.length).fill(false)
              : [],
          aptitude:
            aptitudeQuestions.length > 0
              ? new Array(aptitudeQuestions.length).fill(false)
              : [],
        });

        // Initialize question timers only if in per-question mode and no quiz_time_minutes
        if (timingMode === "per_question" && !quizTimeMinutes) {
          console.log("Initializing per-question timers");
          const allQuestions = [...technicalQuestions, ...aptitudeQuestions];
          if (allQuestions.length > 0) {
            const timers = allQuestions.map((q) => ({
              questionId: q.id,
              timeLeft: q.time_seconds,
              isActive: false,
              isExpired: false,
            }));
            console.log("Created question timers:", timers);
            setQuestionTimers(timers);
          }
        } else {
          console.log(
            "Whole test timer mode - not initializing per-question timers"
          );
          setQuestionTimers([]);
        }

        setIsLoading(false);
      } catch (error) {
        console.error("Error fetching quiz questions:", error);
        toast.error("Failed to load questions");
        setIsLoading(false);
      }
    };

    if (interviewId) {
      fetchQuestions();
    }
  }, [interviewId]);

  useEffect(() => {
    let timer: NodeJS.Timeout;

    if (isTestStarted) {
      console.log("Test started, timing mode:", timingMode);
      if (timingMode === "whole_test") {
        console.log(
          "Starting whole test timer with time left:",
          wholeTestTimeLeft
        );
        timer = setInterval(() => {
          setWholeTestTimeLeft((prev) => {
            if (prev <= 0) {
              console.log("Whole test time expired");
              handleSubmit();
              return 0;
            }
            // Show warning when 5 minutes are left
            if (prev === 300 && !warningShown) {
              console.log("5 minutes remaining warning");
              toast.warning("5 minutes remaining for the test!");
              setWarningShown(true);
            }
            return prev - 1;
          });
        }, 1000);
      } else {
        console.log("Starting per-question timers");
        timer = setInterval(() => {
          setQuestionTimers((prevTimers) => {
            return prevTimers.map((timer) => {
              if (timer.isActive && !timer.isExpired && timer.timeLeft > 0) {
                const newTimeLeft = timer.timeLeft - 1;
                console.log(
                  `Question ${timer.questionId} time left:`,
                  newTimeLeft
                );

                // Show warning when 10 seconds are left
                if (newTimeLeft === 10 && !warningShown) {
                  console.log(
                    `Question ${timer.questionId} 10 seconds remaining warning`
                  );
                  toast.warning("10 seconds remaining for this question!");
                  setWarningShown(true);
                }

                // If time runs out
                if (newTimeLeft === 0) {
                  console.log(`Question ${timer.questionId} time expired`);
                  toast.error("Time's up for this question!");
                  return { ...timer, timeLeft: 0, isExpired: true };
                }

                return { ...timer, timeLeft: newTimeLeft };
              }
              return timer;
            });
          });
        }, 1000);
      }
    }

    return () => {
      if (timer) {
        console.log("Cleaning up timer");
        clearInterval(timer);
      }
    };
  }, [isTestStarted, warningShown, timingMode]);

  useEffect(() => {
    let countdownTimer: NodeJS.Timeout;

    if (isCountingDown && countdown > 0) {
      countdownTimer = setInterval(() => {
        setCountdown((prev) => prev - 1);
      }, 1000);
    } else if (isCountingDown && countdown === 0) {
      setIsCountingDown(false);
      setIsTestStarted(true);
      // Activate timer for first question
      setQuestionTimers((prevTimers) => {
        console.log(questions, currentSection);
        const firstQuestion = questions[currentSection][0];
        return prevTimers.map((timer) => ({
          ...timer,
          isActive: timer.questionId === firstQuestion.id,
        }));
      });

      // Request fullscreen when test starts
      const element = document.documentElement;
      if (element.requestFullscreen) {
        element.requestFullscreen().catch((err) => {
          console.error(
            `Error attempting to enable fullscreen: ${err.message}`
          );
        });
      } else if ((element as any).webkitRequestFullscreen) {
        (element as any).webkitRequestFullscreen();
      } else if ((element as any).msRequestFullscreen) {
        (element as any).msRequestFullscreen();
      }
    }

    return () => {
      if (countdownTimer) {
        clearInterval(countdownTimer);
      }
    };
  }, [countdown, isCountingDown, questions, currentSection]);

  const handleAnswerSelect = (questionIndex: number, optionId: number) => {
    const currentQuestions = questions[currentSection];
    const question = currentQuestions[questionIndex];
    const newAnswers = { ...answers };
    const sectionAnswers = [...newAnswers[currentSection]];

    if (
      question.answerType === "single" ||
      question.answerType === "true_false"
    ) {
      sectionAnswers[questionIndex] = optionId;
    } else if (question.answerType === "multiple") {
      const currentAnswers = (sectionAnswers[questionIndex] as number[]) || [];
      if (currentAnswers.includes(optionId)) {
        sectionAnswers[questionIndex] = currentAnswers.filter(
          (id) => id !== optionId
        );
      } else {
        sectionAnswers[questionIndex] = [...currentAnswers, optionId];
      }
    }

    newAnswers[currentSection] = sectionAnswers;
    setAnswers(newAnswers);
  };

  const handleSubmit = async () => {
    const currentAnswers = answers[currentSection];
    const unanswered = currentAnswers.filter((answer) =>
      Array.isArray(answer) ? answer.length === 0 : answer === -1
    ).length;

    if (unanswered > 0) {
      // Show warning but allow submission
      toast.warning(
        `You have ${unanswered} unanswered questions. Submitting now...`
      );
    }

    if (currentSection === "aptitude" && questions.technical.length > 0) {
      // Move to technical section
      setCurrentSection("technical");
      setCurrentQuestionIndex(0);
      // Activate timer for first technical question
      setQuestionTimers((prevTimers) => {
        const firstQuestion = questions.technical[0];
        return prevTimers.map((timer) => ({
          ...timer,
          isActive: timer.questionId === firstQuestion.id,
        }));
      });
      return;
    }

    try {
      // Only include answered questions in the submission
      const allResponses = [
        ...questions.aptitude.map((question, index) => {
          const answer = answers.aptitude[index];
          // Skip unanswered questions
          if (Array.isArray(answer) && answer.length === 0) return null;
          if (!Array.isArray(answer) && answer === -1) return null;

          if (Array.isArray(answer)) {
            return answer.map((optionId) => ({
              quiz_question_id: question.id,
              quiz_option_id: optionId,
            }));
          }
          return [
            {
              quiz_question_id: question.id,
              quiz_option_id: answer,
            },
          ];
        }),
        ...questions.technical.map((question, index) => {
          const answer = answers.technical[index];
          // Skip unanswered questions
          if (Array.isArray(answer) && answer.length === 0) return null;
          if (!Array.isArray(answer) && answer === -1) return null;

          if (Array.isArray(answer)) {
            return answer.map((optionId) => ({
              quiz_question_id: question.id,
              quiz_option_id: optionId,
            }));
          }
          return [
            {
              quiz_question_id: question.id,
              quiz_option_id: answer,
            },
          ];
        }),
      ]
        .flat()
        .filter((response) => response !== null); // Remove null entries

      await interviewApi.submitQuizResponses(allResponses);
      handleTestComplete();
    } catch (error) {
      toast.error("Failed to submit answers");
    }
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  const handleStartTest = () => {
    setShowConfirmation(true);
  };

  const handleConfirmStart = () => {
    setShowConfirmation(false);
    setIsCountingDown(true);
    setCountdown(3);
  };

  const handleTestComplete = () => {
    // Clear screenshot interval when test completes
    if (screenshotInterval) {
      console.log("[MCQ Screenshot] Clearing screenshot interval - test completed");
      clearInterval(screenshotInterval);
      setScreenshotInterval(null);
    }
    
    if (onComplete) {
      onComplete();
      return;
    }
    const urlParams = new URLSearchParams(window.location.search);
    const i_id = urlParams.get("i_id");
    const company = urlParams.get("company");

    interviewApi.updateInterview({status: "Quiz Completed"}).then(() => {
      console.log("Interview updated successfully");

      if (i_id && company) {
        interviewApi
          .candidateGetInterview()
          .then((interviewResponse) => {
            const jobId = interviewResponse.data.ai_interviewed_job_id;
            return interviewApi.getAiInterviewedJob(jobId);
          })
          .then((response) => {
            const jobData: AiInterviewedJobData = response.data;
            if (jobData.hasDSATest) {
              navigate(
                `/interview/dsa-playground?i_id=${i_id}&company=${company}`
              );
            } else {
              navigate(`/interview/video?i_id=${i_id}&company=${company}`);
            }
          })
          .catch((error) => {
            console.error("Error fetching job data:", error);
            navigate(`/interview/video?i_id=${i_id}&company=${company}`);
          });
      }
    }).catch((err) => {
      console.error("Error updating interview:", err);
    });

    
  };

  const handleNext = () => {
    if (currentQuestionIndex < questions[currentSection].length - 1) {
      const newIndex = currentQuestionIndex + 1;
      setCurrentQuestionIndex(newIndex);
      const question = questions[currentSection][newIndex];

      // Update timers
      setQuestionTimers((prevTimers) => {
        return prevTimers.map((timer) => ({
          ...timer,
          isActive: timer.questionId === question.id,
        }));
      });
    } else if (
      currentSection === "aptitude" &&
      questions.technical.length > 0
    ) {
      // Only move to technical section if we're on the last aptitude question
      if (currentQuestionIndex === questions.aptitude.length - 1) {
        setCurrentSection("technical");
        setCurrentQuestionIndex(0);
        // Activate timer for first technical question
        setQuestionTimers((prevTimers) => {
          const firstQuestion = questions.technical[0];
          return prevTimers.map((timer) => ({
            ...timer,
            isActive: timer.questionId === firstQuestion.id,
          }));
        });
      }
    }
  };

  const handlePrevious = () => {
    if (currentQuestionIndex > 0) {
      const newIndex = currentQuestionIndex - 1;
      setCurrentQuestionIndex(newIndex);
      const question = questions[currentSection][newIndex];

      // Update timers
      setQuestionTimers((prevTimers) => {
        return prevTimers.map((timer) => ({
          ...timer,
          isActive: timer.questionId === question.id,
        }));
      });
    } else if (
      currentSection === "technical" &&
      questions.aptitude.length > 0
    ) {
      // Move back to aptitude section
      setCurrentSection("aptitude");
      setCurrentQuestionIndex(questions.aptitude.length - 1);
      // Activate timer for last aptitude question
      setQuestionTimers((prevTimers) => {
        const lastQuestion = questions.aptitude[questions.aptitude.length - 1];
        return prevTimers.map((timer) => ({
          ...timer,
          isActive: timer.questionId === lastQuestion.id,
        }));
      });
    }
  };

  const handleMarkForLater = (index: number) => {
    setMarkedForLater((prev) => ({
      ...prev,
      [currentSection]: prev[currentSection].map((marked, i) =>
        i === index ? !marked : marked
      ),
    }));
  };

  const getCurrentQuestionTimer = () => {
    if (timingMode === "whole_test") {
      return { timeLeft: wholeTestTimeLeft };
    }
    const currentQuestion = questions[currentSection][currentQuestionIndex];
    return questionTimers.find(
      (timer) => timer.questionId === currentQuestion.id
    );
  };

  const renderTimer = () => {
    if (timingMode === "whole_test") {
      return (
        <div className="flex items-center gap-2">
          <Timer className="h-5 w-5 text-destructive" />
          <span className="font-medium">{formatTime(wholeTestTimeLeft)}</span>
        </div>
      );
    }
    const timer = getCurrentQuestionTimer();
    return (
      <div className="flex items-center gap-2">
        <Timer className="h-5 w-5 text-destructive" />
        <span className="font-medium">{formatTime(timer?.timeLeft || 0)}</span>
      </div>
    );
  };

  const renderQuestionOptions = (
    question: QuizQuestion,
    questionIndex: number
  ) => {
    const timer = questionTimers.find((t) => t.questionId === question.id);
    const isExpired = timer?.isExpired;

    if (
      question.answerType === "single" ||
      question.answerType === "true_false"
    ) {
      return (
        <RadioGroup
          value={answers[currentSection][questionIndex]?.toString()}
          onValueChange={(value) =>
            handleAnswerSelect(questionIndex, parseInt(value))
          }
          name={`question-${currentSection}-${question.id}`}
          className="space-y-2"
          disabled={isExpired}
        >
          {question.options.map((option) => (
            <div key={option.id} className="flex items-center space-x-2">
              <RadioGroupItem
                value={option.id.toString()}
                id={`option-${currentSection}-${question.id}-${option.id}`}
                disabled={isExpired}
              />
              <Label
                htmlFor={`option-${currentSection}-${question.id}-${option.id}`}
              >
                {option.label}
              </Label>
            </div>
          ))}
        </RadioGroup>
      );
    }

    if (question.answerType === "multiple") {
      return (
        <div className="space-y-2">
          {question.options.map((option) => (
            <div key={option.id} className="flex items-center space-x-2">
              <Checkbox
                id={`option-${currentSection}-${question.id}-${option.id}`}
                checked={
                  Array.isArray(answers[currentSection][questionIndex])
                    ? (
                        answers[currentSection][questionIndex] as number[]
                      ).includes(option.id)
                    : false
                }
                onCheckedChange={() =>
                  handleAnswerSelect(questionIndex, option.id)
                }
                disabled={isExpired}
              />
              <Label
                htmlFor={`option-${currentSection}-${question.id}-${option.id}`}
              >
                {option.label}
              </Label>
            </div>
          ))}
        </div>
      );
    }

    return null;
  };

  // Add screenshot capture function
  const captureAndSendScreenshot = async () => {
    try {
      console.log("[MCQ Screenshot] Starting capture process...");
      const startTime = performance.now();

      // Create canvas from the entire page
      const canvas = await html2canvas(document.documentElement, {
        scale: 1,
        useCORS: true,
        logging: false,
        windowWidth: document.documentElement.scrollWidth,
        windowHeight: document.documentElement.scrollHeight,
      });

      // Convert canvas to blob
      const blob = await new Promise<Blob | null>((resolve) => {
        canvas.toBlob((blob) => resolve(blob), "image/png");
      });

      if (!blob) {
        console.error("[Screenshot] Failed to create blob from canvas");
        return;
      }

      console.log(
        `[Screenshot] Blob created successfully (${(blob.size / 1024).toFixed(
          2
        )} KB)`
      );

      // Get interview ID from props or URL
      const interviewId = propInterviewId || (() => {
        const urlParams = new URLSearchParams(window.location.search);
        return urlParams.get("i_id");
      })();

      if (!interviewId) {
        console.error("[MCQ Screenshot] No interview ID found in props or URL");
        return;
      }

      console.log("[Screenshot] Sending to backend...");
      const response = await fetch(
        `${config.API_BASE_URL}/interview/screenshot`,
        {
          method: "POST",
          body: blob,
          headers: {
            Authorization: `Bearer ${localStorage.getItem("i_token")}`,
          },
        }
      );

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result = await response.json();
      const endTime = performance.now();
      console.log(
        `[MCQ Screenshot] Successfully saved (${(
          (endTime - startTime) /
          1000
        ).toFixed(2)}s)`,
        result
      );
    } catch (err) {
      console.error("[MCQ Screenshot] Error during capture/upload:", err);
      toast.error("Failed to capture screenshot");
    }
  };

  // Start screenshot interval when test starts
  useEffect(() => {
    if (isTestStarted) {
      console.log("[MCQ Screenshot] Test started, setting up screenshot interval");
      // Clear any existing interval
      if (screenshotInterval) {
        clearInterval(screenshotInterval);
      }
      // Start new interval
      const interval = setInterval(() => {
        console.log("[MCQ Screenshot] Taking screenshot...");
        captureAndSendScreenshot();
      }, 30000); // Every 30 seconds
      setScreenshotInterval(interval);
      console.log("[MCQ Screenshot] Screenshot interval set up successfully");

      // Cleanup on unmount
      return () => {
        if (interval) {
          clearInterval(interval);
        }
      };
    } else {
      console.log("[MCQ Screenshot] Test not started yet");
    }
  }, [isTestStarted]);

  // Start camera when test starts
  useEffect(() => {
    if (isTestStarted) {
      setShowCamera(true);
    }
  }, [isTestStarted]);

  // Stop camera when test ends
  useEffect(() => {
    if (!isTestStarted) {
      setShowCamera(false);
    }
  }, [isTestStarted]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (questions.aptitude.length === 0 && questions.technical.length === 0) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle>No Questions Available</CardTitle>
          </CardHeader>
          <CardContent>
            <p>There are no quiz questions available for this interview.</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background py-8 px-4">
      {!isTestStarted && !isCountingDown && (
        <div className="max-w-4xl mx-auto">
          <Card className="mb-8">
            <CardHeader>
              <CardTitle className="text-2xl font-bold">MCQ Test</CardTitle>
              <CardDescription>
                Welcome to the MCQ test section. This test consists of{" "}
                {questions.aptitude.length + questions.technical.length}{" "}
                questions.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="flex items-center space-x-3 p-4 rounded-lg border">
                  <Timer className="h-5 w-5 text-primary" />
                  <div>
                    <p className="font-medium">Time Limit</p>
                    <p className="text-sm text-muted-foreground">
                      {timingMode === "whole_test"
                        ? `${Math.floor(
                            wholeTestTimeLeft / 60
                          )} minutes for the whole test`
                        : "Individual timers per question"}
                    </p>
                  </div>
                </div>
                <div className="flex items-center space-x-3 p-4 rounded-lg border">
                  <Brain className="h-5 w-5 text-primary" />
                  <div>
                    <p className="font-medium">Total Questions</p>
                    <p className="text-sm text-muted-foreground">
                      {questions.aptitude.length + questions.technical.length}
                    </p>
                  </div>
                </div>
                <div className="flex items-center space-x-3 p-4 rounded-lg border">
                  <Award className="h-5 w-5 text-primary" />
                  <div>
                    <p className="font-medium">Passing Score</p>
                    <p className="text-sm text-muted-foreground">60%</p>
                  </div>
                </div>
              </div>
            </CardContent>
            <CardFooter>
              <Button onClick={handleStartTest} className="w-full">
                Start Test
              </Button>
            </CardFooter>
          </Card>
        </div>
      )}

      {isCountingDown && (
        <div className="fixed inset-0 flex items-center justify-center bg-background/80 backdrop-blur-sm">
          <motion.div
            initial={{ scale: 0.5 }}
            animate={{ scale: 1 }}
            className="text-6xl font-bold text-foreground"
          >
            {countdown}
          </motion.div>
        </div>
      )}

      {isTestStarted && (
        <div className="flex flex-col gap-6" ref={mainContentRef}>
          {/* Section Navigation */}
          <div className="flex justify-between items-center p-4 bg-card rounded-lg border">
            <div className="flex gap-4">
              {questions.aptitude.length > 0 && (
                <Button
                  variant={
                    currentSection === "aptitude" ? "default" : "outline"
                  }
                  onClick={() => setCurrentSection("aptitude")}
                >
                  Aptitude Section
                  <Badge variant="secondary" className="ml-2">
                    {
                      answers.aptitude.filter(
                        (a) =>
                          a !== -1 && (Array.isArray(a) ? a.length > 0 : true)
                      ).length
                    }
                    /{questions.aptitude.length}
                  </Badge>
                </Button>
              )}
              {questions.technical.length > 0 && (
                <Button
                  variant={
                    currentSection === "technical" ? "default" : "outline"
                  }
                  onClick={() => setCurrentSection("technical")}
                >
                  Technical Section
                  <Badge variant="secondary" className="ml-2">
                    {
                      answers.technical.filter(
                        (a) =>
                          a !== -1 && (Array.isArray(a) ? a.length > 0 : true)
                      ).length
                    }
                    /{questions.technical.length}
                  </Badge>
                </Button>
              )}
            </div>
            <Button onClick={handleSubmit} variant="destructive">
              Submit Test
            </Button>
          </div>

          <div className="flex gap-6">
            {/* Side Panel */}
            <div className="w-64 shrink-0 sticky top-4 self-start">
              <Card className="sticky top-4">
                <CardHeader>
                  <CardTitle className="text-lg">Questions</CardTitle>
                  <CardDescription>
                    {currentSection === "aptitude"
                      ? `${
                          answers.aptitude.filter(
                            (a) =>
                              a !== -1 &&
                              (Array.isArray(a) ? a.length > 0 : true)
                          ).length
                        } of ${questions.aptitude.length} answered`
                      : `${
                          answers.technical.filter(
                            (a) =>
                              a !== -1 &&
                              (Array.isArray(a) ? a.length > 0 : true)
                          ).length
                        } of ${questions.technical.length} answered`}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div>
                      <h3 className="font-medium mb-2">Aptitude Questions</h3>
                      <div className="grid grid-cols-5 gap-2">
                        {questions.aptitude.map((_, index) => {
                          const isAnswered =
                            answers.aptitude[index] !== -1 &&
                            (Array.isArray(answers.aptitude[index])
                              ? answers.aptitude[index].length > 0
                              : true);
                          const isMarked = markedForLater.aptitude[index];
                          const timer = questionTimers.find(
                            (t) => t.questionId === questions.aptitude[index].id
                          );
                          const isExpired = timer?.isExpired;

                          return (
                            <Button
                              key={index}
                              variant={
                                isMarked
                                  ? "secondary"
                                  : isAnswered
                                  ? "default"
                                  : "outline"
                              }
                              size="sm"
                              className={`w-full h-10 ${
                                isMarked
                                  ? "bg-amber-100 hover:bg-amber-200 dark:bg-amber-900/20 text-amber-900 dark:text-amber-100 border-2 border-amber-400"
                                  : isAnswered
                                  ? "bg-emerald-100 hover:bg-emerald-200 dark:bg-emerald-900/20 text-emerald-900 dark:text-emerald-100 border-2 border-emerald-400"
                                  : isExpired
                                  ? "bg-red-100 hover:bg-red-200 dark:bg-red-900/20 text-red-900 dark:text-red-100 border-2 border-red-400"
                                  : "hover:bg-accent"
                              }`}
                              onClick={() => {
                                setCurrentSection("aptitude");
                                setCurrentQuestionIndex(index);
                                const question = questions.aptitude[index];
                                setQuestionTimers((prevTimers) => {
                                  return prevTimers.map((timer) => ({
                                    ...timer,
                                    isActive: timer.questionId === question.id,
                                  }));
                                });
                              }}
                            >
                              {index + 1}
                            </Button>
                          );
                        })}
                      </div>
                    </div>
                    {questions.technical.length > 0 && (
                      <div>
                        <h3 className="font-medium mb-2">
                          Technical Questions
                        </h3>
                        <div className="grid grid-cols-5 gap-2">
                          {questions.technical.map((_, index) => {
                            const isAnswered =
                              answers.technical[index] !== -1 &&
                              (Array.isArray(answers.technical[index])
                                ? answers.technical[index].length > 0
                                : true);
                            const isMarked = markedForLater.technical[index];
                            const timer = questionTimers.find(
                              (t) =>
                                t.questionId === questions.technical[index].id
                            );
                            const isExpired = timer?.isExpired;

                            return (
                              <Button
                                key={index}
                                variant={
                                  isMarked
                                    ? "secondary"
                                    : isAnswered
                                    ? "default"
                                    : "outline"
                                }
                                size="sm"
                                className={`w-full h-10 ${
                                  isMarked
                                    ? "bg-amber-100 hover:bg-amber-200 dark:bg-amber-900/20 text-amber-900 dark:text-amber-100 border-2 border-amber-400"
                                    : isAnswered
                                    ? "bg-emerald-100 hover:bg-emerald-200 dark:bg-emerald-900/20 text-emerald-900 dark:text-emerald-100 border-2 border-emerald-400"
                                    : isExpired
                                    ? "bg-red-100 hover:bg-red-200 dark:bg-red-900/20 text-red-900 dark:text-red-100 border-2 border-red-400"
                                    : "hover:bg-accent"
                                }`}
                                onClick={() => {
                                  setCurrentSection("technical");
                                  setCurrentQuestionIndex(index);
                                  const question = questions.technical[index];
                                  setQuestionTimers((prevTimers) => {
                                    return prevTimers.map((timer) => ({
                                      ...timer,
                                      isActive:
                                        timer.questionId === question.id,
                                    }));
                                  });
                                }}
                              >
                                {index + 1}
                              </Button>
                            );
                          })}
                        </div>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Main Content */}
            <div className="flex-1">
              <Card>
                <CardHeader>
                  <div className="space-y-4">
                    <div className="flex justify-between items-center">
                      <div>
                        <CardTitle>
                          MCQ Test -{" "}
                          {currentSection === "aptitude"
                            ? "Aptitude"
                            : "Technical"}{" "}
                          Section
                        </CardTitle>
                        <CardDescription>
                          Question {currentQuestionIndex + 1} of{" "}
                          {questions[currentSection].length}
                        </CardDescription>
                      </div>
                      <div className="flex items-center gap-2">
                        {renderTimer()}
                      </div>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="space-y-6">
                  {(() => {
                    const question =
                      questions[currentSection][currentQuestionIndex];
                    const timer = questionTimers.find(
                      (t) => t.questionId === question.id
                    );
                    const isExpired = timer?.isExpired;

                    return (
                      <div className="p-6 rounded-lg border border-border">
                        <div className="flex items-center justify-between mb-4">
                          <div className="flex items-center gap-4">
                            <h3 className="text-lg font-semibold">
                              Question {currentQuestionIndex + 1}
                            </h3>
                            <Badge variant="outline">
                              {question.answerType === "true_false"
                                ? "True/False"
                                : question.answerType === "multiple"
                                ? "Multiple Choice"
                                : "Single Choice"}
                            </Badge>
                          </div>
                          <Button
                            variant={
                              markedForLater[currentSection][
                                currentQuestionIndex
                              ]
                                ? "secondary"
                                : "outline"
                            }
                            size="sm"
                            onClick={() =>
                              handleMarkForLater(currentQuestionIndex)
                            }
                            className={`${
                              markedForLater[currentSection][
                                currentQuestionIndex
                              ]
                                ? "bg-yellow-100 hover:bg-yellow-200 dark:bg-yellow-900/20 text-yellow-900 dark:text-yellow-100"
                                : "hover:bg-yellow-50 dark:hover:bg-yellow-900/10"
                            }`}
                          >
                            {markedForLater[currentSection][
                              currentQuestionIndex
                            ]
                              ? "Marked for Later"
                              : "Mark for Later"}
                          </Button>
                        </div>
                        <div className="space-y-4">
                          <p className="text-lg">{question.description}</p>

                          {question.image_url && (
                            <div className="my-4">
                              <img
                                src={question.image_url}
                                alt="Question image"
                                className="max-w-full max-h-96 object-contain rounded-lg border border-border"
                              />
                            </div>
                          )}

                          {renderQuestionOptions(
                            question,
                            currentQuestionIndex
                          )}
                        </div>
                        {isExpired && (
                          <div className="mt-4 p-4 bg-red-50 dark:bg-red-900/20 text-red-900 dark:text-red-100 rounded-lg">
                            <p className="flex items-center gap-2">
                              <AlertCircle className="h-5 w-5" />
                              Time's up for this question!
                            </p>
                          </div>
                        )}
                      </div>
                    );
                  })()}
                </CardContent>
                <CardFooter className="flex justify-between border-t pt-6">
                  <Button
                    variant="outline"
                    onClick={handlePrevious}
                    disabled={currentQuestionIndex === 0}
                  >
                    Previous
                  </Button>
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      onClick={handleNext}
                      disabled={
                        (currentSection === "aptitude" &&
                          currentQuestionIndex ===
                            questions.aptitude.length - 1) ||
                        (currentSection === "technical" &&
                          currentQuestionIndex ===
                            questions.technical.length - 1)
                      }
                    >
                      Next
                    </Button>
                    {currentSection === "aptitude" &&
                      currentQuestionIndex === questions.aptitude.length - 1 &&
                      questions.technical.length > 0 && (
                        <Button
                          onClick={() => {
                            setCurrentSection("technical");
                            setCurrentQuestionIndex(0);
                            // Activate timer for first technical question
                            setQuestionTimers((prevTimers) => {
                              const firstQuestion = questions.technical[0];
                              return prevTimers.map((timer) => ({
                                ...timer,
                                isActive: timer.questionId === firstQuestion.id,
                              }));
                            });
                          }}
                        >
                          Next Section
                        </Button>
                      )}
                  </div>
                </CardFooter>
              </Card>
            </div>
          </div>
        </div>
      )}

      {showConfirmation && (
        <div className="fixed inset-0 flex items-center justify-center bg-background/80 backdrop-blur-sm">
          <Card className="w-full max-w-md">
            <CardHeader>
              <CardTitle>Start Test?</CardTitle>
              <CardDescription>
                Each question has its own timer. Once you start, you cannot
                pause the test. Are you ready?
              </CardDescription>
            </CardHeader>
            <CardFooter className="flex justify-end space-x-2">
              <Button
                variant="outline"
                onClick={() => setShowConfirmation(false)}
              >
                Cancel
              </Button>
              <Button onClick={handleConfirmStart}>Start</Button>
            </CardFooter>
          </Card>
        </div>
      )}

      {showCamera && (
        <DraggableCameraFeed
          onCameraError={(error) => {
            toast.error(error);
            setShowCamera(false);
          }}
        />
      )}
    </div>
  );
};

export default MCQTest;
