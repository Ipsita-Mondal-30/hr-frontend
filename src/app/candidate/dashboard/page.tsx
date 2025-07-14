'use client';

import { useEffect, useState } from 'react';
import api from '@/lib/api';
import { Application } from '@/types';

export default function CandidateDashboard() {
  const [applications, setApplications] = useState<Application[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchApplications = async () => {
    try {
      const res = await api.get('/applications/my'); // Fetch apps by logged-in user
      setApplications(res.data);
    } catch (err) {
      console.error('Error fetching applications:', err);
    } finally {
      setLoading(false);
    }
  };
  

  useEffect(() => {
    fetchApplications();
  }, []);
  

  return (
    <div className="p-6 space-y-6">
      <h1 className="text-xl font-semibold">My Applications</h1>

      {loading ? (
        <p>Loading...</p>
      ) : applications.length === 0 ? (
        <p>You haven't applied to any jobs yet.</p>
      ) : (
        <div className="grid grid-cols-1 gap-4">
          {applications.map((app) => (
            <div key={app._id} className="bg-white p-4 rounded shadow space-y-2">
              <div className="flex justify-between items-center">
                <div>
                  <h2 className="font-medium">{app.job?.title}</h2>
                  <p className="text-sm text-gray-500">Status: {app.status}</p>
                </div>
                <span className="text-sm bg-blue-100 text-blue-600 px-3 py-1 rounded-full">
                  Score: {app.matchScore ?? '--'}
                </span>
              </div>
              <p className="text-sm text-gray-700">
                <b>AI Feedback:</b> {app.matchInsights?.explanation || 'N/A'}
              </p>
              <a
                href={app.resumeUrl}
                target="_blank"
                className="text-blue-600 underline text-sm"
              >
                📄 View Resume
              </a>
              {Array.isArray(app.matchInsights?.tags) && app.matchInsights.tags.length > 0 && (
  <div className="text-sm text-gray-600">
    <b>Tags:</b> {app.matchInsights.tags.join(', ')}
  </div>
)}

            </div>
          ))}
        </div>
      )}
    </div>
  );
}
