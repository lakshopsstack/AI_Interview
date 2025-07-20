import React from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import {
  ExternalLink,
  CheckCircle,
  Clock,
  Briefcase,
  Users,
  BarChart,
  Search,
  Brain,
} from "lucide-react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  ArrowLeft,
  BriefcaseBusiness,
  UserRound,
  Bot,
  BarChart3,
} from "lucide-react";
import RegularLayout from "@/components/layout/RegularLayout";

const HowItWorks = () => {
  return (
    <RegularLayout>
      <div className="container mx-auto py-8 px-4 max-w-7xl">
        <div className="mb-8 flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold mb-2">How It Works</h1>
            <p className="text-muted-foreground">
              Learn how our AI-powered hiring platform transforms your
              recruitment process
            </p>
          </div>
        </div>

        <Tabs defaultValue="employers" className="w-full mt-0">
          <TabsList className="flex w-full mb-8 border-b border-border bg-transparent rounded-none p-0">
            <TabsTrigger
              value="employers"
              className="flex-1 text-base py-3 px-4 font-semibold border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:text-primary transition-colors"
            >
              <BriefcaseBusiness className="mr-2 h-4 w-4" />
              For Employers
            </TabsTrigger>
            <TabsTrigger
              value="candidates"
              className="flex-1 text-base py-3 px-4 font-semibold border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:text-primary transition-colors"
            >
              <UserRound className="mr-2 h-4 w-4" />
              For Candidates
            </TabsTrigger>
          </TabsList>

          <TabsContent value="employers" className="space-y-8">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <Card className="hover:shadow-lg transition-shadow">
                <CardHeader>
                  <div className="flex items-center justify-center w-12 h-12 rounded-full bg-primary/10 text-primary mb-4">
                    <span className="text-xl font-bold">1</span>
                  </div>
                  <CardTitle>Post Job</CardTitle>
                  <CardDescription>
                    Create and publish job listings with AI assistance
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground">
                    Easily create comprehensive job postings with our AI content
                    generator. Set up requirements and preferences for automated
                    candidate screening.
                  </p>
                </CardContent>
              </Card>

              <Card className="hover:shadow-lg transition-shadow">
                <CardHeader>
                  <div className="flex items-center justify-center w-12 h-12 rounded-full bg-primary/10 text-primary mb-4">
                    <span className="text-xl font-bold">2</span>
                  </div>
                  <CardTitle>AI Interviews</CardTitle>
                  <CardDescription>
                    Let our AI conduct preliminary interviews
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground">
                    Our AI interviewer conducts video interviews with
                    candidates, asking job-specific questions and analyzing
                    responses for fit and competency.
                  </p>
                </CardContent>
              </Card>

              <Card className="hover:shadow-lg transition-shadow">
                <CardHeader>
                  <div className="flex items-center justify-center w-12 h-12 rounded-full bg-primary/10 text-primary mb-4">
                    <span className="text-xl font-bold">3</span>
                  </div>
                  <CardTitle>Review Results</CardTitle>
                  <CardDescription>
                    Analyze detailed reports and candidate rankings
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground">
                    Review comprehensive candidate assessments, including
                    interview performance, skill match, and personalized
                    insights to make informed hiring decisions.
                  </p>
                </CardContent>
              </Card>
            </div>

            <div className="bg-muted/50 p-8 rounded-lg">
              <h2 className="text-2xl font-bold mb-6 text-center">
                Key Benefits for Employers
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="flex flex-col items-center text-center p-4">
                  <Clock className="h-8 w-8 text-primary mb-3" />
                  <h3 className="font-semibold mb-2">Save Time</h3>
                  <p className="text-sm text-muted-foreground">
                    Reduce screening time by 85% with automated interview
                    processes
                  </p>
                </div>

                <div className="flex flex-col items-center text-center p-4">
                  <Users className="h-8 w-8 text-primary mb-3" />
                  <h3 className="font-semibold mb-2">Better Hires</h3>
                  <p className="text-sm text-muted-foreground">
                    AI-powered analytics identify the best candidates
                    objectively
                  </p>
                </div>

                <div className="flex flex-col items-center text-center p-4">
                  <BarChart3 className="h-8 w-8 text-primary mb-3" />
                  <h3 className="font-semibold mb-2">Data-Driven</h3>
                  <p className="text-sm text-muted-foreground">
                    Make decisions based on comprehensive candidate insights
                  </p>
                </div>
              </div>
            </div>

            <div className="text-center p-8 bg-primary/5 rounded-lg">
              <h2 className="text-2xl font-bold mb-2">
                Ready to Transform Your Hiring Process?
              </h2>
              <p className="text-muted-foreground mb-6 max-w-2xl mx-auto">
                Streamline your recruitment with our AI-powered interview
                platform designed to help you find the best talent efficiently.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Link to="/signup">
                  <Button size="lg">Start Free Trial</Button>
                </Link>
                <Link to="/contact">
                  <Button variant="outline" size="lg">
                    Request Demo
                  </Button>
                </Link>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="candidates" className="space-y-8">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <Card className="hover:shadow-lg transition-shadow">
                <CardHeader>
                  <div className="flex items-center justify-center w-12 h-12 rounded-full bg-primary/10 text-primary mb-4">
                    <span className="text-xl font-bold">1</span>
                  </div>
                  <CardTitle>Application Review</CardTitle>
                  <CardDescription>
                    Review applications and screen candidates efficiently
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground">
                    Our AI analyzes applications and matches candidates to your
                    job requirements, saving you time in the screening process.
                  </p>
                </CardContent>
              </Card>

              <Card className="hover:shadow-lg transition-shadow">
                <CardHeader>
                  <div className="flex items-center justify-center w-12 h-12 rounded-full bg-primary/10 text-primary mb-4">
                    <span className="text-xl font-bold">2</span>
                  </div>
                  <CardTitle>AI Interview Process</CardTitle>
                  <CardDescription>
                    Streamline your interview process with AI
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground">
                    Our AI conducts initial interviews, providing you with
                    detailed insights and analysis of candidate responses.
                  </p>
                </CardContent>
              </Card>

              <Card className="hover:shadow-lg transition-shadow">
                <CardHeader>
                  <div className="flex items-center justify-center w-12 h-12 rounded-full bg-primary/10 text-primary mb-4">
                    <span className="text-xl font-bold">3</span>
                  </div>
                  <CardTitle>Candidate Assessment</CardTitle>
                  <CardDescription>
                    Make data-driven hiring decisions
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground">
                    Receive comprehensive candidate evaluations and insights to
                    help you make informed hiring decisions.
                  </p>
                </CardContent>
              </Card>
            </div>

            <div className="bg-muted/50 p-8 rounded-lg">
              <h2 className="text-2xl font-bold mb-6 text-center">
                Streamlined Hiring Process
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="flex flex-col items-center text-center p-4">
                  <Search className="h-8 w-8 text-primary mb-3" />
                  <h3 className="font-semibold mb-2">Efficient Screening</h3>
                  <p className="text-sm text-muted-foreground">
                    Save time with automated application review and candidate
                    matching
                  </p>
                </div>

                <div className="flex flex-col items-center text-center p-4">
                  <Brain className="h-8 w-8 text-primary mb-3" />
                  <h3 className="font-semibold mb-2">Objective Evaluation</h3>
                  <p className="text-sm text-muted-foreground">
                    Get unbiased candidate assessments based on skills and
                    qualifications
                  </p>
                </div>

                <div className="flex flex-col items-center text-center p-4">
                  <BarChart3 className="h-8 w-8 text-primary mb-3" />
                  <h3 className="font-semibold mb-2">Comprehensive Insights</h3>
                  <p className="text-sm text-muted-foreground">
                    Access detailed candidate analysis and performance metrics
                  </p>
                </div>
              </div>
            </div>

            <div className="text-center p-8 bg-primary/5 rounded-lg">
              <h2 className="text-2xl font-bold mb-2">
                Ready to Streamline Your Hiring?
              </h2>
              <p className="text-muted-foreground mb-6 max-w-2xl mx-auto">
                Transform your recruitment process with our AI-powered platform
                designed to help you find and evaluate the best candidates
                efficiently.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Link to="/signup">
                  <Button size="lg">Start Free Trial</Button>
                </Link>
                <Link to="/contact">
                  <Button variant="outline" size="lg">
                    Request Demo
                  </Button>
                </Link>
              </div>
            </div>
          </TabsContent>
        </Tabs>

        <div className="mt-16 mb-8">
          <h2 className="text-2xl font-bold mb-4 text-center">
            Common Questions
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-8">
            <Card>
              <CardHeader>
                <CardTitle>How does the AI interviewer work?</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">
                  Our AI interviewer uses advanced natural language processing
                  to ask relevant questions, analyze responses, and provide
                  objective assessments of candidates' qualifications and fit
                  for the role.
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Is the platform bias-free?</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">
                  We've designed our AI to minimize bias by focusing on skills
                  and qualifications rather than demographic factors. Our system
                  is regularly audited and improved to ensure fair assessments
                  for all candidates.
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>What technical requirements are needed?</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">
                  Candidates need a device with a camera, microphone, and stable
                  internet connection. Our platform works on modern browsers
                  without requiring any additional software installation.
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Can we customize interview questions?</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">
                  Yes, employers can customize interview questions or choose
                  from our library of role-specific question sets. The AI adapts
                  to your requirements while maintaining assessment quality.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>

        <div className="mt-12 mb-6 text-center">
          <Link to="/">
            <Button variant="outline">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Home
            </Button>
          </Link>
        </div>
      </div>
    </RegularLayout>
  );
};

export default HowItWorks;
