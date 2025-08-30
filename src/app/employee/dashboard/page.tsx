'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useAuth } from '@/lib/AuthContext';
import api from '@/lib/api';

interface EmployeeProfile {
  _id: string;
  employeeId: string;
  user: {
    name: string;
    email: string;
  };
  position: string;
  department?: {
    name: string;
  };
  manager?: {
    user: { name: string };
    position: string;
  };
  performanceScore: number;
  projectContribution: number;
  hireDate: string;
  skills: Array<{
    name: string;
    level: string;
    verified: boolean;
  }>;
}

interface ProjectTimeline {
  _id: string;
  name: string;
  description: string;
  status: string;
  priority: string;
  startDate: string;
  endDate?: string;
  completionPercentage: number;
  role: string;
  contributionPercentage: number;
  hoursWorked: number;
  milestones: Array<{
    _id: string;
    title: string;
    status: string;
    dueDate: string;
    completedDate?: string;
  }>;
}

interface OKRData {
  _id: string;
  objective: string;
  period: string;
  year: number;
  overallProgress: number;
  status: string;
  keyResults: Array<{
    title: string;
    targetValue: number;
    currentValue: number;
    unit: string;
    status: string;
  }>;
  aiInsights?: {
    achievabilityScore: number;
    riskFactors: string[];
    recommendations: string[];
  };
}

interface FeedbackData {
  _id: string;
  reviewer: { name: string };
  type: string;
  title: string;
  overallRating: number;
  aiSummary?: string;
  aiSentiment: string;
  createdAt: string;
  ratings: {
    technical?: number;
    communication?: number;
    teamwork?: number;
    leadership?: number;
    problemSolving?: number;
    timeManagement?: number;
  };
}

interface AIInsights {
  promotionReadiness?: {
    score: number;
    reasons: string[];
  };
  attritionRisk?: {
    score: number;
    factors: string[];
  };
  strengths: string[];
  improvementAreas: string[];
  skillRecommendations: string[];
  learningPath: string[];
}

