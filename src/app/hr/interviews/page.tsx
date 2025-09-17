'use client';

import { useEffect, useState } from 'react';
import api from '@/lib/api';

interface ApplicationLite {
  _id: string;
  name?: string;
  email?: string;
  phone?: string;
  job?: { title?: string; companyName?: string };
}

interface Interview {
  _id: string;
  application?: ApplicationLite;
  interviewer?: {
    _id: string;
    name?: string;
    email?: string;
  };
  scheduledAt: string;
  duration: number;
  type: 'phone' | 'video' | 'in-person';
  status: 'scheduled' | 'completed' | 'cancelled' | 'no-show';
  meetingLink?: string;
  location?: string;
  notes?: string;
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

type InterviewsApiRes = Interview[] | { interviews: Interview[] };
type ApplicationsApiRes = ApplicationLite[] | { applications: ApplicationLite[] };

interface ScheduleInterviewInput {
  applicationId: string;
  scheduledAt: string;
  duration: number;
  type: 'phone' | 'video' | 'in-person';
  meetingLink?: string;
  location?: string;
  notes?: string;
}

interface ScorecardInput {
  technicalSkills: number;
  communication: number;
  problemSolving: number;
  culturalFit: number;
  overall: number;
  feedback: string;
  recommendation: 'hire' | 'no-hire' | 'maybe';
}

function isAxiosError(e: unknown): e is { response?: { data?: unknown; status?: number } } {
  return typeof e === 'object' && e !== null && 'response' in e;
}

export default function InterviewsPage() {
  const [interviews, setInterviews] = useState<Interview[]>([]);
  const [applications, setApplications] = useState<ApplicationLite[]>([]);
  const [loading, setLoading] = useState(true);
  const [showScheduleModal, setShowScheduleModal] = useState(false);
  const [selectedInterview, setSelectedInterview] = useState<Interview | null>(null);
  const [showScorecardModal, setShowScorecardModal] = useState(false);

  // Filters
  const [filters, setFilters] = useState({
    status: '',
    type: '',
    date: '',
    interviewer: '',
  });

  useEffect(() => {
    fetchInterviews();
    fetchApplications();
  }, []);

  const fetchInterviews = async () => {
    try {
      console.log('🔄 HR fetching interviews...');
      const res = await api.get<InterviewsApiRes>('/interviews');
      const list = Array.isArray(res.data) ? res.data : res.data?.interviews || [];
      console.log(`📊 HR received ${list.length} interviews`);
      setInterviews(list);
    } catch (err) {
      console.error('Failed to fetch interviews:', err);
      setInterviews([]);
    } finally {
      setLoading(false);
    }
  };

  const fetchApplications = async () => {
    try {
      console.log('🔄 HR fetching applications for interview scheduling...');
      const res = await api.get<ApplicationsApiRes>('/applications?status=shortlisted');
      const list = Array.isArray(res.data) ? res.data : res.data?.applications || [];
      console.log(`📊 HR received ${list.length} shortlisted applications`);
      setApplications(list);
    } catch (err) {
      console.error('Failed to fetch applications:', err);
      setApplications([]);
    }
  };

  const scheduleInterview = async (interviewData: ScheduleInterviewInput) => {
    try {
      console.log('📅 Scheduling interview:', interviewData);
      const response = await api.post('/interviews', interviewData);
      console.log('✅ Interview scheduled successfully:', response.data);

      // Refresh both interviews and applications
      await Promise.all([fetchInterviews(), fetchApplications()]);
      setShowScheduleModal(false);
      alert('Interview scheduled successfully!');
    } catch (err: unknown) {
      console.error('Failed to schedule interview:', err);
      const msg = isAxiosError(err)
        ? (err.response?.data as { error?: string; message?: string } | undefined)?.error ||
          (err.response?.data as { error?: string; message?: string } | undefined)?.message ||
          'Failed to schedule interview'
        : 'Failed to schedule interview';
      alert('Failed to schedule interview: ' + msg);
    }
  };

  const updateInterviewStatus = async (
    interviewId: string,
    status: 'scheduled' | 'completed' | 'cancelled' | 'no-show'
  ) => {
    try {
      await api.put(`/interviews/${interviewId}/status`, { status });
      setInterviews((prev) => prev.map((interview) => (interview._id === interviewId ? { ...interview, status } : interview)));
      alert(`Interview status updated to ${status}`);
    } catch (err) {
      console.error('Failed to update interview status:', err);
      alert('Failed to update interview status');
    }
  };

  const submitScorecard = async (interviewId: string, scorecard: ScorecardInput) => {
    try {
      console.log('📋 Submitting scorecard for interview:', interviewId);
      console.log('📋 Scorecard data:', scorecard);

      const response = await api.put(`/interviews/${interviewId}/scorecard`, { scorecard });
      console.log('✅ Scorecard submitted successfully:', response.data);

      await fetchInterviews(); // Refresh the interviews list
      setShowScorecardModal(false);
      alert('Scorecard submitted successfully! AI-powered emails have been sent to the candidate and HR team.');
    } catch (err: unknown) {
      console.error('❌ Failed to submit scorecard:', err);
      const msg = isAxiosError(err)
        ? (err.response?.data as { error?: string; message?: string } | undefined)?.error ||
          (err.response?.data as { error?: string; message?: string } | undefined)?.message ||
          'Unknown error'
        : 'Unknown error';
      alert(`Failed to submit scorecard: ${msg}`);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'scheduled':
        return 'bg-blue-100 text-blue-800';
      case 'completed':
        return 'bg-green-100 text-green-800';
      case 'cancelled':
        return 'bg-red-100 text-red-800';
      case 'no-show':
        return 'bg-gray-100 text-gray-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'phone':
        return '📞';
      case 'video':
        return '📹';
      case 'in-person':
        return '🏢';
      default:
        return '💬';
    }
  };

  const filteredInterviews = interviews.filter((interview) => {
    if (filters.status && interview.status !== filters.status) return false;
    if (filters.type && interview.type !== filters.type) return false;
    if (filters.date) {
      const interviewDate = new Date(interview.scheduledAt).toDateString();
      const filterDate = new Date(filters.date).toDateString();
      if (interviewDate !== filterDate) return false;
    }
    return true;
  });

  const upcomingInterviews = filteredInterviews.filter(
    (interview) => new Date(interview.scheduledAt) > new Date() && interview.status === 'scheduled'
  );

  const todayInterviews = filteredInterviews.filter((interview) => {
    const today = new Date().toDateString();
    const interviewDate = new Date(interview.scheduledAt).toDateString();
    return today === interviewDate && interview.status === 'scheduled';
  });

  if (loading) {
    return (
      <div className="p-6">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-1/4 mb-6"></div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-24 bg-gray-200 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6">
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Interview Manager</h1>
          <p className="text-gray-600">Schedule and manage candidate interviews</p>
        </div>
        <button onClick={() => setShowScheduleModal(true)} className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700">
          📅 Schedule Interview
        </button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <div className="bg-white p-4 rounded-lg shadow-sm border">
          <div className="text-2xl font-bold text-blue-600">{interviews.length}</div>
          <div className="text-sm text-gray-600">Total Interviews</div>
        </div>
        <div className="bg-white p-4 rounded-lg shadow-sm border">
          <div className="text-2xl font-bold text-orange-600">{todayInterviews.length}</div>
          <div className="text-sm text-gray-600">Today&apos;s Interviews</div>
        </div>
        <div className="bg-white p-4 rounded-lg shadow-sm border">
          <div className="text-2xl font-bold text-green-600">{upcomingInterviews.length}</div>
          <div className="text-sm text-gray-600">Upcoming</div>
        </div>
        <div className="bg-white p-4 rounded-lg shadow-sm border">
          <div className="text-2xl font-bold text-purple-600">
            {interviews.filter((i) => i.status === 'completed').length}
          </div>
          <div className="text-sm text-gray-600">Completed</div>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white p-4 rounded-lg shadow-sm border mb-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <select
            value={filters.status}
            onChange={(e) => setFilters((prev) => ({ ...prev, status: e.target.value }))}
            className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="">All Statuses</option>
            <option value="scheduled">Scheduled</option>
            <option value="completed">Completed</option>
            <option value="cancelled">Cancelled</option>
            <option value="no-show">No Show</option>
          </select>

          <select
            value={filters.type}
            onChange={(e) => setFilters((prev) => ({ ...prev, type: e.target.value }))}
            className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="">All Types</option>
            <option value="phone">Phone</option>
            <option value="video">Video</option>
            <option value="in-person">In Person</option>
          </select>

          <input
            type="date"
            value={filters.date}
            onChange={(e) => setFilters((prev) => ({ ...prev, date: e.target.value }))}
            className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          />

          <button
            onClick={() => setFilters({ status: '', type: '', date: '', interviewer: '' })}
            className="px-4 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50"
          >
            Clear Filters
          </button>
        </div>
      </div>

      {/* Today’s Interviews */}
      {todayInterviews.length > 0 && (
        <div className="mb-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Today&apos;s Interviews</h2>
          <div className="grid grid-cols-1 gap-4">
            {todayInterviews.map((interview) => (
              <InterviewCard
                key={interview._id}
                interview={interview}
                onUpdateStatus={updateInterviewStatus}
                onViewScorecard={() => {
                  setSelectedInterview(interview);
                  setShowScorecardModal(true);
                }}
                getStatusColor={getStatusColor}
                getTypeIcon={getTypeIcon}
                isToday={true}
              />
            ))}
          </div>
        </div>
      )}

      {/* All Interviews */}
      <div className="mb-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">All Interviews</h2>
        {filteredInterviews.length === 0 ? (
          <div className="text-center py-12">
            <div className="text-gray-400 text-6xl mb-4">📅</div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">No interviews scheduled</h3>
            <p className="text-gray-500 mb-4">Schedule the first interview to get started</p>
            <button onClick={() => setShowScheduleModal(true)} className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700">
              Schedule Interview
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-4">
            {filteredInterviews.map((interview) => (
              <InterviewCard
                key={interview._id}
                interview={interview}
                onUpdateStatus={updateInterviewStatus}
                onViewScorecard={() => {
                  setSelectedInterview(interview);
                  setShowScorecardModal(true);
                }}
                getStatusColor={getStatusColor}
                getTypeIcon={getTypeIcon}
              />
            ))}
          </div>
        )}
      </div>

      {/* Schedule Interview Modal */}
      <ScheduleInterviewModal
        isOpen={showScheduleModal}
        onClose={() => setShowScheduleModal(false)}
        onSchedule={scheduleInterview}
        applications={applications}
      />

      {/* Scorecard Modal */}
      <ScorecardModal
        isOpen={showScorecardModal}
        onClose={() => setShowScorecardModal(false)}
        interview={selectedInterview}
        onSubmit={submitScorecard}
      />
    </div>
  );
}

// Interview Card Component
interface InterviewCardProps {
  interview: Interview;
  onUpdateStatus: (id: string, status: 'scheduled' | 'completed' | 'cancelled' | 'no-show') => void;
  onViewScorecard: () => void;
  getStatusColor: (status: string) => string;
  getTypeIcon: (type: string) => string;
  isToday?: boolean;
}

function InterviewCard({
  interview,
  onUpdateStatus,
  onViewScorecard,
  getStatusColor,
  getTypeIcon,
  isToday = false,
}: InterviewCardProps) {
  const interviewDate = new Date(interview.scheduledAt);
  const isUpcoming = interviewDate > new Date();

  return (
    <div className={`bg-white rounded-lg shadow-sm border p-6 ${isToday ? 'border-orange-300 bg-orange-50' : ''}`}>
      <div className="flex justify-between items-start mb-4">
        <div className="flex-1">
          <div className="flex items-center space-x-3 mb-2">
            <span className="text-2xl">{getTypeIcon(interview.type)}</span>
            <div>
              <h3 className="text-lg font-semibold text-gray-900">
                {interview.application?.name || 'Candidate Name Not Available'}
              </h3>
              <p className="text-gray-600">{interview.application?.job?.title || 'Job Title Not Available'}</p>
              <p className="text-sm text-gray-500">{interview.application?.job?.companyName || 'Company Not Available'}</p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-gray-600">
            <div>
              <p>
                <strong>Date:</strong> {interviewDate.toLocaleDateString()}
              </p>
              <p>
                <strong>Time:</strong> {interviewDate.toLocaleTimeString()}
              </p>
              <p>
                <strong>Duration:</strong> {interview.duration} minutes
              </p>
            </div>
            <div>
              <p>
                <strong>Interviewer:</strong> {interview.interviewer?.name || 'Not Available'}
              </p>
              <p>
                <strong>Email:</strong> {interview.application?.email || 'Not Available'}
              </p>
              <p>
                <strong>Phone:</strong> {interview.application?.phone || 'Not Available'}
              </p>
            </div>
          </div>

          {interview.meetingLink && (
            <div className="mt-3">
              <a href={interview.meetingLink} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:text-blue-800 underline">
                🔗 Join Meeting
              </a>
            </div>
          )}

          {interview.location && (
            <div className="mt-2">
              <p className="text-sm text-gray-600">
                <strong>Location:</strong> {interview.location}
              </p>
            </div>
          )}
        </div>

        <div className="flex flex-col items-end space-y-2">
          <span className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(interview.status)}`}>
            {interview.status.charAt(0).toUpperCase() + interview.status.slice(1)}
          </span>

          {interview.scorecard && <span className="text-sm text-green-600 font-medium">⭐ {interview.scorecard.overall}/5</span>}
        </div>
      </div>

      <div className="flex justify-between items-center pt-4 border-t border-gray-200">
        <div className="flex space-x-2">
          {isUpcoming && interview.status === 'scheduled' && (
            <>
              <button onClick={() => onUpdateStatus(interview._id, 'completed')} className="px-3 py-1 bg-green-600 text-white rounded text-sm hover:bg-green-700">
                Mark Complete
              </button>
              <button onClick={() => onUpdateStatus(interview._id, 'no-show')} className="px-3 py-1 bg-gray-600 text白 rounded text-sm hover:bg-gray-700">
                No Show
              </button>
              <button onClick={() => onUpdateStatus(interview._id, 'cancelled')} className="px-3 py-1 bg-red-600 text-white rounded text-sm hover:bg-red-700">
                Cancel
              </button>
            </>
          )}
        </div>

        <div className="flex space-x-2">
          <button onClick={onViewScorecard} className="px-3 py-1 border border-blue-600 text-blue-600 rounded text-sm hover:bg-blue-50">
            {interview.scorecard ? 'View Scorecard' : 'Add Scorecard'}
          </button>
        </div>
      </div>
    </div>
  );
}

// Schedule Interview Modal Component
interface ScheduleInterviewModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSchedule: (data: ScheduleInterviewInput) => Promise<void>;
  applications: ApplicationLite[];
}

function ScheduleInterviewModal({ isOpen, onClose, onSchedule, applications }: ScheduleInterviewModalProps) {
  const [formData, setFormData] = useState<ScheduleInterviewInput>({
    applicationId: '',
    scheduledAt: '',
    duration: 60,
    type: 'video',
    meetingLink: '',
    location: '',
    notes: '',
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.applicationId || !formData.scheduledAt) {
      alert('Please select an application and date/time');
      return;
    }
    onSchedule(formData);
    setFormData({
      applicationId: '',
      scheduledAt: '',
      duration: 60,
      type: 'video',
      meetingLink: '',
      location: '',
      notes: '',
    });
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-md">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-semibold">Schedule Interview</h3>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
            ✕
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Candidate</label>
            <select
              value={formData.applicationId}
              onChange={(e) => setFormData((prev) => ({ ...prev, applicationId: e.target.value }))}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            >
              <option value="">{applications.length > 0 ? 'Select candidate' : 'No candidates available'}</option>
              {applications.map((app) => (
                <option key={app._id} value={app._id}>
                  {app.name || 'Unknown Candidate'} - {app.job?.title || 'Unknown Job'}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Date &amp; Time</label>
            <input
              type="datetime-local"
              value={formData.scheduledAt}
              onChange={(e) => setFormData((prev) => ({ ...prev, scheduledAt: e.target.value }))}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Duration (minutes)</label>
              <input
                type="number"
                value={formData.duration}
                onChange={(e) => setFormData((prev) => ({ ...prev, duration: parseInt(e.target.value, 10) || 0 }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Type</label>
              <select
                value={formData.type}
                onChange={(e) => setFormData((prev) => ({ ...prev, type: e.target.value as ScheduleInterviewInput['type'] }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="video">Video Call</option>
                <option value="phone">Phone Call</option>
                <option value="in-person">In Person</option>
              </select>
            </div>
          </div>

          {formData.type === 'video' && (
            <div>
              <label className="block text sm font-medium text-gray-700 mb-1">Meeting Link</label>
              <input
                type="url"
                value={formData.meetingLink}
                onChange={(e) => setFormData((prev) => ({ ...prev, meetingLink: e.target.value }))}
                placeholder="https://zoom.us/j/..."
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          )}

          {formData.type === 'in-person' && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Location</label>
              <input
                type="text"
                value={formData.location}
                onChange={(e) => setFormData((prev) => ({ ...prev, location: e.target.value }))}
                placeholder="Office address or room number"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          )}

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Notes</label>
            <textarea
              value={formData.notes}
              onChange={(e) => setFormData((prev) => ({ ...prev, notes: e.target.value }))}
              rows={3}
              placeholder="Additional notes or instructions..."
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div className="flex justify-end space-x-3">
            <button type="button" onClick={onClose} className="px-4 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50">
              Cancel
            </button>
            <button type="submit" className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700">
              Schedule Interview
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

// Scorecard Modal Component
interface ScorecardModalProps {
  isOpen: boolean;
  onClose: () => void;
  interview: Interview | null;
  onSubmit: (interviewId: string, scorecard: ScorecardInput) => Promise<void>;
}

function ScorecardModal({ isOpen, onClose, interview, onSubmit }: ScorecardModalProps) {
  const [scorecard, setScorecard] = useState<ScorecardInput>({
    technicalSkills: 0,
    communication: 0,
    problemSolving: 0,
    culturalFit: 0,
    overall: 0,
    feedback: '',
    recommendation: 'maybe',
  });

  useEffect(() => {
    if (interview?.scorecard) {
      setScorecard(interview.scorecard);
    }
  }, [interview]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!interview) return;

    // Calculate overall score as average
    const average =
      (scorecard.technicalSkills + scorecard.communication + scorecard.problemSolving + scorecard.culturalFit) / 4;
    const updatedScorecard: ScorecardInput = { ...scorecard, overall: Math.round(average * 10) / 10 };

    onSubmit(interview._id, updatedScorecard);
  };

  if (!isOpen || !interview) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-semibold">Interview Scorecard</h3>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
            ✕
          </button>
        </div>

        <div className="mb-4 p-4 bg-gray-50 rounded">
          <h4 className="font-medium">{interview.application?.name || 'Candidate Name Not Available'}</h4>
          <p className="text-sm text-gray-600">{interview.application?.job?.title || 'Job Title Not Available'}</p>
          <p className="text-sm text-gray-500">
            {new Date(interview.scheduledAt).toLocaleDateString()} at {new Date(interview.scheduledAt).toLocaleTimeString()}
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Rating Scales */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <ScoreField
              label="Technical Skills"
              value={scorecard.technicalSkills}
              onChange={(value) => setScorecard((prev) => ({ ...prev, technicalSkills: value }))}
            />
            <ScoreField
              label="Communication"
              value={scorecard.communication}
              onChange={(value) => setScorecard((prev) => ({ ...prev, communication: value }))}
            />
            <ScoreField
              label="Problem Solving"
              value={scorecard.problemSolving}
              onChange={(value) => setScorecard((prev) => ({ ...prev, problemSolving: value }))}
            />
            <ScoreField
              label="Cultural Fit"
              value={scorecard.culturalFit}
              onChange={(value) => setScorecard((prev) => ({ ...prev, culturalFit: value }))}
            />
          </div>

          {/* Overall Recommendation */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Recommendation</label>
            <div className="flex space-x-4">
              {['hire', 'maybe', 'no-hire'].map((option) => (
                <label key={option} className="flex items-center">
                  <input
                    type="radio"
                    name="recommendation"
                    value={option}
                    checked={scorecard.recommendation === option}
                    onChange={(e) => setScorecard((prev) => ({ ...prev, recommendation: e.target.value as ScorecardInput['recommendation'] }))}
                    className="mr-2"
                  />
                  <span className="capitalize">{option.replace('-', ' ')}</span>
                </label>
              ))}
            </div>
          </div>

          {/* Feedback */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Detailed Feedback</label>
            <textarea
              value={scorecard.feedback}
              onChange={(e) => setScorecard((prev) => ({ ...prev, feedback: e.target.value }))}
              rows={6}
              placeholder="Provide detailed feedback about the candidate&apos;s performance, strengths, areas for improvement, and any other relevant observations..."
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div className="flex justify-end space-x-3">
            <button type="button" onClick={onClose} className="px-4 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50">
              Cancel
            </button>
            <button type="submit" className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700">
              Save Scorecard
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

// Score Field Component
function ScoreField({ label, value, onChange }: { label: string; value: number; onChange: (value: number) => void }) {
  return (
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-2">{label}</label>
      <div className="flex items-center space-x-2">
        {[1, 2, 3, 4, 5].map((score) => (
          <button
            key={score}
            type="button"
            onClick={() => onChange(score)}
            className={`w-8 h-8 rounded-full border-2 flex items-center justify-center text-sm font-medium ${
              value >= score ? 'bg-blue-600 border-blue-600 text-white' : 'border-gray-300 text-gray-400 hover:border-blue-300'
            }`}
          >
            {score}
          </button>
        ))}
        <span className="text-sm text-gray-600 ml-2">{value}/5</span>
      </div>
    </div>
  );
}
