'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import {jwtDecode} from 'jwt-decode';

export default function SelectRolePage() {
  const [selectedRole, setSelectedRole] = useState('');
  const router = useRouter();

  const handleRoleSelect = async () => {
    const token = localStorage.getItem('token');
    if (!token) return;

    const decoded: any = jwtDecode(token);

    const res = await fetch('http://localhost:8080/auth/set-role', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      credentials: 'include',
      body: JSON.stringify({ role: selectedRole }),
    });

    const data = await res.json();
    if (res.ok && data.token) {
      localStorage.setItem('token', data.token);

      if (selectedRole === 'admin') router.push('/admin/dashboard');
      else if (selectedRole === 'hr') router.push('/hr/dashboard');
      else if (selectedRole === 'candidate') router.push('/jobs');
      else if (selectedRole === 'employee') router.push('/employee/dashboard');
    }
  };

  return (
    <div className="p-6">
      <h2 className="text-lg font-bold mb-4">Select Your Role</h2>
      <select
        value={selectedRole}
        onChange={(e) => setSelectedRole(e.target.value)}
        className="border p-2 rounded"
      >
        <option value="">Select role</option>
        <option value="admin">Admin</option>
        <option value="hr">HR</option>
        <option value="candidate">Candidate</option>
        <option value="employee">Employee</option>
      </select>
      <button
        onClick={handleRoleSelect}
        className="ml-4 px-4 py-2 bg-blue-600 text-white rounded"
        disabled={!selectedRole}
      >
        Continue
      </button>
    </div>
  );
}
