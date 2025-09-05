'use client';

import { useEffect, useState, useCallback } from 'react';
import { useParams, useRouter } from 'next/navigation';
import api from '@/lib/api';

interface ApplicationDetail {
  _id: string;
  name: string;
  email: string;
  phone: string;
  candidate: {
    _id: string;
    name: string;
    email: string;
    skills?: string[];
    experience?: string;
    bio?: string;
    location?: string;
    expectedSalary?: string;
  };
  job: {
    _id: string;
    title: string;
    companyName: string;
    department: { name: string };
    description: string;
    skills?: string[];
  };
  status: string;
  matchScore?: number;
  resumeUrl: string;
  portfolio?: string;
  coverLetter?: string;
  applicationData?: {
    linkedIn?: string;
    github?: string;
    expectedSalary?: string;
    availableStartDate?: string;
    whyInterested?: string;
  };
  matchInsights?: {
    explanation: string;
    matchingSkills: string[];
    missingSkills: string[];
    tags: string[];
  };
  createdAt: string;
}

export default function ApplicationDetailPage() {
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const [application, setApplication] = useState<ApplicationDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [notes, setNotes] = useState('');
  const [savingNotes, setSavingNotes] = useState(false);

  const fetchApplication = useCallback(
    async (id: string) => {
      try {
        setLoading(true);
        const res = await api.get(`/applications/${id}`);
        setApplication(res.data as ApplicationDetail);
        setNotes((res.data as any).hrNotes || ''); // keep compatibility if hrNotes exists
      } catch (err) {
        console.error('Failed to fetch application:', err);
        alert('Failed to load application details');
        router.push('/hr/applications');
      } finally {
        setLoading(false);
      }
    },
    [router]
  );

  useEffect(() => {
    if (params?.id) {
      fetchApplication(params.id);
    }
  }, [params?.id, fetchApplication]);

  const updateStatus = async (newStatus: string) => {
    if (!application) return;

    try {
      await api.put(`/applications/${application._id}/status`, { status: newStatus });
      setApplication((prev) => (prev ? { ...prev, status: newStatus } : null));
      alert(`Status updated to ${newStatus}`);
    } catch (err) {
      console.error('Status update failed:', err);
      alert('Failed to update status');
    }
  };

  const saveNotes = async () => {
    if (!application) return;

    setSavingNotes(true);
    try {
      await api.put(`/applications/${application._id}/notes`, { notes });
      alert('Notes saved successfully');
    } catch (err) {
      console.error('Failed to save notes:', err);
      alert('Failed to save notes');
    } finally {
      setSavingNotes(false);
    }
  };

  const downloadResume = () => {
    if (!application?.resumeUrl) {
      alert('No resume available');
      return;
    }

    const link = document.createElement('a');
    link.href = application.resumeUrl;
    link.download = `${application.name}_Resume.pdf`;
    link.target = '_blank';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'reviewed':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'shortlisted':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'rejected':
        return 'bg-red-100 text-red-800 border-red-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getScoreColor = (score?: number) => {
    if (!score) return 'bg-gray-100 text-gray-800';
    if (score >= 80) return 'bg-green-100 text-green-800';
    if (score >= 60) return 'bg-yellow-100 text-yellow-800';
    return 'bg-red-100 text-red-800';
  };

  if (loading) {
    return (
      <div className="p-6">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-1/3 mb-6"></div>
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 space-y-6">
              <div className="h-64 bg-gray-200 rounded"></div>
              <div className="h-32 bg-gray-200 rounded"></div>
            </div>
            <div className="space-y-6">
              <div className="h-48 bg-gray-200 rounded"></div>
              <div className="h-32 bg-gray-200 rounded"></div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!application) {
    return (
      <div className="p-6">
        <div className="text-center py-12">
          <div className="text-gray-400 text-6xl mb-4">❌</div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">Application not found</h3>
          <button
            onClick={() => router.push('/hr/applications')}
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
          >
            Back to Applications
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex justify-between items-start mb-6">
        <div>
          <button
            onClick={() => router.push('/hr/applications')}
            className="text-blue-600 hover:text-blue-800 mb-2 flex items-center"
          >
            ← Back to Applications
          </button>
          <h1 className="text-2xl font-bold text-gray-900">{application.name}</h1>
          <p className="text-gray-600">Application for {application.job.title}</p>
        </div>

        <div className="flex items-center space-x-3">
          <span
            className={`px-3 py-1 rounded-full text-sm font-medium border ${getStatusColor(application.status)}`}
          >
            {application.status.charAt(0).toUpperCase() + application.status.slice(1)}
          </span>
          {application.matchScore && (
            <span
              className={`px-3 py-1 rounded-full text-sm font-medium ${getScoreColor(application.matchScore)}`}
            >
              {application.matchScore}% Match
            </span>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Candidate Information */}
          <div className="bg-white rounded-lg shadow-sm border p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Candidate Information</h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h3 className="font-medium text-gray-900 mb-3">Contact Details</h3>
                <div className="space-y-2 text-sm">
                  <div>
                    <strong>Name:</strong> {application.name}
                  </div>
                  <div>
                    <strong>Email:</strong> {application.email}
                  </div>
                  <div>
                    <strong>Phone:</strong> {application.phone || 'Not provided'}
                  </div>
                  <div>
                    <strong>Location:</strong> {application.candidate?.location || 'Not provided'}
                  </div>
                </div>
              </div>

              <div>
                <h3 className="font-medium text-gray-900 mb-3">Professional Details</h3>
                <div className="space-y-2 text-sm">
                  <div>
                    <strong>Experience:</strong> {application.candidate?.experience || 'Not specified'}
                  </div>
                  <div>
                    <strong>Expected Salary:</strong>{' '}
                    {application.candidate?.expectedSalary ||
                      application.applicationData?.expectedSalary ||
                      'Not specified'}
                  </div>
                  {application.applicationData?.availableStartDate && (
                    <div>
                      <strong>Available From:</strong>{' '}
                      {new Date(application.applicationData.availableStartDate).toLocaleDateString()}
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Skills */}
            {application.candidate?.skills && application.candidate.skills.length > 0 && (
              <div className="mt-6">
                <h3 className="font-medium text-gray-900 mb-3">Skills</h3>
                <div className="flex flex-wrap gap-2">
                  {application.candidate.skills.map((skill, index) => (
                    <span key={index} className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm">
                      {skill}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Bio */}
            {application.candidate?.bio && (
              <div className="mt-6">
                <h3 className="font-medium text-gray-900 mb-3">Bio</h3>
                <p className="text-gray-700 text-sm">{application.candidate.bio}</p>
              </div>
            )}
          </div>

          {/* Application Details */}
          <div className="bg-white rounded-lg shadow-sm border p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Application Details</h2>

            {/* Why Interested */}
            {application.applicationData?.whyInterested && (
              <div className="mb-6">
                <h3 className="font-medium text-gray-900 mb-2">Why interested in this position?</h3>
                <p className="text-gray-700 text-sm bg-gray-50 p-3 rounded">
                  {application.applicationData.whyInterested}
                </p>
              </div>
            )}

            {/* Cover Letter */}
            {application.coverLetter && (
              <div className="mb-6">
                <h3 className="font-medium text-gray-900 mb-2">Cover Letter</h3>
                <div className="text-gray-700 text-sm bg-gray-50 p-3 rounded whitespace-pre-wrap">
                  {application.coverLetter}
                </div>
              </div>
            )}

            {/* Links */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {application.portfolio && (
                <a
                  href={application.portfolio}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center justify-center px-4 py-2 border border-gray-300 rounded-md hover:bg-gray-50"
                >
                  🌐 Portfolio
                </a>
              )}
              {application.applicationData?.linkedIn && (
                <a
                  href={application.applicationData.linkedIn}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center justify-center px-4 py-2 border border-gray-300 rounded-md hover:bg-gray-50"
                >
                  💼 LinkedIn
                </a>
              )}
              {application.applicationData?.github && (
                <a
                  href={application.applicationData.github}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center justify-center px-4 py-2 border border-gray-300 rounded-md hover:bg-gray-50"
                >
                  🐙 GitHub
                </a>
              )}
            </div>
          </div>

          {/* AI Match Analysis */}
          {application.matchInsights && (
            <div className="bg-white rounded-lg shadow-sm border p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">🤖 AI Match Analysis</h2>

              <div className="mb-4">
                <p className="text-gray-700 text-sm bg-blue-50 p-3 rounded">
                  {application.matchInsights.explanation}
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {application.matchInsights.matchingSkills &&
                  application.matchInsights.matchingSkills.length > 0 && (
                    <div>
                      <h3 className="font-medium text-green-700 mb-2">✅ Matching Skills</h3>
                      <div className="flex flex-wrap gap-2">
                        {application.matchInsights.matchingSkills.map((skill, index) => (
                          <span key={index} className="bg-green-100 text-green-800 px-2 py-1 rounded text-sm">
                            {skill}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}

                {application.matchInsights.missingSkills &&
                  application.matchInsights.missingSkills.length > 0 && (
                    <div>
                      <h3 className="font-medium text-red-700 mb-2">❌ Missing Skills</h3>
                      <div className="flex flex-wrap gap-2">
                        {application.matchInsights.missingSkills.map((skill, index) => (
                          <span key={index} className="bg-red-100 text-red-800 px-2 py-1 rounded text-sm">
                            {skill}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
              </div>

              {application.matchInsights.tags && application.matchInsights.tags.length > 0 && (
                <div className="mt-4">
                  <h3 className="font-medium text-blue-700 mb-2">🏷️ Tags</h3>
                  <div className="flex flex-wrap gap-2">
                    {application.matchInsights.tags.map((tag, index) => (
                      <span key={index} className="bg-blue-100 text-blue-800 px-2 py-1 rounded text-sm">
                        {tag}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Actions */}
          <div className="bg-white rounded-lg shadow-sm border p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Actions</h2>

            <div className="space-y-3">
              <button
                onClick={downloadResume}
                className="w-full px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
              >
                📄 Download Resume
              </button>

              <button
                onClick={() => window.open(`mailto:${application.email}`, '_blank')}
                className="w-full px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700"
              >
                ✉️ Send Email
              </button>

              <button
                onClick={() => window.open(`tel:${application.phone}`, '_blank')}
                className="w-full px-4 py-2 bg-purple-600 text-white rounded-md hover:bg-purple-700"
                disabled={!application.phone}
              >
                📞 Call Candidate
              </button>
            </div>
          </div>

          {/* Status Management */}
          <div className="bg-white rounded-lg shadow-sm border p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Status Management</h2>

            <div className="space-y-2">
              {['pending', 'reviewed', 'shortlisted', 'rejected'].map((status) => (
                <button
                  key={status}
                  onClick={() => updateStatus(status)}
                  className={`w-full px-4 py-2 rounded-md text-sm font-medium ${
                    application.status === status ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  {status.charAt(0).toUpperCase() + status.slice(1)}
                </button>
              ))}
            </div>
          </div>

          {/* Job Information */}
          <div className="bg-white rounded-lg shadow-sm border p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Job Information</h2>

            <div className="space-y-3 text-sm">
              <div>
                <strong>Position:</strong> {application.job.title}
              </div>
              <div>
                <strong>Company:</strong> {application.job.companyName}
              </div>
              <div>
                <strong>Department:</strong> {application.job.department?.name}
              </div>
              <div>
                <strong>Applied:</strong> {new Date(application.createdAt).toLocaleDateString()}
              </div>
            </div>

            {application.job.skills && application.job.skills.length > 0 && (
              <div className="mt-4">
                <strong className="text-sm">Required Skills:</strong>
                <div className="flex flex-wrap gap-1 mt-2">
                  {application.job.skills.map((skill, index) => (
                    <span key={index} className="bg-gray-100 text-gray-700 px-2 py-1 rounded text-xs">
                      {skill}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Notes */}
          <div className="bg-white rounded-lg shadow-sm border p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">HR Notes</h2>

            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              rows={4}
              placeholder="Add notes about this candidate..."
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
            />

            <button
              onClick={saveNotes}
              disabled={savingNotes}
              className="mt-3 w-full px-4 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-700 disabled:bg-gray-400 text-sm"
            >
              {savingNotes ? 'Saving...' : 'Save Notes'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
