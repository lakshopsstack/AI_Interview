import DashboardLayout from "@/components/layout/DashboardLayout";More actions
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { BadgeCheck, BookOpen, FileQuestion, LifeBuoy, Search, Video } from "lucide-react";
import { useState } from "react";

const Help = () => {
  const [searchQuery, setSearchQuery] = useState("");

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value);
  };

  const faqs = [
    {
      question: "How do I create my first AI interview?",
      answer: "To create your first AI interview, navigate to the Jobs section, click 'Create Job', fill in the job details, and then enable AI interviews. Once your job is created, you can customize the interview questions or use our AI-generated questions based on the job description."
    },
    {
      question: "How can I share an interview link with candidates?",
      answer: "After creating a job with AI interviews enabled, go to the job details page and use the 'Invite Candidates' feature. This will generate private interview links for each candidate and send them branded email invitations. Private links ensure only invited candidates can access the interview."
    },
    {
      question: "Can I customize the AI interview questions?",
      answer: "Yes! You can customize all aspects of the AI interview. When setting up a job, you'll have the option to edit the default questions, add your own questions, or let our AI generate role-specific questions based on your job description."
    },
    {
      question: "How does the resume screening work?",
      answer: "Our AI analyzes uploaded resumes against your job requirements to identify suitable candidates. It evaluates skills, experience, education, and other factors to provide a match score. You can adjust the matching criteria and minimum thresholds in your account settings."
    },
    {
      question: "Can I integrate with my existing ATS?",
      answer: "Yes, we offer integrations with popular ATS platforms including Greenhouse, Lever, Workday, and more. Go to Settings > Integrations to set up a connection with your ATS system. Our two-way sync ensures candidate data and interview results flow seamlessly between both systems."
    },
    {
      question: "How long do candidates have to complete the interview?",
      answer: "By default, candidates have 7 days to complete an AI interview after receiving the link. You can customize this timeframe in the job settings. Candidates can start, pause, and resume the interview within this window."
    },
    {
      question: "What analytics can I see after interviews?",
      answer: "Our platform provides comprehensive analytics including candidate scores, skill assessments, sentiment analysis, communication ability, and keyword matching. You can view individual candidate reports or compare multiple candidates side-by-side."
    },
    {
      question: "How secure are the AI interviews?",
      answer: "We take security very seriously. All video interviews are encrypted both in transit and at rest. We're SOC 2 Type II certified and GDPR compliant. Candidates must verify their identity before starting an interview, and our system monitors for potential fraud or cheating."
    }
  ];

  const tutorials = [
    {
      title: "Getting Started with EduDiagno",
      description: "Learn the basics of setting up your account and navigating the platform.",
      icon: <BookOpen className="h-6 w-6" />,
      link: "#"
    },
    {
      title: "Creating Your First AI Interview",
      description: "Step-by-step guide to creating and customizing AI interviews for your job openings.",
      icon: <Video className="h-6 w-6" />,
      link: "#"
    },
    {
      title: "Resume Screening Best Practices",
      description: "Learn how to optimize your job requirements for better AI resume matching.",
      icon: <FileQuestion className="h-6 w-6" />,
      link: "#"
    },
    {
      title: "Analyzing Candidate Reports",
      description: "Understanding the interview analytics and making data-driven hiring decisions.",
      icon: <BadgeCheck className="h-6 w-6" />,
      link: "#"
    }
  ];

  const filteredFaqs = searchQuery
    ? faqs.filter(faq => 
        faq.question.toLowerCase().includes(searchQuery.toLowerCase()) ||
        faq.answer.toLowerCase().includes(searchQuery.toLowerCase())
      )
    : faqs;

  return (
    <DashboardLayout>
      <div className="container max-w-6xl py-6">
        <h1 className="text-3xl font-bold mb-6">Help Center</h1>

        <div className="relative mb-8">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground h-5 w-5" />
          <Input
            placeholder="Search for help topics..."
            className="pl-10"
            value={searchQuery}
            onChange={handleSearchChange}
          />
        </div>

        <Tabs defaultValue="faqs" className="w-full">
          <TabsList className="w-full mb-8 grid grid-cols-3">
            <TabsTrigger value="faqs">Frequently Asked Questions</TabsTrigger>
            <TabsTrigger value="tutorials">Tutorials & Guides</TabsTrigger>
            <TabsTrigger value="contact">Contact Support</TabsTrigger>
          </TabsList>

          <TabsContent value="faqs">
            <div className="mb-6">
              <h2 className="text-2xl font-semibold mb-2">Frequently Asked Questions</h2>
              <p className="text-muted-foreground">
                Find quick answers to common questions about our platform.
              </p>
            </div>

            <Accordion type="single" collapsible className="w-full">
              {filteredFaqs.length > 0 ? (
                filteredFaqs.map((faq, index) => (
                  <AccordionItem key={index} value={`item-${index}`}>
                    <AccordionTrigger className="text-lg font-medium">
                      {faq.question}
                    </AccordionTrigger>
                    <AccordionContent className="text-muted-foreground">
                      {faq.answer}
                    </AccordionContent>
                  </AccordionItem>
                ))
              ) : (
                <div className="py-8 text-center">
                  <p className="text-muted-foreground">No results found for "{searchQuery}"</p>
                  <Button variant="link" onClick={() => setSearchQuery("")}>
                    Clear search
                  </Button>
                </div>
              )}
            </Accordion>
          </TabsContent>

          <TabsContent value="tutorials">
            <div className="mb-6">
              <h2 className="text-2xl font-semibold mb-2">Tutorials & Guides</h2>
              <p className="text-muted-foreground">
                Learn how to get the most out of EduDiagno with our step-by-step guides.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {tutorials.map((tutorial, index) => (
                <Card key={index}>
                  <CardHeader className="flex flex-row items-center gap-4">
                    <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
                      {tutorial.icon}
                    </div>
                    <div>
                      <CardTitle>{tutorial.title}</CardTitle>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <CardDescription className="text-base">
                      {tutorial.description}
                    </CardDescription>
                  </CardContent>
                  <CardFooter>
                    <Button variant="outline" className="w-full" asChild>
                      <a href={tutorial.link}>View Tutorial</a>
                    </Button>
                  </CardFooter>
                </Card>
              ))}
            </div>

            <div className="mt-8">
              <h3 className="text-xl font-semibold mb-4">Video Tutorials</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Card>
                  <div className="aspect-video bg-muted flex items-center justify-center">
                    <Video className="h-12 w-12 text-muted-foreground" />
                  </div>
                  <CardHeader>
                    <CardTitle>Complete Platform Walkthrough</CardTitle>
                    <CardDescription>
                      A comprehensive guide to all features of EduDiagno
                    </CardDescription>
                  </CardHeader>
                  <CardFooter>
                    <Button variant="outline" className="w-full">Watch Video</Button>
                  </CardFooter>
                </Card>
                <Card>
                  <div className="aspect-video bg-muted flex items-center justify-center">
                    <Video className="h-12 w-12 text-muted-foreground" />
                  </div>
                  <CardHeader>
                    <CardTitle>Advanced Interview Settings</CardTitle>
                    <CardDescription>
                      Learn how to customize AI interviews for different roles
                    </CardDescription>
                  </CardHeader>
                  <CardFooter>
                    <Button variant="outline" className="w-full">Watch Video</Button>
                  </CardFooter>
                </Card>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="contact">
            <div className="mb-6">
              <h2 className="text-2xl font-semibold mb-2">Contact Support</h2>
              <p className="text-muted-foreground">
                Need help with something specific? Our support team is here to assist you.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
              <Card>
                <CardHeader className="text-center">
                  <div className="flex justify-center mb-4">
                    <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
                      <LifeBuoy className="h-6 w-6 text-primary" />
                    </div>
                  </div>
                  <CardTitle>Email Support</CardTitle>
                  <CardDescription>
                    Get a response within 24 hours
                  </CardDescription>
                </CardHeader>
                <CardFooter>
                  <Button className="w-full" asChild>
                    <a href="mailto:support@edudiagno.ai">Email Us</a>
                  </Button>
                </CardFooter>
              </Card>

              <Card>
                <CardHeader className="text-center">
                  <div className="flex justify-center mb-4">
                    <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
                      <Video className="h-6 w-6 text-primary" />
                    </div>
                  </div>
                  <CardTitle>Schedule a Call</CardTitle>
                  <CardDescription>
                    Book a 30-minute support call
                  </CardDescription>
                </CardHeader>
                <CardFooter>
                  <Button className="w-full">Book Now</Button>
                </CardFooter>
              </Card>

              <Card>
                <CardHeader className="text-center">
                  <div className="flex justify-center mb-4">
                    <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
                      <BookOpen className="h-6 w-6 text-primary" />
                    </div>
                  </div>
                  <CardTitle>Knowledge Base</CardTitle>
                  <CardDescription>
                    Browse our detailed documentation
                  </CardDescription>
                </CardHeader>
                <CardFooter>
                  <Button variant="outline" className="w-full">
                    View Articles
                  </Button>
                </CardFooter>
              </Card>
            </div>

            <Card>
              <CardHeader>
                <CardTitle>Submit a Support Ticket</CardTitle>
                <CardDescription>
                  Provide details about your issue and we'll get back to you as soon as possible.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <form className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <label htmlFor="name" className="text-sm font-medium">
                        Full Name
                      </label>
                      <Input id="name" placeholder="Your name" />
                    </div>
                    <div className="space-y-2">
                      <label htmlFor="email" className="text-sm font-medium">
                        Email Address
                      </label>
                      <Input id="email" type="email" placeholder="Your email" />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <label htmlFor="subject" className="text-sm font-medium">
                      Subject
                    </label>
                    <Input id="subject" placeholder="Brief description of your issue" />
                  </div>
                  <div className="space-y-2">
                    <label htmlFor="message" className="text-sm font-medium">
                      Message
                    </label>
                    <textarea
                      id="message"
                      className="w-full min-h-[120px] rounded-md border border-input bg-transparent px-3 py-2 text-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                      placeholder="Provide details about your issue..."
                    ></textarea>
                  </div>
                  <div className="space-y-2">
                    <label htmlFor="attachment" className="text-sm font-medium">
                      Attachments (optional)
                    </label>
                    <Input id="attachment" type="file" />
                  </div>
                </form>
              </CardContent>
              <CardFooter>
                <Button className="w-full">Submit Ticket</Button>
              </CardFooter>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </DashboardLayout>
  );
};

export default Help;