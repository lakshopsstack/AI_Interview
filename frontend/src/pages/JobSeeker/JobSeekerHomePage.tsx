import React, { useContext } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Link, useNavigate } from "react-router-dom";
import JobSeekerLayout from "@/components/layout/JobSeekerLayout";
import { AppContext } from "@/context/AppContext";
import { jobSeekerApi } from "@/services/jobSeekerApi";
import { 
  User, 
  Briefcase, 
  MapPin, 
  Building, 
  Calendar, 
  TrendingUp, 
  Award, 
  Target, 
  CheckCircle, 
  AlertCircle,
  GraduationCap,
  Star,
  Clock,
  Eye
} from "lucide-react";

function JobSeekerHomePage() {
  const appContext = useContext(AppContext);
  const jobSeeker = appContext?.jobSeeker;
  const navigate = useNavigate();

  const firstname = jobSeeker?.firstname || "Jobseeker";
  const lastname = jobSeeker?.lastname || "User";
  const profile_picture_url = jobSeeker?.profile_picture_url ||
    "https://static.vecteezy.com/system/resources/thumbnails/009/292/244/small/default-avatar-icon-of-social-media-user-vector.jpg";
  const last_updated_time = jobSeeker?.last_updated_time || null;
  const [appliedJobsData, setAppliedJobsData] = React.useState<any[]>([]);
  const [profileCompletion, setProfileCompletion] = React.useState<number>(0);
  const [missingFields, setMissingFields] = React.useState<string[]>([]);
  // const [edudiagnoScore, setEduDiagnoScore] = React.useState<{ score: number } | null>(null);
  // const [edudiagnoLoading, setEduDiagnoLoading] = React.useState(true);

  React.useEffect(() => {
    if (!jobSeeker?.id) return;
    jobSeekerApi.getAppliedJobs(jobSeeker.id)
      .then((jobs: any[]) => setAppliedJobsData(jobs || []))
      .catch(() => setAppliedJobsData([]));
  }, [jobSeeker?.id]);

  React.useEffect(() => {
    if (!jobSeeker?.id) return;
    jobSeekerApi.getProfileCompletion(jobSeeker.id)
      .then((res) => {
        setProfileCompletion(res.completion || 0);
        setMissingFields(res.missing_fields || []);
      })
      .catch(() => {
        setProfileCompletion(0);
        setMissingFields([]);
      });
  }, [jobSeeker?.id]);

  // React.useEffect(() => {
  //   if (!jobSeeker?.id) return;
  //   setEduDiagnoLoading(true);
  //   getEduDiagnoScore(jobSeeker.id)
  //     .then((res) => {
  //       setEduDiagnoScore(res);
  //       setEduDiagnoLoading(false);
  //     })
  //     .catch(() => {
  //       setEduDiagnoScore(null);
  //       setEduDiagnoLoading(false);
  //     });
  // }, [jobSeeker?.id]);

  // const getScoreColor = (score: number) => {
  //   if (score >= 80) return "text-green-600 bg-green-50 border-green-200";
  //   if (score >= 60) return "text-yellow-600 bg-yellow-50 border-yellow-200";
  //   return "text-red-600 bg-red-50 border-red-200";
  // };

  // const getScoreLabel = (score: number) => {
  //   if (score >= 80) return "Excellent";
  //   if (score >= 60) return "Good";
  //   return "Needs Improvement";
  // };

  return (
    <JobSeekerLayout>
      <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Welcome Header */}
          <div className="mb-8">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-3xl font-bold text-foreground">
                  Welcome back, {firstname}! 👋
                </h1>
                <p className="text-muted-foreground mt-2">
                  Ready to take the next step in your career journey?
                </p>
              </div>
              <div className="flex items-center space-x-2">
                <Badge variant="secondary" className="text-xs">
                  <Clock className="w-3 h-3 mr-1" />
                  {last_updated_time && 
                    `Last updated ${new Date(last_updated_time).toLocaleDateString()}`
                  }
                </Badge>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
            {/* Left Sidebar - Profile & Stats */}
            <div className="lg:col-span-3 space-y-6">
              {/* Profile Card */}
              <Card className="border-0 shadow-lg bg-gradient-to-br from-white to-muted/30">
                <CardContent className="p-6">
                  <div className="flex flex-col items-center text-center">
                    <Avatar className="h-20 w-20 mb-4 border-4 border-white shadow-lg">
                      <AvatarImage src={profile_picture_url} alt="Profile" />
                      <AvatarFallback className="text-lg font-semibold">
                        {firstname.charAt(0)}{lastname.charAt(0)}
                      </AvatarFallback>
                    </Avatar>
                    <h2 className="text-xl font-semibold text-foreground mb-1">
                      {firstname} {lastname}
                    </h2>
                    <p className="text-sm text-muted-foreground mb-4">
                      Job Seeker
                    </p>
                    
                    {/* Profile Completion */}
                    <div className="w-full mb-4">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-sm font-medium">Profile Completion</span>
                        <span className="text-sm font-bold text-primary">{profileCompletion}%</span>
                      </div>
                      <Progress value={profileCompletion} className="h-2" />
                      {profileCompletion < 100 && (
                        <p className="text-xs text-muted-foreground mt-1">
                          Complete your profile to get better job matches
                        </p>
                      )}
                    </div>

                    <Button 
                      variant={profileCompletion === 100 ? "outline" : "default"}
                      className="w-full"
                      onClick={() => navigate("/jobseeker/profile")}
                    >
                      <User className="w-4 h-4 mr-2" />
                      {profileCompletion === 100 ? "Update Profile" : "Complete Profile"}
                    </Button>
                  </div>
                </CardContent>
              </Card>

              {/* Quick Stats */}
              <Card className="border-0 shadow-lg">
                <CardHeader className="pb-3">
                  <CardTitle className="text-lg flex items-center">
                    <TrendingUp className="w-5 h-5 mr-2 text-primary" />
                    Quick Stats
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center justify-between p-3 bg-muted/30 rounded-lg">
                    <div className="flex items-center">
                      <Briefcase className="w-4 h-4 mr-2 text-blue-600" />
                      <span className="text-sm font-medium">Applied Jobs</span>
                    </div>
                    <Badge variant="secondary">{appliedJobsData.length}</Badge>
                  </div>
                  
                  <div className="flex items-center justify-between p-3 bg-muted/30 rounded-lg">
                    <div className="flex items-center">
                      <Eye className="w-4 h-4 mr-2 text-green-600" />
                      <span className="text-sm font-medium">Profile Views</span>
                    </div>
                    <Badge variant="secondary">0</Badge>
                  </div>
                  
                  <div className="flex items-center justify-between p-3 bg-muted/30 rounded-lg">
                    <div className="flex items-center">
                      <Star className="w-4 h-4 mr-2 text-yellow-600" />
                      <span className="text-sm font-medium">Saved Jobs</span>
                    </div>
                    <Badge variant="secondary">0</Badge>
                  </div>
                </CardContent>
              </Card>

              {/* Safety Tips */}
              <Card className="border-0 shadow-lg bg-gradient-to-br from-orange-50 to-orange-100/50">
                <CardContent className="p-6">
                  <div className="flex items-start space-x-3">
                    <div className="p-2 bg-orange-100 rounded-lg">
                      <AlertCircle className="w-5 h-5 text-orange-600" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-orange-900 mb-2">
                        Stay Safe
                      </h3>
                      <p className="text-sm text-orange-800 mb-3">
                        Never pay anyone to get a job. Fraudsters may ask for money to earn more or get you a job.
                      </p>
                      <Button variant="outline" size="sm" className="text-orange-700 border-orange-300">
                        Learn More
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Main Content */}
            <div className="lg:col-span-6 space-y-6">
              {/* Applied Jobs */}
              {appliedJobsData.length > 0 && (
                <Card className="border-0 shadow-lg">
                  <CardHeader>
                    <CardTitle className="flex items-center">
                      <Briefcase className="w-5 h-5 mr-2 text-primary" />
                      Recent Applications
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {appliedJobsData.slice(0, 3).map((jobData, idx) => (
                      <Link
                        key={`applied-job-${jobData.id}`}
                        to={`/jobseeker/job/${jobData.id}`}
                        className="block group"
                      >
                        <div className="p-4 border border-border rounded-lg hover:border-primary/50 hover:shadow-md transition-all duration-200 group-hover:bg-muted/30">
                          <div className="flex items-start justify-between mb-3">
                            <div className="flex-1">
                              <h3 className="font-semibold text-foreground group-hover:text-primary transition-colors">
                                {jobData.job_title}
                              </h3>
                              <div className="flex items-center text-sm text-muted-foreground mt-1">
                                <Building className="w-4 h-4 mr-1" />
                                {jobData.company || 'Company N/A'}
                              </div>
                            </div>
                            <Badge 
                              variant={
                                jobData.application_status === 'shortlisted' ? 'default' :
                                jobData.application_status === 'rejected' ? 'destructive' :
                                'secondary'
                              }
                              className="ml-2"
                            >
                              {jobData.application_status?.charAt(0).toUpperCase() + jobData.application_status?.slice(1) || 'Applied'}
                            </Badge>
                          </div>
                          
                          <div className="flex flex-wrap gap-2 mb-3">
                            <div className="flex items-center text-xs text-muted-foreground">
                              <MapPin className="w-3 h-3 mr-1" />
                              {jobData.job_location || 'Location N/A'}
                            </div>
                            <div className="flex items-center text-xs text-muted-foreground">
                              <Calendar className="w-3 h-3 mr-1" />
                              {jobData.work_mode || 'Type N/A'}
                            </div>
                          </div>

                          {jobData.skills && (
                            <div className="flex flex-wrap gap-1">
                              {jobData.skills.split(',').slice(0, 3).map((skill: string, i: number) => (
                                <Badge key={i} variant="outline" className="text-xs">
                                  {skill.trim()}
                                </Badge>
                              ))}
                              {jobData.skills.split(',').length > 3 && (
                                <Badge variant="outline" className="text-xs">
                                  +{jobData.skills.split(',').length - 3} more
                                </Badge>
                              )}
                            </div>
                          )}
                        </div>
                      </Link>
                    ))}
                    
                    {appliedJobsData.length > 3 && (
                      <div className="text-center pt-2">
                        <Button variant="outline" onClick={() => navigate("/jobseeker/applications")}>
                          View All Applications ({appliedJobsData.length})
                        </Button>
                      </div>
                    )}
                  </CardContent>
                </Card>
              )}

              {/* Empty State for Applied Jobs */}
              {appliedJobsData.length === 0 && (
                <Card className="border-0 shadow-lg">
                  <CardContent className="p-8 text-center">
                    <div className="w-16 h-16 mx-auto mb-4 bg-muted rounded-full flex items-center justify-center">
                      <Briefcase className="w-8 h-8 text-muted-foreground" />
                    </div>
                    <h3 className="text-lg font-semibold mb-2">No Applications Yet</h3>
                    <p className="text-muted-foreground mb-4">
                      Start your job search and apply to positions that match your skills.
                    </p>
                    <Button onClick={() => navigate("/jobseeker/job-search")}>
                      <Target className="w-4 h-4 mr-2" />
                      Start Job Search
                    </Button>
                  </CardContent>
                </Card>
              )}
            </div>

            {/* Right Sidebar - Quick Actions & Tips */}
            <div className="lg:col-span-3 space-y-6">
              {/* Quick Actions */}
              <Card className="border-0 shadow-lg">
                <CardHeader>
                  <CardTitle className="text-lg">Quick Actions</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <Button 
                    variant="outline" 
                    className="w-full justify-start"
                    onClick={() => navigate("/jobseeker/job-search")}
                  >
                    <Target className="w-4 h-4 mr-2" />
                    Search Jobs
                  </Button>
                  <Button 
                    variant="outline" 
                    className="w-full justify-start"
                    onClick={() => navigate("/jobseeker/companies")}
                  >
                    <Building className="w-4 h-4 mr-2" />
                    Browse Companies
                  </Button>
                  <Button 
                    variant="outline" 
                    className="w-full justify-start"
                    onClick={() => navigate("/jobseeker/profile")}
                  >
                    <User className="w-4 h-4 mr-2" />
                    Update Profile
                  </Button>
                </CardContent>
              </Card>

              {/* Profile Completion Tips */}
              {missingFields.length > 0 && (
                <Card className="border-0 shadow-lg bg-gradient-to-br from-yellow-50 to-orange-50">
                  <CardHeader>
                    <CardTitle className="text-lg flex items-center text-yellow-800">
                      <AlertCircle className="w-5 h-5 mr-2" />
                      Complete Your Profile
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-yellow-700 mb-3">
                      Add these details to improve your profile completion:
                    </p>
                    <ul className="space-y-1">
                      {missingFields.slice(0, 5).map((field, idx) => (
                        <li key={idx} className="text-sm text-yellow-700 flex items-center">
                          <div className="w-1 h-1 bg-yellow-600 rounded-full mr-2"></div>
                          {field}
                        </li>
                      ))}
                      {missingFields.length > 5 && (
                        <li className="text-sm text-yellow-700">
                          +{missingFields.length - 5} more fields
                        </li>
                      )}
                    </ul>
                    <Button 
                      variant="outline" 
                      size="sm" 
                      className="mt-3 w-full border-yellow-300 text-yellow-700 hover:bg-yellow-100"
                      onClick={() => navigate("/jobseeker/profile")}
                    >
                      Complete Now
                    </Button>
                  </CardContent>
                </Card>
              )}

              {/* Success Tips */}
              <Card className="border-0 shadow-lg bg-gradient-to-br from-green-50 to-emerald-50">
                <CardContent className="p-6">
                  <div className="flex items-start space-x-3">
                    <div className="p-2 bg-green-100 rounded-lg">
                      <TrendingUp className="w-5 h-5 text-green-600" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-green-900 mb-2">
                        Pro Tips
                      </h3>
                      <ul className="text-sm text-green-800 space-y-1">
                        <li>• Keep your profile updated</li>
                        <li>• Take the EduDiagno test</li>
                        <li>• Apply to relevant jobs</li>
                        <li>• Network with companies</li>
                      </ul>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>
    </JobSeekerLayout>
  );
}

export default JobSeekerHomePage;
