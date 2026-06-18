'use client';
import { useState, useEffect } from 'react';
import api from '@/lib/api';

interface Application {
  _id: string;
  jobTitle: string;
  companyName: string;
  location?: string | null;
  employmentType?: string | null;
  matchScore?: number | null;
  status: string;
  appliedAt: string;
  hrNotes?: string;
}

interface SavedJob {
  _id: string;
  title: string;
  company: string;
  savedAt: string;
}

interface Candidate {
  _id: string;
  name: string;
  email: string;
  phone?: string;
  location?: string;
  skills?: string[];
  experience?: string;
  createdAt: string;
  lastActive?: string;
  applications: Application[];
  savedJobs: SavedJob[];
  profileCompletion: number;
}

export default function ViewCandidatesPage() {
  const [candidates, setCandidates] = useState<Candidate[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedCandidate, setSelectedCandidate] = useState<Candidate | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterBy, setFilterBy] = useState('all');

  useEffect(() => {
    fetchCandidates();
    
    // Set up auto-refresh every 30 seconds to prevent stale data
    const interval = setInterval(fetchCandidates, 30000);
    return () => clearInterval(interval);
  }, []);

  const fetchCandidates = async () => {
    try {
      console.log('🔄 Fetching candidates for admin view...');
      const response = await api.get('/admin/candidates');
      const data = response.data || [];
      console.log(`📊 Received ${data.length} candidates`);
      setCandidates(data);
    } catch (error) {
      console.error('Error fetching candidates:', error);
    } finally {
      setLoading(false);
    }
  };

  const deleteCandidate = async (candidateId: string, candidateName: string) => {
    if (!confirm(`Are you sure you want to delete ${candidateName}? This will also delete all their applications and related data. This action cannot be undone.`)) {
      return;
    }

    try {
      console.log(`🗑️ Deleting candidate: ${candidateId}`);
      await api.delete(`/admin/users/${candidateId}`);
      
      // Remove from local state
      setCandidates(prev => prev.filter(candidate => candidate._id !== candidateId));
      
      // Close modal if this candidate was selected
      if (selectedCandidate?._id === candidateId) {
        setSelectedCandidate(null);
      }
      
      alert(`${candidateName} has been deleted successfully.`);
      console.log(`✅ Successfully deleted candidate: ${candidateName}`);
    } catch (error) {
      console.error('Error deleting candidate:', error);
      alert('Failed to delete candidate. Please try again.');
    }
  };

  const getStatusBadgeClass = (status: string) => {
    switch (status) {
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'reviewed':
        return 'bg-blue-100 text-blue-800';
      case 'shortlisted':
        return 'bg-purple-100 text-purple-800';
      case 'hire_recommended':
        return 'bg-orange-100 text-orange-800';
      case 'hired':
      case 'accepted':
        return 'bg-green-100 text-green-800';
      case 'rejected':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const formatStatus = (status: string) => status.replace(/_/g, ' ');

  const filteredCandidates = candidates.filter((candidate) => {
    const matchesSearch = candidate.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         candidate.email.toLowerCase().includes(searchTerm.toLowerCase());
    
    if (filterBy === 'active') {
      const lastActive = new Date(candidate.lastActive || candidate.createdAt);
      const daysSinceActive = (Date.now() - lastActive.getTime()) / (1000 * 60 * 60 * 24);
      return matchesSearch && daysSinceActive <= 7;
    }
    if (filterBy === 'applied') {
      return matchesSearch && candidate.applications.length > 0;
    }
    if (filterBy === 'saved') {
      return matchesSearch && candidate.savedJobs.length > 0;
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
        <h1 className="text-2xl font-bold text-gray-900">View Candidates</h1>
        <div className="flex items-center gap-4">
          <button
            onClick={() => {
              setLoading(true);
              fetchCandidates();
            }}
            className="px-3 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 text-sm"
            disabled={loading}
          >
            {loading ? '🔄 Refreshing...' : '🔄 Refresh'}
          </button>
          <div className="text-sm text-gray-600">
            Total: {candidates.length} candidates
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="flex gap-4 items-center">
        <input
          type="text"
          placeholder="Search candidates..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        />
        <select
          value={filterBy}
          onChange={(e) => setFilterBy(e.target.value)}
          className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
        >
          <option value="all">All Candidates</option>
          <option value="active">Recently Active</option>
          <option value="applied">Has Applications</option>
          <option value="saved">Has Saved Jobs</option>
        </select>
      </div>

      {/* Candidates Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {filteredCandidates.map((candidate) => (
          <div key={candidate._id} className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="flex justify-between items-start mb-4">
              <div>
                <h3 className="text-lg font-semibold text-gray-900">{candidate.name}</h3>
                <p className="text-gray-600">{candidate.email}</p>
                {candidate.phone && (
                  <p className="text-sm text-gray-500">{candidate.phone}</p>
                )}
              </div>
              <div className="flex gap-2">
                <button
                  onClick={() => setSelectedCandidate(candidate)}
                  className="px-3 py-1 bg-blue-100 text-blue-700 rounded-md text-sm hover:bg-blue-200"
                >
                  View Details
                </button>
                <button
                  onClick={() => deleteCandidate(candidate._id, candidate.name)}
                  className="px-3 py-1 bg-red-100 text-red-700 rounded-md text-sm hover:bg-red-200"
                  title="Delete candidate"
                >
                  🗑️
                </button>
              </div>
            </div>

            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Profile Completion</span>
                <div className="flex items-center gap-2">
                  <div className="w-20 bg-gray-200 rounded-full h-2">
                    <div 
                      className="bg-green-500 h-2 rounded-full" 
                      style={{ width: `${candidate.profileCompletion}%` }}
                    ></div>
                  </div>
                  <span className="text-sm text-gray-600">{candidate.profileCompletion}%</span>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="text-gray-600">Applications:</span>
                  <span className="ml-2 font-medium text-blue-600">{candidate.applications.length}</span>
                </div>
                <div>
                  <span className="text-gray-600">Saved Jobs:</span>
                  <span className="ml-2 font-medium text-green-600">{candidate.savedJobs.length}</span>
                </div>
              </div>

              {candidate.skills && candidate.skills.length > 0 && (
                <div>
                  <span className="text-sm text-gray-600">Skills:</span>
                  <div className="flex flex-wrap gap-1 mt-1">
                    {candidate.skills.slice(0, 3).map((skill, index) => (
                      <span key={index} className="px-2 py-1 bg-gray-100 text-gray-700 rounded text-xs">
                        {skill}
                      </span>
                    ))}
                    {candidate.skills.length > 3 && (
                      <span className="px-2 py-1 bg-gray-100 text-gray-700 rounded text-xs">
                        +{candidate.skills.length - 3} more
                      </span>
                    )}
                  </div>
                </div>
              )}

              <div className="text-xs text-gray-500">
                Joined: {new Date(candidate.createdAt).toLocaleDateString()}
                {candidate.lastActive && (
                  <span className="ml-3">
                    Last active: {new Date(candidate.lastActive).toLocaleDateString()}
                  </span>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Candidate Detail Modal */}
      {selectedCandidate && (
        <div className="fixed inset-0 bg-black/50 flex items-end sm:items-center justify-center p-0 sm:p-4 z-[60]">
          <div className="bg-white rounded-t-2xl sm:rounded-lg max-w-4xl w-full max-h-[92vh] sm:max-h-[90vh] overflow-y-auto shadow-xl">
            <div className="p-4 sm:p-6 border-b border-gray-200 sticky top-0 bg-white z-10">
              <div className="flex justify-between items-center gap-3">
                <h2 className="text-lg sm:text-xl font-bold text-gray-900 truncate">{selectedCandidate.name}</h2>
                <button
                  type="button"
                  onClick={() => setSelectedCandidate(null)}
                  className="text-gray-400 hover:text-gray-600 text-xl shrink-0 p-1"
                  aria-label="Close"
                >
                  ✕
                </button>
              </div>
            </div>

            <div className="p-4 sm:p-6 space-y-6">
              <div>
                <h3 className="text-lg font-semibold mb-3">Basic Information</h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm text-gray-600">Email</label>
                    <p className="font-medium break-all">{selectedCandidate.email}</p>
                  </div>
                  <div>
                    <label className="text-sm text-gray-600">Phone</label>
                    <p className="font-medium">{selectedCandidate.phone || 'Not provided'}</p>
                  </div>
                  <div>
                    <label className="text-sm text-gray-600">Location</label>
                    <p className="font-medium">{selectedCandidate.location || 'Not provided'}</p>
                  </div>
                  <div>
                    <label className="text-sm text-gray-600">Experience</label>
                    <p className="font-medium">{selectedCandidate.experience || 'Not provided'}</p>
                  </div>
                </div>
                {selectedCandidate.skills && selectedCandidate.skills.length > 0 && (
                  <div className="mt-4">
                    <label className="text-sm text-gray-600">Skills</label>
                    <div className="flex flex-wrap gap-1 mt-1">
                      {selectedCandidate.skills.map((skill, index) => (
                        <span key={index} className="px-2 py-1 bg-gray-100 text-gray-700 rounded text-xs">
                          {skill}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              <div>
                <h3 className="text-lg font-semibold mb-3">Applications ({selectedCandidate.applications.length})</h3>
                {selectedCandidate.applications.length > 0 ? (
                  <div className="space-y-3">
                    {selectedCandidate.applications.map((app) => (
                      <div key={app._id} className="border border-gray-200 rounded-lg p-4">
                        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-3">
                          <div className="min-w-0 flex-1">
                            <h4 className="font-medium text-gray-900">{app.jobTitle}</h4>
                            <p className="text-gray-700 font-medium">{app.companyName}</p>
                            {(app.location || app.employmentType) && (
                              <p className="text-sm text-gray-500 mt-1">
                                {[app.location, app.employmentType?.replace('-', ' ')].filter(Boolean).join(' · ')}
                              </p>
                            )}
                            {app.matchScore != null && (
                              <p className="text-sm text-blue-600 mt-1">Match score: {app.matchScore}%</p>
                            )}
                            {app.hrNotes && (
                              <p className="text-sm text-gray-600 mt-2 bg-gray-50 p-2 rounded">HR notes: {app.hrNotes}</p>
                            )}
                            <a
                              href={`/admin/applications/${app._id}`}
                              className="inline-block mt-2 text-sm text-indigo-600 hover:underline"
                            >
                              View full application →
                            </a>
                          </div>
                          <div className="text-left sm:text-right shrink-0">
                            <span className={`inline-block px-2 py-1 rounded text-xs capitalize ${getStatusBadgeClass(app.status)}`}>
                              {formatStatus(app.status)}
                            </span>
                            <p className="text-xs text-gray-500 mt-1">
                              {new Date(app.appliedAt).toLocaleDateString()}
                            </p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-gray-500">No applications yet</p>
                )}
              </div>

              {/* Saved Jobs */}
              <div>
                <h3 className="text-lg font-semibold mb-3">Saved Jobs ({selectedCandidate.savedJobs.length})</h3>
                {selectedCandidate.savedJobs.length > 0 ? (
                  <div className="space-y-3">
                    {selectedCandidate.savedJobs.map((job) => (
                      <div key={job._id} className="border border-gray-200 rounded-lg p-4">
                        <div className="flex justify-between items-start">
                          <div>
                            <h4 className="font-medium">{job.title}</h4>
                            <p className="text-gray-600">{job.company}</p>
                          </div>
                          <p className="text-xs text-gray-500">
                            Saved: {new Date(job.savedAt).toLocaleDateString()}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-gray-500">No saved jobs</p>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}