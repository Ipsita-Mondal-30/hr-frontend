'use client';

import { useEffect, useState } from 'react';
import api from '@/lib/api';
import { Job } from '@/types';

export default function AdminJobsPage() {
  const [jobs, setJobs] = useState<Job[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchJobs = async () => {
      try {
        const res = await api.get('/jobs');
        setJobs(res.data);
      } catch (err) {
        console.error('Error fetching jobs:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchJobs();
  }, []);

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-4">All Jobs (Admin View)</h1>

      {loading ? (
        <p>Loading jobs...</p>
      ) : jobs.length === 0 ? (
        <p>No jobs found.</p>
      ) : (
        <div className="grid grid-cols-1 gap-4">
          {jobs.map((job) => (
            <div key={job._id} className="p-4 bg-white rounded shadow space-y-1">
              <h2 className="font-semibold">{job.title}</h2>
              <p className="text-sm text-gray-700">{job.description}</p>
              <div className="text-xs text-gray-500">
                Department: {job.department?.name || 'N/A'} | Role: {job.role?.title || 'N/A'} | Status: {job.status}
              </div>
              <div className="text-xs text-gray-500">
                Posted by: {job.createdBy?.name} ({job.createdBy?.email})
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
