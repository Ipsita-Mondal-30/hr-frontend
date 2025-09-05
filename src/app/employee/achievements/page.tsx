'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/lib/AuthContext';


interface Achievement {
  id: string;
  title: string;
  description: string;
  type: 'milestone' | 'performance' | 'skill' | 'recognition' | 'certification';
  date: string;
  icon: string;
  value?: string;
  project?: string;
  badge?: string;
}

interface Recognition {
  id: string;
  title: string;
  description: string;
  awardedBy: string;
  date: string;
  type: 'employee-of-month' | 'top-performer' | 'innovation' | 'teamwork' | 'leadership';
  period?: string;
}

export default function EmployeeAchievementsPage() {
  const { user } = useAuth();
  const [achievements, setAchievements] = useState<Achievement[]>([]);
  const [recognitions, setRecognitions] = useState<Recognition[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');

  useEffect(() => {
    if (user) {
      fetchAchievements();
    }
  }, [user]);

  const fetchAchievements = async () => {
    try {
      setLoading(true);
      
      // Mock achievements data - in real app, this would come from API
      const mockAchievements: Achievement[] = [
        {
          id: '1',
          title: 'Project Milestone Champion',
          description: 'Completed 10 project milestones ahead of schedule',
          type: 'milestone',
          date: '2024-08-15',
          icon: '🎯',
          value: '10 milestones',
          project: 'Website Redesign'
        },
        {
          id: '2',
          title: 'Performance Excellence',
          description: 'Achieved 95% performance score for Q2 2024',
          type: 'performance',
          date: '2024-07-01',
          icon: '📈',
          value: '95%',
          badge: 'gold'
        },
        {
          id: '3',
          title: 'React Expert',
          description: 'Mastered advanced React patterns and optimization techniques',
          type: 'skill',
          date: '2024-06-20',
          icon: '⚛️',
          value: 'Advanced Level'
        },
        {
          id: '4',
          title: 'Team Collaboration Star',
          description: 'Received outstanding feedback for teamwork and collaboration',
          type: 'recognition',
          date: '2024-05-10',
          icon: '🤝',
          value: '4.8/5 rating'
        },
        {
          id: '5',
          title: 'AWS Solutions Architect',
          description: 'Successfully obtained AWS Solutions Architect certification',
          type: 'certification',
          date: '2024-04-15',
          icon: '🏆',
          value: 'Certified'
        }
      ];

      const mockRecognitions: Recognition[] = [
        {
          id: '1',
          title: 'Employee of the Month',
          description: 'Outstanding performance and dedication in July 2024',
          awardedBy: 'Sarah Johnson, HR Manager',
          date: '2024-07-31',
          type: 'employee-of-month',
          period: 'July 2024'
        },
        {
          id: '2',
          title: 'Top Performer Q2',
          description: 'Ranked in top 5 performers for Q2 2024',
          awardedBy: 'Michael Chen, Engineering Manager',
          date: '2024-06-30',
          type: 'top-performer',
          period: 'Q2 2024'
        },
        {
          id: '3',
          title: 'Innovation Award',
          description: 'Innovative solution for improving deployment process',
          awardedBy: 'David Wilson, CTO',
          date: '2024-05-15',
          type: 'innovation'
        }
      ];

      setAchievements(mockAchievements);
      setRecognitions(mockRecognitions);
      
    } catch (error) {
      console.error('Error fetching achievements:', error);
    } finally {
      setLoading(false);
    }
  };

  const filteredAchievements = achievements.filter(achievement => {
    if (filter === 'all') return true;
    return achievement.type === filter;
  });

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'milestone':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'performance':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'skill':
        return 'bg-purple-100 text-purple-800 border-purple-200';
      case 'recognition':
        return 'bg-orange-100 text-orange-800 border-orange-200';
      case 'certification':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getRecognitionColor = (type: string) => {
    switch (type) {
      case 'employee-of-month':
        return 'bg-gradient-to-r from-yellow-400 to-orange-500';
      case 'top-performer':
        return 'bg-gradient-to-r from-green-400 to-blue-500';
      case 'innovation':
        return 'bg-gradient-to-r from-purple-400 to-pink-500';
      case 'teamwork':
        return 'bg-gradient-to-r from-blue-400 to-indigo-500';
      case 'leadership':
        return 'bg-gradient-to-r from-red-400 to-pink-500';
      default:
        return 'bg-gradient-to-r from-gray-400 to-gray-500';
    }
  };

  const getBadgeIcon = (badge?: string) => {
    switch (badge) {
      case 'gold':
        return '🥇';
      case 'silver':
        return '🥈';
      case 'bronze':
        return '🥉';
      default:
        return '🏅';
    }
  };

  if (loading) {
    return (
      <div className="p-6">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-gray-200 rounded w-1/3"></div>
          <div className="grid grid-cols-3 gap-4">
            {[1, 2, 3].map(i => (
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
          <h1 className="text-2xl font-bold text-gray-900">Achievements & Recognition</h1>
          <p className="text-gray-600">Celebrate your accomplishments and milestones</p>
        </div>
        <div className="flex items-center space-x-4">
          <select
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="all">All Achievements</option>
            <option value="milestone">Milestones</option>
            <option value="performance">Performance</option>
            <option value="skill">Skills</option>
            <option value="recognition">Recognition</option>
            <option value="certification">Certifications</option>
          </select>
        </div>
      </div>

      {/* Achievement Stats */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        <div className="bg-blue-50 p-4 rounded-lg border border-blue-200 text-center">
          <div className="text-2xl font-bold text-blue-600">{achievements.length}</div>
          <div className="text-sm text-blue-700">Total Achievements</div>
        </div>
        <div className="bg-green-50 p-4 rounded-lg border border-green-200 text-center">
          <div className="text-2xl font-bold text-green-600">
            {achievements.filter(a => a.type === 'performance').length}
          </div>
          <div className="text-sm text-green-700">Performance Awards</div>
        </div>
        <div className="bg-purple-50 p-4 rounded-lg border border-purple-200 text-center">
          <div className="text-2xl font-bold text-purple-600">
            {achievements.filter(a => a.type === 'skill').length}
          </div>
          <div className="text-sm text-purple-700">Skill Achievements</div>
        </div>
        <div className="bg-orange-50 p-4 rounded-lg border border-orange-200 text-center">
          <div className="text-2xl font-bold text-orange-600">{recognitions.length}</div>
          <div className="text-sm text-orange-700">Recognitions</div>
        </div>
        <div className="bg-yellow-50 p-4 rounded-lg border border-yellow-200 text-center">
          <div className="text-2xl font-bold text-yellow-600">
            {achievements.filter(a => a.type === 'certification').length}
          </div>
          <div className="text-sm text-yellow-700">Certifications</div>
        </div>
      </div>

      {/* Recognition Highlights */}
      <div className="bg-white rounded-lg shadow">
        <div className="px-6 py-4 border-b border-gray-200">
          <h2 className="text-lg font-semibold">🏆 Recognition & Awards</h2>
        </div>
        <div className="p-6">
          {recognitions.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              <div className="text-4xl mb-2">🏆</div>
              <p>No recognitions yet</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {recognitions.map((recognition) => (
                <div key={recognition.id} className="relative">
                  <div className={`${getRecognitionColor(recognition.type)} p-6 rounded-lg text-white shadow-lg`}>
                    <div className="text-center">
                      <div className="text-4xl mb-2">🏆</div>
                      <h3 className="text-lg font-bold mb-2">{recognition.title}</h3>
                      {recognition.period && (
                        <div className="text-sm opacity-90 mb-2">{recognition.period}</div>
                      )}
                      <p className="text-sm opacity-90 mb-3">{recognition.description}</p>
                      <div className="text-xs opacity-75">
                        Awarded by {recognition.awardedBy}
                      </div>
                      <div className="text-xs opacity-75">
                        {new Date(recognition.date).toLocaleDateString()}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Achievements Timeline */}
      <div className="bg-white rounded-lg shadow">
        <div className="px-6 py-4 border-b border-gray-200">
          <h2 className="text-lg font-semibold">🎯 Achievements Timeline</h2>
        </div>
        <div className="p-6">
          {filteredAchievements.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              <div className="text-4xl mb-2">🎯</div>
              <p>No achievements found for the selected filter</p>
            </div>
          ) : (
            <div className="space-y-6">
              {filteredAchievements
                .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
                .map((achievement) => (
                  <div key={achievement.id} className="flex items-start space-x-4">
                    <div className="flex-shrink-0">
                      <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center text-2xl">
                        {achievement.icon}
                      </div>
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center space-x-3 mb-2">
                            <h3 className="text-lg font-medium text-gray-900">{achievement.title}</h3>
                            <span className={`px-2 py-1 text-xs font-medium rounded-full border ${getTypeColor(achievement.type)}`}>
                              {achievement.type}
                            </span>
                            {achievement.badge && (
                              <span className="text-lg">{getBadgeIcon(achievement.badge)}</span>
                            )}
                          </div>
                          <p className="text-gray-600 mb-2">{achievement.description}</p>
                          <div className="flex items-center space-x-4 text-sm text-gray-500">
                            <span>{new Date(achievement.date).toLocaleDateString()}</span>
                            {achievement.value && (
                              <span className="font-medium text-blue-600">{achievement.value}</span>
                            )}
                            {achievement.project && (
                              <span>Project: {achievement.project}</span>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
            </div>
          )}
        </div>
      </div>

      {/* Skill Progress */}
      <div className="bg-white rounded-lg shadow">
        <div className="px-6 py-4 border-b border-gray-200">
          <h2 className="text-lg font-semibold">💪 Skill Improvements</h2>
        </div>
        <div className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <h3 className="font-medium text-gray-900">Technical Skills</h3>
              {[
                { skill: 'React', level: 90, improvement: '+15%' },
                { skill: 'Node.js', level: 85, improvement: '+10%' },
                { skill: 'AWS', level: 75, improvement: '+25%' },
                { skill: 'TypeScript', level: 80, improvement: '+20%' }
              ].map((item, index) => (
                <div key={index} className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="font-medium">{item.skill}</span>
                    <span className="text-green-600">{item.improvement}</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div 
                      className="bg-blue-600 h-2 rounded-full transition-all duration-300" 
                      style={{ width: `${item.level}%` }}
                    ></div>
                  </div>
                </div>
              ))}
            </div>
            
            <div className="space-y-4">
              <h3 className="font-medium text-gray-900">Soft Skills</h3>
              {[
                { skill: 'Communication', level: 88, improvement: '+12%' },
                { skill: 'Leadership', level: 75, improvement: '+18%' },
                { skill: 'Teamwork', level: 92, improvement: '+8%' },
                { skill: 'Problem Solving', level: 85, improvement: '+15%' }
              ].map((item, index) => (
                <div key={index} className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="font-medium">{item.skill}</span>
                    <span className="text-green-600">{item.improvement}</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div 
                      className="bg-green-600 h-2 rounded-full transition-all duration-300" 
                      style={{ width: `${item.level}%` }}
                    ></div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Goals & Targets */}
      <div className="bg-white rounded-lg shadow">
        <div className="px-6 py-4 border-b border-gray-200">
          <h2 className="text-lg font-semibold">🎯 Next Milestones</h2>
        </div>
        <div className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="text-center p-6 border border-gray-200 rounded-lg">
              <div className="text-3xl mb-2">🏆</div>
              <h3 className="font-medium text-gray-900 mb-2">Senior Developer</h3>
              <p className="text-sm text-gray-600 mb-3">Target promotion level</p>
              <div className="w-full bg-gray-200 rounded-full h-2 mb-2">
                <div className="bg-blue-600 h-2 rounded-full" style={{ width: '75%' }}></div>
              </div>
              <div className="text-sm text-gray-500">75% progress</div>
            </div>
            
            <div className="text-center p-6 border border-gray-200 rounded-lg">
              <div className="text-3xl mb-2">📚</div>
              <h3 className="font-medium text-gray-900 mb-2">5 Certifications</h3>
              <p className="text-sm text-gray-600 mb-3">Annual learning goal</p>
              <div className="w-full bg-gray-200 rounded-full h-2 mb-2">
                <div className="bg-green-600 h-2 rounded-full" style={{ width: '40%' }}></div>
              </div>
              <div className="text-sm text-gray-500">2 of 5 completed</div>
            </div>
            
            <div className="text-center p-6 border border-gray-200 rounded-lg">
              <div className="text-3xl mb-2">⭐</div>
              <h3 className="font-medium text-gray-900 mb-2">4.5+ Rating</h3>
              <p className="text-sm text-gray-600 mb-3">Performance target</p>
              <div className="w-full bg-gray-200 rounded-full h-2 mb-2">
                <div className="bg-yellow-600 h-2 rounded-full" style={{ width: '90%' }}></div>
              </div>
              <div className="text-sm text-gray-500">4.2 current rating</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}