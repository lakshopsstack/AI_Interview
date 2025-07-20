import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import DashboardLayout from "@/components/layout/CompanyLayout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  ArrowLeft,
  Edit,
  Trash2,
  Users,
  Clock,
  CheckCircle,
  XCircle,
  Copy,
  Mail,
  Phone,
  MapPin,
  GraduationCap,
  Briefcase,
  Link as LinkIcon,
  X,
  Trash,
} from "lucide-react";
import { toast } from "sonner";
import LoadingSpinner from "@/components/common/LoadingSpinner";
import { AiInterviewedJobData } from "@/types/aiInterviewedJob";
import { InterviewData } from "@/types/interview";
import { companyApi } from "@/services/companyApi";
import { interviewApi } from "@/services/interviewApi";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import DsaManagement from "@/components/company/aiInterviewedJobs/DsaManagement";
import McqManagement from "@/components/company/aiInterviewedJobs/McqManagement";
import InterviewQuestionManagement from "@/components/company/aiInterviewedJobs/InterviewQuestionManagement";
import InvitedCandidatesList from "@/components/jobs/InvitedCandidateList";

const JobDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [job, setJob] = useState<AiInterviewedJobData | null>(null);
  const [interviews, setInterviews] = useState<InterviewData[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("overview");
  const [isEditMode, setIsEditMode] = useState(false);
  const [inviteOpen, setInviteOpen] = useState(false);
  const [inviteList, setInviteList] = useState([{ email: "", firstname: "", lastname: "" }]);
  const [inviteLoading, setInviteLoading] = useState(false);
  const [inviteResults, setInviteResults] = useState<any[]>([]);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState<{ open: boolean; interviewId?: number }>({ open: false });

  useEffect(() => {
    fetchJobDetails();
    fetchInterviews();
  }, [id]);

  const fetchJobDetails = async () => {
    try {
      if (!id) {
        toast.error("Job ID is required");
        return;
      }
      const response = await companyApi.getAiInterviewedJobById(id);
      const data = response.data;
      setJob({
        id: data.id,
        title: data.title,
        description: data.description,
        department: data.department,
        city: data.city || "",
        location: data.location,
        type: data.type,
        min_experience: data.min_experience || 0,
        max_experience: data.max_experience || 0,
        salary_min: data.salary_min,
        salary_max: data.salary_max,
        currency: data.currency || "USD",
        show_salary: data.show_salary || false,
        requirements: data.requirements,
        benefits: data.benefits,
        status: data.status,
        createdAt: data.created_at,
        requires_dsa: data.requires_dsa || false,
        requires_mcq: data.requires_mcq || false,
        dsa_questions: data.dsa_questions || [],
        mcq_questions: data.mcq_questions || [],
        custom_interview_questions: data.custom_interview_questions || [],
        quiz_time_minutes: data.quiz_time_minutes,
        mcq_timing_mode: data.mcq_timing_mode,
        company_id: data.company_id,
        updated_at: data.updated_at,
        hasQuiz: data.hasQuiz,
        hasDSATest: data.hasDSATest,
      });
    } catch (error: any) {
      toast.error("Failed to fetch job details");
    } finally {
      setLoading(false);
    }
  };

  const fetchInterviews = async () => {
    if (!id) return;
    try {
      // Use correct param name for backend filtering
      const response = await interviewApi.getInterviews({ ai_interviewed_job_id: id });
      let data = response.data;
      // Ensure interviews is always an array
      if (!Array.isArray(data)) {
        if (data && Array.isArray(data.interviews)) {
          data = data.interviews;
        } else {
          data = [];
        }
      }
      setInterviews(data);
    } catch (error: any) {
      toast.error("Failed to fetch interviews");
    }
  };

  const handleDelete = async () => {
    if (!job || !job.id) return;

    if (window.confirm("Are you sure you want to delete this job?")) {
      try {
        await companyApi.deleteAiInterviewedJob(job.id.toString());
        toast.success("Job deleted successfully");
        navigate("/company/ai-interviewed-jobs");
      } catch (error) {
        toast.error("Failed to delete job");
      }
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "active":
        return (
          <Badge variant="outline" className="bg-success/10 text-success">
            <CheckCircle className="h-3 w-3 mr-1" /> Active
          </Badge>
        );
      case "draft":
        return (
          <Badge variant="outline" className="bg-muted text-muted-foreground">
            <Clock className="h-3 w-3 mr-1" /> Draft
          </Badge>
        );
      case "closed":
        return (
          <Badge
            variant="outline"
            className="bg-destructive/10 text-destructive"
          >
            <XCircle className="h-3 w-3 mr-1" /> Closed
          </Badge>
        );
      default:
        return null;
    }
  };

  const handleEditModeToggle = () => {
    setIsEditMode(!isEditMode);
  };

  const handleSaveJob = async () => {
    if (!job || !job.id) return;

    try {
      setLoading(true);
      await companyApi.updateAiInterviewedJob(job.id.toString(), job);
      toast.success("Job details updated successfully");
      fetchJobDetails();
      setIsEditMode(false);
    } catch (error) {
      toast.error("Failed to update job details");
    } finally {
      setLoading(false);
    }
  };

  const handleInviteChange = (idx: number, field: string, value: string) => {
    setInviteList((prev) => prev.map((c, i) => (i === idx ? { ...c, [field]: value } : c)));
  };

  const addInviteRow = () => setInviteList((prev) => [...prev, { email: "", firstname: "", lastname: "" }]);

  const removeInviteRow = (idx: number) => setInviteList((prev) => prev.filter((_, i) => i !== idx));

  const handleInviteSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setInviteLoading(true);
    setInviteResults([]);
    try {
      const filtered = inviteList.filter((c) => c.email.trim());
      if (!filtered.length) {
        toast.error("Please enter at least one candidate email.");
        setInviteLoading(false);
        return;
      }
      if (!job?.id) {
        toast.error("Job ID is missing.");
        setInviteLoading(false);
        return;
      }
      const res = await companyApi.inviteCandidates(job.id, filtered);
      setInviteResults(res.data.results);
      toast.success("Invitations sent!");
    } catch (err: any) {
      toast.error(err?.response?.data?.detail || "Failed to send invitations");
    } finally {
      setInviteLoading(false);
    }
  };

  const handleDeleteInterview = async () => {
    if (!deleteDialogOpen.interviewId) return;
    try {
      await interviewApi.deleteInterview(deleteDialogOpen.interviewId.toString());
      toast.success("Interview deleted successfully");
      setDeleteDialogOpen({ open: false });
      fetchInterviews();
    } catch (error) {
      toast.error("Failed to delete interview");
    }
  };

  if (loading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center h-[calc(100vh-4rem)]">
          <LoadingSpinner />
        </div>
      </DashboardLayout>
    );
  }

  if (!job) {
    return (
      <DashboardLayout>
        <div className="container mx-auto px-4 py-8">
          <Card>
            <CardContent className="p-6">
              <p className="text-muted-foreground mb-4">Job not found</p>
              <Button onClick={() => navigate("/company/ai-interviewed-jobs")}>
                Return to Jobs
              </Button>
            </CardContent>
          </Card>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="container mx-auto px-4 py-8">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6">
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="icon"
              onClick={() => navigate("/company/ai-interviewed-jobs")}
            >
              <ArrowLeft className="h-4 w-4" />
            </Button>
          </div>
          <div className="flex flex-wrap gap-2">
            <Button
              variant="outline"
              className="text-destructive"
              onClick={handleDelete}
            >
              <Trash2 className="h-4 w-4 mr-2" />
              Delete
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
          <Card className="md:col-span-3">
            <CardHeader>
              <CardTitle className="flex gap-2 items-center">
                <div>{job.title}</div>
                <div className="ml-auto">
                  {getStatusBadge(job.status || "")}
                </div>
              </CardTitle>
              <div className="flex items-center justify-between">
                <p className="text-muted-foreground">
                  {job.department} • {job.location}
                </p>
              </div>
            </CardHeader>
            <CardContent>
              <Tabs value={activeTab} onValueChange={setActiveTab}>
                <TabsList>
                  <TabsTrigger value="overview">Overview</TabsTrigger>
                  <TabsTrigger value="candidates">Candidates</TabsTrigger>
                  <TabsTrigger value="invited_candidates">Invited Candidates</TabsTrigger>
                  <TabsTrigger value="dsa">DSA Questions</TabsTrigger>
                  <TabsTrigger value="mcq">MCQ Questions</TabsTrigger>
                  <TabsTrigger value="custom_interview_questions">
                    Interview Questions
                  </TabsTrigger>
                </TabsList>
                <TabsContent value="overview" className="space-y-6">
                  <div>
                    <div className="flex items-center">
                      {isEditMode ? (
                        <Input
                          value={job.title}
                          onChange={(e) =>
                            setJob((prev) => ({ ...prev, title: e.target.value }))
                          }
                        />
                      ) : (
                        <div>{job.title}</div>
                      )}
                      <div className="ml-auto">
                        {isEditMode ? (
                          <Input
                            value={job.status}
                            onChange={(e) =>
                              setJob((prev) => ({ ...prev, status: e.target.value }))
                            }
                          />
                        ) : (
                          getStatusBadge(job.status || "")
                        )}
                      </div>
                      {!isEditMode && (
                        <Button
                          onClick={handleEditModeToggle}
                          variant={"ghost"}
                        >
                          <Edit />
                        </Button>
                      )}
                      {isEditMode && (
                        <Button
                          onClick={handleEditModeToggle}
                          variant={"ghost"}
                          className="text-destructive"
                        >
                          <X strokeWidth={5} />
                        </Button>
                      )}
                    </div>
                    <div className="flex items-center justify-between">
                      {isEditMode ? (
                        <>
                          <Input
                            value={job.department}
                            onChange={(e) =>
                              setJob((prev) => ({ ...prev, department: e.target.value }))
                            }
                          />
                          <Input
                            value={job.location}
                            onChange={(e) =>
                              setJob((prev) => ({ ...prev, location: e.target.value }))
                            }
                          />
                        </>
                      ) : (
                        <p className="text-muted-foreground">
                          {job.department} | {job.location}
                        </p>
                      )}
                    </div>
                  </div>
                  <div className="space-y-4">
                    <h3 className="font-medium">Job Description</h3>
                    {isEditMode ? (
                      <Textarea
                        value={job.description}
                        onChange={(e) =>
                          setJob((prev) => ({ ...prev, description: e.target.value }))
                        }
                      />
                    ) : (
                      <p className="text-muted-foreground whitespace-pre-wrap">
                        {job.description}
                      </p>
                    )}
                  </div>
                  {job.show_salary && job.salary_min && job.salary_max && (
                    <div className="space-y-4">
                      <h3 className="font-medium">Salary Range</h3>
                      {isEditMode ? (
                        <Input
                          value={job.currency}
                          onChange={(e) =>
                            setJob((prev) => ({ ...prev, currency: e.target.value }))
                          }
                        />
                      ) : (
                        <p className="text-muted-foreground">
                          {job.salary_min.toLocaleString()} -
                          {job.salary_max.toLocaleString()} {job.currency}
                        </p>
                      )}
                    </div>
                  )}
                  <div className="space-y-4">
                    <h3 className="font-medium">Requirements</h3>
                    {isEditMode ? (
                      <Textarea
                        value={job.requirements}
                        onChange={(e) =>
                          setJob((prev) => ({ ...prev, requirements: e.target.value }))
                        }
                      />
                    ) : (
                      <p className="text-muted-foreground whitespace-pre-wrap">
                        {job.requirements}
                      </p>
                    )}
                  </div>
                  <div className="space-y-4">
                    <h3 className="font-medium">Benefits</h3>
                    {isEditMode ? (
                      <Textarea
                        value={job.benefits}
                        onChange={(e) =>
                          setJob((prev) => ({ ...prev, benefits: e.target.value }))
                        }
                      />
                    ) : (
                      <p className="text-muted-foreground whitespace-pre-wrap">
                        {job.benefits}
                      </p>
                    )}
                  </div>
                  {isEditMode && (
                    <Button
                      onClick={handleSaveJob}
                      className="w-full"
                      size={"sm"}
                    >
                      Save
                    </Button>
                  )}
                </TabsContent>
                <TabsContent value="candidates">
                  <div className="space-y-4">
                    {interviews.length === 0 ? (
                      <div className="text-center py-8">
                        <Users className="h-8 w-8 mx-auto mb-2 text-muted-foreground" />
                        <p className="text-muted-foreground">
                          No candidates yet
                        </p>
                      </div>
                    ) : (
                      interviews.map((interview) => (
                        <Card key={interview.id}>
                          <CardContent className="p-6">
                            <div className="space-y-4">
                              <div className="flex items-start">
                                <div>
                                  <h3 className="text-lg font-semibold">
                                    {interview.firstname}{" "}
                                    {interview.lastname}
                                  </h3>
                                  <div className="flex items-center gap-2 text-sm text-muted-foreground mt-1">
                                    <Mail className="h-4 w-4" />
                                    {interview.email}
                                  </div>
                                </div>
                                <Badge variant="outline" className="">
                                  {interview.status}
                                </Badge>
                                <Button
                                  onClick={() =>
                                    setDeleteDialogOpen({ open: true, interviewId: interview.id })
                                  }
                                  variant={"destructive"}
                                  className="ml-auto"
                                >
                                  <Trash />
                                </Button>
                                <Dialog open={deleteDialogOpen.open} onOpenChange={open => setDeleteDialogOpen({ open, interviewId: open ? deleteDialogOpen.interviewId : undefined })}>
                                  <DialogContent>
                                    <DialogHeader>
                                      <DialogTitle>Delete Interview</DialogTitle>
                                    </DialogHeader>
                                    <div>Are you sure you want to delete this interview?</div>
                                    <div className="flex justify-end gap-2 mt-4">
                                      <Button variant="outline" onClick={() => setDeleteDialogOpen({ open: false })}>Cancel</Button>
                                      <Button variant="destructive" onClick={handleDeleteInterview}>Delete</Button>
                                    </div>
                                  </DialogContent>
                                </Dialog>
                              </div>

                              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div className="space-y-2">
                                  <div className="flex items-center gap-2 text-sm">
                                    <Phone className="h-4 w-4 text-muted-foreground" />
                                    {interview.phone}
                                  </div>
                                  <div className="flex items-center gap-2 text-sm">
                                    <MapPin className="h-4 w-4 text-muted-foreground" />
                                    {interview.city}
                                  </div>
                                  <div className="flex items-center gap-2 text-sm">
                                    <GraduationCap className="h-4 w-4 text-muted-foreground" />
                                    {interview.education}
                                  </div>
                                  <div className="flex items-center gap-2 text-sm">
                                    <Briefcase className="h-4 w-4 text-muted-foreground" />
                                    {interview.work_experience_yrs
                                      ? `${interview.work_experience_yrs} years experience`
                                      : "Experience not specified"}
                                  </div>
                                </div>

                                <div className="space-y-2">
                                  {interview.linkedin_url && (
                                    <div className="flex items-center gap-2 text-sm">
                                      <LinkIcon className="h-4 w-4 text-muted-foreground" />
                                      <a
                                        href={interview.linkedin_url}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="text-primary hover:underline"
                                      >
                                        LinkedIn Profile
                                      </a>
                                    </div>
                                  )}
                                  {interview.portfolio_url && (
                                    <div className="flex items-center gap-2 text-sm">
                                      <LinkIcon className="h-4 w-4 text-muted-foreground" />
                                      <a
                                        href={interview.portfolio_url}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="text-primary hover:underline"
                                      >
                                        Portfolio
                                      </a>
                                    </div>
                                  )}
                                </div>
                              </div>

                              {interview.resume_match_score != undefined && (
                                <div className="mt-4">
                                  <h4 className="font-medium mb-2">
                                    Resume Match Score
                                  </h4>
                                  <div className="flex items-center gap-2">
                                    <div className="w-full bg-muted rounded-full h-2">
                                      <div
                                        className="bg-primary h-2 rounded-full"
                                        style={{
                                          width: `${interview.resume_match_score}%`,
                                        }}
                                      />
                                    </div>
                                    <span className="text-sm font-medium">
                                      {interview.resume_match_score}%
                                    </span>
                                  </div>
                                  {interview.resume_match_feedback && (
                                    <p className="text-sm text-muted-foreground mt-2">
                                      {interview.resume_match_feedback}
                                    </p>
                                  )}
                                </div>
                              )}

                              {interview.overall_score != undefined && (
                                <div className="mt-4">
                                  <h4 className="font-medium mb-2">
                                    Interview Score
                                  </h4>
                                  <div className="flex items-center gap-2">
                                    <div className="w-full bg-muted rounded-full h-2">
                                      <div
                                        className="bg-primary h-2 rounded-full"
                                        style={{
                                          width: `${interview.overall_score}%`,
                                        }}
                                      />
                                    </div>
                                    <span className="text-sm font-medium">
                                      Score: {interview.overall_score}%
                                    </span>
                                  </div>
                                  {interview.feedback && (
                                    <p className="text-sm text-muted-foreground mt-2">
                                      {interview.feedback}
                                    </p>
                                  )}
                                </div>
                              )}
                            </div>
                          </CardContent>
                        </Card>
                      ))
                    )}
                  </div>
                </TabsContent>
                <TabsContent value="invited_candidates">
                  {job.id && <InvitedCandidatesList jobId={job.id.toString()} />}
                </TabsContent>
                <TabsContent value="dsa">
                  {job.id && <DsaManagement jobId={job.id} />}
                </TabsContent>
                <TabsContent value="mcq">
                  {job.id && <McqManagement jobId={job.id} />}
                </TabsContent>
                <TabsContent value="custom_interview_questions">
                  {job.id && <InterviewQuestionManagement jobId={job.id} />}
                </TabsContent>
              </Tabs>
            </CardContent>
          </Card>
        </div>

        <Dialog open={deleteDialogOpen.open} onOpenChange={() => setDeleteDialogOpen({ open: false })}>
          <DialogContent className="bg-background rounded-lg p-0 max-w-sm w-full">
            <DialogHeader>
              <DialogTitle>Confirm Interview Deletion</DialogTitle>
            </DialogHeader>
            <div className="p-4">
              <p className="text-sm text-muted-foreground mb-4">
                Are you sure you want to delete this interview? This action cannot be undone.
              </p>
              <div className="flex justify-end gap-2">
                <Button
                  variant="outline"
                  onClick={() => setDeleteDialogOpen({ open: false })}
                >
                  Cancel
                </Button>
                <Button
                  variant="destructive"
                  onClick={handleDeleteInterview}
                >
                  Delete Interview
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </DashboardLayout>
  );
};

export default JobDetail;