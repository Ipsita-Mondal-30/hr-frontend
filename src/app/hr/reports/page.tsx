'use client';

import { useEffect, useState, useCallback } from 'react';
import api from '@/lib/api';
import { showToast } from '@/lib/toast';

interface AnalyticsData {
  summary: {
    totalApplications: number;
    pendingApplications: number;
    reviewedApplications: number;
    shortlistedApplications: number;
    rejectedApplications: number;
    conversionRate: number;
    responseRate: number;
  };
  matchScoreStats: {
    avgScore: number;
    minScore: number;
    maxScore: number;
  };
  applicationsByJob: Array<{
    jobTitle: string;
    companyName: string;
    count: number;
    avgScore: number;
  }>;
  applicationsByMonth: Array<{
    month: string;
    count: number;
  }>;
}

export default function HRReportsPage() {
  const [analytics, setAnalytics] = useState<AnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [dateRange, setDateRange] = useState({
    startDate: '',
    endDate: '',
  });

  const fetchAnalytics = useCallback(async () => {
    try {
      const params = new URLSearchParams();
      if (dateRange.startDate) params.append('startDate', dateRange.startDate);
      if (dateRange.endDate) params.append('endDate', dateRange.endDate);

      const res = await api.get<AnalyticsData>(`/hr/analytics?${params.toString()}`);
      setAnalytics(res.data);
    } catch (err) {
      console.error('Failed to fetch analytics:', err);
      setAnalytics(null);
    } finally {
      setLoading(false);
    }
  }, [dateRange.startDate, dateRange.endDate]);

  useEffect(() => {
    fetchAnalytics();
  }, [fetchAnalytics]);

  const handleDateRangeChange = (field: keyof typeof dateRange, value: string) => {
    setDateRange((prev) => ({ ...prev, [field]: value }));
  };

  const applyDateFilter = () => {
    setLoading(true);
    fetchAnalytics();
  };

  const exportData = async () => {
    try {
      const response = await api.get('/hr/export-applications?format=csv', {
        responseType: 'blob',
      });

      const blob = new Blob([response.data], { type: 'text/csv' });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = 'applications_report.csv';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
    } catch (err) {
      console.error('Failed to export data:', err);
      showToast.error('Failed to export data');
    }
  };

  if (loading) {
    return (
      <div className="p-6">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-1/4 mb-6"></div>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="h-24 bg-gray-200 rounded"></div>
            ))}
          </div>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="h-64 bg-gray-200 rounded"></div>
            <div className="h-64 bg-gray-200 rounded"></div>
          </div>
        </div>
      </div>
    );
  }

  if (!analytics) {
    return (
      <div className="p-6">
        <div className="text-center py-12">
          <div className="text-gray-400 text-6xl mb-4">📊</div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">No analytics data available</h3>
          <p className="text-gray-500">Check back once you have some applications.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6">
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">HR Reports & Analytics</h1>
          <p className="text-gray-600">Track your recruitment performance and insights</p>
        </div>
        <button onClick={exportData} className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700">
          📊 Export Data
        </button>
      </div>

      {/* Date Range Filter */}
      <div className="bg-white p-4 rounded-lg shadow-sm border mb-6">
        <div className="flex items-center space-x-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Start Date</label>
            <input
              type="date"
              value={dateRange.startDate}
              onChange={(e) => handleDateRangeChange('startDate', e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">End Date</label>
            <input
              type="date"
              value={dateRange.endDate}
              onChange={(e) => handleDateRangeChange('endDate', e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div className="pt-6">
            <button onClick={applyDateFilter} className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700">
              Apply Filter
            </button>
          </div>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <StatCard title="Total Applications" value={analytics.summary.totalApplications} icon="📋" color="bg-blue-50 text-blue-600" />
        <StatCard title="Pending Review" value={analytics.summary.pendingApplications} icon="⏳" color="bg-yellow-50 text-yellow-600" />
        <StatCard title="Shortlisted" value={analytics.summary.shortlistedApplications} icon="✅" color="bg-green-50 text-green-600" />
        <StatCard title="Conversion Rate" value={`${analytics.summary.conversionRate}%`} icon="📈" color="bg-purple-50 text-purple-600" />
      </div>

      {/* Detailed Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <div className="bg-white p-4 rounded-lg shadow-sm border">
          <h3 className="font-semibold text-gray-900 mb-2">Response Rate</h3>
          <div className="text-2xl font-bold text-blue-600">{analytics.summary.responseRate}%</div>
          <p className="text-sm text-gray-500">Applications reviewed</p>
        </div>

        <div className="bg-white p-4 rounded-lg shadow-sm border">
          <h3 className="font-semibold text-gray-900 mb-2">Average Match Score</h3>
          <div className="text-2xl font-bold text-green-600">
            {analytics.matchScoreStats.avgScore ? Math.round(analytics.matchScoreStats.avgScore) : 0}%
          </div>
          <p className="text-sm text-gray-500">
            Range: {analytics.matchScoreStats.minScore || 0}% - {analytics.matchScoreStats.maxScore || 0}%
          </p>
        </div>

        <div className="bg-white p-4 rounded-lg shadow-sm border">
          <h3 className="font-semibold text-gray-900 mb-2">Rejection Rate</h3>
          <div className="text-2xl font-bold text-red-600">
            {analytics.summary.totalApplications > 0
              ? Math.round((analytics.summary.rejectedApplications / analytics.summary.totalApplications) * 100)
              : 0}
            %
          </div>
          <p className="text-sm text-gray-500">{analytics.summary.rejectedApplications} rejected</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Applications by Job */}
        <div className="bg-white p-6 rounded-lg shadow-sm border">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Applications by Job</h2>

          {analytics.applicationsByJob.length === 0 ? (
            <p className="text-gray-500 text-center py-8">No job data available</p>
          ) : (
            <div className="space-y-4">
              {analytics.applicationsByJob.map((job, index) => (
                <div key={index} className="flex justify-between items-center p-3 bg-gray-50 rounded">
                  <div className="flex-1">
                    <div className="font-medium text-gray-900">{job.jobTitle}</div>
                    <div className="text-sm text-gray-500">{job.companyName}</div>
                  </div>
                  <div className="text-right">
                    <div className="font-semibold text-blue-600">{job.count} applications</div>
                    <div className="text-sm text-gray-500">Avg Score: {job.avgScore ? Math.round(job.avgScore) : 0}%</div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Applications Timeline */}
        <div className="bg-white p-6 rounded-lg shadow-sm border">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Applications Timeline</h2>

          {analytics.applicationsByMonth.length === 0 ? (
            <p className="text-gray-500 text-center py-8">No timeline data available</p>
          ) : (
            <div className="space-y-3">
              {analytics.applicationsByMonth.slice(-6).map((month, index) => (
                <div key={index} className="flex justify-between items-center">
                  <span className="text-sm font-medium text-gray-700">
                    {new Date(month.month + '-01').toLocaleDateString('en-US', { year: 'numeric', month: 'long' })}
                  </span>
                  <div className="flex items-center">
                    <div className="w-32 bg-gray-200 rounded-full h-2 mr-3">
                      <div
                        className="bg-blue-600 h-2 rounded-full"
                        style={{
                          width: `${Math.min(
                            (month.count / Math.max(...analytics.applicationsByMonth.map((m) => m.count))) * 100,
                            100
                          )}%`,
                        }}
                      ></div>
                    </div>
                    <span className="text-sm font-semibold text-gray-900 w-8 text-right">{month.count}</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Status Breakdown */}
      <div className="mt-6 bg-white p-6 rounded-lg shadow-sm border">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Application Status Breakdown</h2>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="text-center">
            <div className="text-2xl font-bold text-yellow-600">{analytics.summary.pendingApplications}</div>
            <div className="text-sm text-gray-500">Pending</div>
            <div className="text-xs text-gray-400">
              {analytics.summary.totalApplications > 0
                ? Math.round((analytics.summary.pendingApplications / analytics.summary.totalApplications) * 100)
                : 0}
              %
            </div>
          </div>

          <div className="text-center">
            <div className="text-2xl font-bold text-blue-600">{analytics.summary.reviewedApplications}</div>
            <div className="text-sm text-gray-500">Reviewed</div>
            <div className="text-xs text-gray-400">
              {analytics.summary.totalApplications > 0
                ? Math.round((analytics.summary.reviewedApplications / analytics.summary.totalApplications) * 100)
                : 0}
              %
            </div>
          </div>

          <div className="text-center">
            <div className="text-2xl font-bold text-green-600">{analytics.summary.shortlistedApplications}</div>
            <div className="text-sm text-gray-500">Shortlisted</div>
            <div className="text-xs text-gray-400">
              {analytics.summary.totalApplications > 0
                ? Math.round((analytics.summary.shortlistedApplications / analytics.summary.totalApplications) * 100)
                : 0}
              %
            </div>
          </div>

          <div className="text-center">
            <div className="text-2xl font-bold text-red-600">{analytics.summary.rejectedApplications}</div>
            <div className="text-sm text-gray-500">Rejected</div>
            <div className="text-xs text-gray-400">
              {analytics.summary.totalApplications > 0
                ? Math.round((analytics.summary.rejectedApplications / analytics.summary.totalApplications) * 100)
                : 0}
              %
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function StatCard({
  title,
  value,
  icon,
  color,
}: {
  title: string;
  value: string | number;
  icon: string;
  color: string;
}) {
  return (
    <div className="bg-white rounded-lg shadow-sm border p-4">
      <div className="flex items-center">
        <div className={`p-2 rounded-lg ${color} mr-3`}>
          <span className="text-lg">{icon}</span>
        </div>
        <div>
          <p className="text-sm font-medium text-gray-600">{title}</p>
          <p className="text-2xl font-bold text-gray-900">{value}</p>
        </div>
      </div>
    </div>
  );
}
