import LandingLayout from "@/components/layout/RegularLayout";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Link } from "react-router-dom";

// List of all our current job openings - we keep this up to date as positions open and close
const openPositions = [
  {
    title: "Senior AI Engineer",
    department: "Engineering",
    location: "Remote (US)",
    type: "Full-time",
    description:
      "Join our team to develop cutting-edge AI models for our interview and screening platform.",
    requirements: [
      "5+ years of experience in machine learning or deep learning",
      "Proficiency in Python and ML frameworks (TensorFlow, PyTorch)",
      "Experience with NLP and computer vision",
      "Background in developing AI systems in production environments",
    ],
  },
  {
    title: "Product Manager",
    department: "Product",
    location: "San Francisco, CA",
    type: "Full-time",
    description:
      "Lead the development of our core AI interview products and features.",
    requirements: [
      "3+ years of product management experience in SaaS or AI products",
      "Strong understanding of recruitment processes and HR tech",
      "Experience with agile development methodologies",
      "Excellent communication and leadership skills",
    ],
  },
  {
    title: "UX/UI Designer",
    department: "Design",
    location: "Remote (Global)",
    type: "Full-time",
    description:
      "Create exceptional user experiences for our employer dashboard and candidate interview interfaces.",
    requirements: [
      "4+ years of UX/UI design experience",
      "Strong portfolio showcasing web application design",
      "Experience with Figma and design systems",
      "Understanding of accessibility standards and best practices",
    ],
  },
  {
    title: "Senior Frontend Engineer",
    department: "Engineering",
    location: "New York, NY or Remote",
    type: "Full-time",
    description:
      "Build and maintain the frontend of our next-generation hiring platform.",
    requirements: [
      "4+ years of experience with React and modern frontend frameworks",
      "Strong TypeScript skills and understanding of state management",
      "Experience with WebRTC or video streaming technologies",
      "Passion for creating performant, accessible web applications",
    ],
  },
  {
    title: "Account Executive",
    department: "Sales",
    location: "Chicago, IL",
    type: "Full-time",
    description:
      "Drive business growth by bringing our AI-powered hiring solution to enterprise clients.",
    requirements: [
      "5+ years of B2B SaaS sales experience",
      "Track record of exceeding sales targets",
      "Experience selling to HR, talent acquisition, or C-level executives",
      "Strong presentation and negotiation skills",
    ],
  },
  {
    title: "Customer Success Manager",
    department: "Customer Success",
    location: "Remote (US)",
    type: "Full-time",
    description:
      "Ensure our customers get maximum value from our platform and become long-term advocates.",
    requirements: [
      "3+ years in customer success for B2B SaaS products",
      "Experience with HR tech or recruitment software preferred",
      "Strong problem-solving and relationship-building skills",
      "Data-driven approach to measuring customer satisfaction and success",
    ],
  },
];

// The perks and benefits we offer to our team members
const benefits = [
  {
    title: "Flexible Work Environment",
    description:
      "Remote-friendly culture with flexible hours and work-from-anywhere options.",
    icon: "🌎",
  },
  {
    title: "Competitive Compensation",
    description:
      "Salary packages benchmarked against top tech companies, plus equity options.",
    icon: "💰",
  },
  {
    title: "Healthcare Coverage",
    description:
      "Comprehensive medical, dental, and vision insurance for you and your dependents.",
    icon: "🏥",
  },
  {
    title: "Unlimited PTO",
    description:
      "Take the time you need to recharge and bring your best self to work.",
    icon: "🏖️",
  },
  {
    title: "Professional Development",
    description:
      "$5,000 annual budget for conferences, courses, and learning resources.",
    icon: "📚",
  },
  {
    title: "Wellness Program",
    description:
      "Monthly wellness stipend and resources for physical and mental wellbeing.",
    icon: "🧘",
  },
];

