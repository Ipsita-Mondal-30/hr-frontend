'use client';
import { useState, useEffect } from 'react';
import Link from 'next/link';
import api from '@/lib/api';
import AdminInterviewDetailModal, {
  type AdminInterview,
} from '@/components/interviews/AdminInterviewDetailModal';

export default function CompletedInterviewsPage() {
  const [interviews, setInterviews] = useState<AdminInterview[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedInterview, setSelectedInterview] = useState<AdminInterview | null>(null);

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

  const sortedInterviews = [...interviews].sort((a, b) => {
    const aTime = a.completedAt ? new Date(a.completedAt).getTime() : 0;
    const bTime = b.completedAt ? new Date(b.completedAt).getTime() : 0;
    return bTime - aTime;
  });

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
                      {interview.completedAt
                        ? new Date(interview.completedAt).toLocaleDateString()
                        : 'Pending'}
                    </p>
                    <p className="text-xs text-gray-500">
                      {interview.completedAt
                        ? new Date(interview.completedAt).toLocaleTimeString()
                        : ''}
                    </p>
                  </div>

                  <div>
                    <h4 className="text-sm font-medium text-gray-700 mb-1">Rating</h4>
                    {renderStars(interview.rating ?? undefined)}
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

      {selectedInterview && (
        <AdminInterviewDetailModal
          interview={selectedInterview}
          title="Completed Interview Details"
          showTimeline
          onClose={() => setSelectedInterview(null)}
        />
      )}
    </div>
  );
}