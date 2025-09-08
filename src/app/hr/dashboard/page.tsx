"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import api from "@/lib/api";

interface DashboardData {
  totalJobs: number;
  totalApplications: number;
  avgMatchScore: number;
  openJobs: number;
  closedJobs: number;
  recentApplications: {
    _id: string;
    name: string;
    email: string;
    job?: { title: string };
    matchScore?: number;
  }[];
}

interface EmployeeLite {
  _id: string;
  user: { name: string };
  position: string;
  performanceScore?: number;
}

interface ProjectLite {
  _id: string;
  name: string;
  status: "active" | "completed" | "on-hold" | string;
}

interface TopPerformer {
  employee: {
    _id: string;
    user: { name: string };
    position: string;
    performanceScore: number;
  };
  metrics: {
    projectsInvolved: number;
    averageRating: number;
    feedbackCount: number;
  };
}

interface FeedbackLite {
  _id: string;
  employee: { user: { name: string }; position: string };
  reviewer: { name: string };
  overallRating: number;
  type: string;
  createdAt: string;
}

interface EmployeeData {
  totalEmployees: number;
  activeProjects: number;
  completedProjects: number;
  averagePerformance: number;
  topPerformers: TopPerformer[];
  recentFeedback: FeedbackLite[];
}

type ApiEmployeesRes = { employees?: EmployeeLite[] } | EmployeeLite[];
type ApiProjectsRes = { projects?: ProjectLite[] } | ProjectLite[];
type ApiTopPerformersRes = { topPerformers?: TopPerformer[] } | TopPerformer[];
type ApiFeedbackRes = { feedback?: FeedbackLite[] } | FeedbackLite[];

function isAxiosError(e: unknown): e is { response?: { data?: any; status?: number } } {
  return typeof e === "object" && e !== null && "response" in e;
}

