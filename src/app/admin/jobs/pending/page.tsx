'use client';

import { useEffect, useState } from 'react';
import api from '@/lib/api';

interface PendingJob {
  _id: string;
  title: string;
  companyName: string;
  description: string;
  location: string;
  employmentType: string;
  minSalary?: number;
  maxSalary?: number;
  skills: string[];
  createdBy?: {
    _id: string;
    name: string;
    email: string;
    companyName?: string;
  } | null;
  department?: {
    name: string;
  } | null;
  createdAt: string;
}

function isAxiosLikeError(error: unknown): error is { response?: { data?: { error?: string }; status?: number } } {
  return typeof error === 'object' && error !== null && 'response' in error;
}

export default function PendingJobsPage() {
  const [pendingJobs, setPendingJobs] = useState<PendingJob[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedJob, setSelectedJob] = useState<PendingJob | null>(null);
  const [rejectionReason, setRejectionReason] = useState('');

  useEffect(() => {
    fetchPendingJobs();
  }, []);

  const fetchPendingJobs = async () => {
    try {
      console.log('🔄 Fetching pending job approvals...');
      const response = await api.get('/admin/jobs/pending');
      const data = response.data || [];
      console.log(`📊 Found ${data.length} pending jobs`);
      setPendingJobs(data);
    } catch (error) {
      console.error('Error fetching pending jobs:', error);
      
      // Check if it's an authentication error
      if (isAxiosLikeError(error) && error.response?.status === 401) {
        alert('Authentication failed. Please log in again.');
        window.location.href = '/login';
        return;
      }
      
      // Check if it's a forbidden error
      if (isAxiosLikeError(error) && error.response?.status === 403) {
        alert('Access denied. Admin privileges required.');
        window.location.href = '/';
        return;
      }
      
      setPendingJobs([]);
    } finally {
      setLoading(false);
    }
  };

  const approveJob = async (jobId: string) => {
    try {
      console.log(`✅ Approving job: ${jobId}`);
      const response = await api.put(`/admin/jobs/${jobId}/approve`, {
        action: 'approve'
      });
      
      console.log('✅ Job approved successfully:', response.data);
      
      // Remove from pending list
      setPendingJobs(prev => prev.filter(job => job._id !== jobId));
      setSelectedJob(null);
      
      alert('Job approved successfully!');
    } catch (err) {
      console.error('Failed to approve job:', err);
      if (err instanceof Error) {
        if (isAxiosLikeError(err)) {
          alert('Failed to approve job: ' + (err.response?.data?.error || err.message));
        } else {
          alert('Failed to approve job: ' + err.message);
        }
      } else {
        alert('Failed to approve job: ' + String(err));
      }
    }
  };

  const rejectJob = async (jobId: string, reason: string) => {
    if (!reason.trim()) {
      alert('Please provide a reason for rejection');
      return;
    }

    try {
      console.log(`❌ Rejecting job: ${jobId} with reason: ${reason}`);
      const response = await api.put(`/admin/jobs/${jobId}/approve`, {
        action: 'reject',
        reason
      });
      
      console.log('✅ Job rejected successfully:', response.data);
      
      // Remove from pending list
      setPendingJobs(prev => prev.filter(job => job._id !== jobId));
      setSelectedJob(null);
      setRejectionReason('');
      
      alert('Job rejected successfully!');
    } catch (err) {
      console.error('Failed to reject job:', err);
      if (err instanceof Error) {
        if (isAxiosLikeError(err)) {
          alert('Failed to reject job: ' + (err.response?.data?.error || err.message));
        } else {
          alert('Failed to reject job: ' + err.message);
        }
      } else {
        alert('Failed to reject job: ' + String(err));
      }
    }
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-1/3 mb-6"></div>
          <div className="h-64 bg-gray-200 rounded"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Job Approval</h1>
        <p className="text-gray-600">Review and approve job postings from HR users</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white rounded-lg shadow-sm border p-4 text-center">
          <div className="text-2xl font-bold text-orange-600">{pendingJobs.length}</div>
          <div className="text-sm text-gray-600">Pending Approval</div>
        </div>
        <div className="bg-white rounded-lg shadow-sm border p-4 text-center">
          <div className="text-2xl font-bold text-green-600">0</div>
          <div className="text-sm text-gray-600">Approved Today</div>
        </div>
        <div className="bg-white rounded-lg shadow-sm border p-4 text-center">
          <div className="text-2xl font-bold text-red-600">0</div>
          <div className="text-sm text-gray-600">Rejected Today</div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Pending Jobs List */}
        <div className="bg-white rounded-lg shadow-sm border">
          <div className="p-6 border-b border-gray-200">
            <h2 className="text-lg font-semibold text-gray-900">Pending Job Approvals</h2>
          </div>
          
          <div className="divide-y divide-gray-200 max-h-96 overflow-y-auto">
            {pendingJobs.length > 0 ? (
              pendingJobs.map((job) => (
                <div
                  key={job._id}
                  className={`p-4 cursor-pointer hover:bg-gray-50 ${
                    selectedJob?._id === job._id ? 'bg-blue-50 border-l-4 border-blue-500' : ''
                  }`}
                  onClick={() => setSelectedJob(job)}
                >
                  <div className="flex justify-between items-start">
                    <div>
                      <h3 className="font-medium text-gray-900">{job.title}</h3>
                      <p className="text-sm text-gray-600">{job.companyName}</p>
                      <p className="text-sm text-gray-500">by {job.createdBy?.name || 'Unknown User'}</p>
                    </div>
                    <div className="text-xs text-gray-400">
                      {new Date(job.createdAt).toLocaleDateString()}
                    </div>
                  </div>
                  
                  <div className="mt-2 flex items-center space-x-2">
                    <span className="inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-orange-100 text-orange-800">
                      Pending Review
                    </span>
                    <span className="inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-blue-100 text-blue-800 capitalize">
                      {job.employmentType?.replace('-', ' ') || 'Not specified'}
                    </span>
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center py-12">
                <div className="text-gray-400 text-6xl mb-4">✅</div>
                <h3 className="text-lg font-medium text-gray-900 mb-2">All caught up!</h3>
                <p className="text-gray-500">No pending job approvals</p>
              </div>
            )}
          </div>
        </div>

        {/* Job Details Panel */}
        <div className="bg-white rounded-lg shadow-sm border">
          {selectedJob ? (
            <div>
              <div className="p-6 border-b border-gray-200">
                <h2 className="text-lg font-semibold text-gray-900">Job Details</h2>
              </div>
              
              <div className="p-6 space-y-6">
                {/* Basic Info */}
                <div>
                  <h3 className="font-medium text-gray-900 mb-3">Job Information</h3>
                  <div className="grid grid-cols-1 gap-3 text-sm">
                    <div><strong>Title:</strong> {selectedJob.title}</div>
                    <div><strong>Company:</strong> {selectedJob.companyName}</div>
                    <div><strong>Department:</strong> {selectedJob.department?.name || 'No Department'}</div>
                    <div><strong>Location:</strong> {selectedJob.location}</div>
                    <div><strong>Type:</strong> {selectedJob.employmentType?.replace('-', ' ') || 'Not specified'}</div>
                    {(selectedJob.minSalary || selectedJob.maxSalary) && (
                      <div>
                        <strong>Salary:</strong> 
                        {selectedJob.minSalary && selectedJob.maxSalary 
                          ? ` $${selectedJob.minSalary.toLocaleString()} - $${selectedJob.maxSalary.toLocaleString()}`
                          : selectedJob.minSalary 
                            ? ` $${selectedJob.minSalary.toLocaleString()}+`
                            : ` Up to $${selectedJob.maxSalary?.toLocaleString()}`
                        }
                      </div>
                    )}
                  </div>
                </div>

                {/* HR Info */}
                <div>
                  <h3 className="font-medium text-gray-900 mb-3">Posted By</h3>
                  <div className="grid grid-cols-1 gap-3 text-sm">
                    <div><strong>HR Name:</strong> {selectedJob.createdBy?.name || 'Unknown User'}</div>
                    <div><strong>Email:</strong> {selectedJob.createdBy?.email || 'No Email'}</div>
                    {selectedJob.createdBy?.companyName && (
                      <div><strong>Company:</strong> {selectedJob.createdBy.companyName}</div>
                    )}
                  </div>
                </div>

                {/* Description */}
                <div>
                  <h3 className="font-medium text-gray-900 mb-3">Job Description</h3>
                  <p className="text-sm text-gray-700 bg-gray-50 p-3 rounded-lg">
                    {selectedJob.description || 'No description provided'}
                  </p>
                </div>

                {/* Skills */}
                {selectedJob.skills && selectedJob.skills.length > 0 && (
                  <div>
                    <h3 className="font-medium text-gray-900 mb-3">Required Skills</h3>
                    <div className="flex flex-wrap gap-2">
                      {selectedJob.skills.map((skill, index) => (
                        <span
                          key={index}
                          className="bg-blue-100 text-blue-800 px-2 py-1 rounded text-sm"
                        >
                          {skill}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {/* Rejection Reason Input */}
                <div>
                  <h3 className="font-medium text-gray-900 mb-3">Rejection Reason (if rejecting)</h3>
                  <textarea
                    value={rejectionReason}
                    onChange={(e) => setRejectionReason(e.target.value)}
                    rows={3}
                    placeholder="Provide reason for rejection (required if rejecting)..."
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                  />
                </div>

                {/* Actions */}
                <div className="flex space-x-3 pt-4 border-t border-gray-200">
                  <button
                    onClick={() => approveJob(selectedJob._id)}
                    className="flex-1 px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700"
                  >
                    ✅ Approve Job
                  </button>
                  <button
                    onClick={() => rejectJob(selectedJob._id, rejectionReason)}
                    className="flex-1 px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700"
                  >
                    ❌ Reject Job
                  </button>
                </div>
              </div>
            </div>
          ) : (
            <div className="p-6 text-center">
              <div className="text-gray-400 text-6xl mb-4">👈</div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">Select a Job</h3>
              <p className="text-gray-500">Choose a job from the list to review details</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
