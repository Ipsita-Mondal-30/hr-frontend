'use client';

import { useEffect, useState } from 'react';
import api from '@/lib/api';
import Link from 'next/link';
import { toast } from 'react-hot-toast'; // Optional — remove if not using

export default function ApplicationsPage() {
  const [applications, setApplications] = useState<{
    _id: string;
    candidate: { name: string };
    job: { _id: string; title: string };
    status: string;
    matchScore: number;
  }[]>([]);
  const [jobs, setJobs] = useState<{ _id: string; title: string }[]>([]);
  const [selectedJob, setSelectedJob] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [loading, setLoading] = useState(true);

  const fetchApplications = async () => {
    try {
      const res = await api.get('/applications');
      setApplications(res.data);
    } catch (err) {
      console.error('Failed to fetch applications', err);
    } finally {
      setLoading(false);
    }
  };

  const fetchJobs = async () => {
    try {
      const res = await api.get('/jobs');
      setJobs(res.data);
    } catch (err) {
      console.error('Failed to fetch jobs');
    }
  };

  const updateStatus = async (id: string, newStatus: string) => {
    try {
      await api.put(`/applications/${id}/status`, { status: newStatus });
      toast.success(`Status updated to ${newStatus}`);
      fetchApplications(); // Refetch after update
    } catch (err) {
      console.error('Status update failed', err);
      toast.error('Failed to update status');
    }
  };

  useEffect(() => {
    fetchApplications();
    fetchJobs();
  }, []);

  const filteredApplications = applications.filter(app => {
    return (
      (selectedJob === '' || app.job._id === selectedJob) &&
      (statusFilter === '' || app.status === statusFilter)
    );
  });

  return (
    <div className="p-6">
      <h1 className="text-xl font-bold mb-4">Applications</h1>

      {/* Filters */}
      <div className="flex gap-4 mb-6">
        <select
          value={selectedJob}
          onChange={(e) => setSelectedJob(e.target.value)}
          className="border px-3 py-2 rounded"
        >
          <option value="">All Jobs</option>
          {jobs.map(job => (
            <option key={job._id} value={job._id}>
              {job.title}
            </option>
          ))}
        </select>

        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="border px-3 py-2 rounded"
        >
          <option value="">All Statuses</option>
          <option value="pending">Pending</option>
          <option value="reviewed">Reviewed</option>
          <option value="shortlisted">Shortlisted</option>
          <option value="rejected">Rejected</option>
        </select>
      </div>

      {/* Application List */}
      {loading ? (
        <p>Loading...</p>
      ) : filteredApplications.length === 0 ? (
        <p>No applications found.</p>
      ) : (
        <div className="space-y-4">
          {filteredApplications.map(app => (
            <div
              key={app._id}
              className="border p-4 rounded shadow flex flex-col md:flex-row justify-between items-start md:items-center gap-4"
            >
              <div>
                <h2 className="font-semibold">{app.candidate?.name}</h2>
                <p className="text-sm text-gray-600">{app.job.title}</p>
                <p className="text-sm text-gray-600">Score: {app.matchScore}%</p>
                <div className="mt-1">
                  <label className="text-sm mr-2">Status:</label>
                  <select
                    value={app.status}
                    onChange={(e) => updateStatus(app._id, e.target.value)}
                    className="border px-2 py-1 rounded text-sm"
                  >
                    <option value="pending">Pending</option>
                    <option value="reviewed">Reviewed</option>
                    <option value="shortlisted">Shortlisted</option>
                    <option value="rejected">Rejected</option>
                  </select>
                </div>
              </div>

              <Link
                href={`/admin/dashboard/applications/${app._id}`}
                className="text-blue-600 underline text-sm"
              >
                View Full Application
              </Link>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
