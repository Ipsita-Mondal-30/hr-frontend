'use client';

import { useState, useEffect } from 'react';
import { Job } from '@/types';
import api from '@/lib/api';

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
    <div className="p-6">
      <div className="flex justify-between items-center mb-4">
        <h1 className="text-xl font-semibold">Manage Jobs</h1>
        <button
          className="bg-blue-600 text-white px-4 py-1 rounded-full text-sm"
          onClick={() => {
            if (formVisible) resetForm();
            else setFormVisible(true);
          }}
        >
          {formVisible ? 'Cancel' : '➕ Add'}
        </button>
      </div>

      {formVisible && (
        <form onSubmit={handleSubmit} className="mb-6 bg-white p-6 rounded-md shadow-md">
          <h2 className="text-lg font-semibold mb-4">{editingId ? 'Edit Job' : 'Create Job'}</h2>

          {/* Add other form fields here in similar fashion */}
          <div className="mb-4">
            <label htmlFor="title" className="block mb-1 font-medium">Job Title</label>
            <input
              id="title"
              type="text"
              value={form.title}
              onChange={(e) => setForm({ ...form, title: e.target.value })}
              required
              className="w-full border p-2 rounded"
            />
          </div>

          {/* Render other inputs similarly */}

          <div className="flex space-x-4">
            <button type="submit" className="bg-blue-600 text-white px-6 py-2 rounded">
              {editingId ? 'Update' : 'Create'}
            </button>
            <button type="button" onClick={resetForm} className="px-6 py-2 border rounded">
              Cancel
            </button>
          </div>
        </form>
      )}

      {loading ? (
        <div className="text-center py-10">Loading jobs...</div>
      ) : jobs.length === 0 ? (
        <div className="text-center">
          <p>No jobs found.</p>
          <button className="mt-4 px-4 py-2 bg-blue-600 text-white rounded" onClick={() => setFormVisible(true)}>
            Create Job
          </button>
        </div>
      ) : (
        <div className="space-y-6">
          {jobs.map((job) => (
            <div key={(job.id ?? job._id)?.toString()} className="border p-4 rounded bg-white shadow">
              <div className="flex justify-between items-center">
                <h3 className="text-lg font-semibold">{job.title}</h3>
                <button className="text-blue-600" onClick={() => startEdit(job)}>Edit</button>
              </div>
              <p>{job.description.length > 100 ? job.description.slice(0, 100) + '...' : job.description}</p>
              <div className="mt-2 text-sm text-gray-600">
                Department: {job.department?.name ?? 'N/A'}, Role: {job.role?.title ?? 'N/A'}
              </div>
              <div className="text-xs text-gray-500 mt-1">Created: {new Date(job.createdAt).toLocaleDateString()}</div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
