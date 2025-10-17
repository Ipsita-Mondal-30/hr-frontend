'use client';

import { useEffect, useState } from "react";
import Link from "next/link";
import api from "@/lib/api";
import { 
  Users, 
  Briefcase, 
  TrendingUp, 
  BarChart3, 
  UserCheck, 
  FolderOpen,
  Calendar,
  Target,
} from "lucide-react";

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

function isAxiosError(e: unknown): e is { response?: { data?: unknown; status?: number } } {
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
            api.get<ApiTopPerformersRes>("/admin/employees/top-performers?limit=5"),
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
          const respData = err.response?.data as { message?: string; error?: string } | undefined;
          const msg = respData?.message || respData?.error || "Failed to load dashboard data";
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
      const msg = isAxiosError(err) ? ((err.response?.data as { error?: string })?.error || 'Failed to seed data') : 'Failed to seed data';
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

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-slate-600 font-medium">Loading Dashboard</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-white rounded-xl shadow-sm border border-red-200 p-8">
        <div className="text-center">
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <BarChart3 className="w-8 h-8 text-red-600" />
          </div>
          <h2 className="text-xl font-semibold text-slate-900 mb-2">Dashboard Error</h2>
          <p className="text-red-600 mb-6">{error}</p>
          <div className="flex justify-center space-x-3">
            <button
              onClick={checkDatabaseData}
              className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
            >
              Check Database
            </button>
            <button
              onClick={handleSeedData}
              disabled={seeding}
              className="px-6 py-3 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 disabled:bg-slate-400 transition-colors font-medium"
            >
              {seeding ? 'Creating Sample Data...' : 'Create Sample Data'}
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (!data) {
    return (
      <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-8">
        <div className="text-center">
          <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <BarChart3 className="w-8 h-8 text-slate-400" />
          </div>
          <h2 className="text-xl font-semibold text-slate-900 mb-2">No Data Available</h2>
          <p className="text-slate-600">Failed to load dashboard data</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Enhanced Header with Time and Actions */}
      <div className="bg-gradient-to-r from-white to-blue-50 rounded-xl shadow-sm border border-slate-200 p-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl flex items-center justify-center shadow-lg">
              <UserCheck className="w-8 h-8 text-white" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-slate-900">HR Dashboard</h1>
              <p className="text-slate-600 mt-1">Manage your workforce and recruitment pipeline</p>
              <div className="flex items-center space-x-4 mt-2 text-sm text-slate-500">
                <span className="flex items-center">
                  <Calendar className="w-4 h-4 mr-1" />
                  {new Date().toLocaleDateString('en-US', { 
                    weekday: 'long', 
                    year: 'numeric', 
                    month: 'long', 
                    day: 'numeric' 
                  })}
                </span>
                <span>•</span>
                <span>Last updated: {new Date().toLocaleTimeString()}</span>
              </div>
            </div>
          </div>
          <div className="flex items-center space-x-3">
            <button className="flex items-center space-x-2 px-4 py-2 bg-white border border-slate-200 rounded-lg hover:bg-slate-50 transition-colors text-sm font-medium">
              <BarChart3 className="w-4 h-4" />
              <span>Export Report</span>
            </button>
            <button className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm font-medium">
              <Target className="w-4 h-4" />
              <span>Quick Actions</span>
            </button>
          </div>
        </div>
      </div>

      {/* Recruitment Stats */}
      <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
        <div className="flex items-center space-x-3 mb-6">
          <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
            <Briefcase className="w-5 h-5 text-blue-600" />
          </div>
          <h2 className="text-xl font-semibold text-slate-900">Recruitment Overview</h2>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-6">
          <StatCard 
            label="Total Jobs" 
            value={data.totalJobs} 
            icon={Briefcase} 
            color="blue" 
            trend="up" 
            trendValue="+12%" 
          />
          <StatCard 
            label="Open Jobs" 
            value={data.openJobs} 
            icon={Target} 
            color="green" 
            trend="up" 
            trendValue="+8%" 
          />
          <StatCard 
            label="Closed Jobs" 
            value={data.closedJobs} 
            icon={FolderOpen} 
            color="slate" 
            trend="neutral" 
          />
          <StatCard 
            label="Total Applications" 
            value={data.totalApplications} 
            icon={Users} 
            color="purple" 
            trend="up" 
            trendValue="+24%" 
          />
          <StatCard
            label="Avg Match Score"
            value={data.avgMatchScore ? data.avgMatchScore.toFixed(1) + '%' : '0%'}
            icon={TrendingUp}
            color="orange"
            trend="up"
            trendValue="+5.2%"
          />
        </div>
      </div>

      {/* Employee Performance Stats - FIXED: Removed duplicate props */}
      {employeeData && (
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-lg font-semibold mb-4 text-green-800">👥 Employee Performance Overview</h2>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            <StatCard label="Total Employees" value={employeeData.totalEmployees} icon={Users} color="blue" />
            <StatCard label="Active Projects" value={employeeData.activeProjects} icon={Target} color="green" />
            <StatCard label="Completed Projects" value={employeeData.completedProjects} icon={FolderOpen} color="purple" />
            <StatCard
              label="Avg Performance" 
              value={employeeData.averagePerformance.toFixed(1) + '%'} 
              icon={TrendingUp}
              color="orange" 
            />
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

function StatCard({ 
  label, 
  value, 
  icon: Icon, 
  color = 'blue',
  trend,
  trendValue 
}: { 
  label: string; 
  value: string | number; 
  icon: React.ComponentType<{ className?: string }>; 
  color?: string;
  trend?: 'up' | 'down' | 'neutral';
  trendValue?: string;
}) {
  const colorClasses = {
    blue: 'from-blue-500 to-blue-600 bg-blue-50 border-blue-200 text-blue-700',
    green: 'from-emerald-500 to-emerald-600 bg-emerald-50 border-emerald-200 text-emerald-700',
    purple: 'from-purple-500 to-purple-600 bg-purple-50 border-purple-200 text-purple-700',
    orange: 'from-orange-500 to-orange-600 bg-orange-50 border-orange-200 text-orange-700',
    slate: 'from-slate-500 to-slate-600 bg-slate-50 border-slate-200 text-slate-700',
  };
  
  const selectedColor = colorClasses[color as keyof typeof colorClasses] || colorClasses.blue;
  
  const getTrendIcon = () => {
    if (trend === 'up') return <TrendingUp className="w-3 h-3 text-emerald-600" />;
    if (trend === 'down') return <TrendingUp className="w-3 h-3 text-red-600 rotate-180" />;
    return null;
  };
  
  const getTrendColor = () => {
    if (trend === 'up') return 'text-emerald-600 bg-emerald-50';
    if (trend === 'down') return 'text-red-600 bg-red-50';
    return 'text-slate-600 bg-slate-50';
  };
  
  return (
    <div className={`relative p-6 rounded-xl border ${selectedColor.split(' ').slice(2).join(' ')} hover:shadow-lg hover:scale-105 transition-all duration-300 group overflow-hidden`}>
      {/* Background Pattern */}
      <div className="absolute top-0 right-0 w-20 h-20 opacity-10">
        <div className={`w-full h-full bg-gradient-to-br ${selectedColor.split(' ').slice(0, 2).join(' ')} rounded-full transform translate-x-6 -translate-y-6`}></div>
      </div>
      
      <div className="relative">
        <div className="flex items-center justify-between mb-4">
          <div className={`w-12 h-12 bg-gradient-to-br ${selectedColor.split(' ').slice(0, 2).join(' ')} rounded-xl flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform duration-300`}>
            <Icon className="w-6 h-6 text-white" />
          </div>
          {trend && trendValue && (
            <div className={`flex items-center space-x-1 px-2 py-1 rounded-full text-xs font-medium ${getTrendColor()}`}>
              {getTrendIcon()}
              <span>{trendValue}</span>
            </div>
          )}
        </div>
        
        <div>
          <div className="text-sm font-medium text-slate-600 mb-1">{label}</div>
          <div className="text-3xl font-bold text-slate-900">{value}</div>
        </div>
      </div>
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
