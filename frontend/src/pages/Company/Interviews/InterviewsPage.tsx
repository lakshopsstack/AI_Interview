import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import CompanyLayout from "@/components/layout/CompanyLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";
import {
  Search,
  Filter,
  MoreHorizontal,
  Eye,
  FileText,
  Trash2,
  Calendar,
  Clock,
  CheckCircle,
  XCircle,
  BarChart3,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { InterviewData } from "@/types/interview";
import { toast } from "sonner";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { interviewApi } from "@/services/interviewApi";
import { companyApi } from "@/services/companyApi";

const InterviewsPage = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [departmentFilter, setDepartmentFilter] = useState("all");
  const [jobFilter, setJobFilter] = useState("all");
  const [scoreFilter, setScoreFilter] = useState("all");
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [interviewToDelete, setInterviewToDelete] = useState<number | null>(
    null
  );
  const [isLoading, setIsLoading] = useState(false);
  const [interviewsData, setInterviewsData] = useState<InterviewData[]>([]);
  const [jobTitlesMap, setJobTitlesMap] = useState<Record<number, string>>({});
  const itemsPerPage = 10;

  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery, scoreFilter, departmentFilter, jobFilter]);

  useEffect(() => {
    interviewApi
      .getInterviews({
        offset: (currentPage - 1) * itemsPerPage,
        limit: itemsPerPage,
        search: searchQuery,
        score: scoreFilter,
        department: departmentFilter,
        job: jobFilter,
      })
      .then(async (res) => {
        const jobIds = res.data.interviews.map(
          (interview: any) => interview.ai_interviewed_job_id
        ) as number[];
        const uniqueJobIds = Array.from(new Set(jobIds));

        const jobTitlePromises = uniqueJobIds.map(async (jobId) => {
          try {
            const jobRes = await companyApi.getAiInterviewedJobById(
              jobId.toString()
            );
            return { jobId, title: jobRes.data.title };
          } catch (error) {
            console.error(`Error fetching job ${jobId}:`, error);
            return { jobId, title: "Unknown Job" };
          }
        });

        const values = await Promise.all(jobTitlePromises);
        const jobTitlesMapObj = values.reduce((acc, { jobId, title }) => {
          acc[jobId] = title;
          return acc;
        }, {} as Record<number, string>);
        setJobTitlesMap(jobTitlesMapObj);

        const totalCount = res.data.count;
        setTotalPages(Math.ceil(totalCount / itemsPerPage));

        setInterviewsData(res.data.interviews);
      });
  }, [currentPage, searchQuery, scoreFilter, departmentFilter, jobFilter]);

  const deleteInterview = async () => {
    if (!interviewToDelete) return;

    try {
      setIsLoading(true);
      await companyApi.deleteInterview(interviewToDelete?.toString());
      toast.success("Interview deleted successfully");
    } catch (error) {
      console.log(error)
      toast.error("Failed to delete interview");
    } finally {
      setIsLoading(false);
      setInterviewToDelete(null);

      interviewApi
        .getInterviews({
          offset: (currentPage - 1) * itemsPerPage,
          limit: itemsPerPage,
        })
        .then((res) => {
          setInterviewsData(res.data.interviews);
          const totalCount = res.data.count;
          setTotalPages(Math.ceil(totalCount / itemsPerPage));
        });
    }
  };

  const handleDeleteInterview = (id: number) => {
    setInterviewToDelete(id);
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "completed":
        return (
          <Badge variant="outline" className="bg-success/10 text-success">
            <CheckCircle className="h-3 w-3 mr-1" /> Completed
          </Badge>
        );
      case "scheduled":
        return (
          <Badge variant="outline" className="bg-brand/10 text-brand">
            <Calendar className="h-3 w-3 mr-1" /> Scheduled
          </Badge>
        );
      case "pending":
        return (
          <Badge variant="outline" className="bg-muted text-muted-foreground">
            <Clock className="h-3 w-3 mr-1" /> Pending
          </Badge>
        );
      case "cancelled":
        return (
          <Badge
            variant="outline"
            className="bg-destructive/10 text-destructive"
          >
            <XCircle className="h-3 w-3 mr-1" /> Cancelled
          </Badge>
        );
      default:
        return null;
    }
  };

  const getScoreColor = (score: number) => {
    if (score === 0) return "text-muted-foreground";
    if (score >= 85) return "text-success";
    if (score >= 70) return "text-brand";
    return "text-destructive";
  };

  return (
    <CompanyLayout>
      <div className="container mx-auto py-6">
        <h1 className="text-2xl font-bold mb-2">Interviews</h1>
        <p className="text-muted-foreground mb-6">
          Manage and track all your interviews
        </p>

        <div className="mb-6 flex flex-col sm:flex-row gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search candidates or jobs..."
              className="pl-8"
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                // setCurrentPage(1); // now handled by useEffect
              }}
            />
          </div>
          <div className="flex flex-wrap gap-2">
            <Select value={scoreFilter} onValueChange={(val) => {
              setScoreFilter(val);
              // setCurrentPage(1); // now handled by useEffect
            }}>
              <SelectTrigger className="w-[140px]">
                <BarChart3 className="h-4 w-4 mr-2" />
                <SelectValue placeholder="Score" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Scores</SelectItem>
                <SelectItem value="90-100">90-100%</SelectItem>
                <SelectItem value="80-89">80-89%</SelectItem>
                <SelectItem value="70-79">70-79%</SelectItem>
                <SelectItem value="60-69">60-69%</SelectItem>
                <SelectItem value="0-59">0-59%</SelectItem>
              </SelectContent>
            </Select>

            <Select value={departmentFilter} onValueChange={(val) => {
              setDepartmentFilter(val);
              // setCurrentPage(1); // now handled by useEffect
            }}>
              <SelectTrigger className="w-[150px] hidden">
                <Filter className="h-4 w-4 mr-2" />
                <SelectValue placeholder="Department" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Departments</SelectItem>
                {/* {departments.map((dept) => (
                <SelectItem key={dept} value={dept}>
                  {dept}
                </SelectItem>
              ))} */}
              </SelectContent>
            </Select>

            <Select value={jobFilter} onValueChange={(val) => {
              setJobFilter(val);
              // setCurrentPage(1); // now handled by useEffect
            }}>
              <SelectTrigger className="w-[180px] hidden">
                <Filter className="h-4 w-4 mr-2" />
                <SelectValue placeholder="Job" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Jobs</SelectItem>
                {/* {jobs.map((job) => (
                <SelectItem key={job} value={job}>
                  {job}
                </SelectItem>
              ))} */}
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Interviews Table */}
        <div className="rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Candidate</TableHead>
                <TableHead>Job Role</TableHead>
                <TableHead>Date</TableHead>
                <TableHead>Score</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {interviewsData && interviewsData.length > 0 ? (
                interviewsData
                  .filter((interview: InterviewData) => {
                    console.log("Filtering interview:", interview);
                    // Filter by score
                    if (scoreFilter !== "all") {
                      const score = interview.overall_score || 0;
                      const [min, max] = scoreFilter.split("-").map(Number);
                      console.log("Score filter:", { score, min, max });
                      if (score < min || score > max) {
                        console.log("Interview filtered out by score");
                        return false;
                      }
                    }

                    // Filter by search query
                    if (searchQuery) {
                      const searchLower = searchQuery.toLowerCase();
                      const matches =
                        interview.firstname
                          ?.toLowerCase()
                          .includes(searchLower) ||
                        interview.lastname
                          ?.toLowerCase()
                          .includes(searchLower) ||
                        interview.email?.toLowerCase().includes(searchLower);
                      console.log("Search filter:", { searchLower, matches });
                      if (!matches) {
                        console.log("Interview filtered out by search");
                        return false;
                      }
                    }

                    console.log("Interview passed all filters");
                    return true;
                  })
                  .map((interview: InterviewData) => (
                    <TableRow key={interview.id}>
                      <TableCell>
                        <div className="flex items-center gap-3">
                          <Avatar>
                            <AvatarImage
                              src={undefined}
                              alt={interview.firstname}
                            />
                            <AvatarFallback>
                              {interview.lastname?.[0]}
                            </AvatarFallback>
                          </Avatar>
                          <div>
                            <Link
                              to={`/company/interviews/${interview.id}`}
                              className="font-medium hover:underline"
                            >
                              {interview.firstname} {interview.lastname}
                            </Link>
                            <div className="text-xs text-muted-foreground">
                              {interview.email}
                            </div>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        {(!!interview.ai_interviewed_job_id &&
                          jobTitlesMap[interview.ai_interviewed_job_id]) ||
                          "Unknown"}
                      </TableCell>
                      <TableCell>
                        {interview.updated_at &&
                          new Date(interview.updated_at).toLocaleDateString()}
                      </TableCell>
                      <TableCell>
                        {interview.overall_score ? (
                          <span
                            className={getScoreColor(interview.overall_score)}
                          >
                            {interview.overall_score}%
                          </span>
                        ) : (
                            <span className="text-amber-600">{interview.status}</span>
                        )}
                      </TableCell>
                      <TableCell className="text-right">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon">
                              <MoreHorizontal className="h-4 w-4" />
                              <span className="sr-only">Actions</span>
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuLabel>Actions</DropdownMenuLabel>
                            <DropdownMenuItem>
                              <Link
                                to={`/company/interviews/${interview.id}`}
                                className="flex items-center"
                              >
                                <Eye className="mr-2 h-4 w-4" />
                                View Details
                              </Link>
                            </DropdownMenuItem>
                            <DropdownMenuItem>
                              <Link
                                to={`/company/interviews/${interview.id}/report`}
                                className="flex items-center"
                              >
                                <FileText className="mr-2 h-4 w-4" />
                                View Report
                              </Link>
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem
                              className="text-red-600"
                              onClick={() =>
                                handleDeleteInterview(interview.id!)
                              }
                            >
                              <Trash2 className="mr-2 h-4 w-4" />
                              Delete Interview
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  ))
              ) : (
                <TableRow>
                  <TableCell
                    colSpan={7}
                    className="text-center py-10 text-muted-foreground"
                  >
                    No interviews found matching your criteria
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <Pagination className="mt-6">
            <PaginationContent>
              <PaginationItem>
                <PaginationPrevious
                  href="#"
                  onClick={(e) => {
                    e.preventDefault();
                    if (currentPage > 1) setCurrentPage(currentPage - 1);
                  }}
                  className={
                    currentPage === 1 ? "pointer-events-none opacity-50" : ""
                  }
                />
              </PaginationItem>
              {Array.from({ length: totalPages }, (_, i) => i + 1).map(
                (page) => (
                  <PaginationItem key={page}>
                    <PaginationLink
                      href="#"
                      onClick={(e) => {
                        e.preventDefault();
                        setCurrentPage(page);
                      }}
                      isActive={currentPage === page}
                    >
                      {page}
                    </PaginationLink>
                  </PaginationItem>
                )
              )}
              <PaginationItem>
                <PaginationNext
                  href="#"
                  onClick={(e) => {
                    e.preventDefault();
                    if (currentPage < totalPages)
                      setCurrentPage(currentPage + 1);
                  }}
                  className={
                    currentPage === totalPages
                      ? "pointer-events-none opacity-50"
                      : ""
                  }
                />
              </PaginationItem>
            </PaginationContent>
          </Pagination>
        )}
      </div>

      {/* Confirmation Dialog */}
      <AlertDialog
        open={interviewToDelete !== null}
        onOpenChange={() => setInterviewToDelete(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Interview</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete this interview? This action cannot
              be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              className="bg-red-600 hover:bg-red-700"
              onClick={deleteInterview}
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </CompanyLayout>
  );
};

export default InterviewsPage;