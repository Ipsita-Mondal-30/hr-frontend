'use client';
import { useEffect, useState, useCallback } from 'react';
import Link from 'next/link';
import api from '@/lib/api';
import JobApplicationModal from '@/components/JobApplicationModal';
import { Job } from '../../../types/index'

interface CandidateApplication {
  job?: { _id?: string };
}

export default function JobsPage() {
  const [jobs, setJobs] = useState<Job[]>([]);
  const [filteredJobs, setFilteredJobs] = useState<Job[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedJob, setSelectedJob] = useState<Job | null>(null);
  const [showApplicationModal, setShowApplicationModal] = useState(false);
  const [savedJobIds, setSavedJobIds] = useState<Set<string>>(new Set());
  const [appliedJobIds, setAppliedJobIds] = useState<Set<string>>(new Set());

  // Filters
  const [filters, setFilters] = useState({
    search: '',
    location: '',
    employmentType: '',
    remote: '',
    minSalary: '',
    skills: '',
  });

  useEffect(() => {
    fetchJobs();
    fetchSavedJobs();
    fetchAppliedJobs();
  }, []);

  const fetchAppliedJobs = async () => {
    try {
      const res = await api.get<CandidateApplication[]>('/candidate/applications');
      const appliedJobIdsList = (res.data || [])
        .map((app) => app.job?._id)
        .filter(Boolean) as string[];
      setAppliedJobIds(new Set(appliedJobIdsList));
      console.log('📋 Applied jobs:', appliedJobIdsList);
    } catch (err) {
      console.error('Error fetching applied jobs:', err);
    }
  };

  // Debug: Log when jobs change
  useEffect(() => {
    console.log('🔍 Jobs state updated:', {
      totalJobs: jobs.length,
      filteredJobs: filteredJobs.length,
      jobs: jobs.map(j => ({ id: j._id, title: j.title, status: j.status, isApproved: j.isApproved }))
    });
  }, [jobs, filteredJobs]);

  const applyFilters = useCallback(() => {
    const filtered = jobs.filter((job) => {
      // Search filter
      if (filters.search) {
        const searchTerm = filters.search.toLowerCase();
        const searchableText = `${job.title} ${job.companyName} ${job.description}`.toLowerCase();
        if (!searchableText.includes(searchTerm)) return false;
      }
      // Location filter
      if (filters.location && job.location && !job.location.toLowerCase().includes(filters.location.toLowerCase())) {
        return false;
      }
      // Employment type filter
      if (filters.employmentType && job.employmentType !== filters.employmentType) {
        return false;
      }
      // Remote filter
      if (filters.remote) {
        if (filters.remote === 'remote' && !job.remote) return false;
        if (filters.remote === 'onsite' && job.remote) return false;
      }
      // Salary filter
      if (filters.minSalary && job.minSalary && job.minSalary < parseInt(filters.minSalary)) {
        return false;
      }
      // Skills filter
      if (filters.skills && job.skills) {
        const requiredSkills = filters.skills.toLowerCase().split(',').map((s) => s.trim());
        const jobSkills = job.skills.map((s) => s.toLowerCase());
        const hasSkills = requiredSkills.some((skill) => jobSkills.some((jobSkill) => jobSkill.includes(skill)));
        if (!hasSkills) return false;
      }
      return true;
    });
    setFilteredJobs(filtered);
  }, [jobs, filters]);

  useEffect(() => {
    applyFilters();
  }, [jobs, filters, applyFilters]);

  const fetchJobs = async () => {
    try {
      console.log('🔍 Fetching jobs for candidates...');
      const res = await api.get<Job[]>('/jobs');
      const jobsData = res.data || [];
      console.log(`📊 Found ${jobsData.length} jobs from API`);
      console.log('📋 Jobs data:', jobsData.map(j => ({ 
        id: j._id, 
        title: j.title, 
        company: j.companyName,
        status: j.status,
        isApproved: j.isApproved 
      })));
      
      if (jobsData.length === 0) {
        console.warn('⚠️ No jobs returned from API');
      }
      
      setJobs(jobsData);
    } catch (err) {
      console.error('❌ Error fetching jobs:', err);
      if (err instanceof Error) {
        console.error('Error message:', err.message);
      }
      setJobs([]);
    } finally {
      setLoading(false);
    }
  };

  const fetchSavedJobs = async () => {
    try {
      const res = await api.get<Job[]>('/candidate/saved-jobs');
      const savedJobs = res.data || [];
      const savedIds = new Set(savedJobs.map((job) => job._id));
      setSavedJobIds(savedIds);
      console.log(`💾 Found ${savedJobs.length} saved jobs`);
    } catch (err) {
      console.error('Error fetching saved jobs:', err);
    }
  };

  const handleSaveJob = async (jobId: string) => {
    try {
      if (savedJobIds.has(jobId)) {
        // Remove from saved
        await api.delete(`/candidate/saved-jobs/${jobId}`);
        setSavedJobIds((prev) => {
          const newSet = new Set(prev);
          newSet.delete(jobId);
          return newSet;
        });
        console.log('💾 Job removed from saved');
      } else {
        // Add to saved
        await api.post('/candidate/save-job', { jobId });
        setSavedJobIds((prev) => new Set([...prev, jobId]));
        console.log('💾 Job saved successfully');
      }
    } catch (err) {
      console.error('Error saving/unsaving job:', err);
    }
  };

  const handleApply = (job: Job) => {
    setSelectedJob(job);
    setShowApplicationModal(true);
  };

  const handleApplicationSuccess = () => {
    console.log('✅ Application submitted successfully');
    setShowApplicationModal(false);
    if (selectedJob) {
      setAppliedJobIds(prev => new Set([...prev, selectedJob._id]));
    }
    setSelectedJob(null);
    // Refresh saved jobs to update counts
    fetchSavedJobs();
    fetchAppliedJobs(); // Refresh applied jobs list
  };

  if (loading) {
    return (
      <div className="p-6">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-1/4 mb-6"></div>
          <div className="space-y-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-32 bg-gray-200 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900 mb-2">Browse Jobs</h1>
        <p className="text-gray-600">Find your next opportunity from {jobs.length} available positions</p>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-lg shadow-sm border p-6 mb-6">
        <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-6 gap-4">
          <input
            type="text"
            placeholder="Search jobs..."
            value={filters.search}
            onChange={(e) => setFilters((prev) => ({ ...prev, search: e.target.value }))}
            className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <input
            type="text"
            placeholder="Location"
            value={filters.location}
            onChange={(e) => setFilters((prev) => ({ ...prev, location: e.target.value }))}
            className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <select
            value={filters.employmentType}
            onChange={(e) => setFilters((prev) => ({ ...prev, employmentType: e.target.value }))}
            className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="">All Types</option>
            <option value="full-time">Full Time</option>
            <option value="part-time">Part Time</option>
            <option value="internship">Internship</option>
          </select>
          <select
            value={filters.remote}
            onChange={(e) => setFilters((prev) => ({ ...prev, remote: e.target.value }))}
            className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="">Remote/Onsite</option>
            <option value="remote">Remote</option>
            <option value="onsite">Onsite</option>
          </select>
          <input
            type="number"
            placeholder="Min Salary"
            value={filters.minSalary}
            onChange={(e) => setFilters((prev) => ({ ...prev, minSalary: e.target.value }))}
            className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <input
            type="text"
            placeholder="Skills (comma separated)"
            value={filters.skills}
            onChange={(e) => setFilters((prev) => ({ ...prev, skills: e.target.value }))}
            className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
        <div className="mt-4 flex justify-between items-center">
          <button
            onClick={() =>
              setFilters({
                search: '',
                location: '',
                employmentType: '',
                remote: '',
                minSalary: '',
                skills: '',
              })
            }
            className="px-4 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50"
          >
            Clear Filters
          </button>
          <span className="text-sm text-gray-600">
            Showing {filteredJobs.length} of {jobs.length} jobs
          </span>
        </div>
      </div>

      {/* Jobs List */}
      {jobs.length === 0 ? (
        <div className="text-center py-12 bg-white rounded-lg border border-dashed border-gray-300">
          <div className="text-gray-400 text-6xl mb-4">💼</div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">No open positions yet</h3>
          <p className="text-gray-500 max-w-md mx-auto">
            HR teams are posting roles — check back soon. New jobs appear here once verified HR users publish them.
          </p>
        </div>
      ) : filteredJobs.length === 0 ? (
        <div className="text-center py-12">
          <div className="text-gray-400 text-6xl mb-4">🔍</div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">No jobs match your filters</h3>
          <p className="text-gray-500">
            Try adjusting your search criteria or clear filters to see all {jobs.length} available jobs.
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {filteredJobs.map((job) => (
            <JobCard
              key={job._id}
              job={job}
              onApply={handleApply}
              onSave={handleSaveJob}
              isSaved={savedJobIds.has(job._id)}
              isApplied={appliedJobIds.has(job._id)}
            />
          ))}
        </div>
      )}

      {/* Application Modal */}
      {selectedJob && (
        <JobApplicationModal
          isOpen={showApplicationModal}
          onClose={() => {
            setShowApplicationModal(false);
            setSelectedJob(null);
          }}
          job={selectedJob}
          onSuccess={handleApplicationSuccess}
        />
      )}
    </div>
  );
}

function JobCard({
  job,
  onApply,
  onSave,
  isSaved,
  isApplied,
}: {
  job: Job;
  onApply: (job: Job) => void;
  onSave: (jobId: string) => void;
  isSaved: boolean;
  isApplied: boolean;
}) {
  const formatSalary = (min?: number, max?: number) => {
    if (!min && !max) return null;
    if (min && max) return `$${min.toLocaleString()} - $${max.toLocaleString()}`;
    if (min) return `$${min.toLocaleString()}+`;
    if (max) return `Up to $${max.toLocaleString()}`;
    return null;
  };

  return (
    <div className="bg-white rounded-lg shadow-sm border p-6 hover:shadow-md transition-shadow">
      <div className="flex justify-between items-start mb-4">
        <div className="flex-1">
          <div className="flex items-center space-x-3 mb-2">
            <h3 className="text-lg font-semibold text-gray-900">{job.title}</h3>
            {job.remote && (
              <span className="px-2 py-1 bg-green-100 text-green-800 rounded-full text-xs font-medium">
                Remote
              </span>
            )}
            <span className="px-2 py-1 bg-blue-100 text-blue-800 rounded-full text-xs font-medium capitalize">
              {job.employmentType?.replace('-', ' ') || 'Not specified'}
            </span>
          </div>
          <p className="text-gray-600 mb-2">{job.companyName}</p>
          <p className="text-gray-500 text-sm mb-3">📍 {job.location || 'Location not specified'}</p>
          {formatSalary(job.minSalary, job.maxSalary) && (
            <p className="text-green-600 font-medium text-sm mb-3">💰 {formatSalary(job.minSalary, job.maxSalary)}</p>
          )}
          <p className="text-gray-700 text-sm mb-4 line-clamp-2">{job.description}</p>
          {job.skills && job.skills.length > 0 && (
            <div className="flex flex-wrap gap-2 mb-4">
              {job.skills.slice(0, 5).map((skill, index) => (
                <span key={index} className="bg-gray-100 text-gray-700 px-2 py-1 rounded text-xs">
                  {skill}
                </span>
              ))}
              {job.skills.length > 5 && (
                <span className="text-xs text-gray-500">+{job.skills.length - 5} more</span>
              )}
            </div>
          )}
        </div>
      </div>
      <div className="flex flex-col gap-3 pt-4 border-t border-gray-200">
        {/* Applied Status Badge */}
        {isApplied && (
          <div className="flex items-center gap-2 text-sm">
            <span className="inline-flex items-center px-3 py-1 rounded-full bg-green-100 text-green-800 font-medium">
              <span className="mr-1">✓</span>
              Applied
            </span>
            <Link 
              href="/candidate/applications"
              className="text-blue-600 hover:text-blue-800 text-sm font-medium"
            >
              Track your application →
            </Link>
          </div>
        )}
        
        <div className="flex justify-between items-center">
          <div className="text-sm text-gray-500">
            Posted {new Date(job.createdAt).toLocaleDateString()}
            {job.experienceRequired && (
              <span className="ml-3">• {job.experienceRequired}+ years experience</span>
            )}
          </div>
          <div className="flex space-x-2">
            <button
              onClick={() => onSave(job._id)}
              className={`px-3 py-1 border border-gray-300 text-gray-700 rounded-md text-sm hover:bg-gray-50 ${
                isSaved ? 'bg-gray-200 text-gray-600' : ''
              }`}
            >
              {isSaved ? '💾 Saved' : '💾 Save'}
            </button>
            {isApplied ? (
              <Link
                href="/candidate/applications"
                className="px-4 py-2 bg-gray-100 text-gray-700 rounded-md text-sm hover:bg-gray-200 font-medium flex items-center gap-2"
              >
                <span>📊</span>
                Track Application
              </Link>
            ) : (
              <button
                onClick={() => onApply(job)}
                className="px-4 py-2 bg-blue-600 text-white rounded-md text-sm hover:bg-blue-700 font-medium"
              >
                Apply Now
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
