'use client';

import { useEffect, useState } from 'react';
import api from '@/lib/api';
import { Job } from '@/types';

type ApplicationLite = {
  _id: string;
  job?: { _id?: string } | null;
};

export default function SavedJobsPage() {
  const [savedJobs, setSavedJobs] = useState<Job[]>([]);
  const [loading, setLoading] = useState(true);
  const [appliedJobs, setAppliedJobs] = useState<string[]>([]);

  useEffect(() => {
    fetchSavedJobs();
    fetchAppliedJobs();
  }, []);

  const fetchSavedJobs = async () => {
    try {
      const res = await api.get<Job[]>('/candidate/saved-jobs');
      setSavedJobs(res.data);
    } catch (err) {
      console.error('Error fetching saved jobs:', err);
    } finally {
      setLoading(false);
    }
  };

  const fetchAppliedJobs = async () => {
    try {
      const res = await api.get<ApplicationLite[]>('/candidate/applications');
      setAppliedJobs((res.data || []).map((app) => app.job?._id).filter(Boolean) as string[]);
    } catch (err) {
      console.error('Error fetching applied jobs:', err);
    }
  };

  const handleRemoveFromSaved = async (jobId: string) => {
    try {
      await api.delete(`/candidate/saved-jobs/${jobId}`);
      setSavedJobs((prev) => prev.filter((job) => job._id !== jobId));
    } catch (err) {
      console.error('Error removing from saved:', err);
    }
  };

  const handleApplyJob = async (jobId: string) => {
    try {
      await api.post('/candidate/apply', { jobId });
      setAppliedJobs((prev) => [...prev, jobId]);
      alert('Application submitted successfully!');
    } catch (err: unknown) {
      console.error('Error applying to job:', err);
      const e = err as { response?: { data?: { error?: string } } };
      const errorMessage = e.response?.data?.error || 'Error submitting application';
      alert(errorMessage);
    }
  };

  if (loading) {
    return <div className="p-6">Loading saved jobs...</div>;
  }

  return (
    <div className="p-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900 mb-2">Saved Jobs</h1>
        <p className="text-gray-600">Jobs that have been saved for later consideration</p>
      </div>

      {savedJobs.length === 0 ? (
        <div className="text-center py-12">
          <div className="text-gray-400 text-6xl mb-4">💾</div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">No saved jobs yet</h3>
          <p className="text-gray-500 mb-4">Save interesting job opportunities to review them later</p>
          <a
            href="/candidate/jobs"
            className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
          >
            Browse Jobs
          </a>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-6">
          {savedJobs.map((job) => (
            <SavedJobCard
              key={job._id}
              job={job}
              isApplied={appliedJobs.includes(job._id)}
              onRemove={() => handleRemoveFromSaved(job._id)}
              onApply={() => handleApplyJob(job._id)}
            />
          ))}
        </div>
      )}
    </div>
  );
}

function SavedJobCard({
  job,
  isApplied,
  onRemove,
  onApply,
}: {
  job: Job;
  isApplied: boolean;
  onRemove: () => void;
  onApply: () => void;
}) {
  return (
    <div className="bg-white rounded-lg shadow-sm border p-6 hover:shadow-md transition-shadow">
      <div className="flex justify-between items-start mb-4">
        <div className="flex items-start space-x-4 flex-1">
          {/* Company Logo Placeholder */}
          <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
            <span className="text-blue-600 font-semibold text-lg">
              {job.companyName?.charAt(0) || 'C'}
            </span>
          </div>

          <div className="flex-1">
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-lg font-semibold text-gray-900">{job.title}</h3>
              <button onClick={onRemove} className="text-red-500 hover:text-red-700 p-1" title="Remove from saved">
                🗑️
              </button>
            </div>

            <p className="text-gray-600 mb-2">{job.companyName}</p>

            <div className="flex items-center space-x-4 text-sm text-gray-500 mb-2">
              <span>📍 {job.location || 'Not specified'}</span>
              <span>💼 {job.experienceRequired || 0} years exp</span>
              {job.remote && <span className="bg-green-100 text-green-800 px-2 py-1 rounded">Remote</span>}
            </div>

            {job.minSalary && job.maxSalary && (
              <p className="text-sm text-gray-600 mb-2">
                💰 ${job.minSalary?.toLocaleString()} - ${job.maxSalary?.toLocaleString()}
              </p>
            )}

            {job.skills && job.skills.length > 0 && (
              <div className="flex flex-wrap gap-2 mb-3">
                {job.skills.slice(0, 5).map((skill, index) => (
                  <span key={index} className="bg-blue-50 text-blue-700 px-2 py-1 rounded text-xs">
                    {skill}
                  </span>
                ))}
                {job.skills.length > 5 && (
                  <span className="text-xs text-gray-500">+{job.skills.length - 5} more</span>
                )}
              </div>
            )}

            <p className="text-gray-700 text-sm line-clamp-2">{job.description}</p>
          </div>
        </div>
      </div>

      <div className="flex justify-between items-center pt-4 border-t border-gray-200">
        <div className="flex items-center space-x-4 text-xs text-gray-500">
          <span>🏢 {job.companySize || 'Size not specified'}</span>
          <span>⭐ 4.2 rating</span>
          <span>📊 Medium difficulty</span>
        </div>

        <div className="flex space-x-2">
          <button
            onClick={onRemove}
            className="px-3 py-1 border border-red-300 text-red-600 rounded-md hover:bg-red-50 text-sm"
          >
            Remove
          </button>

          {isApplied ? (
            <span className="px-4 py-2 bg-green-100 text-green-800 rounded-md text-sm font-medium">✓ Applied</span>
          ) : (
            <button
              onClick={onApply}
              className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 text-sm font-medium"
            >
              Apply Now
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
