'use client';
import { useEffect, useState } from 'react';
import api from '@/lib/api';
import { Application } from '@/types';
import Link from 'next/link';

export default function ApplicationsPage() {
  const [applications, setApplications] = useState<Application[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchApps = async () => {
      try {
        const res = await api.get('/applications');
        setApplications(res.data);
      } catch (err) {
        console.error('Error fetching applications:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchApps();
  }, []);

  if (loading) return <div className="p-6">Loading applications...</div>;

  return (
    <div className="p-6 space-y-4">
      <h1 className="text-2xl font-semibold">Applications</h1>
      <div className="grid grid-cols-1 gap-4">
        {applications.map((app) => (
          <ApplicationCard key={app._id} app={app} />
        ))}
      </div>
    </div>
  );
}

function ApplicationCard({ app }: { app: Application }) {
  return (
    <div className="p-4 bg-white rounded-xl shadow-md space-y-2">
      <div className="flex justify-between">
        <div>
          <h2 className="font-semibold">{app.name}</h2>
          <p className="text-sm text-gray-600">{app.email}</p>
          <p className="text-sm text-gray-600">{app.phone}</p>
          <p className="text-sm text-gray-600">Job: {app.job?.title || '—'}</p>
        </div>
        <div className="text-right">
          {app.matchScore && (
            <p className="text-sm">
              Match Score: <span className="font-semibold">{app.matchScore}</span>
            </p>
          )}
          <a
            href={app.resumeUrl}
            target="_blank"
            className="text-blue-600 underline text-sm"
            rel="noopener noreferrer"
          >
            View Resume
          </a>
        </div>
      </div>
    </div>
  );
}
