'use client';
import TaloraLoader from '@/components/TaloraLoader';

import { notify } from '@/lib/notify';
import { useState, useEffect } from 'react';
import api from '@/lib/api';

interface Achievement {
  _id: string;
  employee: {
    _id: string;
    user: {
      name: string;
      email: string;
    };
  };
  title: string;
  description: string;
  type: 'performance' | 'skill' | 'recognition' | 'certification' | 'milestone';
  category: string;
  dateAwarded: string;
  awardedBy: {
    name: string;
    email: string;
  };
  points?: number;
  level?: string;
}

interface Employee {
  _id: string;
  user?: {
    name: string;
    email: string;
  };
  position: string;
}

type AchievementType = 'performance' | 'skill' | 'recognition' | 'certification' | 'milestone';

interface AchievementsManagementProps {
  achievementsApiPath: string;
  employeesApiPath: string;
  title?: string;
}

export default function AchievementsManagement({
  achievementsApiPath,
  employeesApiPath,
  title = 'Achievements Management'
}: AchievementsManagementProps) {
  const [achievements, setAchievements] = useState<Achievement[]>([]);
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    employeeId: '',
    title: '',
    description: '',
    type: 'performance' as AchievementType,
    category: '',
    points: 0,
    level: ''
  });

  const fetchData = async () => {
    try {
      setLoading(true);

      const [achievementsResponse, employeesResponse] = await Promise.all([
        api.get(achievementsApiPath),
        api.get(employeesApiPath)
      ]);

      setAchievements(achievementsResponse.data || []);
      setEmployees(employeesResponse.data?.employees || employeesResponse.data || []);
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [achievementsApiPath, employeesApiPath]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await api.post(achievementsApiPath, formData);
      setShowCreateForm(false);
      setFormData({
        employeeId: '',
        title: '',
        description: '',
        type: 'performance',
        category: '',
        points: 0,
        level: ''
      });
      fetchData();
    } catch (error) {
      console.error('Error creating achievement:', error);
      notify('Failed to create achievement');
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Delete this achievement? The employee will no longer see it.')) return;

    try {
      setDeletingId(id);
      await api.delete(`${achievementsApiPath}/${id}`);
      fetchData();
    } catch (error) {
      console.error('Error deleting achievement:', error);
      notify('Failed to delete achievement');
    } finally {
      setDeletingId(null);
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'performance': return '🏆';
      case 'skill': return '⚛️';
      case 'recognition': return '🤝';
      case 'certification': return '📜';
      case 'milestone': return '🎯';
      default: return '🏅';
    }
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'performance': return 'bg-green-100 text-green-800';
      case 'skill': return 'bg-blue-100 text-blue-800';
      case 'recognition': return 'bg-purple-100 text-purple-800';
      case 'certification': return 'bg-yellow-100 text-yellow-800';
      case 'milestone': return 'bg-indigo-100 text-indigo-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  if (loading) {
    return (
      <TaloraLoader size="sm" className="min-h-64" />
    );
  }

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">{title}</h1>
          <p className="text-gray-600">Award and manage employee achievements</p>
        </div>
        <button
          onClick={() => setShowCreateForm(true)}
          className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
        >
          Add Achievement
        </button>
      </div>

      {showCreateForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md max-h-[90vh] overflow-y-auto">
            <h2 className="text-xl font-bold text-gray-900 mb-4">Add New Achievement</h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Employee</label>
                <select
                  value={formData.employeeId}
                  onChange={(e) => setFormData({ ...formData, employeeId: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                >
                  <option value="">Select Employee</option>
                  {employees.map((employee) => (
                    <option key={employee._id} value={employee._id}>
                      {employee.user?.name || 'No Name'} - {employee.position}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Title</label>
                <input
                  type="text"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  rows={3}
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Type</label>
                <select
                  value={formData.type}
                  onChange={(e) => setFormData({ ...formData, type: e.target.value as AchievementType })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="performance">Performance</option>
                  <option value="skill">Skill</option>
                  <option value="recognition">Recognition</option>
                  <option value="certification">Certification</option>
                  <option value="milestone">Milestone</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Category</label>
                <input
                  type="text"
                  value={formData.category}
                  onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="e.g., Q2 2024, Technical Excellence"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Points</label>
                  <input
                    type="number"
                    value={formData.points}
                    onChange={(e) => setFormData({ ...formData, points: parseInt(e.target.value) || 0 })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Level</label>
                  <input
                    type="text"
                    value={formData.level}
                    onChange={(e) => setFormData({ ...formData, level: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="e.g., Advanced, Expert"
                  />
                </div>
              </div>

              <div className="flex space-x-3 pt-4">
                <button
                  type="submit"
                  className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                >
                  Create Achievement
                </button>
                <button
                  type="button"
                  onClick={() => setShowCreateForm(false)}
                  className="flex-1 px-4 py-2 bg-gray-300 text-gray-700 rounded-md hover:bg-gray-400"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      <div className="bg-white rounded-lg shadow-sm border overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Employee
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Achievement
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Type
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Date Awarded
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {achievements.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-6 py-12 text-center text-gray-500">
                    <div className="text-4xl mb-2">🏆</div>
                    <p>No achievements found</p>
                    <p className="text-sm">Add achievements to recognize employee accomplishments</p>
                  </td>
                </tr>
              ) : (
                achievements.map((achievement) => (
                  <tr key={achievement._id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div>
                        <div className="text-sm font-medium text-gray-900">
                          {achievement.employee?.user?.name || 'No Name'}
                        </div>
                        <div className="text-sm text-gray-500">
                          {achievement.employee?.user?.email || 'No Email'}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div>
                        <div className="text-sm font-medium text-gray-900 flex items-center">
                          <span className="mr-2">{getTypeIcon(achievement.type)}</span>
                          {achievement.title}
                        </div>
                        <div className="text-sm text-gray-500 mt-1">
                          {achievement.description}
                        </div>
                        {achievement.category && (
                          <div className="text-xs text-gray-400 mt-1">
                            {achievement.category}
                          </div>
                        )}
                        {achievement.awardedBy?.name && (
                          <div className="text-xs text-gray-400 mt-1">
                            Awarded by {achievement.awardedBy.name}
                          </div>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getTypeColor(achievement.type)}`}>
                        {achievement.type.charAt(0).toUpperCase() + achievement.type.slice(1)}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {new Date(achievement.dateAwarded).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <button
                        onClick={() => handleDelete(achievement._id)}
                        disabled={deletingId === achievement._id}
                        className="text-red-600 hover:text-red-900 disabled:opacity-50"
                      >
                        {deletingId === achievement._id ? 'Deleting...' : 'Delete'}
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
