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

export default function RoleSelectPage() {
  const [role, setRole] = useState('');
  const [token, setToken] = useState('');
  const [userInfo, setUserInfo] = useState<any>(null);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const router = useRouter();
  
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
      const decoded = jwtDecode(jwtFromQuery);
      console.log('Decoded token:', decoded);
      setUserInfo(decoded);
      setToken(jwtFromQuery);
      
      // Only set token in cookies, don't trigger any redirects
      setAuthToken(jwtFromQuery);
      console.log('Token set in cookies');
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
    
    if (submitting) return; // Prevent double submission
    
    setSubmitting(true);
    setError('');

    try {
      console.log('Submitting role:', role);
      const res = await fetch('http://localhost:8080/api/auth/set-role', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ role }),
      });

      const data = await res.json();
      console.log('Set role response:', data);
      
      if (!res.ok) throw new Error(data.error || 'Failed to set role');

      const newToken = data.token;
      setAuthToken(newToken);
      console.log('New token set, redirecting...');

      // Add a small delay before redirect to ensure token is set
      setTimeout(() => {
        const decoded = jwtDecode<CustomJwtPayload>(newToken);
        switch (decoded.role) {
          case 'admin':
            window.location.href = '/admin/dashboard';
            break;
          case 'hr':
            window.location.href = '/hr/dashboard';
            break;
          case 'candidate':
            window.location.href = '/candidate/dashboard';
            break;
          case 'employee':
            window.location.href = '/employee/dashboard';
            break;
          default:
            window.location.href = '/';
        }
      }, 500);
      
    } catch (err) {
      console.error('Error setting role:', err);
      setError('Failed to set role. Please try again.');
      setSubmitting(false);
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
            <p className="text-sm"><strong>Name:</strong> {userInfo.name}</p>
            <p className="text-sm"><strong>Email:</strong> {userInfo.email}</p>
            <p className="text-xs text-gray-500 mt-2">Token: {token ? 'Present' : 'Missing'}</p>
          </div>
        )}
        
        <p className="text-gray-600 mb-4 text-center">Please select your role to continue:</p>
        
        {error && (
          <div className="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded">
            {error}
          </div>
        )}
        
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