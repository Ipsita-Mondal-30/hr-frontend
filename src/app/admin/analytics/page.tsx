'use client';
import { useState, useEffect } from 'react';
import api from '@/lib/api';

interface AnalyticsData {
  overview: {
    totalJobs: number;
    totalApplications: number;
    totalInterviews: number;
    totalCandidates: number;
    totalHRUsers: number;
    activeJobs: number;
    pendingApplications: number;
    scheduledInterviews: number;
    hiredCandidates: number;
  };
  jobs: {
    total: number;
    active: number;
    pending: number;
    closed: number;
    thisMonth: number;
    thisWeek: number;
    growthRate: number;
  };
  applications: {
    total: number;
    pending: number;
    reviewed: number;
    shortlisted: number;
    rejected: number;
    thisMonth: number;
    thisWeek: number;
    growthRate: number;
  };
  interviews: {
    total: number;
    scheduled: number;
    completed: number;
    cancelled: number;
    thisMonth: number;
    thisWeek: number;
    avgRating: number;
    growthRate: number;
  };
  hiring: {
    totalHired: number;
    totalRejected: number;
    hiresThisMonth: number;
    hiresThisWeek: number;
    hireRate: number;
    growthRate: number;
  };
  users: {
    candidates: {
      total: number;
      thisMonth: number;
      thisWeek: number;
      growthRate: number;
    };
    hr: {
      total: number;
      verified: number;
      unverified: number;
      thisMonth: number;
      thisWeek: number;
      verificationRate: number;
      growthRate: number;
    };
  };
  performance: {
    topJobs: Array<{
      jobTitle: string;
      companyName: string;
      applicationCount: number;
    }>;
    topHRUsers: Array<{
      hrName: string;
      companyName: string;
      interviewCount: number;
    }>;
    conversionRates: {
      applicationToInterview: number;
      interviewToHire: number;
    };
  };
  trends: {
    jobsGrowth: 'up' | 'down';
    applicationsGrowth: 'up' | 'down';
    interviewsGrowth: 'up' | 'down';
    hiresGrowth: 'up' | 'down';
  };
}

