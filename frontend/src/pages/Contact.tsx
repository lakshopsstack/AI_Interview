import { useState } from "react";
import LandingLayout from "@/components/layout/RegularLayout";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { CalendarClock, Mail, MapPin, Phone } from "lucide-react";

const Contact = () => {
  const { toast } = useToast();
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    company: "",
    phone: "",
    interest: "",
    message: "",
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSelectChange = (value: string) => {
    setFormData((prev) => ({ ...prev, interest: value }));
  };

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsSubmitting(true);

    // Simulate API call
    setTimeout(() => {
      toast({
        title: "Message sent successfully!",
        description: "Our team will get back to you within 24 hours.",
      });
      setFormData({
        name: "",
        email: "",
        company: "",
        phone: "",
        interest: "",
        message: "",
      });
      setIsSubmitting(false);
    }, 1000);
  };

  return (
    <LandingLayout>
      <div className="container py-12 md:py-20">
        <div className="text-center mb-12">
          <h1 className="text-4xl md:text-5xl font-bold mb-4">Contact Us</h1>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
            Have questions about our AI-powered hiring platform? Our team is
            here to help.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-16">
          <Card className="flex flex-col items-center text-center p-6">
            <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center mb-4">
              <Phone className="w-6 h-6 text-primary" />
            </div>
            <h3 className="text-xl font-bold mb-2">Call Us</h3>
            <p className="text-muted-foreground mb-4">
              Our support team is available Monday-Friday, 9am-6pm EST
            </p>
            <a href="tel:+18005551234" className="text-primary font-medium">
              +1 (800) 555-1234
            </a>
          </Card>

          <Card className="flex flex-col items-center text-center p-6">
            <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center mb-4">
              <Mail className="w-6 h-6 text-primary" />
            </div>
            <h3 className="text-xl font-bold mb-2">Email Us</h3>
            <p className="text-muted-foreground mb-4">
              Send us an email and we'll respond within 24 hours
            </p>
            <a
              href="mailto:hello@edudiagno.ai"
              className="text-primary font-medium"
            >
              hello@edudiagno.ai
            </a>
          </Card>

          <Card className="flex flex-col items-center text-center p-6">
            <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center mb-4">
              <MapPin className="w-6 h-6 text-primary" />
            </div>
            <h3 className="text-xl font-bold mb-2">Visit Us</h3>
            <p className="text-muted-foreground mb-4">
              Our headquarters is located in San Francisco
            </p>
            <address className="not-italic text-primary font-medium">
              123 Tech Plaza, San Francisco, CA 94105
            </address>
          </Card>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
          <div>
            <h2 className="text-3xl font-bold mb-6">Get in Touch</h2>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="name">Full Name</Label>
                  <Input
                    id="name"
                    name="name"
                    placeholder="Your name"
                    value={formData.name}
                    onChange={handleChange}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="email">Email Address</Label>
                  <Input
                    id="email"
                    name="email"
                    type="email"
                    placeholder="your.email@company.com"
                    value={formData.email}
                    onChange={handleChange}
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="company">Company Name</Label>
                  <Input
                    id="company"
                    name="company"
                    placeholder="Your company"
                    value={formData.company}
                    onChange={handleChange}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="phone">Phone Number</Label>
                  <Input
                    id="phone"
                    name="phone"
                    type="tel"
                    placeholder="(123) 456-7890"
                    value={formData.phone}
                    onChange={(e) => {
                      // Only allow numbers and basic phone formatting characters
                      const value = e.target.value.replace(/[^\d\s\-\(\)]/g, '');
                      setFormData(prev => ({ ...prev, phone: value }));
                    }}
                    pattern="[0-9\s\-\(\)]*"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="interest">What are you interested in?</Label>
                <Select
                  value={formData.interest}
                  onValueChange={handleSelectChange}
                >
                  <SelectTrigger id="interest">
                    <SelectValue placeholder="Select an option" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="product_demo">Product Demo</SelectItem>
                    <SelectItem value="pricing">Pricing Information</SelectItem>
                    <SelectItem value="enterprise">
                      Enterprise Solution
                    </SelectItem>
                    <SelectItem value="partnership">
                      Partnership Opportunity
                    </SelectItem>
                    <SelectItem value="support">Technical Support</SelectItem>
                    <SelectItem value="other">Other</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="message">Your Message</Label>
                <Textarea
                  id="message"
                  name="message"
                  placeholder="Please provide details about your inquiry..."
                  rows={5}
                  value={formData.message}
                  onChange={handleChange}
                  required
                />
              </div>

              <Button type="submit" className="w-full" disabled={isSubmitting}>
                {isSubmitting ? "Sending..." : "Send Message"}
              </Button>
            </form>
          </div>

          <div className="flex flex-col justify-between">
            <div>
              <h2 className="text-3xl font-bold mb-6">Schedule a Demo</h2>
              <p className="text-muted-foreground mb-8">
                See how our AI-powered hiring platform can transform your
                recruitment process with a personalized demo tailored to your
                company's needs.
              </p>

              <Card className="mb-8">
                <CardContent className="p-6">
                  <div className="flex items-start gap-4">
                    <CalendarClock className="w-10 h-10 text-primary flex-shrink-0" />
                    <div>
                      <h3 className="text-xl font-bold mb-2">30-Minute Demo</h3>
                      <p className="text-muted-foreground mb-4">
                        Our product specialists will walk you through the
                        platform, show how our AI interviews work, and answer
                        any questions.
                      </p>
                      <Button className="w-full">Schedule Now</Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            <div className="bg-muted rounded-lg p-6">
              <h3 className="text-xl font-bold mb-4">
                Frequently Asked Questions
              </h3>
              <div className="space-y-4">
                <div>
                  <h4 className="font-medium mb-1">
                    How quickly can we implement EduDiagno?
                  </h4>
                  <p className="text-sm text-muted-foreground">
                    Most customers are up and running within 1-2 weeks,
                    depending on integration needs.
                  </p>
                </div>
                <div>
                  <h4 className="font-medium mb-1">
                    Is your platform GDPR and CCPA compliant?
                  </h4>
                  <p className="text-sm text-muted-foreground">
                    Yes, we maintain compliance with global data protection
                    regulations.
                  </p>
                </div>
                <div>
                  <h4 className="font-medium mb-1">
                    Can we customize the AI interview questions?
                  </h4>
                  <p className="text-sm text-muted-foreground">
                    Absolutely! You can create custom questions or use our
                    industry-specific templates.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </LandingLayout>
  );
};

export default Contact;
