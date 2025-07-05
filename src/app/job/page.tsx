'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
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
      <h1 className="text-2xl font-semibold">Available Jobs</h1>
      <div className="grid grid-cols-1 gap-4">
        {jobs.map((job) => (
          <div key={job._id} className="p-4 bg-white shadow rounded-xl">
            <h2 className="text-lg font-semibold">{job.title}</h2>
            <p className="text-sm text-gray-600">
              Department: {job.department?.name || 'N/A'}
            </p>
            <p className="text-sm mt-2">{job.description?.slice(0, 120)}...</p>
            <Link
              href={`/apply/${job._id}`}
              className="mt-2 inline-block text-blue-600 text-sm underline"
            >
              Apply Now
            </Link>
          </div>
        ))}
      </div>
    </div>
  );
}
