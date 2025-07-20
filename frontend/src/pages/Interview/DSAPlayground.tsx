import React, { useState, useEffect, useRef } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import DsaQuestion from "../../components/common/DsaQuestion";
import CodeExecutionPanel from "./CodeExecutionPanel";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import {
  ArrowRight,
  Code,
  Clock,
  CheckCircle,
  Terminal,
  Timer,
} from "lucide-react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Loader2 } from "lucide-react";
import { Panel, PanelGroup, PanelResizeHandle } from "react-resizable-panels";
import { toast } from "sonner";
import DraggableCameraFeed from "@/components/interview/DraggableCameraFeed";
import html2canvas from "html2canvas";
import { InterviewData } from "@/types/interview";
import { interviewApi } from "@/services/interviewApi";
import { DSAQuestion, TestCase } from "@/types/aiInterviewedJob";
import { config } from "@/config";

const DSAPlayground = ({ onComplete, interviewId: propInterviewId }: { onComplete?: () => void; interviewId?: string | number }) => {
  const [searchParams] = useSearchParams();
  const urlInterviewId = searchParams.get("i_id");
  const [activeTab, setActiveTab] = React.useState("welcome");
  const [compilationStatus, setCompilationStatus] = React.useState<string>("");
  const [successRate, setSuccessRate] = React.useState<string>("");
  const [socket, setSocket] = React.useState<WebSocket>();
  const navigate = useNavigate();

  const [timeLeft, setTimeLeft] = useState(0);
  const [isTestStarted, setIsTestStarted] = useState(false);
  const [warningShown, setWarningShown] = useState(false);
  const [interviewData, setInterviewData] = useState<InterviewData>({});
  const [isLoading, setIsLoading] = useState(false);
  const [dsaQuestions, setDsaQuestions] = useState<DSAQuestion[]>([]);
  const [runStatus, setRunStatus] = useState<string>("");
  const [screenshotInterval, setScreenshotInterval] =
    useState<NodeJS.Timeout | null>(null);

  // Add screenshot capture function
  const captureAndSendScreenshot = async () => {
    try {
      console.log("[DSA Screenshot] Starting capture process...");
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
      const interviewId = propInterviewId || urlInterviewId;

      if (!interviewId) {
        console.error("[DSA Screenshot] No interview ID found in props or URL");
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
        `[DSA Screenshot] Successfully saved (${(
          (endTime - startTime) /
          1000
        ).toFixed(2)}s)`,
        result
      );
    } catch (err) {
      console.error("[DSA Screenshot] Error during capture/upload:", err);
      toast.error("Failed to capture screenshot");
    }
  };

  // Start screenshot interval when test starts
  useEffect(() => {
    if (isTestStarted) {
      console.log("[DSA Screenshot] Test started, setting up screenshot interval");
      // Clear any existing interval
      if (screenshotInterval) {
        clearInterval(screenshotInterval);
      }
      // Start new interval
      const interval = setInterval(() => {
        console.log("[DSA Screenshot] Taking screenshot...");
        captureAndSendScreenshot();
      }, 30000); // Every 30 seconds
      setScreenshotInterval(interval);
      console.log("[DSA Screenshot] Screenshot interval set up successfully");
    } else {
      console.log("[DSA Screenshot] Test not started yet");
      // Clear interval when test stops
      if (screenshotInterval) {
        console.log("[DSA Screenshot] Clearing screenshot interval - test stopped");
        clearInterval(screenshotInterval);
        setScreenshotInterval(null);
      }
    }

    // Cleanup on unmount
    return () => {
      if (screenshotInterval) {
        clearInterval(screenshotInterval);
      }
    };
  }, [isTestStarted]);

  // Add fullscreen effect hook with other useEffect hooks
  useEffect(() => {
    const handleFullscreenChange = () => {
      if (
        !document.fullscreenElement &&
        !(document as any).webkitFullscreenElement &&
        !(document as any).msFullscreenElement
      ) {
        toast.warning("Please stay in fullscreen mode during the assessment");
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

  React.useEffect(() => {
    const socket = new WebSocket(
      import.meta.env.VITE_DSA_WS_BASE_URL +
        "?i_token=" +
        localStorage.getItem("i_token")
    );

    socket.onopen = () => {
      console.log("Websocket connection established");
    };
    socket.onmessage = (e) => {
      const data = JSON.parse(e.data);

      if (data.event == "execution_result") {
        if (data.status == "successful") {
          console.log("Total Test Cases Passed: ", data.passed_count);
          setCompilationStatus(
            `Passed All Test Cases (${data.passed_count}/${data.passed_count})`
          );
          setRunStatus("successful");
        } else if (data.status == "failed") {
          let errorMessage = "Failed a test case\n";
          if (data.failed_test_case) {
            errorMessage += `Input: ${data.failed_test_case.input}\n`;
            errorMessage += `Expected output: ${data.failed_test_case.expected_output}\n`;
            errorMessage += `Your Output: ${
              data.failed_test_case.status === "wrong-answer"
                ? data.failed_test_case.output
                : data.failed_test_case.compilation_output
            }`;
            if (data.failed_test_case.execution_err) {
              errorMessage += `\nError: ${data.failed_test_case.execution_err}`;
            }
          }
          setCompilationStatus(errorMessage);
          setRunStatus("failed");
        } else if (data.status === "error") {
          setCompilationStatus(
            `Error: ${data.error || "Unknown error occurred"}`
          );
          setRunStatus("error");
        }
      }
    };
    setSocket(socket);
  }, []);

  useEffect(() => {
    setIsLoading(true);
    interviewApi
      .candidateGetInterview()
      .then((res) => {
        console.log(res)
        setInterviewData(res.data);
      })
      .finally(() => {
        setIsLoading(false);
      });
  }, []);

  useEffect(() => {
    if (!interviewData || !interviewData.ai_interviewed_job_id) {
      return;
    }
    interviewApi
      .getDSAQuestion(interviewData.ai_interviewed_job_id?.toString())
      .then((res) => {
        setDsaQuestions(res.data);
      })
      .finally(() => {
        setIsLoading(false);
      });
  }, [interviewData]);

  const [currentQuestionIndex, setCurrentQuestionIndex] = React.useState(0);

  // Get current question and test cases
  const currentQuestion = dsaQuestions?.[currentQuestionIndex];

  const handleNext = () => {
    if (currentQuestionIndex < dsaQuestions.length - 1) {
      setCurrentQuestionIndex((prev) => prev + 1);
      setCompilationStatus("");
      setRunStatus("");
    }
  };

  const handleSubmit = () => {
    console.log("Submit DSA exam at question index", currentQuestionIndex);
      
    // Clear screenshot interval when test ends
    if (screenshotInterval) {
      console.log("[DSA Screenshot] Clearing screenshot interval on test submission");
      clearInterval(screenshotInterval);
      setScreenshotInterval(null);
    }
    
    handleComplete();
  };

  const handleComplete = () => {
    if (onComplete) {
      onComplete();
      return;
    }
    const urlParams = new URLSearchParams(window.location.search);
    const i_id = urlParams.get("i_id");
    const company = urlParams.get("company");

    if (i_id && company) {
      navigate(`/interview/video?i_id=${i_id}&company=${company}`);
    }
  };

  // Add loggers before rendering navigation buttons
  console.log("DSA Questions:", dsaQuestions);
  console.log("Current Question Index:", currentQuestionIndex);
  console.log("Current Question:", currentQuestion);

  // Calculate total time based on questions' time_minutes
  const calculateTotalTime = (questions: DSAQuestion[]) => {
    console.log("Calculating total time for DSA questions:", questions);
    const totalTime = questions.reduce((total, question) => {
      const questionTime = question.time_minutes || 30;
      console.log(`DSA Question ${question.id}: ${questionTime} minutes`);
      return total + questionTime;
    }, 0);
    const totalSeconds = totalTime * 60;
    console.log(
      "Total time calculated:",
      totalTime,
      "minutes (",
      totalSeconds,
      "seconds)"
    );
    return totalSeconds;
  };

  useEffect(() => {
    if (dsaQuestions && dsaQuestions.length > 0) {
      console.log("Setting up timer for DSA questions:", dsaQuestions);
      const totalTime = calculateTotalTime(dsaQuestions);
      console.log(
        "Setting total time for DSA assessment:",
        totalTime,
        "seconds"
      );
      setTimeLeft(totalTime);
    }
  }, [dsaQuestions]);

  useEffect(() => {
    let timer: NodeJS.Timeout;

    if (isTestStarted && timeLeft > 0) {
      timer = setInterval(() => {
        setTimeLeft((prev) => {
          const newTime = prev - 1;

          // Show warning when 5 minutes is left
          if (newTime === 300 && !warningShown) {
            console.log("5 minutes remaining warning triggered");
            toast.warning("5 minutes remaining!");
            setWarningShown(true);
          }

          return newTime;
        });
      }, 1000);
    } else if (isTestStarted && timeLeft === 0) {
      console.log("Time is up, submitting DSA assessment");
      // Time's up, submit the test
      handleSubmit();
    }

    return () => {
      if (timer) {
        clearInterval(timer);
      }
    };
  }, [timeLeft, isTestStarted, warningShown]);
  
  // Cleanup screenshot interval on component unmount
  useEffect(() => {
    return () => {
      if (screenshotInterval) {
        console.log("[Screenshot] Cleaning up screenshot interval on unmount");
        clearInterval(screenshotInterval);
      }
    };
  }, [screenshotInterval]);


  const formatTime = (seconds: number) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    return `${hours > 0 ? `${hours}:` : ""}${minutes
      .toString()
      .padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
  };

  const handleStartAssessment = () => {
    setIsTestStarted(true);
    setActiveTab("playground");
    
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
  };

  if (isLoading) {
    return (
      <div className="h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  if (!dsaQuestions || dsaQuestions.length === 0) {
    return (
      <div className="h-screen flex items-center justify-center">
        <p className="text-red-500">No DSA questions or test cases found</p>
      </div>
    );
  }

  if (!currentQuestion) {
    console.error(
      "Current question is undefined! Index:",
      currentQuestionIndex,
      "Questions:",
      dsaQuestions
    );
    return (
      <div className="h-screen flex items-center justify-center">
        <p className="text-red-500">
          Error: Current question is undefined. Please refresh or contact
          support.
        </p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <DraggableCameraFeed />
      <div className="container mx-auto px-4 py-8">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold">DSA Playground</h1>
          <div className="flex items-center gap-2">
            <Timer className="h-5 w-5 text-destructive" />
            <span className="font-medium">{formatTime(timeLeft)}</span>
          </div>
        </div>

        <div className="h-screen flex flex-col">
          <div className="flex-1 overflow-hidden">
            <Tabs
              value={activeTab}
              onValueChange={setActiveTab}
              className="h-full flex flex-col"
            >
              <TabsList className="bg-muted/20 w-full justify-start border-b shrink-0">
                <TabsTrigger
                  value="welcome"
                  className="data-[state=active]:bg-background data-[state=active]:text-foreground rounded-none border-b-2 border-transparent data-[state=active]:border-primary px-4 py-2"
                >
                  Welcome
                </TabsTrigger>
                <TabsTrigger
                  value="playground"
                  className="data-[state=active]:bg-background data-[state=active]:text-foreground rounded-none border-b-2 border-transparent data-[state=active]:border-primary px-4 py-2"
                >
                  DSA Playground
                </TabsTrigger>
              </TabsList>

              <TabsContent value="welcome" className="flex-1 overflow-auto p-4">
                <div className="max-w-3xl mx-auto h-full flex flex-col">
                  <div className="text-center mb-4">
                    <h1 className="text-3xl font-bold mb-2">
                      Welcome to DSA Assessment
                    </h1>
                    <p className="text-muted-foreground">
                      Let's test your problem-solving skills
                    </p>
                  </div>

                  <div className="flex-1 space-y-4">
                    <Card>
                      <CardHeader className="pb-3">
                        <CardTitle>What to Expect</CardTitle>
                        <CardDescription>
                          Here's what you'll be doing in this assessment
                        </CardDescription>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-3">
                          <div className="flex items-start gap-3">
                            <div className="flex-shrink-0 h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center">
                              <Code className="h-4 w-4 text-primary" />
                            </div>
                            <div>
                              <h3 className="font-medium">Problem Solving</h3>
                              <p className="text-muted-foreground text-sm">
                                You'll be given a coding problem to solve. Take
                                your time to understand the requirements and
                                constraints.
                              </p>
                            </div>
                          </div>
                          <div className="flex items-start gap-3">
                            <div className="flex-shrink-0 h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center">
                              <Clock className="h-4 w-4 text-primary" />
                            </div>
                            <div>
                              <h3 className="font-medium">Time Management</h3>
                              <p className="text-muted-foreground text-sm">
                                There's no strict time limit, but we recommend
                                spending about 15-20 minutes on this assessment.
                              </p>
                            </div>
                          </div>
                          <div className="flex items-start gap-3">
                            <div className="flex-shrink-0 h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center">
                              <CheckCircle className="h-4 w-4 text-primary" />
                            </div>
                            <div>
                              <h3 className="font-medium">
                                Evaluation Criteria
                              </h3>
                              <p className="text-muted-foreground text-sm">
                                Your solution will be evaluated on correctness,
                                efficiency, and code quality.
                              </p>
                            </div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>

                    <Card>
                      <CardHeader className="pb-3">
                        <CardTitle>Getting Started</CardTitle>
                        <CardDescription>
                          Follow these steps to complete your assessment
                        </CardDescription>
                      </CardHeader>
                      <CardContent>
                        <ol className="list-decimal list-inside space-y-2 text-muted-foreground text-sm">
                          <li>Read the problem statement carefully</li>
                          <li>Understand the test cases and constraints</li>
                          <li>Write your solution in the code editor</li>
                          <li>
                            Test your solution using the provided test cases
                          </li>
                          <li>Submit when you're confident in your solution</li>
                        </ol>
                      </CardContent>
                    </Card>

                    <div className="flex justify-end pt-2">
                      <Button
                        onClick={handleStartAssessment}
                        size="lg"
                      >
                        Start Assessment
                        <ArrowRight className="ml-2 h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </div>
              </TabsContent>

              <TabsContent
                value="playground"
                className="flex-1 overflow-auto p-4"
              >
                <PanelGroup direction="horizontal" className="h-full">
                  <Panel defaultSize={50} minSize={30}>
                    <Card className="h-full flex flex-col">
                      <CardHeader className="pb-3 shrink-0">
                        <div className="flex items-center gap-2">
                          <Terminal className="h-5 w-5 text-primary" />
                          <CardTitle>DSA Assessment</CardTitle>
                        </div>
                      </CardHeader>
                      <CardContent className="flex-1 overflow-auto">
                        <DsaQuestion
                          title={`Question ${currentQuestionIndex + 1} of ${
                            dsaQuestions.length
                          }`}
                          successRate={successRate}
                          questionNumber={`${currentQuestionIndex + 1}.`}
                          questionTitle={currentQuestion.title || ""}
                          difficulty={currentQuestion.difficulty || ""}
                          description={currentQuestion.description || ""}
                          testCases={
                            currentQuestion?.test_cases?.map(
                              (testCase: TestCase) => ({
                                input: testCase.input || "",
                                expectedOutput: testCase.expected_output || "",
                              })
                            ) || []
                          }
                          compilationStatus={compilationStatus}
                        />
                      </CardContent>
                    </Card>
                  </Panel>

                  <PanelResizeHandle className="w-2 bg-border hover:bg-primary/50 transition-colors" />

                  <Panel defaultSize={50} minSize={30}>
                    <Card className="h-full">
                      <CardContent className="p-0 h-full">
                        <CodeExecutionPanel
                          questionId={currentQuestion.id || 0}
                          setCompilationStatus={setCompilationStatus}
                          onCompilationStatusChange={setCompilationStatus}
                          onSuccessRateChange={setSuccessRate}
                          compilationStatus={compilationStatus}
                          onNext={handleNext}
                          onSubmit={handleSubmit}
                          isLastQuestion={
                            currentQuestionIndex === dsaQuestions.length - 1
                          }
                          isOnlyQuestion={dsaQuestions.length === 1}
                          isFirstQuestion={currentQuestionIndex === 0}
                          currentQuestionIndex={currentQuestionIndex}
                          totalQuestions={dsaQuestions.length}
                        />
                      </CardContent>
                    </Card>
                  </Panel>
                </PanelGroup>
              </TabsContent>
            </Tabs>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DSAPlayground;
