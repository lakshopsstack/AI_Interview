import { useEffect, useState } from "react";
import { z } from "zod";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ResumeUpload } from "@/components/interview/ResumeUpload";
import { useNavigate, useParams } from "react-router-dom";
import {
  Loader2,
  User,
  Mail,
  Phone,
  MapPin,
  Briefcase,
  GraduationCap,
  Brain,
  Link as LucideLink,
  Globe,
} from "lucide-react";
import { InterviewData } from "@/types/interview";
import { MatchResultsStage } from "./MatchResultsStage";
import { interviewApi } from "@/services/interviewApi";

const formSchema = z.object({
  name: z.string().min(2, { message: "Name must be at least 2 characters" }),
  email: z.string().email({ message: "Please enter a valid email address" }),
  phone: z
    .string()
    .min(10, { message: "Please enter a valid phone number" })
    .regex(/^\+?[0-9]+$/, {
      message: "Phone number must contain only digits and may start with +",
    }),
});

type FormValues = z.infer<typeof formSchema>;

type MatchAnalysis = {
  matchScore: number;
  matchFeedback: string;
};

interface ResumeUploadStageProps {
  jobTitle: string;
  companyName: string;
  jobId: number;
  onComplete?: (matchScore: number, matchFeedback: string) => void;
}

