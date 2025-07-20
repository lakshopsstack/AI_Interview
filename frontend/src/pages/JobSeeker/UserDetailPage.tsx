import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Table, TableHeader, TableBody, TableHead, TableRow, TableCell } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { adminApi } from "@/services/adminApi";

export default function UserDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [user, setUser] = useState<any>(null);
  const [applications, setApplications] = useState<any[]>([]);
  const [interviews, setInterviews] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!id) return;
    setLoading(true);
    setError(null);
    Promise.all([
      adminApi.getJobSeeker(id),
      adminApi.getJobSeekerApplications(id),
      adminApi.getJobSeekerInterviews(id),
    ])
      .then(([userRes, appsRes, interviewsRes]) => {
        setUser(userRes.data);
        setApplications(appsRes.data);
        setInterviews(interviewsRes.data);
      })
      .catch(() => setError("Failed to fetch user details"))
      .finally(() => setLoading(false));
  }, [id]);

  if (loading) return <div className="p-8 text-center">Loading...</div>;
  if (error) return <div className="p-8 text-center text-destructive">{error}</div>;
  if (!user) return <div className="p-8 text-center">User not found</div>;

  return (
    <div className="relative min-h-screen bg-background pb-16">
      {/* Go Back Button */}
      <Button
        variant="outline"
        className="fixed top-6 left-6 z-20"
        onClick={() => navigate(-1)}
      >
        ← Go Back
      </Button>

      <div className="max-w-4xl mx-auto py-12 space-y-8">
        {/* Profile Card */}
        <Card className="border bg-card text-card-foreground">
          <CardContent className="py-8 px-6 flex flex-col md:flex-row items-center gap-8">
            <img
              src={user.profile_picture_url || "https://static.vecteezy.com/system/resources/thumbnails/009/292/244/small/default-avatar-icon-of-social-media-user-vector.jpg"}
              alt="Profile"
              className="w-28 h-28 rounded-full object-cover border border-border bg-muted"
            />
            <div className="flex-1">
              <div className="text-2xl font-bold mb-1">{user.firstname} {user.lastname}</div>
              <div className="text-muted-foreground mb-2">ID: {user.id}</div>
              <div className="flex flex-wrap gap-2 mb-2">
                <Badge variant="secondary">Email: {user.email}</Badge>
                <Badge variant="secondary">Phone: {user.phone}</Badge>
                <Badge variant={user.is_verified ? "success" : "warning"}>{user.is_verified ? "Verified" : "Not Verified"}</Badge>
                <Badge variant={user.is_suspended ? "destructive" : "info"}>{user.is_suspended ? "Suspended" : "Active"}</Badge>
              </div>
              <div className="text-xs text-muted-foreground">Created: {user.created_at} | Updated: {user.updated_at}</div>
            </div>
          </CardContent>
        </Card>

        {/* All Details Section */}
        <Card className="border bg-card text-card-foreground">
          <CardHeader>
            <CardTitle className="text-lg">All User Details</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {Object.entries(user).map(([key, value]) => (
                [
                  "id",
                  "firstname",
                  "lastname",
                  "email",
                  "phone",
                  "is_verified",
                  "is_suspended",
                  "profile_picture_url",
                  "created_at",
                  "updated_at",
                ].includes(key)
                  ? null
                  : <div key={key} className="bg-muted/60 rounded px-3 py-2"><b>{key.replace(/_/g, " ")}:</b> {typeof value === "boolean" ? (value ? "Yes" : "No") : value?.toString?.() ?? ""}</div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Jobs Applied Section */}
        <Card className="border bg-card text-card-foreground">
          <CardHeader>
            <CardTitle className="text-lg">Jobs Applied</CardTitle>
          </CardHeader>
          <CardContent>
            {applications.length === 0 ? (
              <div className="text-muted-foreground">No job applications found.</div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Job ID</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Applied At</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {applications.map((app) => (
                    <TableRow key={app.id}>
                      <TableCell>{app.job_id}</TableCell>
                      <TableCell>{app.status}</TableCell>
                      <TableCell>{app.applied_at}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>

        {/* Interviews Section */}
        <Card className="border bg-card text-card-foreground">
          <CardHeader>
            <CardTitle className="text-lg">Interviews Given</CardTitle>
          </CardHeader>
          <CardContent>
            {interviews.length === 0 ? (
              <div className="text-muted-foreground">No interviews found.</div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Interview ID</TableHead>
                    <TableHead>Job ID</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Created At</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {interviews.map((intv) => (
                    <TableRow key={intv.id}>
                      <TableCell>{intv.id}</TableCell>
                      <TableCell>{intv.ai_interviewed_job_id || intv.job_id}</TableCell>
                      <TableCell>{intv.status}</TableCell>
                      <TableCell>{intv.created_at}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
} 