import React, { useEffect, useState, useRef, useContext } from "react";
import { Plus, Trash } from "lucide-react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { companyApi } from "@/services/companyApi";
import CompanyLayout from "@/components/layout/CompanyLayout";
import { AppContext } from "@/context/AppContext";
import { Link } from "react-router-dom";
import { Job } from "@/types/job";
import EditJobModal from "@/components/company/jobs/EditJobModal";

const JobsPage: React.FC = () => {
  const [jobs, setJobs] = useState<Job[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [loading, setLoading] = useState(false);
  const appContext = useContext(AppContext);


  useEffect(() => {
    fetchJobs();
  }, []);

  const fetchJobs = async (search?: string) => {
    setLoading(true);
    try {
      const res = await companyApi.listJobs({
        search,
        company_id: appContext?.company?.id,
      });
      setJobs(res.data || res || []);
    } catch {
      // handle error
    } finally {
      setLoading(false);
    }
  };

  const createJob = async (form: Job) => {
    setLoading(true);
    try {
      await companyApi.createJob({...form, company_id: appContext?.company?.id});
      fetchJobs();
      setShowForm(false);
    } catch (e) {
      // handle error
    } finally {
      setLoading(false);
    }
  };

  return (
    <CompanyLayout>
      <EditJobModal 
        open={showForm} 
        onClose={() => setShowForm(false)} 
        onSave={createJob}        
      />
      <div className="bg-background min-h-screen">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold">Jobs</h1>
          <Button onClick={() => setShowForm(true)}>
            <Plus className="mr-2" />
            Add Job
          </Button>
        </div>
        <Card className="mt-4">
          <CardHeader>
            <CardTitle>Job Listings</CardTitle>
          </CardHeader>
          <CardContent>
            <Input
              placeholder="Search jobs..."
              onChange={async (e) => {
                fetchJobs(e.target.value);
              }}
            />
            <Table className="mt-4">
              <TableHeader>
                <TableRow>
                  <TableHead>Title</TableHead>
                  <TableHead>Role</TableHead>
                  <TableHead>City</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>Experience</TableHead>
                  <TableHead>Salary (₹/mo)</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {jobs.map((job) => (
                  <TableRow>
                    <TableCell>
                      <Link to={`/company/job/${job.id}`} key={job.id} className="text-blue-500 hover:underline">
                          {job.job_title}
                      </Link>
                    </TableCell>
                    <TableCell>{job.job_role}</TableCell>
                    <TableCell>{job.job_location}</TableCell>
                    <TableCell>{job.work_mode}</TableCell>
                    <TableCell>{job.min_work_experience} - {job.max_work_experience} yrs</TableCell>
                    <TableCell>{job.min_salary_per_month} - {job.max_salary_per_month}</TableCell>
                    <TableCell>
                      <Button
                      variant={"ghost"}
                      className="text-destructive"
                        onClick={() => {
                        }}
                      >
                        <Trash />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>
    </CompanyLayout>
  );
};

export default JobsPage;
