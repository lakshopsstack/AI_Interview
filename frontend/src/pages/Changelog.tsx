import { useState } from "react";
import { Link } from "react-router-dom";
import LandingLayout from "@/components/layout/RegularLayout";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import {
  Bell,
  Check,
  MessageSquare,
  Star,
  Calendar,
  AlertCircle,
  Video,
  ArrowRight,
  FileText,
  Zap,
} from "lucide-react";

const Changelog = () => {
  const [email, setEmail] = useState("");

  const handleSubscribe = (e: React.FormEvent) => {
    e.preventDefault();
    // Implementation would go here
    setEmail("");
    // Show success toast
  };

  return (
    <LandingLayout>
      <div className="container py-12 md:py-20">
        <div className="text-center mb-12">
          <h1 className="text-4xl md:text-5xl font-bold mb-4">
            Product Changelog
          </h1>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
            Keep up with our latest features, improvements, and fixes
          </p>
        </div>

        {/* Subscribe to updates */}
        <div className="mb-16 max-w-md mx-auto">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-lg">Get Updates</CardTitle>
              <CardDescription>
                Receive new feature announcements in your inbox
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubscribe} className="flex space-x-2">
                <Input
                  placeholder="Enter your email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
                <Button type="submit">Subscribe</Button>
              </form>
            </CardContent>
          </Card>
        </div>

        {/* Featured update */}
        <Alert className="mb-12 border-2 border-brand bg-brand/5">
          <Bell className="h-5 w-5 text-brand" />
          <AlertTitle className="text-brand text-lg">
            Now Available: AI Video Interviews
          </AlertTitle>
          <AlertDescription>
            Our latest major update introduces AI-powered video interviews that
            revolutionize your hiring process.
            <Button variant="link" className="p-0 h-auto mt-2" asChild>
              <Link to="/features#ai-interviews">Learn more →</Link>
            </Button>
          </AlertDescription>
        </Alert>

        {/* Changelog tabs */}
        <Tabs defaultValue="releases" className="mb-12">
          <TabsList className="mb-8 mx-auto">
            <TabsTrigger value="releases">Releases</TabsTrigger>
            <TabsTrigger value="features">New Features</TabsTrigger>
            <TabsTrigger value="improvements">Improvements</TabsTrigger>
            <TabsTrigger value="fixes">Bug Fixes</TabsTrigger>
          </TabsList>

          {/* Releases Tab */}
          <TabsContent value="releases">
            <div className="space-y-8">
              <ReleaseItem
                version="3.0.0"
                date="June 5, 2023"
                title="AI Video Interviews"
                description="Introducing our AI-powered video interview system that conducts real-time interviews and provides detailed candidate assessments."
                features={[
                  "Real-time AI video interviewing capability",
                  "Automatic interview transcription",
                  "Candidate skill assessment algorithms",
                  "Shareable interview links",
                  "Post-interview analytics dashboard",
                ]}
                type="major"
              />

              <ReleaseItem
                version="2.5.0"
                date="April 12, 2023"
                title="Enhanced Analytics"
                description="Major improvements to our analytics system providing deeper hiring insights and better visualization tools."
                features={[
                  "Redesigned analytics dashboard",
                  "New hiring funnel visualization",
                  "Candidate source tracking",
                  "Interview performance metrics",
                  "Exportable reports in multiple formats",
                ]}
                type="minor"
              />

              <ReleaseItem
                version="2.2.3"
                date="March 8, 2023"
                title="Resume Parsing Improvements"
                description="Significant updates to our resume parsing technology for better candidate matching and data extraction."
                features={[
                  "Improved skill detection algorithms",
                  "Better handling of various resume formats",
                  "Enhanced education and experience extraction",
                  "Faster processing times",
                  "Support for additional languages",
                ]}
                type="patch"
              />
            </div>
          </TabsContent>

          {/* Features Tab */}
          <TabsContent value="features">
            <div className="space-y-6">
              <FeatureItem
                icon={<Video className="h-5 w-5 text-brand" />}
                title="AI Video Interviews"
                date="June 5, 2023"
                description="AI-powered interviews that assess candidate skills, communication, and cultural fit in real-time."
              />

              <FeatureItem
                icon={<FileText className="h-5 w-5 text-brand" />}
                title="Resume Screening Automation"
                date="April 12, 2023"
                description="Intelligent resume parsing and matching against job requirements to identify the best candidates."
              />

              <FeatureItem
                icon={<MessageSquare className="h-5 w-5 text-brand" />}
                title="Interview Transcript Analysis"
                date="March 8, 2023"
                description="Natural language processing of interview transcripts to identify key insights and candidate suitability."
              />

              <FeatureItem
                icon={<Zap className="h-5 w-5 text-brand" />}
                title="AI Job Description Generator"
                date="February 15, 2023"
                description="AI-powered tool that helps create effective and inclusive job descriptions from simple prompts."
              />

              <FeatureItem
                icon={<Calendar className="h-5 w-5 text-brand" />}
                title="Smart Scheduling"
                date="January 22, 2023"
                description="Automated interview scheduling that integrates with popular calendar systems and adjusts for time zones."
              />
            </div>
          </TabsContent>

          {/* Improvements Tab */}
          <TabsContent value="improvements">
            <div className="space-y-4">
              <ImprovementItem
                title="Analytics Dashboard Performance"
                date="May 28, 2023"
                description="Significant performance improvements for analytics dashboard loading and data processing."
              />

              <ImprovementItem
                title="User Interface Refinements"
                date="May 15, 2023"
                description="Streamlined navigation and improved accessibility across the platform."
              />

              <ImprovementItem
                title="Candidate Profile Page"
                date="April 30, 2023"
                description="Redesigned candidate profiles with better organization of information and interview insights."
              />

              <ImprovementItem
                title="Job Listing Creation"
                date="April 10, 2023"
                description="Simplified job creation process with improved templates and formatting options."
              />

              <ImprovementItem
                title="Mobile Responsiveness"
                date="March 25, 2023"
                description="Enhanced experience on mobile devices for employers reviewing candidates on the go."
              />
            </div>
          </TabsContent>

          {/* Fixes Tab */}
          <TabsContent value="fixes">
            <div className="space-y-4">
              <FixItem
                title="Interview Link Sharing"
                date="June 2, 2023"
                description="Fixed an issue where interview links would expire prematurely for some users."
              />

              <FixItem
                title="Dashboard Data Refresh"
                date="May 20, 2023"
                description="Resolved a bug causing dashboard statistics to not update automatically after new interviews."
              />

              <FixItem
                title="Resume Upload Format Support"
                date="May 5, 2023"
                description="Fixed issues with parsing certain PDF formats during resume uploads."
              />

              <FixItem
                title="Email Notification Delivery"
                date="April 22, 2023"
                description="Addressed delays in email notification delivery for interview invitations."
              />

              <FixItem
                title="Interview Recording Playback"
                date="April 8, 2023"
                description="Fixed video playback issues for recorded interviews on certain browsers."
              />
            </div>
          </TabsContent>
        </Tabs>

        {/* Roadmap teaser */}
        <div className="text-center mt-16">
          <h2 className="text-3xl font-bold mb-4">What's Coming Next?</h2>
          <p className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
            We're constantly working on new features to improve your hiring
            experience
          </p>
          <Link to="/roadmap">
            <Button size="lg">
              View Our Product Roadmap
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </Link>
        </div>
      </div>
    </LandingLayout>
  );
};

