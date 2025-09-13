'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { jwtDecode } from 'jwt-decode';
import { setAuthToken } from '@/lib/cookies';
import { useAuth } from '@/lib/AuthContext';

const BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || 'https://hr-system-x2uf.onrender.com';

interface DecodedJwt {
  name?: string;
  email?: string;
  role?: string;
  sub?: string;
  iat?: number;
  exp?: number;
  [key: string]: unknown;
}

function isErrorWithMessage(e: unknown): e is { message: string } {
  if (typeof e !== 'object' || e === null) return false;
  const maybe = e as { message?: unknown };
  return typeof maybe.message === 'string';
}

export default function RoleSelectPage() {
  const [role, setRole] = useState('');
  const [token, setToken] = useState('');
  const [userInfo, setUserInfo] = useState<DecodedJwt | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const router = useRouter();
  const { refreshUser } = useAuth();

  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const jwtFromQuery = urlParams.get('token');

    if (!jwtFromQuery) {
      console.error('No token in role-select URL');
      setTimeout(() => router.push('/'), 2000);
      return;
    }

    try {
      const decoded = jwtDecode<DecodedJwt>(jwtFromQuery);
      
      // If user already has a role, redirect to appropriate dashboard
      if (decoded.role && decoded.role !== null) {
        console.log('User already has role:', decoded.role, 'redirecting to dashboard');
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
      
      setUserInfo(decoded);
      setToken(jwtFromQuery);
      setAuthToken(jwtFromQuery);
    } catch (err) {
      console.error('Error decoding token:', err);
      setTimeout(() => router.push('/'), 2000);
    }
  }, [router]);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!role) {
      setError('Please select a role');
      return;
    }

    if (submitting) return;
    setSubmitting(true);
    setError('');

    try {
      // First test if backend is reachable
      const testRes = await fetch(`${BASE_URL}/api/test`);
      if (!testRes.ok) {
        throw new Error('Backend server is not running. Please check your Render deployment.');
      }

      const res = await fetch(`${BASE_URL}/api/auth/set-role`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        credentials: 'include',
        body: JSON.stringify({ role }),
      });

      const data: { token?: string; error?: string } = await res.json();

      if (!res.ok) {
        throw new Error(data.error || `Server error: ${res.status} ${res.statusText}`);
      }

      if (data.token) {
        setAuthToken(data.token);
      }

      await refreshUser();

      setTimeout(() => {
        switch (role) {
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
      }, 1000);
    } catch (err: unknown) {
      console.error('❌ Error setting role:', err);
      let errorMessage = 'Failed to set role. ';
      const msg = isErrorWithMessage(err) ? err.message : '';

      if (msg.includes('Backend server is not running')) {
        errorMessage += 'Your Render backend is not reachable.';
      } else if (msg.includes('Failed to fetch')) {
        errorMessage += 'Cannot connect to backend. Did you update the BASE_URL?';
      } else if (msg.includes('Database connection failed')) {
        errorMessage += 'Database issue. Try again later.';
      } else {
        errorMessage += msg || 'Please try again.';
      }

      setError(errorMessage);
      setSubmitting(false);
    }
  };

  if (!userInfo && !error) {
    return (
      <div className="flex items-center justify-center h-screen">
        <p>Loading user information...</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center justify-center h-screen bg-gray-50">
      <div className="bg-white p-8 rounded-lg shadow-md w-96">
        <h1 className="text-2xl font-bold mb-6 text-center">Welcome!</h1>

        {userInfo && (
          <div className="mb-6 p-4 bg-blue-50 rounded">
            <p className="text-sm"><strong>Name:</strong> {userInfo.name}</p>
            <p className="text-sm"><strong>Email:</strong> {userInfo.email}</p>
            <p className="text-xs text-gray-500 mt-2">Token: {token ? 'Present' : 'Missing'}</p>
          </div>
        )}

        {error && <div className="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded">{error}</div>}

        <form onSubmit={handleSubmit} className="space-y-4">
          <select
            className="w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:border-blue-500"
            value={role}
            onChange={(e) => {
              setRole(e.target.value);
              setError('');
            }}
            disabled={submitting}
          >
            <option value="">-- Select Role --</option>
            <option value="admin">Admin</option>
            <option value="hr">HR Manager</option>
            <option value="candidate">Job Candidate</option>
            <option value="employee">Employee</option>
          </select>

          <button
            type="submit"
            className="w-full bg-blue-600 text-white py-2 rounded hover:bg-blue-700 disabled:bg-gray-400"
            disabled={!token || !role || submitting}
          >
            {submitting ? 'Setting Role...' : 'Continue'}
          </button>
        </form>
      </div>
    </div>
  );
}
