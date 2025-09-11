'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { jwtDecode } from 'jwt-decode';
import { setAuthToken } from '@/lib/cookies';

interface CustomJwtPayload {
  _id: string;
  name: string;
  email: string;
  role: string;
}

export default function SelectRolePage() {
  const [role, setRole] = useState('');
  const [token, setToken] = useState('');
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  // ✅ Base API URL from env
  const API_URL =
    process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:8080';

  useEffect(() => {
    // Get token from URL manually to avoid useSearchParams issues
    const urlParams = new URLSearchParams(window.location.search);
    const jwtFromQuery = urlParams.get('token');

    console.log('Select-role page - Token from query:', jwtFromQuery);
    console.log('Full URL:', window.location.href);

    if (!jwtFromQuery) {
      console.error('No token in select-role URL');
      router.push('/');
      return;
    }

    setToken(jwtFromQuery);
    setAuthToken(jwtFromQuery); // Store token in cookies immediately
    console.log('Token set in cookies from select-role page');
    setLoading(false);
  }, [router]);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!role) return alert('Please select a role');

    try {
      const res = await fetch(`${API_URL}/api/auth/set-role`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ role }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to set role');

      // ✅ Store updated token in cookies
      const newToken = data.token;
      setAuthToken(newToken);

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

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <p>Loading...</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center justify-center h-screen">
      <h1 className="text-xl font-bold mb-4">Select Your Role</h1>
      <p className="text-sm text-gray-600 mb-4">
        Token: {token ? 'Found' : 'Missing'}
      </p>
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
          disabled={!token}
        >
          Continue
        </button>
      </form>
    </div>
  );
}
