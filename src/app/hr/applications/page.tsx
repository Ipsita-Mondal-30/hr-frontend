'use client';

import { useEffect, useState } from 'react';
import api from '@/lib/api';
import Link from 'next/link';

interface Application {
  _id: string;
  name: string;
  email: string;
  phone: string;
  candidate: { 
    _id: string;
    name: string; 
    email: string;
    skills?: string[];
    experience?: string;
  };
  job: { 
    _id: string; 
    title: string;
    companyName: string;
    department: { name: string };
  };
  status: string;
  matchScore?: number;
  resumeUrl: string;
  portfolio?: string;
  applicationData?: {
    linkedIn?: string;
    github?: string;
    expectedSalary?: string;
    whyInterested?: string;
  };
  matchInsights?: {
    explanation: string;
    matchingSkills: string[];
    missingSkills: string[];
    tags: string[];
  };
  createdAt: string;
}

export default function ApplicationsPage() {
  const [applications, setApplications] = useState<Application[]>([]);
  const [jobs, setJobs] = useState<{ _id: string; title: string }[]>([]);
  const [filteredApplications, setFilteredApplications] = useState<Application[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedApplications, setSelectedApplications] = useState<string[]>([]);
  const [messageModal, setMessageModal] = useState<{ isOpen: boolean; applicationId: string | null }>({
    isOpen: false,
    applicationId: null
  });

  // Filters
  const [filters, setFilters] = useState({
    job: '',
    status: '',
    minScore: '',
    skills: '',
    experience: '',
    search: ''
  });

  const [sortBy, setSortBy] = useState('createdAt');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');

  useEffect(() => {
    fetchApplications();
    fetchJobs();
  }, []);

  useEffect(() => {
    applyFiltersAndSort();
  }, [applications, filters, sortBy, sortOrder]);

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

  const applyFiltersAndSort = () => {
    let filtered = applications.filter(app => {
      // Job filter
      if (filters.job && app.job._id !== filters.job) return false;
      
      // Status filter
      if (filters.status && app.status !== filters.status) return false;
      
      // Minimum score filter
      if (filters.minScore && (!app.matchScore || app.matchScore < parseInt(filters.minScore))) return false;
      
      // Skills filter
      if (filters.skills) {
        const skillsToFind = filters.skills.toLowerCase().split(',').map(s => s.trim());
        const candidateSkills = app.candidate?.skills?.map(s => s.toLowerCase()) || [];
        const hasSkills = skillsToFind.some(skill => 
          candidateSkills.some(candidateSkill => candidateSkill.includes(skill))
        );
        if (!hasSkills) return false;
      }
      
      // Experience filter
      if (filters.experience && app.candidate?.experience !== filters.experience) return false;
      
      // Search filter (name, email, job title)
      if (filters.search) {
        const searchTerm = filters.search.toLowerCase();
        const searchableText = `${app.name} ${app.email} ${app.job.title} ${app.job.companyName}`.toLowerCase();
        if (!searchableText.includes(searchTerm)) return false;
      }
      
      return true;
    });

    // Sort applications
    filtered.sort((a, b) => {
      let aValue, bValue;
      
      switch (sortBy) {
        case 'matchScore':
          aValue = a.matchScore || 0;
          bValue = b.matchScore || 0;
          break;
        case 'name':
          aValue = a.name.toLowerCase();
          bValue = b.name.toLowerCase();
          break;
        case 'status':
          aValue = a.status;
          bValue = b.status;
          break;
        case 'createdAt':
        default:
          aValue = new Date(a.createdAt).getTime();
          bValue = new Date(b.createdAt).getTime();
          break;
      }
      
      if (sortOrder === 'asc') {
        return aValue > bValue ? 1 : -1;
      } else {
        return aValue < bValue ? 1 : -1;
      }
    });

    setFilteredApplications(filtered);
  };

  const updateStatus = async (id: string, newStatus: string) => {
    try {
      await api.put(`/applications/${id}/status`, { status: newStatus });
      setApplications(prev => 
        prev.map(app => 
          app._id === id ? { ...app, status: newStatus } : app
        )
      );
      alert(`Status updated to ${newStatus}`);
    } catch (err) {
      console.error('Status update failed', err);
      alert('Failed to update status');
    }
  };

  const bulkUpdateStatus = async (status: string) => {
    if (selectedApplications.length === 0) {
      alert('Please select applications first');
      return;
    }

    try {
      await api.post('/hr/bulk-update-status', {
        applicationIds: selectedApplications,
        status
      });
      
      setApplications(prev => 
        prev.map(app => 
          selectedApplications.includes(app._id) ? { ...app, status } : app
        )
      );
      
      setSelectedApplications([]);
      alert(`${selectedApplications.length} applications updated to ${status}`);
    } catch (err) {
      console.error('Bulk update failed', err);
      alert('Failed to update applications');
    }
  };

  const downloadResume = (resumeUrl: string, candidateName: string) => {
    if (!resumeUrl) {
      alert('No resume available');
      return;
    }
    
    const link = document.createElement('a');
    link.href = resumeUrl;
    link.download = `${candidateName}_Resume.pdf`;
    link.target = '_blank';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const exportApplications = () => {
    const csvContent = [
      ['Name', 'Email', 'Job', 'Status', 'Match Score', 'Applied Date'].join(','),
      ...filteredApplications.map(app => [
        app.name,
        app.email,
        app.job.title,
        app.status,
        app.matchScore || 'N/A',
        new Date(app.createdAt).toLocaleDateString()
      ].join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'applications.csv';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    window.URL.revokeObjectURL(url);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'reviewed': return 'bg-blue-100 text-blue-800';
      case 'shortlisted': return 'bg-green-100 text-green-800';
      case 'rejected': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getScoreColor = (score?: number) => {
    if (!score) return 'bg-gray-100 text-gray-800';
    if (score >= 80) return 'bg-green-100 text-green-800';
    if (score >= 60) return 'bg-yellow-100 text-yellow-800';
    return 'bg-red-100 text-red-800';
  };

  if (loading) {
    return (
      <div className="p-6">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-1/4 mb-6"></div>
          <div className="space-y-4">
            {[1, 2, 3].map(i => (
              <div key={i} className="h-24 bg-gray-200 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6">
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Candidate Management</h1>
          <p className="text-gray-600">Manage job applications and candidates</p>
        </div>
        <div className="flex space-x-2">
          <button
            onClick={exportApplications}
            className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700"
          >
            📊 Export CSV
          </button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <div className="bg-white p-4 rounded-lg shadow-sm border">
          <div className="text-2xl font-bold text-blue-600">{applications.length}</div>
          <div className="text-sm text-gray-600">Total Applications</div>
        </div>
        <div className="bg-white p-4 rounded-lg shadow-sm border">
          <div className="text-2xl font-bold text-yellow-600">
            {applications.filter(a => a.status === 'pending').length}
          </div>
          <div className="text-sm text-gray-600">Pending Review</div>
        </div>
        <div className="bg-white p-4 rounded-lg shadow-sm border">
          <div className="text-2xl font-bold text-green-600">
            {applications.filter(a => a.status === 'shortlisted').length}
          </div>
          <div className="text-sm text-gray-600">Shortlisted</div>
        </div>
        <div className="bg-white p-4 rounded-lg shadow-sm border">
          <div className="text-2xl font-bold text-gray-600">
            {applications.filter(a => a.matchScore && a.matchScore >= 80).length}
          </div>
          <div className="text-sm text-gray-600">High Match (80%+)</div>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white p-4 rounded-lg shadow-sm border mb-6">
        <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-6 gap-4 mb-4">
          <input
            type="text"
            placeholder="Search candidates..."
            value={filters.search}
            onChange={(e) => setFilters(prev => ({ ...prev, search: e.target.value }))}
            className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          
          <select
            value={filters.job}
            onChange={(e) => setFilters(prev => ({ ...prev, job: e.target.value }))}
            className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="">All Jobs</option>
            {jobs.map(job => (
              <option key={job._id} value={job._id}>{job.title}</option>
            ))}
          </select>

          <select
            value={filters.status}
            onChange={(e) => setFilters(prev => ({ ...prev, status: e.target.value }))}
            className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="">All Statuses</option>
            <option value="pending">Pending</option>
            <option value="reviewed">Reviewed</option>
            <option value="shortlisted">Shortlisted</option>
            <option value="rejected">Rejected</option>
          </select>

          <input
            type="number"
            placeholder="Min Score"
            value={filters.minScore}
            onChange={(e) => setFilters(prev => ({ ...prev, minScore: e.target.value }))}
            className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          />

          <input
            type="text"
            placeholder="Skills (comma separated)"
            value={filters.skills}
            onChange={(e) => setFilters(prev => ({ ...prev, skills: e.target.value }))}
            className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          />

          <select
            value={filters.experience}
            onChange={(e) => setFilters(prev => ({ ...prev, experience: e.target.value }))}
            className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="">All Experience</option>
            <option value="0-1">0-1 years</option>
            <option value="1-3">1-3 years</option>
            <option value="3-5">3-5 years</option>
            <option value="5-8">5-8 years</option>
            <option value="8+">8+ years</option>
          </select>
        </div>

        <div className="flex justify-between items-center">
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-2">
              <label className="text-sm font-medium text-gray-700">Sort by:</label>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="px-2 py-1 border border-gray-300 rounded text-sm"
              >
                <option value="createdAt">Date Applied</option>
                <option value="matchScore">Match Score</option>
                <option value="name">Name</option>
                <option value="status">Status</option>
              </select>
              <button
                onClick={() => setSortOrder(prev => prev === 'asc' ? 'desc' : 'asc')}
                className="px-2 py-1 border border-gray-300 rounded text-sm hover:bg-gray-50"
              >
                {sortOrder === 'asc' ? '↑' : '↓'}
              </button>
            </div>
          </div>

          <div className="text-sm text-gray-600">
            Showing {filteredApplications.length} of {applications.length} applications
          </div>
        </div>
      </div>

      {/* Bulk Actions */}
      {selectedApplications.length > 0 && (
        <div className="bg-blue-50 p-4 rounded-lg mb-4">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium text-blue-900">
              {selectedApplications.length} applications selected
            </span>
            <div className="flex space-x-2">
              <button
                onClick={() => bulkUpdateStatus('reviewed')}
                className="px-3 py-1 bg-blue-600 text-white rounded text-sm hover:bg-blue-700"
              >
                Mark as Reviewed
              </button>
              <button
                onClick={() => bulkUpdateStatus('shortlisted')}
                className="px-3 py-1 bg-green-600 text-white rounded text-sm hover:bg-green-700"
              >
                Shortlist
              </button>
              <button
                onClick={() => bulkUpdateStatus('rejected')}
                className="px-3 py-1 bg-red-600 text-white rounded text-sm hover:bg-red-700"
              >
                Reject
              </button>
              <button
                onClick={() => setSelectedApplications([])}
                className="px-3 py-1 bg-gray-300 text-gray-700 rounded text-sm hover:bg-gray-400"
              >
                Clear Selection
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Applications List */}
      {filteredApplications.length === 0 ? (
        <div className="text-center py-12">
          <div className="text-gray-400 text-6xl mb-4">📋</div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">No applications found</h3>
          <p className="text-gray-500">Try adjusting your filters or check back later for new applications.</p>
        </div>
      ) : (
        <div className="bg-white rounded-lg shadow-sm border overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left">
                    <input
                      type="checkbox"
                      checked={selectedApplications.length === filteredApplications.length}
                      onChange={(e) => {
                        if (e.target.checked) {
                          setSelectedApplications(filteredApplications.map(app => app._id));
                        } else {
                          setSelectedApplications([]);
                        }
                      }}
                      className="rounded"
                    />
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Candidate
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Job
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Match Score
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Applied
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredApplications.map((app) => (
                  <ApplicationRow
                    key={app._id}
                    application={app}
                    isSelected={selectedApplications.includes(app._id)}
                    onSelect={(selected) => {
                      if (selected) {
                        setSelectedApplications(prev => [...prev, app._id]);
                      } else {
                        setSelectedApplications(prev => prev.filter(id => id !== app._id));
                      }
                    }}
                    onStatusUpdate={updateStatus}
                    onDownloadResume={downloadResume}
                    onSendMessage={(appId) => setMessageModal({ isOpen: true, applicationId: appId })}
                    getStatusColor={getStatusColor}
                    getScoreColor={getScoreColor}
                  />
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Message Modal */}
      <MessageModal
        isOpen={messageModal.isOpen}
        applicationId={messageModal.applicationId}
        onClose={() => setMessageModal({ isOpen: false, applicationId: null })}
        applications={applications}
      />
    </div>
  );
}

// Application Row Component
function ApplicationRow({ 
  application, 
  isSelected, 
  onSelect, 
  onStatusUpdate, 
  onDownloadResume, 
  onSendMessage,
  getStatusColor,
  getScoreColor 
}: any) {
  return (
    <tr className={isSelected ? 'bg-blue-50' : 'hover:bg-gray-50'}>
      <td className="px-6 py-4 whitespace-nowrap">
        <input
          type="checkbox"
          checked={isSelected}
          onChange={(e) => onSelect(e.target.checked)}
          className="rounded"
        />
      </td>
      <td className="px-6 py-4 whitespace-nowrap">
        <div className="flex items-center">
          <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
            <span className="text-blue-600 font-semibold text-sm">
              {application.name.charAt(0).toUpperCase()}
            </span>
          </div>
          <div className="ml-4">
            <div className="text-sm font-medium text-gray-900">{application.name}</div>
            <div className="text-sm text-gray-500">{application.email}</div>
            {application.candidate?.skills && (
              <div className="flex flex-wrap gap-1 mt-1">
                {application.candidate.skills.slice(0, 3).map((skill: string, index: number) => (
                  <span key={index} className="bg-gray-100 text-gray-700 px-2 py-1 rounded text-xs">
                    {skill}
                  </span>
                ))}
                {application.candidate.skills.length > 3 && (
                  <span className="text-xs text-gray-500">+{application.candidate.skills.length - 3}</span>
                )}
              </div>
            )}
          </div>
        </div>
      </td>
      <td className="px-6 py-4 whitespace-nowrap">
        <div className="text-sm font-medium text-gray-900">{application.job.title}</div>
        <div className="text-sm text-gray-500">{application.job.companyName}</div>
        <div className="text-xs text-gray-400">{application.job.department?.name}</div>
      </td>
      <td className="px-6 py-4 whitespace-nowrap">
        <select
          value={application.status}
          onChange={(e) => onStatusUpdate(application._id, e.target.value)}
          className={`px-2 py-1 rounded-full text-xs font-medium border-0 ${getStatusColor(application.status)}`}
        >
          <option value="pending">Pending</option>
          <option value="reviewed">Reviewed</option>
          <option value="shortlisted">Shortlisted</option>
          <option value="rejected">Rejected</option>
        </select>
      </td>
      <td className="px-6 py-4 whitespace-nowrap">
        {application.matchScore ? (
          <span className={`px-2 py-1 rounded-full text-xs font-medium ${getScoreColor(application.matchScore)}`}>
            {application.matchScore}%
          </span>
        ) : (
          <span className="text-gray-400 text-sm">N/A</span>
        )}
      </td>
      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
        {new Date(application.createdAt).toLocaleDateString()}
      </td>
      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
        <div className="flex space-x-2">
          <Link
            href={`/hr/applications/${application._id}`}
            className="text-blue-600 hover:text-blue-900"
          >
            View
          </Link>
          <button
            onClick={() => onDownloadResume(application.resumeUrl, application.name)}
            className="text-green-600 hover:text-green-900"
          >
            Resume
          </button>
          <button
            onClick={() => onSendMessage(application._id)}
            className="text-purple-600 hover:text-purple-900"
          >
            Message
          </button>
        </div>
      </td>
    </tr>
  );
}

// Message Modal Component
function MessageModal({ isOpen, applicationId, onClose, applications }: any) {
  const [message, setMessage] = useState('');
  const [subject, setSubject] = useState('');
  const [sending, setSending] = useState(false);

  const application = applications.find((app: any) => app._id === applicationId);

  const sendMessage = async () => {
    if (!subject.trim() || !message.trim()) {
      alert('Please fill in both subject and message');
      return;
    }

    setSending(true);
    try {
      await api.post('/hr/send-message', {
        applicationId,
        subject,
        message,
        recipientEmail: application?.email
      });
      
      alert('Message sent successfully!');
      setMessage('');
      setSubject('');
      onClose();
    } catch (err) {
      console.error('Failed to send message:', err);
      alert('Failed to send message');
    } finally {
      setSending(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-md">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-semibold">Send Message</h3>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600">✕</button>
        </div>

        {application && (
          <div className="mb-4 p-3 bg-gray-50 rounded">
            <p className="text-sm"><strong>To:</strong> {application.name}</p>
            <p className="text-sm"><strong>Email:</strong> {application.email}</p>
            <p className="text-sm"><strong>Job:</strong> {application.job.title}</p>
          </div>
        )}

        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Subject</label>
            <input
              type="text"
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
              placeholder="Interview invitation, Update on your application..."
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Message</label>
            <textarea
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              rows={6}
              placeholder="Write your message here..."
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div className="flex justify-end space-x-3">
            <button
              onClick={onClose}
              className="px-4 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50"
            >
              Cancel
            </button>
            <button
              onClick={sendMessage}
              disabled={sending}
              className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:bg-blue-400"
            >
              {sending ? 'Sending...' : 'Send Message'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
