import React from "react";
import { Link } from "react-router-dom";
import LandingLayout from "@/components/layout/RegularLayout";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  ArrowRight,
  Users,
  BarChart3,
  Calendar,
  Search,
  Brain,
  Clock,
} from "lucide-react";

const Landing = () => {
  return (
    <LandingLayout>
      {/* Hero section */}
      <section className="relative overflow-hidden py-20 md:py-32 px-4">
        {/* Gradient background */}
        <div
          className="absolute inset-0 opacity-30"
          style={{
            background:
              "radial-gradient(circle at 50% 50%, hsl(var(--brand)), transparent 70%)",
          }}
        />

        <div className="container mx-auto relative z-10">
          <div className="max-w-4xl mx-auto text-center space-y-4">
            <div className="inline-flex items-center rounded-full border border-border bg-background/50 px-4 py-1.5 text-sm mb-8 backdrop-blur">
              <span className="flex h-2 w-2 rounded-full bg-brand mr-2"></span>
              <span className="text-muted-foreground">
                AI-powered Candidate Selection
              </span>
            </div>

            <h1 className="h1 min-h-min text-gradient animate-fade-up [animation-delay:100ms]">
              The AI-Powered Hiring Revolution
            </h1>
            <p className="p text-muted-foreground text-lg md:text-xl animate-fade-up [animation-delay:200ms]">
              Smart AI Interviews. Automated Screening. Data-Driven Hiring.
              Transform your recruitment process with our cutting-edge platform
              designed for employers.
            </p>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-6 animate-fade-up [animation-delay:300ms]">
              <Link to="/signup">
                <Button
                  size="lg"
                  className="w-full sm:w-auto button-hover-effect"
                >
                  Start Hiring Smarter
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </Link>
              <Link to="/demo">
                <Button
                  size="lg"
                  variant="outline"
                  className="w-full sm:w-auto glass-button"
                >
                  Request a Demo
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Features section */}
      <section className="py-20 bg-muted/30">
        <div className="container mx-auto px-4">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <h2 className="h2 mb-4">Cutting-Edge Features</h2>
            <p className="p">
              Our platform streamlines the hiring process with powerful AI tools
              designed specifically for employers.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {/* Feature 1 */}
            <Card className="border-border/50 overflow-hidden card-hover">
              <div className="h-2 bg-brand w-full" />
              <CardContent className="pt-6">
                <div className="flex items-center justify-center w-12 h-12 rounded-lg bg-brand/10 text-brand mb-4">
                  <Calendar className="h-6 w-6" />
                </div>
                <h3 className="font-bold text-xl mb-2">AI Video Interviews</h3>
                <p className="text-muted-foreground">
                  Conduct interviews in real-time with an AI interviewer that
                  asks job-relevant questions and evaluates responses.
                </p>
              </CardContent>
            </Card>

            {/* Feature 2 */}
            <Card className="border-border/50 overflow-hidden card-hover">
              <div className="h-2 bg-brand w-full" />
              <CardContent className="pt-6">
                <div className="flex items-center justify-center w-12 h-12 rounded-lg bg-brand/10 text-brand mb-4">
                  <BarChart3 className="h-6 w-6" />
                </div>
                <h3 className="font-bold text-xl mb-2">Instant Insights</h3>
                <p className="text-muted-foreground">
                  AI analyzes candidate responses and generates comprehensive
                  hiring reports with scores and recommendations.
                </p>
              </CardContent>
            </Card>

            {/* Feature 3 */}
            <Card className="border-border/50 overflow-hidden card-hover">
              <div className="h-2 bg-brand w-full" />
              <CardContent className="pt-6">
                <div className="flex items-center justify-center w-12 h-12 rounded-lg bg-brand/10 text-brand mb-4">
                  <Users className="h-6 w-6" />
                </div>
                <h3 className="font-bold text-xl mb-2">Private Interviews</h3>
                <p className="text-muted-foreground">
                Generate secure private interview links for each candidate, ensuring only invited candidates can access their interviews.
                </p>
              </CardContent>
            </Card>

            {/* Feature 4 */}
            <Card className="border-border/50 overflow-hidden card-hover">
              <div className="h-2 bg-brand w-full" />
              <CardContent className="pt-6">
                <div className="flex items-center justify-center w-12 h-12 rounded-lg bg-brand/10 text-brand mb-4">
                  <Search className="h-6 w-6" />
                </div>
                <h3 className="font-bold text-xl mb-2">Smart Screening</h3>
                <p className="text-muted-foreground">
                  AI filters only the best-matched candidates by analyzing
                  resumes against your job requirements.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* How it works section */}
      <section className="py-20">
        <div className="container mx-auto px-4">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <h2 className="h2 mb-4">How It Works</h2>
            <p className="p">
              Our streamlined AI-driven hiring process makes finding the right
              candidates easier than ever.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {/* Step 1 */}
            <div className="text-center px-4">
              <div className="flex items-center justify-center w-16 h-16 rounded-full bg-brand text-white text-xl font-bold mx-auto mb-6">
                1
              </div>
              <h3 className="text-xl font-bold mb-3">Create Job Listings</h3>
              <p className="text-muted-foreground">
                Create detailed job listings, specify requirements, and let AI
                generate optimized job descriptions.
              </p>
            </div>

            {/* Step 2 */}
            <div className="text-center px-4">
              <div className="flex items-center justify-center w-16 h-16 rounded-full bg-brand text-white text-xl font-bold mx-auto mb-6">
                2
              </div>
              <h3 className="text-xl font-bold mb-3">AI Screens Candidates</h3>
              <p className="text-muted-foreground">
                Our AI analyzes resumes and identifies candidates that best
                match your job requirements.
              </p>
            </div>

            {/* Step 3 */}
            <div className="text-center px-4">
              <div className="flex items-center justify-center w-16 h-16 rounded-full bg-brand text-white text-xl font-bold mx-auto mb-6">
                3
              </div>
              <h3 className="text-xl font-bold mb-3">Automated Interviews</h3>
              <p className="text-muted-foreground">
                Candidates participate in AI-conducted video interviews, with
                responses analyzed for key insights.
              </p>
            </div>
          </div>

          <div className="max-w-lg mx-auto mt-16 text-center">
            <Link to="/how-it-works">
              <Button variant="outline" size="lg" className="glass-button">
                Learn more about the process
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Testimonials section - temporarily hidden
      <section className="py-20 bg-muted/30">
        <div className="container mx-auto px-4">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <h2 className="h2 mb-4">Trusted by Employers</h2>
            <p className="p">
              See how companies are transforming their hiring process with
              InterviewPro AI.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            <Card className="glass-card p-6 card-hover">
              <div className="mb-4 flex">
                {[1, 2, 3, 4, 5].map((_, i) => (
                  <Star key={i} className="h-5 w-5 fill-brand text-brand" />
                ))}
              </div>
              <p className="mb-6 italic">
                "InterviewPro AI has completely transformed our hiring process.
                The AI interviews have saved our team countless hours and
                improved our candidate selection."
              </p>
              <div className="flex items-center">
                <div className="w-12 h-12 rounded-full bg-muted mr-4" />
                <div>
                  <p className="font-semibold">Sarah Johnson</p>
                  <p className="text-sm text-muted-foreground">
                    HR Director, TechGrowth Inc.
                  </p>
                </div>
              </div>
            </Card>

            <Card className="glass-card p-6 card-hover">
              <div className="mb-4 flex">
                {[1, 2, 3, 4, 5].map((_, i) => (
                  <Star key={i} className="h-5 w-5 fill-brand text-brand" />
                ))}
              </div>
              <p className="mb-6 italic">
                "The insights we get from the AI interview analysis are
                incredible. We're making better hires and our turnover rate has
                decreased by 35%."
              </p>
              <div className="flex items-center">
                <div className="w-12 h-12 rounded-full bg-muted mr-4" />
                <div>
                  <p className="font-semibold">Michael Chen</p>
                  <p className="text-sm text-muted-foreground">
                    CEO, Innovate Solutions
                  </p>
                </div>
              </div>
            </Card>

            <Card className="glass-card p-6 card-hover">
              <div className="mb-4 flex">
                {[1, 2, 3, 4, 5].map((_, i) => (
                  <Star key={i} className="h-5 w-5 fill-brand text-brand" />
                ))}
              </div>
              <p className="mb-6 italic">
                "The automated resume screening is a game-changer. We're now
                only interviewing candidates who truly match our requirements,
                saving enormous time."
              </p>
              <div className="flex items-center">
                <div className="w-12 h-12 rounded-full bg-muted mr-4" />
                <div>
                  <p className="font-semibold">Jessica Martinez</p>
                  <p className="text-sm text-muted-foreground">
                    Talent Acquisition Manager, Global Retail
                  </p>
                </div>
              </div>
            </Card>
          </div>
        </div>
      </section>
      */}

      {/* Benefits section */}
      <section className="py-20">
        <div className="container mx-auto px-4">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <h2 className="h2 mb-4">Why Choose InterviewPro AI</h2>
            <p className="p">
              Our platform offers unparalleled benefits for modern employers
              looking to optimize their hiring process.
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-8 lg:gap-16">
            {/* Left column */}
            <div className="space-y-8">
              {/* Benefit 1 */}
              <div className="flex gap-4">
                <div className="flex-shrink-0 w-12 h-12 rounded-lg bg-brand/10 flex items-center justify-center text-brand">
                  <Clock className="h-6 w-6" />
                </div>
                <div>
                  <h3 className="text-xl font-bold mb-2">Save Time</h3>
                  <p className="text-muted-foreground">
                    Reduce hiring time by up to 70% with automated screening and
                    AI-conducted interviews.
                  </p>
                </div>
              </div>

              {/* Benefit 2 */}
              <div className="flex gap-4">
                <div className="flex-shrink-0 w-12 h-12 rounded-lg bg-brand/10 flex items-center justify-center text-brand">
                  <Users className="h-6 w-6" />
                </div>
                <div>
                  <h3 className="text-xl font-bold mb-2">Better Candidates</h3>
                  <p className="text-muted-foreground">
                    AI screening ensures you only review candidates who truly
                    match your requirements.
                  </p>
                </div>
              </div>

              {/* Benefit 3 */}
              <div className="flex gap-4">
                <div className="flex-shrink-0 w-12 h-12 rounded-lg bg-brand/10 flex items-center justify-center text-brand">
                  <BarChart3 className="h-6 w-6" />
                </div>
                <div>
                  <h3 className="text-xl font-bold mb-2">
                    Data-Driven Decisions
                  </h3>
                  <p className="text-muted-foreground">
                    Make hiring decisions based on objective data and AI
                    insights rather than gut feelings.
                  </p>
                </div>
              </div>
            </div>

            {/* Right column */}
            <div className="space-y-8">
              {/* Benefit 4 */}
              <div className="flex gap-4">
                <div className="flex-shrink-0 w-12 h-12 rounded-lg bg-brand/10 flex items-center justify-center text-brand">
                  <Brain className="h-6 w-6" />
                </div>
                <div>
                  <h3 className="text-xl font-bold mb-2">Reduce Bias</h3>
                  <p className="text-muted-foreground">
                    Our AI is designed to minimize unconscious bias in the
                    hiring process, promoting diversity.
                  </p>
                </div>
              </div>

              {/* Benefit 5 */}
              <div className="flex gap-4">
                <div className="flex-shrink-0 w-12 h-12 rounded-lg bg-brand/10 flex items-center justify-center text-brand">
                  <Calendar className="h-6 w-6" />
                </div>
                <div>
                  <h3 className="text-xl font-bold mb-2">
                    Flexible Scheduling
                  </h3>
                  <p className="text-muted-foreground">
                    Candidates can complete AI interviews at their convenience,
                    expanding your talent pool.
                  </p>
                </div>
              </div>

              {/* Benefit 6 */}
              <div className="flex gap-4">
                <div className="flex-shrink-0 w-12 h-12 rounded-lg bg-brand/10 flex items-center justify-center text-brand">
                  <Search className="h-6 w-6" />
                </div>
                <div>
                  <h3 className="text-xl font-bold mb-2">
                    Customizable Process
                  </h3>
                  <p className="text-muted-foreground">
                    Tailor interview questions and screening criteria to your
                    specific job requirements.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA section */}
      <section className="py-20 bg-brand/5">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto text-center">
            <h2 className="h2 mb-6">Ready to Transform Your Hiring Process?</h2>
            <p className="p text-lg mb-8 max-w-2xl mx-auto">
              Join thousands of employers who are saving time, reducing costs,
              and finding better candidates with InterviewPro AI.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Link to="/signup">
                <Button
                  size="lg"
                  className="w-full sm:w-auto button-hover-effect"
                >
                  Start Hiring Smarter
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </Link>
              <Link to="/pricing">
                <Button
                  size="lg"
                  variant="outline"
                  className="w-full sm:w-auto glass-button"
                >
                  View Pricing
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>
    </LandingLayout>
  );
};

export default Landing;
