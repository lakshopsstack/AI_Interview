import React, { useEffect, useState } from "react";
import { Input } from "@/components/ui/input";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { jobSeekerApi } from "@/services/jobSeekerApi";
import { Job } from "@/types/job";
import JobSeekerLayout from "@/components/layout/JobSeekerLayout";
import { MapPin, Briefcase, SlidersHorizontal, IndianRupee, RefreshCcw } from "lucide-react";
import { Slider } from "@/components/ui/slider";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

const JobSearchPage: React.FC = () => {
  const [jobs, setJobs] = useState<Job[]>([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(false);
  const [page, setPage] = useState(0);
  const [hasMore, setHasMore] = useState(true);
  const [location, setLocation] = useState("");
  const [workMode, setWorkMode] = useState("");
  const [expRange, setExpRange] = useState<[number, number]>([0, 20]);
  const [salaryRange, setSalaryRange] = useState<[number, number]>([0, 200000]);

  useEffect(() => {
    fetchJobs(search, 0);
  }, []);

  const fetchJobs = async (query = "", pageNum = 0) => {
    setLoading(true);
    try {
      const res = await jobSeekerApi.listJobs(
        query,
        pageNum * 20,
        20,
        location,
        workMode,
        expRange[0],
        expRange[1],
        salaryRange[0],
        salaryRange[1]
      );
      setJobs(res.jobs || []);
      setHasMore((res.jobs?.length || 0) === 20);
      setPage(pageNum);
    } catch {
      setJobs([]);
      setHasMore(false);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearch(e.target.value);
    fetchJobs(e.target.value, 0);
  };

  const handlePrev = () => {
    if (page > 0) fetchJobs(search, page - 1);
  };

  const handleNext = () => {
    if (hasMore) fetchJobs(search, page + 1);
  };

  useEffect(() => {
    fetchJobs(search, 0);
    // eslint-disable-next-line
  }, [location, workMode, expRange, salaryRange]);

  return (
    <JobSeekerLayout>
      <div className="bg-background min-h-screen p-4">
        <Card>
          <CardHeader>
            <CardTitle>Find Your Next Job</CardTitle>
          </CardHeader>
          <CardContent>
            <Card className="mb-6 p-4 bg-background shadow border">
              <div className="flex items-center gap-4 flex-wrap">
                <div className="flex flex-col">
                  <label className="text-xs font-semibold mb-1 flex items-center gap-1">
                    <MapPin size={14} /> Location
                  </label>
                  <Input
                    type="text"
                    placeholder="e.g. Mumbai"
                    value={location}
                    onChange={e => setLocation(e.target.value)}
                    className="min-w-[120px]"
                  />
                </div>
                <div className="flex flex-col">
                  <label className="text-xs font-semibold mb-1 flex items-center gap-1">
                    <Briefcase size={14} /> Work Mode
                  </label>
                  <Select value={workMode} onValueChange={setWorkMode}>
                    <SelectTrigger className="min-w-[120px]">
                      <SelectValue placeholder="All" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Remote">Remote</SelectItem>
                      <SelectItem value="On-site">On-site</SelectItem>
                      <SelectItem value="Hybrid">Hybrid</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="flex flex-col min-w-[180px]">
                  <label className="text-xs font-semibold mb-1 flex items-center gap-1">
                    <SlidersHorizontal size={14} /> Experience (yrs)
                  </label>
                  <Slider
                    min={0}
                    max={20}
                    step={1}
                    value={expRange}
                    onValueChange={val => setExpRange([val[0], val[1]])}
                    className="w-40"
                  />
                  <div className="flex justify-between text-xs mt-1">
                    <span>{expRange[0]}</span>
                    <span>{expRange[1]}</span>
                  </div>
                </div>
                <div className="flex flex-col min-w-[200px]">
                  <label className="text-xs font-semibold mb-1 flex items-center gap-1">
                    <IndianRupee size={14} /> Salary (₹/mo)
                  </label>
                  <Slider
                    min={0}
                    max={200000}
                    step={1000}
                    value={salaryRange}
                    onValueChange={val => setSalaryRange([val[0], val[1]])}
                    className="w-48"
                  />
                  <div className="flex justify-between text-xs mt-1">
                    <span>{salaryRange[0]}</span>
                    <span>{salaryRange[1]}</span>
                  </div>
                </div>
                <Button
                  type="button"
                  variant="outline"
                  className="ml-auto flex items-center gap-1 px-3 py-2 text-xs font-semibold"
                  onClick={() => {
                    setLocation("");
                    setWorkMode("");
                    setExpRange([0, 20]);
                    setSalaryRange([0, 200000]);
                  }}
                >
                  <RefreshCcw size={14} /> Clear Filters
                </Button>
              </div>
            </Card>
            <Input
              placeholder="Search jobs by title, company, or location..."
              value={search}
              onChange={handleSearch}
              className="mb-4"
            />
            {loading ? (
              <div className="text-center py-8">Loading...</div>
            ) : jobs.length === 0 ? (
              <div className="text-center py-8">No jobs found.</div>
            ) : (
              <div className="flex flex-col gap-6">
                {jobs.map((job) => (
                  <Link
                    to={`/jobseeker/job/${job.id}`}
                    key={job.id}
                    className="block group"
                    style={{ textDecoration: 'none' }}
                  >
                    <Card className="border shadow-lg flex flex-col sm:flex-row items-stretch hover:shadow-xl transition-shadow duration-200 bg-background group-hover:ring-2 group-hover:ring-blue-400 cursor-pointer">
                      <div className="w-full sm:w-2 bg-blue-500 rounded-t-md sm:rounded-l-md sm:rounded-tr-none h-2 sm:h-auto" />
                      <div className="flex flex-col justify-between flex-1 p-6">
                        <div>
                          <CardTitle className="text-xl font-semibold mb-1 text-blue-700 group-hover:underline">
                            {job.job_title}
                          </CardTitle>
                          <div className="flex flex-wrap gap-x-4 gap-y-2 mb-2">
                            <span className="inline-flex items-center text-xs font-bold bg-blue-200 text-blue-900 px-3 py-1 rounded-full shadow-sm">
                              <svg className="w-4 h-4 mr-1 text-blue-600" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M17.657 16.657L13.414 12.414a4 4 0 10-1.414 1.414l4.243 4.243a1 1 0 001.414-1.414z" /></svg>
                              {job.job_location || 'Location N/A'}
                            </span>
                            <span className="inline-flex items-center text-xs font-bold bg-green-200 text-green-900 px-3 py-1 rounded-full shadow-sm">
                              <svg className="w-4 h-4 mr-1 text-green-600" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M9 17v-2a4 4 0 014-4h4" /></svg>
                              {job.work_mode || 'Type N/A'}
                            </span>
                            <span className="inline-flex items-center text-xs font-bold bg-yellow-200 text-yellow-900 px-3 py-1 rounded-full shadow-sm">
                              <svg className="w-4 h-4 mr-1 text-yellow-600" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4l3 3" /></svg>
                              {job.min_work_experience} - {job.max_work_experience} yrs
                            </span>
                            <span className="inline-flex items-center text-xs font-bold bg-purple-200 text-purple-900 px-3 py-1 rounded-full shadow-sm">
                              <svg className="w-4 h-4 mr-1 text-purple-600" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M12 8c-2.21 0-4 1.79-4 4s1.79 4 4 4 4-1.79 4-4-1.79-4-4-4z" /></svg>
                              ₹{job.min_salary_per_month} - {job.max_salary_per_month}
                            </span>
                          </div>
                          {job.job_description && (
                            <div className="text-white text-sm mt-2 font-medium line-clamp-2 bg-black/40 rounded px-2 py-1">
                              {job.job_description}
                            </div>
                          )}
                        </div>
                      </div>
                    </Card>
                  </Link>
                ))}
              </div>
            )}
            <div className="flex justify-between mt-8">
              <Button onClick={handlePrev} disabled={page === 0 || loading} variant="outline">Previous</Button>
              <Button onClick={handleNext} disabled={!hasMore || loading} variant="outline">Next</Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </JobSeekerLayout>
  );
};

export default JobSearchPage;
