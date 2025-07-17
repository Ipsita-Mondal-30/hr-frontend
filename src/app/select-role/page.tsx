'use client';

import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { jwtDecode } from 'jwt-decode';

interface CustomJwtPayload {
  id: string;
  name: string;
  email: string;
  role: string;
}

export default function SelectRolePage() {
  const [role, setRole] = useState('');
  const [token, setToken] = useState('');
  const router = useRouter();
  const searchParams = useSearchParams();
  
  useEffect(() => {
    // 1. Check if a valid token with a role exists in localStorage
    const localToken = localStorage.getItem('token');
    if (localToken) {
      try {
        const decoded: CustomJwtPayload = jwtDecode(localToken);
        if (decoded.role) {
          // Already has a role, redirect to dashboard
          switch (decoded.role) {
            case 'admin':
              router.push('/admin/dashboard');
              return;
            case 'hr':
              router.push('/hr/dashboard');
              return;
            case 'candidate':
              router.push('/candidate/dashboard');
              return;
            case 'employee':
              router.push('/employee/dashboard');
              return;
            default:
              router.push('/');
              return;
          }
        }
      } catch (err) {
        // Invalid token, remove it
        localStorage.removeItem('token');
      }
    }

    // 2. If no valid token with role, check URL token
    const jwtFromQuery = searchParams.get('token');
    if (!jwtFromQuery) return router.push('/');
    setToken(jwtFromQuery);
    localStorage.setItem('token', jwtFromQuery); // <-- Store token immediately
  }, [searchParams, router]);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!role) return alert('Please select a role');

    try {
      const res = await fetch('http://localhost:8080/api/auth/set-role', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ role }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to set role');

      // ✅ Store updated token
      const newToken = data.token;
      localStorage.setItem('token', newToken);

      // ✅ Redirect to dashboard
      const decoded = jwtDecode<CustomJwtPayload>(newToken);
switch (decoded.role) {
        case 'admin':
          router.push('/admin/dashboard');
          break;
        case 'hr':
          router.push('/hr/dashboard');
          break;
        case 'candidate':
          router.push('/candidate/dashboard');
          break;
        case 'employee':
          router.push('/employee/dashboard');
          break;
        default:
          router.push('/');
      }
    } catch (err) {
      console.error('Error setting role:', err);
      alert('Failed to set role');
    }
  };

  return (
    <div className="flex flex-col items-center justify-center h-screen">
      <h1 className="text-xl font-bold mb-4">Select Your Role</h1>
      <form onSubmit={handleSubmit} className="space-y-4 w-64">
        <select
          className="w-full border rounded px-3 py-2"
          value={role}
          onChange={(e) => setRole(e.target.value)}
        >
          <option value="">-- Select Role --</option>
          <option value="admin">Admin</option>
          <option value="hr">HR</option>
          <option value="candidate">Candidate</option>
          <option value="employee">Employee</option>
        </select>

        <button
          type="submit"
          className="w-full bg-blue-600 text-white py-2 rounded"
        >
          Continue
        </button>
      </form>
    </div>
  );
}
