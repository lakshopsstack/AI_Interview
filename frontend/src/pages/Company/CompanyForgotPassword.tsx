import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { ArrowLeft, Send, Eye, EyeOff } from "lucide-react";
import LoadingSpinner from "@/components/common/LoadingSpinner";
import axios from "axios";

import RegularLayout from "@/components/layout/RegularLayout";
import {companyApi} from "@/services/companyApi";

const ForgotPassword = () => {
  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [step, setStep] = useState<"email" | "otp" | "password">("email");

  const navigate = useNavigate();

  const handleSendOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!email.trim()) {
      toast.error("Please enter your email");
      return;
    }

    setIsLoading(true);
    
    try {
        const response = await companyApi.sendOtp(email);
      if (response.data.message === "successfully sent otp") {
        setStep("otp");
        toast.success("OTP sent to your email");
      }
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Failed to send OTP");
      console.error("Send OTP failed:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!otp.trim()) {
      toast.error("Please enter the OTP");
      return;
    }

    setIsLoading(true);
    
    try {
      const response = await companyApi.verifyOtp({email, otp});
      // Save the new token from the response header (check both lowercase and uppercase)
      const authHeader = response.headers["authorization"] || response.headers["Authorization"];
      if (authHeader && authHeader.startsWith("Bearer ")) {
        const token = authHeader.split("Bearer ")[1];
        if (token && token.split(".").length === 3) {
          localStorage.setItem("token", token);
        } else {
          throw new Error("Invalid token format received from server.");
        }
      } else {
        throw new Error("No authorization token received from server.");
      }
      if (response.data) {
        setStep("password");
        toast.success("OTP verified successfully");
      }
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Invalid OTP");
      console.error("Verify OTP failed:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!newPassword.trim() || !confirmPassword.trim()) {
      toast.error("Please enter both passwords");
      return;
    }

    if (newPassword !== confirmPassword) {
      toast.error("Passwords don't match");
      return;
    }

    if (newPassword.length < 8) {
      toast.error("Password must be at least 8 characters long");
      return;
    }

    const token = localStorage.getItem('token');
    if (!token) {
      toast.error("Session expired. Please try again.");
      setStep("email");
      return;
    }

    setIsLoading(true);
    
    try {
      const response = await companyApi.updateProfile({password: newPassword});
      
      if (response) {
        toast.success("Password reset successfully");
        // Clear the token and redirect to login
        localStorage.removeItem('token');
        navigate("/employer/login")
      }
    } catch (error: any) {
      if (error.response?.status === 401) {
        toast.error("Session expired. Please try again.");
        setStep("email");
      } else {
        toast.error(error.response?.data?.message || "Failed to reset password");
      }
      console.error("Reset password failed:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  return (
      <RegularLayout>
          <div className="max-w-md w-full mx-auto glass-card rounded-xl p-8 animate-fade-in">
            <div className="flex justify-center mb-6">
              <Link to="/" className="flex items-center space-x-2">
                <div className="w-10 h-10 rounded-md bg-brand flex items-center justify-center text-white font-bold">
                  E
                </div>
                <span className="font-bold text-xl">EduDiagno</span>
              </Link>
            </div>
            
            {step === "email" && (
              <>
                <div className="text-center mb-8">
                  <h1 className="text-2xl font-bold">Reset your password</h1>
                  <p className="text-muted-foreground mt-1">
                    Enter your email and we'll send you an OTP to reset your password
                  </p>
                </div>
                
                <form onSubmit={handleSendOtp} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="email">Email</Label>
                    <Input
                      id="email"
                      type="email"
                      placeholder="name@company.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      autoComplete="email"
                      required
                    />
                  </div>
                  
                  <Button
                    type="submit"
                    className="w-full"
                    disabled={isLoading}
                  >
                    {isLoading ? (
                      <LoadingSpinner size="sm" />
                    ) : (
                      <>
                        Send OTP <Send className="ml-2 h-4 w-4" />
                      </>
                    )}
                  </Button>
                </form>
              </>
            )}

            {step === "otp" && (
              <>
                <div className="text-center mb-8">
                  <h1 className="text-2xl font-bold">Enter OTP</h1>
                  <p className="text-muted-foreground mt-1">
                    We've sent a 6-digit OTP to {email}
                  </p>
                </div>
                
                <form onSubmit={handleVerifyOtp} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="otp">OTP</Label>
                    <Input
                      id="otp"
                      type="text"
                      placeholder="Enter 6-digit OTP"
                      value={otp}
                      onChange={(e) => setOtp(e.target.value)}
                      maxLength={6}
                      required
                    />
                  </div>
                  
                  <Button
                    type="submit"
                    className="w-full"
                    disabled={isLoading}
                  >
                    {isLoading ? (
                      <LoadingSpinner size="sm" />
                    ) : (
                      <>
                        Verify OTP <Send className="ml-2 h-4 w-4" />
                      </>
                    )}
                  </Button>

                  <div className="text-center">
                    <Button
                      type="button"
                      variant="link"
                      onClick={() => setStep("email")}
                      disabled={isLoading}
                    >
                      Didn't receive OTP? Try again
                    </Button>
                  </div>
                </form>
              </>
            )}

            {step === "password" && (
              <>
                <div className="text-center mb-8">
                  <h1 className="text-2xl font-bold">Set New Password</h1>
                  <p className="text-muted-foreground mt-1">
                    Please enter your new password
                  </p>
                </div>
                
                <form onSubmit={handleResetPassword} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="newPassword">New Password</Label>
                    <div className="relative">
                      <Input
                        id="newPassword"
                        type={showPassword ? "text" : "password"}
                        placeholder="Enter new password"
                        value={newPassword}
                        onChange={(e) => setNewPassword(e.target.value)}
                        required
                      />
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        className="absolute right-0 top-0 h-full px-3"
                        onClick={togglePasswordVisibility}
                      >
                        {showPassword ? (
                          <EyeOff className="h-4 w-4" />
                        ) : (
                          <Eye className="h-4 w-4" />
                        )}
                      </Button>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="confirmPassword">Confirm Password</Label>
                    <Input
                      id="confirmPassword"
                      type={showPassword ? "text" : "password"}
                      placeholder="Confirm new password"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      required
                    />
                    {newPassword && confirmPassword && newPassword !== confirmPassword && (
                      <p className="text-xs text-destructive mt-1">
                        Passwords don't match
                      </p>
                    )}
                  </div>
                  
                  <Button
                    type="submit"
                    className="w-full"
                    disabled={isLoading}
                  >
                    {isLoading ? (
                      <LoadingSpinner size="sm" />
                    ) : (
                      <>
                        Reset Password <Send className="ml-2 h-4 w-4" />
                      </>
                    )}
                  </Button>
                </form>
              </>
            )}
          </div>
    </RegularLayout>
  );
};

export default ForgotPassword;
