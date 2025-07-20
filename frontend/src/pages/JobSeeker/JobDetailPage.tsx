import React, { useEffect, useState, useContext } from "react";
import { useParams, Link } from "react-router-dom";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { jobSeekerApi } from "@/services/jobSeekerApi";
import { Job } from "@/types/job";
import { CompanyPublicData } from "@/types/company";
import JobSeekerLayout from "@/components/layout/JobSeekerLayout";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { MapPin, Clock, DollarSign, Briefcase, GraduationCap, Star, CheckCircle, Calendar, Users, Globe, Building } from "lucide-react";
import { AppContext } from "@/context/AppContext";

const JobDetailPage: React.FC = () => {
  const { jobId } = useParams<{ jobId: string }>();
  const [job, setJob] = useState<Job | null>(null);
  const [loading, setLoading] = useState(true);
  const [applied, setApplied] = useState(false);
  const [error, setError] = useState("");
  const [company, setCompany] = useState<CompanyPublicData | null>(null);
  const [companyLoading, setCompanyLoading] = useState(false);

  const appContext = useContext(AppContext);
  const jobSeekerId = appContext?.jobSeeker?.id;

  // Helper function to parse comma-separated values and return as array
  const parseCommaSeparated = (value: string | undefined): string[] => {
    if (!value) return [];
    return value.split(',').map(item => item.trim()).filter(item => item.length > 0);
  };

  // Helper function to render comma-separated values as badges
  const renderAsBadges = (value: string | undefined, variant: "default" | "secondary" | "outline" = "secondary", type?: "skills" | "languages" | "benefits" | "qualifications") => {
    const items = parseCommaSeparated(value);
    if (items.length === 0) return <span className="text-muted-foreground">Not specified</span>;
    
    // Improved color schemes for better contrast in light mode
    const getBadgeStyle = (item: string, index: number) => {
      if (type === "skills") {
        // Use more readable colors for light mode
        const colors = [
          "bg-blue-200 text-blue-900 dark:bg-blue-900 dark:text-blue-200",
          "bg-green-200 text-green-900 dark:bg-green-900 dark:text-green-200",
          "bg-purple-200 text-purple-900 dark:bg-purple-900 dark:text-purple-200",
          "bg-orange-200 text-orange-900 dark:bg-orange-900 dark:text-orange-200",
          "bg-pink-200 text-pink-900 dark:bg-pink-900 dark:text-pink-200"
        ];
        return `text-xs font-medium px-2 py-0.5 rounded ${colors[index % colors.length]} shadow-sm`;
      }
      if (type === "languages") {
        return "text-xs font-medium px-2 py-0.5 rounded bg-indigo-200 text-indigo-900 dark:bg-indigo-900 dark:text-indigo-200 shadow-sm";
      }
      if (type === "benefits") {
        return "text-xs font-medium px-2 py-0.5 rounded bg-emerald-200 text-emerald-900 dark:bg-emerald-900 dark:text-emerald-200 shadow-sm";
      }
      if (type === "qualifications") {
        return "text-xs font-medium px-2 py-0.5 rounded bg-amber-200 text-amber-900 dark:bg-amber-900 dark:text-amber-200 shadow-sm";
      }
      return "text-xs font-medium px-2 py-0.5 rounded bg-secondary text-secondary-foreground shadow-sm";
    };
    
    return (
      <div className="flex flex-wrap gap-2 bg-muted/40 p-2 rounded-md">
        {items.map((item, index) => (
          <Badge 
            key={index} 
            variant={variant} 
            className={getBadgeStyle(item, index)}
          >
            {item}
          </Badge>
        ))}
      </div>
    );
  };

  // Helper function to render comma-separated values as plain text with line breaks
  const renderAsLines = (value: string | undefined) => {
    if (!value) return <span className="text-muted-foreground">Not specified</span>;
    return value.split(',').map((item, idx) => (
      <div key={idx} className="text-muted-foreground">{item.trim()}</div>
    ));
  };

  useEffect(() => {
    const fetchJob = async () => {
      setLoading(true);
      setError("");
      try {
        // Pass jobSeekerId to getJob to get 'applied' status
        const res = await jobSeekerApi.getJob(Number(jobId), jobSeekerId);
        setJob(res.job || res);
        setApplied(!!res.applied);
        // Fetch company details if company_id is present
        if ((res.job || res)?.company_id) {
          setCompanyLoading(true);
          try {
            const companyRes = await jobSeekerApi.getCompanyById((res.job || res).company_id);
            setCompany(companyRes);
          } catch {
            setCompany(null);
          } finally {
            setCompanyLoading(false);
          }
        } else {
          setCompany(null);
        }
      } catch (e) {
        setError("Could not load job details.");
      } finally {
        setLoading(false);
      }
    };

    fetchJob();
  }, [jobId, jobSeekerId]);

  const handleApply = async () => {
    if (!jobId || !jobSeekerId) {
      setError("Jobseeker ID missing. Please log in again.");
      return;
    }
    setError("");
    try {
      await jobSeekerApi.applyToJob(Number(jobId), jobSeekerId);
      setApplied(true);
    } catch (e: any) {
      setError(e?.response?.data?.detail || e?.message || "Could not apply to this job. Please try again.");
    }
  };

  return (
    <JobSeekerLayout>
      <div className="min-h-screen bg-background p-4 md:p-6">
        <div className="max-w-4xl mx-auto">
          {/* Company Info Section (always at top) */}
          {(companyLoading || company) && (
            company ? (
              <Link to={`/jobseeker/company/${company.id}`} tabIndex={-1} className="block group mb-6 focus:outline-none">
                <Card className="border border-border bg-card group-hover:ring-2 group-hover:ring-blue-300 transition-shadow shadow-lg">
                  <CardHeader className="flex flex-row items-center gap-4 py-3 cursor-pointer">
                    {company.logo_url ? (
                      <img src={company.logo_url} alt={company.name} className="h-12 w-12 rounded-full object-cover border" />
                    ) : (
                      <div className="h-12 w-12 rounded-full bg-gray-200 flex items-center justify-center text-2xl font-bold text-gray-500">
                        <Building className="h-7 w-7" />
                      </div>
                    )}
                    <div className="flex-1 min-w-0">
                      <span className="text-lg font-semibold text-blue-700 group-hover:underline">{company.name}</span>
                      <div className="flex flex-wrap gap-2 mt-1">
                        {company.industry && (
                          <Badge variant="secondary" className="text-xs flex items-center gap-1">
                            <Briefcase className="h-3 w-3" /> {company.industry}
                          </Badge>
                        )}
                        {company.city && (
                          <Badge variant="outline" className="text-xs flex items-center gap-1">
                            <MapPin className="h-3 w-3" /> {company.city}{company.state ? `, ${company.state}` : ""}
                          </Badge>
                        )}
                      </div>
                    </div>
                    {company.website_url && (
                      <a href={company.website_url} target="_blank" rel="noopener noreferrer" className="ml-2 text-blue-600 hover:underline text-xs" onClick={e => e.stopPropagation()}>Visit Website</a>
                    )}
                  </CardHeader>
                </Card>
              </Link>
            ) : (
              <div className="block mb-6">
                <Card className="border border-border bg-card transition-shadow shadow-lg">
                  <CardHeader className="flex flex-row items-center gap-4 py-3">
                    <Skeleton className="h-12 w-12 rounded-full" />
                    <div className="flex-1 min-w-0">
                      <Skeleton className="h-6 w-32 mb-1" />
                      <div className="flex flex-wrap gap-2 mt-1">
                        <Skeleton className="h-4 w-20" />
                        <Skeleton className="h-4 w-20" />
                      </div>
                    </div>
                    {/* {company && company.website_url && (
                      <a href={company.website_url} target="_blank" rel="noopener noreferrer" className="ml-2 text-blue-600 hover:underline text-xs" onClick={e => e.stopPropagation()}>Visit Website</a>
                    )} */}
                  </CardHeader>
                </Card>
              </div>
          ))}
          {/* Job Detail Card */}
          <Card className="shadow-xl border border-border/80 bg-card/95">
            <CardHeader className="pb-6 border-b border-border/60 bg-muted/30 rounded-t-lg">
              <div className="space-y-4">
                <CardTitle className="text-3xl font-bold text-foreground">
                  {loading ? (
                    <Skeleton className="h-9 w-3/4" />
                  ) : (
                    job?.job_title || "Job Title"
                  )}
                </CardTitle>
                
                {loading ? (
                  <div className="flex flex-wrap gap-3">
                    <Skeleton className="h-8 w-24 rounded-full" />
                    <Skeleton className="h-8 w-20 rounded-full" />
                    <Skeleton className="h-8 w-28 rounded-full" />
                    <Skeleton className="h-8 w-32 rounded-full" />
                  </div>
                ) : (
                  job && (
                    <div className="flex flex-wrap gap-3">
                      {job.job_location && (
                        <Badge variant="secondary" className="flex items-center gap-1">
                          <MapPin className="h-3 w-3" />
                          {job.job_location}
                        </Badge>
                      )}
                      {job.work_mode && (
                        <Badge variant="outline" className="flex items-center gap-1">
                          <Briefcase className="h-3 w-3" />
                          {job.work_mode}
                        </Badge>
                      )}
                      {job.min_work_experience !== undefined &&
                        job.max_work_experience !== undefined && (
                          <Badge variant="secondary" className="flex items-center gap-1">
                            <Clock className="h-3 w-3" />
                            {job.min_work_experience} - {job.max_work_experience} yrs
                          </Badge>
                        )}
                      {job.min_salary_per_month && job.max_salary_per_month && (
                        <Badge variant="default" className="flex items-center gap-1 bg-green-100 text-green-800 hover:bg-green-200">
                          <DollarSign className="h-3 w-3" />
                          ₹{job.min_salary_per_month.toLocaleString()} - ₹{job.max_salary_per_month.toLocaleString()}/month
                        </Badge>
                      )}
                    </div>
                  )
                )}
              </div>
            </CardHeader>
            
            <CardContent className="space-y-6">
              {error && (
                <div className="p-4 bg-destructive/10 border border-destructive/20 rounded-lg">
                  <p className="text-destructive font-medium">{error}</p>
                </div>
              )}
              
              {loading ? (
                <div className="space-y-6">
                  <div className="space-y-3">
                    <Skeleton className="h-6 w-32" />
                    <Skeleton className="h-24 w-full" />
                  </div>
                  <div className="space-y-3">
                    <Skeleton className="h-6 w-24" />
                    <Skeleton className="h-12 w-full" />
                  </div>
                  <div className="space-y-3">
                    <Skeleton className="h-6 w-28" />
                    <Skeleton className="h-12 w-full" />
                  </div>
                  <div className="space-y-3">
                    <Skeleton className="h-6 w-36" />
                    <Skeleton className="h-12 w-full" />
                  </div>
                  <Skeleton className="h-12 w-full mt-8" />
                </div>
              ) : (
                job && (
                  <div className="space-y-6">
                    {/* Job Role */}
                    {job.job_role && (
                      <>
                        <div className="space-y-3">
                          <div className="flex items-center gap-2">
                            <Briefcase className="h-5 w-5 text-primary" />
                            <h3 className="text-lg font-bold text-foreground tracking-tight uppercase">Job Role</h3>
                          </div>
                          <div className="text-muted-foreground">
                            {job.job_role}
                          </div>
                        </div>
                        <Separator />
                      </>
                    )}

                    {/* Job Description */}
                    <div className="space-y-3">
                      <div className="flex items-center gap-2">
                        <Star className="h-5 w-5 text-primary" />
                        <h3 className="text-lg font-bold text-foreground tracking-tight uppercase">Job Description</h3>
                      </div>
                      <div className="prose prose-sm max-w-none">
                        <p className="text-muted-foreground leading-relaxed whitespace-pre-line">
                          {job.job_description || "No description provided."}
                        </p>
                      </div>
                    </div>
                    
                    <Separator />
                    
                    {/* Location Details */}
                    <div className="space-y-3">
                      <div className="flex items-center gap-2">
                        <MapPin className="h-5 w-5 text-primary" />
                        <h3 className="text-lg font-bold text-foreground tracking-tight uppercase">Location Details</h3>
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {job.job_location && (
                          <div>
                            <span className="text-sm font-medium text-foreground">Location:</span>
                            <p className="text-muted-foreground">{job.job_location}</p>
                          </div>
                        )}
                        {job.job_locality && (
                          <div>
                            <span className="text-sm font-medium text-foreground">Locality:</span>
                            <p className="text-muted-foreground">{job.job_locality}</p>
                          </div>
                        )}
                      </div>
                    </div>
                    
                    <Separator />
                    
                    {/* Skills */}
                    <div className="space-y-3">
                      <div className="flex items-center gap-2">
                        <Briefcase className="h-5 w-5 text-primary" />
                        <h3 className="text-lg font-bold text-foreground tracking-tight uppercase">Required Skills</h3>
                      </div>
                      {renderAsBadges(job.skills, "default", "skills")}
                    </div>
                    
                    <Separator />
                    
                    {/* Qualifications & Education */}
                    <div className="space-y-3">
                      <div className="flex items-center gap-2">
                        <GraduationCap className="h-5 w-5 text-primary" />
                        <h3 className="text-lg font-bold text-foreground tracking-tight uppercase">Qualifications & Education</h3>
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <span className="text-sm font-medium text-foreground">Qualification:</span>
                          <div className="mt-1">
                            {renderAsLines(job.qualification)}
                          </div>
                        </div>
                        <div>
                          <span className="text-sm font-medium text-foreground">Education Degree:</span>
                          <div className="mt-1">
                            {renderAsLines(job.education_degree)}
                          </div>
                        </div>
                      </div>
                    </div>
                    
                    <Separator />
                    
                    {/* Candidate Requirements */}
                    <div className="space-y-3">
                      <div className="flex items-center gap-2">
                        <Users className="h-5 w-5 text-primary" />
                        <h3 className="text-lg font-bold text-foreground tracking-tight uppercase">Candidate Requirements</h3>
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {job.gender_preference && (
                          <div>
                            <span className="text-sm font-medium text-foreground">Gender Preference:</span>
                            <div className="text-muted-foreground">{job.gender_preference}</div>
                          </div>
                        )}
                        <div>
                          <span className="text-sm font-medium text-foreground">Preferred Industry:</span>
                          <div className="mt-1">
                            {renderAsLines(job.candidate_prev_industry)}
                          </div>
                        </div>
                        <div>
                          <span className="text-sm font-medium text-foreground">Languages:</span>
                          <div className="mt-1">
                            {renderAsBadges(job.languages, "outline", "languages")}
                          </div>
                        </div>
                      </div>
                    </div>
                    
                    <Separator />
                    
                    {/* Additional Benefits */}
                    <div className="space-y-3">
                      <div className="flex items-center gap-2">
                        <Star className="h-5 w-5 text-primary" />
                        <h3 className="text-lg font-bold text-foreground tracking-tight uppercase">Additional Benefits</h3>
                      </div>
                      {renderAsLines(job.additional_benefits)}
                    </div>
                    
                    <Separator />
                    
                    {/* Job Posted Date */}
                    {job.posted_at && (
                      <>
                        <div className="space-y-3">
                          <div className="flex items-center gap-2">
                            <Calendar className="h-5 w-5 text-primary" />
                            <h3 className="text-lg font-bold text-foreground tracking-tight uppercase">Posted Date</h3>
                          </div>
                          <div className="text-muted-foreground">
                            {new Date(job.posted_at).toLocaleDateString('en-US', {
                              year: 'numeric',
                              month: 'long',
                              day: 'numeric'
                            })}
                          </div>
                        </div>
                        <Separator />
                      </>
                    )}
                    
                    {/* Apply Button */}
                    <div className="pt-4">
                      <Button
                        onClick={handleApply}
                        disabled={applied}
                        size="lg"
                        className="w-full md:w-auto px-8"
                      >
                        {applied ? (
                          <>
                            <CheckCircle className="h-4 w-4 mr-2" />
                            Applied Successfully
                          </>
                        ) : (
                          "Apply for this Position"
                        )}
                      </Button>
                    </div>
                  </div>
                )
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </JobSeekerLayout>
  );
};

export default JobDetailPage;
