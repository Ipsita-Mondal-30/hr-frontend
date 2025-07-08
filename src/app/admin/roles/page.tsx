'use client';

import { useEffect, useState } from 'react';
import api from '@/lib/api';

interface Role {
  _id: string;
  title: string;
  department: { _id: string; name: string };
}

interface Department {
  _id: string;
  name: string;
}

export default function RolesPage() {
  const [roles, setRoles] = useState<Role[]>([]);
  const [departments, setDepartments] = useState<Department[]>([]);
  const [form, setForm] = useState({ title: '', department: '' });
  const [loading, setLoading] = useState(true);

  const fetchRoles = async () => {
    const res = await api.get('/roles');
    setRoles(res.data);
  };

  const fetchDepartments = async () => {
    const res = await api.get('/departments');
    setDepartments(res.data);
  };

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await api.post('/roles', form);
      setForm({ title: '', department: '' });
      fetchRoles();
    } catch (err) {
      console.error('Error creating role:', err);
    }
  };

  useEffect(() => {
    fetchDepartments();
    fetchRoles();
    setLoading(false);
  }, []);

  return (
    <div className="p-6">
      <h1 className="text-xl font-bold mb-4">Manage Roles</h1>

      <form onSubmit={handleCreate} className="mb-6 space-y-3">
        <input
          type="text"
          placeholder="Role Title"
          value={form.title}
          onChange={(e) => setForm({ ...form, title: e.target.value })}
          required
          className="border px-4 py-2 rounded w-full"
        />
        <select
          value={form.department}
          onChange={(e) => setForm({ ...form, department: e.target.value })}
          required
          className="border px-4 py-2 rounded w-full"
        >
          <option value="">Select Department</option>
          {departments.map((d) => (
            <option key={d._id} value={d._id}>
              {d.name}
            </option>
          ))}
        </select>
        <button type="submit" className="bg-blue-600 text-white px-4 py-2 rounded">
          Add Role
        </button>
      </form>

      {loading ? (
        <p>Loading...</p>
      ) : (
        <ul className="space-y-2">
          {roles.map((r) => (
            <li key={r._id} className="bg-white rounded shadow p-3">
              <div className="font-semibold">{r.title}</div>
              <div className="text-sm text-gray-600">Dept: {r.department?.name}</div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
