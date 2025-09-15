'use client';

import { useEffect, useState } from 'react';
import api from '@/lib/api';

interface Application {
  _id: string;
  name?: string;
  email?: string;
  phone?: string;
  candidate?: {
    _id: string;
    name?: string;
    email?: string;
    phone?: string;
  };
  job?: { title?: string; companyName?: string };
  status: string;
  createdAt: string;
}

export default function TestApplicationsPage() {
  const [applications, setApplications] = useState<Application[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchApplications();
  }, []);

  const fetchApplications = async () => {
    try {
      console.log('🔄 Testing applications fetch...');
      const res = await api.get('/applications');
      const list = Array.isArray(res.data) ? res.data : res.data?.applications || [];
      console.log(`📊 Received ${list.length} applications:`, list);
      setApplications(list);
    } catch (err: any) {
      console.error('Failed to fetch applications:', err);
      setError(err.message || 'Failed to fetch applications');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto p-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Test Applications Data</h1>
        <p className="text-gray-600">Testing applications API endpoint</p>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
          <p className="text-red-800">Error: {error}</p>
        </div>
      )}

      <div className="bg-white rounded-lg shadow-sm border p-6">
        <h2 className="text-lg font-semibold mb-4">Applications ({applications.length})</h2>
        
        {applications.length === 0 ? (
          <p className="text-gray-500">No applications found</p>
        ) : (
          <div className="space-y-4">
            {applications.map((app) => (
              <div key={app._id} className="border border-gray-200 rounded-lg p-4">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <h3 className="font-medium text-gray-900">
                      {app.name || app.candidate?.name || 'Unknown'}
                    </h3>
                    <p className="text-sm text-gray-600">
                      {app.email || app.candidate?.email || 'No email'}
                    </p>
                    <p className="text-sm text-gray-600">
                      {app.phone || app.candidate?.phone || 'No phone'}
                    </p>
                  </div>
                  
                  <div>
                    <p className="text-sm text-gray-600">Job</p>
                    <p className="font-medium">{app.job?.title || 'Unknown'}</p>
                    <p className="text-sm text-gray-600">{app.job?.companyName || 'Unknown'}</p>
                  </div>
                  
                  <div>
                    <p className="text-sm text-gray-600">Status</p>
                    <span className={`inline-block px-2 py-1 rounded-full text-xs font-medium ${
                      app.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                      app.status === 'reviewed' ? 'bg-blue-100 text-blue-800' :
                      app.status === 'shortlisted' ? 'bg-green-100 text-green-800' :
                      app.status === 'rejected' ? 'bg-red-100 text-red-800' :
                      'bg-gray-100 text-gray-800'
                    }`}>
                      {app.status}
                    </span>
                    <p className="text-xs text-gray-500 mt-1">
                      {new Date(app.createdAt).toLocaleDateString()}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
      
      <div className="mt-6">
        <button
          onClick={fetchApplications}
          className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
        >
          Refresh Data
        </button>
      </div>
    </div>
  );
}