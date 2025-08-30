'use client';

import { useEffect, useState } from 'react';
import api from '@/lib/api';
import Link from 'next/link';

interface Stats {
  jobsCount: number;
  applicationsCount: number;
  hrCount: number;
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
      setRecentActivity(activityRes.data);
    } catch (err) {
      console.error('Error fetching admin data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
    
    // Refresh data every 30 seconds to keep counts updated
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
    { label: 'Verify HR Accounts', href: '/admin/users/verification', count: stats?.pendingHRVerifications, color: 'bg-yellow-500' },
    { label: 'Approve Jobs', href: '/admin/jobs/pending', count: stats?.pendingJobApprovals, color: 'bg-orange-500' },
    { label: 'Review Jobs', href: '/admin/jobs', count: stats?.activeJobs, color: 'bg-blue-500' },
    { label: 'Support Tickets', href: '/admin/support/tickets', count: 0, color: 'bg-red-500' }
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Admin Dashboard</h1>
          <p className="text-gray-600">Platform overview and management</p>
        </div>
        <div className="text-sm text-gray-500">
          Last updated: {new Date().toLocaleString()}
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <StatCard 
          label="Total Users" 
          value={(stats?.hrCount || 0) + (stats?.candidateCount || 0)} 
          icon="👥"
          trend="+12% this month"
          color="bg-blue-500"
        />
        <StatCard 
          label="Active Jobs" 
          value={stats?.activeJobs || stats?.jobsCount} 
          icon="💼"
          trend="+5% this week"
          color="bg-green-500"
        />
        <StatCard 
          label="Applications" 
          value={stats?.applicationsCount} 
          icon="📄"
          trend="+18% this month"
          color="bg-purple-500"
        />
        <StatCard 
          label="Match Score Avg" 
          value={stats?.avgMatchScore} 
          icon="🎯"
          trend="↑ 2.3% improvement"
          color="bg-orange-500"
        />
      </div>

      {/* Detailed Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <StatCard label="HR Users" value={stats?.hrCount} icon="🏢" />
        <StatCard label="Candidates" value={stats?.candidateCount} icon="👤" />
        <StatCard label="Total Interviews" value={stats?.totalInterviews} icon="📅" />
        <StatCard label="Upcoming Interviews" value={stats?.upcomingInterviews} icon="⏰" />
      </div>

      {/* Additional Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <StatCard label="Departments" value={stats?.departmentsCount} icon="🏛️" />
        <StatCard label="Job Roles" value={stats?.rolesCount} icon="📋" />
        <StatCard label="Pending Applications" value={stats?.pendingApplications} icon="⏳" />
        <StatCard label="Pending HR Verifications" value={stats?.pendingHRVerifications} icon="✅" />
      </div>

      {/* Quick Actions & Recent Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Quick Actions */}
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
                {action.count > 0 && (
                  <span className="bg-red-100 text-red-800 text-xs font-medium px-2 py-1 rounded-full">
                    {action.count}
                  </span>
                )}
              </Link>
            ))}
          </div>
        </div>

        {/* Recent Activity */}
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
                <div className="text-4xl mb-2">📊</div>
                <p>No recent activity</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Recent Activity Summary */}
      {stats?.recentActivity && (
        <div className="bg-white rounded-lg shadow-sm border p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">This Week's Activity</h2>
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
  icon, 
  trend, 
  color = 'bg-gray-500' 
}: { 
  label: string; 
  value: number | string | undefined; 
  icon?: string;
  trend?: string;
  color?: string;
}) {
  return (
    <div className="bg-white rounded-lg shadow-sm border p-6">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-gray-600">{label}</p>
          <p className="text-2xl font-bold text-gray-900">{value || 0}</p>
          {trend && (
            <p className="text-xs text-green-600 mt-1">{trend}</p>
          )}
        </div>
        {icon && (
          <div className={`w-12 h-12 ${color} rounded-lg flex items-center justify-center text-white text-xl`}>
            {icon}
          </div>
        )}
      </div>
    </div>
  );
}
