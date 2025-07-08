'use client';

import { useEffect, useState } from 'react';
import api from '@/lib/api';
import { Application } from '@/types';


export default function AdminApplicationsPage() {
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

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-4">All Applications (Admin View)</h1>

      {loading ? (
        <p>Loading applications...</p>
      ) : applications.length === 0 ? (
        <p>No applications found.</p>
      ) : (
        <div className="grid grid-cols-1 gap-4">
          {applications.map((app) => (
            <div key={app._id} className="p-4 bg-white rounded shadow space-y-1">
              <div className="font-semibold">{app.candidate?.name}</div>
              <div className="text-sm text-gray-700">{app.candidate?.email}</div>
              <div className="text-sm">
                <strong>Job:</strong> {app.job?.title} — {app.job?.department?.name}
              </div>
              <div className="text-sm">
                <strong>Score:</strong> {app.matchScore || 'N/A'} | <strong>Status:</strong> {app.status}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
