'use client';
import { useEffect, useState } from 'react';
import api from '@/lib/api';
import { Job } from '@/types';

export default function JobsPage() {
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

  if (loading) return <div className="p-6">Loading jobs...</div>;

  return (
    <div className="p-6 space-y-4">
      <h1 className="text-2xl font-semibold">Job Listings</h1>
      <div className="grid grid-cols-1 gap-4">
        {jobs.map((job) => (
          <JobCard key={job._id} job={job} />
        ))}
      </div>
    </div>
  );
}

function JobCard({ job }: { job: Job }) {
  return (
    <div className="p-4 bg-white rounded-xl shadow-md space-y-2">
      <div className="flex justify-between items-center">
        <h2 className="text-lg font-semibold">{job.title}</h2>
        <span
          className={`text-xs px-2 py-1 rounded-full ${
            job.status === 'open' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
          }`}
        >
          {job.status.toUpperCase()}
        </span>
      </div>
      <p className="text-sm text-gray-600">{job.description.slice(0, 100)}...</p>
      <div className="text-sm text-gray-500">
        <strong>Department:</strong> {job.department?.name || '—'} | <strong>Role:</strong> {job.role?.title || '—'}
      </div>
      <div className="text-xs text-gray-400">Posted on: {new Date(job.createdAt).toLocaleDateString()}</div>
    </div>
  );
}
