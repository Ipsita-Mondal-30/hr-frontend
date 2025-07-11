'use client';

import { useEffect, useState } from 'react';
import api from '@/lib/api';
import { Job } from '@/types';

export default function JobsPage() {
  const [jobs, setJobs] = useState<Job[]>([]);
  const [departments, setDepartments] = useState([]);
  const [roles, setRoles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [formVisible, setFormVisible] = useState(false);
  const [form, setForm] = useState({
    title: '',
    description: '',
    status: 'open',
    departmentId: '',
    roleId: ''
  });
  const [editingId, setEditingId] = useState<string | null>(null);

  const fetchJobs = async () => {
    const res = await api.get('/jobs');
    setJobs(res.data);
    setLoading(false);
  };

  const fetchDepartmentsAndRoles = async () => {
    const [depRes, roleRes] = await Promise.all([
      api.get('/departments'),
      api.get('/roles')
    ]);
    console.log('Departments:', depRes.data); // 👈 add this
    console.log('Roles:', roleRes.data); // 👈 add this
    setDepartments(depRes.data);
    setRoles(roleRes.data);
  };
  

  useEffect(() => {
    fetchJobs();
    fetchDepartmentsAndRoles();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editingId) {
        await api.put(`/jobs/${editingId}`, form);
      } else {
        await api.post('/jobs', form);
      }
      setForm({ title: '', description: '', status: 'open', departmentId: '', roleId: '' });
      setEditingId(null);
      setFormVisible(false);
      fetchJobs();
    } catch (err) {
      console.error('Error saving job:', err);
    }
  };

  const startEdit = (job: Job) => {
    setFormVisible(true);
    setForm({
      title: job.title,
      description: job.description,
      status: job.status,
      departmentId: job.department?._id || '',
      roleId: job.role?._id || ''
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
              departmentId: '',
              roleId: ''
            });
          }}
        >
          {formVisible ? 'Cancel' : '➕ Add Job'}
        </button>
      </div>

      {formVisible && (
        <form onSubmit={handleSubmit} className="bg-gray-100 p-4 rounded mb-6 space-y-3">
          <input
            type="text"
            placeholder="Job Title"
            className="w-full border px-3 py-2 rounded"
            value={form.title}
            onChange={(e) => setForm({ ...form, title: e.target.value })}
            required
          />
          <textarea
            placeholder="Job Description"
            className="w-full border px-3 py-2 rounded"
            rows={4}
            value={form.description}
            onChange={(e) => setForm({ ...form, description: e.target.value })}
            required
          />
          <select
            className="w-full border px-3 py-2 rounded"
            value={form.departmentId}
            onChange={(e) => setForm({ ...form, departmentId: e.target.value })}
            required
          >
            <option value="">Select Department</option>
            {departments.map((dep: any) => (
              <option key={dep._id} value={dep._id}>
                {dep.name}
              </option>
            ))}
          </select>

          <select
            className="w-full border px-3 py-2 rounded"
            value={form.roleId}
            onChange={(e) => setForm({ ...form, roleId: e.target.value })}
            required
          >
            <option value="">Select Role</option>
            {roles.map((role: any) => (
              <option key={role._id} value={role._id}>
                {role.title} ({role.department?.name || 'No Dept'})
              </option>
            ))}
          </select>

          <select
            className="w-full border px-3 py-2 rounded"
            value={form.status}
            onChange={(e) => setForm({ ...form, status: e.target.value })}
          >
            <option value="open">Open</option>
            <option value="closed">Closed</option>
          </select>
          <button
            type="submit"
            className="bg-green-600 text-white px-4 py-2 rounded-full text-sm"
          >
            {editingId ? 'Update Job' : 'Create Job'}
          </button>
        </form>
      )}

      {loading ? (
        <p>Loading jobs...</p>
      ) : (
        <div className="grid grid-cols-1 gap-4">
          {jobs.map((job) => (
            <div key={job._id} className="p-4 bg-white rounded shadow space-y-2">
              <div className="flex justify-between">
                <div>
                  <h2 className="font-semibold">{job.title}</h2>
                  <p className="text-gray-600 text-sm">{job.status}</p>
                </div>
                <button
                  onClick={() => startEdit(job)}
                  className="text-sm text-blue-600 underline"
                >
                  Edit
                </button>
              </div>
              <p className="text-sm text-gray-700">{job.description.slice(0, 200)}...</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
