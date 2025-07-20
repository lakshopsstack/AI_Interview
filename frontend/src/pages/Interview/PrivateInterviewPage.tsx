import React, { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardContent, CardFooter, CardDescription } from "@/components/ui/card";
import { interviewApi } from "@/services/interviewApi";
import LoadingSpinner from "@/components/common/LoadingSpinner";
import { Lock } from "lucide-react";
import JobClosedMessage from "./JobClosedMessage";

const PrivateInterviewPage: React.FC = () => {
  const { token } = useParams<{ token: string }>();
  console.log("[PrivateInterviewPage] token from URL:", token);
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [jobClosed, setJobClosed] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    try {
      console.log("[PrivateInterviewPage] Calling getInterviewByPrivateLink with token:", token, "email:", email);
      const res = await interviewApi.getInterviewByPrivateLink(token!, email);
      console.log("[PrivateInterviewPage] API response:", res);
      if (res.data && res.data.id) {
        // Store the JWT token for authentication
        if (res.data.token) {
          localStorage.setItem("i_token", res.data.token);
        }
        // Navigate to the secure interview flow using the token
        navigate(`/interview/compatibility?token=${token}`);
      } else {
        setError("Invalid or expired link.");
        console.error("[PrivateInterviewPage] Invalid or expired link. Response:", res);
      }
    } catch (err: any) {
      setError(
        err?.response?.data?.detail || "Invalid or expired link or email mismatch."
      );
      if (
        err?.response?.data?.detail &&
        err.response.data.detail.toLowerCase().includes("job is closed")
      ) {
        setJobClosed(true);
      }
      console.error("[PrivateInterviewPage] API error:", err);
    } finally {
      setLoading(false);
    }
  };

  if (jobClosed) {
    return <JobClosedMessage />;
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-background to-muted/50 py-12 px-2">
      <Card className="w-full max-w-md shadow-xl border bg-background">
        <CardHeader className="flex flex-col items-center gap-2 pb-2">
          <div className="bg-primary/10 rounded-full p-3 mb-2">
            <Lock className="h-8 w-8 text-primary" />
          </div>
          <CardTitle className="text-2xl font-bold text-center">Access Your Interview</CardTitle>
          <CardDescription className="text-center text-muted-foreground">
            Enter your email to unlock your private interview link. This ensures only you can access your interview.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label htmlFor="email" className="block mb-1 font-medium">
                Email Address
              </label>
              <Input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                placeholder="your@email.com"
                autoFocus
              />
            </div>
            {error && <div className="text-red-600 text-sm text-center">{error}</div>}
            <CardFooter className="p-0 pt-2 flex-col items-stretch gap-2">
              <Button type="submit" className="w-full" disabled={loading}>
                {loading ? <LoadingSpinner /> : "Access Interview"}
              </Button>
            </CardFooter>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};

export default PrivateInterviewPage; 