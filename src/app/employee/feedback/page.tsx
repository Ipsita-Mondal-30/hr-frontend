'use client';

import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '@/lib/AuthContext';
import api from '@/lib/api';

interface FeedbackData {
  _id: string;
  reviewer: { name: string; email: string };
  type: string;
  title: string;
  content: string;
  overallRating: number;
  aiSummary?: string;
  aiSentiment: string;
  aiKeywords: string[];
  createdAt: string;
  status: string;
  ratings: {
    technical?: number;
    communication?: number;
    teamwork?: number;
    leadership?: number;
    problemSolving?: number;
    timeManagement?: number;
  };
  project?: {
    name: string;
  };
  milestone?: {
    title: string;
  };
  employeeResponse?: {
    content: string;
    respondedAt: string;
  };
}

interface FeedbackAnalytics {
  totalFeedback: number;
  averageRating: number;
  sentimentBreakdown: {
    positive: number;
    neutral: number;
    negative: number;
  };
  ratingsByCategory: {
    technical: number;
    communication: number;
    teamwork: number;
    leadership: number;
    problemSolving: number;
    timeManagement: number;
  };
}

export default function EmployeeFeedbackPage() {
  const { user } = useAuth();
  const [feedback, setFeedback] = useState<FeedbackData[]>([]);
  const [analytics, setAnalytics] = useState<FeedbackAnalytics | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedFeedback, setSelectedFeedback] = useState<FeedbackData | null>(null);
  const [filter, setFilter] = useState('all');
  const [responseText, setResponseText] = useState('');
  const [submittingResponse, setSubmittingResponse] = useState(false);

  const fetchFeedback = useCallback(async () => {
    if (!user) return;
    try {
      setLoading(true);

      // Get employee profile first
      const profileRes = await api.get('/employees/me');
      const employeeId = profileRes.data._id as string;

      // Get feedback with analytics
      const params = new URLSearchParams();
      if (filter !== 'all') params.append('type', filter);

      const feedbackRes = await api.get(`/feedback/employee/${employeeId}?${params.toString()}`);
      setFeedback(feedbackRes.data?.feedback || []);
      setAnalytics(feedbackRes.data?.analytics || null);
    } catch (error) {
      console.error('Error fetching feedback:', error);
    } finally {
      setLoading(false);
    }
  }, [user, filter]);

  useEffect(() => {
    fetchFeedback();
  }, [fetchFeedback]);

  const submitResponse = async (feedbackId: string) => {
    if (!responseText.trim()) return;

    try {
      setSubmittingResponse(true);

      await api.post(`/feedback/${feedbackId}/respond`, {
        content: responseText,
      });

      setResponseText('');
      setSelectedFeedback(null);
      await fetchFeedback();
    } catch (error) {
      console.error('Error submitting response:', error);
      alert('Failed to submit response');
    } finally {
      setSubmittingResponse(false);
    }
  };

  const getSentimentColor = (sentiment: string) => {
    switch (sentiment) {
      case 'positive':
        return 'text-green-600 bg-green-100';
      case 'negative':
        return 'text-red-600 bg-red-100';
      default:
        return 'text-gray-600 bg-gray-100';
    }
  };

  const getRatingColor = (rating: number) => {
    if (rating >= 4.5) return 'text-green-600';
    if (rating >= 3.5) return 'text-yellow-600';
    if (rating >= 2.5) return 'text-orange-600';
    return 'text-red-600';
  };

  const getCategoryIcon = (category: string) => {
    const icons: { [key: string]: string } = {
      technical: '💻',
      communication: '💬',
      teamwork: '🤝',
      leadership: '👑',
      problemSolving: '🧩',
      timeManagement: '⏰',
    };
    return icons[category] || '📊';
  };

  if (loading) {
    return (
      <div className="p-6">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-gray-200 rounded w-1/3"></div>
          <div className="grid grid-cols-3 gap-4">
            {[1, 2, 3].map((i) => (
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
          <h1 className="text-2xl font-bold text-gray-900">Feedback & Reviews</h1>
          <p className="text-gray-600">View feedback from managers, peers, and team members</p>
        </div>
        <div className="flex items-center space-x-4">
          <select
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="all">All Feedback</option>
            <option value="performance-review">Performance Reviews</option>
            <option value="project-feedback">Project Feedback</option>
            <option value="peer-feedback">Peer Feedback</option>
            <option value="milestone-feedback">Milestone Feedback</option>
          </select>
        </div>
      </div>

      {/* Analytics Overview */}
      {analytics && (
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-lg font-semibold mb-4">Feedback Analytics</h2>

          {/* Summary Stats */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
            <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
              <div className="text-2xl font-bold text-blue-600">{analytics.totalFeedback}</div>
              <div className="text-sm text-blue-700">Total Reviews</div>
            </div>
            <div className="bg-green-50 p-4 rounded-lg border border-green-200">
              <div className="text-2xl font-bold text-green-600">{analytics.averageRating.toFixed(1)}</div>
              <div className="text-sm text-green-700">Average Rating</div>
            </div>
            <div className="bg-purple-50 p-4 rounded-lg border border-purple-200">
              <div className="text-2xl font-bold text-purple-600">{analytics.sentimentBreakdown.positive}</div>
              <div className="text-sm text-purple-700">Positive Reviews</div>
            </div>
            <div className="bg-orange-50 p-4 rounded-lg border border-orange-200">
              <div className="text-2xl font-bold text-orange-600">
                {Math.round((analytics.sentimentBreakdown.positive / analytics.totalFeedback) * 100)}%
              </div>
              <div className="text-sm text-orange-700">Positive Rate</div>
            </div>
          </div>

          {/* Category Ratings */}
          <div>
            <h3 className="font-medium text-gray-900 mb-3">Performance by Category</h3>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              {Object.entries(analytics.ratingsByCategory).map(([category, rating]) => (
                <div key={category} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div className="flex items-center space-x-2">
                    <span className="text-lg">{getCategoryIcon(category)}</span>
                    <span className="text-sm font-medium capitalize">
                      {category.replace(/([A-Z])/g, ' $1')}
                    </span>
                  </div>
                  <div className={`text-lg font-bold ${getRatingColor(rating)}`}>
                    {rating > 0 ? rating.toFixed(1) : 'N/A'}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Sentiment Breakdown */}
          <div className="mt-6">
            <h3 className="font-medium text-gray-900 mb-3">Sentiment Distribution</h3>
            <div className="flex space-x-4">
              <div className="flex-1 bg-green-100 rounded-lg p-3 text-center">
                <div className="text-lg font-bold text-green-600">{analytics.sentimentBreakdown.positive}</div>
                <div className="text-sm text-green-700">Positive</div>
              </div>
              <div className="flex-1 bg-gray-100 rounded-lg p-3 text-center">
                <div className="text-lg font-bold text-gray-600">{analytics.sentimentBreakdown.neutral}</div>
                <div className="text-sm text-gray-700">Neutral</div>
              </div>
              <div className="flex-1 bg-red-100 rounded-lg p-3 text-center">
                <div className="text-lg font-bold text-red-600">{analytics.sentimentBreakdown.negative}</div>
                <div className="text-sm text-red-700">Negative</div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Feedback List */}
      <div className="bg-white rounded-lg shadow">
        <div className="px-6 py-4 border-b border-gray-200">
          <h2 className="text-lg font-semibold">Recent Feedback ({feedback.length})</h2>
        </div>

        {feedback.length === 0 ? (
          <div className="p-8 text-center text-gray-500">
            <div className="text-4xl mb-2">💬</div>
            <p>No feedback found for the selected filter</p>
          </div>
        ) : (
          <div className="divide-y divide-gray-200">
            {feedback.map((fb) => (
              <div key={fb._id} className="p-6 hover:bg-gray-50">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center space-x-3 mb-2">
                      <h3 className="font-medium text-gray-900">{fb.title}</h3>
                      <span
                        className={`px-2 py-1 text-xs font-medium rounded-full ${getSentimentColor(
                          fb.aiSentiment
                        )}`}
                      >
                        {fb.aiSentiment}
                      </span>
                      <span className="text-sm text-gray-500 capitalize">{fb.type.replace('-', ' ')}</span>
                    </div>

                    <div className="flex items-center space-x-4 mb-3 text-sm text-gray-600">
                      <span>by {fb.reviewer.name}</span>
                      <span>{new Date(fb.createdAt).toLocaleDateString()}</span>
                      {fb.project && <span>Project: {fb.project.name}</span>}
                      {fb.milestone && <span>Milestone: {fb.milestone.title}</span>}
                    </div>

                    {fb.aiSummary && <p className="text-gray-700 mb-3">{fb.aiSummary}</p>}

                    {/* Keywords */}
                    {fb.aiKeywords && fb.aiKeywords.length > 0 && (
                      <div className="flex flex-wrap gap-2 mb-3">
                        {fb.aiKeywords.map((keyword, index) => (
                          <span key={index} className="px-2 py-1 bg-blue-100 text-blue-700 text-xs rounded">
                            {keyword}
                          </span>
                        ))}
                      </div>
                    )}

                    {/* Response Status */}
                    {fb.employeeResponse ? (
                      <div className="bg-green-50 border border-green-200 rounded-lg p-3">
                        <div className="text-sm text-green-800 font-medium mb-1">Your Response:</div>
                        <p className="text-sm text-green-700">{fb.employeeResponse.content}</p>
                        <div className="text-xs text-green-600 mt-1">
                          Responded on {new Date(fb.employeeResponse.respondedAt).toLocaleDateString()}
                        </div>
                      </div>
                    ) : (
                      <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3">
                        <div className="text-sm text-yellow-800">Response pending</div>
                      </div>
                    )}
                  </div>

                  <div className="ml-4 text-right">
                    <div className="flex items-center space-x-1 mb-2">
                      <span className="text-yellow-500">★</span>
                      <span className="text-lg font-bold">{fb.overallRating}/5</span>
                    </div>
                    <button
                      onClick={() => setSelectedFeedback(fb)}
                      className="px-3 py-1 text-sm bg-blue-100 text-blue-700 rounded hover:bg-blue-200"
                    >
                      View Details
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Feedback Details Modal */}
      {selectedFeedback && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-gray-200">
              <div className="flex justify-between items-start">
                <div>
                  <h2 className="text-xl font-semibold">{selectedFeedback.title}</h2>
                  <div className="flex items-center space-x-4 mt-2 text-sm text-gray-600">
                    <span>by {selectedFeedback.reviewer.name}</span>
                    <span>{new Date(selectedFeedback.createdAt).toLocaleDateString()}</span>
                    <span
                      className={`px-2 py-1 text-xs font-medium rounded-full ${getSentimentColor(
                        selectedFeedback.aiSentiment
                      )}`}
                    >
                      {selectedFeedback.aiSentiment}
                    </span>
                  </div>
                </div>
                <button onClick={() => setSelectedFeedback(null)} className="text-gray-400 hover:text-gray-600">
                  ✕
                </button>
              </div>
            </div>

            <div className="p-6 space-y-6">
              {/* Overall Rating */}
              <div className="text-center">
                <div className="text-4xl font-bold text-blue-600 mb-2">{selectedFeedback.overallRating}/5</div>
                <div className="text-gray-600">Overall Rating</div>
              </div>

              {/* Category Ratings */}
              <div>
                <h3 className="font-medium text-gray-900 mb-3">Detailed Ratings</h3>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                  {Object.entries(selectedFeedback.ratings).map(([category, rating]) => (
                    rating && (
                      <div key={category} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                        <div className="flex items-center space-x-2">
                          <span className="text-lg">{getCategoryIcon(category)}</span>
                          <span className="text-sm font-medium capitalize">{category.replace(/([A-Z])/g, ' $1')}</span>
                        </div>
                        <div className={`text-lg font-bold ${getRatingColor(rating)}`}>{rating}/5</div>
                      </div>
                    )
                  ))}
                </div>
              </div>

              {/* Feedback Content */}
              <div>
                <h3 className="font-medium text-gray-900 mb-3">Feedback Details</h3>
                <div className="bg-gray-50 rounded-lg p-4">
                  <p className="text-gray-700 whitespace-pre-wrap">{selectedFeedback.content}</p>
                </div>
              </div>

              {/* AI Summary */}
              {selectedFeedback.aiSummary && (
                <div>
                  <h3 className="font-medium text-gray-900 mb-3">🤖 AI Summary</h3>
                  <div className="bg-purple-50 rounded-lg p-4 border border-purple-200">
                    <p className="text-purple-800">{selectedFeedback.aiSummary}</p>
                  </div>
                </div>
              )}

              {/* Response Section */}
              <div>
                <h3 className="font-medium text-gray-900 mb-3">Your Response</h3>
                {selectedFeedback.employeeResponse ? (
                  <div className="bg-green-50 rounded-lg p-4 border border-green-200">
                    <p className="text-green-800 mb-2">{selectedFeedback.employeeResponse.content}</p>
                    <div className="text-sm text-green-600">
                      Responded on {new Date(selectedFeedback.employeeResponse.respondedAt).toLocaleDateString()}
                    </div>
                  </div>
                ) : (
                  <div className="space-y-3">
                    <textarea
                      value={responseText}
                      onChange={(e) => setResponseText(e.target.value)}
                      placeholder="Write your response to this feedback..."
                      rows={4}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                    <button
                      onClick={() => submitResponse(selectedFeedback._id)}
                      disabled={!responseText.trim() || submittingResponse}
                      className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50"
                    >
                      {submittingResponse ? 'Submitting...' : 'Submit Response'}
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
