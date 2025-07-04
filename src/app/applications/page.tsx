'use client';
import { useEffect, useState } from 'react';
import api from '@/lib/api';
import { Application, Job } from '@/types';

export default function ApplicationsPage() {
  const [applications, setApplications] = useState<Application[]>([]);
  const [jobs, setJobs] = useState<Job[]>([]);
  const [selectedJob, setSelectedJob] = useState<string>('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchJobs = async () => {
      try {
        const res = await api.get('/jobs');
        setJobs(res.data);
      } catch (err) {
        console.error('Error fetching jobs:', err);
      }
    };
    fetchJobs();
  }, []);

  useEffect(() => {
    const fetchApps = async () => {
      try {
        setLoading(true);
        const res = await api.get('/applications', {
          params: selectedJob ? { job: selectedJob } : {},
        });
        setApplications(res.data);
      } catch (err) {
        console.error('Error fetching applications:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchApps();
  }, [selectedJob]);

  return (
    <div className="p-6 space-y-4">
      <h1 className="text-2xl font-semibold">Applications</h1>

      <div className="flex gap-2 items-center">
        <label htmlFor="jobFilter" className="text-sm font-medium">
          Filter by Job:
        </label>
        <select
          id="jobFilter"
          value={selectedJob}
          onChange={(e) => setSelectedJob(e.target.value)}
          className="border p-1 rounded-md text-sm"
        >
          <option value="">All Jobs</option>
          {jobs.map((job) => (
            <option key={job._id} value={job._id}>
              {job.title}
            </option>
          ))}
        </select>
      </div>

      {loading ? (
        <div>Loading applications...</div>
      ) : (
        <div className="grid grid-cols-1 gap-4">
          {applications.map((app) => (
            <ApplicationCard key={app._id} app={app} />
          ))}
        </div>
      )}
    </div>
  );
}

function ApplicationCard({ app }: { app: Application }) {
  const [expanded, setExpanded] = useState(false);

  return (
    <div className="p-4 bg-white rounded-xl shadow-md space-y-2">
      <div className="flex justify-between items-start">
        <div>
          <h2 className="font-semibold">{app.name}</h2>
          <p className="text-sm text-gray-600">{app.email}</p>
          <p className="text-sm text-gray-600">{app.phone}</p>
          <p className="text-sm text-gray-600">Job: {app.job?.title || '—'}</p>
        </div>
        <div className="text-right space-y-1">
          {app.matchScore !== undefined && (
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
          {app.matchInsights && (
            <button
              onClick={() => setExpanded(!expanded)}
              className="text-xs text-gray-500 underline block"
            >
              {expanded ? 'Hide Insights' : 'View Insights'}
            </button>
          )}
        </div>
      </div>

      {expanded && app.matchInsights && (
        <div className="bg-gray-50 p-3 rounded-lg text-sm text-gray-700 space-y-2">
          <p>
            <strong>Explanation:</strong> {app.matchInsights.explanation}
          </p>
          <p>
            <strong>Matching Skills:</strong> {app.matchInsights.matchingSkills.join(', ')}
          </p>
          <p>
            <strong>Missing Skills:</strong> {app.matchInsights.missingSkills.join(', ')}
          </p>
          <p>
            <strong>Tags:</strong> {app.matchInsights.tags.join(', ')}
          </p>
        </div>
      )}
    </div>
  );
}
