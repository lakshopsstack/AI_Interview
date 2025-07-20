import { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import {
  Play,
  Mic,
  MicOff,
  Video as VideoIcon,
  VideoOff,
  MessageSquare,
  Info,
  Loader2,
  Clock,
  Brain,
  Sparkles,
  BookOpen,
  Briefcase,
  Settings,
  Monitor,
  AlertTriangle,
} from "lucide-react";
import { toast } from "sonner";
import AIAvatar from "../../components/interview/AIAvatar";
import RecordingButton from "../../components/interview/RecordingButton";
import { useInterviewResponseProcessor } from "../../components/interview/InterviewResponseProcessor";
import { AiInterviewedJobData } from "@/types/aiInterviewedJob";
import { ThankYouStage } from "./ThankYouStage";
import VoiceAnimation from "@/components/interview/VoiceAnimation";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { CompanyData } from "@/types/company";
import { interviewApi } from "@/services/interviewApi";
import { config } from "@/config";
import axios from "axios";
import * as faceapi from "face-api.js";

interface InterviewFeedback {
  feedback: string;
  score: number;
  scoreBreakdown: {
    technicalSkills: number;
    communication: number;
    problemSolving: number;
    culturalFit: number;
  };
  suggestions: string[];
  keywords: Array<{
    term: string;
    count: number;
    sentiment: "positive" | "neutral" | "negative";
  }>;
}

interface Message {
  role: "user" | "assistant";
  content: string;
  timestamp: string;
  isTyping?: boolean;
  sender?: "user" | "ai"; // For backward compatibility
  message?: string; // For backward compatibility
}

interface TranscriptEntry {
  speaker: string;
  text: string;
  timestamp: string;
}

interface InterviewData {
  job_requirements: string;
  questions: string[];
  title: string;
  description: string;
  company_name: string;
  job_title: string;
  linkedin_url?: string;
  portfolio_url?: string;
  id?: string;
  firstName?: string;
  lastName?: string;
  email?: string;
  phone?: string;
  location?: string;
  workExperience?: string;
  education?: string;
  skills?: string;
  linkedinUrl?: string;
  portfolioUrl?: string;
}

interface ThankYouStageProps {
  feedback: string;
  score: number;
  scoreBreakdown: {
    technicalSkills: number;
    communication: number;
    problemSolving: number;
    culturalFit: number;
  };
  suggestions: string[];
  keywords: Array<{
    term: string;
    count: number;
    sentiment: "positive" | "neutral" | "negative";
  }>;
  transcript?: Array<{
    speaker: string;
    text: string;
    timestamp: string;
  }>;
  companyName?: string;
  jobTitle?: string;
  jobId?: string;
}

export default function VideoInterview({ onComplete }: { onComplete?: () => void } = {}) {
  const [interviewData, setInterviewData] = useState<InterviewData>({
    job_requirements: "",
    questions: [],
    title: "",
    description: "",
    company_name: "",
    job_title: "",
  });
  const [companyData, setCompanyData] = useState<CompanyData | undefined>(
    undefined
  );
  const [jobData, setJobData] = useState<AiInterviewedJobData | undefined>(undefined);
  const navigate = useNavigate();
  const [isInterviewActive, setIsInterviewActive] = useState(false);
  const [isVideoEnabled, setIsVideoEnabled] = useState(true);
  const [isAudioEnabled, setIsAudioEnabled] = useState(true);
  const [isLoading, setIsLoading] = useState(true);
  const [showPreparationDialog, setShowPreparationDialog] = useState(false);
  const [currentProgress, setCurrentProgress] = useState(0);
  const [timeRemaining, setTimeRemaining] = useState(0);
  const [showCompletionScreen, setShowCompletionScreen] = useState(false);
  const [showDeviceTesting, setShowDeviceTesting] = useState(false);
  const [micWorking, setMicWorking] = useState(false);
  const [cameraWorking, setCameraWorking] = useState(false);
  const [micVolume, setMicVolume] = useState(0);
  const [prepTime, setPrepTime] = useState(30);
  const [isPreparing, setIsPreparing] = useState(false);
  const [downloadComplete, setDownloadComplete] = useState(false);
  const [isAiSpeaking, setIsAiSpeaking] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [recordingTime, setRecordingTime] = useState(0);
  const [isProcessingResponse, setIsProcessingResponse] = useState(false);
  const [hasRecordedCurrentQuestion, setHasRecordedCurrentQuestion] =
    useState(false);
  const [showNextQuestionDialog, setShowNextQuestionDialog] = useState(false);
  const [currentResponse, setCurrentResponse] = useState<string | null>(null);
  const [conversation, setConversation] = useState<Message[]>([]);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const { generateQuestion, processResponse } = useInterviewResponseProcessor();
  const [currentQuestion, setCurrentQuestion] = useState<string>("");
  const [questionType, setQuestionType] = useState<
    "behavioral" | "resume" | "job"
  >("behavioral");
  const [questionsAsked, setQuestionsAsked] = useState<number>(0);
  const [conversationHistory, setConversationHistory] = useState<
    Array<{ role: string; content: string }>
  >([]);
  const [interviewFlow, setInterviewFlow] = useState<
    Array<{ type: string; question: string }>
  >([]);
  const [speech, setSpeech] = useState("");
  const currentAudioRef = useRef<HTMLAudioElement | null>(null);
  const [isDevicesInitialized, setIsDevicesInitialized] = useState(false);
  const [isScreenShared, setIsScreenShared] = useState(false);
  const [isEntireScreenShared, setIsEntireScreenShared] = useState(false);
  const [showScreenSharePrompt, setShowScreenSharePrompt] = useState(false);
  const [showManualOverride, setShowManualOverride] = useState(false);
  const [isAiTyping, setIsAiTyping] = useState(false);
  const [feedback, setFeedback] = useState<InterviewFeedback | null>(null);
  const [showEditDialog, setShowEditDialog] = useState(false);
  const [editedResponse, setEditedResponse] = useState("");
  const [currentStage, setCurrentStage] = useState<string>("");
  const [editTimer, setEditTimer] = useState(30);
  const editTimerRef = useRef<NodeJS.Timeout | null>(null);
  const [isSubmittingEdit, setIsSubmittingEdit] = useState(false);
  const [isFullInterviewRecording, setIsFullInterviewRecording] =
    useState(false);
  const fullInterviewRecorderRef = useRef<MediaRecorder | null>(null);
  const fullInterviewChunksRef = useRef<Blob[]>([]);
  const [isConvertingVideo, setIsConvertingVideo] = useState(false);

  // Face detection and audio monitoring state
  const [faceDetectionInfo, setFaceDetectionInfo] = useState("");
  const [showFaceAlert, setShowFaceAlert] = useState(false);
  const [showEyeMovementAlert, setShowEyeMovementAlert] = useState(false);
  const [showAudioAlert, setShowAudioAlert] = useState(false);
  const [isFaceDetectionActive, setIsFaceDetectionActive] = useState(false);

  // Add refs for alert clear counters
  const faceAlertClearCount = useRef(0);
  const eyeAlertClearCount = useRef(0);
  const audioAlertClearCount = useRef(0);

  // Add ref to track processing state
  const isProcessingRef = useRef(false);

  const videoRef = useRef<HTMLVideoElement>(null);
  const testVideoRef = useRef<HTMLVideoElement>(null);
  const transcriptEndRef = useRef<HTMLDivElement>(null);
  const audioContext = useRef<AudioContext | null>(null);
  const analyser = useRef<AnalyserNode | null>(null);
  const microphone = useRef<MediaStreamAudioSourceNode | null>(null);
  const dataArray = useRef<Uint8Array | null>(null);
  const audioRecorderRef = useRef<MediaRecorder | null>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const recordedChunksRef = useRef<Blob[]>([]);
  const audioChunksRef = useRef<Blob[]>([]);
  const recordingTimerRef = useRef<NodeJS.Timeout | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const audioStreamRef = useRef<MediaStream | null>(null);
  const screenStreamRef = useRef<MediaStream | null>(null);
  const recordingStartTimeRef = useRef<number>(0);

  // Add new state for screenshot interval
  const screenshotIntervalRef = useRef<NodeJS.Timeout | null>(null);

  // Face detection and audio monitoring refs
  const lastEyeCenters = useRef<{ left: { x: number; y: number }; right: { x: number; y: number } } | null>(null);
  const movementAlertCount = useRef(0);
  const voiceAlertCounter = useRef(0);
  const faceDetectionIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const audioMonitoringIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const faceDetectionAudioContextRef = useRef<AudioContext | null>(null);
  const faceDetectionAnalyserRef = useRef<AnalyserNode | null>(null);
  const faceDetectionAudioStreamRef = useRef<MediaStream | null>(null);
  const dataArrayRef = useRef<Uint8Array | null>(null);
  const isFaceDetectionActiveRef = useRef(false);

  // Add fullscreen effect hook with other useEffect hooks
  useEffect(() => {
    const handleFullscreenChange = () => {
      if (
        !document.fullscreenElement &&
        !(document as any).webkitFullscreenElement &&
        !(document as any).msFullscreenElement
      ) {
        toast.warning("Please stay in fullscreen mode during the interview");
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

  // Ensure video stream is properly set when streamRef changes
  useEffect(() => {
    console.log("[VideoInterview] useEffect triggered - videoRef:", !!videoRef.current, "streamRef:", !!streamRef.current, "isDevicesInitialized:", isDevicesInitialized);
    if (videoRef.current && streamRef.current && isDevicesInitialized) {
      console.log("[VideoInterview] Setting video stream to element via useEffect");
      videoRef.current.srcObject = streamRef.current;
      
      // Add event listener for when video starts playing
      const handleVideoPlay = () => {
        console.log("Video started playing, checking if face detection should start");
        if (isInterviewActive && !isFaceDetectionActiveRef.current) {
          console.log("Starting face detection from video play event");
          startFaceDetection();
          startAudioDetection();
        }
      };
      
      videoRef.current.addEventListener('play', handleVideoPlay);
      
      videoRef.current.play().catch((error) => {
        console.error("[VideoInterview] Failed to play video stream in useEffect:", error);
      });
      
      return () => {
        if (videoRef.current) {
          videoRef.current.removeEventListener('play', handleVideoPlay);
        }
      };
    }
  }, [streamRef.current, isDevicesInitialized]);

  useEffect(() => {
    if (currentQuestion.length) {
      // Show typing animation immediately
      setIsAiTyping(true);

      // Start text-to-speech conversion
      const text_to_speech = async () => {
        try {
          const response = await interviewApi.textToSpeech(currentQuestion);
          // Create and prepare audio element before setting speech state
          const newAudio = new Audio(
            "data:audio/mpeg;base64," + response.data.audio_base64
          );

          // Add event listeners for audio playback
          newAudio.onplay = () => {
            setIsAiSpeaking(true);
            setIsAiTyping(false);
          };

          newAudio.onended = () => {
            setIsAiSpeaking(false);
          };

          // Store the audio element
          currentAudioRef.current = newAudio;

          // Start loading the audio
          newAudio.load();

          // Play as soon as it's ready
          newAudio.play().catch((error) => {
            console.error("Error playing audio:", error);
            setIsAiTyping(false);
          });

          // Set speech state after audio is prepared
          setSpeech(response.data.audio_base64);
        } catch (error) {
          console.error("Error in text-to-speech:", error);
          setIsAiTyping(false);
        }
      };
      text_to_speech();
    }
  }, [currentQuestion]);

  useEffect(() => {
    if (speech && !currentAudioRef.current) {
      const newAudio = new Audio("data:audio/mpeg;base64," + speech);
      newAudio.onplay = () => {
        setIsAiSpeaking(true);
        setIsAiTyping(false);
      };
      newAudio.onended = () => {
        setIsAiSpeaking(false);
      };
      newAudio.play().catch((error) => {
        console.error("Error playing audio:", error);
        setIsAiTyping(false);
      });
      currentAudioRef.current = newAudio;
    }
  }, [speech]);

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsLoading(false);

      if (!isInterviewActive) {
        setTimeout(() => {
          setIsAiSpeaking(true);
          setTimeout(() => setIsAiSpeaking(false), 3000);
        }, 1000);
      }
    }, 2000);

    return () => clearTimeout(timer);
  }, [isInterviewActive]);

  useEffect(() => {
    const getCandidateData = async () => {
      const res = await interviewApi.candidateGetInterview();
      const data = res.data;
      setInterviewData({
        id: data.id,
        firstName: data.first_name,
        lastName: data.last_name,
        email: data.email,
        phone: data.phone,
        location: data.location,
        workExperience: data.work_experience,
        education: data.education,
        skills: data.skills,
        linkedinUrl: data.linkedin_url,
        portfolioUrl: data.portfolio_url,
        job_requirements: data.job_requirements,
        questions: data.questions,
        title: data.title || "",
        description: data.description || "",
        company_name: data.company_name || "",
        job_title: data.job_title || "",
      } as InterviewData);
      setCompanyData({ name: data.company_name });
      setJobData({
        id: data.id || "",
        title: data.title || "",
        description: data.description || "",
        department: data.department || "",
        city: data.city || "",
        min_experience: data.min_experience || 0,
        max_experience: data.max_experience || 0,
        salary_min: data.salary_min || 0,
        salary_max: data.salary_max || 0,
        requirements: data.requirements || "",
        responsibilities: data.responsibilities || "",
        skills: data.skills || "",
        benefits: data.benefits || "",
        type: data.type || "",
        location: data.location || "",
        remote: data.remote || false,
        company_id: data.company_id || "",
        created_at: data.created_at || "",
        updated_at: data.updated_at || "",
      } as unknown as AiInterviewedJobData);
    };
    getCandidateData();
  }, []);

  useEffect(() => {
    console.log("Conversation state updated:", conversation);
  }, [conversation]);

  useEffect(() => {
    if (transcriptEndRef.current) {
      transcriptEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [conversation]);

  const startDeviceTest = () => {
    if (testVideoRef.current) {
      navigator.mediaDevices
        .getUserMedia({
          video: true,
          audio: true,
        })
        .then((stream) => {
          if (testVideoRef.current) {
            testVideoRef.current.srcObject = stream;
            setCameraWorking(true);

            audioContext.current = new AudioContext();
            analyser.current = audioContext.current.createAnalyser();
            microphone.current =
              audioContext.current.createMediaStreamSource(stream);

            analyser.current.fftSize = 256;
            microphone.current.connect(analyser.current);

            const bufferLength = analyser.current.frequencyBinCount;
            dataArray.current = new Uint8Array(bufferLength);

            monitorMicVolume();
          }
        })
        .catch((err) => {
          console.error("Error accessing media devices for testing:", err);
          toast.error("Could not access camera or microphone for testing");
        });
    }
  };

  const monitorMicVolume = () => {
    if (!analyser.current || !dataArray.current) return;

    analyser.current.getByteFrequencyData(dataArray.current);

    let sum = 0;
    for (let i = 0; i < dataArray.current.length; i++) {
      sum += dataArray.current[i];
    }

    const average = sum / dataArray.current.length;
    setMicVolume(average);

    if (average > 10) {
      setMicWorking(true);
    }

    requestAnimationFrame(monitorMicVolume);
  };

  const stopDeviceTest = () => {
    if (testVideoRef.current && testVideoRef.current.srcObject) {
      const stream = testVideoRef.current.srcObject as MediaStream;
      const tracks = stream.getTracks();
      tracks.forEach((track) => track.stop());

      if (microphone.current) {
        microphone.current.disconnect();
      }
      if (audioContext.current && audioContext.current.state !== "closed") {
        audioContext.current.close();
      }
    }

    setShowDeviceTesting(false);
  };

  const handleStartRecording = () => {
    if (
      !audioRecorderRef.current ||
      audioRecorderRef.current.state === "recording"
    ) {
      return;
    }

    // Clear previous chunks
    recordedChunksRef.current = [];
    audioChunksRef.current = [];
    recordingStartTimeRef.current = performance.now();

    // Start recording with 1-second chunks
    audioRecorderRef.current.start(1000);
    setIsRecording(true);
    setRecordingTime(0);

    // Start timer
    recordingTimerRef.current = setInterval(() => {
      setRecordingTime((prev) => prev + 1);
    }, 1000);
  };

  const handleStopRecording = () => {
    if (
      !audioRecorderRef.current ||
      audioRecorderRef.current.state !== "recording"
    ) {
      return;
    }

    // Stop recording
    audioRecorderRef.current.stop();
    setIsRecording(false);

    // Clear timer
    if (recordingTimerRef.current) {
      clearInterval(recordingTimerRef.current);
      recordingTimerRef.current = null;
    }
  };

  const transcribeAudio = async (audioBlob: Blob): Promise<string | null> => {
    try {
      setIsProcessingResponse(true);
      const startTime = performance.now();

      if (audioBlob.size < 1000) {
        return null;
      }

      try {
        // Create a File object from the audio blob
        const audioFile = new File([audioBlob], "audio.webm", {
          type: "audio/webm;codecs=opus",
        });

        // Use the /audio/to-text endpoint
        const response = await interviewApi.speechToText(audioFile);

        if (response.data && response.data.transcript) {
          return response.data.transcript;
        } else {
          return null;
        }
      } catch (error) {
        toast.error("Failed to transcribe audio");
        return null;
      }
    } catch (error) {
      toast.error("Failed to process audio");
      return null;
    } finally {
      setIsProcessingResponse(false);
    }
  };

  const startEditTimer = () => {
    setEditTimer(30);
    editTimerRef.current = setInterval(() => {
      setEditTimer((prev) => {
        if (prev <= 1) {
          if (editTimerRef.current) {
            clearInterval(editTimerRef.current);
          }
          // Submit either the edited response or the original transcribed response
          const responseToSubmit = editedResponse || currentResponse;
          if (responseToSubmit) {
            // Set states first
            addUserMessage(responseToSubmit);
            setHasRecordedCurrentQuestion(true);
            setCurrentResponse(responseToSubmit);
            setShowEditDialog(false);

            // Then submit to backend
            interviewApi
              .submitTextResponse(currentQuestionIndex, responseToSubmit)
              .then(() => {
                console.log("Response submitted successfully");
              })
              .catch((error) => {
                console.error("Failed to submit answer:", error);
                toast.error("Failed to submit answer");
              });
          }
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  };

  const handleResponseRecorded = async (transcript: string) => {
    setCurrentResponse(transcript);
    setEditedResponse(transcript);
    setShowEditDialog(true);
    startEditTimer();
  };

  const handleSubmitEditedResponse = async () => {
    if (editTimerRef.current) {
      clearInterval(editTimerRef.current);
    }
    if (isSubmittingEdit) return;

    // Use currentResponse as fallback if editedResponse is empty
    const responseToSubmit = editedResponse?.trim() || currentResponse?.trim();

    // Check if the response is empty
    if (!responseToSubmit) {
      toast.error("Please provide a response before submitting");
      return;
    }

    setIsSubmittingEdit(true);
    setShowEditDialog(false);
    try {
      // Add user message to conversation
      addUserMessage(responseToSubmit);
      setHasRecordedCurrentQuestion(true);
      setCurrentResponse(responseToSubmit);
      // Submit to backend
      await interviewApi.submitTextResponse(
        currentQuestionIndex,
        responseToSubmit
      );
      // Automatically go to next question or finish interview
      handleNextQuestion();
    } catch (error) {
      toast.error("Failed to submit answer");
    } finally {
      setIsSubmittingEdit(false);
    }
  };

  const stopCamera = () => {
    if (streamRef.current) {
      console.log("[Screenshot] Stopping video stream");
      streamRef.current.getTracks().forEach((track) => {
        track.stop();
      });
      streamRef.current = null;
    }

    if (audioStreamRef.current) {
      console.log("[Screenshot] Stopping audio stream");
      audioStreamRef.current.getTracks().forEach((track) => {
        track.stop();
      });
      audioStreamRef.current = null;
    }

    if (screenStreamRef.current) {
      console.log("[Screenshot] Stopping screen stream");
      screenStreamRef.current.getTracks().forEach((track) => {
        track.stop();
      });
      screenStreamRef.current = null;
    }

    if (videoRef.current) {
      videoRef.current.srcObject = null;
    }

    // Clear screenshot interval
    if (screenshotIntervalRef.current) {
      console.log("[Screenshot] Clearing screenshot interval");
      clearInterval(screenshotIntervalRef.current);
      screenshotIntervalRef.current = null;
    }
  };

  // Add logging to cleanup effect
  useEffect(() => {
    return () => {
      console.log("[Screenshot] Component unmounting, cleaning up...");
      stopCamera();
      if (screenshotIntervalRef.current) {
        clearInterval(screenshotIntervalRef.current);
      }
    };
  }, []);

  const analyzeInterview = async () => {
    try {
      interviewApi.updateInterview({status: "Ai Interview Completed"}).then(() => {
        console.log("Interview updated successfully");
      }).catch((err: any) => {
        console.error("Error updating interview:", err);
      });
      // Combine all user responses into a single transcript
      const userTranscript = conversation
        .filter((msg: Message) => msg.role === "user")
        .map((msg: Message) => msg.content)
        .join("\n");

      // Get the job details for context
      const jobContext = {
        title: jobData?.title || "Unknown Position",
        description: jobData?.description || "",
        requirements: jobData?.requirements || "",
      };

      // Call the API to analyze the transcript
      const response = await interviewApi.generateFeedback(
        userTranscript,
        jobData?.requirements || ""
      );

      // Set the feedback state with the response data
      setFeedback(response);

      // Make sure to set showCompletionScreen to true
      setShowCompletionScreen(true);
    } catch (error) {
      console.error("Error analyzing transcript:", error);
      toast.error("Failed to analyze interview performance");

      // Create a default feedback object to prevent null reference errors
      setFeedback({
        suggestions: ["Unable to generate feedback due to an error."],
        keywords: [{ term: "Error", count: 1, sentiment: "negative" }],
        score: 0,
        scoreBreakdown: {
          technicalSkills: 0,
          communication: 0,
          problemSolving: 0,
          culturalFit: 0,
        },
        feedback: "There was an error analyzing your interview responses.",
      });

      // Even if analysis fails, still show the completion screen
      setShowCompletionScreen(true);
    }
  };

  const handleNextQuestion = () => {
    if (currentQuestionIndex < interviewFlow.length - 1) {
      const nextIndex = currentQuestionIndex + 1;
      setCurrentQuestionIndex(nextIndex);
      const nextQuestion = interviewFlow[nextIndex].question;
      setCurrentQuestion(nextQuestion);
      addAssistantMessage(nextQuestion);
      setConversationHistory((prev) => [
        ...prev,
        { role: "assistant", content: nextQuestion },
      ]);
      setHasRecordedCurrentQuestion(false);
      setCurrentResponse(null);
      recordedChunksRef.current = [];
      audioChunksRef.current = [];
      setIsAiTyping(true);
    } else {
      if (audioRecorderRef.current) audioRecorderRef.current.stop();
      if (fullInterviewRecorderRef.current) fullInterviewRecorderRef.current?.stop();
      stopCamera();
      analyzeInterview();
      setShowCompletionScreen(true);
    }
  };

  const addAssistantMessage = (content: string) => {
    setConversation((prev) => [
      ...prev,
      {
        role: "assistant",
        content,
        timestamp: new Date().toISOString(),
        isTyping: false,
      },
    ]);
  };

  const addUserMessage = (content: string) => {
    setConversation((prev) => [
      ...prev,
      {
        role: "user",
        content,
        timestamp: new Date().toISOString(),
      },
    ]);
  };

  const startCameraFeed = async () => {
    try {
      console.log("[VideoInterview] Starting camera feed...");
      
      // Get camera stream for display
      const videoStream = await navigator.mediaDevices.getUserMedia({
        video: true,
        audio: true,
      });
      console.log("[VideoInterview] Camera stream obtained:", videoStream);

      // Get audio-only stream for better audio quality
      const audioStream = await navigator.mediaDevices.getUserMedia({
        audio: true,
        video: false,
      });

      // Use video stream for display
      streamRef.current = videoStream;
      audioStreamRef.current = audioStream;
      console.log("[VideoInterview] Stream refs set, useEffect should handle video element");

      // Create a combined stream for full interview recording
      if (screenStreamRef.current) {
        const screenTracks = screenStreamRef.current.getTracks();
        const micTracks = audioStream.getTracks();
        
        // Combine screen video + screen audio + microphone audio
        const combinedTracks = [
          ...screenTracks.filter(track => track.kind === 'video'), // Screen video
          ...screenTracks.filter(track => track.kind === 'audio'), // Screen audio (system audio)
          ...micTracks.filter(track => track.kind === 'audio')     // Microphone audio
        ];
        
        const combinedStream = new MediaStream(combinedTracks);
        
        // Update the full interview recorder with the combined stream
        if (fullInterviewRecorderRef.current) {
          fullInterviewRecorderRef.current.stop();
        }
        
        const fullInterviewRecorder = new MediaRecorder(combinedStream, {
          mimeType: "video/webm;codecs=vp9,opus",
        });
        fullInterviewRecorderRef.current = fullInterviewRecorder;
        
        // Set up the event handlers for the new recorder
        fullInterviewRecorder.ondataavailable = async (e) => {
          if (e.data.size > 0) {
            try {
              console.log("Starting video upload...");
              await axios.post(
                `${config.API_BASE_URL}/interview/record`,
                await e.data.arrayBuffer(),
                {
                  headers: {
                    "Content-Type": "multipart/form-data",
                    Authorization: `Bearer ${localStorage.getItem("i_token")}`,
                  },
                }
              );
            } catch (error) {
              console.error("Failed to upload interview clip:", error);
            }
          }
        };

        fullInterviewRecorder.onstop = async () => {
          try {
            console.log("Video uploaded, starting conversion...");
            setIsConvertingVideo(true);
            await axios.post(`${config.API_BASE_URL}/interview/record`, null, {
              params: { finished: "true" },
              headers: {
                Authorization: `Bearer ${localStorage.getItem("i_token")}`,
              },
            });
            setIsConvertingVideo(false);
          } catch (error) {
            console.error("Failed to upload full interview video:", error);
            setIsConvertingVideo(false);
          }
        };

        fullInterviewRecorder.onerror = (error) => {
          console.error("Full interview recording error:", error);
        };
        
        // Start the new recorder
        fullInterviewRecorder.start(3000);
        setIsFullInterviewRecording(true);
        console.log("[VideoInterview] Combined stream recorder started");
      }

      // Set up audio-only media recorder for transcription
      const audioRecorder = new MediaRecorder(audioStream, {
        mimeType: "audio/webm;codecs=opus",
      });
      audioRecorderRef.current = audioRecorder;

      // Set up audio recorder event handlers
      audioRecorder.ondataavailable = (e) => {
        if (e.data.size > 0) {
          audioChunksRef.current.push(e.data);
        }
      };

      audioRecorder.onstop = async () => {
        const audioBlob = new Blob(audioChunksRef.current, {
          type: "audio/webm",
        });

        if (audioBlob.size > 0) {
          const transcript = await transcribeAudio(audioBlob);
          if (transcript) {
            handleResponseRecorded(transcript);
          }
        }
      };

      audioRecorder.onerror = (error) => {
        toast.error("Recording error occurred");
        setIsRecording(false);
      };

      console.log("[VideoInterview] Camera feed started successfully");
    } catch (error) {
      console.error("[VideoInterview] Failed to start camera feed:", error);
      toast.error("Failed to start camera feed");
    }
  };


  const startInterview = async () => {
    // Check if devices are initialized and screen is shared
    if (!isDevicesInitialized) {
      toast.error("Please initialize your devices first");
      return;
    }

    if (!isScreenShared || !isEntireScreenShared) {
      toast.error("Please share your entire screen before starting the interview");
      setShowScreenSharePrompt(true);
      return;
    }

    setIsInterviewActive(true);
    setIsPreparing(true);

    try {
      const questions = await generateQuestion();

      if (!questions || questions.length === 0) {
        throw new Error("Failed to generate questions");
      }

      // Start camera feed after questions are generated
      await startCameraFeed();

      // Face detection and audio monitoring will start automatically when video starts playing

      const interviewFlow = questions;
      setCurrentQuestion(interviewFlow[0].question);
      setConversationHistory([
        { role: "assistant", content: interviewFlow[0].question },
      ]);
      setInterviewFlow(interviewFlow);

      // Show AI preparation animation
      setIsPreparing(false);
      setIsAiTyping(true);
      addAssistantMessage(interviewFlow[0].question);

      // Interview should already be in fullscreen mode from UnifiedInterviewFlow
      // No need to request fullscreen again here
    } catch (error) {
      console.error("Error starting interview:", error);
      toast.error("Failed to start interview");
      setIsPreparing(false);
    }
  };

  const formatTime = (seconds: number) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds < 10 ? "0" : ""}${remainingSeconds}`;
  };

  // Add screenshot capture function
  const captureAndSendScreenshot = async () => {
    try {
      if (!screenStreamRef.current) {
        console.warn("[Screenshot] Screen stream not found");
        return;
      }

      console.log("[Screenshot] Starting capture process...");
      const startTime = performance.now();

      // Create a video element to capture the screen stream
      const videoElement = document.createElement("video");
      videoElement.srcObject = screenStreamRef.current;
      videoElement.muted = true;
      await videoElement.play();

      // Create a canvas and draw the video frame
      const canvas = document.createElement("canvas");
      canvas.width = videoElement.videoWidth;
      canvas.height = videoElement.videoHeight;
      const ctx = canvas.getContext("2d");
      if (!ctx) {
        throw new Error("Failed to get canvas context");
      }
      ctx.drawImage(videoElement, 0, 0, canvas.width, canvas.height);

      // Stop the video element
      videoElement.pause();
      videoElement.srcObject = null;

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
        `[Screenshot] Successfully saved (${(
          (endTime - startTime) /
          1000
        ).toFixed(2)}s)`,
        result
      );
    } catch (err) {
      console.error("[Screenshot] Error during capture/upload:", err);
      toast.error("Failed to capture screenshot");
    }
  };

  // Modify initializeDevices to add logging for screenshot interval
  const requestScreenShare = async () => {
    try {
      // Temporarily exit fullscreen to show screen sharing dialog
      if (document.fullscreenElement) {
        if (document.exitFullscreen) {
          document.exitFullscreen();
        } else if ((document as any).webkitExitFullscreen) {
          (document as any).webkitExitFullscreen();
        } else if ((document as any).msExitFullscreen) {
          (document as any).msExitFullscreen();
        }
      }
      const stream = await navigator.mediaDevices.getDisplayMedia({
        video: true,
        audio: true
      });

      // Check if entire screen is shared by examining the track settings
      const videoTrack = stream.getVideoTracks()[0];
      const settings = videoTrack.getSettings();
      
      console.log("Screen share settings:", settings);
      
      // Better detection: check for displaySurface property if available, otherwise use resolution
      let isEntireScreen = false;
      
      // Method 1: Check displaySurface property (most reliable)
      if (settings.displaySurface) {
        isEntireScreen = settings.displaySurface === "monitor";
        console.log("Using displaySurface detection:", settings.displaySurface, isEntireScreen);
      } else {
        // Method 2: Check if resolution is very large (likely full screen)
        const isLargeResolution = Boolean(settings.width && settings.height && 
          (settings.width >= 1920 && settings.height >= 1080));
        
        // Method 3: Check if aspect ratio is close to typical monitor ratios
        const aspectRatio = settings.width && settings.height ? settings.width / settings.height : 0;
        const isTypicalMonitorRatio = aspectRatio >= 1.3 && aspectRatio <= 2.1; // 4:3 to 21:9
        
        isEntireScreen = isLargeResolution && isTypicalMonitorRatio;
        console.log("Using resolution detection:", { width: settings.width, height: settings.height, aspectRatio, isEntireScreen });
      }
      
      if (isEntireScreen) {
        setIsEntireScreenShared(true);
        setIsScreenShared(true);
        screenStreamRef.current = stream;
        
        // Don't set screen share to video element - keep camera feed visible
        // The screen share is only used for recording, not display
        
        // Re-enter fullscreen after successful screen sharing
        setTimeout(() => {
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
        }, 500); // Small delay to ensure screen sharing dialog is closed
        
        toast.success("Entire screen shared successfully!");
        return true;
      } else {
        // Not entire screen, ask user to share entire screen
        stream.getTracks().forEach(track => track.stop());
        setIsEntireScreenShared(false);
        setIsScreenShared(false);
        toast.error("Please share your entire screen, not just a tab or application");
        setShowScreenSharePrompt(true);
        return false;
      }
    } catch (error) {
      console.error("Error requesting screen share:", error);
      toast.error("Failed to start screen sharing. Please try again.");
      return false;
    }
  };

      const handleManualOverride = () => {
    setIsEntireScreenShared(true);
    setIsScreenShared(true);
    setShowManualOverride(false);
    
    // Re-enter fullscreen after manual override
    setTimeout(() => {
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
    }, 100);
    
    toast.success("Screen sharing manually confirmed");
  };

      const initializeDevices = async () => {
    try {
      // Stop any existing streams first to ensure clean state
      stopCamera();

      // Small delay to ensure streams are fully stopped
      await new Promise(resolve => setTimeout(resolve, 100));

      // Request screen sharing with validation
      const screenShareSuccess = await requestScreenShare();
      if (!screenShareSuccess) {
        // If screen sharing failed, return
        return;
      }

      // Store the screen stream (already set in requestScreenShare)
      // screenStreamRef.current = screenStream;

      // Don't start camera feed yet - wait until questions are generated
      console.log("[VideoInterview] Devices initialized, camera will start after questions are generated");
      
      const videoRecorder = new MediaRecorder(screenStreamRef.current!, {
        mimeType: "video/webm;codecs=vp9,opus",
      });

      // Audio recorder will be set up when camera starts
      mediaRecorderRef.current = videoRecorder;
      audioRecorderRef.current = null;

      // Full interview recorder will be set up when camera starts with combined stream
      // For now, just set up a placeholder
      fullInterviewRecorderRef.current = null;

      // Start screenshot capture after devices are initialized
      if (screenshotIntervalRef.current) {
        console.log("[Screenshot] Clearing existing interval");
        clearInterval(screenshotIntervalRef.current);
      }
      console.log("[Screenshot] Starting screenshot interval (30s)");
      screenshotIntervalRef.current = setInterval(
        captureAndSendScreenshot,
        30000
      );

      setIsDevicesInitialized(true);
      toast.success("Screen sharing initialized successfully. Camera will start when interview begins.");
    } catch (error) {
      console.error("[Screenshot] Failed to initialize devices:", error);
      toast.error(
        "Failed to initialize camera and microphone. Please check your permissions."
      );
    }
  };

  const handleDownloadTranscript = () => {
    if (conversation.length === 0) return;

    // Format the conversation with timestamps
    const formattedConversation = conversation.map((msg) => {
      const timestamp = new Date(msg.timestamp).toLocaleTimeString();
      return `[${timestamp}] ${
        msg.role === "user" ? "You" : "AI Interviewer"
      }: ${msg.content}`;
    });

    // Add feedback section if available
    let transcriptContent = formattedConversation.join("\n\n");
    if (feedback) {
      transcriptContent += "\n\n=== Interview Feedback ===\n\n";
      transcriptContent += `Overall Score: ${feedback.score}/10\n\n`;
      transcriptContent += `Feedback:\n${feedback.feedback}\n\n`;
      transcriptContent += `Suggestions for Improvement:\n${feedback.suggestions
        .map((s, i) => `${i + 1}. ${s}`)
        .join("\n")}`;
    }

    // Create and download the file
    const blob = new Blob([transcriptContent], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${
      jobData?.title?.replace(/\s+/g, "-").toLowerCase() || "interview"
    }-transcript.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const handleInterviewComplete = () => {
    if (onComplete) {
      onComplete();
      return;
    }
    const urlParams = new URLSearchParams(window.location.search);
    const i_id = urlParams.get("i_id");
    const company = urlParams.get("company");

    if (i_id && company) {
      // Stop recording if active
      if (audioRecorderRef.current && isRecording) {
        audioRecorderRef.current.stop();
      }

      // Stop full interview recording
      if (fullInterviewRecorderRef.current && isFullInterviewRecording) {
        fullInterviewRecorderRef.current.stop();
        setIsFullInterviewRecording(false);
      }

      // Stop camera
      stopCamera();

      // Stop face detection and audio monitoring
      cleanupFaceDetection();

      // Only navigate if not converting
      if (!isConvertingVideo) {
        navigate(`/interview/complete?i_id=${i_id}&company=${company}`);
      }
    }
  };

  // Update conversation state management
  const updateConversation = (newMessage: Message) => {
    setConversation((prev) => [...prev, newMessage]);
  };

  const handleScheduleLater = () => {
    toast.success("Interview scheduled for later");
    // You can add additional logic here for scheduling
  };

  // Update job data with proper type
  const updateJobData = (data: Partial<AiInterviewedJobData>) => {
    setJobData(
      (prev) =>
        ({
          ...prev,
          ...data,
        } as AiInterviewedJobData)
    );
  };

  // Face detection and audio monitoring functions
  const loadFaceDetectionModels = async () => {
    try {
      const MODEL_URL = "/models";
      await faceapi.nets.tinyFaceDetector.loadFromUri(MODEL_URL);
      await faceapi.nets.faceLandmark68Net.loadFromUri(MODEL_URL);
      console.log("Face detection models loaded successfully");
    } catch (error) {
      console.error("Error loading face detection models:", error);
      toast.error("Failed to load face detection models");
    }
  };

  const getEyeCenter = (eye: any[]) => {
    const x = eye.reduce((sum, p) => sum + p.x, 0) / eye.length;
    const y = eye.reduce((sum, p) => sum + p.y, 0) / eye.length;
    return { x, y };
  };

  const detectFaces = async () => {
    if (!videoRef.current || !isFaceDetectionActiveRef.current) {
      console.log("Face detection skipped - videoRef:", !!videoRef.current, "isFaceDetectionActive:", isFaceDetectionActiveRef.current);
      return;
    }

    // Check if video is actually playing
    if (videoRef.current.paused || videoRef.current.ended || videoRef.current.readyState < 2) {
      console.log("Video not ready for face detection - paused:", videoRef.current.paused, "ended:", videoRef.current.ended, "readyState:", videoRef.current.readyState);
      return;
    }

    try {
      console.log("Running face detection...");
      const results = await faceapi
        .detectAllFaces(videoRef.current, new faceapi.TinyFaceDetectorOptions())
        .withFaceLandmarks();

      console.log("Face detection results:", results.length, "faces detected");

      if (results.length > 1) {
        console.log("Multiple faces detected!");
        setShowFaceAlert(true);
        setFaceDetectionInfo("⚠️ Multiple faces detected!");
        faceAlertClearCount.current = 0;
      } else if (results.length === 1) {
        faceAlertClearCount.current++;
        if (faceAlertClearCount.current >= 3) setShowFaceAlert(false);
        const { landmarks } = results[0];

        const leftEye = landmarks.getLeftEye();
        const rightEye = landmarks.getRightEye();

        const currentEyes = {
          left: getEyeCenter(leftEye),
          right: getEyeCenter(rightEye),
        };

        if (lastEyeCenters.current) {
          const dxL = Math.abs(currentEyes.left.x - lastEyeCenters.current.left.x);
          const dyL = Math.abs(currentEyes.left.y - lastEyeCenters.current.left.y);
          const dxR = Math.abs(currentEyes.right.x - lastEyeCenters.current.right.x);
          const dyR = Math.abs(currentEyes.right.y - lastEyeCenters.current.right.y);

          const movement = dxL + dyL + dxR + dyR;

          if (movement > 20) {
            movementAlertCount.current++;
          } else {
            movementAlertCount.current = 0;
          }

          if (movementAlertCount.current >= 10) {
            setShowEyeMovementAlert(true);
            setFaceDetectionInfo("⚠️ Unusual eye movement detected!");
            eyeAlertClearCount.current = 0;
            movementAlertCount.current = 0;
          } else {
            eyeAlertClearCount.current++;
            if (eyeAlertClearCount.current >= 3) setShowEyeMovementAlert(false);
            setFaceDetectionInfo("✅ Face detected - monitoring for unusual activity");
          }
        }

        lastEyeCenters.current = currentEyes;
      } else {
        faceAlertClearCount.current++;
        if (faceAlertClearCount.current >= 3) setShowFaceAlert(false);
        eyeAlertClearCount.current++;
        if (eyeAlertClearCount.current >= 3) setShowEyeMovementAlert(false);
        setFaceDetectionInfo("❌ No face detected");
      }
    } catch (error) {
      console.error("Face detection error:", error);
    }
  };

  const startAudioDetection = async () => {
    try {
      console.log("Starting audio detection...");
      faceDetectionAudioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)();
      faceDetectionAudioStreamRef.current = await navigator.mediaDevices.getUserMedia({ audio: true });
      const source = faceDetectionAudioContextRef.current.createMediaStreamSource(faceDetectionAudioStreamRef.current);
      faceDetectionAnalyserRef.current = faceDetectionAudioContextRef.current.createAnalyser();
      source.connect(faceDetectionAnalyserRef.current);
      faceDetectionAnalyserRef.current.fftSize = 256;

      const bufferLength = faceDetectionAnalyserRef.current.frequencyBinCount;
      dataArrayRef.current = new Uint8Array(bufferLength);

      console.log("Audio detection started successfully");
      monitorAudio();
    } catch (error) {
      console.error("Audio access error:", error);
      toast.error("Failed to access microphone for audio monitoring");
    }
  };

  const monitorAudio = () => {
    if (!faceDetectionAnalyserRef.current || !dataArrayRef.current || !isFaceDetectionActiveRef.current) {
      console.log("Audio monitoring skipped - analyser:", !!faceDetectionAnalyserRef.current, "dataArray:", !!dataArrayRef.current, "isFaceDetectionActive:", isFaceDetectionActiveRef.current);
      return;
    }

    faceDetectionAnalyserRef.current.getByteFrequencyData(dataArrayRef.current);

    const average = dataArrayRef.current.filter(v => v > 100).length;
    console.log("Audio average:", average, "showAudioAlert:", showAudioAlert);

    if (average > 30) {
      voiceAlertCounter.current++;
      audioAlertClearCount.current = 0; // Reset clear counter on bad frame
      console.log("High audio detected, voice counter:", voiceAlertCounter.current);
      if (voiceAlertCounter.current >= 20) {
        console.log("Setting audio alert to true");
        setShowAudioAlert(true);
        voiceAlertCounter.current = 0;
      }
    } else {
      voiceAlertCounter.current = 0;
      audioAlertClearCount.current++;
      console.log("Good audio frame, clear count:", audioAlertClearCount.current);
      if (audioAlertClearCount.current >= 3) {
        console.log("Clearing audio alert");
        setShowAudioAlert(false);
        audioAlertClearCount.current = 0;
      }
    }

    requestAnimationFrame(monitorAudio);
  };

  const startFaceDetection = () => {
    console.log("Starting face detection...");
    if (faceDetectionIntervalRef.current) {
      clearInterval(faceDetectionIntervalRef.current);
    }
    
    // Set both state and ref
    setIsFaceDetectionActive(true);
    isFaceDetectionActiveRef.current = true;
    console.log("isFaceDetectionActive set to true");
    
    faceDetectionIntervalRef.current = setInterval(() => {
      console.log("Face detection interval triggered, isFaceDetectionActive:", isFaceDetectionActiveRef.current);
      detectFaces();
    }, 700);
    console.log("Face detection interval set");
  };

  const stopFaceDetection = () => {
    setIsFaceDetectionActive(false);
    isFaceDetectionActiveRef.current = false;
    if (faceDetectionIntervalRef.current) {
      clearInterval(faceDetectionIntervalRef.current);
      faceDetectionIntervalRef.current = null;
    }
    setShowFaceAlert(false);
    setShowEyeMovementAlert(false);
    setShowAudioAlert(false);
    setFaceDetectionInfo("");
  };

  const cleanupFaceDetection = () => {
    stopFaceDetection();
    if (faceDetectionAudioStreamRef.current) {
      faceDetectionAudioStreamRef.current.getTracks().forEach(track => track.stop());
    }
    if (faceDetectionAudioContextRef.current) {
      faceDetectionAudioContextRef.current.close();
    }
  };

  // Debug function to test face detection manually
  const testFaceDetection = async () => {
    console.log("Manual face detection test");
    if (!videoRef.current) {
      console.log("No video element available");
      return;
    }
    
    console.log("Video element state:", {
      paused: videoRef.current.paused,
      ended: videoRef.current.ended,
      readyState: videoRef.current.readyState,
      srcObject: !!videoRef.current.srcObject
    });
    
    try {
      const results = await faceapi
        .detectAllFaces(videoRef.current, new faceapi.TinyFaceDetectorOptions())
        .withFaceLandmarks();
      
      console.log("Manual face detection results:", results.length, "faces");
      if (results.length > 0) {
        console.log("Face landmarks:", results[0].landmarks);
      }
    } catch (error) {
      console.error("Manual face detection error:", error);
    }
  };

  // Load face detection models on component mount
  useEffect(() => {
    console.log("Loading face detection models...");
    loadFaceDetectionModels();
  }, []);

  // Sync ref with state
  useEffect(() => {
    isFaceDetectionActiveRef.current = isFaceDetectionActive;
    console.log("Face detection state changed to:", isFaceDetectionActive);
  }, [isFaceDetectionActive]);

  // Cleanup timer on unmount
  useEffect(() => {
    return () => {
      if (editTimerRef.current) {
        clearInterval(editTimerRef.current);
      }
      cleanupFaceDetection();
    };
  }, []);

  // Add loading overlay for video conversion
  if (isConvertingVideo) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-background to-background/80">
        <div className="text-center">
          <Loader2 className="h-12 w-12 animate-spin text-brand mx-auto mb-4" />
          <h1 className="text-2xl font-bold mb-2">
            Processing Interview Video
          </h1>
          <p className="text-muted-foreground">
            Please wait while we process your interview recording...
          </p>
        </div>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-background to-background/80">
        <div className="text-center">
          <Loader2 className="h-12 w-12 animate-spin text-brand mx-auto mb-4" />
          <h1 className="text-2xl font-bold mb-2">Loading your interview</h1>
          <p className="text-muted-foreground">
            Please wait while we set up your interview experience...
          </p>
        </div>
      </div>
    );
  }

  if (showCompletionScreen) {
    return (
      <ThankYouStage
        transcript={conversation.map((msg) => ({
          speaker: msg.role === "user" ? "You" : "AI Interviewer",
          text: msg.content,
          timestamp: msg.timestamp,
        }))}
        companyName={interviewData.company_name}
        jobTitle={interviewData.job_title}
        jobId={interviewData.id}
        feedback={
          feedback?.feedback || "Thank you for completing the interview."
        }
        score={feedback?.score || 0}
        scoreBreakdown={
          feedback?.scoreBreakdown || {
            technicalSkills: 0,
            communication: 0,
            problemSolving: 0,
            culturalFit: 0,
          }
        }
        suggestions={feedback?.suggestions || []}
        keywords={feedback?.keywords || []}
      />
    );
  }

  if (isPreparing) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-background to-background/80">
        <div className="max-w-2xl w-full p-8 text-center">
          <div className="relative mb-8">
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="w-24 h-24 border-4 border-brand/20 rounded-full animate-ping" />
            </div>
            <div className="relative flex items-center justify-center">
              <div className="w-24 h-24 bg-brand/10 rounded-full flex items-center justify-center">
                <Brain className="h-12 w-12 text-brand animate-pulse" />
              </div>
            </div>
          </div>

          <h2 className="text-2xl font-semibold mb-4">
            Preparing Your Interview
          </h2>

          <div className="grid grid-cols-2 gap-4 mb-8">
            <div className="bg-muted/50 p-4 rounded-lg">
              <BookOpen className="h-6 w-6 text-brand mb-2 mx-auto" />
              <p className="text-sm">Analyzing your resume</p>
            </div>
            <div className="bg-muted/50 p-4 rounded-lg">
              <Briefcase className="h-6 w-6 text-brand mb-2 mx-auto" />
              <p className="text-sm">Reviewing job requirements</p>
            </div>
            <div className="bg-muted/50 p-4 rounded-lg">
              <Sparkles className="h-6 w-6 text-brand mb-2 mx-auto" />
              <p className="text-sm">Crafting personalized questions</p>
            </div>
            <div className="bg-muted/50 p-4 rounded-lg">
              <Brain className="h-6 w-6 text-brand mb-2 mx-auto" />
              <p className="text-sm">Optimizing AI responses</p>
            </div>
          </div>

          <p className="text-muted-foreground">
            Our AI is preparing a tailored interview experience based on your
            background and the position requirements.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-black">
      <header className="absolute top-0 left-0 right-0 z-20 bg-background/95 backdrop-blur-sm p-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 rounded-md bg-muted flex items-center justify-center">
            {companyData && companyData.name && companyData?.name[0]}
          </div>
          <div>
            <h1 className="font-semibold text-white">{jobData?.title}</h1>
            <p className="text-sm text-muted-foreground">{companyData?.name}</p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          {!isDevicesInitialized && (
            <Button
              variant="outline"
              size="sm"
              onClick={initializeDevices}
              className="bg-background/80 backdrop-blur-sm"
            >
              <VideoIcon className="h-4 w-4 mr-2" />
              Initialize Camera & Mic
            </Button>
          )}
          {isInterviewActive ? (
            <Badge variant="outline" className="bg-success/10 text-success">
              Interview in progress
            </Badge>
          ) : (
            <Badge variant="outline">Not started</Badge>
          )}
          <Button
            variant="outline"
            size="sm"
            onClick={() => setShowPreparationDialog(true)}
            disabled={isInterviewActive}
          >
            <Info className="h-4 w-4 mr-2" />
            Interview Info
          </Button>
        </div>
      </header>

      <div className="absolute inset-0 pt-16 grid grid-cols-1 lg:grid-cols-5">
        <div className="col-span-1 lg:col-span-3 flex flex-col h-full overflow-hidden">
          <div className="relative flex-1 flex flex-col">
            <div className="flex-1 bg-black flex items-center justify-center relative">
              {isPreparing && (
                <div className="absolute inset-0 bg-background/90 backdrop-blur-sm flex flex-col items-center justify-center">
                  <h2 className="text-xl font-semibold mb-4">
                    Prepare Your Answer
                  </h2>
                  <p className="text-lg mb-6">
                    Time to prepare: {formatTime(prepTime)}
                  </p>
                  <div className="w-64 mb-8">
                    <Progress
                      value={((30 - prepTime) / 30) * 100}
                      className="h-2"
                    />
                  </div>
                  <p className="text-sm max-w-md text-center text-muted-foreground">
                    Take a moment to gather your thoughts. The interview will
                    start automatically when the timer ends.
                  </p>
                  <Button className="mt-8" onClick={startInterview}>
                    Skip Preparation
                  </Button>
                </div>
              )}

              {isInterviewActive ? (
                <div className="relative w-full h-full bg-black">
                  {/* Persistent Warning Banner */}
                  {(showFaceAlert || showEyeMovementAlert || showAudioAlert) && (
                    <div className="absolute top-0 left-0 right-0 z-30 flex flex-col items-center">
                      <div className="bg-destructive/90 text-white px-6 py-3 rounded-b shadow-lg flex flex-col items-center w-full max-w-xl mt-0">
                        <div className="flex flex-col items-center gap-1">
                          {showFaceAlert && <span>⚠️ Multiple faces detected! Please ensure only one person is visible.</span>}
                          {showEyeMovementAlert && <span>⚠️ Unusual eye movement detected! Please stay focused on the screen.</span>}
                          {showAudioAlert && <span>🔊 Multiple voices or background sound detected! Please ensure a quiet environment.</span>}
                        </div>
                      </div>
                    </div>
                  )}
                  {/* Video element and rest of the UI */}
                  <video
                    ref={videoRef}
                    autoPlay
                    playsInline
                    muted={true}
                    className="w-full h-full object-cover"
                    onLoadedMetadata={() => console.log("Video metadata loaded")}
                    onCanPlay={() => console.log("Video can play")}
                    onError={(e) => console.error("Video error:", e)}
                  />
                  
                  {/* Fallback message if video is not working */}
                  {!streamRef.current && (
                    <div className="absolute inset-0 flex items-center justify-center bg-black/50">
                      <div className="text-center text-white">
                        <div className="text-2xl mb-2">📹</div>
                        <p className="text-sm">Camera not available</p>
                        <p className="text-xs text-gray-300 mt-1">Please check camera permissions</p>
                      </div>
                    </div>
                  )}

                  {/* AI Interviewer Avatar */}
                  <div className="absolute bottom-8 left-8 flex flex-col items-center">
                    <div className="bg-background/80 backdrop-blur-sm p-4 rounded-full">
                      <AIAvatar isSpeaking={isAiSpeaking} size="lg" />
                    </div>
                    <div className="flex items-center gap-2 mt-2 bg-background/80 backdrop-blur-sm px-3 py-1 rounded-full">
                      <span className="text-sm text-white">AI Interviewer</span>
                      {isAiSpeaking && (
                        <VoiceAnimation isSpeaking={isAiSpeaking} />
                      )}
                    </div>
                  </div>

                  {/* Recording Indicator */}
                  {isRecording && (
                    <div className="absolute top-4 right-4 bg-destructive/90 backdrop-blur-sm text-white px-4 py-2 rounded-full flex items-center gap-2 animate-pulse">
                      <div className="w-2 h-2 rounded-full bg-white" />
                      Recording
                    </div>
                  )}

                  {/* Face Detection Status */}
                  {isInterviewActive && (
                    <div className="absolute top-4 left-1/2 transform -translate-x-1/2 bg-background/80 backdrop-blur-sm px-4 py-2 rounded-full flex items-center gap-2">
                      <AlertTriangle className={`h-4 w-4 ${showFaceAlert || showEyeMovementAlert || showAudioAlert ? 'text-destructive' : 'text-green-500'}`} />
                      <span className="text-sm text-white">
                        {showFaceAlert && "Multiple faces detected!"}
                        {showEyeMovementAlert && "Unusual eye movement!"}
                        {showAudioAlert && "Multiple voices detected!"}
                        {!showFaceAlert && !showEyeMovementAlert && !showAudioAlert && (isFaceDetectionActive ? "Monitoring active" : "Monitoring starting...")}
                      </span>
                    </div>
                  )}

                  {/* Controls Overlay */}
                  <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-4">
                    <div className="flex items-center justify-center gap-4">
                      <RecordingButton
                        onStartRecording={handleStartRecording}
                        onStopRecording={handleStopRecording}
                        isRecording={isRecording}
                        recordingTime={recordingTime}
                        isProcessing={isProcessingResponse}
                        disabled={
                          !isInterviewActive ||
                          isAiSpeaking ||
                          isAiTyping ||
                          hasRecordedCurrentQuestion ||
                          isProcessingResponse
                        }
                        className="bg-background/80 backdrop-blur-sm hover:bg-background/90"
                      />
                      <Button
                        variant="outline"
                        onClick={() => {
                          const skipResponse = "Next question please";
                          addUserMessage(skipResponse);
                          setHasRecordedCurrentQuestion(true);
                          setCurrentResponse(skipResponse);
                          interviewApi.submitTextResponse(currentQuestionIndex, skipResponse)
                            .then(() => {
                              console.log("Skip response submitted successfully");
                              // Automatically go to next question or finish interview
                              handleNextQuestion();
                            })
                            .catch((error) => {
                              console.error("Failed to submit skip response:", error);
                              toast.error("Failed to submit skip response");
                            });
                        }}
                        disabled={
                          !isInterviewActive ||
                          isAiSpeaking ||
                          isAiTyping ||
                          hasRecordedCurrentQuestion ||
                          isProcessingResponse
                        }
                        className="bg-background/80 backdrop-blur-sm hover:bg-background/90"
                      >
                        Skip Question
                      </Button>
                      {/* Next button removed as per requirements */}
                    </div>
                  </div>

                  {/* Question Progress */}
                  <div className="absolute top-4 left-4 bg-background/80 backdrop-blur-sm px-4 py-2 rounded-full">
                    <span className="text-sm text-white">
                      Question {currentQuestionIndex + 1} of{" "}
                      {interviewFlow.length}
                    </span>
                  </div>

                  {/* Time Remaining */}
                  {isInterviewActive && timeRemaining > 0 && (
                    <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 bg-background/80 backdrop-blur-sm rounded-full px-4 py-2 flex items-center gap-2 border">
                      <Clock className="h-4 w-4 text-muted-foreground" />
                      <span className="text-sm font-medium">
                        {formatTime(timeRemaining)}
                      </span>
                    </div>
                  )}
                </div>
              ) : (
                <div className="text-center p-10">
                  <div className="flex items-center justify-center gap-6 mb-8">
                    <div className="bg-brand/10 p-4 rounded-full">
                      <AIAvatar isSpeaking={isAiSpeaking} size="lg" />
                    </div>
                    <div className="text-left max-w-md">
                      <h3 className="text-xl font-semibold mb-2">
                        Hi, I'm Arya!
                      </h3>
                      <p className="text-muted-foreground">
                        I'll be your interviewer for the{" "}
                        {jobData?.title || "this position"} position at{" "}
                        {companyData?.name || "the company"}. Take a deep breath
                        and relax - I'll help you showcase your skills and
                        experience. When you're ready, click the button below to
                        begin.
                      </p>
                    </div>
                  </div>
                  <div className="space-y-4">
                    <div className="text-sm text-muted-foreground space-y-2">
                      <div className="flex items-center gap-2">
                        <div className={`w-2 h-2 rounded-full ${isDevicesInitialized ? 'bg-green-500' : 'bg-yellow-500'}`} />
                        <span>Device initialization: {isDevicesInitialized ? 'Complete' : 'Required'}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <div className={`w-2 h-2 rounded-full ${isScreenShared && isEntireScreenShared ? 'bg-green-500' : 'bg-yellow-500'}`} />
                        <span>Screen sharing: {isScreenShared && isEntireScreenShared ? 'Complete' : 'Required'}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <div className={`w-2 h-2 rounded-full ${isFaceDetectionActive ? 'bg-green-500' : 'bg-blue-500'}`} />
                        <span>Face detection: {isFaceDetectionActive ? 'Active' : 'Ready'}</span>
                      </div>
                    </div>
                    
                    {!isDevicesInitialized && (
                      <Button
                        size="lg"
                        onClick={initializeDevices}
                        className="mx-auto"
                      >
                        <Settings className="h-4 w-4 mr-2" />
                        Initialize Devices
                      </Button>
                    )}
                    
                    {isDevicesInitialized && !isScreenShared && (
                      <div className="space-y-2">
                        <Button
                          size="lg"
                          onClick={requestScreenShare}
                          className="mx-auto"
                        >
                          <Monitor className="h-4 w-4 mr-2" />
                          Share Screen
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={handleManualOverride}
                          className="mx-auto"
                        >
                          I'm Already Sharing Full Screen
                        </Button>
                      </div>
                    )}
                    
                    {isDevicesInitialized && isScreenShared && isEntireScreenShared && (
                      <Button
                        size="lg"
                        onClick={startInterview}
                        className="mx-auto"
                      >
                        <Play className="h-4 w-4 mr-2" />
                        Begin Interview
                      </Button>
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="col-span-1 lg:col-span-2 border-l border-t lg:border-t-0 bg-background/95 backdrop-blur-sm flex flex-col h-full overflow-hidden">
          <div className="p-4 border-b">
            <div className="flex items-center gap-2">
              <MessageSquare className="h-4 w-4" />
              <span className="font-medium">Transcript</span>
            </div>
          </div>
          
          <div className="flex-1 p-4 space-y-4">
            <div className="text-sm text-muted-foreground">
              Live transcript of your interview conversation
            </div>
            {isInterviewActive && isFaceDetectionActive && (
              <div className="text-xs text-muted-foreground bg-muted/50 p-2 rounded">
                <div className="flex items-center gap-2 mb-1">
                  <AlertTriangle className={`h-3 w-3 ${showFaceAlert || showEyeMovementAlert || showAudioAlert ? 'text-destructive' : 'text-green-500'}`} />
                  <span className="font-medium">Monitoring Status:</span>
                </div>
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <div className={`w-1.5 h-1.5 rounded-full ${showFaceAlert ? 'bg-destructive' : 'bg-green-500'}`} />
                    <span>Face detection: {showFaceAlert ? 'Multiple faces detected' : 'Single face detected'}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className={`w-1.5 h-1.5 rounded-full ${showEyeMovementAlert ? 'bg-destructive' : 'bg-green-500'}`} />
                    <span>Eye movement: {showEyeMovementAlert ? 'Unusual movement detected' : 'Normal'}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className={`w-1.5 h-1.5 rounded-full ${showAudioAlert ? 'bg-destructive' : 'bg-green-500'}`} />
                    <span>Audio: {showAudioAlert ? 'Multiple voices detected' : 'Single voice detected'}</span>
                  </div>
                </div>
              </div>
            )}
            <div className="space-y-4 max-h-[calc(100vh-250px)] overflow-y-auto">
              {conversation.map((message, index) => (
                <div
                  key={index}
                  className={`flex ${
                    message.role === "user"
                      ? "justify-end"
                      : "justify-start"
                  }`}
                >
                  <div
                    className={`max-w-[85%] rounded-lg p-3 ${
                      message.role === "user"
                        ? "bg-brand text-brand-foreground"
                        : "bg-muted text-foreground"
                    }`}
                  >
                    <div className="text-xs mb-1">
                      {message.role === "user" ? "You" : "AI Interviewer"}
                    </div>
                  {message.isTyping ? (
                      <div className="flex items-center gap-1">
                        <div
                          className="w-2 h-2 rounded-full bg-brand animate-bounce"
                          style={{ animationDelay: "0ms" }}
                        />
                        <div
                          className="w-2 h-2 rounded-full bg-brand animate-bounce"
                          style={{ animationDelay: "150ms" }}
                        />
                        <div
                          className="w-2 h-2 rounded-full bg-brand animate-bounce"
                          style={{ animationDelay: "300ms" }}
                        />
                      </div>
                    ) : (
                      <p>{message.content}</p>
                    )}
                  </div>
                </div>
              ))}
              <div ref={transcriptEndRef} />
            </div>
          </div>
        </div>
      </div>
      <Dialog open={showScreenSharePrompt} onOpenChange={setShowScreenSharePrompt}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Screen Sharing Required</DialogTitle>
            <DialogDescription>
              For this interview, you need to share your entire screen (fullscreen of monitor), not just a tab or application. This helps us monitor your work environment during the interview.
            </DialogDescription>
          </DialogHeader>
          <div className="py-4 space-y-4">
            <div className="bg-muted/50 p-4 rounded-lg">
              <h4 className="font-medium mb-2">Instructions:</h4>
              <ul className="text-sm space-y-1 text-muted-foreground">
                <li>• Click "Share Screen" below</li>
                <li>• Select "Entire Screen" or "Monitor" (not a specific tab)</li>
                <li>• Make sure to select the fullscreen option</li>
                <li>• Grant permission when prompted</li>
              </ul>
            </div>
            <div className="text-sm text-muted-foreground">
              <strong>Note:</strong> Sharing just a browser tab or application window is not sufficient. You must share your entire monitor screen.
            </div>
            <div className="text-xs text-muted-foreground bg-yellow-50 dark:bg-yellow-900/20 p-3 rounded">
              <strong>If you're having trouble:</strong> Make sure you're selecting "Entire Screen" or "Monitor" from the browser's screen sharing dialog, not a specific application or tab.
            </div>
          </div>
          <DialogFooter className="flex-col sm:flex-row gap-2">
            <Button variant="outline" onClick={() => setShowScreenSharePrompt(false)}>
              Cancel
            </Button>
            <Button variant="outline" onClick={handleManualOverride}>
              I'm Already Sharing Full Screen
            </Button>
            <Button onClick={requestScreenShare}>
              Share Screen
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>


      <Dialog open={showEditDialog} onOpenChange={setShowEditDialog}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>Review Your Response</DialogTitle>
            <DialogDescription>
              Please review and edit your response if needed. The AI has
              transcribed your answer, but you can make corrections if anything
              was misinterpreted. You have {editTimer} seconds to edit.
            </DialogDescription>
          </DialogHeader>
          <div className="py-4">
            <Textarea
              value={editedResponse}
              onChange={(e) => {
                // Prevent pasting
                if (
                  e.nativeEvent instanceof InputEvent &&
                  e.nativeEvent.inputType === "insertFromPaste"
                ) {
                  e.preventDefault();
                  return;
                }
                // Only allow one character at a time
                const newValue = e.target.value;
                if (newValue.length > editedResponse.length + 1) {
                  e.preventDefault();
                  return;
                }
                setEditedResponse(newValue);
              }}
              onPaste={(e) => e.preventDefault()}
              className="min-h-[200px]"
              placeholder="Your transcribed response will appear here..."
            />
          </div>
          <DialogFooter>
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Clock className="h-4 w-4" />
              <span>Time remaining: {editTimer}s</span>
            </div>
            <Button onClick={handleSubmitEditedResponse}>
              Confirm & Submit
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
