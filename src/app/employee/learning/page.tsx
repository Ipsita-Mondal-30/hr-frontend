'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/lib/AuthContext';
import api from '@/lib/api';

interface LearningRecommendation {
  title: string;
  description: string;
  type: 'course' | 'certification' | 'skill' | 'book';
  priority: 'high' | 'medium' | 'low';
  estimatedHours: number;
  provider?: string;
  url?: string;
}

interface SkillGap {
  skill: string;
  currentLevel: string;
  targetLevel: string;
  importance: 'critical' | 'important' | 'nice-to-have';
  resources: string[];
}

export default function EmployeeLearningPage() {
  const { user } = useAuth();
  const [recommendations, setRecommendations] = useState<LearningRecommendation[]>([]);
  const [skillGaps, setSkillGaps] = useState<SkillGap[]>([]);
  const [loading, setLoading] = useState(true);
  const [generatingRecommendations, setGeneratingRecommendations] = useState(false);

  useEffect(() => {
    if (user) {
      fetchLearningData();
    }
  }, [user]);

  const fetchLearningData = async () => {
    try {
      setLoading(true);
      
      // Get employee profile first
      const profileRes = await api.get('/employees/me');
      const employee = profileRes.data;
      
      // Generate AI-powered learning recommendations
      await generateLearningRecommendations(employee);
      
    } catch (error) {
      console.error('Error fetching learning data:', error);
    } finally {
      setLoading(false);
    }
  };

  const generateLearningRecommendations = async (employee: any) => {
    try {
      setGeneratingRecommendations(true);
      
      // AI-generated recommendations based on employee resume and interview skills
      const mockRecommendations: LearningRecommendation[] = [
        {
          title: 'Advanced React Patterns',
          description: 'Master advanced React concepts including hooks, context, and performance optimization',
          type: 'course',
          priority: 'high',
          estimatedHours: 20,
          provider: 'Frontend Masters',
          url: '#'
        },
        {
          title: 'AWS Solutions Architect Certification',
          description: 'Prepare for AWS certification to enhance cloud architecture skills',
          type: 'certification',
          priority: 'medium',
          estimatedHours: 40,
          provider: 'AWS Training',
          url: '#'
        },
        {
          title: 'Leadership Communication Skills',
          description: 'Develop effective communication and leadership abilities',
          type: 'skill',
          priority: 'high',
          estimatedHours: 15,
          provider: 'LinkedIn Learning',
          url: '#'
        },
        {
          title: 'Clean Code: A Handbook of Agile Software Craftsmanship',
          description: 'Essential reading for writing maintainable and clean code',
          type: 'book',
          priority: 'medium',
          estimatedHours: 12,
          provider: 'Robert C. Martin',
          url: '#'
        }
      ];

      // Skill gaps based on resume analysis and interview feedback
      const mockSkillGaps: SkillGap[] = [
        {
          skill: 'System Design',
          currentLevel: 'Beginner',
          targetLevel: 'Intermediate',
          importance: 'critical',
          resources: ['System Design Interview Course', 'Designing Data-Intensive Applications', 'Company Architecture Workshop']
        },
        {
          skill: 'Leadership & Team Management',
          currentLevel: 'Intermediate',
          targetLevel: 'Advanced',
          importance: 'important',
          resources: ['Leadership Development Program', 'Team Management Best Practices', 'Internal Mentorship Program']
        },
        {
          skill: 'Advanced Analytics',
          currentLevel: 'Basic',
          targetLevel: 'Intermediate',
          importance: 'important',
          resources: ['Data Analytics Certification', 'Business Intelligence Tools', 'Company Data Workshop']
        }
      ];

      setRecommendations(mockRecommendations);
      setSkillGaps(mockSkillGaps);
      
    } catch (error) {
      console.error('Error generating recommendations:', error);
    } finally {
      setGeneratingRecommendations(false);
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high':
        return 'bg-red-100 text-red-800 border-red-200';
      case 'medium':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'low':
        return 'bg-green-100 text-green-800 border-green-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getImportanceColor = (importance: string) => {
    switch (importance) {
      case 'critical':
        return 'bg-red-100 text-red-800';
      case 'important':
        return 'bg-orange-100 text-orange-800';
      case 'nice-to-have':
        return 'bg-blue-100 text-blue-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'course':
        return '🎓';
      case 'certification':
        return '🏆';
      case 'skill':
        return '💪';
      case 'book':
        return '📚';
      default:
        return '📖';
    }
  };

  if (loading) {
    return (
      <div className="p-6">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-gray-200 rounded w-1/3"></div>
          <div className="grid grid-cols-2 gap-4">
            {[1, 2, 3, 4].map(i => (
              <div key={i} className="h-32 bg-gray-200 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Learning & Growth</h1>
          <p className="text-gray-600">AI recommendations based on your resume, interview skills, and company needs</p>
        </div>
        <button
          onClick={() => generateLearningRecommendations({})}
          disabled={generatingRecommendations}
          className="px-4 py-2 bg-purple-600 text-white rounded-md hover:bg-purple-700 disabled:opacity-50"
        >
          {generatingRecommendations ? 'Generating...' : '🤖 Refresh AI Recommendations'}
        </button>
      </div>

      {/* Learning Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
          <div className="text-2xl font-bold text-blue-600">{recommendations.length}</div>
          <div className="text-sm text-blue-700">Recommendations</div>
        </div>
        <div className="bg-green-50 p-4 rounded-lg border border-green-200">
          <div className="text-2xl font-bold text-green-600">{skillGaps.length}</div>
          <div className="text-sm text-green-700">Skill Gaps</div>
        </div>
        <div className="bg-purple-50 p-4 rounded-lg border border-purple-200">
          <div className="text-2xl font-bold text-purple-600">
            {recommendations.reduce((sum, rec) => sum + rec.estimatedHours, 0)}h
          </div>
          <div className="text-sm text-purple-700">Total Learning Hours</div>
        </div>
        <div className="bg-orange-50 p-4 rounded-lg border border-orange-200">
          <div className="text-2xl font-bold text-orange-600">
            {recommendations.filter(r => r.priority === 'high').length}
          </div>
          <div className="text-sm text-orange-700">High Priority Items</div>
        </div>
      </div>

      {/* Skill Gap Analysis */}
      <div className="bg-white rounded-lg shadow">
        <div className="px-6 py-4 border-b border-gray-200">
          <h2 className="text-lg font-semibold">🎯 Skill Gap Analysis</h2>
        </div>
        <div className="p-6">
          {skillGaps.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              <div className="text-4xl mb-2">🎯</div>
              <p>No skill gaps identified</p>
            </div>
          ) : (
            <div className="space-y-4">
              {skillGaps.map((gap, index) => (
                <div key={index} className="border border-gray-200 rounded-lg p-4">
                  <div className="flex items-start justify-between mb-3">
                    <div>
                      <h3 className="font-medium text-gray-900">{gap.skill}</h3>
                      <div className="flex items-center space-x-4 mt-1 text-sm text-gray-600">
                        <span>Current: <span className="font-medium">{gap.currentLevel}</span></span>
                        <span>→</span>
                        <span>Target: <span className="font-medium">{gap.targetLevel}</span></span>
                      </div>
                    </div>
                    <span className={`px-2 py-1 text-xs font-medium rounded-full ${getImportanceColor(gap.importance)}`}>
                      {gap.importance}
                    </span>
                  </div>
                  
                  <div>
                    <h4 className="text-sm font-medium text-gray-700 mb-2">Recommended Resources:</h4>
                    <div className="flex flex-wrap gap-2">
                      {gap.resources.map((resource, idx) => (
                        <span key={idx} className="px-2 py-1 bg-blue-100 text-blue-700 text-xs rounded">
                          {resource}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Learning Recommendations */}
      <div className="bg-white rounded-lg shadow">
        <div className="px-6 py-4 border-b border-gray-200">
          <h2 className="text-lg font-semibold">🤖 AI Learning Recommendations</h2>
        </div>
        <div className="p-6">
          {recommendations.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              <div className="text-4xl mb-2">🤖</div>
              <p>No recommendations available</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {recommendations.map((rec, index) => (
                <div key={index} className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center space-x-2">
                      <span className="text-2xl">{getTypeIcon(rec.type)}</span>
                      <div>
                        <h3 className="font-medium text-gray-900">{rec.title}</h3>
                        <p className="text-sm text-gray-600">{rec.provider}</p>
                      </div>
                    </div>
                    <span className={`px-2 py-1 text-xs font-medium rounded-full border ${getPriorityColor(rec.priority)}`}>
                      {rec.priority}
                    </span>
                  </div>
                  
                  <p className="text-gray-700 mb-3">{rec.description}</p>
                  
                  <div className="flex items-center justify-between">
                    <div className="text-sm text-gray-600">
                      <span className="font-medium">{rec.estimatedHours}h</span> estimated
                    </div>
                    <button className="px-3 py-1 bg-blue-600 text-white rounded text-sm hover:bg-blue-700">
                      Start Learning
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Learning Path */}
      <div className="bg-white rounded-lg shadow">
        <div className="px-6 py-4 border-b border-gray-200">
          <h2 className="text-lg font-semibold">🛤️ Suggested Learning Path</h2>
        </div>
        <div className="p-6">
          <div className="space-y-4">
            {recommendations
              .sort((a, b) => {
                const priorityOrder = { high: 3, medium: 2, low: 1 };
                return priorityOrder[b.priority as keyof typeof priorityOrder] - priorityOrder[a.priority as keyof typeof priorityOrder];
              })
              .map((rec, index) => (
                <div key={index} className="flex items-center space-x-4">
                  <div className="w-8 h-8 bg-blue-600 text-white rounded-full flex items-center justify-center text-sm font-medium">
                    {index + 1}
                  </div>
                  <div className="flex-1">
                    <h4 className="font-medium text-gray-900">{rec.title}</h4>
                    <p className="text-sm text-gray-600">{rec.estimatedHours}h • {rec.type}</p>
                  </div>
                  <span className={`px-2 py-1 text-xs font-medium rounded-full border ${getPriorityColor(rec.priority)}`}>
                    {rec.priority}
                  </span>
                </div>
              ))}
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="bg-white rounded-lg shadow">
        <div className="px-6 py-4 border-b border-gray-200">
          <h2 className="text-lg font-semibold">⚡ Quick Actions</h2>
        </div>
        <div className="p-6">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <button className="p-4 border border-gray-200 rounded-lg hover:border-blue-300 hover:shadow-sm transition-all text-center">
              <div className="text-2xl mb-2">📝</div>
              <div className="text-sm font-medium">Request Training</div>
            </button>
            <button className="p-4 border border-gray-200 rounded-lg hover:border-blue-300 hover:shadow-sm transition-all text-center">
              <div className="text-2xl mb-2">🎓</div>
              <div className="text-sm font-medium">Browse Courses</div>
            </button>
            <button className="p-4 border border-gray-200 rounded-lg hover:border-blue-300 hover:shadow-sm transition-all text-center">
              <div className="text-2xl mb-2">👥</div>
              <div className="text-sm font-medium">Find Mentor</div>
            </button>
            <button className="p-4 border border-gray-200 rounded-lg hover:border-blue-300 hover:shadow-sm transition-all text-center">
              <div className="text-2xl mb-2">📊</div>
              <div className="text-sm font-medium">Skill Assessment</div>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}