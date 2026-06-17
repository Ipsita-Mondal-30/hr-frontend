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
    summary?: string;
    riskFactors: string[];
    recommendations: string[];
    aiSource?: string;
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

interface PerformanceReview {
  _id: string;
  title: string;
  content: string;
  reviewPeriod?: string;
  overallRating?: number;
  status: string;
  createdAt: string;
  ratings?: Record<string, number>;
  aiSummary?: string;
  reviewer?: { name: string; email?: string };
  employeeResponse?: { content: string; respondedAt: string };
}

export default function EmployeePerformancePage() {
  const { user } = useAuth();
  const [okrs, setOKRs] = useState<OKRData[]>([]);
  const [metrics, setMetrics] = useState<PerformanceMetrics | null>(null);
  const [reviews, setReviews] = useState<PerformanceReview[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
  const [updatingProgress, setUpdatingProgress] = useState<string | null>(null);
  const [generatingInsightsId, setGeneratingInsightsId] = useState<string | null>(null);
  const [krDrafts, setKrDrafts] = useState<Record<string, string>>({});
  const [acknowledgingId, setAcknowledgingId] = useState<string | null>(null);
  const [responseText, setResponseText] = useState<Record<string, string>>({});

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

      // Get performance reviews
      const reviewsRes = await api.get('/employees/me/feedback?type=performance-review');
      setReviews(reviewsRes.data?.feedback || []);
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
    const key = `${okrId}-${krIndex}`;
    try {
      setUpdatingProgress(key);

      const response = await api.put(`/okrs/${okrId}/key-results/${krIndex}`, {
        currentValue: newValue,
      });

      setOKRs((prev) =>
        prev.map((o) => (o._id === okrId ? { ...o, ...response.data } : o))
      );
      setKrDrafts((prev) => {
        const next = { ...prev };
        delete next[key];
        return next;
      });
    } catch (error: unknown) {
      console.error('Error updating key result:', error);
      const axiosError = error as { response?: { data?: { error?: string } } };
      alert(axiosError.response?.data?.error || 'Failed to update progress');
    } finally {
      setUpdatingProgress(null);
    }
  };

  const getKrDraftValue = (okrId: string, index: number, current: number) => {
    const key = `${okrId}-${index}`;
    return krDrafts[key] !== undefined ? krDrafts[key] : String(current);
  };

  const generateAIInsights = async (okrId: string) => {
    try {
      setGeneratingInsightsId(okrId);
      const response = await api.post(`/okrs/${okrId}/ai-insights`);
      setOKRs((prev) =>
        prev.map((o) => (o._id === okrId ? { ...o, ...response.data } : o))
      );
    } catch (error: unknown) {
      console.error('Error generating AI insights:', error);
      const axiosError = error as { response?: { data?: { error?: string } } };
      alert(axiosError.response?.data?.error || 'Failed to generate AI insights');
    } finally {
      setGeneratingInsightsId(null);
    }
  };

  const acknowledgeReview = async (reviewId: string) => {
    try {
      setAcknowledgingId(reviewId);
      const content = responseText[reviewId]?.trim() || 'Thank you for the feedback. I have reviewed this performance evaluation.';
      await api.post(`/feedback/${reviewId}/respond`, { content });
      await fetchPerformanceData();
    } catch (error) {
      console.error('Error acknowledging review:', error);
      alert('Failed to acknowledge review');
    } finally {
      setAcknowledgingId(null);
    }
  };

  const formatRatingLabel = (key: string) =>
    key.replace(/([A-Z])/g, ' $1').replace(/^./, (s) => s.toUpperCase());

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
            {[2026, 2025, 2024, 2023, 2022].map((year) => (
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

      {/* Performance Reviews */}
      <div className="bg-white rounded-lg shadow">
        <div className="px-6 py-4 border-b border-gray-200">
          <h2 className="text-lg font-semibold">Performance Reviews</h2>
          <p className="text-sm text-gray-600">Reviews submitted by your manager or HR</p>
        </div>

        {reviews.length === 0 ? (
          <div className="p-8 text-center text-gray-500">
            <div className="text-4xl mb-2">📋</div>
            <p>No performance reviews yet</p>
            <p className="text-sm mt-2">Reviews will appear here once your manager submits them.</p>
          </div>
        ) : (
          <div className="divide-y divide-gray-200">
            {reviews.map((review) => (
              <div key={review._id} className="p-6">
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <h3 className="text-lg font-medium text-gray-900">{review.title}</h3>
                    <div className="flex items-center space-x-3 mt-1 text-sm text-gray-600">
                      {review.reviewPeriod && <span>{review.reviewPeriod}</span>}
                      {review.reviewer?.name && <span>by {review.reviewer.name}</span>}
                      <span>{new Date(review.createdAt).toLocaleDateString()}</span>
                      <span
                        className={`px-2 py-0.5 text-xs font-medium rounded-full ${
                          review.status === 'acknowledged'
                            ? 'bg-green-100 text-green-800'
                            : 'bg-blue-100 text-blue-800'
                        }`}
                      >
                        {review.status}
                      </span>
                    </div>
                  </div>
                  {review.overallRating && (
                    <div className="text-right">
                      <div className="text-2xl font-bold text-green-600">{review.overallRating.toFixed(1)}/5</div>
                      <div className="text-sm text-gray-500">Overall Rating</div>
                    </div>
                  )}
                </div>

                {review.ratings && Object.keys(review.ratings).length > 0 && (
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-4">
                    {Object.entries(review.ratings)
                      .filter(([, value]) => value > 0)
                      .map(([key, value]) => (
                        <div key={key} className="bg-gray-50 rounded-lg p-3">
                          <div className="text-xs text-gray-600">{formatRatingLabel(key)}</div>
                          <div className="font-semibold text-gray-900">{value}/5</div>
                        </div>
                      ))}
                  </div>
                )}

                <div className="bg-gray-50 rounded-lg p-4 mb-4">
                  <pre className="whitespace-pre-wrap text-sm text-gray-800 font-sans">{review.content}</pre>
                </div>

                {review.aiSummary && (
                  <div className="bg-purple-50 rounded-lg p-4 border border-purple-200 mb-4">
                    <h5 className="font-medium text-purple-900 mb-1">AI Summary</h5>
                    <p className="text-sm text-purple-800">{review.aiSummary}</p>
                  </div>
                )}

                {review.employeeResponse ? (
                  <div className="bg-green-50 rounded-lg p-4 border border-green-200">
                    <h5 className="font-medium text-green-900 mb-1">Your Response</h5>
                    <p className="text-sm text-green-800">{review.employeeResponse.content}</p>
                    <p className="text-xs text-green-600 mt-1">
                      {new Date(review.employeeResponse.respondedAt).toLocaleDateString()}
                    </p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    <textarea
                      value={responseText[review._id] || ''}
                      onChange={(e) =>
                        setResponseText((prev) => ({ ...prev, [review._id]: e.target.value }))
                      }
                      placeholder="Optional: Add your response or acknowledgment..."
                      rows={2}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                    <button
                      onClick={() => acknowledgeReview(review._id)}
                      disabled={acknowledgingId === review._id}
                      className="px-4 py-2 bg-blue-600 text-white text-sm rounded-md hover:bg-blue-700 disabled:opacity-50"
                    >
                      {acknowledgingId === review._id ? 'Submitting...' : 'Acknowledge Review'}
                    </button>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

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
                                min={0}
                                value={getKrDraftValue(okr._id, index, kr.currentValue)}
                                onChange={(e) =>
                                  setKrDrafts((prev) => ({
                                    ...prev,
                                    [`${okr._id}-${index}`]: e.target.value,
                                  }))
                                }
                                onBlur={(e) => {
                                  const val = parseFloat(e.target.value);
                                  if (!Number.isNaN(val) && val !== kr.currentValue) {
                                    updateKeyResultProgress(okr._id, index, val);
                                  }
                                }}
                                onKeyDown={(e) => {
                                  if (e.key === 'Enter') {
                                    (e.target as HTMLInputElement).blur();
                                  }
                                }}
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
                      <div className="text-right">
                        <span className="text-sm text-purple-700 block">
                          Achievability: {okr.aiInsights.achievabilityScore ?? 0}%
                        </span>
                        {okr.aiInsights.aiSource && (
                          <span className="text-xs text-purple-500 capitalize">
                            via {okr.aiInsights.aiSource}
                          </span>
                        )}
                      </div>
                    </div>

                    {okr.aiInsights.summary && (
                      <p className="text-sm text-purple-800 mb-3">{okr.aiInsights.summary}</p>
                    )}

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                      <div>
                        <h6 className="font-medium text-purple-800 mb-1">Risk Factors</h6>
                        <ul className="text-purple-700 space-y-1">
                          {(okr.aiInsights.riskFactors || []).length > 0 ? (
                            okr.aiInsights.riskFactors.map((factor, idx) => (
                              <li key={idx}>• {factor}</li>
                            ))
                          ) : (
                            <li className="text-purple-500">No significant risks identified</li>
                          )}
                        </ul>
                      </div>
                      <div>
                        <h6 className="font-medium text-purple-800 mb-1">Recommendations</h6>
                        <ul className="text-purple-700 space-y-1">
                          {(okr.aiInsights.recommendations || []).length > 0 ? (
                            okr.aiInsights.recommendations.map((rec, idx) => (
                              <li key={idx}>• {rec}</li>
                            ))
                          ) : (
                            <li className="text-purple-500">Keep tracking progress weekly</li>
                          )}
                        </ul>
                      </div>
                    </div>

                    {okr.aiInsights.lastAnalyzed && (
                      <p className="text-xs text-purple-500 mt-3">
                        Last analyzed: {new Date(okr.aiInsights.lastAnalyzed).toLocaleString()}
                      </p>
                    )}
                  </div>
                )}

                {/* Actions */}
                <div className="mt-4 flex space-x-3">
                  <button
                    onClick={() => generateAIInsights(okr._id)}
                    disabled={generatingInsightsId === okr._id}
                    className="px-3 py-1 text-sm bg-purple-100 text-purple-700 rounded hover:bg-purple-200 disabled:opacity-50"
                  >
                    {generatingInsightsId === okr._id ? 'Generating...' : 'Generate AI Insights'}
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
