import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import RegularLayout from "@/components/layout/RegularLayout";
import { jobSeekerApi } from "@/services/jobSeekerApi";
import { adminApi } from "@/services/adminApi";
import { toast } from "sonner";

const JobSeekerLogin: React.FC = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      if (email === "admin@edudiagno.com") {
        // Admin login
        const res = await adminApi.login(email, password);
        localStorage.setItem("admin_token", res.access_token);
        toast.success("Admin login successful");
        navigate("/admin-dashboard");
      } else {
        // Regular jobseeker login
        const res = await jobSeekerApi.login({ email, password });
        const token = res.headers["authorization"]?.split("Bearer ")[1];
        if (token) {
          localStorage.setItem("jobseeker_token", token);
          toast.success("Login successful");
          navigate("/jobseeker/home");
        } else {
          toast.error("No token received");
        }
      }
    } catch (error: any) {
      toast.error(error?.response?.data?.detail || "Login failed");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <RegularLayout>
      <div className="flex flex-1 items-center justify-center py-8">
        <div className="w-full max-w-md p-8 space-y-6 bg-background rounded shadow-md">
          <h2 className="text-2xl font-bold text-center">Login</h2>
          <form className="space-y-4" onSubmit={handleSubmit}>
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                name="email"
                type="email"
                autoComplete="email"
                required
                value={email}
                onChange={e => setEmail(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                name="password"
                type="password"
                autoComplete="current-password"
                required
                value={password}
                onChange={e => setPassword(e.target.value)}
              />
            </div>
            <Button type="submit" className="w-full" disabled={isLoading}>
              {isLoading ? "Logging in..." : "Log In"}
            </Button>
          </form>
          <div className="text-center text-sm">
            Don't have an account?{' '}
            <Link to="/jobseeker/signup" className="underline text-brand">
              Sign up
            </Link>
          </div>
        </div>
      </div>
    </RegularLayout>
  );
};

export default JobSeekerLogin;
