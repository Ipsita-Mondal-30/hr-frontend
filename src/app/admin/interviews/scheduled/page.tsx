'use client';
import { useState, useEffect } from 'react';
import Link from 'next/link';
import api from '@/lib/api';
import AdminInterviewDetailModal, {
  type AdminInterview,
} from '@/components/interviews/AdminInterviewDetailModal';

export default function ScheduledInterviewsPage() {
  const [interviews, setInterviews] = useState<AdminInterview[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedInterview, setSelectedInterview] = useState<AdminInterview | null>(null);

  useEffect(() => {
    fetchScheduledInterviews();
  }, []);

  const fetchScheduledInterviews = async () => {
    try {
      console.log('🔄 Fetching scheduled interviews for admin...');
      const response = await api.get('/admin/interviews?status=scheduled');
      const data = response.data || [];
      console.log(`📊 Received ${data.length} scheduled interviews`);
      setInterviews(data);
    } catch (error) {
      console.error('Error fetching scheduled interviews:', error);
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

  const isUpcoming = (scheduledAt: string) => {
    return new Date(scheduledAt) > new Date();
  };

  const sortedInterviews = interviews.sort((a, b) => 
    new Date(a.scheduledAt).getTime() - new Date(b.scheduledAt).getTime()
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
          <h1 className="text-2xl font-bold text-gray-900">Scheduled Interviews</h1>
          <p className="text-gray-600">Upcoming and scheduled interviews</p>
        </div>
        <Link
          href="/admin/interviews"
          className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700"
        >
          ← Back to All Interviews
        </Link>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <div className="flex items-center">
            <div className="p-2 bg-blue-100 rounded-lg">
              <span className="text-2xl">📅</span>
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Total Scheduled</p>
              <p className="text-2xl font-bold text-gray-900">{interviews.length}</p>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <div className="flex items-center">
            <div className="p-2 bg-green-100 rounded-lg">
              <span className="text-2xl">⏰</span>
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Upcoming</p>
              <p className="text-2xl font-bold text-gray-900">
                {interviews.filter(i => isUpcoming(i.scheduledAt)).length}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <div className="flex items-center">
            <div className="p-2 bg-yellow-100 rounded-lg">
              <span className="text-2xl">📹</span>
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Video Calls</p>
              <p className="text-2xl font-bold text-gray-900">
                {interviews.filter(i => i.type === 'video').length}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Interviews List */}
      <div className="space-y-4">
        {sortedInterviews.map((interview) => (
          <div 
            key={interview._id} 
            className={`bg-white rounded-lg shadow-sm border p-6 ${
              isUpcoming(interview.scheduledAt) ? 'border-blue-200 bg-blue-50' : 'border-gray-200'
            }`}
          >
            <div className="flex justify-between items-start">
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-2">
                  <span className="text-2xl">{getTypeIcon(interview.type)}</span>
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900">{interview.jobTitle}</h3>
                    <p className="text-sm text-gray-600 capitalize">{interview.type} interview • {interview.duration} minutes</p>
                  </div>
                  {isUpcoming(interview.scheduledAt) && (
                    <span className="px-2 py-1 bg-green-100 text-green-800 rounded-full text-xs font-medium">
                      Upcoming
                    </span>
                  )}
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4">
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
                    <h4 className="text-sm font-medium text-gray-700 mb-1">Schedule</h4>
                    <p className="text-sm text-gray-900">
                      {new Date(interview.scheduledAt).toLocaleDateString()}
                    </p>
                    <p className="text-xs text-gray-500">
                      {new Date(interview.scheduledAt).toLocaleTimeString()}
                    </p>
                  </div>
                </div>

                {interview.notes && (
                  <div className="mt-4">
                    <h4 className="text-sm font-medium text-gray-700 mb-1">Notes</h4>
                    <p className="text-sm text-gray-600 bg-gray-50 p-2 rounded">{interview.notes}</p>
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
            <div className="text-6xl mb-4">📅</div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">No Scheduled Interviews</h3>
            <p className="text-gray-600">There are currently no scheduled interviews.</p>
          </div>
        )}
      </div>

      {/* Interview Detail Modal */}
      {selectedInterview && (
        <AdminInterviewDetailModal
          interview={selectedInterview}
          onClose={() => setSelectedInterview(null)}
        />
      )}
    </div>
  );
}