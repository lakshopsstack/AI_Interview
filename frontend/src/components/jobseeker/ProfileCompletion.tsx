import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/context/AppContext";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { AlertTriangle, CheckCircle2 } from "lucide-react";
import { toast } from "sonner";

interface ProfileCompletionProps {
  onProfileSectionComplete?: () => void;
}

const ProfileCompletion: React.FC<ProfileCompletionProps> = ({ onProfileSectionComplete }) => {
  const { user, updateProfileProgress } = useAuth();
  const navigate = useNavigate();
  const [showAlert, setShowAlert] = useState(false);
  const [hasClickedExplore, setHasClickedExplore] = useState(false);
  const [hasCompletedProfile, setHasCompletedProfile] = useState(false);

  useEffect(() => {
    // Check if user has completed profile before
    const hasCompleted = localStorage.getItem('hasCompletedProfile');
    setHasCompletedProfile(!!hasCompleted);

    // Show alert if profile is not complete
    if (user && (user.profileProgress || 0) < 100) {
      setShowAlert(true);
    } else {
      setShowAlert(false);
    }

    // Check if user has clicked explore button before
    const hasClicked = localStorage.getItem('hasClickedExploreDashboard');
    setHasClickedExplore(!!hasClicked);
  }, [user]);

  const handleDismissAlert = () => {
    setShowAlert(false);
  };

  const handleExploreDashboard = () => {
    localStorage.setItem('hasClickedExploreDashboard', 'true');
    localStorage.setItem('hasCompletedProfile', 'true');
    setHasClickedExplore(true);
    setHasCompletedProfile(true);
    navigate("/dashboard");
  };

  const updateProgress = async (newProgress: number) => {
    try {
      await updateProfileProgress(newProgress);
      if (onProfileSectionComplete) {
        onProfileSectionComplete();
      }
      
      if (newProgress === 100) {
        toast.success("Profile completed! You can now post jobs.");
      } else {
        toast.success("Profile progress saved!");
      }
    } catch (error) {
      toast.error("Failed to update profile progress");
    }
  };

  if (!user) return null;

  // If profile is complete and user hasn't clicked explore button, show success message with button
  if (user.profileProgress === 100 && !hasClickedExplore) {
    return (
      <div className="mb-6">
        <Card className="border-green-500 bg-green-50 dark:bg-green-900/20">
          <CardContent className="pt-6">
            <div className="flex items-center space-x-4">
              <CheckCircle2 className="h-8 w-8 text-green-600" />
              <div>
                <h3 className="text-lg font-semibold text-green-800 dark:text-green-200">Profile Complete!</h3>
                <p className="text-sm text-green-700 dark:text-green-300">
                  Your profile is complete. You can now explore all features of the platform.
                </p>
              </div>
            </div>
            <div className="mt-4">
              <Button 
                variant="outline" 
                className="border-green-500 text-green-700 hover:bg-green-100 dark:hover:bg-green-900/30"
                onClick={handleExploreDashboard}
              >
                Explore Dashboard
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  // If profile has been completed before, don't show anything
  if (hasCompletedProfile) {
    return null;
  }

  return (
    <div className="space-y-4">
      {showAlert && (
        <Alert variant="default" className="border-yellow-500 bg-yellow-50 dark:bg-yellow-900/20">
          <AlertTriangle className="h-4 w-4 text-yellow-600" />
          <AlertTitle>Your profile is incomplete</AlertTitle>
          <AlertDescription>
            Complete your profile to unlock all features and post jobs. Your current progress is {user.profileProgress || 0}%.
          </AlertDescription>
          <div className="mt-2">
            <Button variant="outline" size="sm" onClick={handleDismissAlert} className="mr-2">
              Dismiss
            </Button>
          </div>
        </Alert>
      )}

      <Card className="mb-6">
        <CardHeader>
          <CardTitle>Profile Completion</CardTitle>
          <CardDescription>
            Complete your profile to unlock all features of the platform
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-6">
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span>Profile Completion</span>
                <span className="font-medium">{user.profileProgress || 0}%</span>
              </div>
              <Progress value={user.profileProgress || 0} className="h-2" />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              <Card className={`p-4 ${user.first_name && user.last_name ? 'border-green-500 bg-green-50 dark:bg-green-900/20' : 'border-gray-200'}`}>
                <div className="text-sm font-medium">Basic Information</div>
                {user.first_name && user.last_name ? (
                  <div className="text-xs text-muted-foreground mt-1 flex items-center">
                    <CheckCircle2 className="h-3 w-3 mr-1 text-green-600" /> Completed
                  </div>
                ) : (
                  <div className="text-xs text-muted-foreground mt-1">Required</div>
                )}
                <Button 
                  variant="link" 
                  className="px-0 py-1 h-auto text-xs" 
                  onClick={() => navigate("/dashboard/profile")}
                >
                  {user.first_name && user.last_name ? "Update" : "Complete"}
                </Button>
              </Card>

              <Card className={`p-4 ${user.company_name ? 'border-green-500 bg-green-50 dark:bg-green-900/20' : 'border-gray-200'}`}>
                <div className="text-sm font-medium">Company Information</div>
                {user.company_name ? (
                  <div className="text-xs text-muted-foreground mt-1 flex items-center">
                    <CheckCircle2 className="h-3 w-3 mr-1 text-green-600" /> Completed
                  </div>
                ) : (
                  <div className="text-xs text-muted-foreground mt-1">Required</div>
                )}
                <Button 
                  variant="link" 
                  className="px-0 py-1 h-auto text-xs" 
                  onClick={() => navigate("/dashboard/profile?tab=company")}
                >
                  {user.company_name ? "Update" : "Complete"}
                </Button>
              </Card>

              <Card className={`p-4 ${user.company_logo ? 'border-green-500 bg-green-50 dark:bg-green-900/20' : 'border-gray-200 bg-gray-50 dark:bg-gray-900/20'}`}>
                <div className="text-sm font-medium">Company Logo</div>
                <div className="text-xs text-muted-foreground mt-1">Optional</div>
                <Button 
                  variant="link" 
                  className="px-0 py-1 h-auto text-xs" 
                  onClick={() => navigate("/dashboard/profile?tab=company")}
                >
                  {user.company_logo ? "Update" : "Add"}
                </Button>
              </Card>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default ProfileCompletion;
