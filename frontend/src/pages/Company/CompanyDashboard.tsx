import { useState, useEffect } from "react";
import DashboardLayout from "@/components/layout/CompanyLayout";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  LineChart,
  Line,
  Legend,
} from "recharts";
import { toast } from "sonner";
import { companyApi } from "@/services/companyApi";
import { ChartTooltipContent, ChartContainer } from "@/components/ui/chart";
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';

const CompanyDashboard = () => {
  const [analytics, setAnalytics] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchAnalytics = async () => {
      setLoading(true);
      setError(null);
      try {
        const res = await companyApi.getAnaltyics();
        setAnalytics(res.data);
        console.log("Analytics API response:", res.data);
      } catch (error: any) {
        setError(error?.message || "Error fetching analytics");
        toast.error("Error fetching analytics");
      } finally {
        setLoading(false);
      }
    };
    fetchAnalytics();
  }, []);

  if (loading)
    return <div className="p-8 text-center">Loading analytics...</div>;
  if (error)
    return <div className="p-8 text-center text-red-500">{error}</div>;

  // Example fallback for charts if analytics is not loaded yet
  const chartData = analytics?.chartData || [];

  return (
    <DashboardLayout>
      <div className="space-y-4">
        {/* Candidate Search button removed, sidebar now has the link */}
        {/* Analytics cards and rest of dashboard */}
        <div className="flex justify-around gap-2 bg-background rounded-lg shadow p-2">
          <div className="flex flex-col items-center py-2">
            <span className="text-xs text-muted-foreground">
              Total AI Interviewed Jobs
            </span>
            <span className="text-xl font-bold">
              {analytics?.total_jobs ?? "-"}
            </span>
          </div>
          {/* <div className="flex flex-col items-center py-2">
            <span className="text-xs text-muted-foreground">
              Open AI Interviewed Jobs
            </span>
            <span className="text-xl font-bold text-green-600">
              {analytics?.total_open_jobs ?? "-"}
            </span>
            <span
              className="text-[10px] mt-1"
              style={{
                color: (() => {
                  const prevOpen = Number(analytics?.active_jobs_prev_month ?? 0);
                  const currOpen = Number(analytics?.active_jobs_this_month ?? 0);
                  if (isNaN(currOpen) || isNaN(prevOpen)) return "#888";
                  if (prevOpen === 0) return "#888";
                  return currOpen >= prevOpen ? "#22c55e" : "#ef4444";
                })(),
              }}
            >
              {(() => {
                const prevOpen = Number(analytics?.active_jobs_prev_month ?? 0);
                const currOpen = Number(analytics?.active_jobs_this_month ?? 0);
                if (isNaN(currOpen) || isNaN(prevOpen)) return "";
                if (prevOpen === 0) return "No data for previous month";
                const percent = ((currOpen - prevOpen) / prevOpen) * 100;
                return `${percent > 0 ? "+" : ""}${percent.toFixed(1)}% from prev.`;
              })()}
            </span>
          </div> */}
          {/* <div className="flex flex-col items-center py-2">
            <span className="text-xs text-muted-foreground">Closed AI Interviewed Jobs</span>
            <span className="text-xl font-bold" style={{ color: (analytics?.total_closed_jobs ?? 0) > 0 ? '#ef4444' : '#22c55e' }}>
              {analytics?.total_closed_jobs ?? '-'}
            </span>
          </div> */}
          <div className="flex flex-col items-center py-2">
            <span className="text-xs text-muted-foreground">
              Total Interviews Conducted (this month)
            </span>
            <span className="text-xl font-bold">
              {analytics?.total_interviews_conducted ?? "-"}
            </span>
            <span
              className="text-[10px] mt-1"
              style={{
                color: (() => {
                  const prevConducted = Number(
                    analytics?.total_interviews_conducted_prev_month ?? 0
                  );
                  const currConducted = Number(
                    analytics?.total_interviews_conducted_this_month ?? 0
                  );
                  if (isNaN(currConducted) || isNaN(prevConducted)) return "#888";
                  if (prevConducted === 0) return "#888";
                  return currConducted >= prevConducted ? "#22c55e" : "#ef4444";
                })(),
              }}
            >
              {(() => {
                const prevConducted = Number(
                  analytics?.total_interviews_conducted_prev_month ?? 0
                );
                const currConducted = Number(
                  analytics?.total_interviews_conducted_this_month ?? 0
                );
                if (isNaN(currConducted) || isNaN(prevConducted)) return "";
                if (prevConducted === 0) return "No data for previous month";
                const percent = ((currConducted - prevConducted) / prevConducted) * 100;
                return `${percent > 0 ? "+" : ""}${percent.toFixed(1)}% from prev.`;
              })()}
            </span>
          </div>
          <div className="flex flex-col items-center py-2">
            <span className="text-xs text-muted-foreground">
              Total Interviews Completed (this month)
            </span>
            <span className="text-xl font-bold">
              {analytics?.total_interviews_completed ?? "-"}
            </span>
            <span
              className="text-[10px] mt-1"
              style={{
                color: (() => {
                  const prevCompleted = Number(analytics?.interviews_completed_prev_month ?? 0);
                  const currCompleted = Number(analytics?.interviews_completed_this_month ?? 0);
                  if (isNaN(currCompleted) || isNaN(prevCompleted)) return '#888';
                  if (prevCompleted === 0) return '#888';
                  return currCompleted >= prevCompleted ? '#22c55e' : '#ef4444';
                })() }}
            >
              {(() => {
                const prevCompleted = Number(analytics?.interviews_completed_prev_month ?? 0);
                const currCompleted = Number(analytics?.interviews_completed_this_month ?? 0);
                if (isNaN(currCompleted) || isNaN(prevCompleted)) return '';
                if (prevCompleted === 0) return 'No data for previous month';
                const percent = ((currCompleted - prevCompleted) / prevCompleted) * 100;
                return `${percent > 0 ? '+' : ''}${percent.toFixed(1)}% from prev.`;
              })()}
            </span>
          </div>
          <div className="flex flex-col items-center py-2">
            <span className="text-xs text-muted-foreground">Total Candidates (this month)</span>
            <span className="text-xl font-bold">
              {analytics?.total_candidates ?? "-"}
            </span>
            <span
              className="text-[10px] mt-1"
              style={{
                color: (() => {
                  const prevCandidates = Number(analytics?.candidates_prev_month ?? 0);
                  const currCandidates = Number(analytics?.candidates_this_month ?? 0);
                  if (isNaN(currCandidates) || isNaN(prevCandidates)) return '#888';
                  if (prevCandidates === 0) return '#888';
                  return currCandidates >= prevCandidates ? '#22c55e' : '#ef4444';
                })() }}
            >
              {(() => {
                const prevCandidates = Number(analytics?.candidates_prev_month ?? 0);
                const currCandidates = Number(analytics?.candidates_this_month ?? 0);
                if (isNaN(currCandidates) || isNaN(prevCandidates)) return '';
                if (prevCandidates === 0) return 'No data for previous month';
                const percent = ((currCandidates - prevCandidates) / prevCandidates) * 100;
                return `${percent > 0 ? '+' : ''}${percent.toFixed(1)}% from prev.`;
              })()}
            </span>
          </div>
        </div>
        {/* Side-by-side jobs overview and candidate score */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Card>
            <CardHeader>
              <CardTitle>AI Interviewed Jobs Overview</CardTitle>
            </CardHeader>
            <CardContent>
              <ChartContainer config={{ Open: {}, Closed: {} }}>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart
                    data={[
                      {
                        name: "AI Interviewed Jobs",
                        Open: analytics?.total_open_jobs ?? 0,
                        Closed: analytics?.total_closed_jobs ?? 0,
                      },
                    ]}
                    margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
                    barCategoryGap={"60%"}
                    barSize={60}
                  >
                    <XAxis dataKey="name" />
                    <YAxis allowDecimals={false} />
                    <CartesianGrid strokeDasharray="3 3" />
                    <Tooltip content={<ChartTooltipContent />} />
                    <Legend />
                    <Bar dataKey="Open" stackId="a" fill="#22c55e" />
                    <Bar dataKey="Closed" stackId="a" fill="#ef4444" />
                  </BarChart>
                </ResponsiveContainer>
              </ChartContainer>
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle>Average Candidate Score</CardTitle>
              <CardDescription>
                Indicates how well candidate skills are meeting job requirements this
                month.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ChartContainer config={{ Score: {} }}>
                <div className="flex flex-col items-center justify-center">
                  <div className="relative" style={{ width: 240, height: 240 }}>
                    <PieChart width={240} height={240}>
                      <Pie
                        data={[
                          {
                            name: "Score",
                            value: analytics?.average_candidate_score ?? 0,
                          },
                          {
                            name: "Remainder",
                            value: 100 - (analytics?.average_candidate_score ?? 0),
                          },
                        ]}
                        dataKey="value"
                        startAngle={90}
                        endAngle={-270}
                        innerRadius={80}
                        outerRadius={100}
                        stroke="none"
                      >
                        <Cell
                          key="score"
                          fill={
                            analytics?.average_candidate_score >= 70
                              ? "#22c55e"
                              : analytics?.average_candidate_score >= 40
                              ? "#facc15"
                              : "#ef4444"
                          }
                        />
                        <Cell key="remainder" fill="#e5e7eb" />
                      </Pie>
                      <Tooltip content={<ChartTooltipContent />} />
                    </PieChart>
                    <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                      <span className="text-3xl font-bold" style={{ color: analytics?.average_candidate_score >= 70 ? '#22c55e' : analytics?.average_candidate_score >= 40 ? '#facc15' : '#ef4444' }}>
                        {analytics?.average_candidate_score !== undefined ? analytics.average_candidate_score : '-'}
                        <span className="text-base font-normal ml-1">/ 100</span>
                      </span>
                    </div>
                  </div>
                  <div className="mt-2 text-muted-foreground text-sm text-center">
                    Higher scores suggest a better match between candidate skills and job
                    demand.
                  </div>
                </div>
              </ChartContainer>
            </CardContent>
          </Card>
        </div>
        {/* Interviews This Week and Interviews Overview graphs below */}
        <div className="flex flex-wrap gap-4 w-full overflow-x-auto">
          <Card className="p-1 shadow-none border-none flex-1 w-full min-w-0">
            <CardHeader className="pb-0 px-2">
              <CardTitle className="text-xs">Interviews This Week</CardTitle>
            </CardHeader>
            <CardContent className="p-4 min-w-0">
              <ChartContainer config={{ count: {} }}>
                <ResponsiveContainer width="100%" height={90}>
                  <LineChart data={analytics?.daily_interviews_this_week || []} margin={{ top: 10, right: 10, left: 10, bottom: 20 }}>
                    <XAxis dataKey="date" fontSize={10} height={24} tickLine={false} axisLine={false} interval={0} />
                    <YAxis fontSize={10} width={32} tickLine={false} axisLine={false} allowDecimals={false} interval={0} />
                    <CartesianGrid strokeDasharray="2 2" vertical={false} />
                    <Tooltip content={<ChartTooltipContent />} />
                    <Line type="monotone" dataKey="count" stroke="#8884d8" activeDot={{ r: 4 }} strokeWidth={1.5} dot={false} />
                  </LineChart>
                </ResponsiveContainer>
              </ChartContainer>
            </CardContent>
          </Card>
          <Card className="p-1 shadow-none border-none flex-1 w-full min-w-0">
            <CardHeader className="pb-0 px-2">
              <CardTitle className="text-xs">Interviews Overview</CardTitle>
            </CardHeader>
            <CardContent className="p-4 min-w-0">
              <ChartContainer config={{ value: {} }}>
                <ResponsiveContainer width="100%" height={100}>
                  <BarChart
                    layout="vertical"
                    data={[
                      {
                        name: 'Conducted This Month',
                        value: analytics?.total_interviews_conducted_this_month ?? 0,
                      },
                      {
                        name: 'Completed This Month',
                        value: analytics?.interviews_completed_this_month ?? 0,
                      },
                    ]}
                    margin={{ top: 10, right: 20, left: 40, bottom: 10 }}
                    barCategoryGap={"30%"}
                    barSize={24}
                  >
                    <XAxis type="number" allowDecimals={false} fontSize={10} height={16} tickLine={false} axisLine={false} interval={0} />
                    <YAxis type="category" dataKey="name" width={110} fontSize={10} tickLine={false} axisLine={false} interval={0} />
                    <CartesianGrid strokeDasharray="2 2" horizontal={false} />
                    <Tooltip content={<ChartTooltipContent />} />
                    <Bar dataKey="value" fill="#22c55e" radius={[0, 8, 8, 0]} label={{ position: 'right', fill: '#333', fontWeight: 600, fontSize: 10 }} />
                  </BarChart>
                </ResponsiveContainer>
              </ChartContainer>
            </CardContent>
          </Card>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default CompanyDashboard;
