'use client';

import { useEffect, useState } from 'react';
import api from '@/lib/api';
import Link from 'next/link';

interface Job {
  _id: string;
  title: string;
  companyName: string;
  department: { name: string };
  location: string;
  type: string;
  status: 'active' | 'inactive' | 'pending' | 'rejected';
  salary?: { min: number; max: number; currency: string };
  applicationsCount: number;
  createdAt: string;
  postedBy: {
    name: string;
    email: string;
  };
  isApproved: boolean;
  rejectionReason?: string;
}

export default function AdminJobs() {
  const [jobs, setJobs] = useState<Job[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'all' | 'active' | 'pending' | 'rejected'>('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedJobs, setSelectedJobs] = useState<string[]>([]);

  useEffect(() => {
    fetchJobs();
  }, [filter]);

  const fetchJobs = async () => {
    try {
      const endpoint = filter === 'all' ? '/admin/jobs' : `/admin/jobs?status=${filter}`;
      const res = await api.get(endpoint);
      setJobs(res.data);
    } catch (err) {
      console.error('Failed to fetch jobs:', err);
    } finally {
      setLoading(false);
    }
  };

  const updateJobStatus = async (jobId: string, status: string, reason?: string) => {
    try {
      await api.put(`/admin/jobs/${jobId}/status`, { status, reason });
      setJobs(jobs.map(job => 
        job._id === jobId ? { ...job, status: status as any, rejectionReason: reason } : job
      ));
      alert(`Job ${status} successfully`);
    } catch (err) {
      console.error('Failed to update job status:', err);
      alert('Failed to update job status');
    }
  };

  const deleteJob = async (jobId: string) => {
    if (!confirm('Are you sure you want to delete this job? This action cannot be undone.')) return;
    
    try {
      await api.delete(`/admin/jobs/${jobId}`);
      setJobs(jobs.filter(job => job._id !== jobId));
      alert('Job deleted successfully');
    } catch (err) {
      console.error('Failed to delete job:', err);
      alert('Failed to delete job');
    }
  };

  const bulkAction = async (action: 'approve' | 'reject' | 'delete') => {
    if (selectedJobs.length === 0) {
      alert('Please select jobs first');
      return;
    }

    let reason = '';
    if (action === 'reject') {
      reason = prompt('Reason for rejection:') || '';
      if (!reason) return;
    }

    if (!confirm(`${action} ${selectedJobs.length} selected jobs?`)) return;

    try {
      await api.post('/admin/jobs/bulk-action', {
        jobIds: selectedJobs,
        action,
        reason
      });
      
      if (action === 'delete') {
        setJobs(jobs.filter(job => !selectedJobs.includes(job._id)));
      } else {
        const status = action === 'approve' ? 'active' : 'rejected';
        setJobs(jobs.map(job => 
          selectedJobs.includes(job._id) 
            ? { ...job, status: status as any, rejectionReason: reason } 
            : job
        ));
      }
      
      setSelectedJobs([]);
      alert(`Successfully ${action}d ${selectedJobs.length} jobs`);
    } catch (err) {
      console.error(`Failed to ${action} jobs:`, err);
      alert(`Failed to ${action} jobs`);
    }
  };

  const filteredJobs = jobs.filter(job =>
    job.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    job.companyName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    job.department.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-green-100 text-green-800';
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'rejected': return 'bg-red-100 text-red-800';
      case 'inactive': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
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
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">All Jobs</h1>
          <p className="text-gray-600">View and manage all jobs posted on the platform</p>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white rounded-lg shadow-sm border p-4 text-center">
          <div className="text-2xl font-bold text-gray-900">{jobs.length}</div>
          <div className="text-sm text-gray-600">Total Jobs</div>
        </div>
        <div className="bg-white rounded-lg shadow-sm border p-4 text-center">
          <div className="text-2xl font-bold text-green-600">
            {jobs.filter(j => j.status === 'active').length}
          </div>
          <div className="text-sm text-gray-600">Active Jobs</div>
        </div>
        <div className="bg-white rounded-lg shadow-sm border p-4 text-center">
          <div className="text-2xl font-bold text-purple-600">
            {jobs.reduce((sum, job) => sum + job.applicationsCount, 0)}
          </div>
          <div className="text-sm text-gray-600">Total Applications</div>
        </div>
      </div>

      {/* Filters and Search */}
      <div className="bg-white rounded-lg shadow-sm border p-6">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between space-y-4 md:space-y-0">
          <div className="flex space-x-4">
            <select
              value={filter}
              onChange={(e) => setFilter(e.target.value as any)}
              className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="all">All Jobs</option>
              <option value="active">Active</option>
              <option value="inactive">Inactive</option>
            </select>
            
            <input
              type="text"
              placeholder="Search jobs..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          {selectedJobs.length > 0 && (
            <div className="flex space-x-2">
              <button
                onClick={() => bulkAction('approve')}
                className="px-3 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 text-sm"
              >
                Activate ({selectedJobs.length})
              </button>
              <button
                onClick={() => bulkAction('reject')}
                className="px-3 py-2 bg-yellow-600 text-white rounded-md hover:bg-yellow-700 text-sm"
              >
                Deactivate ({selectedJobs.length})
              </button>
              <button
                onClick={() => bulkAction('delete')}
                className="px-3 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 text-sm"
              >
                Delete ({selectedJobs.length})
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Jobs Table */}
      <div className="bg-white rounded-lg shadow-sm border overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left">
                  <input
                    type="checkbox"
                    checked={selectedJobs.length === filteredJobs.length && filteredJobs.length > 0}
                    onChange={(e) => {
                      if (e.target.checked) {
                        setSelectedJobs(filteredJobs.map(job => job._id));
                      } else {
                        setSelectedJobs([]);
                      }
                    }}
                    className="rounded border-gray-300"
                  />
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Job Details
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Company
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Applications
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Posted
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredJobs.map((job) => (
                <tr key={job._id} className="hover:bg-gray-50">
                  <td className="px-6 py-4">
                    <input
                      type="checkbox"
                      checked={selectedJobs.includes(job._id)}
                      onChange={(e) => {
                        if (e.target.checked) {
                          setSelectedJobs([...selectedJobs, job._id]);
                        } else {
                          setSelectedJobs(selectedJobs.filter(id => id !== job._id));
                        }
                      }}
                      className="rounded border-gray-300"
                    />
                  </td>
                  <td className="px-6 py-4">
                    <div>
                      <div className="text-sm font-medium text-gray-900">{job.title}</div>
                      <div className="text-sm text-gray-500">{job.department.name}</div>
                      <div className="text-sm text-gray-500">{job.location} • {job.type}</div>
                      {job.salary && (
                        <div className="text-xs text-gray-400">
                          {job.salary.currency} {job.salary.min.toLocaleString()} - {job.salary.max.toLocaleString()}
                        </div>
                      )}
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div>
                      <div className="text-sm font-medium text-gray-900">{job.companyName}</div>
                      <div className="text-sm text-gray-500">{job.postedBy.name}</div>
                      <div className="text-xs text-gray-400">{job.postedBy.email}</div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(job.status)}`}>
                      {job.status.toUpperCase()}
                    </span>
                    {job.rejectionReason && (
                      <div className="text-xs text-red-600 mt-1" title={job.rejectionReason}>
                        Reason: {job.rejectionReason.substring(0, 30)}...
                      </div>
                    )}
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-900">
                    {job.applicationsCount}
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-500">
                    {new Date(job.createdAt).toLocaleDateString()}
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex space-x-2">
                      {job.status === 'active' && (
                        <button
                          onClick={() => updateJobStatus(job._id, 'inactive')}
                          className="px-3 py-1 text-xs bg-yellow-100 text-yellow-700 rounded hover:bg-yellow-200"
                        >
                          Deactivate
                        </button>
                      )}
                      
                      {job.status === 'inactive' && (
                        <button
                          onClick={() => updateJobStatus(job._id, 'active')}
                          className="px-3 py-1 text-xs bg-green-100 text-green-700 rounded hover:bg-green-200"
                        >
                          Activate
                        </button>
                      )}
                      
                      <button
                        onClick={() => deleteJob(job._id)}
                        className="px-3 py-1 text-xs bg-red-100 text-red-700 rounded hover:bg-red-200"
                      >
                        Delete
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        
        {filteredJobs.length === 0 && (
          <div className="text-center py-12">
            <div className="text-gray-400 text-6xl mb-4">💼</div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">No jobs found</h3>
            <p className="text-gray-500">Try adjusting your search or filter criteria</p>
          </div>
        )}
      </div>
    </div>
  );
}