export default function HRDashboardPage() {
  const [data, setData] = useState<DashboardData | null>(null);
  const [employeeData, setEmployeeData] = useState<EmployeeData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [seeding, setSeeding] = useState(false);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        console.log("🔍 Fetching HR dashboard data...");
        console.log("🔍 API base URL:", api.defaults.baseURL);

        // First check if we have authentication
        const authRes = await api.get("/auth/me");
        console.log("🔐 Current user: line 35", authRes.data);

        // Then fetch dashboard data
        const res = await api.get<DashboardData>("/admin/dashboard");
        console.log("✅ Dashboard data received:", res.data);
        setData(res.data);

        // Fetch employee performance data
        try {
          const [employeesRes, projectsRes, topPerformersRes, feedbackRes] = await Promise.all([
            api.get<ApiEmployeesRes>("/employees?limit=1000"),
            api.get<ApiProjectsRes>("/projects?limit=1000"),
            api.get<ApiTopPerformersRes>("/employees/top-performers?limit=5"),
            api.get<ApiFeedbackRes>("/feedback?limit=10"),
          ]);

          const employeesArr =
            Array.isArray(employeesRes.data) ? employeesRes.data : employeesRes.data?.employees || [];
          const projectsArr =
            Array.isArray(projectsRes.data) ? projectsRes.data : projectsRes.data?.projects || [];
          const topPerformersArr =
            Array.isArray(topPerformersRes.data)
              ? topPerformersRes.data
              : topPerformersRes.data?.topPerformers || [];
          const feedbackArr =
            Array.isArray(feedbackRes.data) ? feedbackRes.data : feedbackRes.data?.feedback || [];

          setEmployeeData({
            totalEmployees: employeesArr.length,
            activeProjects: projectsArr.filter((p) => p.status === "active").length,
            completedProjects: projectsArr.filter((p) => p.status === "completed").length,
            averagePerformance:
              employeesArr.length > 0
                ? employeesArr.reduce((sum, emp) => sum + (emp.performanceScore || 0), 0) / employeesArr.length
                : 0,
            topPerformers: topPerformersArr,
            recentFeedback: feedbackArr,
          });
        } catch (empErr: unknown) {
          console.warn("⚠️ Could not fetch employee data:", empErr);
          // Set default empty data
          setEmployeeData({
            totalEmployees: 0,
            activeProjects: 0,
            completedProjects: 0,
            averagePerformance: 0,
            topPerformers: [],
            recentFeedback: [],
          });
        }

        setError(null);
      } catch (err: unknown) {
        console.error("❌ Error fetching HR dashboard data:", err);
        if (isAxiosError(err)) {
          console.error("❌ Error response:", err.response?.data);
          console.error("❌ Error status:", err.response?.status);
          const msg =
            (err.response?.data?.message as string) ||
            (err.response?.data?.error as string) ||
            "Failed to load dashboard data";
          setError(msg);
        } else if (err instanceof Error) {
          setError(err.message);
        } else {
          setError("Failed to load dashboard data");
        }
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const res = await api.get('/auth/me');
        console.log("🔐 Current User:", res.data);
      } catch (err) {
        console.error("❌ Error fetching user:", err);
      }
    };
    fetchUser();
  }, []);

  const handleSeedData = async () => {
    setSeeding(true);
    try {
      await api.post('/debug/seed');
      // Refresh dashboard data
      const res = await api.get<DashboardData>("/admin/dashboard");
      setData(res.data);
      alert('Sample data created successfully!');
    } catch (err: unknown) {
      console.error('Error seeding data:', err);
      const msg = isAxiosError(err) ? err.response?.data?.error || 'Failed to seed data' : 'Failed to seed data';
      alert(msg);
    } finally {
      setSeeding(false);
    }
  };

  const checkDatabaseData = async () => {
    try {
      const res = await api.get<{ jobsCount: number; applicationsCount: number; usersCount: number }>('/debug/data');
      console.log('Database data:', res.data);
      alert(
        `Database contains: ${res.data.jobsCount} jobs, ${res.data.applicationsCount} applications, ${res.data.usersCount} users`
      );
    } catch (err: unknown) {
      console.error('Error checking data:', err);
      alert('Failed to check database data');
    }
  };

  if (loading) return <div className="p-6">Loading dashboard...</div>;
  if (error)
    return (
      <div className="p-6">
        <div className="text-red-600 mb-4">Error: {error}</div>
        <div className="space-x-2">
          <button
            onClick={checkDatabaseData}
            className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
          >
            Check Database
          </button>
          <button
            onClick={handleSeedData}
            disabled={seeding}
            className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 disabled:bg-gray-400"
          >
            {seeding ? 'Creating Sample Data...' : 'Create Sample Data'}
          </button>
        </div>
      </div>
    );
  if (!data) return <div className="p-6 text-red-600">Failed to load dashboard data</div>;

  return (
    <div className="p-6 space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">HR Dashboard</h1>
        <div className="space-x-2"></div>
      </div>

      {/* Recruitment Stats */}
      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-lg font-semibold mb-4 text-blue-800">📋 Recruitment Overview</h2>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-4">
          <StatCard label="Total Jobs" value={data.totalJobs} color="blue" />
          <StatCard label="Open Jobs" value={data.openJobs} color="green" />
          <StatCard label="Closed Jobs" value={data.closedJobs} color="gray" />
          <StatCard label="Total Applications" value={data.totalApplications} color="purple" />
          <StatCard
            label="Avg Match Score"
            value={data.avgMatchScore ? data.avgMatchScore.toFixed(1) + '%' : '0%'}
            color="orange"
          />
        </div>
      </div>

      {/* Employee Performance Stats */}
      {employeeData && (
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-lg font-semibold mb-4 text-green-800">👥 Employee Performance Overview</h2>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            <StatCard label="Total Employees" value={employeeData.totalEmployees} color="blue" />
            <StatCard label="Active Projects" value={employeeData.activeProjects} color="green" />
            <StatCard label="Completed Projects" value={employeeData.completedProjects} color="purple" />
            <StatCard label="Avg Performance" value={employeeData.averagePerformance.toFixed(1) + '%'} color="orange" />
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Top Performers */}
        {employeeData && employeeData.topPerformers.length > 0 && (
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold">🏆 Top Performers</h2>
              <Link href="/hr/employees" className="text-sm text-blue-600 hover:text-blue-800">
                View All →
              </Link>
            </div>
            <div className="space-y-3">
              {employeeData.topPerformers.map((performer, index) => (
                <div
                  key={performer.employee._id}
                  className="flex items-center justify-between p-3 bg-gradient-to-r from-yellow-50 to-orange-50 rounded-lg border border-yellow-200"
                >
                  <div className="flex items-center space-x-3">
                    <div className="w-8 h-8 bg-yellow-500 text-white rounded-full flex items-center justify-center font-bold text-sm">
                      {index + 1}
                    </div>
                    <div>
                      <div className="font-medium">{performer.employee?.user?.name || 'Unknown Employee'}</div>
                      <div className="text-sm text-gray-600">{performer.employee?.position || 'No Position'}</div>
                      <div className="text-xs text-gray-500">
                        {performer.metrics?.projectsInvolved || 0} projects • {performer.metrics?.feedbackCount || 0}{' '}
                        feedback
                      </div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="font-bold text-green-600 text-lg">{performer.employee.performanceScore}%</div>
                    <div className="text-xs text-gray-500">{performer.metrics.averageRating.toFixed(1)}★ avg</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Recent Applications */}
        {data.recentApplications && data.recentApplications.length > 0 && (
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold">📋 Recent Applications</h2>
              <Link href="/hr/applications" className="text-sm text-blue-600 hover:text-blue-800">
                View All →
              </Link>
            </div>
            <div className="space-y-3">
              {data.recentApplications.map((app) => (
                <div key={app._id} className="flex justify-between items-center p-3 bg-gray-50 rounded">
                  <div>
                    <div className="font-medium">{app.name}</div>
                    <div className="text-sm text-gray-600">{app.email}</div>
                    <div className="text-sm text-gray-500">{app.job?.title}</div>
                  </div>
                  <div className="text-right">
                    <div className="font-semibold text-blue-600">{app.matchScore ? `${app.matchScore}%` : 'N/A'}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Recent Feedback */}
      {employeeData && employeeData.recentFeedback.length > 0 && (
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold">💬 Recent Feedback</h2>
            <Link href="/hr/feedback" className="text-sm text-blue-600 hover:text-blue-800">
              View All →
            </Link>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {employeeData.recentFeedback.slice(0, 4).map((feedback) => (
              <div key={feedback._id} className="p-4 bg-blue-50 rounded-lg border border-blue-200">
                <div className="flex items-center justify-between mb-2">
                  <div className="font-medium text-sm">{feedback.employee?.user?.name || 'Unknown Employee'}</div>
                  <div className="flex items-center space-x-1">
                    <span className="text-yellow-500">★</span>
                    <span className="text-sm font-medium">{feedback.overallRating || 0}/5</span>
                  </div>
                </div>
                <div className="text-xs text-gray-600 mb-1">{feedback.employee?.position || 'No Position'}</div>
                <div className="text-xs text-gray-500">
                  {feedback.type || 'Feedback'} by {feedback.reviewer?.name || 'Unknown'} •{' '}
                  {new Date(feedback.createdAt).toLocaleDateString()}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Quick Actions */}
      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-lg font-semibold mb-4">⚡ Quick Actions</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <QuickActionCard title="Manage Employees" description="View and manage employee profiles" icon="👥" href="/hr/employees" />

          <QuickActionCard title="Give Feedback" description="Provide employee feedback" icon="💬" href="/hr/feedback/give" />
          <QuickActionCard title="Performance Reports" description="View performance analytics" icon="📈" href="/hr/reports" />
        </div>
      </div>

      {/* Show message if no data */}
      {data.totalJobs === 0 && data.totalApplications === 0 && (
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6 text-center">
          <h3 className="text-lg font-medium text-yellow-800 mb-2">No Data Found</h3>
          <p className="text-yellow-700 mb-4">Your database appears to be empty. Would you like to create some sample data?</p>
          <button
            onClick={handleSeedData}
            disabled={seeding}
            className="px-4 py-2 bg-yellow-600 text-white rounded hover:bg-yellow-700 disabled:bg-gray-400"
          >
            {seeding ? 'Creating Sample Data...' : 'Create Sample Data'}
          </button>
        </div>
      )}
    </div>
  );
}

function StatCard({ label, value, color = 'blue' }: { label: string; value: string | number; color?: string }) {
  const colorClasses = {
    blue: 'text-blue-700 bg-blue-50 border-blue-200',
    green: 'text-green-700 bg-green-50 border-green-200',
    purple: 'text-purple-700 bg-purple-50 border-purple-200',
    orange: 'text-orange-700 bg-orange-50 border-orange-200',
    gray: 'text-gray-700 bg-gray-50 border-gray-200',
  };

  return (
    <div className={`p-4 rounded-lg border text-center ${colorClasses[color as keyof typeof colorClasses] || colorClasses.blue}`}>
      <div className="text-gray-600 text-sm font-medium">{label}</div>
      <div className="text-xl font-bold mt-1">{value}</div>
    </div>
  );
}

function QuickActionCard({ title, description, icon, href }: { title: string; description: string; icon: string; href: string }) {
  return (
    <Link href={href} className="p-4 border border-gray-200 rounded-lg hover:border-blue-300 hover:shadow-md transition-all group">
      <div className="text-center">
        <div className="text-2xl mb-2 group-hover:scale-110 transition-transform">{icon}</div>
        <h3 className="font-medium text-gray-900 mb-1">{title}</h3>
        <p className="text-xs text-gray-600">{description}</p>
      </div>
    </Link>
  );
}
