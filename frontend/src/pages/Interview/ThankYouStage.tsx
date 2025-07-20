import React, { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { CheckCircle2, Calendar, Star, Share2, ThumbsUp, ThumbsDown, MessageCircle, ArrowRight, Clock, Mail, Phone, Users } from "lucide-react";
import { toast } from "sonner";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { motion } from "framer-motion";

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

export function ThankYouStage({
  feedback,
  score,
  scoreBreakdown,
  suggestions,
  keywords,
  transcript = [],
  companyName = "the company",
  jobTitle = "the position",
  jobId,
}: ThankYouStageProps) {
  const [showRatingModal, setShowRatingModal] = useState(false);
  const [rating, setRating] = useState(0);
  const [hoverRating, setHoverRating] = useState(0);
  const [feedbackText, setFeedbackText] = useState("");
  const [activeTab, setActiveTab] = useState("feedback");
  const [showShareOptions, setShowShareOptions] = useState(false);
  const [feedbackReaction, setFeedbackReaction] = useState<"positive" | "negative" | null>(null);
  const [showFeedbackForm, setShowFeedbackForm] = useState(false);

  const handleRatingSubmit = () => {
    // Here you would typically send the rating and feedback to your backend
    toast.success("Thank you for your feedback!");
    setShowRatingModal(false);
    setRating(0);
    setFeedbackText("");
  };


  const handleFeedbackReaction = (reaction: "positive" | "negative") => {
    setFeedbackReaction(reaction);
    setShowFeedbackForm(true);
  };

  const handleFeedbackSubmit = () => {
    toast.success("Thank you for your detailed feedback!");
    setShowFeedbackForm(false);
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

  const timelineSteps = [
    {
      icon: <Clock className="h-5 w-5" />,
      title: "Review Process",
      description: "Our team will review your interview responses within the next 5-7 business days.",
      delay: 0.1
    },
    {
      icon: <Mail className="h-5 w-5" />,
      title: "Email Notification",
      description: "You'll receive an email with feedback and next steps, whether you're moving forward or not.",
      delay: 0.2
    },
    {
      icon: <Phone className="h-5 w-5" />,
      title: "Possible Call",
      description: "If selected, you may receive a call from our recruitment team to discuss next steps.",
      delay: 0.3
    },
    {
      icon: <Users className="h-5 w-5" />,
      title: "Team Interview",
      description: "Successful candidates may be invited for a follow-up interview with our team.",
      delay: 0.4
    }
  ];

  return (
    <div className="py-8 flex flex-col items-center">
      <motion.div 
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ duration: 0.5 }}
        className="rounded-full bg-green-100 dark:bg-green-900/20 p-6 mb-6"
      >
        <CheckCircle2 className="h-12 w-12 text-green-600 dark:text-green-500" />
      </motion.div>
      
      <motion.div 
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.5, delay: 0.2 }}
        className="space-y-2 max-w-xl mb-8 text-center"
      >
        <h2 className="text-2xl font-bold">Interview Completed!</h2>
        <p className="text-muted-foreground">
          Thank you for completing the interview with {companyName} for the {jobTitle} position.
        </p>
      </motion.div>
      
      <Tabs value={activeTab} onValueChange={setActiveTab} className="mb-6 w-full max-w-4xl">
        <TabsList className="grid grid-cols-3 w-full max-w-md mx-auto">
          <TabsTrigger value="feedback">Feedback</TabsTrigger>
          <TabsTrigger value="next-steps">Next Steps</TabsTrigger>
          <TabsTrigger value="actions">Actions</TabsTrigger>
        </TabsList>

        <TabsContent value="feedback" className="mt-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* Left Column - Feedback */}
            <motion.div 
              initial={{ x: -20, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              transition={{ duration: 0.5, delay: 0.3 }}
              className="space-y-6"
            >
              <Card className="shadow-sm">
                <CardContent className="pt-6">
                  <h3 className="text-xl font-semibold mb-4">Interview Feedback</h3>
                  <div className="space-y-4">
                    <div className="flex items-center justify-center space-x-2">
                      <span className="text-3xl font-bold">{score}/100</span>
                      <div className="flex">
                        {[...Array(5)].map((_, i) => (
                          <Star
                            key={i}
                            className={`h-5 w-5 ${
                              i < Math.floor(score / 2)
                                ? "text-yellow-400 fill-yellow-400"
                                : "text-gray-300"
                            }`}
                          />
                        ))}
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <p className="text-sm font-medium">Technical Skills</p>
                        <Progress value={scoreBreakdown.technicalSkills} />
                      </div>
                      <div className="space-y-2">
                        <p className="text-sm font-medium">Communication</p>
                        <Progress value={scoreBreakdown.communication} />
                      </div>
                      <div className="space-y-2">
                        <p className="text-sm font-medium">Problem Solving</p>
                        <Progress value={scoreBreakdown.problemSolving} />
                      </div>
                      <div className="space-y-2">
                        <p className="text-sm font-medium">Cultural Fit</p>
                        <Progress value={scoreBreakdown.culturalFit} />
                      </div>
                    </div>
                    <div className="text-left">
                      <p className="font-medium mb-2">Overall Assessment:</p>
                      <p className="text-muted-foreground">{feedback}</p>
                    </div>
                    <div className="text-left">
                      <p className="font-medium mb-2">Suggestions for Improvement:</p>
                      <ul className="list-disc list-inside space-y-1 text-muted-foreground">
                        {suggestions.map((suggestion, index) => (
                          <li key={index}>{suggestion}</li>
                        ))}
                      </ul>
                    </div>
                    {keywords && keywords.length > 0 && (
                      <div className="text-left">
                        <p className="font-medium mb-2">Key Terms:</p>
                        <div className="flex flex-wrap gap-2">
                          {keywords.map((keyword, index) => (
                            <Badge
                              key={index}
                              variant={
                                keyword.sentiment === "positive"
                                  ? "default"
                                  : keyword.sentiment === "negative"
                                  ? "destructive"
                                  : "secondary"
                              }
                            >
                              {keyword.term} ({keyword.count})
                            </Badge>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            </motion.div>

            {/* Right Column - Feedback Reaction */}
            <motion.div 
              initial={{ x: 20, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              transition={{ duration: 0.5, delay: 0.4 }}
              className="space-y-6"
            >
              <Card className="shadow-sm">
                <CardContent className="pt-6">
                  <h3 className="text-xl font-semibold mb-4">How do you feel about this feedback?</h3>
                  
                  {!feedbackReaction ? (
                    <div className="flex flex-col items-center space-y-6 py-8">
                      <p className="text-muted-foreground text-center mb-4">
                        Your reaction helps us understand if our feedback was helpful and accurate.
                      </p>
                      <div className="flex gap-6">
                        <Button 
                          variant="outline" 
                          size="lg" 
                          className="flex flex-col items-center gap-2 h-auto py-4 px-6"
                          onClick={() => handleFeedbackReaction("positive")}
                        >
                          <ThumbsUp className="h-8 w-8 text-green-500" />
                          <span>Helpful</span>
                        </Button>
                        <Button 
                          variant="outline" 
                          size="lg" 
                          className="flex flex-col items-center gap-2 h-auto py-4 px-6"
                          onClick={() => handleFeedbackReaction("negative")}
                        >
                          <ThumbsDown className="h-8 w-8 text-red-500" />
                          <span>Not Helpful</span>
                        </Button>
                      </div>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      <div className="flex items-center justify-center gap-2 text-center">
                        <ThumbsUp className={`h-6 w-6 ${feedbackReaction === "positive" ? "text-green-500" : "text-gray-300"}`} />
                        <ThumbsDown className={`h-6 w-6 ${feedbackReaction === "negative" ? "text-red-500" : "text-gray-300"}`} />
                        <p className="font-medium">
                          {feedbackReaction === "positive" 
                            ? "Thank you! We're glad the feedback was helpful." 
                            : "We're sorry the feedback wasn't helpful. Please let us know how we can improve."}
                        </p>
                      </div>
                      
                      {showFeedbackForm && (
                        <div className="space-y-4 mt-4">
                          <Textarea
                            placeholder="Please share your thoughts about the feedback..."
                            className="min-h-[100px]"
                          />
                          <div className="flex gap-2">
                            <Button variant="outline" onClick={() => setShowFeedbackForm(false)} className="flex-1">
                              Cancel
                            </Button>
                            <Button onClick={handleFeedbackSubmit} className="flex-1">
                              Submit
                            </Button>
                          </div>
                        </div>
                      )}
                    </div>
                  )}
                </CardContent>
              </Card>
            </motion.div>
          </div>
        </TabsContent>
        
        <TabsContent value="next-steps" className="mt-6">
          <motion.div 
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.5 }}
            className="space-y-6"
          >
            <Card className="shadow-sm">
              <CardContent className="pt-6">
                <h3 className="text-xl font-semibold mb-6">What Happens Next?</h3>
                
                <div className="space-y-8">
                  {timelineSteps.map((step, index) => (
                    <motion.div 
                      key={index}
                      initial={{ x: -20, opacity: 0 }}
                      animate={{ x: 0, opacity: 1 }}
                      transition={{ duration: 0.5, delay: step.delay }}
                      className="flex gap-4 relative"
                    >
                      <div className="flex-shrink-0 h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
                        {step.icon}
                      </div>
                      <div className="space-y-1">
                        <h4 className="font-medium">{step.title}</h4>
                        <p className="text-sm text-muted-foreground">
                          {step.description}
                        </p>
                      </div>
                      {index < timelineSteps.length - 1 && (
                        <div className="absolute left-5 top-10 bottom-0 w-0.5 bg-border" />
                      )}
                    </motion.div>
                  ))}
                </div>
              </CardContent>
            </Card>
            
            <Card className="shadow-sm">
              <CardContent className="pt-6">
                <h3 className="text-xl font-semibold mb-4">Estimated Timeline</h3>
                <div className="bg-muted/30 rounded-lg p-4 flex items-center gap-3">
                  <Calendar className="h-5 w-5 text-muted-foreground" />
                  <p className="text-sm text-muted-foreground">
                    Please allow up to one week for us to review your interview.
                  </p>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </TabsContent>
        
        <TabsContent value="actions" className="mt-6">
          <motion.div 
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.5 }}
            className="space-y-6"
          >
            <Card className="shadow-sm">
              <CardContent className="pt-6">
                <h3 className="text-xl font-semibold mb-4">Actions</h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <Button onClick={() => setShowRatingModal(true)} className="w-full h-auto py-4">
                    <Star className="mr-2 h-5 w-5" />
                    <div className="flex flex-col items-start">
                      <span className="font-medium">Rate Your Experience</span>
                      <span className="text-xs text-muted-foreground">Help us improve our interview process</span>
                    </div>
                  </Button>
                  
                  <Button onClick={() => setShowShareOptions(true)} variant="outline" className="w-full h-auto py-4">
                    <Share2 className="mr-2 h-5 w-5" />
                    <div className="flex flex-col items-start">
                      <span className="font-medium">Share Interview</span>
                      <span className="text-xs text-muted-foreground">Copy interview link</span>
                    </div>
                  </Button>
                  
                  <Button variant="outline" className="w-full h-auto py-4">
                    <MessageCircle className="mr-2 h-5 w-5" />
                    <div className="flex flex-col items-start">
                      <span className="font-medium">Contact Support</span>
                      <span className="text-xs text-muted-foreground">Get help with your interview</span>
                    </div>
                  </Button>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </TabsContent>
      </Tabs>

      <Dialog open={showRatingModal} onOpenChange={setShowRatingModal}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Rate Your Interview Experience</DialogTitle>
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

      <Dialog open={showShareOptions} onOpenChange={setShowShareOptions}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Share Your Interview</DialogTitle>
            <DialogDescription>
              Share your interview experience with your network.
            </DialogDescription>
          </DialogHeader>
          <div className="grid grid-cols-2 gap-4 py-4">
            <Button variant="outline" className="h-auto py-4">
              <div className="flex flex-col items-center gap-2">
                <svg className="h-6 w-6" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z"/>
                </svg>
                <span>LinkedIn</span>
              </div>
            </Button>
            <Button variant="outline" className="h-auto py-4">
              <div className="flex flex-col items-center gap-2">
                <svg className="h-6 w-6" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M23.953 4.57a10 10 0 01-2.825.775 4.958 4.958 0 002.163-2.723c-.951.555-2.005.959-3.127 1.184a4.92 4.92 0 00-8.384 4.482C7.69 8.095 4.067 6.13 1.64 3.162a4.822 4.822 0 00-.666 2.475c0 1.71.87 3.213 2.188 4.096a4.904 4.904 0 01-2.228-.616v.06a4.923 4.923 0 003.946 4.827 4.996 4.996 0 01-2.212.085 4.936 4.936 0 004.604 3.417 9.867 9.867 0 01-6.102 2.105c-.39 0-.779-.023-1.17-.067a13.995 13.995 0 007.557 2.209c9.053 0 13.998-7.496 13.998-13.985 0-.21 0-.42-.015-.63A9.935 9.935 0 0024 4.59z"/>
                </svg>
                <span>Twitter</span>
              </div>
            </Button>
            <Button variant="outline" className="h-auto py-4">
              <div className="flex flex-col items-center gap-2">
                <svg className="h-6 w-6" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M12 0c-6.627 0-12 5.373-12 12s5.373 12 12 12 12-5.373 12-12-5.373-12-12-12zm-2 16h-2v-6h2v6zm-1-6.891c-.607 0-1.1-.496-1.1-1.109 0-.612.492-1.109 1.1-1.109s1.1.497 1.1 1.109c0 .613-.493 1.109-1.1 1.109zm8 6.891h-1.998v-2.861c0-1.881-2.002-1.722-2.002 0v2.861h-2v-6h2v1.093c.872-1.616 4-1.736 4 1.548v3.359z"/>
                </svg>
                <span>Facebook</span>
              </div>
            </Button>
            <Button variant="outline" className="h-auto py-4">
              <div className="flex flex-col items-center gap-2">
                <svg className="h-6 w-6" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M12 0c-6.627 0-12 5.373-12 12s5.373 12 12 12 12-5.373 12-12-5.373-12-12-12zm-2 16h-2v-6h2v6zm-1-6.891c-.607 0-1.1-.496-1.1-1.109 0-.612.492-1.109 1.1-1.109s1.1.497 1.1 1.109c0 .613-.493 1.109-1.1 1.109zm8 6.891h-1.998v-2.861c0-1.881-2.002-1.722-2.002 0v2.861h-2v-6h2v1.093c.872-1.616 4-1.736 4 1.548v3.359z"/>
                </svg>
                <span>Email</span>
              </div>
            </Button>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowShareOptions(false)}>
              Close
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
} 