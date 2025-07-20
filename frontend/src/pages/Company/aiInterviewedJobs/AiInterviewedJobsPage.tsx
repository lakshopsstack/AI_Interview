import React, { useState, useEffect } from "react";
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
  PaginationEllipsis,
} from "@/components/ui/pagination";
import {
  Plus,
  Search,
  MoreHorizontal,
  Eye,
  Edit,
  Share,
  Trash2,
  Clock,
  CheckCircle,
  XCircle,
  ChevronDown,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import LoadingSpinner from "@/components/common/LoadingSpinner";
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
import { companyApi } from "@/services/companyApi";
import { AiInterviewedJobData } from "@/types/aiInterviewedJob";

const AiInterviewedJobsPage = () => {
  const [jobs, setJobs] = useState<AiInterviewedJobData[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [jobToDelete, setJobToDelete] = useState<number | null>();
  const [sortField, setSortField] = useState<
    "title" | "department" | "city" | "type" | "show_salary" | "status"
  >("title");
  const [sortOrder, setSortOrder] = useState<"ascending" | "descending">(
    "ascending"
  );
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const itemsPerPage = 10;

  // Function to capitalize first letter of each word
  // const capitalizeWords = (str: string) => {
  //   return str
  //     .split(" ")
  //     .map((word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
  //     .join(" ");
  // };

  // Get unique departments and cities from jobs data

  const fetchJobs = async () => {
    try {
      setLoading(true);
      const response = await companyApi.getAllAiInterviewedJobs({
        sort: sortOrder,
        sort_field: sortField,
        start: (currentPage - 1) * itemsPerPage,
        limit: itemsPerPage,
        search: searchQuery ? searchQuery : undefined,
        status: statusFilter !== "all" ? statusFilter : undefined,
      });

      const totalCount = response.data.count;
      setTotalPages(Math.ceil(totalCount / itemsPerPage));

      const jobsData = response.data.jobs.map(
        (jobData: {
          id: number;
          title: string;
          department: string;
          city: string;
          type: string;
          status: string;
          created_at?: string;
        }) => {
          const date = jobData.created_at
            ? new Date(jobData.created_at.replace("Z", ""))
            : new Date();
          return {
            id: jobData.id,
            title: jobData.title,
            department: jobData.department,
            city: jobData.city,
            type: jobData.type,
            status: jobData.status,
            createdAt: date,
          };
        }
      );
      setJobs(jobsData);
    } catch (error) {
      toast.error("Failed to fetch jobs");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchJobs();
  }, [sortField, sortOrder, currentPage, searchQuery, statusFilter]);

  const handleDeleteJob = async (jobId: number) => {
    try {
      const response = await companyApi.deleteAiInterviewedJob(jobId.toString());
      if (response.status === 200) {
        toast.success("Job deleted successfully");
        await fetchJobs();
      } else {
        throw new Error("Failed to delete job");
      }
    } catch (error) {
      console.error("Error deleting job:", error);
      toast.error("Failed to delete job");
    } finally {
      setJobToDelete(null);
    }
  };

  const handleSort = (field: typeof sortField) => {
    if (field === sortField) {
      setSortOrder(sortOrder === "ascending" ? "descending" : "ascending");
    } else {
      setSortField(field);
      setSortOrder("ascending");
    }
  };

  return (
    <CompanyLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold">Jobs</h1>
          <Link to="/company/ai-interviewed-jobs/new">
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              Create Job
            </Button>
          </Link>
        </div>
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search jobs..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-8"
                />
              </div>
            </div>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="active">Active</SelectItem>
                <SelectItem value="draft">Draft</SelectItem>
                <SelectItem value="closed">Closed</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="border rounded-lg min-h-[200px]">
            {loading ? (
              <div className="flex items-center justify-center h-40">
                <LoadingSpinner />
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead
                      className="cursor-pointer"
                      onClick={() => handleSort("title")}
                    >
                      <div className="flex items-center">
                        Job Title
                        {sortField === "title" && (
                          <ChevronDown
                            className={`h-4 w-4 ml-1 transition-transform ${
                              sortOrder === "descending" ? "rotate-180" : ""
                            }`}
                          />
                        )}
                      </div>
                    </TableHead>
                    <TableHead
                      className="cursor-pointer"
                      onClick={() => handleSort("department")}
                    >
                      <div className="flex items-center">
                        Department
                        {sortField === "department" && (
                          <ChevronDown
                            className={`h-4 w-4 ml-1 transition-transform ${
                              sortOrder === "descending" ? "rotate-180" : ""
                            }`}
                          />
                        )}
                      </div>
                    </TableHead>
                    <TableHead
                      className="cursor-pointer"
                      onClick={() => handleSort("city")}
                    >
                      <div className="flex items-center">
                        City
                        {sortField === "city" && (
                          <ChevronDown
                            className={`h-4 w-4 ml-1 transition-transform ${
                              sortOrder === "descending" ? "rotate-180" : ""
                            }`}
                          />
                        )}
                      </div>
                    </TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead
                      className="cursor-pointer"
                      onClick={() => handleSort("status")}
                    >
                      <div className="flex items-center">
                        Status
                        {sortField === "status" && (
                          <ChevronDown
                            className={`h-4 w-4 ml-1 transition-transform ${
                              sortOrder === "descending" ? "rotate-180" : ""
                            }`}
                          />
                        )}
                      </div>
                    </TableHead>
                    <TableHead>Created</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>

                <TableBody>
                  {loading && (
                    <TableRow>
                      <TableCell colSpan={7} className="h-24 text-center">
                        <LoadingSpinner />
                      </TableCell>
                    </TableRow>
                  )}
                  {!loading && jobs.length === 0 && (
                    <TableRow>
                      <TableCell colSpan={7} className="h-24 text-center">
                        No jobs found
                      </TableCell>
                    </TableRow>
                  )}
                  {!loading &&
                    jobs.length != 0 &&
                    jobs.map((job) => (
                      <TableRow key={job.id}>
                        <TableCell className="font-medium">{job.title}</TableCell>
                        <TableCell>{job.department}</TableCell>
                        <TableCell>{job.city}</TableCell>
                        <TableCell>{job.type}</TableCell>
                        <TableCell>
                          <Badge
                            variant="outline"
                            className={
                              job.status == "active"
                                ? "bg-success/10 text-success"
                                : job.status == "draft"
                                ? "bg-muted text-muted-foreground"
                                : job.status == "closed"
                                ? "bg-destructive/10 text-destructive"
                                : ""
                            }
                          >
                            {job.status == "active" && (
                              <>
                                <CheckCircle className="h-3 w-3 mr-1" /> Active
                              </>
                            )}
                            {job.status == "draft" && (
                              <>
                                <Clock className="h-3 w-3 mr-1" /> Draft
                              </>
                            )}
                            {job.status == "closed" && (
                              <>
                                <XCircle className="h-3 w-3 mr-1" /> Closed
                              </>
                            )}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          {job.createdAt &&
                            new Date(job.createdAt).toLocaleDateString()}
                        </TableCell>
                        <TableCell className="text-right">
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" className="h-8 w-8 p-0">
                                <MoreHorizontal className="h-4 w-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuLabel>Actions</DropdownMenuLabel>
                              <DropdownMenuItem asChild>
                                <Link to={`/company/ai-interviewed-jobs/${job.id}`}>
                                  <Eye className="mr-2 h-4 w-4" />
                                  View Details
                                </Link>
                              </DropdownMenuItem>
                              <DropdownMenuSeparator />
                              <DropdownMenuItem
                                className="text-destructive"
                                onClick={() => setJobToDelete(job.id)}
                              >
                                <Trash2 className="mr-2 h-4 w-4" />
                                Delete
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </TableCell>
                      </TableRow>
                    ))}
                </TableBody>
              </Table>
            )}
          </div>

          <div className="flex justify-center mt-4">
            <Pagination>
              <PaginationContent>
                <PaginationItem>
                  <PaginationPrevious
                    onClick={() =>
                      setCurrentPage((prev) => Math.max(prev - 1, 1))
                    }
                    className={
                      currentPage === 1
                        ? "pointer-events-none opacity-50"
                        : "cursor-pointer"
                    }
                  />
                </PaginationItem>

                {currentPage > 2 && (
                  <PaginationItem>
                    <PaginationLink onClick={() => setCurrentPage(1)}>
                      1
                    </PaginationLink>
                  </PaginationItem>
                )}

                {currentPage > 3 && (
                  <PaginationItem>
                    <PaginationEllipsis />
                  </PaginationItem>
                )}

                {Array.from({ length: 3 }, (_, i) => currentPage - 1 + i)
                  .filter((page) => page > 0 && page <= totalPages)
                  .map((page) => (
                    <PaginationItem key={page}>
                      <PaginationLink
                        onClick={() => setCurrentPage(page)}
                        isActive={page === currentPage}
                      >
                        {page}
                      </PaginationLink>
                    </PaginationItem>
                  ))}

                {currentPage < totalPages - 2 && (
                  <PaginationItem>
                    <PaginationEllipsis />
                  </PaginationItem>
                )}

                {currentPage < totalPages - 1 && (
                  <PaginationItem>
                    <PaginationLink onClick={() => setCurrentPage(totalPages)}>
                      {totalPages}
                    </PaginationLink>
                  </PaginationItem>
                )}

                <PaginationItem>
                  <PaginationNext
                    onClick={() =>
                      setCurrentPage((prev) => Math.min(prev + 1, totalPages))
                    }
                    className={
                      currentPage === totalPages
                        ? "pointer-events-none opacity-50"
                        : "cursor-pointer"
                    }
                  />
                </PaginationItem>
              </PaginationContent>
            </Pagination>
          </div>
        </div>

        <AlertDialog
          open={!!jobToDelete}
          onOpenChange={() => setJobToDelete(null)}
        >
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Are you sure?</AlertDialogTitle>
              <AlertDialogDescription>
                This action cannot be undone. This will permanently delete the
                job posting and all associated data.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancel</AlertDialogCancel>
              <AlertDialogAction
                onClick={() => jobToDelete && handleDeleteJob(jobToDelete)}
                className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              >
                Delete
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>
    </CompanyLayout>
  );
};

export default AiInterviewedJobsPage;