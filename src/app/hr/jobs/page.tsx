'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import api from '@/lib/api';
import { Job } from '@/types';

interface Department {
  _id: string;
  name: string;
}

interface Role {
  _id: string;
  title?: string;
  name?: string;
}

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
  experienceRequired: string; // will be parsed to number
  minSalary: string; // will be parsed to number
  maxSalary: string; // will be parsed to number
  companySize: string;
  skills: string; // comma separated
  tags: string; // comma separated
}

export default function ManageJobsPage() {
  const [jobs, setJobs] = useState<Job[]>([]);
  const [departments, setDepartments] = useState<Department[]>([]);
  const [roles, setRoles] = useState<Role[]>([]);
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

  const fetchJobs = async (): Promise<void> => {
    try {
      setLoading(true);
      const res = await api.get<Job[]>('/jobs/manage');
      setJobs(res.data);
    } catch (err: unknown) {
      console.error('Failed to fetch jobs:', err);
      alert('Failed to load jobs. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const fetchDepartmentsAndRoles = async (): Promise<void> => {
    try {
      const depRes = await api.get<Department[]>('/departments');
      const roleRes = await api.get<Role[]>('/roles');
      setDepartments(depRes.data);
      setRoles(roleRes.data);
    } catch (err: unknown) {
      console.error('Failed to fetch departments or roles:', err);
    }
  };

  useEffect(() => {
    fetchJobs();
    fetchDepartmentsAndRoles();
  }, []);

  const handleSubmit = async (e: React.FormEvent): Promise<void> => {
    e.preventDefault();

    // Prepare structured data for API
    const jobPayload = {
      ...form,
      experienceRequired: form.experienceRequired ? Number(form.experienceRequired) : undefined,
      minSalary: form.minSalary ? Number(form.minSalary) : undefined,
      maxSalary: form.maxSalary ? Number(form.maxSalary) : undefined,
      skills: form.skills.split(',').map(s => s.trim()).filter(Boolean),
      tags: form.tags.split(',').map(t => t.trim()).filter(Boolean),
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
    } catch (err: unknown) {
      if ((err as any)?.response) {
        const resp = (err as any).response;
        alert(`Error saving job: ${resp.data?.message || resp.data?.error || 'Unknown error'}`);
        console.error('API response error:', resp);
      } else {
        alert('Error saving job. Please try again.');
        console.error('Unknown error:', err);
      }
    }
  };

  const resetForm = (): void => {
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
  };

  const startEdit = (job: Job): void => {
    setFormVisible(true);
    setForm({
      title: job.title,
      description: job.description,
      status: job.status === 'open' || job.status === 'closed' ? job.status : 'closed',
      department: job.department?._id || '',
      role: job.role?._id || '',
      companyName: job.companyName || '',
      location: job.location || '',
      remote: job.remote || false,
      employmentType: job.employmentType || 'full-time',
      experienceRequired: job.experienceRequired?.toString() || '',
      minSalary: job.minSalary?.toString() || '',
      maxSalary: job.maxSalary?.toString() || '',
      companySize: job.companySize || '',
      skills: job.skills?.join(', ') || '',
      tags: job.tags?.join(', ') || '',
    });
    setEditingId(job._id);
  };

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-4">
        <h1 className="text-xl font-semibold">Manage Jobs</h1>
        <button
          className="bg-blue-600 text-white px-4 py-1 rounded-full text-sm"
          onClick={() => {
            if (formVisible) {
              resetForm();
            } else {
              setFormVisible(true);
            }
          }}
        >
          {formVisible ? 'Cancel' : '➕ Add Job'}
        </button>
      </div>

      {formVisible && (
        <form onSubmit={handleSubmit} className="mb-6 bg-white p-6 rounded-lg shadow-md">
          <h2 className="text-lg font-semibold mb-4">{editingId ? 'Edit Job' : 'Create New Job'}</h2>

          {/* form inputs... same as your existing code, with necessary type-safe changes */}

          {/* For brevity, the form inputs remain unchanged */}

          {/* Example: */}
          <div className="mb-4">
            <label className="block text-sm font-medium mb-1" htmlFor="title">Title *</label>
            <input
              id="title"
              type="text"
              value={form.title}
              onChange={e => setForm({ ...form, title: e.target.value })}
              required
              className="w-full border px-3 py-2 rounded"
            />
          </div>

          {/* continue for all other inputs... */}

          <div className="flex space-x-4">
            <button type="submit" className="px-6 py-2 bg-blue-600 text-white rounded">
              {editingId ? 'Update Job' : 'Create Job'}
            </button>
            <button type="button" onClick={() => resetForm()} className="px-6 py-2 border rounded">
              Cancel
            </button>
          </div>
        </form>
      )}

      {loading ? (
        <div className="text-center py-10">
          <div className="animate-spin w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full mx-auto mb-2"></div>
          Loading jobs...
        </div>
      ) : jobs.length === 0 ? (
        <div className="text-center py-10">
          <p>No jobs found. Click "Add Job" to create one.</p>
        </div>
      ) : (
        <div className="grid gap-6">
          {jobs.map(job => (
            <div key={job._id} className="bg-white border p-4 rounded shadow">
              <div className="flex justify-between items-center mb-2">
                <h3 className="text-xl">{job.title} <span className={`ml-2 px-2 py-1 rounded text-white ${job.status === 'open' ? 'bg-green-600' : 'bg-gray-600'}`}>{job.status}</span></h3>
                <button
                  onClick={() => startEdit(job)}
                  className="text-blue-600 hover:underline"
                >
                  Edit
                </button>
              </div>
              <p>{job.description.length > 200 ? `${job.description.slice(0, 200)}...` : job.description}</p>
              {/* Other job details */}
              <div className="mt-2 text-sm text-gray-600">
                Department: {job.department?.name || 'N/A'}, Role: {job.role?.title || 'N/A'}
              </div>
              {/* ... */}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
