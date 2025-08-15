'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import api from '@/lib/api';
import { Application } from '@/types';
import { useAuth } from '@/lib/AuthContext';

interface DashboardStats {
  totalApplications: number;
  pendingApplications: number;
  shortlistedApplications: number;
  rejectedApplications: number;
  savedJobs: number;
  profileCompleteness: number;
  scheduledInterviews: number;
}

interface Interview {
  _id: string;
  scheduledAt: string;
  duration: number;
  type: string;
  status: string;
  application: {
    job: {
      title: string;
      companyName: string;
    };
  };
  interviewer: {
    name: string;
  };
}

export default function CandidateDashboard() {
  const { user } = useAuth();
  const [applications, setApplications] = useState<Application[]>([]);
  const [stats, setStats] = useState<DashboardStats>({
    totalApplications: 0,
    pendingApplications: 0,
    shortlistedApplications: 0,
    rejectedApplications: 0,
    savedJobs: 0,
    profileCompleteness: 75,
    scheduledInterviews: 0
  });
  const [loading, setLoading] = useState(true);
  const [recentJobs, setRecentJobs] = useState<any[]>([]);
  const [upcomingInterviews, setUpcomingInterviews] = useState<Interview[]>([]);

  useEffect(() => {
    fetchDashboardData();
    
    // Set up interval to refresh data every 30 seconds
    const interval = setInterval(fetchDashboardData, 30000);
    return () => clearInterval(interval);
  }, []);

  const fetchDashboardData = async () => {
    try {
      console.log('🔄 Fetching candidate dashboard data...');
      
      // Fetch applications
      const appsRes = await api.get('/applications/my');
      const applications = appsRes.data || [];
      console.log(`📋 Found ${applications.length} applications`);
      setApplications(applications.slice(0, 5)); // Show only recent 5

      // Fetch saved jobs
      let savedJobs = [];
      try {
        const savedRes = await api.get('/candidate/saved-jobs');
        savedJobs = savedRes.data || [];
        console.log(`💾 Found ${savedJobs.length} saved jobs`);
      } catch (err) {
        console.error('Error fetching saved jobs:', err);
        savedJobs = [];
      }

      // Fetch recent jobs for recommendations
      let recentJobs = [];
      try {
        const jobsRes = await api.get('/jobs?limit=3');
        recentJobs = jobsRes.data || [];
        console.log(`🔍 Found ${recentJobs.length} recent jobs`);
        setRecentJobs(recentJobs);
      } catch (err) {
        console.error('Error fetching jobs:', err);
        setRecentJobs([]);
      }

      // Fetch upcoming interviews
      let interviews = [];
      try {
        const interviewsRes = await api.get('/candidate/interviews');
        interviews = interviewsRes.data || [];
        console.log(`📅 Found ${interviews.length} interviews`);
        setUpcomingInterviews(interviews.filter((interview: Interview) => 
          new Date(interview.scheduledAt) > new Date() && interview.status === 'scheduled'
        ).slice(0, 3));
      } catch (err) {
        console.error('Error fetching interviews:', err);
        setUpcomingInterviews([]);
      }

      // Calculate stats
      const stats = {
        totalApplications: applications.length,
        pendingApplications: applications.filter((app: Application) => app.status === 'pending').length,
        shortlistedApplications: applications.filter((app: Application) => app.status === 'shortlisted' || app.status === 'reviewed').length,
        rejectedApplications: applications.filter((app: Application) => app.status === 'rejected').length,
        savedJobs: savedJobs.length,
        profileCompleteness: 75, // This would be calculated based on profile data
        scheduledInterviews: interviews.filter((interview: Interview) => interview.status === 'scheduled').length
      };
      
      console.log('📊 Dashboard stats:', stats);
      setStats(stats);
    } catch (err) {
      console.error('Error fetching dashboard data:', err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <div className="p-6">Loading dashboard...</div>;
  }

  return (
    <div className="p-6 space-y-6">
      {/* Welcome Section */}
      <div className="bg-gradient-to-r from-blue-600 to-blue-800 rounded-lg p-6 text-white">
        <h1 className="text-2xl font-bold mb-2">Welcome back, {user?.name}! 👋</h1>
        <p className="text-blue-100">
          Ready to find your next opportunity? Let's explore what's new for you.
        </p>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <StatCard
          title="Total Applications"
          value={stats.totalApplications}
          icon="📋"
          color="bg-blue-50 text-blue-600"
        />
        <StatCard
          title="Pending"
          value={stats.pendingApplications}
          icon="⏳"
          color="bg-yellow-50 text-yellow-600"
        />
        <StatCard
          title="Shortlisted"
          value={stats.shortlistedApplications}
          icon="✅"
          color="bg-green-50 text-green-600"
        />
        <StatCard
          title="Saved Jobs"
          value={stats.savedJobs}
          icon="💾"
          color="bg-purple-50 text-purple-600"
        />
        <StatCard
          title="Interviews"
          value={stats.scheduledInterviews}
          icon="📅"
          color="bg-orange-50 text-orange-600"
        />
      </div>

      {/* Profile Completeness Alert */}
      {stats.profileCompleteness < 100 && (
        <div className="bg-orange-50 border border-orange-200 rounded-lg p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="text-orange-600 text-2xl">⚠️</div>
              <div>
                <h3 className="font-medium text-orange-900">Complete Your Profile</h3>
                <p className="text-sm text-orange-700">
                  Your profile is {stats.profileCompleteness}% complete. Complete it to get better job matches.
                </p>
              </div>
            </div>
            <Link
              href="/candidate/profile"
              className="px-4 py-2 bg-orange-600 text-white rounded-md hover:bg-orange-700 text-sm"
            >
              Complete Profile
            </Link>
          </div>
        </div>
      )}

      {/* Upcoming Interviews */}
      {upcomingInterviews.length > 0 && (
        <div className="bg-orange-50 rounded-lg p-6 border border-orange-200">
          <h2 className="text-lg font-semibold text-orange-900 mb-4">🎯 Upcoming Interviews</h2>
          <div className="space-y-3">
            {upcomingInterviews.map((interview) => (
              <div key={interview._id} className="bg-white rounded-lg p-4 border border-orange-200">
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className="font-medium text-gray-900">{interview.application.job.title}</h3>
                    <p className="text-sm text-gray-600">{interview.application.job.companyName}</p>
                    <p className="text-sm text-gray-500">with {interview.interviewer.name}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-medium text-orange-600">
                      {new Date(interview.scheduledAt).toLocaleDateString()}
                    </p>
                    <p className="text-xs text-gray-500">
                      {new Date(interview.scheduledAt).toLocaleTimeString()}
                    </p>
                    <span className="text-xs bg-orange-100 text-orange-800 px-2 py-1 rounded capitalize">
                      {interview.type}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Applications */}
        <div className="bg-white rounded-lg shadow-sm border p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-gray-900">Recent Applications</h2>
            <Link
              href="/candidate/applications"
              className="text-sm text-blue-600 hover:text-blue-800"
            >
              View All
            </Link>
          </div>

          {applications.length === 0 ? (
            <div className="text-center py-8">
              <div className="text-gray-400 text-4xl mb-2">📋</div>
              <p className="text-gray-500 mb-4">No applications yet</p>
              <Link
                href="/candidate/jobs"
                className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 text-sm"
              >
                Browse Jobs
              </Link>
            </div>
          ) : (
            <div className="space-y-3">
              {applications.map((app) => (
                <div key={app._id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div className="flex-1">
                    <h3 className="font-medium text-gray-900">{app.job?.title || 'Job Title'}</h3>
                    <p className="text-sm text-gray-600">{app.job?.department?.name || 'Department'}</p>
                  </div>
                  <div className="text-right">
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(app.status)}`}>
                      {app.status}
                    </span>
                    {app.matchScore && (
                      <p className="text-xs text-gray-500 mt-1">{app.matchScore}% match</p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Recommended Jobs */}
        <div className="bg-white rounded-lg shadow-sm border p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-gray-900">Recommended Jobs</h2>
            <Link
              href="/candidate/jobs"
              className="text-sm text-blue-600 hover:text-blue-800"
            >
              View All
            </Link>
          </div>

          <div className="space-y-3">
            {recentJobs.map((job) => (
              <div key={job._id} className="p-3 border border-gray-200 rounded-lg hover:border-blue-300 transition-colors">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <h3 className="font-medium text-gray-900">{job.title}</h3>
                    <p className="text-sm text-gray-600">{job.companyName}</p>
                    <p className="text-xs text-gray-500">{job.location}</p>
                  </div>
                  <div className="text-right">
                    {job.remote && (
                      <span className="bg-green-100 text-green-800 px-2 py-1 rounded text-xs">Remote</span>
                    )}
                  </div>
                </div>
                <div className="mt-2 flex justify-between items-center">
                  <div className="text-xs text-gray-500">
                    {job.minSalary && job.maxSalary && (
                      <span>${job.minSalary.toLocaleString()} - ${job.maxSalary.toLocaleString()}</span>
                    )}
                  </div>
                  <Link
                    href="/candidate/jobs"
                    className="text-xs text-blue-600 hover:text-blue-800"
                  >
                    View Details →
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="bg-white rounded-lg shadow-sm border p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <QuickActionCard
            title="Search Jobs"
            description="Find your next opportunity"
            icon="🔍"
            href="/candidate/jobs"
          />
          <QuickActionCard
            title="Update Profile"
            description="Keep your profile current"
            icon="👤"
            href="/candidate/profile"
          />
          <QuickActionCard
            title="Salary Research"
            description="Research market rates"
            icon="💰"
            href="/candidate/salary"
          />
          <QuickActionCard
            title="Saved Jobs"
            description="Review saved opportunities"
            icon="💾"
            href="/candidate/saved"
          />
        </div>
      </div>
    </div>
  );
}

function StatCard({ title, value, icon, color }: {
  title: string;
  value: number;
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

function QuickActionCard({ title, description, icon, href }: {
  title: string;
  description: string;
  icon: string;
  href: string;
}) {
  return (
    <Link
      href={href}
      className="p-4 border border-gray-200 rounded-lg hover:border-blue-300 hover:shadow-sm transition-all"
    >
      <div className="text-center">
        <div className="text-2xl mb-2">{icon}</div>
        <h3 className="font-medium text-gray-900 mb-1">{title}</h3>
        <p className="text-xs text-gray-600">{description}</p>
      </div>
    </Link>
  );
}

function getStatusColor(status: string) {
  switch (status) {
    case 'pending':
      return 'bg-yellow-100 text-yellow-800';
    case 'reviewed':
      return 'bg-blue-100 text-blue-800';
    case 'shortlisted':
      return 'bg-green-100 text-green-800';
    case 'rejected':
      return 'bg-red-100 text-red-800';
    default:
      return 'bg-gray-100 text-gray-800';
  }
}