export function ResumeUploadStage({
  jobTitle,
  companyName,
  jobId,
  onComplete,
}: ResumeUploadStageProps) {
  const [resumeFile, setResumeFile] = useState<File | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [candidateData, setCandidateData] = useState<InterviewData>();
  const [matchAnalysis, setMatchAnalysis] = useState<MatchAnalysis>({
    matchScore: 0,
    matchFeedback: "",
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isCompleted, setIsCompleted] = useState(false);
  const navigate = useNavigate();
  const { accessCode } = useParams<{ accessCode: string }>();
  const [formErrors, setFormErrors] = useState<{ [key: string]: string }>({});

  const handleResumeChange = (file: File) => {
    if (isCompleted) return;
    if (file.type !== "application/pdf") {
      alert("Please upload a PDF file.");
      return;
    }

    const extractResumeData = async () => {
      setIsLoading(true);
      const res = await interviewApi.extractResumeData(file);
      const data = res.data;

      // Log the raw AI response
      console.log("Raw AI Response:", data);

      // Check and log which fields are null or empty
      const nullFields = Object.entries(data)
        .filter(([_, value]) => {
          if (Array.isArray(value)) {
            return (
              value.length === 0 || (value.length === 1 && value[0] === "")
            );
          }
          return !value || value === "";
        })
        .map(([key]) => key);

      console.log("Missing or Empty Fields:", nullFields);
      console.log("Fields that need manual input:", nullFields);

      // Log the parsed data that will be used
      const parsedData = {
        id: 0,
        firstname: data.firstname,
        lastname: data.lastname,
        email: data.email,
        phone: data.phone,
        city: data.location,
        resume_text: data.resume_text,
        work_experience_yrs: Number(data.work_experience),
        education: data.education,
        skills: data.skills.join(","),
        linkedin_url: data.linkedin_url,
        portfolio_url: data.portfolio_url,
        resume_match_score: 0,
        resume_match_feedback: "",
        status: "pending",
        overall_score: 0,
        feedback: "",
        created_at: new Date().toISOString(),
        job_id: 0,
        technical_skills_score: 0,
        communication_skills_score: 0,
        problem_solving_skills_score: 0,
        cultural_fit_score: 0,
        resume_url: "",
      };

      console.log("Parsed Candidate Data:", parsedData);

      setCandidateData(parsedData);
      setIsLoading(false);
    };
    extractResumeData();
    setResumeFile(file);
  };

  const handleResumeRemove = () => {
    setResumeFile(null);
    setCandidateData(undefined);
  };

  const validateForm = () => {
    const errors: { [key: string]: string } = {};
    // Full Name
    if (
      !candidateData?.firstname ||
      candidateData.firstname.trim() === "" ||
      !candidateData?.lastname ||
      candidateData.lastname.trim() === ""
    ) {
      errors.fullName = "Full name is required";
    }
    // Email
    if (
      !candidateData?.email ||
      candidateData.email.trim() === "" ||
      !/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(candidateData.email)
    ) {
      errors.email = "Valid email is required";
    }
    // Phone
    if (
      !candidateData?.phone ||
      candidateData.phone.trim() === "" ||
      candidateData.phone.length < 10
    ) {
      errors.phone = "Valid phone number is required";
    }
    // Location
    if (!candidateData?.city || candidateData.city.trim() === "") {
      errors.location = "Location is required";
    }
    // Work Experience
    if (
      candidateData?.work_experience_yrs === undefined ||
      candidateData?.work_experience_yrs === null ||
      isNaN(Number(candidateData?.work_experience_yrs))
    ) {
      errors.workExperience = "Work experience is required";
    }
    // Education
    if (!candidateData?.education || candidateData.education.trim() === "") {
      errors.education = "Education is required";
    }
    // Skills
    if (!candidateData?.skills || candidateData.skills.trim() === "") {
      errors.skills = "Skills are required";
    }
    return errors;
  };

  const handleSubmitApplication = async (
    e: React.FormEvent<HTMLFormElement>
  ) => {
    e.preventDefault();

    if (isCompleted) return;

    if (!resumeFile) {
      return;
    }

    const errors = validateForm();
    setFormErrors(errors);
    if (Object.keys(errors).length > 0) {
      toast.error("Please fill in all required fields correctly.");
      return;
    }

    setIsSubmitting(true);
    const ProcessResume = async () => {
      try {
        if (!candidateData) {
          toast.error("Please complete the form first");
          return;
        }

        // Update interview with candidate data
        const updateData = {
          firstname: candidateData.firstname,
          lastname: candidateData.lastname,
          status: "Resume Submitted",
          email: candidateData.email,
          phone: candidateData.phone,
          city: candidateData.city,
          resume_text: candidateData.resume_text,
          work_experience_yrs: candidateData.work_experience_yrs,
          education: candidateData.education,
          skills: candidateData.skills,
          linkedin_url: candidateData.linkedin_url,
          portfolio_url: candidateData.portfolio_url,
        };

        console.log("Updating interview with data:", updateData);

        // Update the interview with candidate data
        await interviewApi.updateInterview(updateData);

        console.log("Uploading resume file:", resumeFile);
        await interviewApi.uploadResume(resumeFile);
        console.log("Resume uploaded successfully");

        console.log("Analyzing candidate...");
        const analysisResponse = await interviewApi.analyzeCandidate();
        const analysisData = analysisResponse.data;
        console.log("Analysis completed:", analysisData);

        toast.success("Resume processed successfully!");
        setIsCompleted(true);
        setMatchAnalysis({
          matchScore: Number(analysisData.resume_match_score),
          matchFeedback: analysisData.resume_match_feedback,
        });
      } catch (error: any) {
        console.error("Error processing resume:", error);
        console.error("Error response:", error.response?.data);
        console.error("Error status:", error.response?.status);
        console.error("Error headers:", error.response?.headers);

        let errorMessage = "Error processing your resume";

        if (error.response?.data?.detail) {
          errorMessage = String(error.response.data.detail);
        } else if (error.response?.data?.errors) {
          const errors = error.response.data.errors;
          errorMessage = errors.map((err: any) => String(err.msg)).join(", ");
        } else if (error.message) {
          errorMessage = String(error.message);
        }

        toast.error(errorMessage);
      } finally {
        setIsSubmitting(false);
      }
    };
    ProcessResume();
  };

  const handleStartInterview = () => {
    navigate(`/interview/setup?i_id=${candidateData?.id ?? ""}`);
  };

  const handleMatchAnalysis = async (analysis: MatchAnalysis) => {
    setMatchAnalysis(analysis);
    setMatchAnalysis((prev) => ({
      ...prev,
      matchScore: Number(analysis.matchScore),
    }));
    setMatchAnalysis((prev) => ({
      ...prev,
      matchFeedback: analysis.matchFeedback,
    }));
  };

  useEffect(() => {
    if (isCompleted && matchAnalysis) {
      if (onComplete) {
        onComplete(matchAnalysis.matchScore, matchAnalysis.matchFeedback);
      }
    }
  }, [isCompleted]);

  if (isCompleted && matchAnalysis) {
    return (
      <MatchResultsStage
        matchScore={matchAnalysis.matchScore}
        matchFeedback={matchAnalysis.matchFeedback}
        jobTitle={jobTitle}
        companyName={companyName}
        interviewId={candidateData?.id?.toString() ?? ""}
        onScheduleLater={() => {
          toast.success(
            "Interview scheduled for later. Check your email for details."
          );
        }}
      />
    );
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-2xl">
      {isLoading && (
        <div className="absolute h-full w-full bg-gray-700/85 backdrop-blur-sm  top-0 left-0 flex flex-col items-center justify-center z-50">
          <div>Extracting Resume Data</div>
          <Loader2 size={32} className="animate-spin" />
        </div>
      )}
      <div className="space-y-8">
        <div className="space-y-2">
          <h2 className="text-2xl font-bold tracking-tight">
            Apply for <span className="text-brand">{jobTitle}</span> at{" "}
            <span className="text-brand">{companyName}</span>
          </h2>
          <p className="text-muted-foreground">
            Upload your resume and provide your contact information to begin the
            interview process.
          </p>
        </div>

        {/* Resume Upload Card */}
        <div className="bg-card rounded-xl shadow-lg p-6">
          <h3 className="text-lg font-semibold mb-4 border-b pb-2">
            Resume Upload
          </h3>
          <ResumeUpload
            onUpload={handleResumeChange}
            disabled={isSubmitting || isCompleted}
          />
          {resumeFile && (
            <div className="mt-4 p-3 bg-muted rounded-md flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="font-medium text-brand">
                  {resumeFile.name}
                </span>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={handleResumeRemove}
                className="text-destructive hover:text-destructive"
                disabled={isSubmitting || isCompleted}
              >
                Remove
              </Button>
            </div>
          )}
        </div>

        {/* Candidate Data Card */}
        {candidateData && (
          <div className="bg-card rounded-xl shadow-lg p-6">
            <h3 className="text-lg font-semibold mb-4 border-b pb-2">
              Verify Your Information
            </h3>
            <form
              onSubmit={handleSubmitApplication}
              className="grid grid-cols-1 md:grid-cols-2 gap-6"
            >
              {/* Full Name */}
              <div className="col-span-1">
                <label className="block text-sm font-medium mb-1 flex items-center gap-1">
                  <User className="text-brand w-4 h-4" /> Full Name{" "}
                  <span className="text-destructive">*</span>
                </label>
                <Input
                  value={
                    candidateData.firstname + " " + candidateData.lastname
                  }
                  onChange={(e) => {
                    const [firstName, ...lastNameParts] =
                      e.target.value.split(" ");
                    if (candidateData) {
                      setCandidateData({
                        ...candidateData,
                        firstname: firstName || "",
                        lastname: lastNameParts.join(" ") || "",
                      });
                    }
                  }}
                  placeholder="John Doe"
                  disabled={isSubmitting || isCompleted}
                />
                {formErrors.fullName && (
                  <p className="text-sm text-destructive mt-1">
                    {formErrors.fullName}
                  </p>
                )}
              </div>

              {/* Email */}
              <div className="col-span-1">
                <label className="block text-sm font-medium mb-1 flex items-center gap-1">
                  <Mail className="text-brand w-4 h-4" /> Email Address{" "}
                  <span className="text-destructive">*</span>
                </label>
                <Input
                  value={candidateData.email || ""}
                  onChange={(e) => {
                    if (candidateData) {
                      setCandidateData({
                        ...candidateData,
                        email: e.target.value,
                      });
                    }
                  }}
                  type="email"
                  placeholder="you@example.com"
                  disabled={isSubmitting || isCompleted}
                />
                {formErrors.email && (
                  <p className="text-sm text-destructive mt-1">
                    {formErrors.email}
                  </p>
                )}
              </div>

              {/* Phone */}
              <div className="col-span-1">
                <label className="block text-sm font-medium mb-1 flex items-center gap-1">
                  <Phone className="text-brand w-4 h-4" /> Phone Number{" "}
                  <span className="text-destructive">*</span>
                </label>
                <Input
                  value={candidateData.phone || ""}
                  onChange={(e) => {
                    // Allow numbers and + at the start
                    const value = e.target.value.replace(/[^\d+]/g, "");
                    if (candidateData) {
                      setCandidateData({
                        ...candidateData,
                        phone: value,
                      });
                    }
                  }}
                  type="tel"
                  pattern="[0-9+]*"
                  placeholder="+919108126876"
                  disabled={isSubmitting || isCompleted}
                />
                {formErrors.phone && (
                  <p className="text-sm text-destructive mt-1">
                    {formErrors.phone}
                  </p>
                )}
              </div>

              {/* Location */}
              <div className="col-span-1">
                <label className="block text-sm font-medium mb-1 flex items-center gap-1">
                  <MapPin className="text-brand w-4 h-4" /> Location{" "}
                  <span className="text-destructive">*</span>
                </label>
                <Input
                  value={candidateData.city || ""}
                  onChange={(e) => {
                    if (candidateData) {
                      setCandidateData({
                        ...candidateData,
                        city: e.target.value,
                      });
                    }
                  }}
                  placeholder="City, State"
                  disabled={isSubmitting || isCompleted}
                />
                {formErrors.location && (
                  <p className="text-sm text-destructive mt-1">
                    {formErrors.location}
                  </p>
                )}
              </div>

              {/* Work Experience */}
              <div className="col-span-1">
                <label className="block text-sm font-medium mb-1 flex items-center gap-1">
                  <Briefcase className="text-brand w-4 h-4" /> Work Experience
                  (years) <span className="text-destructive">*</span>
                </label>
                <Input
                  type="number"
                  value={candidateData.work_experience_yrs || ""}
                  onChange={(e) => {
                    if (candidateData) {
                      setCandidateData({
                        ...candidateData,
                        work_experience_yrs: Number(e.target.value),
                      });
                    }
                  }}
                  placeholder="e.g. 5"
                  disabled={isSubmitting || isCompleted}
                />
                {formErrors.workExperience && (
                  <p className="text-sm text-destructive mt-1">
                    {formErrors.workExperience}
                  </p>
                )}
              </div>

              {/* Education */}
              <div className="col-span-1">
                <label className="block text-sm font-medium mb-1 flex items-center gap-1">
                  <GraduationCap className="text-brand w-4 h-4" /> Education{" "}
                  <span className="text-destructive">*</span>
                </label>
                <Input
                  value={candidateData.education || ""}
                  onChange={(e) => {
                    if (candidateData) {
                      setCandidateData({
                        ...candidateData,
                        education: e.target.value,
                      });
                    }
                  }}
                  placeholder="e.g. Bachelor's in Computer Science"
                  disabled={isSubmitting || isCompleted}
                />
                {formErrors.education && (
                  <p className="text-sm text-destructive mt-1">
                    {formErrors.education}
                  </p>
                )}
              </div>

              {/* Skills */}
              <div className="col-span-2">
                <label className="block text-sm font-medium mb-1 flex items-center gap-1">
                  <Brain className="text-brand w-4 h-4" /> Skills{" "}
                  <span className="text-destructive">*</span>
                </label>
                <Input
                  value={candidateData.skills || ""}
                  onChange={(e) => {
                    if (candidateData) {
                      setCandidateData({
                        ...candidateData,
                        skills: e.target.value,
                      });
                    }
                  }}
                  placeholder="e.g. JavaScript, React, Node.js"
                  disabled={isSubmitting || isCompleted}
                />
                {formErrors.skills && (
                  <p className="text-sm text-destructive mt-1">
                    {formErrors.skills}
                  </p>
                )}
              </div>

              {/* LinkedIn URL */}
              <div className="col-span-1">
                <label className="block text-sm font-medium mb-1 flex items-center gap-1">
                  <LucideLink className="text-brand w-4 h-4" /> LinkedIn URL
                </label>
                <Input
                  value={candidateData.linkedin_url || ""}
                  onChange={(e) => {
                    if (candidateData) {
                      setCandidateData({
                        ...candidateData,
                        linkedin_url: e.target.value,
                      });
                    }
                  }}
                  placeholder="https://linkedin.com/in/yourprofile"
                  disabled={isSubmitting || isCompleted}
                />
              </div>

              {/* Portfolio URL */}
              <div className="col-span-1">
                <label className="block text-sm font-medium mb-1 flex items-center gap-1">
                  <Globe className="text-brand w-4 h-4" /> Portfolio URL
                </label>
                <Input
                  value={candidateData.portfolio_url || ""}
                  onChange={(e) => {
                    if (candidateData) {
                      setCandidateData({
                        ...candidateData,
                        portfolio_url: e.target.value,
                      });
                    }
                  }}
                  placeholder="https://yourportfolio.com"
                  disabled={isSubmitting || isCompleted}
                />
              </div>

              <div className="col-span-2 mt-4">
                <Button
                  type="submit"
                  className="w-full py-3 text-lg font-semibold rounded-lg shadow-md bg-brand hover:bg-brand-dark transition"
                  disabled={isSubmitting || isCompleted || !resumeFile}
                >
                  {isSubmitting ? (
                    <span className="flex items-center gap-2 justify-center">
                      <Loader2 className="animate-spin" size={20} />{" "}
                      Processing...
                    </span>
                  ) : (
                    "Submit Application"
                  )}
                </Button>
              </div>
            </form>
          </div>
        )}
      </div>
    </div>
  );
}
