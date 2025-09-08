'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { jwtDecode } from 'jwt-decode';
import { setAuthToken } from '@/lib/cookies';
import { useAuth } from '@/lib/AuthContext';

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
  return typeof e === 'object' && e !== null && 'message' in e && typeof (e as any).message === 'string';
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
    // Get token from URL
    const urlParams = new URLSearchParams(window.location.search);
    const jwtFromQuery = urlParams.get('token');

    console.log('Role-select page - Token from query:', jwtFromQuery);

    if (!jwtFromQuery) {
      console.error('No token in role-select URL');
      // Don't redirect immediately, give user a chance to see the error
      setTimeout(() => router.push('/'), 2000);
      return;
    }

    try {
      const decoded = jwtDecode<DecodedJwt>(jwtFromQuery);
      console.log('Decoded token:', decoded);
      setUserInfo(decoded);
      setToken(jwtFromQuery);

      // Only set token in cookies, don't trigger any redirects
      setAuthToken(jwtFromQuery);
      console.log('Token set in cookies');
    } catch (err: unknown) {
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

    if (submitting) return; // Prevent double submission

    setSubmitting(true);
    setError('');

    try {
      console.log('🔄 Submitting role:', role);
      console.log('🔑 Using token:', token ? 'Present' : 'Missing');

      // First test if backend is reachable
      const testRes = await fetch('http://localhost:8080/api/test', {
        method: 'GET',
      });

      if (!testRes.ok) {
        throw new Error('Backend server is not running. Please start the backend server.');
      }

      console.log('✅ Backend server is reachable');

      const res = await fetch('http://localhost:8080/api/auth/set-role', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        credentials: 'include', // Include cookies
        body: JSON.stringify({ role }),
      });

      const data: { token?: string; error?: string } = await res.json();
      console.log('📝 Set role response:', data);

      if (!res.ok) {
        throw new Error(data.error || `Server error: ${res.status} ${res.statusText}`);
      }

      const newToken = data.token;
      if (newToken) {
        setAuthToken(newToken);
      }
      console.log('✅ New token set, refreshing user context...');

      // Refresh the user context with the new role
      await refreshUser();

      // Add a small delay before redirect to ensure context is updated
      setTimeout(() => {
        console.log('🎯 Redirecting to:', role, 'dashboard');

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
        errorMessage += 'The backend server is not running. Please start it and try again.';
      } else if (msg.includes('Failed to fetch')) {
        errorMessage += 'Cannot connect to server. Please check if the backend is running on port 8080.';
      } else if (msg.includes('Database connection failed')) {
        errorMessage += 'Database connection issue. Please try again in a moment.';
      } else {
        errorMessage += msg || 'Please try again.';
      }

      setError(errorMessage);
      setSubmitting(false);

      // Auto-retry after 3 seconds for database connection issues
      if (msg.includes('Database connection failed')) {
        setTimeout(() => {
          console.log('🔄 Auto-retrying after database connection issue...');
          setError('Retrying...');
          // Re-run submit without reusing the event (construct a dummy submit)
          handleSubmit(new Event('submit') as unknown as React.FormEvent<HTMLFormElement>);
        }, 3000);
      }
    }
  };

  // Don't render anything if we don't have user info yet
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
            <p className="text-sm">
              <strong>Name:</strong> {userInfo.name}
            </p>
            <p className="text-sm">
              <strong>Email:</strong> {userInfo.email}
            </p>
            <p className="text-xs text-gray-500 mt-2">Token: {token ? 'Present' : 'Missing'}</p>
          </div>
        )}

        <p className="text-gray-600 mb-4 text-center">Please select your role to continue:</p>

        {error && <div className="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded">{error}</div>}

        <form onSubmit={handleSubmit} className="space-y-4">
          <select
            className="w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:border-blue-500"
            value={role}
            onChange={(e) => {
              setRole(e.target.value);
              setError(''); // Clear error when user selects a role
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
