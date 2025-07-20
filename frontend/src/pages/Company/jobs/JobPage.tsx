import EditJobModal from "@/components/company/jobs/EditJobModal";
import CompanyLayout from "@/components/layout/CompanyLayout";
import { Button } from "@/components/ui/button";
import { companyApi } from "@/services/companyApi";
import { Job } from "@/types/job";
import { BriefcaseIcon, CalendarIcon, Factory, FileBadge, GraduationCap, GroupIcon, IndianRupee, MapPinIcon, SquarePen, User } from "lucide-react";
import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { toast } from "sonner";
import JobApplicationsSidebar from "@/components/company/jobs/JobApplicationsSidebar";

const JobPage = () => {
    const jobId = useParams().jobId;
    if (!jobId) {
        return <div>Invalid Job</div>;
    }

    const [showForm, setShowForm] = useState(false);
    const [loading, setLoading] = useState(false);
    const [job, setJob] = useState<Job>({});

    useEffect(() => {
        const fetchJobDetails = async () => {
            try {
                const response = await companyApi.getJobById(jobId);
                setJob(response.data);
            } catch (error) {
                toast.error('Failed to fetch job details');
            }
        };
        fetchJobDetails();
    }, []);

    const saveJob = async (form: Job) => {
        setLoading(true);
        try {
            await companyApi.updateJob(jobId, form);
            setJob(form);
            toast.success('Job updated successfully');
        } catch (error) {
            toast.error('Failed to update job');
        } finally {
            setLoading(false);
            setShowForm(false);
        }
    };

    return (
        <CompanyLayout>
            <EditJobModal open={showForm} onClose={()=>{setShowForm(false)}} onSave={saveJob} job={job} />
            <div className="min-h-screen py-2">
                <div className="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-8 mt-8">
                    <div className="md:col-span-2">
                        <div className="rounded-2xl shadow-xl p-8 border border-border bg-card animate-fade-in">
                            <div className="flex items-center gap-4 mb-6">
                                <BriefcaseIcon className="h-8 w-8 text-blue-600" />
                                <h1 className="text-3xl font-bold tracking-tight text-foreground">{job.job_title || "Job Title"}</h1>
                                <Button className="ml-auto" variant={"ghost"} onClick={()=> {setShowForm(true);}}>
                                <SquarePen />
                                </Button>
                            </div>
                            <hr className="mb-6 border-border/60" />
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8 text-muted-foreground">
                                <div className="space-y-3">
                                    <div className="flex items-center gap-2 ">
                                        <GroupIcon className="text-green-500 flex-grow-0 flex-shrink-0" size={20} />
                                         <span className="text-foreground">{job.job_role || "-"}</span>
                                    </div>
                                    <div className="flex items-center gap-2 ">
                                        <CalendarIcon className="text-yellow-500 flex-grow-0 flex-shrink-0" size={20} />
                                        <span className="text-foreground">{job.min_work_experience || 0} - {job.max_work_experience || 0} yrs</span>
                                    </div>
                                    <div className="flex items-center gap-2 ">
                                        <IndianRupee className="text-indigo-500 flex-grow-0 flex-shrink-0" size={20}/>
                                        <span className="text-foreground">₹{job.min_salary_per_month || 0} - ₹{job.max_salary_per_month || 0} /month </span>
                                    </div>
                                    <div className="flex items-center gap-2 ">
                                        <FileBadge className="text-amber-500 flex-grow-0 flex-shrink-0" size={20} /> <span className="text-foreground">{job.education_degree || "-"}</span>
                                    </div>
                                    <div className="flex items-center gap-2 ">
                                        <User className="text-pink-500 text-grow-0 text-shrink-0" size={20}/> <span className="text-foreground">{job.gender_preference || "-"}</span>
                                    </div>
                                </div>
                                <div className="space-y-3">
                                    <div className="flex items-center gap-2 ">
                                        <MapPinIcon className="text-pink-500 flex-grow-0 flex-shrink-0" size={20}/>
                                         <span className="text-foreground">{job.job_location || "-"} {job.job_locality && `(${job.job_locality})`}</span>
                                    </div>
                                    <div className="flex items-center gap-2 ">
                                        <GraduationCap className="text-purple-500 flex-grow-0 flex-shrink-0" size={20}/>
                                         <span className="text-foreground">{job.qualification || "-"}</span>
                                    </div>
                                    <div className="flex items-center gap-2 ">
                                        <BriefcaseIcon className="text-blue-500 flex-grow-0 flex-shrink-0" size={20}/> <span className="text-foreground">{job.work_mode || "-"}</span>
                                    </div>
                                    <div className="flex items-center gap-2 ">
                                        <Factory className="text-slate-500 flex-grow-0 flex-shrink-0" size={20}/><span className="font-semibold text-foreground">Prev. Industry:</span> <span className="text-foreground">{job.candidate_prev_industry || "-"}</span>
                                    </div>
                                </div>
                            </div>
                            <div className="flex items-center gap-2 bg-muted/40 p-2 rounded-md mb-2">
                                <span className="font-semibold text-foreground uppercase tracking-wide">Skills:</span>
                                {job.skills ? (
                                    job.skills.split(",").map((skill: string, idx: number) => (
                                        <span key={idx} className="inline-block text-xs font-medium px-2 py-0.5 rounded bg-blue-200 text-blue-900 dark:bg-blue-900 dark:text-blue-200 shadow-sm">{skill}</span>
                                    ))
                                ) : (
                                    <span className="text-muted-foreground">-</span>
                                )}
                            </div>
                            <hr className="my-8 border-border/60" />
                            <div className="flex items-center gap-2 bg-muted/40 p-2 rounded-md mb-2">
                                <span className="font-semibold text-foreground uppercase tracking-wide">Languages:</span>
                                {job.languages ? (
                                    job.languages.split(",").map((lang: string, idx: number) => (
                                        <span key={idx} className="inline-block text-xs font-medium px-2 py-0.5 rounded bg-purple-200 text-purple-900 dark:bg-purple-900 dark:text-purple-200 shadow-sm">{lang}</span>
                                    ))
                                ) : (
                                    <span className="text-muted-foreground">-</span>
                                )}
                            </div>
                            <hr className="my-8 border-border/60" />
                            <div className="mb-6">
                                <h2 className="text-xl font-bold mb-2 text-foreground uppercase tracking-tight">Job Description</h2>
                                <p className="text-muted-foreground">{job.job_description || "No description provided."}</p>
                            </div>
                            <hr className="my-8 border-border/60" />
                            <div className="flex items-center gap-2 mb-2">
                                <span className="font-semibold text-foreground uppercase tracking-wide">Benefits:</span>
                                <span className="text-muted-foreground">{job.additional_benefits ? job.additional_benefits : "-"}</span>
                            </div>
                            <div className="text-right text-sm text-muted-foreground">
                                Posted on: {job.posted_at ? new Date(job.posted_at).toLocaleDateString() : "-"}
                            </div>
                        </div>
                    </div>
                    <div>
                        <JobApplicationsSidebar jobId={jobId} />
                    </div>
                </div>
            </div>
        </CompanyLayout>
    );
}

export default JobPage;