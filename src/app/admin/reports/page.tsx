'use client';

import { useEffect, useState, useCallback } from 'react';
import api from '@/lib/api';

interface PlatformAnalytics {
  totalUsers: number;
  totalJobs: number;
  totalApplications: number;
  activeJobs: number;
  activeCandidates: number;
  activeHRs: number;
  averageMatchScore: number;
  conversionRate: number;
  monthlyGrowth: {
    users: number;
    jobs: number;
    applications: number;
  };
  topSkills: Array<{ skill: string; count: number }>;
  topCompanies: Array<{ company: string; jobsPosted: number; applications: number }>;
  applicationsByStatus: Array<{ status: string; count: number }>;
  jobsByDepartment: Array<{ department: string; count: number }>;
  userActivity: Array<{ date: string; newUsers: number; newJobs: number; newApplications: number }>;
}

type TimeRange = '7d' | '30d' | '90d' | '1y';

export default function AdminReports() {
  const [analytics, setAnalytics] = useState<PlatformAnalytics | null>(null);
  const [loading, setLoading] = useState(true);
  const [timeRange, setTimeRange] = useState<TimeRange>('30d');

  const fetchAnalytics = useCallback(async () => {
    try {
      const res = await api.get(`/admin/analytics?range=${timeRange}`);
      setAnalytics(res.data);
    } catch (err) {
      console.error('Failed to fetch analytics:', err);
    } finally {
      setLoading(false);
    }
  }, [timeRange]);

  useEffect(() => {
    fetchAnalytics();
  }, [fetchAnalytics]);

  const exportReport = async (format: 'csv' | 'pdf') => {
    try {
      const res = await api.get(`/admin/reports/export?format=${format}&range=${timeRange}`, {
        responseType: 'blob'
      });

      const blob = new Blob([res.data]);
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `platform-report-${timeRange}.${format}`;
      link.click();
      window.URL.revokeObjectURL(url);
    } catch (err) {
      console.error('Failed to export report:', err);
      alert('Failed to export report');
    }
  };

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

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Platform Analytics</h1>
          <p className="text-gray-600">Comprehensive platform insights and metrics</p>
        </div>
        <div className="flex space-x-3">
          <select
            value={timeRange}
            onChange={(e) => setTimeRange(e.target.value as TimeRange)}
            className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="7d">Last 7 days</option>
            <option value="30d">Last 30 days</option>
            <option value="90d">Last 90 days</option>
            <option value="1y">Last year</option>
          </select>
          <button
            onClick={() => exportReport('csv')}
            className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700"
          >
            Export CSV
          </button>
          <button
            onClick={() => exportReport('pdf')}
            className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700"
          >
            Export PDF
          </button>
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <MetricCard
          title="Total Users"
          value={analytics?.totalUsers || 0}
          change={analytics?.monthlyGrowth.users || 0}
          icon="👥"
          color="bg-blue-500"
        />
        <MetricCard
          title="Active Jobs"
          value={analytics?.activeJobs || 0}
          change={analytics?.monthlyGrowth.jobs || 0}
          icon="💼"
          color="bg-green-500"
        />
        <MetricCard
          title="Applications"
          value={analytics?.totalApplications || 0}
          change={analytics?.monthlyGrowth.applications || 0}
          icon="📄"
          color="bg-purple-500"
        />
        <MetricCard
          title="Match Score Avg"
          value={`${analytics?.averageMatchScore || 0}%`}
          change={2.3}
          icon="🎯"
          color="bg-orange-500"
        />
      </div>

      {/* Secondary Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white rounded-lg shadow-sm border p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">User Breakdown</h3>
          <div className="space-y-3">
            <div className="flex justify-between items-center">
              <span className="text-gray-600">Active Candidates</span>
              <span className="font-semibold text-green-600">{analytics?.activeCandidates || 0}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-600">Active HR Users</span>
              <span className="font-semibold text-blue-600">{analytics?.activeHRs || 0}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-600">Conversion Rate</span>
              <span className="font-semibold text-purple-600">{analytics?.conversionRate || 0}%</span>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm border p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Application Status</h3>
          <div className="space-y-3">
            {analytics?.applicationsByStatus.map((item, index) => (
              <div key={index} className="flex justify-between items-center">
                <span className="text-gray-600 capitalize">{item.status}</span>
                <span className="font-semibold">{item.count}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm border p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Jobs by Department</h3>
          <div className="space-y-3">
            {analytics?.jobsByDepartment.slice(0, 5).map((item, index) => (
              <div key={index} className="flex justify-between items-center">
                <span className="text-gray-600">{item.department}</span>
                <span className="font-semibold">{item.count}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Top Skills */}
      <div className="bg-white rounded-lg shadow-sm border p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Most In-Demand Skills</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
          {analytics?.topSkills.slice(0, 12).map((skill, index) => (
            <div key={index} className="text-center p-3 bg-gray-50 rounded-lg">
              <div className="text-sm font-medium text-gray-900">{skill.skill}</div>
              <div className="text-xs text-gray-500">{skill.count} jobs</div>
            </div>
          ))}
        </div>
      </div>

      {/* Top Companies */}
      <div className="bg-white rounded-lg shadow-sm border p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Top Hiring Companies</h3>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Company
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Jobs Posted
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Applications Received
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Avg Applications/Job
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {analytics?.topCompanies.slice(0, 10).map((company, index) => (
                <tr key={index} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                    {company.company}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {company.jobsPosted}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {company.applications}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {company.jobsPosted > 0 ? Math.round(company.applications / company.jobsPosted) : 0}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Activity Chart Placeholder */}
      <div className="bg-white rounded-lg shadow-sm border p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Platform Activity Over Time</h3>
        <div className="h-64 flex items-center justify-center bg-gray-50 rounded-lg">
          <div className="text-center">
            <div className="text-gray-400 text-4xl mb-2">📊</div>
            <p className="text-gray-500">Activity chart would be displayed here</p>
            <p className="text-xs text-gray-400 mt-1">Integration with charting library needed</p>
          </div>
        </div>
      </div>

      {/* Recent Activity Summary */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white rounded-lg shadow-sm border p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Growth Trends</h3>
          <div className="space-y-4">
            <div className="flex items-center justify-between p-3 bg-blue-50 rounded-lg">
              <div>
                <div className="text-sm font-medium text-blue-900">User Growth</div>
                <div className="text-xs text-blue-600">Monthly increase</div>
              </div>
              <div className="text-lg font-bold text-blue-600">
                +{analytics?.monthlyGrowth.users || 0}%
              </div>
            </div>
            <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg">
              <div>
                <div className="text-sm font-medium text-green-900">Job Postings</div>
                <div className="text-xs text-green-600">Monthly increase</div>
              </div>
              <div className="text-lg font-bold text-green-600">
                +{analytics?.monthlyGrowth.jobs || 0}%
              </div>
            </div>
            <div className="flex items-center justify-between p-3 bg-purple-50 rounded-lg">
              <div>
                <div className="text-sm font-medium text-purple-900">Applications</div>
                <div className="text-xs text-purple-600">Monthly increase</div>
              </div>
              <div className="text-lg font-bold text-purple-600">
                +{analytics?.monthlyGrowth.applications || 0}%
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm border p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Quick Insights</h3>
          <div className="space-y-3 text-sm">
            <div className="p-3 bg-yellow-50 rounded-lg">
              <div className="font-medium text-yellow-900">Peak Activity</div>
              <div className="text-yellow-700">Most applications submitted on Tuesdays</div>
            </div>
            <div className="p-3 bg-green-50 rounded-lg">
              <div className="font-medium text-green-900">High Demand</div>
              <div className="text-green-700">Tech roles have 3x more applications</div>
            </div>
            <div className="p-3 bg-blue-50 rounded-lg">
              <div className="font-medium text-blue-900">User Engagement</div>
              <div className="text-blue-700">Average session duration: 12 minutes</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function MetricCard({ 
  title, 
  value, 
  change, 
  icon, 
  color 
}: { 
  title: string; 
  value: number | string; 
  change: number; 
  icon: string; 
  color: string; 
}) {
  return (
    <div className="bg-white rounded-lg shadow-sm border p-6">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-gray-600">{title}</p>
          <p className="text-2xl font-bold text-gray-900">{value}</p>
          <p className={`text-xs mt-1 ${change >= 0 ? 'text-green-600' : 'text-red-600'}`}>
            {change >= 0 ? '↗' : '↘'} {Math.abs(change)}% from last period
          </p>
        </div>
        <div className={`w-12 h-12 ${color} rounded-lg flex items-center justify-center text-white text-xl`}>
          {icon}
        </div>
      </div>
    </div>
  );
}
