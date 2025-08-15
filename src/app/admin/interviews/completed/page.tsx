'use client';
import { useState, useEffect } from 'react';
import Link from 'next/link';
import api from '@/lib/api';

interface Interview {
  _id: string;
  candidateId: string;
  candidateName: string;
  candidateEmail: string;
  hrId: string;
  hrName: string;
  hrCompany: string;
  jobId: string;
  jobTitle: string;
  scheduledAt: string;
  completedAt: string;
  duration: number;
  type: 'phone' | 'video' | 'in-person';
  notes?: string;
  feedback?: string;
  rating?: number;
  outcome?: 'hired' | 'rejected' | 'pending';
  createdAt: string;
}

export default function CompletedInterviewsPage() {
  const [interviews, setInterviews] = useState<Interview[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedInterview, setSelectedInterview] = useState<Interview | null>(null);

  useEffect(() => {
    fetchCompletedInterviews();
  }, []);

  const fetchCompletedInterviews = async () => {
    try {
      console.log('🔄 Fetching completed interviews for admin...');
      const response = await api.get('/admin/interviews?status=completed');
      const data = response.data || [];
      console.log(`📊 Received ${data.length} completed interviews`);
      setInterviews(data);
    } catch (error) {
      console.error('Error fetching completed interviews:', error);
      setInterviews([]);
    } finally {
      setLoading(false);
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'phone': return '📞';
      case 'video': return '📹';
      case 'in-person': return '🏢';
      default: return '📅';
    }
  };

  const getOutcomeColor = (outcome?: string) => {
    switch (outcome) {
      case 'hired': return 'bg-green-100 text-green-800';
      case 'rejected': return 'bg-red-100 text-red-800';
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const renderStars = (rating?: number) => {
    if (!rating) return <span className="text-gray-400">No rating</span>;
    
    return (
      <div className="flex items-center">
        {[1, 2, 3, 4, 5].map((star) => (
          <span
            key={star}
            className={`text-lg ${star <= rating ? 'text-yellow-400' : 'text-gray-300'}`}
          >
            ⭐
          </span>
        ))}
        <span className="ml-2 text-sm text-gray-600">({rating}/5)</span>
      </div>
    );
  };

  const sortedInterviews = interviews.sort((a, b) => 
    new Date(b.completedAt).getTime() - new Date(a.completedAt).getTime()
  );

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Completed Interviews</h1>
          <p className="text-gray-600">Interviews that have been completed with feedback</p>
        </div>
        <Link
          href="/admin/interviews"
          className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700"
        >
          ← Back to All Interviews
        </Link>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <div className="flex items-center">
            <div className="p-2 bg-green-100 rounded-lg">
              <span className="text-2xl">✅</span>
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Total Completed</p>
              <p className="text-2xl font-bold text-gray-900">{interviews.length}</p>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <div className="flex items-center">
            <div className="p-2 bg-blue-100 rounded-lg">
              <span className="text-2xl">👥</span>
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Hired</p>
              <p className="text-2xl font-bold text-gray-900">
                {interviews.filter(i => i.outcome === 'hired').length}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <div className="flex items-center">
            <div className="p-2 bg-yellow-100 rounded-lg">
              <span className="text-2xl">⏳</span>
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Pending Decision</p>
              <p className="text-2xl font-bold text-gray-900">
                {interviews.filter(i => i.outcome === 'pending' || !i.outcome).length}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <div className="flex items-center">
            <div className="p-2 bg-purple-100 rounded-lg">
              <span className="text-2xl">⭐</span>
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Avg Rating</p>
              <p className="text-2xl font-bold text-gray-900">
                {interviews.filter(i => i.rating).length > 0 
                  ? (interviews.reduce((sum, i) => sum + (i.rating || 0), 0) / interviews.filter(i => i.rating).length).toFixed(1)
                  : 'N/A'
                }
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Interviews List */}
      <div className="space-y-4">
        {sortedInterviews.map((interview) => (
          <div key={interview._id} className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="flex justify-between items-start">
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-2">
                  <span className="text-2xl">{getTypeIcon(interview.type)}</span>
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900">{interview.jobTitle}</h3>
                    <p className="text-sm text-gray-600 capitalize">{interview.type} interview • {interview.duration} minutes</p>
                  </div>
                  {interview.outcome && (
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${getOutcomeColor(interview.outcome)}`}>
                      {interview.outcome}
                    </span>
                  )}
                </div>

                <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mt-4">
                  <div>
                    <h4 className="text-sm font-medium text-gray-700 mb-1">Candidate</h4>
                    <p className="text-sm text-gray-900">{interview.candidateName}</p>
                    <p className="text-xs text-gray-500">{interview.candidateEmail}</p>
                  </div>
                  
                  <div>
                    <h4 className="text-sm font-medium text-gray-700 mb-1">HR Representative</h4>
                    <p className="text-sm text-gray-900">{interview.hrName}</p>
                    <p className="text-xs text-gray-500">{interview.hrCompany}</p>
                  </div>
                  
                  <div>
                    <h4 className="text-sm font-medium text-gray-700 mb-1">Completed</h4>
                    <p className="text-sm text-gray-900">
                      {new Date(interview.completedAt).toLocaleDateString()}
                    </p>
                    <p className="text-xs text-gray-500">
                      {new Date(interview.completedAt).toLocaleTimeString()}
                    </p>
                  </div>

                  <div>
                    <h4 className="text-sm font-medium text-gray-700 mb-1">Rating</h4>
                    {renderStars(interview.rating)}
                  </div>
                </div>

                {interview.feedback && (
                  <div className="mt-4">
                    <h4 className="text-sm font-medium text-gray-700 mb-1">Feedback</h4>
                    <p className="text-sm text-gray-600 bg-gray-50 p-2 rounded line-clamp-2">
                      {interview.feedback}
                    </p>
                  </div>
                )}
              </div>

              <div className="ml-4">
                <button
                  onClick={() => setSelectedInterview(interview)}
                  className="px-3 py-1 bg-blue-100 text-blue-700 rounded-md text-sm hover:bg-blue-200"
                >
                  View Details
                </button>
              </div>
            </div>
          </div>
        ))}

        {interviews.length === 0 && (
          <div className="text-center py-12">
            <div className="text-6xl mb-4">✅</div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">No Completed Interviews</h3>
            <p className="text-gray-600">There are currently no completed interviews.</p>
          </div>
        )}
      </div>

      {/* Interview Detail Modal */}
      {selectedInterview && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-3xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-gray-200">
              <div className="flex justify-between items-center">
                <h2 className="text-xl font-bold text-gray-900">Completed Interview Details</h2>
                <button
                  onClick={() => setSelectedInterview(null)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  ✕
                </button>
              </div>
            </div>

            <div className="p-6 space-y-6">
              <div className="grid grid-cols-2 gap-6">
                <div>
                  <h3 className="text-lg font-semibold mb-3">Interview Information</h3>
                  <div className="space-y-2">
                    <div>
                      <label className="text-sm text-gray-600">Job Title</label>
                      <p className="font-medium">{selectedInterview.jobTitle}</p>
                    </div>
                    <div>
                      <label className="text-sm text-gray-600">Type</label>
                      <p className="font-medium capitalize">{selectedInterview.type}</p>
                    </div>
                    <div>
                      <label className="text-sm text-gray-600">Duration</label>
                      <p className="font-medium">{selectedInterview.duration} minutes</p>
                    </div>
                    <div>
                      <label className="text-sm text-gray-600">Outcome</label>
                      {selectedInterview.outcome ? (
                        <span className={`px-2 py-1 rounded text-sm ${getOutcomeColor(selectedInterview.outcome)}`}>
                          {selectedInterview.outcome}
                        </span>
                      ) : (
                        <span className="text-gray-500">Pending decision</span>
                      )}
                    </div>
                  </div>
                </div>

                <div>
                  <h3 className="text-lg font-semibold mb-3">Timeline</h3>
                  <div className="space-y-2">
                    <div>
                      <label className="text-sm text-gray-600">Scheduled</label>
                      <p className="font-medium">{new Date(selectedInterview.scheduledAt).toLocaleString()}</p>
                    </div>
                    <div>
                      <label className="text-sm text-gray-600">Completed</label>
                      <p className="font-medium">{new Date(selectedInterview.completedAt).toLocaleString()}</p>
                    </div>
                    <div>
                      <label className="text-sm text-gray-600">Rating</label>
                      <div className="mt-1">{renderStars(selectedInterview.rating)}</div>
                    </div>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-6">
                <div>
                  <h3 className="text-lg font-semibold mb-3">Candidate</h3>
                  <div className="space-y-2">
                    <div>
                      <label className="text-sm text-gray-600">Name</label>
                      <p className="font-medium">{selectedInterview.candidateName}</p>
                    </div>
                    <div>
                      <label className="text-sm text-gray-600">Email</label>
                      <p className="font-medium">{selectedInterview.candidateEmail}</p>
                    </div>
                  </div>
                </div>

                <div>
                  <h3 className="text-lg font-semibold mb-3">HR Representative</h3>
                  <div className="space-y-2">
                    <div>
                      <label className="text-sm text-gray-600">Name</label>
                      <p className="font-medium">{selectedInterview.hrName}</p>
                    </div>
                    <div>
                      <label className="text-sm text-gray-600">Company</label>
                      <p className="font-medium">{selectedInterview.hrCompany}</p>
                    </div>
                  </div>
                </div>
              </div>

              {selectedInterview.notes && (
                <div>
                  <h3 className="text-lg font-semibold mb-3">Interview Notes</h3>
                  <p className="text-gray-700 bg-gray-50 p-3 rounded-lg">{selectedInterview.notes}</p>
                </div>
              )}

              {selectedInterview.feedback && (
                <div>
                  <h3 className="text-lg font-semibold mb-3">Interview Feedback</h3>
                  <p className="text-gray-700 bg-blue-50 p-3 rounded-lg">{selectedInterview.feedback}</p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}