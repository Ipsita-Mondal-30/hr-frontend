'use client';
import { useState, useEffect } from 'react';
import api from '@/lib/api';

interface Job {
  _id: string;
  title: string;
  status: string;
  applicationsCount: number;
  createdAt: string;
}

interface Interview {
  _id: string;
  candidateName: string;
  jobTitle: string;
  scheduledAt: string;
  status: string;
}

interface HRUser {
  _id: string;
  name: string;
  email: string;
  phone?: string;
  companyName?: string;
  department?: string;
  position?: string;
  isVerified: boolean;
  createdAt: string;
  lastActive?: string;
  jobs: Job[];
  interviews: Interview[];
  totalApplicationsReceived: number;
}

export default function ViewHRUsersPage() {
  const [hrUsers, setHrUsers] = useState<HRUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedHR, setSelectedHR] = useState<HRUser | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterBy, setFilterBy] = useState('all');

  useEffect(() => {
    fetchHRUsers();
  }, []);

  const fetchHRUsers = async () => {
    try {
      console.log('🔄 Fetching HR users for admin view...');
      const response = await api.get('/admin/hr-users');
      const data = response.data || [];
      console.log(`📊 Received ${data.length} HR users`);
      setHrUsers(data);
    } catch (error) {
      console.error('Error fetching HR users:', error);
    } finally {
      setLoading(false);
    }
  };

  const filteredHRUsers = hrUsers.filter(hr => {
    const matchesSearch = hr.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         hr.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         (hr.companyName && hr.companyName.toLowerCase().includes(searchTerm.toLowerCase()));
    
    if (filterBy === 'verified') {
      return matchesSearch && hr.isVerified;
    }
    if (filterBy === 'unverified') {
      return matchesSearch && !hr.isVerified;
    }
    if (filterBy === 'active') {
      return matchesSearch && hr.jobs.length > 0;
    }
    
    return matchesSearch;
  });

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-900">View HR Users</h1>
        <div className="text-sm text-gray-600">
          Total: {hrUsers.length} HR users ({hrUsers.filter(hr => hr.isVerified).length} verified)
        </div>
      </div>

      {/* Filters */}
      <div className="flex gap-4 items-center">
        <input
          type="text"
          placeholder="Search HR users..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        />
        <select
          value={filterBy}
          onChange={(e) => setFilterBy(e.target.value)}
          className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
        >
          <option value="all">All HR Users</option>
          <option value="verified">Verified Only</option>
          <option value="unverified">Unverified Only</option>
          <option value="active">Active (Has Jobs)</option>
        </select>
      </div>

      {/* HR Users Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {filteredHRUsers.map((hr) => (
          <div key={hr._id} className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="flex justify-between items-start mb-4">
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="text-lg font-semibold text-gray-900">{hr.name}</h3>
                  {hr.isVerified ? (
                    <span className="px-2 py-1 bg-green-100 text-green-800 rounded text-xs">Verified</span>
                  ) : (
                    <span className="px-2 py-1 bg-yellow-100 text-yellow-800 rounded text-xs">Pending</span>
                  )}
                </div>
                <p className="text-gray-600">{hr.email}</p>
                {hr.companyName && (
                  <p className="text-sm text-gray-500">{hr.companyName}</p>
                )}
              </div>
              <button
                onClick={() => setSelectedHR(hr)}
                className="px-3 py-1 bg-blue-100 text-blue-700 rounded-md text-sm hover:bg-blue-200"
              >
                View Details
              </button>
            </div>

            <div className="space-y-3">
              <div className="grid grid-cols-3 gap-4 text-sm">
                <div>
                  <span className="text-gray-600">Jobs Posted:</span>
                  <span className="ml-2 font-medium text-blue-600">{hr.jobs.length}</span>
                </div>
                <div>
                  <span className="text-gray-600">Interviews:</span>
                  <span className="ml-2 font-medium text-purple-600">{hr.interviews.length}</span>
                </div>
                <div>
                  <span className="text-gray-600">Applications:</span>
                  <span className="ml-2 font-medium text-green-600">{hr.totalApplicationsReceived}</span>
                </div>
              </div>

              {hr.department && (
                <div className="text-sm">
                  <span className="text-gray-600">Department:</span>
                  <span className="ml-2 font-medium">{hr.department}</span>
                </div>
              )}

              {hr.position && (
                <div className="text-sm">
                  <span className="text-gray-600">Position:</span>
                  <span className="ml-2 font-medium">{hr.position}</span>
                </div>
              )}

              <div className="text-xs text-gray-500">
                Joined: {new Date(hr.createdAt).toLocaleDateString()}
                {hr.lastActive && (
                  <span className="ml-3">
                    Last active: {new Date(hr.lastActive).toLocaleDateString()}
                  </span>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* HR Detail Modal */}
      {selectedHR && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-gray-200">
              <div className="flex justify-between items-center">
                <div className="flex items-center gap-3">
                  <h2 className="text-xl font-bold text-gray-900">{selectedHR.name}</h2>
                  {selectedHR.isVerified ? (
                    <span className="px-3 py-1 bg-green-100 text-green-800 rounded-full text-sm">Verified</span>
                  ) : (
                    <span className="px-3 py-1 bg-yellow-100 text-yellow-800 rounded-full text-sm">Pending Verification</span>
                  )}
                </div>
                <button
                  onClick={() => setSelectedHR(null)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  ✕
                </button>
              </div>
            </div>

            <div className="p-6 space-y-6">
              {/* Basic Info */}
              <div>
                <h3 className="text-lg font-semibold mb-3">Basic Information</h3>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm text-gray-600">Email</label>
                    <p className="font-medium">{selectedHR.email}</p>
                  </div>
                  <div>
                    <label className="text-sm text-gray-600">Phone</label>
                    <p className="font-medium">{selectedHR.phone || 'Not provided'}</p>
                  </div>
                  <div>
                    <label className="text-sm text-gray-600">Company</label>
                    <p className="font-medium">{selectedHR.companyName || 'Not provided'}</p>
                  </div>
                  <div>
                    <label className="text-sm text-gray-600">Department</label>
                    <p className="font-medium">{selectedHR.department || 'Not provided'}</p>
                  </div>
                </div>
              </div>

              {/* Jobs Posted */}
              <div>
                <h3 className="text-lg font-semibold mb-3">Jobs Posted ({selectedHR.jobs.length})</h3>
                {selectedHR.jobs.length > 0 ? (
                  <div className="space-y-3">
                    {selectedHR.jobs.map((job) => (
                      <div key={job._id} className="border border-gray-200 rounded-lg p-4">
                        <div className="flex justify-between items-start">
                          <div>
                            <h4 className="font-medium">{job.title}</h4>
                            <p className="text-sm text-gray-600">{job.applicationsCount} applications</p>
                          </div>
                          <div className="text-right">
                            <span className={`px-2 py-1 rounded text-xs ${
                              job.status === 'active' ? 'bg-green-100 text-green-800' :
                              job.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                              'bg-gray-100 text-gray-800'
                            }`}>
                              {job.status}
                            </span>
                            <p className="text-xs text-gray-500 mt-1">
                              {new Date(job.createdAt).toLocaleDateString()}
                            </p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-gray-500">No jobs posted yet</p>
                )}
              </div>

              {/* Interviews Scheduled */}
              <div>
                <h3 className="text-lg font-semibold mb-3">Interviews Scheduled ({selectedHR.interviews.length})</h3>
                {selectedHR.interviews.length > 0 ? (
                  <div className="space-y-3">
                    {selectedHR.interviews.map((interview) => (
                      <div key={interview._id} className="border border-gray-200 rounded-lg p-4">
                        <div className="flex justify-between items-start">
                          <div>
                            <h4 className="font-medium">{interview.candidateName}</h4>
                            <p className="text-gray-600">{interview.jobTitle}</p>
                          </div>
                          <div className="text-right">
                            <span className={`px-2 py-1 rounded text-xs ${
                              interview.status === 'scheduled' ? 'bg-blue-100 text-blue-800' :
                              interview.status === 'completed' ? 'bg-green-100 text-green-800' :
                              'bg-gray-100 text-gray-800'
                            }`}>
                              {interview.status}
                            </span>
                            <p className="text-xs text-gray-500 mt-1">
                              {new Date(interview.scheduledAt).toLocaleDateString()}
                            </p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-gray-500">No interviews scheduled</p>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}