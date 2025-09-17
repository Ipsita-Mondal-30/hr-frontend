'use client';

import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '@/lib/AuthContext';
import api from '@/lib/api';

interface OKRData {
  _id: string;
  objective: string;
  description?: string;
  period: string;
  year: number;
  overallProgress: number;
  status: string;
  keyResults: Array<{
    title: string;
    description?: string;
    targetValue: number;
    currentValue: number;
    unit: string;
    weight: number;
    status: string;
  }>;
  managerReview?: {
    reviewer: { name: string };
    rating: number;
    comments: string;
    reviewedAt: string;
  };
  aiInsights?: {
    achievabilityScore: number;
    riskFactors: string[];
    recommendations: string[];
    lastAnalyzed: string;
  };
}

interface PerformanceMetrics {
  performanceScore: number;
  projectContribution: number;
  projectsCompleted: number;
  projectsOnTime: number;
  milestonesCompleted: number;
  milestonesOnTime: number;
  averageFeedbackRating: number;
  totalFeedbackReceived: number;
}

export default function EmployeePerformancePage() {
  const { user } = useAuth();
  const [okrs, setOKRs] = useState<OKRData[]>([]);
  const [metrics, setMetrics] = useState<PerformanceMetrics | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
  const [updatingProgress, setUpdatingProgress] = useState<string | null>(null);

  const fetchPerformanceData = useCallback(async () => {
    if (!user) return;
    try {
      setLoading(true);

      // Get employee profile first
      const profileRes = await api.get('/employees/me');
      const employeeId = profileRes.data._id as string;

      // Get OKRs for selected year
      const okrsRes = await api.get(`/okrs/employee/${employeeId}?year=${selectedYear}`);
      setOKRs(okrsRes.data?.okrs || []);

      // Get performance metrics
      const metricsRes = await api.get(`/employees/${employeeId}/performance`);
      setMetrics(metricsRes.data?.metrics || null);
    } catch (error) {
      console.error('Error fetching performance data:', error);
    } finally {
      setLoading(false);
    }
  }, [user, selectedYear]);

  useEffect(() => {
    fetchPerformanceData();
  }, [fetchPerformanceData]);

  const updateKeyResultProgress = async (okrId: string, krIndex: number, newValue: number) => {
    try {
      setUpdatingProgress(`${okrId}-${krIndex}`);

      await api.put(`/okrs/${okrId}/key-results/${krIndex}`, {
        currentValue: newValue,
      });

      // Refresh OKRs
      await fetchPerformanceData();
    } catch (error) {
      console.error('Error updating key result:', error);
      alert('Failed to update progress');
    } finally {
      setUpdatingProgress(null);
    }
  };

  const generateAIInsights = async (okrId: string) => {
    try {
      await api.post(`/okrs/${okrId}/ai-insights`);
      await fetchPerformanceData();
    } catch (error) {
      console.error('Error generating AI insights:', error);
      alert('Failed to generate AI insights');
    }
  };

  const getProgressColor = (progress: number) => {
    if (progress >= 80) return 'text-green-600 bg-green-100';
    if (progress >= 60) return 'text-yellow-600 bg-yellow-100';
    if (progress >= 40) return 'text-orange-600 bg-orange-100';
    return 'text-red-600 bg-red-100';
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'active':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'at-risk':
        return 'bg-red-100 text-red-800 border-red-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  if (loading) {
    return (
      <div className="p-6">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-gray-200 rounded w-1/3"></div>
          <div className="grid grid-cols-4 gap-4">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="h-20 bg-gray-200 rounded"></div>
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
          <h1 className="text-2xl font-bold text-gray-900">Performance & OKRs</h1>
          <p className="text-gray-600">Track objectives, key results, and performance metrics</p>
        </div>
        <div className="flex items-center space-x-4">
          <select
            value={selectedYear}
            onChange={(e) => setSelectedYear(parseInt(e.target.value))}
            className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            {[2024, 2023, 2022].map((year) => (
              <option key={year} value={year}>
                {year}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Performance Overview */}
      {metrics && (
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-lg font-semibold mb-4">Performance Overview</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
              <div className="text-2xl font-bold text-blue-600">{metrics.performanceScore}%</div>
              <div className="text-sm text-blue-700">Overall Performance</div>
            </div>
            <div className="bg-green-50 p-4 rounded-lg border border-green-200">
              <div className="text-2xl font-bold text-green-600">{metrics.projectsCompleted}</div>
              <div className="text-sm text-green-700">Projects Completed</div>
            </div>
            <div className="bg-purple-50 p-4 rounded-lg border border-purple-200">
              <div className="text-2xl font-bold text-purple-600">{metrics.milestonesCompleted}</div>
              <div className="text-sm text-purple-700">Milestones Achieved</div>
            </div>
            <div className="bg-orange-50 p-4 rounded-lg border border-orange-200">
              <div className="text-2xl font-bold text-orange-600">
                {metrics.averageFeedbackRating.toFixed(1)}
              </div>
              <div className="text-sm text-orange-700">Avg Feedback Rating</div>
            </div>
          </div>

          {/* Success Rates */}
          <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <div className="flex justify-between text-sm text-gray-600 mb-2">
                <span>Project Success Rate</span>
                <span>
                  {metrics.projectsCompleted > 0
                    ? Math.round((metrics.projectsOnTime / metrics.projectsCompleted) * 100)
                    : 0}
                  %
                </span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div
                  className="bg-green-600 h-2 rounded-full"
                  style={{
                    width: `${
                      metrics.projectsCompleted > 0
                        ? (metrics.projectsOnTime / metrics.projectsCompleted) * 100
                        : 0
                    }%`,
                  }}
                ></div>
              </div>
            </div>
            <div>
              <div className="flex justify-between text-sm text-gray-600 mb-2">
                <span>Milestone Success Rate</span>
                <span>
                  {metrics.milestonesCompleted > 0
                    ? Math.round((metrics.milestonesOnTime / metrics.milestonesCompleted) * 100)
                    : 0}
                  %
                </span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div
                  className="bg-blue-600 h-2 rounded-full"
                  style={{
                    width: `${
                      metrics.milestonesCompleted > 0
                        ? (metrics.milestonesOnTime / metrics.milestonesCompleted) * 100
                        : 0
                    }%`,
                  }}
                ></div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* OKRs Section */}
      <div className="bg-white rounded-lg shadow">
        <div className="px-6 py-4 border-b border-gray-200">
          <div className="flex justify-between items-center">
            <h2 className="text-lg font-semibold">My OKRs - {selectedYear}</h2>
            <div className="text-sm text-gray-600">
              OKRs are set by HR/Admin • Contact a manager to discuss new goals
            </div>
          </div>
        </div>

        {okrs.length === 0 ? (
          <div className="p-8 text-center text-gray-500">
            <div className="text-4xl mb-2">🎯</div>
            <p className="mb-4">No OKRs set for {selectedYear}</p>
            <p className="text-sm">Contact a manager or HR to discuss setting up objectives and key results.</p>
          </div>
        ) : (
          <div className="divide-y divide-gray-200">
            {okrs.map((okr) => (
              <div key={okr._id} className="p-6">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1">
                    <div className="flex items-center space-x-3 mb-2">
                      <h3 className="text-lg font-medium text-gray-900">{okr.objective}</h3>
                      <span
                        className={`px-2 py-1 text-xs font-medium rounded-full border ${getStatusColor(
                          okr.status
                        )}`}
                      >
                        {okr.status}
                      </span>
                      <span className="text-sm text-gray-500">
                        {okr.period} {okr.year}
                      </span>
                    </div>
                    {okr.description && <p className="text-gray-600 mb-3">{okr.description}</p>}
                  </div>
                  <div className="ml-4 text-right">
                    <div className={`text-2xl font-bold ${getProgressColor(okr.overallProgress).split(' ')}`}>
                      {Math.round(okr.overallProgress)}%
                    </div>
                    <div className="text-sm text-gray-500">Overall Progress</div>
                  </div>
                </div>

                {/* Key Results */}
                <div className="space-y-3">
                  <h4 className="font-medium text-gray-900">Key Results:</h4>
                  {okr.keyResults.map((kr, index) => {
                    const progress = Math.min((kr.currentValue / kr.targetValue) * 100, 100);
                    return (
                      <div key={index} className="bg-gray-50 rounded-lg p-4">
                        <div className="flex items-start justify-between mb-2">
                          <div className="flex-1">
                            <h5 className="font-medium text-gray-900">{kr.title}</h5>
                            {kr.description && <p className="text-sm text-gray-600 mt-1">{kr.description}</p>}
                          </div>
                          <span className={`px-2 py-1 text-xs font-medium rounded-full ${getProgressColor(progress)}`}>
                            {kr.status}
                          </span>
                        </div>

                        <div className="flex items-center justify-between mb-2">
                          <div className="flex items-center space-x-4">
                            <div className="flex items-center space-x-2">
                              <input
                                type="number"
                                value={kr.currentValue}
                                onChange={(e) =>
                                  updateKeyResultProgress(okr._id, index, parseFloat(e.target.value) || 0)
                                }
                                disabled={updatingProgress === `${okr._id}-${index}`}
                                className="w-20 px-2 py-1 border border-gray-300 rounded text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                              />
                              <span className="text-sm text-gray-600">
                                / {kr.targetValue} {kr.unit}
                              </span>
                            </div>
                            <div className="text-sm text-gray-500">Weight: {kr.weight}x</div>
                          </div>
                          <div className="text-sm font-medium text-gray-900">{Math.round(progress)}%</div>
                        </div>

                        <div className="w-full bg-gray-200 rounded-full h-2">
                          <div
                            className={`h-2 rounded-full transition-all duration-300 ${
                              progress >= 100
                                ? 'bg-green-500'
                                : progress >= 75
                                ? 'bg-blue-500'
                                : progress >= 50
                                ? 'bg-yellow-500'
                                : 'bg-red-500'
                            }`}
                            style={{ width: `${Math.min(progress, 100)}%` }}
                          ></div>
                        </div>
                      </div>
                    );
                  })}
                </div>

                {/* Manager Review */}
                {okr.managerReview && (
                  <div className="mt-4 bg-blue-50 rounded-lg p-4 border border-blue-200">
                    <h5 className="font-medium text-blue-900 mb-2">Manager Review</h5>
                    <div className="flex items-center space-x-4 mb-2">
                      <div className="flex items-center">
                        <span className="text-yellow-500">★</span>
                        <span className="ml-1 font-medium">{okr.managerReview.rating}/5</span>
                      </div>
                      <span className="text-sm text-blue-700">by {okr.managerReview.reviewer.name}</span>
                      <span className="text-sm text-blue-600">
                        {new Date(okr.managerReview.reviewedAt).toLocaleDateString()}
                      </span>
                    </div>
                    <p className="text-sm text-blue-800">{okr.managerReview.comments}</p>
                  </div>
                )}

                {/* AI Insights */}
                {okr.aiInsights && (
                  <div className="mt-4 bg-purple-50 rounded-lg p-4 border border-purple-200">
                    <div className="flex items-center justify-between mb-2">
                      <h5 className="font-medium text-purple-900">🤖 AI Insights</h5>
                      <span className="text-sm text-purple-700">
                        Achievability: {okr.aiInsights.achievabilityScore}%
                      </span>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                      <div>
                        <h6 className="font-medium text-purple-800 mb-1">Risk Factors:</h6>
                        <ul className="text-purple-700 space-y-1">
                          {okr.aiInsights.riskFactors.map((factor, index) => (
                            <li key={index}>• {factor}</li>
                          ))}
                        </ul>
                      </div>
                      <div>
                        <h6 className="font-medium text-purple-800 mb-1">Recommendations:</h6>
                        <ul className="text-purple-700 space-y-1">
                          {okr.aiInsights.recommendations.map((rec, index) => (
                            <li key={index}>• {rec}</li>
                          ))}
                        </ul>
                      </div>
                    </div>
                  </div>
                )}

                {/* Actions */}
                <div className="mt-4 flex space-x-3">
                  <button
                    onClick={() => generateAIInsights(okr._id)}
                    className="px-3 py-1 text-sm bg-purple-100 text-purple-700 rounded hover:bg-purple-200"
                  >
                    Generate AI Insights
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
