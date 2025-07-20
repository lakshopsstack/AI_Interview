import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import LoadingSpinner from "@/components/common/LoadingSpinner";
import RegularLayout from "@/components/layout/RegularLayout";
import { jobSeekerApi } from "@/services/jobSeekerApi";
import { toast } from "sonner";

interface FormData {
  firstname: string;
  lastname: string;
  email: string;
  password: string;
  confirmPassword: string;
  phone: string;
  country_code: string;
  experience?: number;
}

const JobSeekerSignup = () => {
  const [formData, setFormData] = useState<FormData>({
    firstname: "",
    lastname: "",
    email: "",
    password: "",
    confirmPassword: "",
    phone: "",
    country_code: "+91",
    experience: 0,
  });
  const [agreedToTerms, setAgreedToTerms] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.firstname.trim() || !formData.email.trim() || !formData.password.trim()) {
      toast.error("All fields are required");
      return;
    }
    if (formData.password !== formData.confirmPassword) {
      toast.error("Passwords don't match");
      return;
    }
    if (!agreedToTerms) {
      toast.error("You must agree to the terms and conditions");
      return;
    }
    setIsLoading(true);
    try {
      await jobSeekerApi.register({
        firstname: formData.firstname,
        lastname: formData.lastname,
        email: formData.email,
        phone: formData.phone,
        country_code: formData.country_code,
        password: formData.password,
        work_experience_yrs: formData.experience || 0,
      });
      toast.success("Account created successfully");
      navigate("/jobseeker/login");
    } catch (error: any) {
      const detail = error?.response?.data?.detail || "Failed to create account. Please try again later.";
      toast.error(detail);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <RegularLayout>
        <div className="max-w-3xl w-full mx-auto glass-card rounded-xl p-6 animate-fade-in flex flex-col items-center">
          <div className="w-full">
            <div className="text-center mb-2">
              <h1 className="text-2xl font-bold">Signup</h1>
              <p className="text-muted-foreground mt-1">Create your job seeker account</p>
                <p className="text-xs text-muted-foreground mt-1 text-balance">
                Create your profile to apply for jobs, track your applications, and get matched with the best opportunities for your skills and experience.
                </p>
            </div>
            <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-4 w-full">
              <div className="space-y-2">
                <Label htmlFor="firstname">First Name</Label>
                <Input id="firstname" name="firstname" type="text" value={formData.firstname} onChange={e => setFormData({ ...formData, firstname: e.target.value })} required />
              </div>
              <div className="space-y-2">
                <Label htmlFor="lastname">Last Name</Label>
                <Input id="lastname" name="lastname" type="text" value={formData.lastname} onChange={e => setFormData({ ...formData, lastname: e.target.value })} required />
              </div>
              <div className="space-y-2 col-span-2">
                <Label htmlFor="email">Email Address</Label>
                <Input
                  id="email"
                  name="email"
                  type="email"
                  className="bg-background"
                  value={formData.email}
                  onChange={e => setFormData({ ...formData, email: e.target.value })}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="password">Password</Label>
                <Input
                  id="password"
                  name="password"
                  type="password"
                  className="bg-background"
                  value={formData.password}
                  onChange={e => setFormData({ ...formData, password: e.target.value })}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="confirmPassword">Confirm Password</Label>
                <Input id="confirmPassword" name="confirmPassword" type="password" value={formData.confirmPassword} onChange={e => setFormData({ ...formData, confirmPassword: e.target.value })} required />
              </div>
              <div className="md:col-span-2 flex flex-col md:flex-row gap-2">
                <div className="flex flex-col w-full md:w-24 ">
                  <Label htmlFor="country_code" className="">Country Code</Label>
                  <select id="country_code" name="country_code" value={formData.country_code} onChange={e => setFormData({ ...formData, country_code: e.target.value })} className="w-full md:w-24 border rounded px-3 py-2 bg-background">
                    <option value="+91">+91 IN</option>
                    <option value="+1">+1 US</option>
                    <option value="+44">+44 UK</option>
                    <option value="+61">+61 AUS</option>
                    <option value="+81">+81 JP</option>
                  </select>
                </div>
                <div className="flex-1 flex flex-col">
                  <Label htmlFor="phone" className="">Phone</Label>
                  <Input id="phone" name="phone" type="text" value={formData.phone} onChange={e => setFormData({ ...formData, phone: e.target.value.replace(/\D/g, '').slice(0, 10) })} required className="" />
                </div>
              </div>
              <div className="space-y-2 col-span-2">
                <Label htmlFor="work_experience">Work Experience</Label>
                <select
                  id="work_experience"
                  name="work_experience"
                  value={formData.experience === 0 ? "FRESHER" : "EXPERIENCED"}
                  onChange={e => setFormData({ ...formData, experience: e.target.value === "FRESHER" ? 0 : 1 })}
                  className="w-full border rounded px-3 py-2 bg-background"
                >
                  <option value="FRESHER">Fresher</option>
                  <option value="EXPERIENCED">Experienced</option>
                </select>
              </div>
              <div className="col-span-2 flex items-start space-x-2">
                <Checkbox id="terms" checked={agreedToTerms} onCheckedChange={checked => setAgreedToTerms(checked as boolean)} className="mt-1" />
                <Label htmlFor="terms" className="text-sm font-normal cursor-pointer">
                  I agree to the <Link to="/terms" className="text-brand hover:underline">Terms of Service</Link> and <Link to="/privacy" className="text-brand hover:underline">Privacy Policy</Link>
                </Label>
              </div>
              <Button type="submit" className="w-full col-span-2" disabled={isLoading}>
                {isLoading ? <LoadingSpinner size="sm" /> : <>Create account</>}
              </Button>
            </form>
            <div className="mt-4 text-center">
              <p className="text-sm text-muted-foreground">
                Already have an account? <Link to="/jobseeker/login" className="text-brand hover:underline">Log in</Link>
              </p>
            </div>
          </div>
        </div>
      </RegularLayout>
    </div>
  );
};

export default JobSeekerSignup;