// Release Item Component
interface ReleaseItemProps {
  version: string;
  date: string;
  title: string;
  description: string;
  features: string[];
  type: "major" | "minor" | "patch";
}

const ReleaseItem = ({
  version,
  date,
  title,
  description,
  features,
  type,
}: ReleaseItemProps) => {
  const getBadgeVariant = (type: string) => {
    switch (type) {
      case "major":
        return "success";
      case "minor":
        return "default";
      case "patch":
        return "secondary";
      default:
        return "default";
    }
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex justify-between items-start">
          <div>
            <CardTitle className="text-lg flex items-center">
              v{version} - {title}
              <Badge
                variant={getBadgeVariant(type)}
                className="ml-2 capitalize"
              >
                {type}
              </Badge>
            </CardTitle>
            <CardDescription>{date}</CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <p className="mb-4">{description}</p>
        <div className="space-y-2">
          {features.map((feature, index) => (
            <div key={index} className="flex items-start">
              <Check className="h-5 w-5 text-success mr-2 mt-0.5" />
              <p>{feature}</p>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};

// Feature Item Component
interface FeatureItemProps {
  icon: React.ReactNode;
  title: string;
  date: string;
  description: string;
}

const FeatureItem = ({ icon, title, date, description }: FeatureItemProps) => {
  return (
    <Card>
      <CardContent className="p-6">
        <div className="flex items-start">
          <div className="mr-4 bg-brand/10 p-2 rounded-md">{icon}</div>
          <div>
            <h3 className="font-semibold text-lg">{title}</h3>
            <p className="text-sm text-muted-foreground mb-2">{date}</p>
            <p>{description}</p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

// Improvement Item Component
interface ImprovementItemProps {
  title: string;
  date: string;
  description: string;
}

const ImprovementItem = ({
  title,
  date,
  description,
}: ImprovementItemProps) => {
  return (
    <Card>
      <CardContent className="p-4 flex items-start">
        <Star className="h-5 w-5 text-brand mr-3 mt-0.5" />
        <div>
          <h3 className="font-semibold">{title}</h3>
          <p className="text-sm text-muted-foreground mb-1">{date}</p>
          <p className="text-sm">{description}</p>
        </div>
      </CardContent>
    </Card>
  );
};

// Fix Item Component
interface FixItemProps {
  title: string;
  date: string;
  description: string;
}

const FixItem = ({ title, date, description }: FixItemProps) => {
  return (
    <Card>
      <CardContent className="p-4 flex items-start">
        <AlertCircle className="h-5 w-5 text-warning mr-3 mt-0.5" />
        <div>
          <h3 className="font-semibold">{title}</h3>
          <p className="text-sm text-muted-foreground mb-1">{date}</p>
          <p className="text-sm">{description}</p>
        </div>
      </CardContent>
    </Card>
  );
};

export default Changelog;
