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
  duration: number;
  status: 'scheduled' | 'completed' | 'cancelled' | 'no-show';
  type: 'phone' | 'video' | 'in-person';
  notes?: string;
  feedback?: string;
  rating?: number;
  outcome?: string;
  scorecard?: {
    technicalSkills: number;
    communication: number;
    problemSolving: number;
    culturalFit: number;
    overall: number;
    feedback: string;
    recommendation: 'hire' | 'no-hire' | 'maybe';
  };
  createdAt: string;
}

export default function AllInterviewsPage() {
  const [interviews, setInterviews] = useState<Interview[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedInterview, setSelectedInterview] = useState<Interview | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [typeFilter, setTypeFilter] = useState('all');

  useEffect(() => {
    fetchInterviews();
  }, []);

  const fetchInterviews = async () => {
    try {
      console.log('🔄 Fetching all interviews for admin...');
      const response = await api.get('/admin/interviews');
      const data = response.data || [];
      console.log(`📊 Received ${data.length} interviews`);
      if (data.length > 0) {
        console.log('📋 Sample interview data:', data[0]);
      }
      setInterviews(data);
    } catch (error) {
      console.error('Error fetching interviews:', error);
      // Set empty array on error
      setInterviews([]);
    } finally {
      setLoading(false);
    }
  };

  const filteredInterviews = interviews.filter(interview => {
    const matchesSearch = interview.candidateName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         interview.hrName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         interview.jobTitle.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         interview.hrCompany.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = statusFilter === 'all' || interview.status === statusFilter;
    const matchesType = typeFilter === 'all' || interview.type === typeFilter;
    
    return matchesSearch && matchesStatus && matchesType;
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'scheduled': return 'bg-blue-100 text-blue-800';
      case 'completed': return 'bg-green-100 text-green-800';
      case 'cancelled': return 'bg-red-100 text-red-800';
      case 'no-show': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
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
        <h1 className="text-2xl font-bold text-gray-900">Interview Management</h1>
        <div className="flex gap-2">
          <Link
            href="/admin/interviews/scheduled"
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            View Scheduled
          </Link>
          <Link
            href="/admin/interviews/completed"
            className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
          >
            View Completed
          </Link>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <div className="flex items-center">
            <div className="p-2 bg-blue-100 rounded-lg">
              <span className="text-2xl">📅</span>
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Total Interviews</p>
              <p className="text-2xl font-bold text-gray-900">{interviews.length}</p>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <div className="flex items-center">
            <div className="p-2 bg-yellow-100 rounded-lg">
              <span className="text-2xl">⏰</span>
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Scheduled</p>
              <p className="text-2xl font-bold text-gray-900">
                {interviews.filter(i => i.status === 'scheduled').length}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <div className="flex items-center">
            <div className="p-2 bg-green-100 rounded-lg">
              <span className="text-2xl">✅</span>
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Completed</p>
              <p className="text-2xl font-bold text-gray-900">
                {interviews.filter(i => i.status === 'completed').length}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <div className="flex items-center">
            <div className="p-2 bg-red-100 rounded-lg">
              <span className="text-2xl">❌</span>
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Cancelled/No-show</p>
              <p className="text-2xl font-bold text-gray-900">
                {interviews.filter(i => i.status === 'cancelled' || i.status === 'no-show').length}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="flex gap-4 items-center">
        <input
          type="text"
          placeholder="Search interviews..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        />
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
        >
          <option value="all">All Status</option>
          <option value="scheduled">Scheduled</option>
          <option value="completed">Completed</option>
          <option value="cancelled">Cancelled</option>
          <option value="no-show">No Show</option>
        </select>
        <select
          value={typeFilter}
          onChange={(e) => setTypeFilter(e.target.value)}
          className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
        >
          <option value="all">All Types</option>
          <option value="phone">Phone</option>
          <option value="video">Video</option>
          <option value="in-person">In Person</option>
        </select>
      </div>

      {/* Interviews Table */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Interview Details
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Candidate
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  HR / Company
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Schedule
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredInterviews.map((interview) => (
                <tr key={interview._id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-lg">{getTypeIcon(interview.type)}</span>
                        <div>
                          <div className="text-sm font-medium text-gray-900">{interview.jobTitle}</div>
                          <div className="text-sm text-gray-500 capitalize">{interview.type} interview</div>
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div>
                      <div className="text-sm font-medium text-gray-900">{interview.candidateName}</div>
                      <div className="text-sm text-gray-500">{interview.candidateEmail}</div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div>
                      <div className="text-sm font-medium text-gray-900">{interview.hrName}</div>
                      <div className="text-sm text-gray-500">{interview.hrCompany}</div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div>
                      <div className="text-sm font-medium text-gray-900">
                        {new Date(interview.scheduledAt).toLocaleDateString()}
                      </div>
                      <div className="text-sm text-gray-500">
                        {new Date(interview.scheduledAt).toLocaleTimeString()} ({interview.duration}min)
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="space-y-1">
                      <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusColor(interview.status)}`}>
                        {interview.status}
                      </span>
                      {interview.scorecard && (
                        <div className="flex items-center text-xs text-gray-600">
                          <span className="text-yellow-400">⭐</span>
                          <span className="ml-1">{interview.scorecard.overall}/5</span>
                        </div>
                      )}
                      {interview.scorecard?.recommendation && (
                        <div className="text-xs">
                          <span className={`px-1 py-0.5 rounded text-xs ${
                            interview.scorecard.recommendation === 'hire' ? 'bg-green-100 text-green-700' :
                            interview.scorecard.recommendation === 'no-hire' ? 'bg-red-100 text-red-700' :
                            'bg-yellow-100 text-yellow-700'
                          }`}>
                            {interview.scorecard.recommendation}
                          </span>
                        </div>
                      )}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <div className="flex space-x-2">
                      <button
                        onClick={() => setSelectedInterview(interview)}
                        className="text-blue-600 hover:text-blue-900"
                      >
                        View Details
                      </button>
                      {interview.scorecard && (
                        <span className="text-green-600 text-xs">📋 Scorecard</span>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Interview Detail Modal */}
      {selectedInterview && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-gray-200">
              <div className="flex justify-between items-center">
                <h2 className="text-xl font-bold text-gray-900">Interview Details</h2>
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
                      <label className="text-sm text-gray-600">Status</label>
                      <span className={`px-2 py-1 rounded text-sm ${getStatusColor(selectedInterview.status)}`}>
                        {selectedInterview.status}
                      </span>
                    </div>
                  </div>
                </div>

                <div>
                  <h3 className="text-lg font-semibold mb-3">Schedule</h3>
                  <div className="space-y-2">
                    <div>
                      <label className="text-sm text-gray-600">Date</label>
                      <p className="font-medium">{new Date(selectedInterview.scheduledAt).toLocaleDateString()}</p>
                    </div>
                    <div>
                      <label className="text-sm text-gray-600">Time</label>
                      <p className="font-medium">{new Date(selectedInterview.scheduledAt).toLocaleTimeString()}</p>
                    </div>
                    <div>
                      <label className="text-sm text-gray-600">Created</label>
                      <p className="font-medium">{new Date(selectedInterview.createdAt).toLocaleDateString()}</p>
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
                  <h3 className="text-lg font-semibold mb-3">Notes</h3>
                  <p className="text-gray-700 bg-gray-50 p-3 rounded-lg">{selectedInterview.notes}</p>
                </div>
              )}

              {/* Scorecard Section */}
              {selectedInterview.scorecard && (
                <div>
                  <h3 className="text-lg font-semibold mb-3">Interview Scorecard</h3>
                  <div className="bg-blue-50 p-4 rounded-lg space-y-4">
                    {/* Overall Score */}
                    <div className="flex items-center justify-between">
                      <span className="font-medium text-blue-900">Overall Score:</span>
                      <div className="flex items-center">
                        <div className="flex items-center">
                          {[1, 2, 3, 4, 5].map((star) => (
                            <span
                              key={star}
                              className={`text-lg ${star <= Math.round(selectedInterview.scorecard.overall) ? 'text-yellow-400' : 'text-gray-300'}`}
                            >
                              ⭐
                            </span>
                          ))}
                        </div>
                        <span className="ml-2 text-blue-800 font-bold text-lg">
                          {selectedInterview.scorecard.overall}/5
                        </span>
                      </div>
                    </div>

                    {/* Individual Scores */}
                    <div className="grid grid-cols-2 gap-4">
                      <div className="flex justify-between">
                        <span className="text-sm text-blue-800">Technical Skills:</span>
                        <span className="font-medium">{selectedInterview.scorecard.technicalSkills}/5</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm text-blue-800">Communication:</span>
                        <span className="font-medium">{selectedInterview.scorecard.communication}/5</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm text-blue-800">Problem Solving:</span>
                        <span className="font-medium">{selectedInterview.scorecard.problemSolving}/5</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm text-blue-800">Cultural Fit:</span>
                        <span className="font-medium">{selectedInterview.scorecard.culturalFit}/5</span>
                      </div>
                    </div>

                    {/* Recommendation */}
                    <div className="flex items-center justify-between">
                      <span className="font-medium text-blue-900">Recommendation:</span>
                      <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                        selectedInterview.scorecard.recommendation === 'hire' ? 'bg-green-100 text-green-800' :
                        selectedInterview.scorecard.recommendation === 'no-hire' ? 'bg-red-100 text-red-800' :
                        'bg-yellow-100 text-yellow-800'
                      }`}>
                        {selectedInterview.scorecard.recommendation === 'hire' ? '✅ Hire' :
                         selectedInterview.scorecard.recommendation === 'no-hire' ? '❌ No Hire' : '🤔 Maybe'}
                      </span>
                    </div>

                    {/* Detailed Feedback */}
                    {selectedInterview.scorecard.feedback && (
                      <div>
                        <h4 className="font-medium text-blue-900 mb-2">Detailed Feedback:</h4>
                        <div className="bg-white p-3 rounded border border-blue-200">
                          <p className="text-gray-700 text-sm whitespace-pre-wrap">
                            {selectedInterview.scorecard.feedback}
                          </p>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Legacy Rating and Outcome (for backward compatibility) */}
              {(selectedInterview.rating || selectedInterview.outcome) && !selectedInterview.scorecard && (
                <div>
                  <h3 className="text-lg font-semibold mb-3">Interview Results</h3>
                  <div className="bg-blue-50 p-4 rounded-lg space-y-2">
                    {selectedInterview.rating && (
                      <div className="flex items-center gap-2">
                        <span className="font-medium text-blue-900">Overall Rating:</span>
                        <div className="flex items-center">
                          {[1, 2, 3, 4, 5].map((star) => (
                            <span
                              key={star}
                              className={`text-lg ${star <= Math.round(selectedInterview.rating) ? 'text-yellow-400' : 'text-gray-300'}`}
                            >
                              ⭐
                            </span>
                          ))}
                          <span className="ml-2 text-blue-800 font-medium">
                            {selectedInterview.rating}/5
                          </span>
                        </div>
                      </div>
                    )}
                    {selectedInterview.outcome && (
                      <div className="flex items-center gap-2">
                        <span className="font-medium text-blue-900">Recommendation:</span>
                        <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                          selectedInterview.outcome === 'hire' ? 'bg-green-100 text-green-800' :
                          selectedInterview.outcome === 'no-hire' ? 'bg-red-100 text-red-800' :
                          'bg-yellow-100 text-yellow-800'
                        }`}>
                          {selectedInterview.outcome === 'hire' ? '✅ Hire' :
                           selectedInterview.outcome === 'no-hire' ? '❌ No Hire' :
                           '🤔 Maybe'}
                        </span>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {selectedInterview.feedback && (
                <div>
                  <h3 className="text-lg font-semibold mb-3">Detailed Feedback</h3>
                  <p className="text-gray-700 bg-gray-50 p-3 rounded-lg">{selectedInterview.feedback}</p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}  
          </div>
          </div>
        </div>
      )}
    </div>
  );
}