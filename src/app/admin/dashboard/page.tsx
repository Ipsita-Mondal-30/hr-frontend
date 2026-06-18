'use client';

import { useEffect, useState } from 'react';
import api from '@/lib/api';
import Link from 'next/link';
import {
  Users,
  UserCheck,
  FolderOpen,
  Briefcase,
  FileText,
  Calendar,
  Clock,
  Building2,
  ClipboardList,
  ShieldCheck,
  BarChart3,
  type LucideIcon,
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

type StatColor = 'blue' | 'green' | 'purple' | 'orange' | 'slate' | 'yellow' | 'red';

export default function AdminDashboard() {
  const [stats, setStats] = useState<Stats | null>(null);
  const [recentActivity, setRecentActivity] = useState<RecentActivity[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchData = async () => {
    try {
      const [statsRes, activityRes] = await Promise.all([
        api.get('/admin/stats'),
        api.get('/admin/recent-activity'),
      ]);
      setStats(statsRes.data);
      setRecentActivity(activityRes.data);
    } catch (err) {
      console.error('Error fetching admin data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
    const interval = setInterval(fetchData, 30000);
    return () => clearInterval(interval);
  }, []);

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-1/3 mb-6"></div>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
            {[...Array(8)].map((_, i) => (
              <div key={i} className="h-24 bg-gray-200 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  const quickActions = [
    { label: 'Manage Employees', href: '/admin/employees', count: stats?.employeeCount, color: 'bg-blue-500' },
    { label: 'Create Project', href: '/admin/projects/create', count: undefined, color: 'bg-green-500' },
    { label: 'Verify HR Accounts', href: '/admin/users/verification', count: stats?.pendingHRVerifications, color: 'bg-yellow-500' },
    { label: 'View Projects', href: '/admin/projects', count: stats?.projectCount, color: 'bg-purple-500' },
    { label: 'Approve Jobs', href: '/admin/jobs/pending', count: stats?.pendingJobApprovals, color: 'bg-orange-500' },
    { label: 'Support Tickets', href: '/admin/support/tickets', count: 0, color: 'bg-red-500' },
  ];

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Admin Dashboard</h1>
          <p className="text-gray-600">Platform overview and management</p>
        </div>
        <div className="text-sm text-gray-500">Last updated: {new Date().toLocaleString()}</div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <StatCard label="Total Employees" value={stats?.employeeCount || 0} icon={Users} color="blue" trend="+3 new hires this month" />
        <StatCard label="Active Projects" value={stats?.projectCount || 0} icon={FolderOpen} color="green" trend="+2 projects started" />
        <StatCard label="HR Staff" value={stats?.hrCount} icon={UserCheck} color="purple" trend="Managing operations" />
        <StatCard label="Candidates" value={stats?.candidateCount} icon={Users} color="orange" trend="+18% this month" />
      </div>

      <div className="bg-white rounded-lg shadow-sm border p-6">
        <div className="flex justify-between items-center mb-4">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
              <BarChart3 className="w-5 h-5 text-blue-600" />
            </div>
            <h2 className="text-lg font-semibold text-gray-900">Employee Performance Overview</h2>
          </div>
          <Link href="/admin/employees" className="text-blue-600 hover:text-blue-800 text-sm">
            View All Employees →
          </Link>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <StatCard label="Active Employees" value={stats?.employeeCount || 0} icon={Users} color="blue" />
          <StatCard label="Active Projects" value={stats?.projectCount || 0} icon={FolderOpen} color="green" />
          <StatCard label="Total Applications" value={stats?.applicationsCount || 0} icon={FileText} color="yellow" />
          <StatCard label="HR Users" value={stats?.hrCount || 0} icon={UserCheck} color="purple" />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <StatCard label="Active Jobs" value={stats?.activeJobs || stats?.jobsCount} icon={Briefcase} color="blue" />
        <StatCard label="Applications" value={stats?.applicationsCount} icon={FileText} color="purple" />
        <StatCard label="Total Interviews" value={stats?.totalInterviews} icon={Calendar} color="green" />
        <StatCard label="Upcoming Interviews" value={stats?.upcomingInterviews} icon={Clock} color="orange" />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <StatCard label="Departments" value={stats?.departmentsCount} icon={Building2} color="slate" href="/admin/settings/departments" />
        <StatCard label="Job Roles" value={stats?.rolesCount} icon={ClipboardList} color="blue" href="/admin/settings/roles" />
        <StatCard label="Pending Applications" value={stats?.pendingApplications} icon={Clock} color="yellow" />
        <StatCard label="Pending HR Verifications" value={stats?.pendingHRVerifications} icon={ShieldCheck} color="green" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-lg shadow-sm border p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h2>
          <div className="space-y-3">
            {quickActions.map((action, index) => (
              <Link
                key={index}
                href={action.href}
                className="flex items-center justify-between p-3 rounded-lg border hover:bg-gray-50 transition-colors"
              >
                <div className="flex items-center space-x-3">
                  <div className={`w-3 h-3 rounded-full ${action.color}`}></div>
                  <span className="font-medium text-gray-900">{action.label}</span>
                </div>
                {action.count !== undefined && action.count > 0 && (
                  <span className="bg-red-100 text-red-800 text-xs font-medium px-2 py-1 rounded-full">
                    {action.count}
                  </span>
                )}
              </Link>
            ))}
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm border p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Recent Activity</h2>
          <div className="space-y-3">
            {recentActivity.length > 0 ? (
              recentActivity.slice(0, 6).map((activity, index) => (
                <div key={index} className="flex items-start space-x-3 text-sm">
                  <div className="flex-shrink-0 w-2 h-2 bg-blue-500 rounded-full mt-2"></div>
                  <div className="flex-1">
                    <p className="text-gray-900">{activity.message}</p>
                    <p className="text-gray-500 text-xs">{new Date(activity.timestamp).toLocaleString()}</p>
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center py-8 text-gray-500">
                <BarChart3 className="w-10 h-10 mx-auto mb-2 text-gray-300" />
                <p>No recent activity</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {stats?.recentActivity && (
        <div className="bg-white rounded-lg shadow-sm border p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">This Week&apos;s Activity</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-600">{stats.recentActivity.newCandidates}</div>
              <div className="text-sm text-gray-600">New Candidates</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600">{stats.recentActivity.newHRs}</div>
              <div className="text-sm text-gray-600">New HR Users</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-purple-600">{stats.recentActivity.newJobs}</div>
              <div className="text-sm text-gray-600">Jobs Posted</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-orange-600">{stats.recentActivity.newApplications}</div>
              <div className="text-sm text-gray-600">Applications</div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function StatCard({
  label,
  value,
  icon: Icon,
  trend,
  color = 'blue',
  href,
}: {
  label: string;
  value: number | string | undefined;
  icon: LucideIcon;
  trend?: string;
  color?: StatColor;
  href?: string;
}) {
  const colorClasses: Record<StatColor, string> = {
    blue: 'from-blue-500 to-blue-600 bg-blue-50 border-blue-200 text-blue-700',
    green: 'from-emerald-500 to-emerald-600 bg-emerald-50 border-emerald-200 text-emerald-700',
    purple: 'from-purple-500 to-purple-600 bg-purple-50 border-purple-200 text-purple-700',
    orange: 'from-orange-500 to-orange-600 bg-orange-50 border-orange-200 text-orange-700',
    slate: 'from-slate-500 to-slate-600 bg-slate-50 border-slate-200 text-slate-700',
    yellow: 'from-yellow-500 to-yellow-600 bg-yellow-50 border-yellow-200 text-yellow-700',
    red: 'from-red-500 to-red-600 bg-red-50 border-red-200 text-red-700',
  };

  const selectedColor = colorClasses[color] || colorClasses.blue;
  const [gradient, gradientEnd, ...rest] = selectedColor.split(' ');

  const card = (
    <div className={`relative p-6 rounded-xl border ${rest.join(' ')} hover:shadow-lg transition-all duration-300 overflow-hidden ${href ? 'cursor-pointer' : ''}`}>
      <div className="absolute top-0 right-0 w-20 h-20 opacity-10">
        <div className={`w-full h-full bg-gradient-to-br ${gradient} ${gradientEnd} rounded-full transform translate-x-6 -translate-y-6`} />
      </div>
      <div className="relative flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-gray-600">{label}</p>
          <p className="text-2xl font-bold text-gray-900">{value ?? 0}</p>
          {trend && <p className="text-xs text-emerald-600 mt-1">{trend}</p>}
        </div>
        <div className={`w-12 h-12 bg-gradient-to-br ${gradient} ${gradientEnd} rounded-xl flex items-center justify-center shadow-lg`}>
          <Icon className="w-6 h-6 text-white" />
        </div>
      </div>
    </div>
  );

  if (href) {
    return <Link href={href}>{card}</Link>;
  }

  return card;
}
