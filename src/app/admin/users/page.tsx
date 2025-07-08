'use client';

import { useEffect, useState } from 'react';
import api from '@/lib/api';

interface User {
  _id: string;
  name: string;
  email: string;
  role: 'hr' | 'candidate' | 'admin';
}

export default function UsersPage() {
  const [users, setUsers] = useState<User[]>([]);
  const [filter, setFilter] = useState<'all' | 'hr' | 'candidate'>('all');

  const fetchUsers = async () => {
    const res = await api.get('/users');
    setUsers(res.data);
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const filteredUsers = filter === 'all' ? users : users.filter(u => u.role === filter);

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-4">
        <h1 className="text-xl font-bold">User Management</h1>
        <select
          value={filter}
          onChange={(e) => setFilter(e.target.value as any)}
          className="border px-2 py-1 rounded"
        >
          <option value="all">All</option>
          <option value="hr">HR</option>
          <option value="candidate">Candidate</option>
        </select>
      </div>

      <div className="grid grid-cols-1 gap-3">
        {filteredUsers.map((user) => (
          <div key={user._id} className="p-4 bg-white shadow rounded">
            <div className="font-medium">{user.name}</div>
            <div className="text-sm text-gray-600">{user.email}</div>
            <div className="text-xs text-gray-500 uppercase">{user.role}</div>
          </div>
        ))}
      </div>
    </div>
  );
}
