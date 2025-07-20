import LandingLayout from "@/components/layout/RegularLayout";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Link } from "react-router-dom";

const Integrations = () => {
  const integrationCategories = [
    {
      name: "ATS & HRIS",
      integrations: [
        {
          name: "Workday",
          logo: "https://placehold.co/200x80?text=Workday",
          description:
            "Connect your Workday instance to sync job postings, candidates, and hiring data.",
          popular: true,
        },
        {
          name: "Greenhouse",
          logo: "https://placehold.co/200x80?text=Greenhouse",
          description:
            "Two-way integration with Greenhouse for seamless candidate management.",
          popular: true,
        },
        {
          name: "Lever",
          logo: "https://placehold.co/200x80?text=Lever",
          description:
            "Sync candidates and interview feedback between Lever and EduDiagno.",
          popular: false,
        },
        {
          name: "BambooHR",
          logo: "https://placehold.co/200x80?text=BambooHR",
          description:
            "Connect your BambooHR account for candidate and employee data synchronization.",
          popular: false,
        },
        {
          name: "SAP SuccessFactors",
          logo: "https://placehold.co/200x80?text=SuccessFactors",
          description: "Enterprise-grade integration with SAP SuccessFactors.",
          popular: false,
        },
        {
          name: "JazzHR",
          logo: "https://placehold.co/200x80?text=JazzHR",
          description:
            "Streamline your hiring process by connecting JazzHR with our AI interviews.",
          popular: false,
        },
      ],
    },
    {
      name: "Calendar & Scheduling",
      integrations: [
        {
          name: "Google Calendar",
          logo: "https://placehold.co/200x80?text=Google+Calendar",
          description:
            "Schedule interviews and sync events with your Google Calendar.",
          popular: true,
        },
        {
          name: "Microsoft Outlook",
          logo: "https://placehold.co/200x80?text=Outlook",
          description:
            "Connect with Outlook Calendar for seamless interview scheduling.",
          popular: true,
        },
        {
          name: "Calendly",
          logo: "https://placehold.co/200x80?text=Calendly",
          description:
            "Use Calendly to let candidates book AI interview slots automatically.",
          popular: false,
        },
      ],
    },
    {
      name: "Communication",
      integrations: [
        {
          name: "Slack",
          logo: "https://placehold.co/200x80?text=Slack",
          description:
            "Get real-time notifications and share interview results with your team.",
          popular: true,
        },
        {
          name: "Microsoft Teams",
          logo: "https://placehold.co/200x80?text=Teams",
          description:
            "Share interview reports and collaborate on hiring decisions in Teams.",
          popular: false,
        },
        {
          name: "Gmail",
          logo: "https://placehold.co/200x80?text=Gmail",
          description:
            "Send automated emails to candidates from your company email domain.",
          popular: false,
        },
      ],
    },
    {
      name: "Analytics & Reporting",
      integrations: [
        {
          name: "Tableau",
          logo: "https://placehold.co/200x80?text=Tableau",
          description:
            "Create custom hiring dashboards with your interview and screening data.",
          popular: false,
        },
        {
          name: "Power BI",
          logo: "https://placehold.co/200x80?text=Power+BI",
          description:
            "Connect to Microsoft Power BI for advanced hiring analytics.",
          popular: false,
        },
        {
          name: "Google Analytics",
          logo: "https://placehold.co/200x80?text=Google+Analytics",
          description: "Track candidate engagement and conversion metrics.",
          popular: false,
        },
      ],
    },
  ];

  return (
    <LandingLayout>
      <div className="container py-12 md:py-20">
        <div className="text-center mb-12">
          <h1 className="text-4xl md:text-5xl font-bold mb-4">Integrations</h1>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
            Connect EduDiagno with your existing HR tech stack for a seamless
            hiring workflow. Our platform integrates with 30+ tools and
            applications.
          </p>
        </div>

        <Tabs defaultValue="ATS & HRIS" className="w-full">
          <div className="flex justify-center mb-8">
            <TabsList>
              {integrationCategories.map((category) => (
                <TabsTrigger key={category.name} value={category.name}>
                  {category.name}
                </TabsTrigger>
              ))}
            </TabsList>
          </div>

          {integrationCategories.map((category) => (
            <TabsContent key={category.name} value={category.name}>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {category.integrations.map((integration, index) => (
                  <IntegrationCard key={index} integration={integration} />
                ))}
              </div>
            </TabsContent>
          ))}
        </Tabs>

        <div className="mt-16 bg-muted rounded-xl p-8 text-center">
          <h2 className="text-3xl font-bold mb-4">
            Need a custom integration?
          </h2>
          <p className="text-xl mb-6 max-w-2xl mx-auto">
            Don't see the integration you need? Our team can build custom
            connections to your existing systems and workflows.
          </p>
          <div className="flex flex-wrap justify-center gap-4">
            <Link to="/contact">
              <Button size="lg">Contact Sales</Button>
            </Link>
            <a
              href="https://developer.edudiagno.ai"
              target="_blank"
              rel="noopener noreferrer"
            >
              <Button variant="outline" size="lg">
                Developer API
              </Button>
            </a>
          </div>
        </div>
      </div>
    </LandingLayout>
  );
};

interface IntegrationProps {
  integration: {
    name: string;
    logo: string;
    description: string;
    popular: boolean;
  };
}

const IntegrationCard = ({ integration }: IntegrationProps) => {
  return (
    <Card className="flex flex-col h-full">
      <CardHeader className="space-y-4">
        <div className="flex justify-between items-start">
          <img
            src={integration.logo}
            alt={`${integration.name} logo`}
            className="h-10 object-contain"
          />
          {integration.popular && <Badge variant="success">Popular</Badge>}
        </div>
        <CardTitle>{integration.name}</CardTitle>
      </CardHeader>
      <CardContent className="flex-1">
        <p className="text-muted-foreground">{integration.description}</p>
      </CardContent>
      <CardFooter>
        <Button variant="outline" className="w-full">
          Learn More
        </Button>
      </CardFooter>
    </Card>
  );
};

export default Integrations;
