import LandingLayout from "@/components/layout/RegularLayout";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Link } from "react-router-dom";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";

const Privacy = () => {
  return (
    <LandingLayout>
      <div className="container py-12 md:py-20">
        <div className="max-w-4xl mx-auto">
          <Breadcrumb className="mb-6">
            <BreadcrumbList>
              <BreadcrumbItem>
                <BreadcrumbLink href="/">Home</BreadcrumbLink>
              </BreadcrumbItem>
              <BreadcrumbSeparator />
              <BreadcrumbItem>
                <BreadcrumbPage>Privacy Policy</BreadcrumbPage>
              </BreadcrumbItem>
            </BreadcrumbList>
          </Breadcrumb>

          <div className="mb-12">
            <h1 className="text-3xl md:text-4xl font-bold mb-4">
              Privacy Policy
            </h1>
            <p className="text-muted-foreground">Last updated: June 15, 2023</p>
          </div>

          <div className="prose prose-lg dark:prose-invert max-w-none">
            <p>
              At EduDiagno, we take your privacy seriously. This Privacy Policy
              explains how we collect, use, disclose, and safeguard your
              information when you visit our website or use our AI-powered
              hiring platform.
            </p>

            <h2 className="text-2xl font-bold mt-8 mb-4">
              Information We Collect
            </h2>
            <p>
              We collect information that you provide directly to us when you:
            </p>
            <ul className="list-disc pl-6 space-y-2">
              <li>Register for an account</li>
              <li>Create or modify your profile</li>
              <li>Post job listings</li>
              <li>Conduct AI interviews</li>
              <li>Upload resumes or other candidate information</li>
              <li>Communicate with us</li>
            </ul>

            <p className="mt-4">This information may include:</p>
            <ul className="list-disc pl-6 space-y-2">
              <li>
                Name, email address, phone number, and company information
              </li>
              <li>Billing information and payment details</li>
              <li>User preferences and settings</li>
              <li>Job descriptions and requirements</li>
              <li>
                Candidate data, including resumes, interview responses, and
                assessment results
              </li>
            </ul>

            <h2 className="text-2xl font-bold mt-8 mb-4">
              How We Use Your Information
            </h2>
            <p>We use the information we collect to:</p>
            <ul className="list-disc pl-6 space-y-2">
              <li>Provide, maintain, and improve our services</li>
              <li>Process transactions and send related information</li>
              <li>
                Send technical notices, updates, security alerts, and
                administrative messages
              </li>
              <li>
                Respond to your comments, questions, and customer service
                requests
              </li>
              <li>Develop new features and services</li>
              <li>Monitor and analyze trends, usage, and activities</li>
              <li>
                Detect, investigate, and prevent fraudulent transactions and
                other illegal activities
              </li>
              <li>
                Train and improve our AI models for interview and resume
                analysis
              </li>
            </ul>

            <h2 className="text-2xl font-bold mt-8 mb-4">
              Data Retention and Security
            </h2>
            <p>
              We retain your information for as long as necessary to provide our
              services and fulfill the purposes outlined in this Privacy Policy.
              We implement appropriate technical and organizational measures to
              protect your information against unauthorized access, alteration,
              disclosure, or destruction.
            </p>

            <h2 className="text-2xl font-bold mt-8 mb-4">
              Sharing Your Information
            </h2>
            <p>We may share your information with:</p>
            <ul className="list-disc pl-6 space-y-2">
              <li>Service providers who perform services on our behalf</li>
              <li>
                Business partners with whom we jointly offer products or
                services
              </li>
              <li>Third parties as required by law or to protect our rights</li>
              <li>
                In connection with a business transaction such as a merger, sale
                of assets, or acquisition
              </li>
            </ul>

            <h2 className="text-2xl font-bold mt-8 mb-4">
              Your Rights and Choices
            </h2>
            <p>
              Depending on your location, you may have certain rights regarding
              your personal information, including:
            </p>
            <ul className="list-disc pl-6 space-y-2">
              <li>Accessing and updating your information</li>
              <li>Deleting your account and personal information</li>
              <li>Opting out of marketing communications</li>
              <li>Restricting certain data processing</li>
              <li>Data portability</li>
            </ul>

            <h2 className="text-2xl font-bold mt-8 mb-4">
              International Data Transfers
            </h2>
            <p>
              Your information may be transferred to, and processed in,
              countries other than the country in which you reside. These
              countries may have data protection laws that are different from
              the laws of your country. We have implemented appropriate
              safeguards to protect your information when it is transferred
              internationally.
            </p>

            <h2 className="text-2xl font-bold mt-8 mb-4">
              AI and Automated Decision-Making
            </h2>
            <p>
              Our platform uses artificial intelligence to analyze resumes,
              conduct interviews, and provide hiring recommendations. We design
              our AI systems to be fair, transparent, and to minimize potential
              biases. Employers maintain control over the final hiring
              decisions, and candidates have the right to request human review
              of automated decisions.
            </p>

            <h2 className="text-2xl font-bold mt-8 mb-4">Children's Privacy</h2>
            <p>
              Our services are not directed to individuals under 16 years of
              age, and we do not knowingly collect personal information from
              children.
            </p>

            <h2 className="text-2xl font-bold mt-8 mb-4">
              Changes to This Privacy Policy
            </h2>
            <p>
              We may update this Privacy Policy from time to time. We will
              notify you of any changes by posting the new Privacy Policy on
              this page and updating the "Last updated" date.
            </p>

            <h2 className="text-2xl font-bold mt-8 mb-4">Contact Us</h2>
            <p>
              If you have any questions about this Privacy Policy or our data
              practices, please contact us at:
            </p>
            <p className="mt-2">
              <strong>Email:</strong> privacy@edudiagno.ai
              <br />
              <strong>Address:</strong> 123 Tech Plaza, San Francisco, CA 94105
            </p>
          </div>

          <Separator className="my-12" />

          <div className="text-center space-y-4">
            <h3 className="text-xl font-semibold">
              Have questions about our privacy practices?
            </h3>
            <Link to="/contact">
              <Button variant="outline">
                Contact Our Data Protection Team
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </LandingLayout>
  );
};

export default Privacy;
