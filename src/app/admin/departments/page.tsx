'use client';

import { useEffect, useState } from 'react';
import api from '@/lib/api';

interface Department {
  _id: string;
  name: string;
}

export default function DepartmentsPage() {
  const [departments, setDepartments] = useState<Department[]>([]);
  const [name, setName] = useState('');
  const [loading, setLoading] = useState(true);

  const fetchDepartments = async () => {
    const res = await api.get('/departments');
    setDepartments(res.data);
    setLoading(false);
  };

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await api.post('/departments', { name });
      setName('');
      fetchDepartments();
    } catch (err) {
      console.error('Failed to create department:', err);
    }
  };

  useEffect(() => {
    fetchDepartments();
  }, []);

  return (
    <div className="p-6">
      <h1 className="text-xl font-bold mb-4">Manage Departments</h1>

      <form onSubmit={handleCreate} className="mb-6 flex gap-4 items-center">
        <input
          type="text"
          placeholder="New Department Name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          required
          className="border px-4 py-2 rounded w-64"
        />
        <button type="submit" className="bg-blue-600 text-white px-4 py-2 rounded">
          Add Department
        </button>
      </form>

      {loading ? (
        <p>Loading...</p>
      ) : (
        <ul className="space-y-2">
          {departments.map((dept) => (
            <li key={dept._id} className="bg-white rounded shadow p-3">
              {dept.name}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
