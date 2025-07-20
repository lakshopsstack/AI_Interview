import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  CheckCircle2,
  Calendar,
  Clock,
  Mail,
  ArrowRight,
  Star,
  Zap,
  Briefcase,
  Award,
  Check,
} from "lucide-react";
import { toast } from "sonner";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";

interface MatchResultsStageProps {
  matchScore: number;
  matchFeedback: string;
  jobTitle: string;
  companyName: string;
  interviewId: string;
  onScheduleLater: () => void;
  onStartInterview?: () => void;
}

export function MatchResultsStage({
  matchScore,
  matchFeedback,
  jobTitle,
  companyName,
  interviewId,
  onScheduleLater,
  onStartInterview,
}: MatchResultsStageProps) {
  const [showRatingModal, setShowRatingModal] = useState(false);
  const [rating, setRating] = useState(0);
  const [hoverRating, setHoverRating] = useState(0);
  const [feedbackText, setFeedbackText] = useState("");
  const [showScheduleModal, setShowScheduleModal] = useState(false);
  const navigate = useNavigate();

  const handleStartInterview = async () => {
    try {
      if (onStartInterview) {
        onStartInterview();
      } else {
        // fallback: open in new tab (legacy)
        const interviewUrl = `/interview/overview?i_id=${interviewId}&company=${companyName}`;
        window.open(interviewUrl, "fullscreen=yes");
      }
    } catch (error) {
      console.error("Error starting interview:", error);
      toast.error("Failed to start interview. Please try again.");
    }
  };

  const handleScheduleLater = () => {
    setShowScheduleModal(true);
  };

  const handleScheduleConfirm = () => {
    setShowScheduleModal(false);
    onScheduleLater();
    toast.success("Interview scheduled! Check your email for details.");
  };

  const handleRatingSubmit = () => {
    // Here you would typically send the rating and feedback to your backend
    toast.success("Thank you for your feedback!");
    setShowRatingModal(false);
    setRating(0);
    setFeedbackText("");
  };

  const renderStars = () => {
    return [1, 2, 3, 4, 5].map((star) => (
      <button
        key={star}
        className="focus:outline-none"
        onClick={() => setRating(star)}
        onMouseEnter={() => setHoverRating(star)}
        onMouseLeave={() => setHoverRating(0)}
      >
        {(hoverRating || rating) >= star ? (
          <Star className="h-8 w-8 text-yellow-400 fill-yellow-400" />
        ) : (
          <Star className="h-8 w-8 text-yellow-400" />
        )}
      </button>
    ));
  };

  const getMatchColor = (score: number) => {
    if (score >= 80) return "bg-green-500";
    if (score >= 60) return "bg-blue-500";
    if (score >= 40) return "bg-yellow-500";
    return "bg-red-500";
  };

  const getMatchText = (score: number) => {
    if (score >= 80) return "Excellent Match!";
    if (score >= 60) return "Good Match";
    if (score >= 40) return "Moderate Match";
    return "Limited Match";
  };

  const getMatchDescription = (score: number) => {
    if (score >= 80)
      return "Your profile strongly aligns with the job requirements.";
    if (score >= 60)
      return "Your profile matches well with most of the job requirements.";
    if (score >= 40)
      return "Your profile has some alignment with the job requirements.";
    return "Your profile has limited alignment with the job requirements.";
  };

  return (
    <div className="w-full min-h-screen bg-background p-6">
      {/* Header Section */}
      <div className="mb-8 text-center">
        <h1 className="text-3xl font-bold mb-2">Resume Match Results</h1>
        <p className="text-muted-foreground">
          We've analyzed your resume against the {jobTitle} position at{" "}
          {companyName}
        </p>
      </div>

      {/* Main Content */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Match Score Card */}
        <Card className="shadow-sm">
          <CardHeader className="pb-2">
            <CardTitle className="text-xl">Match Score</CardTitle>
            <CardDescription>
              How well your profile matches the job requirements
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col items-center">
              <div className="relative w-40 h-40 flex items-center justify-center">
                <svg className="w-full h-full" viewBox="0 0 100 100">
                  <circle
                    className="text-muted/20"
                    strokeWidth="10"
                    stroke="currentColor"
                    fill="transparent"
                    r="40"
                    cx="50"
                    cy="50"
                  />
                  <circle
                    className={`${getMatchColor(
                      matchScore
                    )} transition-all duration-500 ease-in-out`}
                    strokeWidth="10"
                    strokeDasharray={251.2}
                    strokeDashoffset={251.2 - (251.2 * matchScore) / 100}
                    strokeLinecap="round"
                    stroke="currentColor"
                    fill="transparent"
                    r="40"
                    cx="50"
                    cy="50"
                  />
                </svg>
                <div className="absolute flex flex-col items-center">
                  <span className="text-4xl font-bold">{matchScore}%</span>
                  <span className="text-sm text-muted-foreground">Match</span>
                </div>
              </div>
              <h3 className="text-2xl font-semibold mt-4">
                {getMatchText(matchScore)}
              </h3>
              <p className="text-center text-muted-foreground mt-2">
                {getMatchDescription(matchScore)}
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Job Details Card */}
        <Card className="shadow-sm">
          <CardHeader className="pb-2">
            <CardTitle className="text-xl">Job Details</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <div className="flex-shrink-0 h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
                  <Briefcase className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <p className="font-medium">{jobTitle}</p>
                  <p className="text-sm text-muted-foreground">{companyName}</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <div className="flex-shrink-0 h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
                  <Award className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <p className="font-medium">Interview Type</p>
                  <p className="text-sm text-muted-foreground">
                    AI-Powered Video Interview
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <div className="flex-shrink-0 h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
                  <Clock className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <p className="font-medium">Estimated Duration</p>
                  <p className="text-sm text-muted-foreground">15-20 minutes</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Next Steps Card */}
        <Card className="shadow-sm">
          <CardHeader className="pb-2">
            <CardTitle className="text-xl">Next Steps</CardTitle>
            <CardDescription>Choose how you'd like to proceed</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex gap-3">
                <div className="flex-shrink-0 h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center">
                  <span className="text-sm font-medium">1</span>
                </div>
                <div>
                  <h4 className="font-medium">Complete Interview</h4>
                  <p className="text-sm text-muted-foreground">
                    Record your responses to interview questions
                  </p>
                </div>
              </div>

              <div className="flex gap-3">
                <div className="flex-shrink-0 h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center">
                  <span className="text-sm font-medium">2</span>
                </div>
                <div>
                  <h4 className="font-medium">Receive Feedback</h4>
                  <p className="text-sm text-muted-foreground">
                    Get immediate feedback on your performance
                  </p>
                </div>
              </div>

              <div className="flex gap-3">
                <div className="flex-shrink-0 h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center">
                  <span className="text-sm font-medium">3</span>
                </div>
                <div>
                  <h4 className="font-medium">Hiring Decision</h4>
                  <p className="text-sm text-muted-foreground">
                    The hiring team will review your interview
                  </p>
                </div>
              </div>

              <div className="pt-4 space-y-3">
                <Button
                  onClick={handleStartInterview}
                  size="lg"
                  className="w-full"
                >
                  <Zap className="mr-2 h-5 w-5" />
                  Take Interview Now
                </Button>
                <Button
                  onClick={handleScheduleLater}
                  variant="outline"
                  size="lg"
                  className="w-full hidden"
                >
                  <Calendar className="mr-2 h-5 w-5" />
                  Schedule for Later
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Tips Section */}
      <div className="mt-8">
        <h2 className="text-xl font-semibold mb-4">Tips for Success</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="flex items-start gap-3 p-4 bg-muted/20 rounded-lg">
            <div className="flex-shrink-0 h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center">
              <CheckCircle2 className="h-4 w-4 text-primary" />
            </div>
            <div>
              <p className="font-medium">Prepare Your Environment</p>
              <p className="text-sm text-muted-foreground">
                Find a quiet place with good lighting
              </p>
            </div>
          </div>
          <div className="flex items-start gap-3 p-4 bg-muted/20 rounded-lg">
            <div className="flex-shrink-0 h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center">
              <CheckCircle2 className="h-4 w-4 text-primary" />
            </div>
            <div>
              <p className="font-medium">Test Your Equipment</p>
              <p className="text-sm text-muted-foreground">
                Ensure your camera and microphone work
              </p>
            </div>
          </div>
          <div className="flex items-start gap-3 p-4 bg-muted/20 rounded-lg">
            <div className="flex-shrink-0 h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center">
              <CheckCircle2 className="h-4 w-4 text-primary" />
            </div>
            <div>
              <p className="font-medium">Be Authentic</p>
              <p className="text-sm text-muted-foreground">
                Answer questions honestly and from experience
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Schedule Later Modal */}
      <Dialog open={showScheduleModal} onOpenChange={setShowScheduleModal}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Schedule Interview for Later</DialogTitle>
            <DialogDescription>
              We'll send you an email with instructions to complete your
              interview within 48 hours.
            </DialogDescription>
          </DialogHeader>
          <div className="flex flex-col items-center space-y-4 py-4">
            <div className="bg-muted/30 rounded-full p-4">
              <Mail className="h-8 w-8 text-primary" />
            </div>
            <p className="text-center text-muted-foreground">
              A confirmation email has been sent to your registered email
              address with instructions to complete your interview.
            </p>
            <p className="text-center text-sm font-medium">
              Please complete your interview within 48 hours to ensure your
              application is considered.
            </p>
          </div>
          <DialogFooter>
            <Button onClick={handleScheduleConfirm} className="w-full">
              Got it, thanks!
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Rating Modal */}
      <Dialog open={showRatingModal} onOpenChange={setShowRatingModal}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Rate Your Experience</DialogTitle>
            <DialogDescription>
              Your feedback helps us improve the interview process.
            </DialogDescription>
          </DialogHeader>
          <div className="flex flex-col items-center space-y-6 py-4">
            <div className="flex space-x-2">{renderStars()}</div>
            <Textarea
              placeholder="Share your thoughts about the interview experience..."
              value={feedbackText}
              onChange={(e) => setFeedbackText(e.target.value)}
              className="min-h-[100px]"
            />
            <div className="flex gap-2 w-full">
              <Button
                variant="outline"
                onClick={() => setShowRatingModal(false)}
                className="flex-1"
              >
                Cancel
              </Button>
              <Button
                onClick={handleRatingSubmit}
                className="flex-1"
                disabled={rating === 0}
              >
                Submit Feedback
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
