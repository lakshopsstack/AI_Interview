import React, { useEffect, useState } from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { MapPin, Briefcase, Building } from "lucide-react";
import { jobSeekerApi } from "@/services/jobSeekerApi";
import { CompanyPublicData } from "@/types/company";
import { Link } from "react-router-dom";
import JobSeekerLayout from "@/components/layout/JobSeekerLayout";

const CompanySearchPage: React.FC = () => {
  const [companies, setCompanies] = useState<CompanyPublicData[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

  useEffect(() => {
    const fetchCompanies = async () => {
      setLoading(true);
      try {
        const res = await jobSeekerApi.listCompanies(search);
        setCompanies(res || []);
      } catch {
        setCompanies([]);
      } finally {
        setLoading(false);
      }
    };
    fetchCompanies();
  }, [search]);

  return (
    <JobSeekerLayout>
      <div className="min-h-screen bg-background p-4 md:p-6">
        <div className="max-w-3xl mx-auto">
          <Card className="shadow-lg border-0 mb-6">
            <CardHeader>
              <CardTitle className="text-2xl font-bold text-blue-800">Explore Companies</CardTitle>
            </CardHeader>
            <CardContent>
              <Input
                placeholder="Search companies by name, industry, or city..."
                value={search}
                onChange={e => setSearch(e.target.value)}
                className="mb-4"
              />
              {loading ? (
                <div className="space-y-2">
                  <Skeleton className="h-12 w-full" />
                  <Skeleton className="h-12 w-full" />
                  <Skeleton className="h-12 w-full" />
                </div>
              ) : companies.length === 0 ? (
                <div className="text-muted-foreground italic">No companies found.</div>
              ) : (
                <div className="flex flex-col gap-4">
                  {companies.map((company) => (
                    <Link to={`/jobseeker/company/${company.id}`} key={company.id} className="block group">
                      <Card className="border shadow flex flex-row items-center gap-4 hover:shadow-lg transition-shadow duration-200 bg-background group-hover:ring-2 group-hover:ring-blue-400 cursor-pointer p-4">
                        {company.companyLogo ? (
                          <img src={company.companyLogo} alt={company.name} className="h-12 w-12 rounded-full object-cover border" />
                        ) : (
                          <div className="h-12 w-12 rounded-full bg-gray-200 flex items-center justify-center text-2xl font-bold text-gray-500">
                            <Building className="h-7 w-7" />
                          </div>
                        )}
                        <div className="flex-1 min-w-0">
                          <div className="text-lg font-semibold text-blue-700 group-hover:underline">{company.name}</div>
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

export default CompanySearchPage; 