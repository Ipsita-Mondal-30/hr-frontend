'use client';

import { useState, useEffect } from 'react';
import api from '@/lib/api';
import {
  Target,
  TrendingUp,
  Award,
  Users,
  Trophy,
  Medal
} from 'lucide-react';

interface Achievement {
  _id: string;
  title: string;
  description: string;
  type: 'milestone' | 'performance' | 'skill' | 'recognition' | 'certification';
  category?: string;
  dateAwarded: string;
  points?: number;
  level?: string;
  awardedBy?: {
    name: string;
    email: string;
  };
}

export default function EmployeeAchievementsPage() {
  const [achievements, setAchievements] = useState<Achievement[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filter, setFilter] = useState('all');

  useEffect(() => {
    fetchAchievements();
  }, []);

  const fetchAchievements = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await api.get('/achievements/me');
      setAchievements(response.data || []);
    } catch (err) {
      console.error('Error fetching achievements:', err);
      setError('Failed to load achievements. Please try again later.');
    } finally {
      setLoading(false);
    }
  };

  const recognitions = achievements.filter((a) => a.type === 'recognition');

  const filteredAchievements = achievements.filter((achievement) => {
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
      case 'recognition':
        return 'bg-gradient-to-r from-yellow-400 to-orange-500';
      default:
        return 'bg-gradient-to-r from-purple-400 to-pink-500';
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'milestone':
        return <Target className="w-6 h-6 text-blue-600" />;
      case 'performance':
      case 'skill':
        return <TrendingUp className="w-6 h-6 text-blue-600" />;
      case 'recognition':
        return <Users className="w-6 h-6 text-blue-600" />;
      case 'certification':
        return <Trophy className="w-6 h-6 text-blue-600" />;
      default:
        return <Award className="w-6 h-6 text-blue-600" />;
    }
  };

  const getLevelBadge = (level?: string) => {
    if (!level) return null;
    const lower = level.toLowerCase();
    if (lower.includes('gold') || lower.includes('expert')) {
      return <Medal className="w-6 h-6 text-yellow-500" />;
    }
    if (lower.includes('silver')) {
      return <Medal className="w-6 h-6 text-gray-400" />;
    }
    if (lower.includes('bronze')) {
      return <Medal className="w-6 h-6 text-amber-600" />;
    }
    return <Award className="w-6 h-6 text-blue-500" />;
  };

  if (loading) {
    return (
      <div className="p-6">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-gray-200 rounded w-1/3"></div>
          <div className="grid grid-cols-3 gap-4">
            {[1, 2, 3].map((i) => (
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
          <p className="text-gray-600">Your accomplishments awarded by HR and management</p>
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

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
          {error}
        </div>
      )}

      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        <div className="bg-blue-50 p-4 rounded-lg border border-blue-200 text-center">
          <div className="text-2xl font-bold text-blue-600">{achievements.length}</div>
          <div className="text-sm text-blue-700">Total Achievements</div>
        </div>
        <div className="bg-green-50 p-4 rounded-lg border border-green-200 text-center">
          <div className="text-2xl font-bold text-green-600">
            {achievements.filter((a) => a.type === 'performance').length}
          </div>
          <div className="text-sm text-green-700">Performance Awards</div>
        </div>
        <div className="bg-purple-50 p-4 rounded-lg border border-purple-200 text-center">
          <div className="text-2xl font-bold text-purple-600">
            {achievements.filter((a) => a.type === 'skill').length}
          </div>
          <div className="text-sm text-purple-700">Skill Achievements</div>
        </div>
        <div className="bg-orange-50 p-4 rounded-lg border border-orange-200 text-center">
          <div className="text-2xl font-bold text-orange-600">{recognitions.length}</div>
          <div className="text-sm text-orange-700">Recognitions</div>
        </div>
        <div className="bg-yellow-50 p-4 rounded-lg border border-yellow-200 text-center">
          <div className="text-2xl font-bold text-yellow-600">
            {achievements.filter((a) => a.type === 'certification').length}
          </div>
          <div className="text-sm text-yellow-700">Certifications</div>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow">
        <div className="px-6 py-4 border-b border-gray-200">
          <h2 className="text-lg font-semibold">Recognition & Awards</h2>
        </div>
        <div className="p-6">
          {recognitions.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              <div className="text-4xl mb-2">🏆</div>
              <p>No recognitions yet</p>
              <p className="text-sm mt-1">Recognition awards from HR will appear here</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {recognitions.map((recognition) => (
                <div key={recognition._id} className="relative">
                  <div className={`${getRecognitionColor(recognition.type)} p-6 rounded-lg text-white shadow-lg`}>
                    <div className="text-center">
                      <div className="text-4xl mb-2">🏆</div>
                      <h3 className="text-lg font-bold mb-2">{recognition.title}</h3>
                      {recognition.category && (
                        <div className="text-sm opacity-90 mb-2">{recognition.category}</div>
                      )}
                      <p className="text-sm opacity-90 mb-3">{recognition.description}</p>
                      {recognition.awardedBy?.name && (
                        <div className="text-xs opacity-75">
                          Awarded by {recognition.awardedBy.name}
                        </div>
                      )}
                      <div className="text-xs opacity-75">
                        {new Date(recognition.dateAwarded).toLocaleDateString()}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      <div className="bg-white rounded-lg shadow">
        <div className="px-6 py-4 border-b border-gray-200">
          <h2 className="text-lg font-semibold flex items-center gap-2">
            <Target className="w-5 h-5" />
            Achievements Timeline
          </h2>
        </div>
        <div className="p-6">
          {achievements.length === 0 ? (
            <div className="text-center py-12 text-gray-500">
              <Award className="w-16 h-16 mx-auto mb-4 text-gray-300" />
              <p className="text-lg font-medium text-gray-700">No achievements yet</p>
              <p className="text-sm mt-2">
                Achievements awarded by HR or Admin will show up here
              </p>
            </div>
          ) : filteredAchievements.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              <Target className="w-16 h-16 mx-auto mb-2 text-gray-400" />
              <p>No achievements found for the selected filter</p>
            </div>
          ) : (
            <div className="space-y-6">
              {filteredAchievements
                .sort((a, b) => new Date(b.dateAwarded).getTime() - new Date(a.dateAwarded).getTime())
                .map((achievement) => (
                  <div key={achievement._id} className="flex items-start space-x-4">
                    <div className="flex-shrink-0">
                      <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                        {getTypeIcon(achievement.type)}
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
                            {getLevelBadge(achievement.level)}
                          </div>
                          <p className="text-gray-600 mb-2">{achievement.description}</p>
                          <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-gray-500">
                            <span>{new Date(achievement.dateAwarded).toLocaleDateString()}</span>
                            {achievement.category && (
                              <span className="font-medium text-blue-600">{achievement.category}</span>
                            )}
                            {achievement.level && (
                              <span>Level: {achievement.level}</span>
                            )}
                            {achievement.points != null && achievement.points > 0 && (
                              <span>{achievement.points} points</span>
                            )}
                            {achievement.awardedBy?.name && (
                              <span>Awarded by {achievement.awardedBy.name}</span>
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
    </div>
  );
}
