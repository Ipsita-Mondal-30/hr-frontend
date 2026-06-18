'use client';

import { useEffect, useState, useCallback } from 'react';
import Link from 'next/link';
import api from '@/lib/api';
import { Application } from '@/types';
import { useAuth } from '@/lib/AuthContext';
import { 
  FileText, 
  Clock, 
  CheckCircle, 
  Save, 
  Calendar, 
  AlertTriangle, 
  RefreshCw, 
  Search, 
  User, 
  DollarSign,
  Hand,
  Bell,
  X
} from 'lucide-react';

interface DashboardStats {
  totalApplications: number;
  pendingApplications: number;
  shortlistedApplications: number;
  rejectedApplications: number;
  savedJobs: number;
  profileCompleteness: number;
  scheduledInterviews: number;
}

interface DashboardNotification {
  _id: string;
  title: string;
  message: string;
  read: boolean;
  link?: string;
  createdAt: string;
}

interface Interview {
  _id: string;
  scheduledAt: string;
  duration: number;
  type: string;
  status: string;
  application?: {
    job?: {
      title?: string;
      companyName?: string;
    };
  };
  interviewer?: {
    name?: string;
  };
}

interface RecentInterviewReport {
  sessionId: string;
  jobRole: string;
  jobTitle?: string;
  companyName?: string;
  prepScore: number;
  status: string;
  completedAt: string;
  summary?: string;
  strengths: string[];
  weaknesses: string[];
  improvementTips: string[];
}

interface InterviewPrep {
  hasRecentInterview: boolean;
  recentInterview: RecentInterviewReport | null;
  aiInsights: {
    headline: string;
    focusAreas: string[];
    nextSteps: string[];
    preparationTips: string[];
  };
  targetRole: string;
  generatedAt: string;
  source?: string;
}

interface RecommendedJob {
  _id: string;
  title: string;
  companyName?: string;
  location?: string;
  matchScore: number;
  matchReason: string;
}

interface ProfileAnalysis {
  overallScore: number;
  strengths: string[];
  improvements: string[];
  marketability: string;
  recommendations: string[];
  roleAlignment: string;
  missingSkills?: string[];
  skillCourses?: Array<{
    skill: string;
    courseTitle: string;
    platform: string;
    reason: string;
  }>;
  jobMarketTrends?: string;
  recommendedJobs?: RecommendedJob[];
  profileCompleteness: number;
  resumeAnalyzed?: boolean;
  lastUpdated: string;
  generatedAt: string;
  source?: string;
}

type RecentJob = {
  _id: string;
  title?: string;
  companyName?: string;
  location?: string;
  department?: { name?: string };
  matchScore?: number;
  matchReason?: string;
};

type NarrowedApplication = Application & { matchScore?: number };

