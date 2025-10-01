'use client';

import { useState, useEffect } from 'react';
import { Job } from '@/types';
import api from '@/lib/api';
import { 
  Plus, 
  Edit3, 
  Briefcase, 
  MapPin, 
  Clock, 
  DollarSign, 
  Users, 
  Calendar,
  X,
  Save
} from 'lucide-react';

interface JobForm {
  title: string;
  description: string;
  status: 'open' | 'closed';
  department: string;
  role: string;
  companyName: string;
  location: string;
  remote: boolean;
  employmentType: 'full-time' | 'part-time' | 'internship' | '';
  experienceRequired: string;
  minSalary: string;
  maxSalary: string;
  companySize: string;
  skills: string;
  tags: string;
}

// Type guard for Axios-style error
function isApiError(error: unknown): error is { response: { data?: { message?: string; error?: string } } } {
  return (
    typeof error === 'object' &&
    error !== null &&
    'response' in error &&
    typeof (error as { response: { data?: { message?: string; error?: string } } }).response === 'object' && (error as { response: { data?: { message?: string; error?: string } } }).response !== null
  );
}

export default function ManageJobs() {
  const [jobs, setJobs] = useState<Job[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [formVisible, setFormVisible] = useState<boolean>(false);
  const [form, setForm] = useState<JobForm>({
    title: '',
    description: '',
    status: 'open',
    department: '',
    role: '',
    companyName: '',
    location: '',
    remote: false,
    employmentType: 'full-time',
    experienceRequired: '',
    minSalary: '',
    maxSalary: '',
    companySize: '',
    skills: '',
    tags: '',
  });
  const [editingId, setEditingId] = useState<string | null>(null);

  useEffect(() => {
    fetchJobs();
  }, []);

  async function fetchJobs() {
    setLoading(true);
    try {
      const res = await api.get<Job[]>('/jobs/manage');
      setJobs(res.data);
    } catch (error) {
      console.error('Failed to fetch jobs:', error);
      alert('Failed to load jobs. Please try again.');
    } finally {
      setLoading(false);
    }
  }

  function resetForm() {
    setForm({
      title: '',
      description: '',
      status: 'open',
      department: '',
      role: '',
      companyName: '',
      location: '',
      remote: false,
      employmentType: 'full-time',
      experienceRequired: '',
      minSalary: '',
      maxSalary: '',
      companySize: '',
      skills: '',
      tags: '',
    });
    setEditingId(null);
    setFormVisible(false);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();

    const jobPayload = {
      ...form,
      experienceRequired: form.experienceRequired ? Number(form.experienceRequired) : undefined,
      minSalary: form.minSalary ? Number(form.minSalary) : undefined,
      maxSalary: form.maxSalary ? Number(form.maxSalary) : undefined,
      skills: form.skills
        .split(',')
        .map((s) => s.trim())
        .filter(Boolean),
      tags: form.tags
        .split(',')
        .map((t) => t.trim())
        .filter(Boolean),
    };

    try {
      if (editingId) {
        const response = await api.put(`/jobs/${editingId}`, jobPayload);
        console.log('Job updated successfully:', response.data);
      } else {
        const response = await api.post('/jobs', jobPayload);
        console.log('Job created successfully:', response.data);
      }
      resetForm();
      fetchJobs();
    } catch (error: unknown) {
      if (isApiError(error)) {
        const message = error.response?.data?.message ?? error.response?.data?.error ?? 'Unknown error';
        alert(`Error saving job: ${message}`);
        console.error('API error response:', error.response);
      } else if (error instanceof Error) {
        alert(`Error saving job: ${error.message}`);
      } else {
        alert('Error saving job. Please try again.');
        console.error('Unknown error:', error);
      }
    }
  }

  function startEdit(job: Job) {
    setFormVisible(true);
    setForm({
      title: job.title,
      description: job.description,
      status: job.status === 'open' || job.status === 'closed' ? job.status : 'closed',
      department: job.department?.id?.toString() ?? job.department?._id?.toString() ?? '',
      role: job.role?._id?.toString() ?? '',
      companyName: job.companyName ?? '',
      location: job.location ?? '',
      remote: job.remote ?? false,
      employmentType: job.employmentType ?? 'full-time',
      experienceRequired: job.experienceRequired?.toString() ?? '',
      minSalary: job.minSalary?.toString() ?? '',
      maxSalary: job.maxSalary?.toString() ?? '',
      companySize: job.companySize ?? '',
      skills: job.skills?.join(', ') ?? '',
      tags: job.tags?.join(', ') ?? '',
    });
    setEditingId((job.id ?? job._id)?.toString() ?? null);
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl flex items-center justify-center">
              <Briefcase className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-slate-900">Manage Jobs</h1>
              <p className="text-slate-600">Create and manage job postings</p>
            </div>
          </div>
          <button
            className="flex items-center space-x-2 bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors font-medium"
            onClick={() => {
              if (formVisible) resetForm();
              else setFormVisible(true);
            }}
          >
            {formVisible ? (
              <>
                <X className="w-5 h-5" />
                <span>Cancel</span>
              </>
            ) : (
              <>
                <Plus className="w-5 h-5" />
                <span>Add Job</span>
              </>
            )}
          </button>
        </div>
      </div>

      {formVisible && (
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
          <div className="flex items-center space-x-3 mb-6">
            <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
              <Briefcase className="w-5 h-5 text-blue-600" />
            </div>
            <h2 className="text-xl font-semibold text-slate-900">{editingId ? 'Edit Job' : 'Create New Job'}</h2>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label htmlFor="title" className="block text-sm font-medium text-slate-700 mb-2">Job Title</label>
                <input
                  id="title"
                  type="text"
                  value={form.title}
                  onChange={(e) => setForm({ ...form, title: e.target.value })}
                  required
                  className="w-full border border-slate-300 rounded-lg px-4 py-3 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                  placeholder="e.g. Senior Software Engineer"
                />
              </div>

              <div>
                <label htmlFor="companyName" className="block text-sm font-medium text-slate-700 mb-2">Company Name</label>
                <input
                  id="companyName"
                  type="text"
                  value={form.companyName}
                  onChange={(e) => setForm({ ...form, companyName: e.target.value })}
                  className="w-full border border-slate-300 rounded-lg px-4 py-3 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                  placeholder="Company name"
                />
              </div>

              <div>
                <label htmlFor="location" className="block text-sm font-medium text-slate-700 mb-2">Location</label>
                <input
                  id="location"
                  type="text"
                  value={form.location}
                  onChange={(e) => setForm({ ...form, location: e.target.value })}
                  className="w-full border border-slate-300 rounded-lg px-4 py-3 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                  placeholder="e.g. New York, NY"
                />
              </div>

              <div>
                <label htmlFor="employmentType" className="block text-sm font-medium text-slate-700 mb-2">Employment Type</label>
                <select
                  id="employmentType"
                  value={form.employmentType}
                  onChange={(e) => setForm({ ...form, employmentType: e.target.value as JobForm['employmentType'] })}
                  className="w-full border border-slate-300 rounded-lg px-4 py-3 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                >
                  <option value="full-time">Full-time</option>
                  <option value="part-time">Part-time</option>
                  <option value="internship">Internship</option>
                </select>
              </div>
            </div>

            <div>
              <label htmlFor="description" className="block text-sm font-medium text-slate-700 mb-2">Job Description</label>
              <textarea
                id="description"
                value={form.description}
                onChange={(e) => setForm({ ...form, description: e.target.value })}
                required
                rows={4}
                className="w-full border border-slate-300 rounded-lg px-4 py-3 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                placeholder="Describe the role, responsibilities, and requirements..."
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div>
                <label htmlFor="minSalary" className="block text-sm font-medium text-slate-700 mb-2">Min Salary</label>
                <input
                  id="minSalary"
                  type="number"
                  value={form.minSalary}
                  onChange={(e) => setForm({ ...form, minSalary: e.target.value })}
                  className="w-full border border-slate-300 rounded-lg px-4 py-3 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                  placeholder="50000"
                />
              </div>

              <div>
                <label htmlFor="maxSalary" className="block text-sm font-medium text-slate-700 mb-2">Max Salary</label>
                <input
                  id="maxSalary"
                  type="number"
                  value={form.maxSalary}
                  onChange={(e) => setForm({ ...form, maxSalary: e.target.value })}
                  className="w-full border border-slate-300 rounded-lg px-4 py-3 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                  placeholder="80000"
                />
              </div>

              <div>
                <label htmlFor="experienceRequired" className="block text-sm font-medium text-slate-700 mb-2">Experience (years)</label>
                <input
                  id="experienceRequired"
                  type="number"
                  value={form.experienceRequired}
                  onChange={(e) => setForm({ ...form, experienceRequired: e.target.value })}
                  className="w-full border border-slate-300 rounded-lg px-4 py-3 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                  placeholder="3"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label htmlFor="skills" className="block text-sm font-medium text-slate-700 mb-2">Skills (comma-separated)</label>
                <input
                  id="skills"
                  type="text"
                  value={form.skills}
                  onChange={(e) => setForm({ ...form, skills: e.target.value })}
                  className="w-full border border-slate-300 rounded-lg px-4 py-3 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                  placeholder="React, Node.js, TypeScript"
                />
              </div>

              <div>
                <label htmlFor="status" className="block text-sm font-medium text-slate-700 mb-2">Status</label>
                <select
                  id="status"
                  value={form.status}
                  onChange={(e) => setForm({ ...form, status: e.target.value as JobForm['status'] })}
                  className="w-full border border-slate-300 rounded-lg px-4 py-3 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                >
                  <option value="open">Open</option>
                  <option value="closed">Closed</option>
                </select>
              </div>
            </div>

            <div className="flex items-center space-x-2">
              <input
                id="remote"
                type="checkbox"
                checked={form.remote}
                onChange={(e) => setForm({ ...form, remote: e.target.checked })}
                className="w-4 h-4 text-blue-600 border-slate-300 rounded focus:ring-blue-500"
              />
              <label htmlFor="remote" className="text-sm font-medium text-slate-700">Remote work available</label>
            </div>

            <div className="flex justify-end space-x-4 pt-6 border-t border-slate-200">
              <button 
                type="button" 
                onClick={resetForm} 
                className="px-6 py-3 border border-slate-300 text-slate-700 rounded-lg hover:bg-slate-50 transition-colors font-medium"
              >
                Cancel
              </button>
              <button 
                type="submit" 
                className="flex items-center space-x-2 bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors font-medium"
              >
                <Save className="w-5 h-5" />
                <span>{editingId ? 'Update Job' : 'Create Job'}</span>
              </button>
            </div>
          </form>
        </div>
      )}

      {loading ? (
        <div className="flex items-center justify-center py-20">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p className="text-slate-600 font-medium">Loading jobs...</p>
          </div>
        </div>
      ) : jobs.length === 0 ? (
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-12">
          <div className="text-center">
            <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Briefcase className="w-8 h-8 text-slate-400" />
            </div>
            <h3 className="text-xl font-semibold text-slate-900 mb-2">No Jobs Found</h3>
            <p className="text-slate-600 mb-6">Get started by creating your first job posting</p>
            <button 
              className="flex items-center space-x-2 bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors font-medium mx-auto" 
              onClick={() => setFormVisible(true)}
            >
              <Plus className="w-5 h-5" />
              <span>Create Job</span>
            </button>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-6">
          {jobs.map((job) => (
            <div key={(job.id ?? job._id)?.toString()} className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 hover:shadow-md transition-all duration-200">
              <div className="flex justify-between items-start mb-4">
                <div className="flex-1">
                  <div className="flex items-center space-x-3 mb-2">
                    <h3 className="text-xl font-semibold text-slate-900">{job.title}</h3>
                    <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                      job.status === 'open' 
                        ? 'bg-emerald-100 text-emerald-700' 
                        : 'bg-slate-100 text-slate-700'
                    }`}>
                      {job.status === 'open' ? 'Open' : 'Closed'}
                    </span>
                  </div>
                  <p className="text-slate-600 mb-4">
                    {job.description.length > 150 ? job.description.slice(0, 150) + '...' : job.description}
                  </p>
                </div>
                <button 
                  className="flex items-center space-x-2 text-blue-600 hover:text-blue-700 hover:bg-blue-50 px-3 py-2 rounded-lg transition-colors" 
                  onClick={() => startEdit(job)}
                >
                  <Edit3 className="w-4 h-4" />
                  <span>Edit</span>
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
                {job.location && (
                  <div className="flex items-center space-x-2 text-sm text-slate-600">
                    <MapPin className="w-4 h-4" />
                    <span>{job.location}</span>
                  </div>
                )}
                {job.employmentType && (
                  <div className="flex items-center space-x-2 text-sm text-slate-600">
                    <Clock className="w-4 h-4" />
                    <span className="capitalize">{job.employmentType}</span>
                  </div>
                )}
                {(job.minSalary || job.maxSalary) && (
                  <div className="flex items-center space-x-2 text-sm text-slate-600">
                    <DollarSign className="w-4 h-4" />
                    <span>
                      {job.minSalary && job.maxSalary 
                        ? `$${job.minSalary.toLocaleString()} - $${job.maxSalary.toLocaleString()}`
                        : job.minSalary 
                        ? `$${job.minSalary.toLocaleString()}+`
                        : job.maxSalary 
                        ? `Up to $${job.maxSalary.toLocaleString()}`
                        : 'Salary not specified'
                      }
                    </span>
                  </div>
                )}
                <div className="flex items-center space-x-2 text-sm text-slate-600">
                  <Calendar className="w-4 h-4" />
                  <span>Created {new Date(job.createdAt).toLocaleDateString()}</span>
                </div>
              </div>

              {job.skills && job.skills.length > 0 && (
                <div className="flex flex-wrap gap-2">
                  {job.skills.slice(0, 5).map((skill, index) => (
                    <span key={index} className="px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-xs font-medium">
                      {skill}
                    </span>
                  ))}
                  {job.skills.length > 5 && (
                    <span className="px-3 py-1 bg-slate-100 text-slate-600 rounded-full text-xs font-medium">
                      +{job.skills.length - 5} more
                    </span>
                  )}
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
