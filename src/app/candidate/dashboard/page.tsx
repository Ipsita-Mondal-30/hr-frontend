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
  Hand
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

interface InterviewPrep {
  questions: string[];
  skillGaps: {
    missing: string[];
    recommended: string[];
  };
  strengths: string[];
  preparationTips: string[];
  technicalTopics: string[];
  profileScore: number;
  targetRole: string;
  generatedAt: string;
}

interface ProfileAnalysis {
  overallScore: number;
  strengths: string[];
  improvements: string[];
  marketability: string;
  recommendations: string[];
  roleAlignment: string;
  profileCompleteness: number;
  lastUpdated: string;
  generatedAt: string;
}

type RecentJob = {
  _id: string;
  title?: string;
  companyName?: string;
  location?: string;
  department?: { name?: string };
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
      console.log('🤖 Fetching AI interview preparation...');
      const response = await api.get<InterviewPrep>('/candidate/interview-prep');
      console.log('🤖 Interview prep response:', response.data);
      setInterviewPrep(response.data);
      console.log('✅ AI interview prep loaded successfully');
    } catch (err: unknown) {
      console.error('❌ Error fetching interview prep:', err);
      const fallback: InterviewPrep = {
        questions: [
          'Tell me about your background and experience',
          'What interests you about this role?',
          'Describe a challenging project you worked on',
          'How do you handle difficult situations?',
          'Where do you see yourself in 5 years?',
        ],
        skillGaps: {
          missing: ['System design', 'Advanced algorithms'],
          recommended: ['Practice coding problems', 'Study system design'],
        },
        strengths: ['Technical foundation', 'Problem-solving skills', 'Learning mindset'],
        preparationTips: [
          'Review technical skills',
          'Practice coding problems',
          'Research the company',
          'Prepare behavioral examples',
        ],
        technicalTopics: ['Programming fundamentals', 'Problem-solving', 'Best practices', 'Testing'],
        profileScore: stats.profileCompleteness,
        targetRole: 'Software Developer',
        generatedAt: new Date().toISOString(),
      };
      setInterviewPrep(fallback);
    } finally {
      setLoadingAI(false);
    }
  }, [stats.profileCompleteness]);

  const fetchProfileAnalysis = useCallback(async () => {
    try {
      console.log('🔍 Fetching AI profile analysis...');
      const response = await api.get<ProfileAnalysis>('/candidate/profile-analysis');
      console.log('🔍 Profile analysis response:', response.data);
      setProfileAnalysis(response.data);
      console.log('✅ AI profile analysis loaded successfully');
    } catch (err: unknown) {
      console.error('❌ Error fetching profile analysis:', err);
      // Fallback response
      const fallback: ProfileAnalysis = {
        overallScore: stats.profileCompleteness,
        strengths: ['Professional background', 'Technical skills', 'Career focus'],
        improvements: ['Complete profile information', 'Add portfolio projects', 'Enhance skill descriptions'],
        marketability:
          stats.profileCompleteness > 70 ? 'Strong potential' : 'Good foundation with room for growth',
        recommendations: ['Complete your profile', 'Add work samples', 'Update your resume', 'Connect social profiles'],
        roleAlignment: 'Developing alignment with target roles',
        profileCompleteness: stats.profileCompleteness,
        lastUpdated: new Date().toISOString(),
        generatedAt: new Date().toISOString(),
      };
      setProfileAnalysis(fallback);
    }
  }, [stats.profileCompleteness]);

  useEffect(() => {
    fetchDashboardData();
    // Fetch AI data after a short delay to prioritize main dashboard data
    const timer = setTimeout(() => {
      fetchAIInterviewPrep();
      fetchProfileAnalysis();
    }, 1000);

    const interval = setInterval(fetchDashboardData, 30000);
    return () => {
      clearTimeout(timer);
      clearInterval(interval);
    };
  }, [fetchDashboardData, fetchAIInterviewPrep, fetchProfileAnalysis]);

  const refreshDashboard = () => {
    fetchDashboardData();
  };

  if (loading) {
    return <div className="p-6">Loading dashboard...</div>;
  }

  return (
    <div className="p-6 space-y-6">
      {/* Welcome Section */}
      <div className="bg-gradient-to-r from-blue-600 to-blue-800 rounded-lg p-6 text-white">
        <div className="flex items-center justify-between">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <h1 className="text-2xl font-bold">Welcome back, {user?.name}!</h1>
              <Hand className="w-6 h-6 text-yellow-300" />
            </div>
            <p className="text-blue-100">
              Ready to find your next opportunity? Let&apos;s explore what&apos;s new for you.
            </p>
          </div>
          <button
            onClick={refreshDashboard}
            className="px-4 py-2 bg-white bg-opacity-20 hover:bg-opacity-30 rounded-lg text-white text-sm transition-all"
          >
            <RefreshCw className="w-4 h-4 mr-2" />
            Refresh
          </button>
        </div>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <StatCard title="Total Applications" value={stats.totalApplications} icon={<FileText className="w-5 h-5" />} color="bg-blue-50 text-blue-600" />
        <StatCard title="Pending" value={stats.pendingApplications} icon={<Clock className="w-5 h-5" />} color="bg-yellow-50 text-yellow-600" />
        <StatCard title="Shortlisted" value={stats.shortlistedApplications} icon={<CheckCircle className="w-5 h-5" />} color="bg-green-50 text-green-600" />
        <StatCard title="Saved Jobs" value={stats.savedJobs} icon={<Save className="w-5 h-5" />} color="bg-purple-50 text-purple-600" />
        <StatCard title="Interviews" value={stats.scheduledInterviews} icon={<Calendar className="w-5 h-5" />} color="bg-orange-50 text-orange-600" />
      </div>

      {/* Profile Completeness Alert */}
      {stats.profileCompleteness < 100 && (
        <div className="bg-orange-50 border border-orange-200 rounded-lg p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <AlertTriangle className="w-6 h-6 text-orange-600" />
              <div>
                <h3 className="font-medium text-orange-900">Complete Your Profile</h3>
                <p className="text-sm text-orange-700">
                  Your profile is {stats.profileCompleteness}% complete. Complete it to get better job matches.
                </p>
              </div>
            </div>
            <Link href="/candidate/profile" className="px-4 py-2 bg-orange-600 text-white rounded-md hover:bg-orange-700 text-sm">
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
                className="flex items-center justify-between p-3 border border-gray-200 rounded-lg hover:border-blue-300 transition-colors"
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
                className="flex items-center justify-between p-3 border border-gray-200 rounded-lg hover:border-blue-300 transition-colors"
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
            {loadingAI && <span className="text-sm text-gray-500">Loading...</span>}
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

        {interviewPrep ? (
          <div className="space-y-4">
            {/* Target Role & Score */}
            <div className="flex items-center justify-between bg-white rounded-lg p-3 border">
              <div>
                <h3 className="font-medium text-gray-900">Target Role: {interviewPrep.targetRole}</h3>
                <p className="text-sm text-gray-600">Profile Strength: {interviewPrep.profileScore}%</p>
              </div>
              <div className="text-right">
                <div className="text-2xl font-bold text-purple-600">{interviewPrep.profileScore}%</div>
                <div className="text-xs text-gray-500">Match Score</div>
              </div>
            </div>

            {/* Top Interview Questions */}
            <div className="bg-white rounded-lg p-4 border">
              <h3 className="font-medium text-gray-900 mb-3">🎯 Top 5 Interview Questions</h3>
              <div className="space-y-2">
                {interviewPrep.questions.slice(0, 5).map((question, index) => (
                  <div key={index} className="flex items-start space-x-2">
                    <span className="text-purple-600 font-medium text-sm">{index + 1}.</span>
                    <p className="text-sm text-gray-700">{question}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Skill Gap Analysis */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="bg-white rounded-lg p-4 border">
                <h3 className="font-medium text-green-700 mb-2">💪 Your Strengths</h3>
                <ul className="space-y-1">
                  {interviewPrep.strengths.slice(0, 3).map((strength, index) => (
                    <li key={index} className="text-sm text-gray-700 flex items-center">
                      <span className="text-green-500 mr-2">✓</span>
                      {strength}
                    </li>
                  ))}
                </ul>
              </div>

              <div className="bg-white rounded-lg p-4 border">
                <h3 className="font-medium text-orange-700 mb-2">📈 Areas to Improve</h3>
                <ul className="space-y-1">
                  {interviewPrep.skillGaps.missing.slice(0, 3).map((gap, index) => (
                    <li key={index} className="text-sm text-gray-700 flex items-center">
                      <span className="text-orange-500 mr-2">→</span>
                      {gap}
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            {/* Quick Prep Tips */}
            <div className="bg-white rounded-lg p-4 border">
              <h3 className="font-medium text-blue-700 mb-2">💡 Quick Prep Tips</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                {interviewPrep.preparationTips.slice(0, 4).map((tip, index) => (
                  <div key={index} className="text-sm text-gray-700 flex items-start">
                    <span className="text-blue-500 mr-2">•</span>
                    {tip}
                  </div>
                ))}
              </div>
            </div>
          </div>
        ) : (
          <div className="text-center py-8">
            <div className="text-gray-400 text-4xl mb-2">🤖</div>
            <p className="text-gray-500 mb-3">AI Interview Preparation</p>
            <button
              onClick={fetchAIInterviewPrep}
              className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 text-sm disabled:opacity-50"
              disabled={loadingAI}
            >
              {loadingAI ? (
                <span className="flex items-center">
                  <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Generating...
                </span>
              ) : (
                'Generate AI Prep'
              )}
            </button>
          </div>
        )}
      </div>

      {/* AI Profile Analysis */}
      <div className="bg-gradient-to-r from-green-50 to-teal-50 rounded-lg border border-green-200 p-6">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-2">
            <span className="text-2xl">📊</span>
            <h2 className="text-lg font-semibold text-gray-900">AI Profile Analysis</h2>
          </div>
          <button onClick={fetchProfileAnalysis} className="text-sm text-green-600 hover:text-green-800">
            🔄 Refresh
          </button>
        </div>

        {profileAnalysis ? (
          <div className="space-y-4">
            {/* Overall Score */}
            <div className="bg-white rounded-lg p-4 border">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-medium text-gray-900">Profile Strength</h3>
                  <p className="text-sm text-gray-600">{profileAnalysis.marketability}</p>
                </div>
                <div className="text-right">
                  <div className="text-3xl font-bold text-green-600">{profileAnalysis.overallScore}%</div>
                  <div className="text-xs text-gray-500">Overall Score</div>
                </div>
              </div>
            </div>

            {/* Key Insights */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="bg-white rounded-lg p-4 border">
                <h3 className="font-medium text-green-700 mb-2">🌟 Key Strengths</h3>
                <ul className="space-y-1">
                  {profileAnalysis.strengths.slice(0, 3).map((strength, index) => (
                    <li key={index} className="text-sm text-gray-700 flex items-center">
                      <span className="text-green-500 mr-2">✓</span>
                      {strength}
                    </li>
                  ))}
                </ul>
              </div>

              <div className="bg-white rounded-lg p-4 border">
                <h3 className="font-medium text-blue-700 mb-2">🎯 Recommendations</h3>
                <ul className="space-y-1">
                  {profileAnalysis.recommendations.slice(0, 3).map((rec, index) => (
                    <li key={index} className="text-sm text-gray-700 flex items-start">
                      <span className="text-blue-500 mr-2">→</span>
                      {rec}
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            {/* Role Alignment */}
            <div className="bg-white rounded-lg p-4 border">
              <h3 className="font-medium text-gray-900 mb-2">🎯 Role Alignment</h3>
              <p className="text-sm text-gray-700">{profileAnalysis.roleAlignment}</p>
              <div className="mt-2 text-xs text-gray-500">
                Last updated: {new Date(profileAnalysis.lastUpdated).toLocaleDateString()}
              </div>
            </div>
          </div>
        ) : (
          <div className="text-center py-8">
            <div className="text-gray-400 text-4xl mb-2">📊</div>
            <p className="text-gray-500 mb-3">AI Profile Analysis</p>
            <button onClick={fetchProfileAnalysis} className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 text-sm">
              Analyze Profile
            </button>
          </div>
        )}
      </div>

      {/* Recommended Jobs */}
      <div className="bg-white rounded-lg shadow-sm border p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-gray-900">Recommended Jobs</h2>
          <Link href="/candidate/jobs" className="text-sm text-blue-600 hover:text-blue-800">
            View All
          </Link>
        </div>
        {recentJobs.length === 0 ? (
          <div className="text-center py-8">
            <div className="text-gray-400 text-4xl mb-2">🔍</div>
            <p className="text-gray-500">No jobs available at the moment</p>
            <Link href="/candidate/jobs" className="text-blue-600 hover:text-blue-700 text-sm">
              Check for new opportunities →
            </Link>
          </div>
        ) : (
          <div className="space-y-3">
            {recentJobs.map((job) => (
              <div
                key={job._id}
                className="flex items-center justify-between p-3 border border-gray-200 rounded-lg hover:border-blue-300 transition-colors"
              >
                <div>
                  <h3 className="font-medium text-gray-900">{job.title || 'Untitled role'}</h3>
                  <p className="text-sm text-gray-600">{job.companyName || 'Company'}</p>
                  <p className="text-xs text-gray-500">{job.location || 'Remote'}</p>
                  {job?.department?.name && <p className="text-xs text-gray-400">{job.department.name}</p>}
                </div>
                <div className="flex space-x-2">
                  <Link
                    href={`/candidate/jobs`}
                    className="px-3 py-1 text-xs bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors"
                  >
                    Apply
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
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
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
