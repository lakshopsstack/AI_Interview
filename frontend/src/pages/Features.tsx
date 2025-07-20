import React from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import LandingLayout from "@/components/layout/RegularLayout";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  ArrowRight,
  Calendar,
  BarChart3,
  Users,
  Search,
  Brain,
  Clock,
  MessageSquare,
  Zap,
  FileText,
  Link as LinkIcon,
  Share2,
  Star,
  Shield,
  Settings,
  Upload,
} from "lucide-react";
import { Separator } from "@/components/ui/separator";

const Features = () => {
  return (
    <LandingLayout>
      {/* Hero section */}
      <section className="py-20 lg:py-28 px-4">
        <div className="container mx-auto">
          <div className="max-w-3xl mx-auto text-center">
            <div className="inline-flex items-center rounded-full border border-border bg-background/50 px-4 py-1.5 text-sm mb-8 backdrop-blur">
              <span className="flex h-2 w-2 rounded-full bg-brand mr-2"></span>
              <span className="text-muted-foreground">
                Complete Feature Set
              </span>
            </div>
            <h1 className="text-4xl md:text-5xl font-bold mb-6 text-gradient">
              Comprehensive AI Hiring Tools
            </h1>
            <p className="text-muted-foreground text-lg mb-8">
              Discover how our AI-powered platform transforms every stage of
              your hiring process, from candidate screening to final selection.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link to="/signup">
                <Button size="lg" className="w-full sm:w-auto">
                  Start Free Trial
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </Link>
              <Link to="/pricing">
                <Button
                  variant="outline"
                  size="lg"
                  className="w-full sm:w-auto"
                >
                  View Pricing
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Key features section */}
      <section className="py-16 bg-muted/30">
        <div className="container mx-auto px-4">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <h2 className="text-3xl font-bold mb-4">Key Platform Features</h2>
            <p className="text-muted-foreground">
              Our comprehensive suite of tools designed specifically for
              employers
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {/* Feature 1 */}
            <Card className="border-border/50 overflow-hidden hover:shadow-lg transition-all">
              <div className="h-2 bg-brand w-full" />
              <CardHeader>
                <div className="flex items-center justify-center w-12 h-12 rounded-lg bg-brand/10 text-brand mb-4">
                  <Brain className="h-6 w-6" />
                </div>
                <CardTitle>AI Video Interviews</CardTitle>
                <CardDescription>
                  Real-time interviews conducted by our advanced AI interviewer
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2 text-sm">
                  <li className="flex items-center">
                    <div className="mr-2 h-4 w-4 text-brand">
                      <svg
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      >
                        <polyline points="20 6 9 17 4 12"></polyline>
                      </svg>
                    </div>
                    Job-specific question generation
                  </li>
                  <li className="flex items-center">
                    <div className="mr-2 h-4 w-4 text-brand">
                      <svg
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      >
                        <polyline points="20 6 9 17 4 12"></polyline>
                      </svg>
                    </div>
                    Natural conversation flow
                  </li>
                  <li className="flex items-center">
                    <div className="mr-2 h-4 w-4 text-brand">
                      <svg
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      >
                        <polyline points="20 6 9 17 4 12"></polyline>
                      </svg>
                    </div>
                    Real-time response evaluation
                  </li>
                  <li className="flex items-center">
                    <div className="mr-2 h-4 w-4 text-brand">
                      <svg
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      >
                        <polyline points="20 6 9 17 4 12"></polyline>
                      </svg>
                    </div>
                    Live transcript generation
                  </li>
                </ul>
              </CardContent>
            </Card>

            {/* Feature 2 */}
            <Card className="border-border/50 overflow-hidden hover:shadow-lg transition-all">
              <div className="h-2 bg-brand w-full" />
              <CardHeader>
                <div className="flex items-center justify-center w-12 h-12 rounded-lg bg-brand/10 text-brand mb-4">
                  <FileText className="h-6 w-6" />
                </div>
                <CardTitle>Resume AI Screening</CardTitle>
                <CardDescription>
                  Intelligent filtering of candidates based on job requirements
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2 text-sm">
                  <li className="flex items-center">
                    <div className="mr-2 h-4 w-4 text-brand">
                      <svg
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      >
                        <polyline points="20 6 9 17 4 12"></polyline>
                      </svg>
                    </div>
                    Automatic skill matching
                  </li>
                  <li className="flex items-center">
                    <div className="mr-2 h-4 w-4 text-brand">
                      <svg
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      >
                        <polyline points="20 6 9 17 4 12"></polyline>
                      </svg>
                    </div>
                    Experience verification
                  </li>
                  <li className="flex items-center">
                    <div className="mr-2 h-4 w-4 text-brand">
                      <svg
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      >
                        <polyline points="20 6 9 17 4 12"></polyline>
                      </svg>
                    </div>
                    Qualification assessment
                  </li>
                  <li className="flex items-center">
                    <div className="mr-2 h-4 w-4 text-brand">
                      <svg
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      >
                        <polyline points="20 6 9 17 4 12"></polyline>
                      </svg>
                    </div>
                    Cultural fit prediction
                  </li>
                </ul>
              </CardContent>
            </Card>

            {/* Feature 3 */}
            <Card className="border-border/50 overflow-hidden hover:shadow-lg transition-all">
              <div className="h-2 bg-brand w-full" />
              <CardHeader>
                <div className="flex items-center justify-center w-12 h-12 rounded-lg bg-brand/10 text-brand mb-4">
                  <BarChart3 className="h-6 w-6" />
                </div>
                <CardTitle>Hiring Analytics</CardTitle>
                <CardDescription>
                  Comprehensive insights into your hiring process
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2 text-sm">
                  <li className="flex items-center">
                    <div className="mr-2 h-4 w-4 text-brand">
                      <svg
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      >
                        <polyline points="20 6 9 17 4 12"></polyline>
                      </svg>
                    </div>
                    Candidate performance metrics
                  </li>
                  <li className="flex items-center">
                    <div className="mr-2 h-4 w-4 text-brand">
                      <svg
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      >
                        <polyline points="20 6 9 17 4 12"></polyline>
                      </svg>
                    </div>
                    Job posting effectiveness
                  </li>
                  <li className="flex items-center">
                    <div className="mr-2 h-4 w-4 text-brand">
                      <svg
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      >
                        <polyline points="20 6 9 17 4 12"></polyline>
                      </svg>
                    </div>
                    Time-to-hire tracking
                  </li>
                  <li className="flex items-center">
                    <div className="mr-2 h-4 w-4 text-brand">
                      <svg
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      >
                        <polyline points="20 6 9 17 4 12"></polyline>
                      </svg>
                    </div>
                    Cost-per-hire calculation
                  </li>
                </ul>
              </CardContent>
            </Card>

            {/* Feature 4 */}
            <Card className="border-border/50 overflow-hidden hover:shadow-lg transition-all">
              <div className="h-2 bg-brand w-full" />
              <CardHeader>
                <div className="flex items-center justify-center w-12 h-12 rounded-lg bg-brand/10 text-brand mb-4">
                  <LinkIcon className="h-6 w-6" />
                </div>
                <CardTitle>Shareable Links</CardTitle>
                <CardDescription>
                  Easy distribution of interview invitations
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2 text-sm">
                  <li className="flex items-center">
                    <div className="mr-2 h-4 w-4 text-brand">
                      <svg
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      >
                        <polyline points="20 6 9 17 4 12"></polyline>
                      </svg>
                    </div>
                    One-click link generation
                  </li>
                  <li className="flex items-center">
                    <div className="mr-2 h-4 w-4 text-brand">
                      <svg
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      >
                        <polyline points="20 6 9 17 4 12"></polyline>
                      </svg>
                    </div>
                    Social media integration
                  </li>
                  <li className="flex items-center">
                    <div className="mr-2 h-4 w-4 text-brand">
                      <svg
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      >
                        <polyline points="20 6 9 17 4 12"></polyline>
                      </svg>
                    </div>
                    Email template embedding
                  </li>
                  <li className="flex items-center">
                    <div className="mr-2 h-4 w-4 text-brand">
                      <svg
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      >
                        <polyline points="20 6 9 17 4 12"></polyline>
                      </svg>
                    </div>
                    Link access tracking
                  </li>
                </ul>
              </CardContent>
            </Card>

            {/* Feature 5 */}
            <Card className="border-border/50 overflow-hidden hover:shadow-lg transition-all">
              <div className="h-2 bg-brand w-full" />
              <CardHeader>
                <div className="flex items-center justify-center w-12 h-12 rounded-lg bg-brand/10 text-brand mb-4">
                  <MessageSquare className="h-6 w-6" />
                </div>
                <CardTitle>Live Transcripts</CardTitle>
                <CardDescription>
                  Real-time conversation tracking during interviews
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2 text-sm">
                  <li className="flex items-center">
                    <div className="mr-2 h-4 w-4 text-brand">
                      <svg
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      >
                        <polyline points="20 6 9 17 4 12"></polyline>
                      </svg>
                    </div>
                    Side-panel display
                  </li>
                  <li className="flex items-center">
                    <div className="mr-2 h-4 w-4 text-brand">
                      <svg
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      >
                        <polyline points="20 6 9 17 4 12"></polyline>
                      </svg>
                    </div>
                    Question highlighting
                  </li>
                  <li className="flex items-center">
                    <div className="mr-2 h-4 w-4 text-brand">
                      <svg
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      >
                        <polyline points="20 6 9 17 4 12"></polyline>
                      </svg>
                    </div>
                    Response time tracking
                  </li>
                  <li className="flex items-center">
                    <div className="mr-2 h-4 w-4 text-brand">
                      <svg
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      >
                        <polyline points="20 6 9 17 4 12"></polyline>
                      </svg>
                    </div>
                    Full export capabilities
                  </li>
                </ul>
              </CardContent>
            </Card>

            {/* Feature 6 */}
            <Card className="border-border/50 overflow-hidden hover:shadow-lg transition-all">
              <div className="h-2 bg-brand w-full" />
              <CardHeader>
                <div className="flex items-center justify-center w-12 h-12 rounded-lg bg-brand/10 text-brand mb-4">
                  <Settings className="h-6 w-6" />
                </div>
                <CardTitle>AI Job Description</CardTitle>
                <CardDescription>
                  Automated creation of professional job listings
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2 text-sm">
                  <li className="flex items-center">
                    <div className="mr-2 h-4 w-4 text-brand">
                      <svg
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      >
                        <polyline points="20 6 9 17 4 12"></polyline>
                      </svg>
                    </div>
                    Industry-specific templates
                  </li>
                  <li className="flex items-center">
                    <div className="mr-2 h-4 w-4 text-brand">
                      <svg
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      >
                        <polyline points="20 6 9 17 4 12"></polyline>
                      </svg>
                    </div>
                    Keyword-based generation
                  </li>
                  <li className="flex items-center">
                    <div className="mr-2 h-4 w-4 text-brand">
                      <svg
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      >
                        <polyline points="20 6 9 17 4 12"></polyline>
                      </svg>
                    </div>
                    SEO optimization
                  </li>
                  <li className="flex items-center">
                    <div className="mr-2 h-4 w-4 text-brand">
                      <svg
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      >
                        <polyline points="20 6 9 17 4 12"></polyline>
                      </svg>
                    </div>
                    Custom brand voice matching
                  </li>
                </ul>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* How it works section */}
      <section className="py-20">
        <div className="container mx-auto px-4">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <h2 className="text-3xl font-bold mb-4">How It Works</h2>
            <p className="text-muted-foreground">
              Our AI-powered platform streamlines every step of your hiring
              process
            </p>
          </div>

          <div className="flex flex-col max-w-5xl mx-auto">
            {/* Step 1 */}
            <div className="flex flex-col md:flex-row items-center md:items-start gap-8 mb-12">
              <div className="flex-shrink-0 w-16 h-16 rounded-full bg-brand text-white text-xl font-bold flex items-center justify-center">
                1
              </div>
              <div>
                <h3 className="text-xl font-bold mb-2">Create Job Listings</h3>
                <p className="text-muted-foreground mb-4">
                  Easily create detailed job descriptions with our AI-assisted
                  tools that help you define requirements, roles, and
                  responsibilities. Our system ensures your listing attracts the
                  right candidates.
                </p>
                <div className="p-4 bg-muted rounded-lg">
                  <div className="flex items-start gap-3">
                    <Zap className="h-5 w-5 text-brand mt-0.5" />
                    <p className="text-sm">
                      <span className="font-medium">Pro Tip:</span> Use our AI
                      description generator by entering a few keywords about the
                      position.
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Step 2 */}
            <div className="flex flex-col md:flex-row items-center md:items-start gap-8 mb-12">
              <div className="flex-shrink-0 w-16 h-16 rounded-full bg-brand text-white text-xl font-bold flex items-center justify-center">
                2
              </div>
              <div>
                <h3 className="text-xl font-bold mb-2">
                  AI Screens Candidates
                </h3>
                <p className="text-muted-foreground mb-4">
                  Our AI automatically reviews submitted resumes and
                  applications against your job requirements. The system
                  identifies the most qualified candidates based on skills,
                  experience, and potential fit.
                </p>
                <div className="p-4 bg-muted rounded-lg">
                  <div className="flex items-start gap-3">
                    <Zap className="h-5 w-5 text-brand mt-0.5" />
                    <p className="text-sm">
                      <span className="font-medium">Pro Tip:</span> Adjust
                      screening thresholds in settings to make matching more or
                      less strict depending on your needs.
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Step 3 */}
            <div className="flex flex-col md:flex-row items-center md:items-start gap-8 mb-12">
              <div className="flex-shrink-0 w-16 h-16 rounded-full bg-brand text-white text-xl font-bold flex items-center justify-center">
                3
              </div>
              <div>
                <h3 className="text-xl font-bold mb-2">
                  Send AI Interview Links
                </h3>
                <p className="text-muted-foreground mb-4">
                  Selected candidates receive personalized interview links. You
                  can share these links via email or social media platforms,
                  making it easy for candidates to participate in the interview
                  process at their convenience.
                </p>
                <div className="p-4 bg-muted rounded-lg">
                  <div className="flex items-start gap-3">
                    <Zap className="h-5 w-5 text-brand mt-0.5" />
                    <p className="text-sm">
                      <span className="font-medium">Pro Tip:</span> Customize
                      email templates with your company branding for a more
                      professional appearance.
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Step 4 */}
            <div className="flex flex-col md:flex-row items-center md:items-start gap-8">
              <div className="flex-shrink-0 w-16 h-16 rounded-full bg-brand text-white text-xl font-bold flex items-center justify-center">
                4
              </div>
              <div>
                <h3 className="text-xl font-bold mb-2">
                  Review AI Interview Results
                </h3>
                <p className="text-muted-foreground mb-4">
                  Once interviews are complete, access comprehensive reports
                  with candidate scores, analysis of responses, and AI
                  recommendations. Compare candidates side-by-side and make
                  data-driven hiring decisions.
                </p>
                <div className="p-4 bg-muted rounded-lg">
                  <div className="flex items-start gap-3">
                    <Zap className="h-5 w-5 text-brand mt-0.5" />
                    <p className="text-sm">
                      <span className="font-medium">Pro Tip:</span> Share
                      interview reports with team members to get collaborative
                      input on final candidate selection.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Additional features section */}
      <section className="py-20 bg-muted/30">
        <div className="container mx-auto px-4">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <h2 className="text-3xl font-bold mb-4">Advanced Features</h2>
            <p className="text-muted-foreground">
              Specialized tools to take your hiring process to the next level
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-8 max-w-5xl mx-auto">
            {/* Advanced Feature 1 */}
            <div className="flex gap-5">
              <div className="flex-shrink-0 w-12 h-12 rounded-lg bg-brand/10 flex items-center justify-center text-brand">
                <Shield className="h-6 w-6" />
              </div>
              <div>
                <h3 className="text-xl font-bold mb-2">Bias Mitigation</h3>
                <p className="text-muted-foreground">
                  Our AI is designed to reduce unconscious bias in the hiring
                  process. The system focuses on skills, qualifications, and
                  job-specific requirements rather than demographic factors.
                </p>
              </div>
            </div>

            {/* Advanced Feature 2 */}
            <div className="flex gap-5">
              <div className="flex-shrink-0 w-12 h-12 rounded-lg bg-brand/10 flex items-center justify-center text-brand">
                <Upload className="h-6 w-6" />
              </div>
              <div>
                <h3 className="text-xl font-bold mb-2">Custom Branding</h3>
                <p className="text-muted-foreground">
                  Add your company logo, colors, and branding to interview
                  pages, giving candidates a consistent experience that reflects
                  your company identity.
                </p>
              </div>
            </div>

            {/* Advanced Feature 3 */}
            <div className="flex gap-5">
              <div className="flex-shrink-0 w-12 h-12 rounded-lg bg-brand/10 flex items-center justify-center text-brand">
                <Users className="h-6 w-6" />
              </div>
              <div>
                <h3 className="text-xl font-bold mb-2">Team Collaboration</h3>
                <p className="text-muted-foreground">
                  Share candidate profiles, interview results, and hiring
                  insights with team members. Enable collaborative
                  decision-making with role-based access controls.
                </p>
              </div>
            </div>

            {/* Advanced Feature 4 */}
            <div className="flex gap-5">
              <div className="flex-shrink-0 w-12 h-12 rounded-lg bg-brand/10 flex items-center justify-center text-brand">
                <Clock className="h-6 w-6" />
              </div>
              <div>
                <h3 className="text-xl font-bold mb-2">Interview Scheduling</h3>
                <p className="text-muted-foreground">
                  Set deadlines for AI interviews and send automated reminders
                  to candidates who haven't completed their interviews yet.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA section */}
      <section className="py-20">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto text-center">
            <h2 className="text-3xl font-bold mb-6">
              Ready to Transform Your Hiring?
            </h2>
            <p className="text-muted-foreground text-lg mb-8 max-w-2xl mx-auto">
              Join thousands of companies already using EduDiagno to find better
              candidates faster.
            </p>
            <div className="flex flex-col sm:flex-row justify-center gap-4">
              <Link to="/signup">
                <Button size="lg" className="w-full sm:w-auto">
                  Start Free Trial
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </Link>
              <Link to="/pricing">
                <Button
                  variant="outline"
                  size="lg"
                  className="w-full sm:w-auto"
                >
                  View Pricing
                </Button>
              </Link>
              <Link to="/demo">
                <Button variant="ghost" size="lg" className="w-full sm:w-auto">
                  Request Demo
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>
    </LandingLayout>
  );
};

export default Features;