export default function AnalyticsPage() {
  const [analytics, setAnalytics] = useState<AnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [exporting, setExporting] = useState<string | null>(null);

  useEffect(() => {
    fetchAnalytics();
  }, []);

  const fetchAnalytics = async () => {
    try {
      console.log('📊 Fetching comprehensive analytics...');
      const response = await api.get('/admin/analytics/comprehensive');
      setAnalytics(response.data);
      console.log('📊 Analytics loaded:', response.data);
    } catch (error) {
      console.error('Error fetching analytics:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleExport = async (type: string) => {
    try {
      setExporting(type);
      console.log(`📊 Exporting ${type} data...`);
      
      const response = await fetch(`/api/admin/export?type=${type}&format=csv`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      
      if (response.ok) {
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `${type}_export_${new Date().toISOString().split('T')[0]}.csv`;
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
        document.body.removeChild(a);
        console.log(`✅ ${type} data exported successfully`);
      } else {
        console.error('Export failed:', response.statusText);
      }
    } catch (error) {
      console.error('Error exporting data:', error);
    } finally {
      setExporting(null);
    }
  };

  const formatNumber = (num: number) => {
    return new Intl.NumberFormat().format(num);
  };

  const formatPercentage = (num: number) => {
    return `${num.toFixed(1)}%`;
  };

  const getGrowthIcon = (trend: 'up' | 'down') => {
    return trend === 'up' ? '📈' : '📉';
  };

  const getGrowthColor = (rate: number) => {
    if (rate > 0) return 'text-green-600';
    if (rate < 0) return 'text-red-600';
    return 'text-gray-600';
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 p-6">
        <div className="max-w-7xl mx-auto">
          <div className="animate-pulse">
            <div className="h-8 bg-gray-300 rounded w-64 mb-6"></div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
              {[...Array(8)].map((_, i) => (
                <div key={i} className="bg-white p-6 rounded-lg shadow-sm">
                  <div className="h-4 bg-gray-300 rounded w-24 mb-2"></div>
                  <div className="h-8 bg-gray-300 rounded w-16"></div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!analytics) {
    return (
      <div className="min-h-screen bg-gray-50 p-6">
        <div className="max-w-7xl mx-auto">
          <div className="text-center py-12">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Unable to Load Analytics</h2>
            <p className="text-gray-600 mb-4">There was an error loading the analytics data.</p>
            <button
              onClick={fetchAnalytics}
              className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
            >
              Retry
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Platform Analytics</h1>
            <p className="text-gray-600 mt-2">Comprehensive insights into your HR platform performance</p>
          </div>
          
          {/* Export Buttons */}
          <div className="flex space-x-2">
            {['jobs', 'applications', 'interviews', 'candidates', 'hr-users'].map((type) => (
              <button
                key={type}
                onClick={() => handleExport(type)}
                disabled={exporting === type}
                className="bg-green-600 text-white px-3 py-2 rounded-lg hover:bg-green-700 disabled:opacity-50 text-sm"
              >
                {exporting === type ? '⏳' : '📥'} {type.replace('-', ' ').toUpperCase()}
              </button>
            ))}
          </div>
        </div>

        {/* Overview Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6 mb-8">
          <div className="bg-white p-6 rounded-lg shadow-sm border-l-4 border-blue-500">
            <h3 className="text-sm font-medium text-gray-500 mb-2">Total Jobs</h3>
            <p className="text-3xl font-bold text-gray-900">{formatNumber(analytics.overview.totalJobs)}</p>
            <p className="text-sm text-gray-600 mt-1">{analytics.overview.activeJobs} active</p>
          </div>
          
          <div className="bg-white p-6 rounded-lg shadow-sm border-l-4 border-green-500">
            <h3 className="text-sm font-medium text-gray-500 mb-2">Applications</h3>
            <p className="text-3xl font-bold text-gray-900">{formatNumber(analytics.overview.totalApplications)}</p>
            <p className="text-sm text-gray-600 mt-1">{analytics.overview.pendingApplications} pending</p>
          </div>
          
          <div className="bg-white p-6 rounded-lg shadow-sm border-l-4 border-purple-500">
            <h3 className="text-sm font-medium text-gray-500 mb-2">Interviews</h3>
            <p className="text-3xl font-bold text-gray-900">{formatNumber(analytics.overview.totalInterviews)}</p>
            <p className="text-sm text-gray-600 mt-1">{analytics.overview.scheduledInterviews} scheduled</p>
          </div>
          
          <div className="bg-white p-6 rounded-lg shadow-sm border-l-4 border-orange-500">
            <h3 className="text-sm font-medium text-gray-500 mb-2">Candidates</h3>
            <p className="text-3xl font-bold text-gray-900">{formatNumber(analytics.overview.totalCandidates)}</p>
            <p className="text-sm text-gray-600 mt-1">registered users</p>
          </div>
          
          <div className="bg-white p-6 rounded-lg shadow-sm border-l-4 border-red-500">
            <h3 className="text-sm font-medium text-gray-500 mb-2">Hired</h3>
            <p className="text-3xl font-bold text-gray-900">{formatNumber(analytics.overview.hiredCandidates)}</p>
            <p className="text-sm text-gray-600 mt-1">successful hires</p>
          </div>
        </div>

        {/* Detailed Analytics */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
          {/* Jobs Analytics */}
          <div className="bg-white p-6 rounded-lg shadow-sm">
            <h2 className="text-xl font-bold text-gray-900 mb-4">📋 Jobs Analytics</h2>
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-gray-600">Total Jobs</span>
                <span className="font-semibold">{formatNumber(analytics.jobs.total)}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-600">Active Jobs</span>
                <span className="font-semibold text-green-600">{formatNumber(analytics.jobs.active)}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-600">Pending Approval</span>
                <span className="font-semibold text-yellow-600">{formatNumber(analytics.jobs.pending)}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-600">This Month</span>
                <span className={`font-semibold ${getGrowthColor(analytics.jobs.growthRate)}`}>
                  {formatNumber(analytics.jobs.thisMonth)} ({getGrowthIcon(analytics.trends.jobsGrowth)} {formatPercentage(analytics.jobs.growthRate)})
                </span>
              </div>
            </div>
          </div>

          {/* Applications Analytics */}
          <div className="bg-white p-6 rounded-lg shadow-sm">
            <h2 className="text-xl font-bold text-gray-900 mb-4">📝 Applications Analytics</h2>
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-gray-600">Total Applications</span>
                <span className="font-semibold">{formatNumber(analytics.applications.total)}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-600">Pending Review</span>
                <span className="font-semibold text-yellow-600">{formatNumber(analytics.applications.pending)}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-600">Shortlisted</span>
                <span className="font-semibold text-green-600">{formatNumber(analytics.applications.shortlisted)}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-600">This Month</span>
                <span className={`font-semibold ${getGrowthColor(analytics.applications.growthRate)}`}>
                  {formatNumber(analytics.applications.thisMonth)} ({getGrowthIcon(analytics.trends.applicationsGrowth)} {formatPercentage(analytics.applications.growthRate)})
                </span>
              </div>
            </div>
          </div>

          {/* Interviews Analytics */}
          <div className="bg-white p-6 rounded-lg shadow-sm">
            <h2 className="text-xl font-bold text-gray-900 mb-4">🎤 Interviews Analytics</h2>
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-gray-600">Total Interviews</span>
                <span className="font-semibold">{formatNumber(analytics.interviews.total)}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-600">Scheduled</span>
                <span className="font-semibold text-blue-600">{formatNumber(analytics.interviews.scheduled)}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-600">Completed</span>
                <span className="font-semibold text-green-600">{formatNumber(analytics.interviews.completed)}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-600">Avg Rating</span>
                <span className="font-semibold">⭐ {analytics.interviews.avgRating.toFixed(1)}/5</span>
              </div>
            </div>
          </div>

          {/* Hiring Analytics */}
          <div className="bg-white p-6 rounded-lg shadow-sm">
            <h2 className="text-xl font-bold text-gray-900 mb-4">🎯 Hiring Analytics</h2>
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-gray-600">Total Hired</span>
                <span className="font-semibold text-green-600">{formatNumber(analytics.hiring.totalHired)}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-600">Hire Rate</span>
                <span className="font-semibold">{formatPercentage(analytics.hiring.hireRate)}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-600">This Month</span>
                <span className="font-semibold text-green-600">{formatNumber(analytics.hiring.hiresThisMonth)}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-600">This Week</span>
                <span className="font-semibold">{formatNumber(analytics.hiring.hiresThisWeek)}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Performance Analytics */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
          {/* Top Performing Jobs */}
          <div className="bg-white p-6 rounded-lg shadow-sm">
            <h2 className="text-xl font-bold text-gray-900 mb-4">🏆 Top Performing Jobs</h2>
            <div className="space-y-3">
              {analytics.performance.topJobs.length > 0 ? (
                analytics.performance.topJobs.map((job, index) => (
                  <div key={index} className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                    <div>
                      <p className="font-semibold text-gray-900">{job.jobTitle}</p>
                      <p className="text-sm text-gray-600">{job.companyName}</p>
                    </div>
                    <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded-full text-sm font-semibold">
                      {job.applicationCount} applications
                    </span>
                  </div>
                ))
              ) : (
                <p className="text-gray-500 text-center py-4">No job data available</p>
              )}
            </div>
          </div>

          {/* Top Performing HR Users */}
          <div className="bg-white p-6 rounded-lg shadow-sm">
            <h2 className="text-xl font-bold text-gray-900 mb-4">👥 Top Performing HR Users</h2>
            <div className="space-y-3">
              {analytics.performance.topHRUsers.length > 0 ? (
                analytics.performance.topHRUsers.map((hr, index) => (
                  <div key={index} className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                    <div>
                      <p className="font-semibold text-gray-900">{hr.hrName}</p>
                      <p className="text-sm text-gray-600">{hr.companyName}</p>
                    </div>
                    <span className="bg-purple-100 text-purple-800 px-2 py-1 rounded-full text-sm font-semibold">
                      {hr.interviewCount} interviews
                    </span>
                  </div>
                ))
              ) : (
                <p className="text-gray-500 text-center py-4">No HR data available</p>
              )}
            </div>
          </div>
        </div>

        {/* Conversion Rates */}
        <div className="bg-white p-6 rounded-lg shadow-sm mb-8">
          <h2 className="text-xl font-bold text-gray-900 mb-4">📊 Conversion Rates</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="text-center">
              <p className="text-3xl font-bold text-blue-600">{formatPercentage(analytics.performance.conversionRates.applicationToInterview)}</p>
              <p className="text-gray-600 mt-2">Application → Interview</p>
            </div>
            <div className="text-center">
              <p className="text-3xl font-bold text-green-600">{formatPercentage(analytics.performance.conversionRates.interviewToHire)}</p>
              <p className="text-gray-600 mt-2">Interview → Hire</p>
            </div>
          </div>
        </div>

        {/* User Analytics */}
        <div className="bg-white p-6 rounded-lg shadow-sm">
          <h2 className="text-xl font-bold text-gray-900 mb-4">👤 User Analytics</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div>
              <h3 className="text-lg font-semibold text-gray-800 mb-3">Candidates</h3>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-gray-600">Total</span>
                  <span className="font-semibold">{formatNumber(analytics.users.candidates.total)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">This Month</span>
                  <span className="font-semibold">{formatNumber(analytics.users.candidates.thisMonth)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Growth Rate</span>
                  <span className={`font-semibold ${getGrowthColor(analytics.users.candidates.growthRate)}`}>
                    {formatPercentage(analytics.users.candidates.growthRate)}
                  </span>
                </div>
              </div>
            </div>
            
            <div>
              <h3 className="text-lg font-semibold text-gray-800 mb-3">HR Users</h3>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-gray-600">Total</span>
                  <span className="font-semibold">{formatNumber(analytics.users.hr.total)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Verified</span>
                  <span className="font-semibold text-green-600">{formatNumber(analytics.users.hr.verified)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Verification Rate</span>
                  <span className="font-semibold">{formatPercentage(analytics.users.hr.verificationRate)}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}