// Main Careers page component
const Careers = () => {
  return (
    <LandingLayout>
      {/* Hero section with our mission statement */}
      <div className="container py-12 md:py-20">
        <div className="text-center mb-16">
          <h1 className="text-4xl md:text-5xl font-bold mb-4">
            Join Our Mission
          </h1>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
            We're building the future of hiring through AI innovation. Join our
            team of passionate experts who are revolutionizing how companies
            find talent.
          </p>
        </div>

        {/* Why work with us section */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 mb-20 items-center">
          <div className="order-2 lg:order-1">
            <h2 className="text-3xl font-bold mb-6">Why EduDiagno?</h2>
            <div className="space-y-6">
              {/* Impactful Work */}
              <div className="flex items-start gap-4">
                <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                  <svg
                    className="w-5 h-5 text-primary"
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"
                    />
                  </svg>
                </div>
                <div>
                  <h3 className="text-xl font-medium mb-1">Impactful Work</h3>
                  <p className="text-muted-foreground">
                    Our technology helps companies build better teams and helps
                    candidates find opportunities that match their skills and
                    potential.
                  </p>
                </div>
              </div>

              {/* Cutting-Edge Technology */}
              <div className="flex items-start gap-4">
                <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                  <svg
                    className="w-5 h-5 text-primary"
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M13 10V3L4 14h7v7l9-11h-7z"
                    />
                  </svg>
                </div>
                <div>
                  <h3 className="text-xl font-medium mb-1">
                    Cutting-Edge Technology
                  </h3>
                  <p className="text-muted-foreground">
                    We work with the latest advancements in AI, machine
                    learning, and natural language processing to solve complex
                    problems.
                  </p>
                </div>
              </div>

              {/* Growth & Development */}
              <div className="flex items-start gap-4">
                <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                  <svg
                    className="w-5 h-5 text-primary"
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4"
                    />
                  </svg>
                </div>
                <div>
                  <h3 className="text-xl font-medium mb-1">
                    Growth & Development
                  </h3>
                  <p className="text-muted-foreground">
                    We invest in our team members' professional growth with
                    learning resources, mentorship, and challenging projects.
                  </p>
                </div>
              </div>

              {/* Diverse & Inclusive Team */}
              <div className="flex items-start gap-4">
                <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                  <svg
                    className="w-5 h-5 text-primary"
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"
                    />
                  </svg>
                </div>
                <div>
                  <h3 className="text-xl font-medium mb-1">
                    Diverse & Inclusive Team
                  </h3>
                  <p className="text-muted-foreground">
                    We believe diverse perspectives drive innovation. We're
                    committed to building an inclusive workplace where everyone
                    can thrive.
                  </p>
                </div>
              </div>
            </div>
          </div>
          <div className="order-1 lg:order-2">
            <img
              src="https://placehold.co/800x600?text=Team+Culture"
              alt="EduDiagno team culture"
              className="rounded-lg shadow-lg w-full"
            />
          </div>
        </div>

        {/* Benefits & Perks section */}
        <div className="mb-20">
          <h2 className="text-3xl font-bold mb-8 text-center">
            Benefits & Perks
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {benefits.map((benefit, i) => (
              <Card key={i}>
                <CardHeader>
                  <div className="text-4xl mb-2">{benefit.icon}</div>
                  <CardTitle>{benefit.title}</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground">{benefit.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        {/* Open Positions section with filtering */}
        <div className="mb-20">
          <h2 className="text-3xl font-bold mb-8 text-center">
            Open Positions
          </h2>

          <Tabs defaultValue="all" className="w-full">
            <TabsList className="mb-8 flex justify-center">
              <TabsTrigger value="all">All Departments</TabsTrigger>
              <TabsTrigger value="Engineering">Engineering</TabsTrigger>
              <TabsTrigger value="Product">Product</TabsTrigger>
              <TabsTrigger value="Design">Design</TabsTrigger>
              <TabsTrigger value="Sales">Sales</TabsTrigger>
              <TabsTrigger value="Customer Success">
                Customer Success
              </TabsTrigger>
            </TabsList>

            {/* Show all positions */}
            <TabsContent value="all">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {openPositions.map((position, i) => (
                  <JobCard key={i} job={position} />
                ))}
              </div>
            </TabsContent>

            {/* Filter positions by department */}
            {[
              "Engineering",
              "Product",
              "Design",
              "Sales",
              "Customer Success",
            ].map((dept) => (
              <TabsContent key={dept} value={dept}>
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  {openPositions
                    .filter((job) => job.department === dept)
                    .map((position, i) => (
                      <JobCard key={i} job={position} />
                    ))}
                </div>
              </TabsContent>
            ))}
          </Tabs>
        </div>

        {/* Call to action for candidates who don't see a matching role */}
        <div className="bg-muted rounded-xl p-8 text-center">
          <h2 className="text-3xl font-bold mb-4">
            Don't see a role that fits?
          </h2>
          <p className="text-xl mb-6 max-w-2xl mx-auto">
            We're always interested in meeting talented people. Send us your
            resume and tell us how you can contribute to our mission.
          </p>
          <Link to="/contact">
            <Button size="lg">Get in Touch</Button>
          </Link>
        </div>
      </div>
    </LandingLayout>
  );
};

// Props interface for the JobCard component
interface JobProps {
  job: {
    title: string;
    department: string;
    location: string;
    type: string;
    description: string;
    requirements: string[];
  };
}

// Job card component that displays individual job listings
const JobCard = ({ job }: JobProps) => {
  return (
    <Card className="h-full flex flex-col">
      <CardHeader>
        <div className="flex justify-between items-start mb-2">
          <CardTitle>{job.title}</CardTitle>
          <Badge>{job.type}</Badge>
        </div>
        <CardDescription>
          {job.department} • {job.location}
        </CardDescription>
      </CardHeader>
      <CardContent className="flex-1">
        <p className="mb-4">{job.description}</p>
        <h4 className="font-medium mb-2">Requirements:</h4>
        <ul className="list-disc pl-5 space-y-1 text-sm text-muted-foreground">
          {job.requirements.map((req, i) => (
            <li key={i}>{req}</li>
          ))}
        </ul>
      </CardContent>
      <CardFooter>
        <Button className="w-full">Apply Now</Button>
      </CardFooter>
    </Card>
  );
};

export default Careers;