export default function CandidateDashboard() {
  const { user, updateUser } = useAuth();
  const [applications, setApplications] = useState<NarrowedApplication[]>([]);
  const [stats, setStats] = useState<DashboardStats>({
    totalApplications: 0,
    pendingApplications: 0,
    shortlistedApplications: 0,
    rejectedApplications: 0,
    savedJobs: 0,
    profileCompleteness: 75,
    scheduledInterviews: 0,
  });
  const [loading, setLoading] = useState(true);
  const [recentJobs, setRecentJobs] = useState<RecentJob[]>([]);
  const [upcomingInterviews, setUpcomingInterviews] = useState<Interview[]>([]);
  const [interviewPrep, setInterviewPrep] = useState<InterviewPrep | null>(null);
  const [profileAnalysis, setProfileAnalysis] = useState<ProfileAnalysis | null>(null);
  const [loadingAI, setLoadingAI] = useState(false);
  const [loadingProfileAI, setLoadingProfileAI] = useState(false);
  const [aiError, setAiError] = useState<string | null>(null);
  const [profileAiError, setProfileAiError] = useState<string | null>(null);
  const [notifications, setNotifications] = useState<DashboardNotification[]>([]);
  const [unreadNotificationCount, setUnreadNotificationCount] = useState(0);
  const [showNotifications, setShowNotifications] = useState(false);

  const fetchDashboardData = useCallback(async () => {
    try {
      console.log('🔄 Fetching candidate dashboard data...');

      // Fetch dashboard stats
      const statsRes = await api.get<Partial<DashboardStats>>('/candidate/dashboard-stats');
      const dashboardStats = statsRes.data || {};
      console.log('📊 Dashboard stats:', dashboardStats);

      setStats({
        totalApplications: dashboardStats.totalApplications ?? 0,
        pendingApplications: dashboardStats.pendingApplications ?? 0,
        shortlistedApplications: dashboardStats.shortlistedApplications ?? 0,
        rejectedApplications: dashboardStats.rejectedApplications ?? 0,
        savedJobs: dashboardStats.savedJobs ?? 0,
        profileCompleteness: dashboardStats.profileCompleteness ?? 0,
        scheduledInterviews: dashboardStats.scheduledInterviews ?? 0,
      });

      // Update user's profile completeness in auth context
      if (user && updateUser) {
        updateUser({ ...user, profileCompleteness: dashboardStats.profileCompleteness ?? 0 });
      }

      // Fetch applications
      const appsRes = await api.get<Application[]>('/candidate/applications');
      const apps = (appsRes.data || []) as NarrowedApplication[];
      console.log(`📋 Found ${apps.length} applications`);
      setApplications(apps.slice(0, 5)); // Show only recent 5

      // Fetch recent jobs for recommendations
      try {
        const jobsRes = await api.get<RecentJob[]>('/jobs?limit=10&status=active');
        const jobs = jobsRes.data || [];
        console.log(`🔍 Found ${jobs.length} recent active jobs`);
        setRecentJobs(jobs.slice(0, 5));
      } catch (err: unknown) {
        console.error('Error fetching jobs:', err);
        setRecentJobs([]);
      }

      // Fetch upcoming interviews
      try {
        const interviewsRes = await api.get<Interview[]>('/candidate/interviews');
        const interviews = interviewsRes.data || [];
        console.log(`📅 Found ${interviews.length} interviews`);

        const now = new Date();
        const upcoming = interviews.filter(
          (interview) =>
            interview?.scheduledAt &&
            new Date(interview.scheduledAt) > now &&
            interview.status === 'scheduled'
        );
        setUpcomingInterviews(upcoming.slice(0, 3));
        console.log(`📅 Upcoming interviews: ${upcoming.length}`);
      } catch (err: unknown) {
        console.error('Error fetching interviews:', err);
        setUpcomingInterviews([]);
      }
    } catch (err: unknown) {
      console.error('Error fetching dashboard data:', err);
    } finally {
      setLoading(false);
    }
  }, [updateUser, user]);

  const fetchAIInterviewPrep = useCallback(async () => {
    try {
      setLoadingAI(true);
      setAiError(null);
      const response = await api.get<InterviewPrep>('/candidate/interview-prep');
      setInterviewPrep(response.data);
    } catch (err: unknown) {
      console.error('Error fetching interview prep:', err);
      setAiError('Could not load interview report. Make sure the backend is running.');
      setInterviewPrep(null);
    } finally {
      setLoadingAI(false);
    }
  }, []);

  const fetchProfileAnalysis = useCallback(async () => {
    try {
      setLoadingProfileAI(true);
      setProfileAiError(null);
      const response = await api.get<ProfileAnalysis>('/candidate/profile-analysis');
      setProfileAnalysis(response.data);
      if (response.data.recommendedJobs?.length) {
        setRecentJobs(response.data.recommendedJobs);
      }
    } catch (err: unknown) {
      console.error('Error fetching profile analysis:', err);
      setProfileAiError('Could not analyze profile. Upload your resume and try again.');
      setProfileAnalysis(null);
    } finally {
      setLoadingProfileAI(false);
    }
  }, []);

  const fetchNotifications = useCallback(async () => {
    try {
      const response = await api.get('/notifications?limit=10');
      setNotifications(response.data.notifications || []);
      setUnreadNotificationCount(response.data.unreadCount || 0);
    } catch (err: unknown) {
      console.error('Error fetching notifications:', err);
    }
  }, []);

  useEffect(() => {
    fetchDashboardData();
    fetchNotifications();
    // Fetch AI data after a short delay to prioritize main dashboard data
    const timer = setTimeout(() => {
      fetchAIInterviewPrep();
      fetchProfileAnalysis();
    }, 1000);

    const interval = setInterval(fetchDashboardData, 30000);
    const notificationInterval = setInterval(fetchNotifications, 60000); // Refresh notifications every minute
    return () => {
      clearTimeout(timer);
      clearInterval(interval);
      clearInterval(notificationInterval);
    };
  }, [fetchDashboardData, fetchAIInterviewPrep, fetchProfileAnalysis, fetchNotifications]);

  const refreshDashboard = () => {
    fetchDashboardData();
  };

  if (loading) {
    return <div className="p-6">Loading dashboard...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="bg-gradient-to-r from-blue-600 to-blue-800 rounded-lg p-4 sm:p-6 text-white">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div className="min-w-0">
            <div className="flex items-center gap-2 mb-2 flex-wrap">
              <h1 className="text-xl sm:text-2xl font-bold">Welcome back, {user?.name}!</h1>
              <Hand className="w-6 h-6 text-yellow-300 shrink-0" />
            </div>
            <p className="text-blue-100 text-sm sm:text-base">
              Ready to find your next opportunity? Let&apos;s explore what&apos;s new for you.
            </p>
          </div>
          <div className="flex items-center gap-3 shrink-0">
            <button
              onClick={() => setShowNotifications(!showNotifications)}
              className="relative p-2 text-white hover:text-blue-100 transition-colors"
              title="Notifications"
            >
              <Bell className="w-5 h-5" />
              {unreadNotificationCount > 0 && (
                <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center font-bold">
                  {unreadNotificationCount > 9 ? '9+' : unreadNotificationCount}
                </span>
              )}
            </button>
            <button
              onClick={refreshDashboard}
              className="p-2 text-white hover:text-blue-100 transition-colors"
              title="Refresh"
            >
              <RefreshCw className="w-5 h-5" />
            </button>
          </div>
        </div>
      </div>

      {/* Notifications Dropdown */}
      {showNotifications && (
        <div className="fixed inset-0 z-40" onClick={() => setShowNotifications(false)}>
          <div className="absolute right-4 top-16 lg:right-6 lg:top-20 z-50 w-[calc(100vw-2rem)] max-w-md bg-white rounded-lg shadow-xl border border-gray-200 max-h-[500px] overflow-hidden" onClick={(e) => e.stopPropagation()}>
            <div className="bg-gradient-to-r from-blue-600 to-blue-800 p-4 flex items-center justify-between">
              <h2 className="text-lg font-semibold text-white">Notifications</h2>
              <button
                onClick={() => setShowNotifications(false)}
                className="text-white hover:text-gray-200"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            {notifications.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                <Bell className="w-12 h-12 mx-auto mb-2 text-gray-300" />
                <p>No notifications yet</p>
              </div>
            ) : (
              <div className="overflow-y-auto max-h-[400px]">
                <div className="divide-y divide-gray-100">
                  {notifications.map((notif) => (
                    <div
                      key={notif._id}
                      className={`p-4 cursor-pointer transition-colors ${
                        notif.read
                          ? 'hover:bg-gray-50'
                          : 'bg-blue-50/50 hover:bg-blue-50'
                      }`}
                      onClick={async () => {
                        if (!notif.read && notif.link) {
                          try {
                            await api.put(`/notifications/${notif._id}/read`);
                            setNotifications(prev => 
                              prev.map(n => n._id === notif._id ? { ...n, read: true } : n)
                            );
                            setUnreadNotificationCount(prev => Math.max(0, prev - 1));
                            if (notif.link) window.location.href = notif.link;
                          } catch (err) {
                            console.error('Error marking notification as read:', err);
                          }
                        } else if (notif.link) {
                          window.location.href = notif.link;
                        }
                      }}
                    >
                      <div className="flex items-start gap-3">
                        {!notif.read && (
                          <span className="mt-2 w-2 h-2 bg-blue-600 rounded-full flex-shrink-0"></span>
                        )}
                        <div className="flex-1 min-w-0">
                          <h3 className={`font-medium text-sm ${notif.read ? 'text-gray-700' : 'text-gray-900'}`}>
                            {notif.title}
                          </h3>
                          <p className="text-sm text-gray-600 mt-1 line-clamp-2">{notif.message}</p>
                          <p className="text-xs text-gray-400 mt-2">
                            {new Date(notif.createdAt).toLocaleString()}
                          </p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
            {notifications.length > 0 && (
              <div className="border-t border-gray-200 p-3">
                <button
                  onClick={async () => {
                    try {
                      await api.put('/notifications/read-all');
                      setNotifications(prev => prev.map(n => ({ ...n, read: true })));
                      setUnreadNotificationCount(0);
                    } catch (err) {
                      console.error('Error marking all as read:', err);
                    }
                  }}
                  className="text-sm text-blue-600 hover:text-blue-800 font-medium w-full text-center py-2 hover:bg-blue-50 rounded transition-colors"
                >
                  Mark all as read
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Quick Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
        <StatCard title="Total Applications" value={stats.totalApplications} icon={<FileText className="w-5 h-5" />} color="bg-blue-50 text-blue-600" />
        <StatCard title="Pending" value={stats.pendingApplications} icon={<Clock className="w-5 h-5" />} color="bg-yellow-50 text-yellow-600" />
        <StatCard title="Shortlisted" value={stats.shortlistedApplications} icon={<CheckCircle className="w-5 h-5" />} color="bg-green-50 text-green-600" />
        <StatCard title="Saved Jobs" value={stats.savedJobs} icon={<Save className="w-5 h-5" />} color="bg-purple-50 text-purple-600" />
        <StatCard title="Interviews" value={stats.scheduledInterviews} icon={<Calendar className="w-5 h-5" />} color="bg-orange-50 text-orange-600" />
      </div>

      {/* Profile Completeness Alert */}
      {stats.profileCompleteness < 100 && (
        <div className="bg-orange-50 border border-orange-200 rounded-lg p-4">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
            <div className="flex items-start sm:items-center gap-3 min-w-0">
              <AlertTriangle className="w-6 h-6 text-orange-600" />
              <div>
                <h3 className="font-medium text-orange-900">Complete Your Profile</h3>
                <p className="text-sm text-orange-700">
                  Your profile is {stats.profileCompleteness}% complete. Complete it to get better job matches.
                </p>
              </div>
            </div>
            <Link href="/candidate/profile" className="px-4 py-2 bg-orange-600 text-white rounded-md hover:bg-orange-700 text-sm text-center shrink-0 w-full sm:w-auto">
              Complete Profile
            </Link>
          </div>
        </div>
      )}

      {/* Upcoming Interviews */}
      <div className="bg-white rounded-lg shadow-sm border p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-gray-900">Upcoming Interviews</h2>
          <Link href="/candidate/applications" className="text-sm text-blue-600 hover:text-blue-800">
            View All
          </Link>
        </div>
        {upcomingInterviews.length === 0 ? (
          <div className="text-center py-8">
            <div className="text-gray-400 text-4xl mb-2">📅</div>
            <p className="text-gray-500">No upcoming interviews scheduled</p>
            <Link href="/candidate/applications" className="text-blue-600 hover:text-blue-700 text-sm">
              Check your applications →
            </Link>
          </div>
        ) : (
          <div className="space-y-3">
            {upcomingInterviews.map((interview) => (
              <div
                key={interview._id}
                className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 p-3 border border-gray-200 rounded-lg hover:border-blue-300 transition-colors"
              >
                <div>
                  <h3 className="font-medium text-gray-900">{interview.application?.job?.title || 'Unknown Job'}</h3>
                  <p className="text-sm text-gray-600">
                    {interview.scheduledAt
                      ? `${new Date(interview.scheduledAt).toLocaleDateString()} at ${new Date(
                          interview.scheduledAt
                        ).toLocaleTimeString()}`
                      : 'TBD'}
                  </p>
                  {interview.interviewer?.name && (
                    <p className="text-xs text-gray-500">with {interview.interviewer.name}</p>
                  )}
                </div>
                <span className="px-2 py-1 text-xs rounded bg-blue-100 text-blue-800">
                  {interview.type || 'Interview'}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Recent Applications */}
      <div className="bg-white rounded-lg shadow-sm border p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-gray-900">Recent Applications</h2>
          <Link href="/candidate/applications" className="text-sm text-blue-600 hover:text-blue-800">
            View All
          </Link>
        </div>
        {applications.length === 0 ? (
          <div className="text-center py-8">
            <div className="text-gray-400 text-4xl mb-2">📋</div>
            <p className="text-gray-500">No applications yet</p>
            <Link href="/candidate/jobs" className="text-blue-600 hover:text-blue-700 text-sm">
              Browse available jobs →
            </Link>
          </div>
        ) : (
          <div className="space-y-3">
            {applications.map((app) => (
              <div
                key={app._id}
                className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 p-3 border border-gray-200 rounded-lg hover:border-blue-300 transition-colors"
              >
                <div>
                  <h3 className="font-medium text-gray-900">{app.job?.title || 'Unknown Job'}</h3>
                  <p className="text-sm text-gray-600">{app.job?.companyName || 'Unknown Company'}</p>
                  {app.job?.department?.name && <p className="text-xs text-gray-500">{app.job.department.name}</p>}
                </div>
                <div className="text-right">
                  <span className={`px-2 py-1 text-xs rounded ${getStatusColor(app.status as string)}`}>
                    {app.status}
                  </span>
                  {typeof app.matchScore === 'number' && (
                    <p className="text-xs text-gray-500 mt-1">{app.matchScore}% match</p>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Saved Jobs */}
      <div className="bg-white rounded-lg shadow-sm border p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-gray-900">Saved Jobs</h2>
          <Link href="/candidate/saved" className="text-sm text-blue-600 hover:text-blue-800">
            View All
          </Link>
        </div>
        {stats.savedJobs === 0 ? (
          <div className="text-center py-8">
            <div className="text-gray-400 text-4xl mb-2">💾</div>
            <p className="text-gray-500">No saved jobs yet</p>
            <Link href="/candidate/jobs" className="text-blue-600 hover:text-blue-700 text-sm">
              Browse and save jobs →
            </Link>
          </div>
        ) : (
          <div className="text-center py-8">
            <div className="text-gray-400 text-4xl mb-2">💾</div>
            <p className="text-gray-500">
              You have {stats.savedJobs} saved job{stats.savedJobs !== 1 ? 's' : ''}
            </p>
            <Link href="/candidate/saved" className="text-blue-600 hover:text-blue-700 text-sm">
              View all saved jobs →
            </Link>
          </div>
        )}
      </div>

      {/* AI Interview Preparation */}
      <div className="bg-gradient-to-r from-purple-50 to-blue-50 rounded-lg border border-purple-200 p-6">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-2">
            <span className="text-2xl">🤖</span>
            <h2 className="text-lg font-semibold text-gray-900">AI Interview Prep</h2>
            {loadingAI && <span className="text-sm text-gray-500">Analyzing…</span>}
          </div>
          <div className="flex items-center space-x-2">
            <Link
              href="/candidate/interview-prep"
              className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 text-sm transition-colors"
            >
              Start Practice Interview
            </Link>
            <button
              onClick={fetchAIInterviewPrep}
              className="text-sm text-purple-600 hover:text-purple-800"
              disabled={loadingAI}
            >
              🔄 Refresh
            </button>
          </div>
        </div>

        {aiError && (
          <div className="mb-4 rounded-lg bg-red-50 border border-red-200 px-4 py-3 text-sm text-red-800">
            {aiError}
          </div>
        )}

        {interviewPrep?.hasRecentInterview && interviewPrep.recentInterview ? (
          <div className="space-y-4">
            <div className="bg-white rounded-lg p-4 border">
              <div className="flex items-center justify-between mb-2">
                <div>
                  <h3 className="font-semibold text-gray-900">
                    Latest: {interviewPrep.recentInterview.jobTitle || interviewPrep.recentInterview.jobRole}
                  </h3>
                  {interviewPrep.recentInterview.companyName && (
                    <p className="text-sm text-gray-600">{interviewPrep.recentInterview.companyName}</p>
                  )}
                  <p className="text-xs text-gray-400 mt-1">
                    {new Date(interviewPrep.recentInterview.completedAt).toLocaleDateString('en-GB')}
                  </p>
                </div>
                <div className="text-center">
                  <div className="text-4xl font-bold text-purple-600">
                    {interviewPrep.recentInterview.prepScore}/100
                  </div>
                  <span
                    className={`inline-block mt-1 px-3 py-1 rounded-full text-xs font-semibold ${
                      interviewPrep.recentInterview.status === 'READY'
                        ? 'bg-green-100 text-green-700'
                        : interviewPrep.recentInterview.status === 'NEEDS PRACTICE'
                        ? 'bg-orange-100 text-orange-700'
                        : 'bg-red-100 text-red-700'
                    }`}
                  >
                    {interviewPrep.recentInterview.status}
                  </span>
                </div>
              </div>
              {interviewPrep.aiInsights?.headline && (
                <p className="text-sm text-gray-700 mt-2">{interviewPrep.aiInsights.headline}</p>
              )}
              {interviewPrep.recentInterview.summary && (
                <p className="text-sm text-gray-600 mt-2 bg-purple-50 rounded p-3">
                  {interviewPrep.recentInterview.summary}
                </p>
              )}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="bg-white rounded-lg p-4 border">
                <h3 className="font-medium text-green-700 mb-2">✓ Interview Strengths</h3>
                <ul className="space-y-1">
                  {interviewPrep.recentInterview.strengths.slice(0, 4).map((s, i) => (
                    <li key={i} className="text-sm text-gray-700 flex items-start">
                      <span className="text-green-500 mr-2">✓</span>{s}
                    </li>
                  ))}
                </ul>
              </div>
              <div className="bg-white rounded-lg p-4 border">
                <h3 className="font-medium text-orange-700 mb-2">→ Areas to Improve</h3>
                <ul className="space-y-1">
                  {interviewPrep.recentInterview.weaknesses.slice(0, 4).map((w, i) => (
                    <li key={i} className="text-sm text-gray-700 flex items-start">
                      <span className="text-orange-500 mr-2">→</span>{w}
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            {interviewPrep.aiInsights?.nextSteps?.length > 0 && (
              <div className="bg-white rounded-lg p-4 border">
                <h3 className="font-medium text-blue-700 mb-2">💡 AI Next Steps (Gemini)</h3>
                <ul className="space-y-1">
                  {interviewPrep.aiInsights.nextSteps.map((tip, i) => (
                    <li key={i} className="text-sm text-gray-700">• {tip}</li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        ) : interviewPrep ? (
          <div className="text-center py-8 bg-white rounded-lg border">
            <div className="text-4xl mb-2">🎙️</div>
            <p className="text-gray-600 mb-1">No voice interview completed yet</p>
            <p className="text-sm text-gray-500 mb-4">
              Complete a practice interview to see your AI-generated report here
            </p>
            <Link
              href="/candidate/interview-prep"
              className="inline-block px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 text-sm"
            >
              Start Your First Interview
            </Link>
          </div>
        ) : !loadingAI && !aiError ? (
          <div className="text-center py-8">
            <div className="text-gray-400 text-4xl mb-2">🤖</div>
            <p className="text-gray-500 mb-3">AI Interview Preparation</p>
            <button
              onClick={fetchAIInterviewPrep}
              className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 text-sm disabled:opacity-50"
              disabled={loadingAI}
            >
              Generate AI Prep
            </button>
          </div>
        ) : null}
      </div>

      {/* AI Profile Analysis */}
      <div className="bg-gradient-to-r from-green-50 to-teal-50 rounded-lg border border-green-200 p-6">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-2">
            <span className="text-2xl">📊</span>
            <h2 className="text-lg font-semibold text-gray-900">AI Profile Analysis</h2>
            {loadingProfileAI && <span className="text-sm text-gray-500">Analyzing resume…</span>}
          </div>
          <button
            onClick={fetchProfileAnalysis}
            className="text-sm text-green-600 hover:text-green-800"
            disabled={loadingProfileAI}
          >
            🔄 Refresh
          </button>
        </div>

        {profileAiError && (
          <div className="mb-4 rounded-lg bg-red-50 border border-red-200 px-4 py-3 text-sm text-red-800">
            {profileAiError}
          </div>
        )}

        {profileAnalysis ? (
          <div className="space-y-4">
            <div className="bg-white rounded-lg p-4 border">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-medium text-gray-900">Profile Strength</h3>
                  <p className="text-sm text-gray-600 mt-1">{profileAnalysis.marketability}</p>
                  {profileAnalysis.resumeAnalyzed && (
                    <p className="text-xs text-green-600 mt-1">✓ Resume analyzed</p>
                  )}
                </div>
                <div className="text-right">
                  <div className="text-3xl font-bold text-green-600">{profileAnalysis.overallScore}%</div>
                  <div className="text-xs text-gray-500">Overall Score</div>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="bg-white rounded-lg p-4 border">
                <h3 className="font-medium text-green-700 mb-2">🌟 Key Strengths</h3>
                <ul className="space-y-1">
                  {profileAnalysis.strengths.slice(0, 4).map((strength, index) => (
                    <li key={index} className="text-sm text-gray-700 flex items-start">
                      <span className="text-green-500 mr-2">✓</span>{strength}
                    </li>
                  ))}
                </ul>
              </div>

              <div className="bg-white rounded-lg p-4 border">
                <h3 className="font-medium text-blue-700 mb-2">🎯 Recommendations</h3>
                <ul className="space-y-1">
                  {profileAnalysis.recommendations.slice(0, 4).map((rec, index) => (
                    <li key={index} className="text-sm text-gray-700 flex items-start">
                      <span className="text-blue-500 mr-2">→</span>{rec}
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            {profileAnalysis.missingSkills && profileAnalysis.missingSkills.length > 0 && (
              <div className="bg-white rounded-lg p-4 border">
                <h3 className="font-medium text-orange-700 mb-2">📈 Skills to Add (from job market)</h3>
                <div className="flex flex-wrap gap-2">
                  {profileAnalysis.missingSkills.map((skill, i) => (
                    <span key={i} className="px-3 py-1 bg-orange-100 text-orange-800 rounded-full text-sm">
                      {skill}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {profileAnalysis.skillCourses && profileAnalysis.skillCourses.length > 0 && (
              <div className="bg-white rounded-lg p-4 border">
                <h3 className="font-medium text-purple-700 mb-3">🎓 Recommended Courses (Cohere / AI)</h3>
                <div className="space-y-3">
                  {profileAnalysis.skillCourses.slice(0, 4).map((course, i) => (
                    <div key={i} className="bg-purple-50 rounded-lg p-3">
                      <div className="flex justify-between items-start">
                        <p className="font-medium text-sm text-gray-900">{course.courseTitle}</p>
                        <span className="text-xs bg-purple-200 text-purple-800 px-2 py-0.5 rounded">{course.platform}</span>
                      </div>
                      <p className="text-xs text-purple-700 mt-1">Skill: {course.skill}</p>
                      <p className="text-xs text-gray-600 mt-1">{course.reason}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            <div className="bg-white rounded-lg p-4 border">
              <h3 className="font-medium text-gray-900 mb-2">🎯 Role Alignment</h3>
              <p className="text-sm text-gray-700">{profileAnalysis.roleAlignment}</p>
              {profileAnalysis.jobMarketTrends && (
                <p className="text-sm text-gray-600 mt-3 bg-teal-50 rounded p-3">{profileAnalysis.jobMarketTrends}</p>
              )}
              <div className="mt-2 text-xs text-gray-500">
                Last updated: {new Date(profileAnalysis.lastUpdated).toLocaleDateString('en-GB')}
              </div>
            </div>
          </div>
        ) : !loadingProfileAI && !profileAiError ? (
          <div className="text-center py-8">
            <div className="text-gray-400 text-4xl mb-2">📊</div>
            <p className="text-gray-500 mb-3">Analyze your resume and profile with AI</p>
            <button
              onClick={fetchProfileAnalysis}
              className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 text-sm"
            >
              Analyze Profile
            </button>
          </div>
        ) : null}
      </div>

      {/* Recommended Jobs (AI-matched) */}
      <div className="bg-white rounded-lg shadow-sm border p-6">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-lg font-semibold text-gray-900">Recommended Jobs</h2>
            <p className="text-xs text-gray-500">Matched to your resume & skills</p>
          </div>
          <Link href="/candidate/jobs" className="text-sm text-blue-600 hover:text-blue-800">
            View All
          </Link>
        </div>
        {recentJobs.length === 0 ? (
          <div className="text-center py-8">
            <div className="text-gray-400 text-4xl mb-2">🔍</div>
            <p className="text-gray-500">Complete profile analysis to see matched jobs</p>
            <button
              onClick={fetchProfileAnalysis}
              className="mt-3 text-green-600 hover:text-green-800 text-sm font-medium"
            >
              Run AI Profile Analysis →
            </button>
          </div>
        ) : (
          <div className="space-y-3">
            {recentJobs.map((job) => (
              <div
                key={job._id}
                className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 p-3 border border-gray-200 rounded-lg hover:border-blue-300 transition-colors"
              >
                <div className="flex-1">
                  <h3 className="font-medium text-gray-900">{job.title || 'Untitled role'}</h3>
                  <p className="text-sm text-gray-600">{job.companyName || 'Company'}</p>
                  <p className="text-xs text-gray-500">{job.location || 'Remote'}</p>
                  {'matchReason' in job && (job as RecommendedJob).matchReason && (
                    <p className="text-xs text-blue-600 mt-1">{(job as RecommendedJob).matchReason}</p>
                  )}
                </div>
                <div className="flex items-center gap-3">
                  {'matchScore' in job && typeof (job as RecommendedJob).matchScore === 'number' && (
                    <span className="text-sm font-bold text-green-600">{(job as RecommendedJob).matchScore}%</span>
                  )}
                  <Link
                    href="/candidate/jobs"
                    className="px-3 py-1 text-xs bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors"
                  >
                    View
                  </Link>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Quick Actions */}
      <div className="bg-white rounded-lg shadow-sm border p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
          <QuickActionCard title="Search Jobs" description="Find your next opportunity" icon={<Search className="w-6 h-6" />} href="/candidate/jobs" />
          <QuickActionCard title="Update Profile" description="Keep your profile current" icon={<User className="w-6 h-6" />} href="/candidate/profile" />
          <QuickActionCard title="Salary Research" description="Research market rates" icon={<DollarSign className="w-6 h-6" />} href="/candidate/salary" />
          <QuickActionCard title="Saved Jobs" description="Review saved opportunities" icon={<Save className="w-6 h-6" />} href="/candidate/saved" />
        </div>
      </div>
    </div>
  );
}

function StatCard({ title, value, icon, color }: { title: string; value: number; icon: React.ReactNode; color: string }) {
  return (
    <div className="bg-white rounded-lg shadow-sm border p-4">
      <div className="flex items-center">
        <div className={`p-2 rounded-lg ${color} mr-3`}>
          {icon}
        </div>
        <div>
          <p className="text-sm font-medium text-gray-600">{title}</p>
          <p className="text-2xl font-bold text-gray-900">{value}</p>
        </div>
      </div>
    </div>
  );
}

function QuickActionCard({
  title,
  description,
  icon,
  href,
}: {
  title: string;
  description: string;
  icon: React.ReactNode;
  href: string;
}) {
  return (
    <Link
      href={href}
      className="p-4 border border-gray-200 rounded-lg hover:border-blue-300 hover:shadow-sm transition-all"
    >
      <div className="text-center">
        <div className="mb-2 flex justify-center text-gray-600">{icon}</div>
        <h3 className="font-medium text-gray-900 mb-1">{title}</h3>
        <p className="text-xs text-gray-600">{description}</p>
      </div>
    </Link>
  );
}

function getStatusColor(status?: string) {
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
