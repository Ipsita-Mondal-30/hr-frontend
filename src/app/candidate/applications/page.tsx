'use client';

import { useEffect, useState, useCallback } from 'react';
import Link from 'next/link';
import api from '@/lib/api';
import { Application } from '@/types';
import ResumeAnalysisPanel from '@/components/applications/ResumeAnalysisPanel';
import CoverLetterSection from '@/components/applications/CoverLetterSection';
import { hasApplicationAnalysis, toResumeAnalysisData } from '@/lib/applicationAnalysis';

export default function AppliedJobsPage() {
  const [applications, setApplications] = useState<Application[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');
  const [analyzingId, setAnalyzingId] = useState<string | null>(null);

  const updateApplication = (applicationId: string, updates: Partial<Application>) => {
    setApplications((prev) =>
      prev.map((app) => (app._id === applicationId ? { ...app, ...updates } : app))
    );
  };

  const fetchApplications = useCallback(async () => {
    try {
      const res = await api.get<Application[]>('/candidate/applications');
      setApplications(res.data);
    } catch (err: unknown) {
      console.error('Error fetching applications:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchApplications();
  }, [fetchApplications]);

  const runAnalysis = async (applicationId: string) => {
    setAnalyzingId(applicationId);
    try {
      const res = await api.post<{ application: Application }>(
        `/resume-analysis/application/${applicationId}/analyze`,
        {},
        { skipAuthRedirect: true }
      );

      setApplications((prev) =>
        prev.map((app) =>
          app._id === applicationId ? { ...app, ...res.data.application } : app
        )
      );
    } catch (err) {
      console.error('Resume analysis failed:', err);
      alert('Could not run resume analysis. Make sure your resume is uploaded and the backend is running.');
    } finally {
      setAnalyzingId(null);
    }
  };

  const filteredApplications = applications.filter((app) => {
    if (filter === 'all') return true;
    return app.status === filter;
  });

  if (loading) {
    return <div className="p-6">Loading your applications...</div>;
  }

  return (
    <div className="p-6 max-w-5xl mx-auto">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900 mb-2">My Applications</h1>
        <p className="text-gray-600">
          Track applications and get AI-powered feedback on how to improve for each role
        </p>
      </div>

      <div className="mb-6">
        <div className="border-b border-gray-200">
          <nav className="-mb-px flex flex-wrap gap-x-6 gap-y-2">
            {[
              { key: 'all', label: 'All Applications', count: applications.length },
              { key: 'pending', label: 'Pending', count: applications.filter((a) => a.status === 'pending').length },
              { key: 'reviewed', label: 'Reviewed', count: applications.filter((a) => a.status === 'reviewed').length },
              { key: 'shortlisted', label: 'Shortlisted', count: applications.filter((a) => a.status === 'shortlisted').length },
              { key: 'rejected', label: 'Rejected', count: applications.filter((a) => a.status === 'rejected').length },
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

      {filteredApplications.length === 0 ? (
        <div className="text-center py-12">
          <div className="text-gray-400 text-6xl mb-4">📋</div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            {filter === 'all' ? 'No applications yet' : `No ${filter} applications`}
          </h3>
          <p className="text-gray-500 mb-4">
            {filter === 'all'
              ? "You haven't applied to any jobs yet. Start exploring opportunities!"
              : `You don't have any ${filter} applications at the moment.`}
          </p>
          {filter === 'all' && (
            <Link
              href="/candidate/jobs"
              className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
            >
              Browse Jobs
            </Link>
          )}
        </div>
      ) : (
        <div className="space-y-6">
          {filteredApplications.map((application) => (
            <ApplicationCard
              key={application._id}
              application={application}
              isAnalyzing={analyzingId === application._id}
              onAnalyze={() => runAnalysis(application._id)}
              hasDetailedAnalysis={hasApplicationAnalysis(application)}
              onCoverLetterGenerated={(letter) =>
                updateApplication(application._id, { generatedCoverLetter: letter })
              }
            />
          ))}
        </div>
      )}
    </div>
  );
}

function ApplicationCard({
  application,
  isAnalyzing,
  onAnalyze,
  hasDetailedAnalysis,
  onCoverLetterGenerated,
}: {
  application: Application;
  isAnalyzing: boolean;
  onAnalyze: () => void;
  hasDetailedAnalysis: boolean;
  onCoverLetterGenerated: (letter: string) => void;
}) {
  const [expanded, setExpanded] = useState(hasDetailedAnalysis);
  const insights = application.matchInsights;
  const analysisData = toResumeAnalysisData(application);
  const showAnalysis = hasDetailedAnalysis || application.matchScore != null;
  const aiCoverLetter = application.generatedCoverLetter || application.coverLetter;

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

  const score = application.matchScore ?? insights?.matchScore;

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
      <div className="p-6">
        <div className="flex flex-wrap justify-between gap-4 mb-4">
          <div className="flex-1 min-w-[200px]">
            <div className="flex flex-wrap items-center gap-2 mb-2">
              <h3 className="text-lg font-semibold text-gray-900">
                {application.job?.title || 'Job Title Not Available'}
              </h3>
              <span
                className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(application.status)}`}
              >
                {application.status.charAt(0).toUpperCase() + application.status.slice(1)}
              </span>
            </div>
            <p className="text-gray-600 text-sm">
              {application.job?.companyName}
              {application.job?.department?.name ? ` · ${application.job.department.name}` : ''}
            </p>
            {application.createdAt && (
              <p className="text-xs text-gray-500 mt-1">
                Applied {new Date(application.createdAt).toLocaleDateString()}
              </p>
            )}
          </div>

          <div className="flex flex-col items-end gap-2">
            {score != null && (
              <div
                className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-semibold ${getMatchScoreColor(score)}`}
              >
                🎯 {score}% Match
              </div>
            )}
            <button
              type="button"
              onClick={onAnalyze}
              disabled={isAnalyzing}
              className="inline-flex items-center px-3 py-1.5 text-sm font-medium rounded-md bg-indigo-600 text-white hover:bg-indigo-700 disabled:opacity-60"
            >
              {isAnalyzing ? 'Analyzing…' : hasDetailedAnalysis ? 'Refresh analysis' : 'Get improvement feedback'}
            </button>
          </div>
        </div>

        {(insights?.summary || insights?.explanation) && !expanded && (
          <p className="text-gray-700 text-sm mb-4 border-l-4 border-indigo-400 pl-3">
            {insights.summary || insights.explanation}
          </p>
        )}

        <div className="mb-4">
          <CoverLetterSection
            applicationId={application._id}
            jobTitle={application.job?.title}
            companyName={application.job?.companyName}
            coverLetter={aiCoverLetter}
            onGenerated={onCoverLetterGenerated}
          />
        </div>

        {showAnalysis && (
          <button
            type="button"
            onClick={() => setExpanded(!expanded)}
            className="text-sm text-indigo-600 font-medium hover:text-indigo-800 mb-3"
          >
            {expanded ? 'Hide how to improve ▲' : 'See how to improve ▼'}
          </button>
        )}

        {expanded && showAnalysis && (
          <div className="space-y-4 border-t border-gray-100 pt-4">
            <div className="bg-indigo-50 rounded-lg p-4 border border-indigo-100">
              <h4 className="font-semibold text-indigo-900 mb-1">Your resume feedback for this role</h4>
              <p className="text-sm text-indigo-800">
                Review strengths, gaps, and actionable tips below to improve your chances for this application.
              </p>
            </div>

            <ResumeAnalysisPanel data={analysisData} />

            {insights?.tags && insights.tags.length > 0 && (
              <div>
                <h5 className="font-medium text-gray-700 text-sm mb-2">Keywords for this role</h5>
                <div className="flex flex-wrap gap-1">
                  {insights.tags.map((tag, index) => (
                    <span key={index} className="bg-gray-100 text-gray-700 px-2 py-1 rounded text-xs">
                      {tag}
                    </span>
                  ))}
                </div>
              </div>
            )}

            <div className="flex flex-wrap gap-3 pt-2">
              <Link
                href="/candidate/interview-prep"
                className="inline-flex items-center px-4 py-2 bg-purple-600 text-white text-sm rounded-md hover:bg-purple-700"
              >
                🎙️ Practice voice interview
              </Link>
              <Link
                href="/candidate/profile"
                className="inline-flex items-center px-4 py-2 border border-gray-300 text-gray-700 text-sm rounded-md hover:bg-gray-50"
              >
                Update profile
              </Link>
            </div>

            {(application.atsAnalysis?.analyzedAt || insights?.analyzedAt) && (
              <p className="text-xs text-gray-400">
                Analysis generated{' '}
                {new Date(
                  application.atsAnalysis?.analyzedAt || insights!.analyzedAt!
                ).toLocaleString()}
                {application.atsAnalysis?.source || insights?.source
                  ? ` · ${application.atsAnalysis?.source || insights?.source}`
                  : ''}
              </p>
            )}
          </div>
        )}

        {!hasDetailedAnalysis && !isAnalyzing && (
          <p className="text-sm text-gray-500 mt-2">
            Click <strong>Get improvement feedback</strong> to see strengths, weaknesses, and resume tips for this
            job.
          </p>
        )}
      </div>

      <div className="flex flex-wrap justify-between items-center gap-2 px-6 py-3 bg-gray-50 border-t border-gray-100">
        <div className="flex flex-wrap gap-2">
          {application.resumeUrl && (
            <a
              href={application.resumeUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center px-3 py-1 border border-gray-300 rounded-md text-sm text-gray-700 hover:bg-white"
            >
              📄 View resume
            </a>
          )}
        </div>
      </div>
    </div>
  );
}
