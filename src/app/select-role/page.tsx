'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import api from '@/lib/api';

export default function SelectRolePage() {
  const [role, setRole] = useState('');
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!role) return alert('Please select a role');

    try {
      await api.post('/auth/set-role', { role });
      
      // Redirect based on role
      if (role === 'admin') router.push('/admin/dashboard');
      else if (role === 'hr') router.push('/hr/dashboard');
      else router.push('/jobs'); // for candidate
    } catch (err) {
      console.error('Failed to set role', err);
      alert('Failed to set role. Try again.');
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <form onSubmit={handleSubmit} className="bg-white p-8 rounded-xl shadow-md space-y-6 w-full max-w-md">
        <h1 className="text-2xl font-bold">Select Your Role</h1>
        
        <select
          value={role}
          onChange={(e) => setRole(e.target.value)}
          className="w-full p-2 border rounded"
        >
          <option value="">-- Select Role --</option>
          <option value="admin">Admin (Director)</option>
          <option value="hr">HR</option>
          <option value="candidate">Candidate</option>
        </select>

        <button
          type="submit"
          className="w-full bg-blue-600 text-white py-2 px-4 rounded hover:bg-blue-700"
        >
          Continue
        </button>
      </form>
    </div>
  );
}
