'use client';

import { useEffect, useState } from 'react';
import api from '@/lib/api';
import Link from 'next/link';
import { 
  Users, 
  Briefcase, 
  FileText, 
  TrendingUp, 
  Clock, 
  CheckCircle, 
  AlertCircle,
  Building,
  UserCheck,
  Calendar,
  BarChart3,
  Activity,
  ArrowUpRight
} from 'lucide-react';

interface Stats {
  jobsCount: number;
  applicationsCount: number;
  hrCount: number;
  count: number;
  candidateCount: number;
  departmentsCount: number;
  rolesCount: number;
  avgMatchScore: string;
  activeJobs: number;
  pendingApplications: number;
  pendingHRVerifications: number;
  pendingJobApprovals: number;
  totalInterviews: number;
  upcomingInterviews: number;
  recentActivity: {
    newCandidates: number;
    newHRs: number;
    newJobs: number;
    newApplications: number;
  };
  employeeCount?: number;
  projectCount?: number;
}

interface RecentActivity {
  type: 'user_registered' | 'job_posted' | 'application_submitted' | 'hr_verified';
  message: string;
  timestamp: string;
  user?: string;
}

export default function AdminDashboard() {
  const [stats, setStats] = useState<Stats | null>(null);
  const [recentActivity, setRecentActivity] = useState<RecentActivity[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchData = async () => {
    try {
      const [statsRes, activityRes] = await Promise.all([
        api.get('/admin/stats'),
        api.get('/admin/recent-activity')
      ]);
      setStats(statsRes.data);
      setRecentActivity(activityRes.data || []);
    } catch (error) {
      console.error('Error fetching admin dashboard data:', error);
      // Set default stats if API fails
      setStats({
        jobsCount: 0,
        applicationsCount: 0,
        hrCount: 0,
        count: 0,
        candidateCount: 0,
        departmentsCount: 0,
        rolesCount: 0,
        avgMatchScore: '0',
        activeJobs: 0,
        pendingApplications: 0,
        pendingHRVerifications: 0,
        pendingJobApprovals: 0,
        totalInterviews: 0,
        upcomingInterviews: 0,
        recentActivity: {
          newCandidates: 0,
          newHRs: 0,
          newJobs: 0,
          newApplications: 0
        },
        employeeCount: 0,
        projectCount: 0
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-slate-600 font-medium">Loading Dashboard</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-slate-900">Admin Dashboard</h1>
          <p className="text-slate-600 mt-2">Comprehensive overview of your HR system</p>
        </div>

        {/* Key Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-slate-600">Total Users</p>
                <p className="text-3xl font-bold text-slate-900">{stats?.count || 0}</p>
                <p className="text-xs text-green-600 mt-1">All system users</p>
              </div>
              <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                <Users className="w-6 h-6 text-blue-600" />
              </div>
            </div>
          </div>

          <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-slate-600">Active Jobs</p>
                <p className="text-3xl font-bold text-slate-900">{stats?.activeJobs || 0}</p>
                <p className="text-xs text-blue-600 mt-1">Currently open positions</p>
              </div>
              <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                <Briefcase className="w-6 h-6 text-green-600" />
              </div>
            </div>
          </div>

          <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-slate-600">Applications</p>
                <p className="text-3xl font-bold text-slate-900">{stats?.applicationsCount || 0}</p>
                <p className="text-xs text-purple-600 mt-1">Total applications received</p>
              </div>
              <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
                <FileText className="w-6 h-6 text-purple-600" />
              </div>
            </div>
          </div>

          <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-slate-600">Employees</p>
                <p className="text-3xl font-bold text-slate-900">{stats?.employeeCount || 0}</p>
                <p className="text-xs text-emerald-600 mt-1">Active employees</p>
              </div>
              <div className="w-12 h-12 bg-emerald-100 rounded-lg flex items-center justify-center">
                <UserCheck className="w-6 h-6 text-emerald-600" />
              </div>
            </div>
          </div>
        </div>

        {/* Pending Actions */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
          <Link
            href="/admin/jobs/pending"
            className="bg-white p-6 rounded-xl shadow-sm border border-slate-200 hover:shadow-md hover:border-slate-300 transition-all duration-200 group"
          >
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-semibold text-slate-900 mb-1">Pending Job Approvals</h3>
                <p className="text-2xl font-bold text-orange-600">{stats?.pendingJobApprovals || 0}</p>
                <p className="text-sm text-slate-600">Jobs awaiting approval</p>
              </div>
              <div className="w-10 h-10 bg-orange-100 rounded-lg flex items-center justify-center group-hover:bg-orange-200 transition-colors">
                <Clock className="w-5 h-5 text-orange-600" />
              </div>
            </div>
          </Link>

          <Link
            href="/admin/users/verification"
            className="bg-white p-6 rounded-xl shadow-sm border border-slate-200 hover:shadow-md hover:border-slate-300 transition-all duration-200 group"
          >
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-semibold text-slate-900 mb-1">HR Verifications</h3>
                <p className="text-2xl font-bold text-red-600">{stats?.pendingHRVerifications || 0}</p>
                <p className="text-sm text-slate-600">Pending HR approvals</p>
              </div>
              <div className="w-10 h-10 bg-red-100 rounded-lg flex items-center justify-center group-hover:bg-red-200 transition-colors">
                <AlertCircle className="w-5 h-5 text-red-600" />
              </div>
            </div>
          </Link>

          <Link
            href="/admin/interviews"
            className="bg-white p-6 rounded-xl shadow-sm border border-slate-200 hover:shadow-md hover:border-slate-300 transition-all duration-200 group"
          >
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-semibold text-slate-900 mb-1">Upcoming Interviews</h3>
                <p className="text-2xl font-bold text-blue-600">{stats?.upcomingInterviews || 0}</p>
                <p className="text-sm text-slate-600">Scheduled this week</p>
              </div>
              <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center group-hover:bg-blue-200 transition-colors">
                <Calendar className="w-5 h-5 text-blue-600" />
              </div>
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Link
            href="/admin/users"
            className="bg-white p-6 rounded-xl shadow-sm border border-slate-200 hover:shadow-md hover:border-slate-300 transition-all duration-200 group"
          >
            <div className="flex items-center space-x-4">
              <div className="w-12 h-12 bg-slate-100 rounded-lg flex items-center justify-center group-hover:bg-slate-200 transition-colors">
                <Users className="w-6 h-6 text-slate-600" />
              </div>
              <div>
                <h3 className="font-semibold text-slate-900">Manage Users</h3>
                <p className="text-sm text-slate-600">User administration</p>
              </div>
            </div>
          </Link>

          <Link
            href="/admin/employees"
            className="bg-white p-6 rounded-xl shadow-sm border border-slate-200 hover:shadow-md hover:border-slate-300 transition-all duration-200 group"
          >
            <div className="flex items-center space-x-4">
              <div className="w-12 h-12 bg-emerald-100 rounded-lg flex items-center justify-center group-hover:bg-emerald-200 transition-colors">
                <UserCheck className="w-6 h-6 text-emerald-600" />
              </div>
              <div>
                <h3 className="font-semibold text-slate-900">Employees</h3>
                <p className="text-sm text-slate-600">Employee management</p>
              </div>
            </div>
          </Link>

          <Link
            href="/admin/projects"
            className="bg-white p-6 rounded-xl shadow-sm border border-slate-200 hover:shadow-md hover:border-slate-300 transition-all duration-200 group"
          >
            <div className="flex items-center space-x-4">
              <div className="w-12 h-12 bg-indigo-100 rounded-lg flex items-center justify-center group-hover:bg-indigo-200 transition-colors">
                <Briefcase className="w-6 h-6 text-indigo-600" />
              </div>
              <div>
                <h3 className="font-semibold text-slate-900">Projects</h3>
                <p className="text-sm text-slate-600">Project oversight</p>
              </div>
            </div>
          </Link>

          <Link
            href="/admin/reports"
            className="bg-white p-6 rounded-xl shadow-sm border border-slate-200 hover:shadow-md hover:border-slate-300 transition-all duration-200 group"
          >
            <div className="flex items-center space-x-4">
              <div className="w-12 h-12 bg-violet-100 rounded-lg flex items-center justify-center group-hover:bg-violet-200 transition-colors">
                <BarChart3 className="w-6 h-6 text-violet-600" />
              </div>
              <div>
                <h3 className="font-semibold text-slate-900">Reports</h3>
                <p className="text-sm text-slate-600">Analytics & insights</p>
              </div>
            </div>
          </Link>
        </div>

        {/* Recent Activity */}
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-lg font-semibold text-slate-900">Recent Activity</h2>
            <Activity className="w-5 h-5 text-slate-400" />
          </div>
          <div className="space-y-4">
            {recentActivity.length > 0 ? (
              recentActivity.slice(0, 5).map((activity, index) => (
                <div key={index} className="flex items-center space-x-3 p-3 bg-slate-50 rounded-lg border border-slate-100">
                  <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                  <div className="flex-1">
                    <p className="text-sm font-medium text-slate-900">{activity.message}</p>
                    <p className="text-xs text-slate-500">{new Date(activity.timestamp).toLocaleString()}</p>
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center py-8">
                <Activity className="w-12 h-12 text-slate-300 mx-auto mb-3" />
                <p className="text-slate-500">No recent activity</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}