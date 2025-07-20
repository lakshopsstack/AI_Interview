import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Copy, ExternalLink, Mail, User, Calendar, CheckCircle, Clock, XCircle, Trash, Plus } from "lucide-react";
import { toast } from "sonner";
import { interviewApi } from "@/services/interviewApi";
import { companyApi } from "@/services/companyApi";
import LoadingSpinner from "@/components/common/LoadingSpinner";

interface InvitedCandidate {
  id: number;
  firstname: string;
  lastname: string;
  email: string;
  status: string;
  created_at: string;
  private_link_token: string;
  resume_match_score?: number;
  overall_score?: number;
  resume_match_feedback?: string;
  feedback?: string;
}

interface InvitedCandidatesListProps {
  jobId: string;
}

const InvitedCandidatesList: React.FC<InvitedCandidatesListProps> = ({ jobId }) => {
  const [candidates, setCandidates] = useState<InvitedCandidate[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState<string>("all");
  const [inviteOpen, setInviteOpen] = useState(false);
  const [inviteList, setInviteList] = useState([{ email: "", firstname: "", lastname: "" }]);
  const [inviteLoading, setInviteLoading] = useState(false);
  const [inviteResults, setInviteResults] = useState<any[]>([]);
  const [deleteLoading, setDeleteLoading] = useState<number | null>(null);

  useEffect(() => {
    fetchCandidates();
  }, [jobId]);

  const fetchCandidates = async () => {
    try {
      setLoading(true);
      const response = await interviewApi.getInterviews({ ai_interviewed_job_id: jobId });
      setCandidates(response.data.interviews || []);
    } catch (error) {
      console.error("Error fetching candidates:", error);
      toast.error("Failed to load invited candidates");
    } finally {
      setLoading(false);
    }
  };

  const copyToClipboard = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      toast.success("Link copied to clipboard");
    } catch (error) {
      toast.error("Failed to copy link");
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "completed":
        return (
          <Badge variant="outline" className="bg-green-100 text-green-800 border-green-200">
            <CheckCircle className="h-3 w-3 mr-1" />
            Completed
          </Badge>
        );
      case "incomplete":
        return (
          <Badge variant="outline" className="bg-yellow-100 text-yellow-800 border-yellow-200">
            <Clock className="h-3 w-3 mr-1" />
            Pending
          </Badge>
        );
      default:
        return (
          <Badge variant="outline" className="bg-gray-100 text-gray-800 border-gray-200">
            <Clock className="h-3 w-3 mr-1" />
            {status}
          </Badge>
        );
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const getPrivateLink = (token: string) => {
    return `${window.location.origin}/interview/private/${token}`;
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
      const res = await companyApi.inviteCandidates(parseInt(jobId), filtered);
      setInviteResults(res.data.results);
      toast.success("Invitations sent!");
      // Refresh the candidates list
      await fetchCandidates();
      // Reset the form
      setInviteList([{ email: "", firstname: "", lastname: "" }]);
      setInviteOpen(false);
    } catch (err: any) {
      toast.error(err?.response?.data?.detail || "Failed to send invitations");
    } finally {
      setInviteLoading(false);
    }
  };

  const handleDeleteCandidate = async (candidateId: number, candidateName: string) => {
    setDeleteLoading(candidateId);
    try {
      await companyApi.deleteInterview(candidateId.toString());
      toast.success(`Invitation for ${candidateName} has been deleted`);
      await fetchCandidates(); // Refresh the list
    } catch (error) {
      console.error("Error deleting candidate:", error);
      toast.error("Failed to delete invitation");
    } finally {
      setDeleteLoading(null);
    }
  };

  const filteredCandidates = candidates.filter((candidate) => {
    const matchesSearch = 
      candidate.firstname.toLowerCase().includes(searchTerm.toLowerCase()) ||
      candidate.lastname.toLowerCase().includes(searchTerm.toLowerCase()) ||
      candidate.email.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = filterStatus === "all" || candidate.status === filterStatus;
    
    return matchesSearch && matchesStatus;
  });

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Invited Candidates</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center py-8">
            <LoadingSpinner />
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <CardTitle className="flex items-center gap-2">
              <User className="h-5 w-5" />
              Invited Candidates ({candidates.length})
            </CardTitle>
            <div className="flex gap-2">
              <Input
                placeholder="Search candidates..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-48"
              />
              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
                className="px-3 py-2 border border-input rounded-md bg-background"
              >
                <option value="all">All Status</option>
                <option value="incomplete">Pending</option>
                <option value="completed">Completed</option>
              </select>
              <Dialog open={inviteOpen} onOpenChange={setInviteOpen}>
                <DialogTrigger asChild>
                  <Button>
                    <Plus className="h-4 w-4 mr-2" />
                    Invite Candidates
                  </Button>
                </DialogTrigger>
                <DialogContent className="bg-background rounded-lg p-0 max-w-xl w-full">
                  <DialogHeader>
                    <DialogTitle>Invite Candidates</DialogTitle>
                  </DialogHeader>
                  <Card className="shadow-none border-none bg-background">
                    <CardHeader>
                      <p className="text-muted-foreground text-sm mt-1">Enter candidate emails and (optionally) names. Each will receive a private interview link.</p>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <form onSubmit={handleInviteSubmit} className="space-y-4">
                        {inviteList.map((c, idx) => (
                          <div key={idx} className="flex gap-2 items-center">
                            <Input
                              type="email"
                              placeholder="Email"
                              value={c.email}
                              onChange={(e) => handleInviteChange(idx, "email", e.target.value)}
                              required
                            />
                            <Input
                              type="text"
                              placeholder="First Name (optional)"
                              value={c.firstname}
                              onChange={(e) => handleInviteChange(idx, "firstname", e.target.value)}
                            />
                            <Input
                              type="text"
                              placeholder="Last Name (optional)"
                              value={c.lastname}
                              onChange={(e) => handleInviteChange(idx, "lastname", e.target.value)}
                            />
                            {inviteList.length > 1 && (
                              <Button type="button" variant="ghost" onClick={() => removeInviteRow(idx)}><Trash className="w-4 h-4" /></Button>
                            )}
                          </div>
                        ))}
                        <Button type="button" variant="secondary" onClick={addInviteRow}>
                          + Add Another
                        </Button>
                        <CardFooter className="p-0 pt-2 flex-col items-stretch gap-2">
                          <Button type="submit" className="w-full" disabled={inviteLoading}>
                            {inviteLoading ? <LoadingSpinner /> : "Send Invitations"}
                          </Button>
                        </CardFooter>
                      </form>
                    </CardContent>
                  </Card>
                </DialogContent>
              </Dialog>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {filteredCandidates.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              {candidates.length === 0 ? (
                <div>
                  <Mail className="h-12 w-12 mx-auto mb-4 text-muted-foreground/50" />
                  <p className="text-lg font-medium mb-2">No candidates invited yet</p>
                  <p className="text-sm">Click "Invite Candidates" to get started.</p>
                </div>
              ) : (
                <div>
                  <p className="text-lg font-medium mb-2">No candidates found</p>
                  <p className="text-sm">Try adjusting your search or filter criteria.</p>
                </div>
              )}
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Candidate</TableHead>
                    <TableHead>Email</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Invited</TableHead>
                    <TableHead>Scores</TableHead>
                    <TableHead>Private Link</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredCandidates.map((candidate) => (
                    <TableRow key={candidate.id}>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <div className="w-8 h-8 bg-primary/10 rounded-full flex items-center justify-center">
                            <User className="h-4 w-4 text-primary" />
                          </div>
                          <div>
                            <div className="font-medium">
                              {candidate.firstname} {candidate.lastname}
                            </div>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Mail className="h-4 w-4 text-muted-foreground" />
                          {candidate.email}
                        </div>
                      </TableCell>
                      <TableCell>
                        {getStatusBadge(candidate.status)}
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                          <Calendar className="h-4 w-4" />
                          {formatDate(candidate.created_at)}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="space-y-1">
                          {candidate.resume_match_score !== undefined && (
                            <div className="text-sm">
                              <span className="text-muted-foreground">Resume:</span> {candidate.resume_match_score}%
                            </div>
                          )}
                          {candidate.overall_score !== undefined && (
                            <div className="text-sm">
                              <span className="text-muted-foreground">Overall:</span> {candidate.overall_score}%
                            </div>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Dialog>
                            <DialogTrigger asChild>
                              <Button variant="outline" size="sm">
                                <ExternalLink className="h-4 w-4 mr-1" />
                                View Link
                              </Button>
                            </DialogTrigger>
                            <DialogContent>
                              <DialogHeader>
                                <DialogTitle>Private Interview Link</DialogTitle>
                              </DialogHeader>
                              <div className="space-y-4">
                                <div>
                                  <label className="text-sm font-medium mb-2 block">
                                    Link for {candidate.firstname} {candidate.lastname}
                                  </label>
                                  <div className="flex gap-2">
                                    <Input
                                      value={getPrivateLink(candidate.private_link_token)}
                                      readOnly
                                      className="font-mono text-sm"
                                    />
                                    <Button
                                      variant="outline"
                                      size="sm"
                                      onClick={() => copyToClipboard(getPrivateLink(candidate.private_link_token))}
                                    >
                                      <Copy className="h-4 w-4" />
                                    </Button>
                                  </div>
                                </div>
                                <div className="text-sm text-muted-foreground">
                                  <p>• This link is unique to {candidate.firstname}</p>
                                  <p>• The candidate will need to enter their email to access the interview</p>
                                  <p>• Share this link securely with the candidate</p>
                                </div>
                              </div>
                            </DialogContent>
                          </Dialog>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => copyToClipboard(getPrivateLink(candidate.private_link_token))}
                          >
                            <Copy className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                      <TableCell>
                        <AlertDialog>
                          <AlertDialogTrigger asChild>
                            <Button
                              variant="ghost"
                              size="sm"
                              className="text-destructive hover:text-destructive"
                              disabled={deleteLoading === candidate.id}
                            >
                              {deleteLoading === candidate.id ? (
                                <LoadingSpinner size="sm" />
                              ) : (
                                <Trash className="h-4 w-4" />
                              )}
                            </Button>
                          </AlertDialogTrigger>
                          <AlertDialogContent>
                            <AlertDialogHeader>
                              <AlertDialogTitle>Delete Invitation</AlertDialogTitle>
                              <AlertDialogDescription>
                                Are you sure you want to delete the invitation for{" "}
                                <span className="font-semibold">
                                  {candidate.firstname} {candidate.lastname}
                                </span>
                                ? This action cannot be undone and the candidate will no longer be able to access their interview.
                              </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                              <AlertDialogCancel>Cancel</AlertDialogCancel>
                              <AlertDialogAction
                                onClick={() => handleDeleteCandidate(candidate.id, `${candidate.firstname} ${candidate.lastname}`)}
                                className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                              >
                                Delete Invitation
                              </AlertDialogAction>
                            </AlertDialogFooter>
                          </AlertDialogContent>
                        </AlertDialog>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default InvitedCandidatesList;