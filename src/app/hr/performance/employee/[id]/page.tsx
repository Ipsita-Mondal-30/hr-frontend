'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import api from '@/lib/api';
import Link from 'next/link';

interface Employee {
  _id: string;
  user: {
    name: string;
    email: string;
  };
  position: string;
  department: {
    name: string;
  };
  performanceScore: number;
  joinDate: string;
}

interface PerformanceData {
  employee: Employee;
  metrics: {
    projectsCompleted: number;
    averageRating: number;
    feedbackCount: number;
    okrsCount: number;
    completedOKRs: number;
  };
  recentFeedback: Array<{
    _id: string;
    feedback: string;
    rating: number;
    createdAt: string;
    givenBy: {
      name: string;
    };
  }>;
  okrs: Array<{
    _id: string;
    objective: string;
    overallProgress: number;
    status: string;
    period: string;
    year: number;
  }>;
}

function isAxiosError(error: unknown): error is { response?: { data?: unknown } } {
  return typeof error === 'object' && error !== null && 'response' in error;
}

export default function EmployeePerformanceDetails() {
  const params = useParams();
  const employeeId = params.id as string;
  const [data, setData] = useState<PerformanceData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchPerformanceData = async () => {
      try {
        console.log('🔍 Fetching performance data for employee:', employeeId);
        const response = await api.get(`/employees/${employeeId}/performance`);
        console.log('✅ Performance data received:', response.data);
        setData(response.data);
      } catch (error) {
        console.error('❌ Error fetching performance data:', error);
        if (isAxiosError(error)) {
          console.error('❌ Error details:', error.response?.data);
        }
      } finally {
        setLoading(false);
      }
    };

    if (employeeId) {
      fetchPerformanceData();
    }
  }, [employeeId]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!data) {
    return (
      <div className="text-center py-12">
        <div className="text-4xl mb-4">❌</div>
        <h2 className="text-xl font-semibold text-gray-900 mb-2">Employee Not Found</h2>
        <p className="text-gray-600 mb-4">The employee performance data could not be loaded.</p>
        <Link
          href="/hr/performance"
          className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
        >
          Back to Performance
        </Link>
      </div>
    );
  }

  const { employee, metrics, recentFeedback = [], okrs = [] } = data;

  const getProgressColor = (progress: number) => {
    if (progress >= 90) return 'bg-green-500';
    if (progress >= 75) return 'bg-blue-500';
    if (progress >= 50) return 'bg-yellow-500';
    return 'bg-red-500';
  };

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">
            {employee.user?.name || 'Unknown Employee'} - Performance Details
          </h1>
          <p className="text-gray-600">
            {employee.position || 'Unknown Position'} • {employee.department?.name || 'No Department'}
          </p>
        </div>
        <div className="space-x-2">
          <Link
            href={`/hr/performance/feedback/${employeeId}`}
            className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700"
          >
            Give Feedback
          </Link>
          <Link
            href="/hr/performance"
            className="px-4 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-700"
          >
            Back to Performance
          </Link>
        </div>
      </div>

      {/* Performance Overview */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <div className="bg-white rounded-lg shadow-sm border p-6">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <div className="w-8 h-8 bg-purple-500 rounded-lg flex items-center justify-center">
                <span className="text-white text-sm font-bold">📊</span>
              </div>
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Performance Score</p>
              <p className="text-2xl font-bold text-gray-900">{employee.performanceScore || 0}%</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm border p-6">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <div className="w-8 h-8 bg-blue-500 rounded-lg flex items-center justify-center">
                <span className="text-white text-sm font-bold">📋</span>
              </div>
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Projects Completed</p>
              <p className="text-2xl font-bold text-gray-900">{metrics?.projectsCompleted || 0}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm border p-6">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <div className="w-8 h-8 bg-yellow-500 rounded-lg flex items-center justify-center">
                <span className="text-white text-sm font-bold">⭐</span>
              </div>
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Average Rating</p>
              <p className="text-2xl font-bold text-gray-900">
                {metrics?.averageRating ? `${metrics.averageRating.toFixed(1)}/5` : 'N/A'}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm border p-6">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <div className="w-8 h-8 bg-green-500 rounded-lg flex items-center justify-center">
                <span className="text-white text-sm font-bold">🎯</span>
              </div>
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">OKRs Completed</p>
              <p className="text-2xl font-bold text-gray-900">
                {metrics?.completedOKRs || 0}/{metrics?.okrsCount || 0}
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Recent Feedback */}
        <div className="bg-white rounded-lg shadow-sm border">
          <div className="px-6 py-4 border-b border-gray-200">
            <h3 className="text-lg font-medium text-gray-900">Recent Feedback</h3>
          </div>
          <div className="p-6">
            {!recentFeedback || recentFeedback.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                <div className="text-4xl mb-2">💬</div>
                <p>No feedback available</p>
                <p className="text-sm">Feedback will appear here when provided</p>
              </div>
            ) : (
              <div className="space-y-4">
                {recentFeedback.slice(0, 5).map((feedback) => (
                  <div key={feedback._id} className="border-l-4 border-blue-500 pl-4">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm font-medium text-gray-900">
                        {feedback.givenBy.name}
                      </span>
                      <div className="flex items-center space-x-2">
                        <span className="text-sm text-yellow-600">
                          {'⭐'.repeat(feedback.rating)}
                        </span>
                        <span className="text-xs text-gray-500">
                          {new Date(feedback.createdAt).toLocaleDateString()}
                        </span>
                      </div>
                    </div>
                    <p className="text-sm text-gray-600">{feedback.feedback}</p>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Current OKRs */}
        <div className="bg-white rounded-lg shadow-sm border">
          <div className="px-6 py-4 border-b border-gray-200">
            <h3 className="text-lg font-medium text-gray-900">Current OKRs</h3>
          </div>
          <div className="p-6">
            {!okrs || okrs.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                <div className="text-4xl mb-2">🎯</div>
                <p>No OKRs assigned</p>
                <p className="text-sm">OKRs will appear here when created</p>
              </div>
            ) : (
              <div className="space-y-4">
                {okrs.map((okr) => (
                  <div key={okr._id} className="border rounded-lg p-4">
                    <div className="flex items-center justify-between mb-2">
                      <h4 className="text-sm font-medium text-gray-900">
                        {okr.objective}
                      </h4>
                      <span className="text-xs text-gray-500">
                        {okr.period} {okr.year}
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
                      <span className={`px-2 py-1 text-xs font-semibold rounded-full ${
                        okr.status === 'completed' ? 'bg-green-100 text-green-800' :
                        okr.status === 'in-progress' ? 'bg-blue-100 text-blue-800' :
                        'bg-gray-100 text-gray-800'
                      }`}>
                        {okr.status}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
