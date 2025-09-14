'use client';

import { useEffect, useState } from 'react';
import api from '@/lib/api';
import { Job } from '@/types';

export default function JobsPage() {
  const [jobs, setJobs] = useState<Job[]>([]);
  const [departments, setDepartments] = useState<{ _id: string; name: string }[]>([]);
  const [roles, setRoles] = useState<{ _id: string; title?: string; name?: string }[]>([]);
  const [loading, setLoading] = useState(true);
  const [formVisible, setFormVisible] = useState(false);
  const [form, setForm] = useState({
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

  const fetchJobs = async () => {
    try {
      console.log('🔄 Fetching jobs for HR management...');
      const res = await api.get('/jobs/manage');
      console.log(`📊 Received ${res.data.length} jobs`);
      setJobs(res.data);
    } catch (err) {
      console.error('Failed to fetch jobs:', err);
      alert('Failed to load jobs. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const fetchDepartmentsAndRoles = async () => {
    try {
      const depRes = await api.get('/departments');
      const roleRes = await api.get('/roles');
      setDepartments(depRes.data);
      setRoles(roleRes.data);
    } catch (err) {
      console.error('Failed to fetch departments or roles:', err);
    }
  };

  useEffect(() => {
    fetchJobs();
    fetchDepartmentsAndRoles(); // 👈 Fetch here
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validate required fields
    if (!form.title.trim()) {
      alert('Job title is required');
      return;
    }
    if (!form.description.trim()) {
      alert('Job description is required');
      return;
    }
    if (!form.department) {
      alert('Please select a department');
      return;
    }
    if (!form.role) {
      alert('Please select a role');
      return;
    }
    
    try {
      // Prepare form data with proper types
      const jobData = {
        ...form,
        experienceRequired: form.experienceRequired ? parseInt(form.experienceRequired) : undefined,
        minSalary: form.minSalary ? parseInt(form.minSalary) : undefined,
        maxSalary: form.maxSalary ? parseInt(form.maxSalary) : undefined,
        skills: form.skills ? form.skills.split(',').map(s => s.trim()).filter(s => s) : [],
        tags: form.tags ? form.tags.split(',').map(s => s.trim()).filter(s => s) : [],
      };

      console.log('🚀 Submitting job data:', jobData);

      if (editingId) {
        const response = await api.put(`/jobs/${editingId}`, jobData);
        console.log('✅ Job updated successfully:', response.data);
      } else {
        const response = await api.post('/jobs', jobData);
        console.log('✅ Job created successfully:', response.data);
      }
      
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
      fetchJobs();
    } catch (err: any) {
      console.error('❌ Error saving job:', err);
      if (err.response) {
        console.error('Response data:', err.response.data);
        console.error('Response status:', err.response.status);
        const errorMessage = err.response.data?.message || err.response.data?.error || JSON.stringify(err.response.data) || 'Unknown error';
        alert(`Error saving job: ${errorMessage}`);
      } else {
        console.error('Network or other error:', err.message);
        alert(`Error saving job: ${err.message || 'Please try again.'}`);
      }
    }
  };

  const startEdit = (job: Job) => {
    setFormVisible(true);
    setForm({
      title: job.title,
      description: job.description,
      status: job.status,
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
            setFormVisible(!formVisible);
            setEditingId(null);
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
          }}
        >
          {formVisible ? 'Cancel' : '➕ Add Job'}
        </button>
      </div>

      {formVisible && (
        <form onSubmit={handleSubmit} className="bg-white p-6 rounded-lg shadow-md mb-6">
          <h3 className="text-lg font-semibold mb-4">{editingId ? 'Edit Job' : 'Create New Job'}</h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
            {/* Basic Information */}
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">Job Title *</label>
              <input
                type="text"
                placeholder="e.g., Senior React Developer"
                className="w-full border border-gray-300 px-3 py-2 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                value={form.title}
                onChange={(e) => setForm({ ...form, title: e.target.value })}
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Company Name *</label>
              <input
                type="text"
                placeholder="e.g., Tech Corp"
                className="w-full border border-gray-300 px-3 py-2 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                value={form.companyName}
                onChange={(e) => setForm({ ...form, companyName: e.target.value })}
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Location</label>
              <input
                type="text"
                placeholder="e.g., San Francisco, CA or Remote"
                className="w-full border border-gray-300 px-3 py-2 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                value={form.location}
                onChange={(e) => setForm({ ...form, location: e.target.value })}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Department *</label>
              <select
                className="w-full border border-gray-300 px-3 py-2 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                value={form.department}
                onChange={(e) => setForm({ ...form, department: e.target.value })}
                required
              >
                <option value="">Select Department</option>
                {departments.map((d) => (
                  <option key={d._id} value={d._id}>{d.name}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Role *</label>
              <select
                className="w-full border border-gray-300 px-3 py-2 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                value={form.role}
                onChange={(e) => setForm({ ...form, role: e.target.value })}
                required
              >
                <option value="">Select Role</option>
                {roles.map((r) => (
                  <option key={r._id} value={r._id}>{r.title || r.name}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Employment Type</label>
              <select
                className="w-full border border-gray-300 px-3 py-2 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                value={form.employmentType}
                onChange={(e) => setForm({ ...form, employmentType: e.target.value })}
              >
                <option value="full-time">Full Time</option>
                <option value="part-time">Part Time</option>
                <option value="internship">Internship</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Company Size</label>
              <select
                className="w-full border border-gray-300 px-3 py-2 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                value={form.companySize}
                onChange={(e) => setForm({ ...form, companySize: e.target.value })}
              >
                <option value="">Select Company Size</option>
                <option value="1-10">1-10 employees</option>
                <option value="11-50">11-50 employees</option>
                <option value="51-200">51-200 employees</option>
                <option value="201-500">201-500 employees</option>
                <option value="500+">500+ employees</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Experience Required (years)</label>
              <input
                type="number"
                placeholder="e.g., 3"
                min="0"
                max="20"
                className="w-full border border-gray-300 px-3 py-2 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                value={form.experienceRequired}
                onChange={(e) => setForm({ ...form, experienceRequired: e.target.value })}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Minimum Salary ($)</label>
              <input
                type="number"
                placeholder="e.g., 80000"
                min="0"
                className="w-full border border-gray-300 px-3 py-2 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                value={form.minSalary}
                onChange={(e) => setForm({ ...form, minSalary: e.target.value })}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Maximum Salary ($)</label>
              <input
                type="number"
                placeholder="e.g., 120000"
                min="0"
                className="w-full border border-gray-300 px-3 py-2 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                value={form.maxSalary}
                onChange={(e) => setForm({ ...form, maxSalary: e.target.value })}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
              <select
                className="w-full border border-gray-300 px-3 py-2 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                value={form.status}
                onChange={(e) => setForm({ ...form, status: e.target.value })}
              >
                <option value="open">Open</option>
                <option value="closed">Closed</option>
              </select>
            </div>

            <div className="flex items-center">
              <input
                type="checkbox"
                id="remote"
                className="mr-2"
                checked={form.remote}
                onChange={(e) => setForm({ ...form, remote: e.target.checked })}
              />
              <label htmlFor="remote" className="text-sm font-medium text-gray-700">Remote Work Available</label>
            </div>

            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">Job Description *</label>
              <textarea
                placeholder="Describe the role, responsibilities, and requirements..."
                className="w-full border border-gray-300 px-3 py-2 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                rows={4}
                value={form.description}
                onChange={(e) => setForm({ ...form, description: e.target.value })}
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Required Skills</label>
              <input
                type="text"
                placeholder="e.g., React, JavaScript, Node.js (comma separated)"
                className="w-full border border-gray-300 px-3 py-2 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                value={form.skills}
                onChange={(e) => setForm({ ...form, skills: e.target.value })}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Tags</label>
              <input
                type="text"
                placeholder="e.g., frontend, senior, startup (comma separated)"
                className="w-full border border-gray-300 px-3 py-2 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                value={form.tags}
                onChange={(e) => setForm({ ...form, tags: e.target.value })}
              />
            </div>
          </div>

          <div className="flex space-x-3">
            <button
              type="submit"
              className="bg-blue-600 text-white px-6 py-2 rounded-md hover:bg-blue-700"
            >
              {editingId ? 'Update Job' : 'Create Job'}
            </button>
            <button
              type="button"
              onClick={() => setFormVisible(false)}
              className="bg-gray-300 text-gray-700 px-6 py-2 rounded-md hover:bg-gray-400"
            >
              Cancel
            </button>
          </div>
        </form>
      )}

      {loading ? (
        <div className="text-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p>Loading jobs...</p>
        </div>
      ) : jobs.length === 0 ? (
        <div className="text-center py-12">
          <div className="text-gray-400 text-6xl mb-4">💼</div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">No jobs created yet</h3>
          <p className="text-gray-500 mb-4">Create your first job posting to get started</p>
          <button
            onClick={() => setFormVisible(true)}
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
          >
            Create First Job
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-6">
          {jobs.map((job) => (
            <div key={job._id} className="bg-white rounded-lg shadow-sm border p-6">
              <div className="flex justify-between items-start mb-4">
                <div className="flex-1">
                  <div className="flex items-center space-x-3 mb-2">
                    <h2 className="text-lg font-semibold text-gray-900">{job.title}</h2>
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                      job.status === 'open' 
                        ? 'bg-green-100 text-green-800' 
                        : 'bg-red-100 text-red-800'
                    }`}>
                      {job.status}
                    </span>
                  </div>
                  
                  <p className="text-gray-600 mb-2">{job.companyName}</p>
                  
                  <div className="flex flex-wrap items-center gap-4 text-sm text-gray-500 mb-3">
                    {job.location && <span>📍 {job.location}</span>}
                    {job.employmentType && <span>💼 {job.employmentType}</span>}
                    {job.experienceRequired !== undefined && <span>⏱️ {job.experienceRequired} years exp</span>}
                    {job.remote && <span className="bg-green-100 text-green-800 px-2 py-1 rounded text-xs">Remote</span>}
                  </div>
                  
                  {(job.minSalary || job.maxSalary) && (
                    <p className="text-sm text-gray-600 mb-3">
                      💰 {job.minSalary ? `$${job.minSalary.toLocaleString()}` : 'N/A'} - {job.maxSalary ? `$${job.maxSalary.toLocaleString()}` : 'N/A'}
                    </p>
                  )}
                  
                  {job.skills && job.skills.length > 0 && (
                    <div className="flex flex-wrap gap-2 mb-3">
                      {job.skills.slice(0, 5).map((skill, index) => (
                        <span key={index} className="bg-blue-100 text-blue-800 px-2 py-1 rounded text-xs">
                          {skill}
                        </span>
                      ))}
                      {job.skills.length > 5 && (
                        <span className="text-xs text-gray-500">+{job.skills.length - 5} more</span>
                      )}
                    </div>
                  )}
                </div>
                
                <button
                  onClick={() => startEdit(job)}
                  className="px-3 py-1 text-sm text-blue-600 border border-blue-600 rounded hover:bg-blue-50"
                >
                  Edit
                </button>
              </div>
              
              <p className="text-sm text-gray-700 mb-4">
                {job.description.length > 200 
                  ? `${job.description.slice(0, 200)}...` 
                  : job.description
                }
              </p>
              
              <div className="flex justify-between items-center text-xs text-gray-500 pt-3 border-t border-gray-200">
                <div className="flex items-center space-x-4">
                  <span>Department: {job.department?.name || 'N/A'}</span>
                  <span>Role: {job.role?.title || 'N/A'}</span>
                  {job.companySize && <span>Company Size: {job.companySize}</span>}
                </div>
                <span>Created: {new Date(job.createdAt).toLocaleDateString()}</span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
