'use client';

import { useState, useEffect } from 'react';
import api from '@/lib/api';
import { Job } from '@/types';
import JobApplicationModal from '@/components/JobApplicationModal';

interface JobFilters {
  role: string;
  employmentType: string;
  location: string;
  companyName: string;
  companySize: string;
  experience: string;
  minSalary: string;
  keyword: string;
  remote: string;
}

export default function JobSearchPage() {
  const [jobs, setJobs] = useState<Job[]>([]);
  const [filteredJobs, setFilteredJobs] = useState<Job[]>([]);
  const [loading, setLoading] = useState(true);
  const [savedJobs, setSavedJobs] = useState<string[]>([]);
  const [appliedJobs, setAppliedJobs] = useState<string[]>([]);
  const [applicationModal, setApplicationModal] = useState<{ isOpen: boolean; job: any }>({
    isOpen: false,
    job: null
  });
  
  const [filters, setFilters] = useState<JobFilters>({
    role: '',
    employmentType: '',
    location: '',
    companyName: '',
    companySize: '',
    experience: '',
    minSalary: '',
    keyword: '',
    remote: ''
  });

  useEffect(() => {
    fetchJobs();
    fetchSavedJobs();
    fetchAppliedJobs();
  }, []);

  useEffect(() => {
    applyFilters();
  }, [jobs, filters]);

  const fetchJobs = async () => {
    try {
      const res = await api.get('/jobs');
      setJobs(res.data);
    } catch (err) {
      console.error('Error fetching jobs:', err);
    } finally {
      setLoading(false);
    }
  };

  const fetchSavedJobs = async () => {
    try {
      const res = await api.get('/candidate/saved-jobs');
      setSavedJobs(res.data.map((job: any) => job._id));
    } catch (err) {
      console.error('Error fetching saved jobs:', err);
    }
  };

  const fetchAppliedJobs = async () => {
    try {
      const res = await api.get('/applications/my');
      setAppliedJobs(res.data.map((app: any) => app.job?._id).filter(Boolean));
    } catch (err) {
      console.error('Error fetching applied jobs:', err);
    }
  };

  const applyFilters = () => {
    let filtered = jobs.filter(job => {
      // Role filter
      if (filters.role && job.role?.title.toLowerCase() !== filters.role.toLowerCase()) {
        return false;
      }
      
      // Employment type filter
      if (filters.employmentType && job.employmentType !== filters.employmentType) {
        return false;
      }
      
      // Location filter
      if (filters.location && !job.location?.toLowerCase().includes(filters.location.toLowerCase())) {
        return false;
      }
      
      // Company name filter
      if (filters.companyName && !job.companyName?.toLowerCase().includes(filters.companyName.toLowerCase())) {
        return false;
      }
      
      // Company size filter
      if (filters.companySize && job.companySize !== filters.companySize) {
        return false;
      }
      
      // Experience filter
      if (filters.experience && job.experienceRequired && job.experienceRequired > parseInt(filters.experience)) {
        return false;
      }
      
      // Minimum salary filter
      if (filters.minSalary && job.minSalary && job.minSalary < parseInt(filters.minSalary)) {
        return false;
      }
      
      // Remote filter
      if (filters.remote === 'true' && !job.remote) {
        return false;
      }
      if (filters.remote === 'false' && job.remote) {
        return false;
      }
      
      // Keyword search
      if (filters.keyword) {
        const keyword = filters.keyword.toLowerCase();
        const searchText = `${job.title} ${job.description} ${job.skills?.join(' ')} ${job.tags?.join(' ')}`.toLowerCase();
        if (!searchText.includes(keyword)) {
          return false;
        }
      }
      
      return true;
    });
    
    setFilteredJobs(filtered);
  };

  const handleFilterChange = (key: keyof JobFilters, value: string) => {
    setFilters(prev => ({ ...prev, [key]: value }));
  };

  const clearFilters = () => {
    setFilters({
      role: '',
      employmentType: '',
      location: '',
      companyName: '',
      companySize: '',
      experience: '',
      minSalary: '',
      keyword: '',
      remote: ''
    });
  };

  const handleSaveJob = async (jobId: string) => {
    try {
      if (savedJobs.includes(jobId)) {
        await api.delete(`/candidate/saved-jobs/${jobId}`);
        setSavedJobs(prev => prev.filter(id => id !== jobId));
      } else {
        await api.post('/candidate/save-job', { jobId });
        setSavedJobs(prev => [...prev, jobId]);
      }
    } catch (err) {
      console.error('Error saving job:', err);
    }
  };

  const handleApplyJob = (job: any) => {
    setApplicationModal({ isOpen: true, job });
  };

  const handleApplicationSuccess = () => {
    if (applicationModal.job) {
      setAppliedJobs(prev => [...prev, applicationModal.job._id]);
    }
  };

  if (loading) {
    return <div className="p-6">Loading jobs...</div>;
  }

  return (
    <div className="p-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900 mb-2">Search Jobs</h1>
        <p className="text-gray-600">Find your perfect job opportunity</p>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-lg shadow-sm border p-6 mb-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
          {/* Keyword Search */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Keyword Search
            </label>
            <input
              type="text"
              placeholder="e.g., Java developer"
              value={filters.keyword}
              onChange={(e) => handleFilterChange('keyword', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          {/* Role */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Role
            </label>
            <select
              value={filters.role}
              onChange={(e) => handleFilterChange('role', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">All Roles</option>
              <option value="Software Developer">Software Developer</option>
              <option value="Frontend Developer">Frontend Developer</option>
              <option value="Backend Developer">Backend Developer</option>
              <option value="Full Stack Developer">Full Stack Developer</option>
              <option value="DevOps Engineer">DevOps Engineer</option>
              <option value="Data Scientist">Data Scientist</option>
            </select>
          </div>

          {/* Employment Type */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Employment Type
            </label>
            <select
              value={filters.employmentType}
              onChange={(e) => handleFilterChange('employmentType', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">All Types</option>
              <option value="full-time">Full Time</option>
              <option value="part-time">Part Time</option>
              <option value="internship">Internship</option>
            </select>
          </div>

          {/* Location */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Location
            </label>
            <input
              type="text"
              placeholder="City or Remote"
              value={filters.location}
              onChange={(e) => handleFilterChange('location', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          {/* Company Name */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Company Name
            </label>
            <input
              type="text"
              placeholder="Company name"
              value={filters.companyName}
              onChange={(e) => handleFilterChange('companyName', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          {/* Company Size */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Company Size
            </label>
            <select
              value={filters.companySize}
              onChange={(e) => handleFilterChange('companySize', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">All Sizes</option>
              <option value="1-10">1-10 employees</option>
              <option value="11-50">11-50 employees</option>
              <option value="51-200">51-200 employees</option>
              <option value="201-500">201-500 employees</option>
              <option value="500+">500+ employees</option>
            </select>
          </div>

          {/* Experience */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Max Experience Required
            </label>
            <select
              value={filters.experience}
              onChange={(e) => handleFilterChange('experience', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">Any Experience</option>
              <option value="0">Entry Level (0 years)</option>
              <option value="2">Up to 2 years</option>
              <option value="5">Up to 5 years</option>
              <option value="10">Up to 10 years</option>
            </select>
          </div>

          {/* Minimum Salary */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Minimum Salary
            </label>
            <select
              value={filters.minSalary}
              onChange={(e) => handleFilterChange('minSalary', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">Any Salary</option>
              <option value="50000">$50,000+</option>
              <option value="75000">$75,000+</option>
              <option value="100000">$100,000+</option>
              <option value="150000">$150,000+</option>
            </select>
          </div>
        </div>

        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <label className="flex items-center">
              <input
                type="radio"
                name="remote"
                value=""
                checked={filters.remote === ''}
                onChange={(e) => handleFilterChange('remote', e.target.value)}
                className="mr-2"
              />
              All Jobs
            </label>
            <label className="flex items-center">
              <input
                type="radio"
                name="remote"
                value="true"
                checked={filters.remote === 'true'}
                onChange={(e) => handleFilterChange('remote', e.target.value)}
                className="mr-2"
              />
              Remote Only
            </label>
            <label className="flex items-center">
              <input
                type="radio"
                name="remote"
                value="false"
                checked={filters.remote === 'false'}
                onChange={(e) => handleFilterChange('remote', e.target.value)}
                className="mr-2"
              />
              On-site Only
            </label>
          </div>
          <button
            onClick={clearFilters}
            className="px-4 py-2 text-sm text-gray-600 hover:text-gray-800"
          >
            Clear All Filters
          </button>
        </div>
      </div>

      {/* Results */}
      <div className="mb-4">
        <p className="text-gray-600">
          Showing {filteredJobs.length} of {jobs.length} jobs
        </p>
      </div>

      {/* Job Cards */}
      <div className="grid grid-cols-1 gap-6">
        {filteredJobs.map((job) => (
          <JobCard
            key={job._id}
            job={job}
            isSaved={savedJobs.includes(job._id)}
            isApplied={appliedJobs.includes(job._id)}
            onSave={() => handleSaveJob(job._id)}
            onApply={() => handleApplyJob(job)}
          />
        ))}
      </div>

      {filteredJobs.length === 0 && (
        <div className="text-center py-12">
          <p className="text-gray-500 text-lg">No jobs found matching your criteria</p>
          <button
            onClick={clearFilters}
            className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
          >
            Clear Filters
          </button>
        </div>
      )}

      {/* Application Modal */}
      <JobApplicationModal
        job={applicationModal.job}
        isOpen={applicationModal.isOpen}
        onClose={() => setApplicationModal({ isOpen: false, job: null })}
        onSuccess={handleApplicationSuccess}
      />
    </div>
  );
}

function JobCard({ job, isSaved, isApplied, onSave, onApply }: {
  job: any;
  isSaved: boolean;
  isApplied: boolean;
  onSave: () => void;
  onApply: () => void;
}) {
  return (
    <div className="bg-white rounded-lg shadow-sm border p-6 hover:shadow-md transition-shadow">
      <div className="flex justify-between items-start mb-4">
        <div className="flex items-start space-x-4">
          {/* Company Logo Placeholder */}
          <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
            <span className="text-blue-600 font-semibold text-lg">
              {job.companyName?.charAt(0) || 'C'}
            </span>
          </div>
          
          <div className="flex-1">
            <h3 className="text-lg font-semibold text-gray-900 mb-1">{job.title}</h3>
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
                {job.skills.slice(0, 5).map((skill: string, index: number) => (
                  <span
                    key={index}
                    className="bg-blue-50 text-blue-700 px-2 py-1 rounded text-xs"
                  >
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
        
        <div className="flex items-center space-x-2">
          <button
            onClick={onSave}
            className={`p-2 rounded-full ${
              isSaved 
                ? 'bg-yellow-100 text-yellow-600' 
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
            title={isSaved ? 'Remove from saved' : 'Save job'}
          >
            {isSaved ? '⭐' : '☆'}
          </button>
        </div>
      </div>
      
      <p className="text-gray-700 text-sm mb-4 line-clamp-2">
        {job.description}
      </p>
      
      <div className="flex justify-between items-center">
        <div className="flex items-center space-x-4 text-xs text-gray-500">
          <span>🏢 {job.companySize || 'Size not specified'}</span>
          <span>⭐ 4.2 rating</span>
          <span>📊 Medium difficulty</span>
        </div>
        
        <div className="flex space-x-2">
          {isApplied ? (
            <span className="px-4 py-2 bg-green-100 text-green-800 rounded-md text-sm font-medium">
              ✓ Applied
            </span>
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