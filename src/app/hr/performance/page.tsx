'use client';

import { useState, useEffect } from 'react';
import api from '@/lib/api';
import Link from 'next/link';

interface Employee {
  _id: string;
  user: {
    name: string;
    email: string;
  };
  position: string;
  performanceScore: number;
  stats: {
    projectsCount: number;
    okrsCount: number;
    feedbackCount: number;
    avgRating: number;
  };
}

interface OKR {
  _id: string;
  employee: {
    user: {
      name: string;
    };
  };
  objective: string;
  period: string;
  year: number;
  overallProgress: number;
  status: string;
}

export default function PerformanceManagement() {
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [okrs, setOKRs] = useState<OKR[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'employees' | 'okrs'>('employees');

  const fetchEmployees = async () => {
    try {
      const response = await api.get('/hr/employees');
      setEmployees(response.data?.employees || response.data || []);
    } catch (error) {
      console.error('Error fetching employees:', error);
    }
  };

  const fetchOKRs = async () => {
    try {
      const response = await api.get('/okrs');
      console.log('OKRs response:', response.data);
      setOKRs(Array.isArray(response.data) ? response.data : []);
    } catch (error) {
      console.error('Error fetching OKRs:', error);
      setOKRs([]);
    }
  };

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      await Promise.all([fetchEmployees(), fetchOKRs()]);
      setLoading(false);
    };
    fetchData();
  }, []);

  const getPerformanceColor = (score: number) => {
    if (score >= 90) return 'text-green-600 bg-green-100';
    if (score >= 75) return 'text-blue-600 bg-blue-100';
    if (score >= 60) return 'text-yellow-600 bg-yellow-100';
    return 'text-red-600 bg-red-100';
  };

  const getProgressColor = (progress: number) => {
    if (progress >= 90) return 'bg-green-500';
    if (progress >= 75) return 'bg-blue-500';
    if (progress >= 50) return 'bg-yellow-500';
    return 'bg-red-500';
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Performance & OKR Management</h1>
          <p className="text-gray-600">Monitor employee performance and manage OKRs</p>
        </div>
        <div className="space-x-2">
          <Link
            href="/hr/performance/review"
            className="px-4 py-2 bg-purple-600 text-white rounded-md hover:bg-purple-700"
          >
            Conduct Review
          </Link>
          <Link
            href="/hr/feedback/give"
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
          >
            Give Feedback
          </Link>
        </div>
      </div>

      {/* Tabs */}
      <div className="border-b border-gray-200 mb-6">
        <nav className="-mb-px flex space-x-8">
          <button
            onClick={() => setActiveTab('employees')}
            className={`py-2 px-1 border-b-2 font-medium text-sm ${
              activeTab === 'employees'
                ? 'border-blue-500 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            Employee Performance
          </button>
          <button
            onClick={() => setActiveTab('okrs')}
            className={`py-2 px-1 border-b-2 font-medium text-sm ${
              activeTab === 'okrs'
                ? 'border-blue-500 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            OKRs Management
          </button>
        </nav>
      </div>

      {activeTab === 'employees' && (
        <div className="bg-white rounded-lg shadow-sm border overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Employee
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Position
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Performance Score
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Projects
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    OKRs
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Avg Rating
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {employees.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="px-6 py-12 text-center text-gray-500">
                      <div className="text-4xl mb-2">👥</div>
                      <p>No employees found</p>
                      <p className="text-sm">Add employees to track their performance</p>
                    </td>
                  </tr>
                ) : (
                  employees.map((employee) => (
                    <tr key={employee._id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div>
                          <div className="text-sm font-medium text-gray-900">
                            {employee.user?.name || 'No Name'}
                          </div>
                          <div className="text-sm text-gray-500">
                            {employee.user?.email || 'No Email'}
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {employee.position}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getPerformanceColor(employee.performanceScore || 0)}`}>
                          {employee.performanceScore || 0}%
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {employee.stats?.projectsCount || 0}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {employee.stats?.okrsCount || 0}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {employee.stats?.avgRating ? `${employee.stats.avgRating.toFixed(1)}/5` : 'N/A'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium space-x-2">
                        <Link
                          href={`/hr/performance/employee/${employee._id}`}
                          className="text-indigo-600 hover:text-indigo-900"
                        >
                          View Details
                        </Link>
                        <Link
                          href={`/hr/performance/feedback/${employee._id}`}
                          className="text-green-600 hover:text-green-900"
                        >
                          Give Feedback
                        </Link>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {activeTab === 'okrs' && (
        <div className="space-y-6">
          {/* OKR Stats */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <div className="bg-white rounded-lg shadow-sm border p-6">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <div className="w-8 h-8 bg-blue-500 rounded-lg flex items-center justify-center">
                    <span className="text-white text-sm font-bold">🎯</span>
                  </div>
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Total OKRs</p>
                  <p className="text-2xl font-bold text-gray-900">{Array.isArray(okrs) ? okrs.length : 0}</p>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow-sm border p-6">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <div className="w-8 h-8 bg-green-500 rounded-lg flex items-center justify-center">
                    <span className="text-white text-sm font-bold">✅</span>
                  </div>
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Completed</p>
                  <p className="text-2xl font-bold text-gray-900">
                    {Array.isArray(okrs) ? okrs.filter(okr => okr.overallProgress >= 100).length : 0}
                  </p>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow-sm border p-6">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <div className="w-8 h-8 bg-yellow-500 rounded-lg flex items-center justify-center">
                    <span className="text-white text-sm font-bold">⏳</span>
                  </div>
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">In Progress</p>
                  <p className="text-2xl font-bold text-gray-900">
                    {Array.isArray(okrs) ? okrs.filter(okr => okr.overallProgress > 0 && okr.overallProgress < 100).length : 0}
                  </p>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow-sm border p-6">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <div className="w-8 h-8 bg-red-500 rounded-lg flex items-center justify-center">
                    <span className="text-white text-sm font-bold">🚨</span>
                  </div>
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">At Risk</p>
                  <p className="text-2xl font-bold text-gray-900">
                    {Array.isArray(okrs) ? okrs.filter(okr => okr.overallProgress < 25).length : 0}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* OKRs List */}
          <div className="bg-white rounded-lg shadow-sm border overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-200">
              <h3 className="text-lg font-medium text-gray-900">Current OKRs</h3>
            </div>
            <div className="divide-y divide-gray-200">
              {okrs.length === 0 ? (
                <div className="px-6 py-12 text-center text-gray-500">
                  <div className="text-4xl mb-2">🎯</div>
                  <p>No OKRs found</p>
                  <p className="text-sm">Create OKRs to track employee objectives</p>
                </div>
              ) : (
                okrs.map((okr) => (
                  <div key={okr._id} className="px-6 py-4">
                    <div className="flex items-center justify-between">
                      <div className="flex-1">
                        <div className="flex items-center justify-between mb-2">
                          <h4 className="text-sm font-medium text-gray-900">
                            {okr.objective}
                          </h4>
                          <span className="text-sm text-gray-500">
                            {okr.employee.user.name} • {okr.period} {okr.year}
                          </span>
                        </div>
                        <div className="flex items-center space-x-4">
                          <div className="flex-1">
                            <div className="flex items-center justify-between text-sm text-gray-600 mb-1">
                              <span>Progress</span>
                              <span>{okr.overallProgress}%</span>
                            </div>
                            <div className="w-full bg-gray-200 rounded-full h-2">
                              <div
                                className={`h-2 rounded-full ${getProgressColor(okr.overallProgress)}`}
                                style={{ width: `${okr.overallProgress}%` }}
                              ></div>
                            </div>
                          </div>
                          <div className="flex space-x-2">
                            <Link
                              href={`/hr/performance/okr/${okr._id}`}
                              className="text-indigo-600 hover:text-indigo-900 text-sm"
                            >
                              View
                            </Link>
                            <Link
                              href={`/hr/performance/okr/${okr._id}/edit`}
                              className="text-green-600 hover:text-green-900 text-sm"
                            >
                              Edit
                            </Link>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}