export default function EmployeeDashboard() {
  const { user } = useAuth();
  const [profile, setProfile] = useState<EmployeeProfile | null>(null);
  const [projects, setProjects] = useState<ProjectTimeline[]>([]);
  const [okrs, setOKRs] = useState<OKRData[]>([]);
  const [feedback, setFeedback] = useState<FeedbackData[]>([]);
  const [aiInsights, setAIInsights] = useState<AIInsights | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('overview');
  const [profileCompleteness, setProfileCompleteness] = useState(0);

  useEffect(() => {
    if (user) {
      fetchEmployeeData();
    }
  }, [user]);

  const fetchEmployeeData = async () => {
    try {
      setLoading(true);
      
      // Get employee profile
      const profileRes = await api.get('/employees/me');
      const employeeProfile = profileRes.data;
      setProfile(employeeProfile);

      // Calculate profile completeness
      const completeness = calculateProfileCompleteness(employeeProfile);
      setProfileCompleteness(completeness);

      // Get projects timeline
      const projectsRes = await api.get(`/employees/${employeeProfile._id}/projects`);
      setProjects(projectsRes.data?.projects || []);

      // Get OKRs
      const okrsRes = await api.get(`/okrs/employee/${employeeProfile._id}`);
      setOKRs(okrsRes.data?.okrs || []);

      // Get feedback
      const feedbackRes = await api.get(`/feedback/employee/${employeeProfile._id}`);
      setFeedback(feedbackRes.data?.feedback || []);

      // Get AI insights
      try {
        const insightsRes = await api.get(`/employees/${employeeProfile._id}/ai-insights`);
        setAIInsights(insightsRes.data?.insights || null);
      } catch (err) {
        console.warn('Could not fetch AI insights:', err);
      }

    } catch (error) {
      console.error('Error fetching employee data:', error);
    } finally {
      setLoading(false);
    }
  };

  const calculateProfileCompleteness = (profile: EmployeeProfile) => {
    const fields = [
      profile.user.name,
      profile.user.email,
      profile.position,
      profile.department?.name,
      profile.skills?.length > 0 ? 'skills' : '',
      // Add more fields as needed
    ];
    
    const completedFields = fields.filter(field => field && field.toString().trim()).length;
    return Math.round((completedFields / fields.length) * 100);
  };

  const generateAIInsights = async () => {
    if (!profile) return;
    
    try {
      const response = await api.post(`/employees/${profile._id}/ai-insights`);
      setAIInsights(response.data.insights);
    } catch (error) {
      console.error('Error generating AI insights:', error);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading your dashboard...</p>
        </div>
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="text-4xl mb-4">👤</div>
          <h2 className="text-xl font-semibold text-gray-900 mb-2">Employee Profile Not Found</h2>
          <p className="text-gray-600 mb-4">Please contact HR to set up your employee profile.</p>
          <p className="text-sm text-gray-500">Your profile will be created by HR after joining the company.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Top Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center space-x-4">
              <div className="w-10 h-10 bg-blue-600 rounded-full flex items-center justify-center text-white font-semibold">
                {profile.user.name.charAt(0).toUpperCase()}
              </div>
              <div>
                <h1 className="text-lg font-semibold text-gray-900">{profile.user.name}</h1>
                <p className="text-sm text-gray-600">{profile.position} • {profile.department?.name}</p>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <div className="text-right">
                <div className="text-sm font-medium text-gray-900">Profile Completeness</div>
                <div className="flex items-center space-x-2">
                  <div className="w-24 bg-gray-200 rounded-full h-2">
                    <div 
                      className="bg-blue-600 h-2 rounded-full transition-all duration-300" 
                      style={{ width: `${profileCompleteness}%` }}
                    ></div>
                  </div>
                  <span className="text-sm font-semibold text-blue-600">{profileCompleteness}%</span>
                </div>
              </div>
              <Link
                href="/employee/profile"
                className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 text-sm"
              >
                Update Profile
              </Link>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {/* Navigation Tabs */}
        <div className="bg-white rounded-lg shadow-sm mb-6">
          <div className="border-b border-gray-200">
            <nav className="flex space-x-8 px-6">
              {[
                { id: 'overview', name: 'Overview', icon: '📊' },
                { id: 'projects', name: 'My Projects', icon: '📋' },
                { id: 'performance', name: 'Performance & OKRs', icon: '🎯' },
                { id: 'feedback', name: 'Feedback & Reviews', icon: '💬' },
                { id: 'learning', name: 'Learning & Growth', icon: '📚' },
                { id: 'achievements', name: 'Achievements', icon: '🏆' }
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`py-4 px-1 border-b-2 font-medium text-sm flex items-center space-x-2 ${
                    activeTab === tab.id
                      ? 'border-blue-500 text-blue-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  <span>{tab.icon}</span>
                  <span>{tab.name}</span>
                </button>
              ))}
            </nav>
          </div>
        </div>

        {/* Tab Content */}
        <div className="space-y-6">
          {activeTab === 'overview' && (
            <OverviewTab 
              profile={profile}
              projects={projects}
              okrs={okrs}
              feedback={feedback}
              aiInsights={aiInsights}
              onGenerateInsights={generateAIInsights}
            />
          )}
          
          {activeTab === 'projects' && (
            <ProjectsTab projects={projects} />
          )}
          
          {activeTab === 'performance' && (
            <PerformanceTab okrs={okrs} profile={profile} />
          )}
          
          {activeTab === 'feedback' && (
            <FeedbackTab feedback={feedback} />
          )}
          
          {activeTab === 'learning' && (
            <LearningTab aiInsights={aiInsights} profile={profile} />
          )}
          
          {activeTab === 'achievements' && (
            <AchievementsTab profile={profile} feedback={feedback} />
          )}
        </div>
      </div>
    </div>
  );
}

// Overview Tab Component
function OverviewTab({ 
  profile, 
  projects, 
  okrs, 
  feedback, 
  aiInsights, 
  onGenerateInsights 
}: {
  profile: EmployeeProfile;
  projects: ProjectTimeline[];
  okrs: OKRData[];
  feedback: FeedbackData[];
  aiInsights: AIInsights | null;
  onGenerateInsights: () => void;
}) {
  const activeProjects = projects.filter(p => p.status === 'active').length;
  const completedProjects = projects.filter(p => p.status === 'completed').length;
  const currentOKRs = okrs.filter(o => o.status === 'active');
  const avgOKRProgress = currentOKRs.length > 0 
    ? currentOKRs.reduce((sum, okr) => sum + okr.overallProgress, 0) / currentOKRs.length 
    : 0;
  const avgFeedbackRating = feedback.length > 0
    ? feedback.reduce((sum, f) => sum + f.overallRating, 0) / feedback.length
    : 0;

  return (
    <div className="space-y-6">
      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <StatCard
          title="Performance Score"
          value={`${profile.performanceScore}%`}
          icon="📈"
          color="blue"
          trend="+5% from last quarter"
        />
        <StatCard
          title="Active Projects"
          value={activeProjects.toString()}
          icon="📋"
          color="green"
          trend={`${completedProjects} completed`}
        />
        <StatCard
          title="OKR Progress"
          value={`${Math.round(avgOKRProgress)}%`}
          icon="🎯"
          color="purple"
          trend={`${currentOKRs.length} active goals`}
        />
        <StatCard
          title="Feedback Rating"
          value={avgFeedbackRating.toFixed(1)}
          icon="⭐"
          color="orange"
          trend={`${feedback.length} reviews`}
        />
      </div>

      {/* AI Insights Card */}
      <div className="bg-gradient-to-r from-purple-50 to-blue-50 rounded-lg border border-purple-200 p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-gray-900 flex items-center">
            <span className="mr-2">🤖</span>
            AI Career Insights
          </h3>
          <button
            onClick={onGenerateInsights}
            className="px-4 py-2 bg-purple-600 text-white rounded-md hover:bg-purple-700 text-sm"
          >
            Refresh Insights
          </button>
        </div>
        
        {aiInsights ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="bg-white rounded-lg p-4 border border-green-200">
              <h4 className="font-medium text-green-800 mb-2">
                🚀 Promotion Readiness: {aiInsights.promotionReadiness?.score || 0}%
              </h4>
              <ul className="text-sm text-green-700 space-y-1">
                {aiInsights.promotionReadiness?.reasons?.slice(0, 3).map((reason, index) => (
                  <li key={index}>• {reason}</li>
                ))}
              </ul>
            </div>
            
            <div className="bg-white rounded-lg p-4 border border-blue-200">
              <h4 className="font-medium text-blue-800 mb-2">💪 Key Strengths</h4>
              <ul className="text-sm text-blue-700 space-y-1">
                {aiInsights.strengths?.slice(0, 3).map((strength, index) => (
                  <li key={index}>• {strength}</li>
                ))}
              </ul>
            </div>
          </div>
        ) : (
          <div className="text-center py-8">
            <div className="text-gray-400 text-4xl mb-2">🤖</div>
            <p className="text-gray-600 mb-4">Generate AI insights to get personalized career recommendations</p>
            <button
              onClick={onGenerateInsights}
              className="px-6 py-2 bg-purple-600 text-white rounded-md hover:bg-purple-700"
            >
              Generate AI Insights
            </button>
          </div>
        )}
      </div>

      {/* Recent Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Projects */}
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-semibold mb-4">📋 Recent Projects</h3>
          {projects.slice(0, 3).map((project) => (
            <div key={project._id} className="mb-4 p-3 bg-gray-50 rounded-lg">
              <div className="flex justify-between items-start mb-2">
                <h4 className="font-medium text-gray-900">{project.name}</h4>
                <span className={`px-2 py-1 text-xs rounded-full ${
                  project.status === 'completed' ? 'bg-green-100 text-green-800' :
                  project.status === 'active' ? 'bg-blue-100 text-blue-800' :
                  'bg-gray-100 text-gray-800'
                }`}>
                  {project.status}
                </span>
              </div>
              <div className="flex items-center justify-between text-sm text-gray-600">
                <span>Role: {project.role}</span>
                <span>{project.completionPercentage}% complete</span>
              </div>
            </div>
          ))}
          <Link href="#" onClick={() => setActiveTab('projects')} className="text-blue-600 hover:text-blue-800 text-sm">
            View all projects →
          </Link>
        </div>

        {/* Recent Feedback */}
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-semibold mb-4">💬 Recent Feedback</h3>
          {feedback.slice(0, 3).map((fb) => (
            <div key={fb._id} className="mb-4 p-3 bg-gray-50 rounded-lg">
              <div className="flex justify-between items-start mb-2">
                <div>
                  <h4 className="font-medium text-gray-900">{fb.type.replace('-', ' ')}</h4>
                  <p className="text-sm text-gray-600">by {fb.reviewer.name}</p>
                </div>
                <div className="flex items-center">
                  <span className="text-yellow-500">★</span>
                  <span className="text-sm font-medium ml-1">{fb.overallRating}/5</span>
                </div>
              </div>
              {fb.aiSummary && (
                <p className="text-sm text-gray-700">{fb.aiSummary.substring(0, 100)}...</p>
              )}
            </div>
          ))}
          <Link href="#" onClick={() => setActiveTab('feedback')} className="text-blue-600 hover:text-blue-800 text-sm">
            View all feedback →
          </Link>
        </div>
      </div>
    </div>
  );
}

// Stat Card Component
function StatCard({ 
  title, 
  value, 
  icon, 
  color, 
  trend 
}: { 
  title: string; 
  value: string; 
  icon: string; 
  color: string; 
  trend?: string; 
}) {
  const colorClasses = {
    blue: 'bg-blue-50 border-blue-200 text-blue-800',
    green: 'bg-green-50 border-green-200 text-green-800',
    purple: 'bg-purple-50 border-purple-200 text-purple-800',
    orange: 'bg-orange-50 border-orange-200 text-orange-800'
  };

  return (
    <div className={`p-6 rounded-lg border ${colorClasses[color as keyof typeof colorClasses]}`}>
      <div className="flex items-center justify-between mb-2">
        <span className="text-2xl">{icon}</span>
        <div className="text-right">
          <div className="text-2xl font-bold">{value}</div>
        </div>
      </div>
      <div className="text-sm font-medium mb-1">{title}</div>
      {trend && <div className="text-xs opacity-75">{trend}</div>}
    </div>
  );
}

// Placeholder components for other tabs (to be implemented)
function ProjectsTab({ projects }: { projects: ProjectTimeline[] }) {
  return (
    <div className="bg-white rounded-lg shadow p-6">
      <h2 className="text-xl font-semibold mb-4">My Projects & Timeline</h2>
      <p className="text-gray-600">Projects timeline component will be implemented here...</p>
    </div>
  );
}

function PerformanceTab({ okrs, profile }: { okrs: OKRData[]; profile: EmployeeProfile }) {
  return (
    <div className="bg-white rounded-lg shadow p-6">
      <h2 className="text-xl font-semibold mb-4">Performance & OKRs</h2>
      <p className="text-gray-600">OKRs and performance tracking will be implemented here...</p>
    </div>
  );
}

function FeedbackTab({ feedback }: { feedback: FeedbackData[] }) {
  return (
    <div className="bg-white rounded-lg shadow p-6">
      <h2 className="text-xl font-semibold mb-4">Feedback & Reviews</h2>
      <p className="text-gray-600">Detailed feedback view will be implemented here...</p>
    </div>
  );
}

function LearningTab({ aiInsights, profile }: { aiInsights: AIInsights | null; profile: EmployeeProfile }) {
  return (
    <div className="bg-white rounded-lg shadow p-6">
      <h2 className="text-xl font-semibold mb-4">Learning & Growth</h2>
      <p className="text-gray-600">Learning recommendations will be implemented here...</p>
    </div>
  );
}

function AchievementsTab({ profile, feedback }: { profile: EmployeeProfile; feedback: FeedbackData[] }) {
  return (
    <div className="bg-white rounded-lg shadow p-6">
      <h2 className="text-xl font-semibold mb-4">Achievements & Recognition</h2>
      <p className="text-gray-600">Achievements and recognition will be implemented here...</p>
    </div>
  );
}