'use client';

import { useEffect, useState } from 'react';
import api from '@/lib/api';
import { Application } from '@/types';

export default function AppliedJobsPage() {
  const [applications, setApplications] = useState<Application[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');

  useEffect(() => {
    fetchApplications();
  }, []);

  const fetchApplications = async () => {
    try {
      const res = await api.get('/candidate/applications');
      setApplications(res.data);
    } catch (err: unknown) {
      console.error('Error fetching applications:', err);
    } finally {
      setLoading(false);
    }
  };

  const filteredApplications = applications.filter(app => {
    if (filter === 'all') return true;
    return app.status === filter;
  });

  if (loading) {
    return <div className="p-6">Loading your applications...</div>;
  }

  return (
    <div className="p-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900 mb-2">My Applications</h1>
        <p className="text-gray-600">Track your job applications and their status</p>
      </div>

      {/* Filter Tabs */}
      <div className="mb-6">
        <div className="border-b border-gray-200">
          <nav className="-mb-px flex space-x-8">
            {[
              { key: 'all', label: 'All Applications', count: applications.length },
              { key: 'pending', label: 'Pending', count: applications.filter(a => a.status === 'pending').length },
              { key: 'reviewed', label: 'Reviewed', count: applications.filter(a => a.status === 'reviewed').length },
              { key: 'shortlisted', label: 'Shortlisted', count: applications.filter(a => a.status === 'shortlisted').length },
              { key: 'rejected', label: 'Rejected', count: applications.filter(a => a.status === 'rejected').length },
            ].map((tab) => (
              <button
                key={tab.key}
                onClick={() => setFilter(tab.key)}
                className={`py-2 px-1 border-b-2 font-medium text-sm ${
                  filter === tab.key
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                {tab.label} ({tab.count})
              </button>
            ))}
          </nav>
        </div>
      </div>

      {/* Applications List */}
      {filteredApplications.length === 0 ? (
        <div className="text-center py-12">
          <div className="text-gray-400 text-6xl mb-4">📋</div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            {filter === 'all' ? 'No applications yet' : `No ${filter} applications`}
          </h3>
          <p className="text-gray-500 mb-4">
            {filter === 'all' 
              ? "You haven't applied to any jobs yet. Start exploring opportunities!"
              : `You don't have any ${filter} applications at the moment.`
            }
          </p>
          {filter === 'all' && (
            <a
              href="/candidate/jobs"
              className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
            >
              Browse Jobs
            </a>
          )}
        </div>
      ) : (
        <div className="space-y-4">
          {filteredApplications.map((application) => (
            <ApplicationCard key={application._id} application={application} />
          ))}
        </div>
      )}
    </div>
  );
}

function ApplicationCard({ application }: { application: Application }) {
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'reviewed':
        return 'bg-blue-100 text-blue-800';
      case 'shortlisted':
        return 'bg-green-100 text-green-800';
      case 'rejected':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getMatchScoreColor = (score?: number) => {
    if (!score) return 'bg-gray-100 text-gray-800';
    if (score >= 80) return 'bg-green-100 text-green-800';
    if (score >= 60) return 'bg-yellow-100 text-yellow-800';
    return 'bg-red-100 text-red-800';
  };

  return (
    <div className="bg-white rounded-lg shadow-sm border p-6 hover:shadow-md transition-shadow">
      <div className="flex justify-between items-start mb-4">
        <div className="flex-1">
          <div className="flex items-center space-x-3 mb-2">
            <h3 className="text-lg font-semibold text-gray-900">
              {application.job?.title || 'Job Title Not Available'}
            </h3>
            <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(application.status)}`}>
              {application.status.charAt(0).toUpperCase() + application.status.slice(1)}
            </span>
          </div>
          
          <p className="text-gray-600 mb-2">
            {application.job?.department?.name || 'Department Not Available'}
          </p>
          
          <div className="flex items-center space-x-4 text-sm text-gray-500">
            <span>📧 {application.email}</span>
            <span>📱 {application.phone}</span>
          </div>
        </div>
        
        <div className="text-right">
          {application.matchScore && (
            <div className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${getMatchScoreColor(application.matchScore)}`}>
              🎯 {application.matchScore}% Match
            </div>
          )}
        </div>
      </div>

      {/* AI Insights */}
      {application.matchInsights && (
        <div className="bg-blue-50 rounded-lg p-4 mb-4">
          <h4 className="font-medium text-blue-900 mb-2">🤖 AI Analysis</h4>
          <p className="text-blue-800 text-sm mb-3">
            {application.matchInsights.explanation}
          </p>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {application.matchInsights.matchingSkills && application.matchInsights.matchingSkills.length > 0 && (
              <div>
                <h5 className="font-medium text-green-700 text-sm mb-2">✅ Matching Skills</h5>
                <div className="flex flex-wrap gap-1">
                  {application.matchInsights.matchingSkills.map((skill, index) => (
                    <span key={index} className="bg-green-100 text-green-800 px-2 py-1 rounded text-xs">
                      {skill}
                    </span>
                  ))}
                </div>
              </div>
            )}
            
            {application.matchInsights.missingSkills && application.matchInsights.missingSkills.length > 0 && (
              <div>
                <h5 className="font-medium text-red-700 text-sm mb-2">❌ Skills to Improve</h5>
                <div className="flex flex-wrap gap-1">
                  {application.matchInsights.missingSkills.map((skill, index) => (
                    <span key={index} className="bg-red-100 text-red-800 px-2 py-1 rounded text-xs">
                      {skill}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>
          
          {application.matchInsights.tags && application.matchInsights.tags.length > 0 && (
            <div className="mt-3">
              <h5 className="font-medium text-blue-700 text-sm mb-2">🏷️ Tags</h5>
              <div className="flex flex-wrap gap-1">
                {application.matchInsights.tags.map((tag, index) => (
                  <span key={index} className="bg-blue-100 text-blue-800 px-2 py-1 rounded text-xs">
                    {tag}
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Actions */}
      <div className="flex justify-between items-center pt-4 border-t border-gray-200">
        <div className="text-sm text-gray-500">
          Applied on {new Date().toLocaleDateString()} {/* You might want to add createdAt to the application model */}
        </div>
        
        <div className="flex space-x-2">
          {application.resumeUrl && (
            <a
              href={application.resumeUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center px-3 py-1 border border-gray-300 rounded-md text-sm text-gray-700 hover:bg-gray-50"
            >
              📄 View Resume
            </a>
          )}
          
          <button className="inline-flex items-center px-3 py-1 border border-gray-300 rounded-md text-sm text-gray-700 hover:bg-gray-50">
            💬 Contact HR
          </button>
        </div>
      </div>
    </div>
  );
}
