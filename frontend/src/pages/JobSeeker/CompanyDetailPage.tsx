import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { MapPin, Briefcase, Globe, Building, Calendar, Users, Star } from "lucide-react";
import { companyApi } from "@/services/companyApi";
import { CompanyPublicData } from "@/types/company";
import { Job } from "@/types/job";
import { jobSeekerApi } from "@/services/jobSeekerApi";
import { Link } from "react-router-dom";
import JobSeekerLayout from "@/components/layout/JobSeekerLayout";

const CompanyDetailPage: React.FC = () => {
  const { companyId } = useParams<{ companyId: string }>();
  const [company, setCompany] = useState<CompanyPublicData | null>(null);
  const [loading, setLoading] = useState(true);
  const [jobs, setJobs] = useState<Job[]>([]);
  const [jobsLoading, setJobsLoading] = useState(false);

  useEffect(() => {
    const fetchCompany = async () => {
      setLoading(true);
      try {
        const res = await jobSeekerApi.getCompanyById(companyId!);
        setCompany(res);
      } catch {
        setCompany(null);
      } finally {
        setLoading(false);
      }
    };
    if (companyId) fetchCompany();
  }, [companyId]);

  useEffect(() => {
    const fetchJobs = async () => {
      if (!companyId) return;
      setJobsLoading(true);
      try {
        const res = await jobSeekerApi.listJobs(undefined, 0, 20, undefined, undefined, undefined, undefined, undefined, undefined, companyId);
        setJobs(res.jobs || []);
      } catch {
        setJobs([]);
      } finally {
        setJobsLoading(false);
      }
    };
    fetchJobs();
  }, [companyId]);

  return (
    <JobSeekerLayout>
      <div className="min-h-screen bg-background p-4 md:p-6">
        <div className="max-w-3xl mx-auto">
          {/* Banner */}
          {company?.bannerUrl ? (
            <div className="mb-4">
              <img src={company.bannerUrl} alt="Company Banner" className="w-full h-40 object-cover rounded-lg" />
            </div>
          ) : (
            <div className="mb-4 w-full h-40 rounded-lg bg-gradient-to-r from-blue-100 via-purple-100 to-pink-100 flex items-center justify-center border border-dashed border-blue-200">
              <span className="text-blue-400 text-lg font-semibold opacity-60">No Banner Available</span>
            </div>
          )}
          <Card className="shadow-lg border-0 mb-6">
            <CardHeader className="flex flex-row items-center gap-4 py-6">
              {loading ? (
                <Skeleton className="h-16 w-16 rounded-full" />
              ) : company?.companyLogo ? (
                <img src={company.companyLogo} alt={company.name} className="h-16 w-16 rounded-full object-cover border" />
              ) : (
                <div className="h-16 w-16 rounded-full bg-gray-200 flex items-center justify-center text-3xl font-bold text-gray-500">
                  <Building className="h-9 w-9" />
                </div>
              )}
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <div className="text-2xl font-bold text-blue-800">{company?.name}</div>
                  {company?.verified && <Badge variant="default" className="bg-green-100 text-green-800 ml-2">Verified</Badge>}
                </div>
                {company?.tagline && <div className="text-sm text-muted-foreground mb-1 italic">{company.tagline}</div>}
                <div className="flex flex-wrap gap-2">
                  {company?.industry && (
                    <Badge variant="secondary" className="text-xs flex items-center gap-1">
                      <Briefcase className="h-3 w-3" /> {company.industry}
                    </Badge>
                  )}
                  {company?.city && (
                    <Badge variant="outline" className="text-xs flex items-center gap-1">
                      <MapPin className="h-3 w-3" /> {company.city}{company.state ? `, ${company.state}` : ""}
                    </Badge>
                  )}
                  {company?.foundationYear && (
                    <Badge variant="outline" className="text-xs flex items-center gap-1">
                      <Calendar className="h-3 w-3" /> Est. {company.foundationYear}
                    </Badge>
                  )}
                  {company?.minCompanySize && company?.maxCompanySize && (
                    <Badge variant="outline" className="text-xs flex items-center gap-1">
                      <Users className="h-3 w-3" /> {company.minCompanySize} - {company.maxCompanySize} employees
                    </Badge>
                  )}
                  {company?.rating !== undefined && company?.ratingsCount !== undefined && company.ratingsCount > 0 && (
                    <Badge variant="outline" className="text-xs flex items-center gap-1">
                      <Star className="h-3 w-3 text-yellow-500" /> {company.rating}/5 ({company.ratingsCount})
                    </Badge>
                  )}
                </div>
              </div>
              {company?.website_url && (
                <a href={company.website_url} target="_blank" rel="noopener noreferrer" className="ml-2 text-blue-600 hover:underline text-xs flex items-center gap-1">
                  <Globe className="h-3 w-3" /> Website
                </a>
              )}
            </CardHeader>
            <CardContent>
              {/* About Us, Poster, and all other fields */}
              {company?.aboutUs && (
                <div className="mb-2">
                  <div className="font-semibold mb-1">About Us</div>
                  <div className="text-muted-foreground whitespace-pre-line">{company.aboutUs}</div>
                </div>
              )}
              {company?.aboutUsPosterUrl && (
                <div className="mb-2">
                  <img src={company.aboutUsPosterUrl} alt="About Us Poster" className="w-full h-32 object-cover rounded" />
                </div>
              )}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-2">
                {company?.address && (
                  <div>
                    <div className="font-semibold text-xs">Address</div>
                    <div className="text-muted-foreground text-xs">{company.address}</div>
                  </div>
                )}
                {company?.zip && (
                  <div>
                    <div className="font-semibold text-xs">Zip Code</div>
                    <div className="text-muted-foreground text-xs">{company.zip}</div>
                  </div>
                )}
                {company?.country && (
                  <div>
                    <div className="font-semibold text-xs">Country</div>
                    <div className="text-muted-foreground text-xs">{company.country}</div>
                  </div>
                )}
                {company?.state && (
                  <div>
                    <div className="font-semibold text-xs">State</div>
                    <div className="text-muted-foreground text-xs">{company.state}</div>
                  </div>
                )}
                {company?.city && (
                  <div>
                    <div className="font-semibold text-xs">City</div>
                    <div className="text-muted-foreground text-xs">{company.city}</div>
                  </div>
                )}
                {company?.email && (
                  <div>
                    <div className="font-semibold text-xs">Email</div>
                    <div className="text-muted-foreground text-xs">{company.email}</div>
                  </div>
                )}
                {company?.phone && (
                  <div>
                    <div className="font-semibold text-xs">Phone</div>
                    <div className="text-muted-foreground text-xs">{company.phone}</div>
                  </div>
                )}
                {company?.minCompanySize && company?.maxCompanySize && (
                  <div>
                    <div className="font-semibold text-xs">Company Size</div>
                    <div className="text-muted-foreground text-xs">{company.minCompanySize} - {company.maxCompanySize} employees</div>
                  </div>
                )}
                {company?.foundationYear && (
                  <div>
                    <div className="font-semibold text-xs">Foundation Year</div>
                    <div className="text-muted-foreground text-xs">{company.foundationYear}</div>
                  </div>
                )}
                {company?.rating !== undefined && company?.ratingsCount !== undefined && (
                  <div>
                    <div className="font-semibold text-xs">Rating</div>
                    <div className="text-muted-foreground text-xs">{company.rating}/5 ({company.ratingsCount})</div>
                  </div>
                )}
                {company?.tags && (
                  <div>
                    <div className="font-semibold text-xs">Tags</div>
                    <div className="flex flex-wrap gap-1 mt-1">
                      {company.tags.split(',').map((tag, idx) => (
                        <Badge key={idx} variant="outline" className="text-xs">{tag.trim()}</Badge>
                      ))}
                    </div>
                  </div>
                )}
                {company?.createdAt && (
                  <div>
                    <div className="font-semibold text-xs">Created At</div>
                    <div className="text-muted-foreground text-xs">{new Date(company.createdAt).toLocaleDateString()}</div>
                  </div>
                )}
                {company?.updatedAt && (
                  <div>
                    <div className="font-semibold text-xs">Last Updated</div>
                    <div className="text-muted-foreground text-xs">{new Date(company.updatedAt).toLocaleDateString()}</div>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          <Card className="shadow border mb-6">
            <CardHeader>
              <CardTitle className="text-lg font-semibold text-foreground">Jobs at {company?.name || "this company"}</CardTitle>
            </CardHeader>
            <CardContent>
              {jobsLoading ? (
                <div className="space-y-2">
                  <Skeleton className="h-6 w-1/2" />
                  <Skeleton className="h-20 w-full" />
                  <Skeleton className="h-20 w-full" />
                </div>
              ) : jobs.length === 0 ? (
                <div className="text-muted-foreground italic">No jobs found for this company.</div>
              ) : (
                <div className="flex flex-col gap-4">
                  {jobs.map((job) => (
                    <Link to={`/jobseeker/job/${job.id}`} key={job.id} className="block group">
                      <Card className="border shadow flex flex-col sm:flex-row items-stretch hover:shadow-lg transition-shadow duration-200 bg-background group-hover:ring-2 group-hover:ring-blue-400 cursor-pointer">
                        <div className="flex flex-col justify-between flex-1 p-4">
                          <div>
                            <CardTitle className="text-lg font-semibold mb-1 text-blue-700 group-hover:underline">
                              {job.job_title}
                            </CardTitle>
                            <div className="flex flex-wrap gap-x-4 gap-y-2 mb-2">
                              <span className="inline-flex items-center text-xs font-bold bg-blue-200 text-blue-900 px-3 py-1 rounded-full shadow-sm">
                                <MapPin className="h-3 w-3 mr-1 text-blue-600" />
                                {job.job_location || 'Location N/A'}
                              </span>
                              <span className="inline-flex items-center text-xs font-bold bg-green-200 text-green-900 px-3 py-1 rounded-full shadow-sm">
                                <Briefcase className="h-3 w-3 mr-1 text-green-600" />
                                {job.work_mode || 'Type N/A'}
                              </span>
                            </div>
                            {job.job_description && (
                              <div className="text-muted-foreground text-xs mt-2 font-medium line-clamp-2">
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
            </CardContent>
          </Card>
        </div>
      </div>
    </JobSeekerLayout>
  );
};

export default CompanyDetailPage;
