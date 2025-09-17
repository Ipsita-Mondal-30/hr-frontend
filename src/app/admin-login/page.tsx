'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function AdminLoginPage() {
  const [email, setEmail] = useState('admin@company.com');
  const [password, setPassword] = useState('admin123');
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      // For testing, we'll create a mock token and store it
      const mockToken = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJfaWQiOiI2ODlmMzhlNWNjZmVlNjNmODcyMGYxZWYiLCJlbWFpbCI6ImFkbWluQGNvbXBhbnkuY29tIiwicm9sZSI6ImFkbWluIiwiaWF0IjoxNzU1MzEzODk3LCJleHAiOjE3NTU5MTg2OTd9.k9p19gwpWvzf2W04BasuUxQCLvh-42zF3RzpKPjwByA';
      
      // Store token in localStorage
      localStorage.setItem('token', mockToken);
      localStorage.setItem('auth_token', mockToken);
      
      // Also set as cookie
      document.cookie = `token=${mockToken}; path=/; max-age=${7 * 24 * 60 * 60}`;
      document.cookie = `auth_token=${mockToken}; path=/; max-age=${7 * 24 * 60 * 60}`;
      
      console.log('✅ Admin token set successfully');
      
      // Redirect to admin dashboard
      router.push('/admin/dashboard');
      
    } catch (error) {
      console.error('Login error:', error);
      alert('Login failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleQuickAccess = (role: string) => {
    const tokens = {
      admin: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJfaWQiOiI2ODlmMzhlNWNjZmVlNjNmODcyMGYxZWYiLCJlbWFpbCI6ImFkbWluQGNvbXBhbnkuY29tIiwicm9sZSI6ImFkbWluIiwiaWF0IjoxNzU1MzEzODk3LCJleHAiOjE3NTU5MTg2OTd9.k9p19gwpWvzf2W04BasuUxQCLvh-42zF3RzpKPjwByA',
      hr: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJfaWQiOiI2ODlmMzhlNWNjZmVlNjNmODcyMGYxZjEiLCJlbWFpbCI6ImhyQGNvbXBhbnkuY29tIiwicm9sZSI6ImhyIiwiaWF0IjoxNzU1MzEzODk3LCJleHAiOjE3NTU5MTg2OTd9.example',
      candidate: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJfaWQiOiI2ODlmMzhlNWNjZmVlNjNmODcyMGYxZjciLCJlbWFpbCI6ImpvaG5AZXhhbXBsZS5jb20iLCJyb2xlIjoiY2FuZGlkYXRlIiwiaWF0IjoxNzU1MzEzODk3LCJleHAiOjE3NTU5MTg2OTd9.example'
    };

    const token = tokens[role as keyof typeof tokens];
    
    // Store token
    localStorage.setItem('token', token);
    localStorage.setItem('auth_token', token);
    document.cookie = `token=${token}; path=/; max-age=${7 * 24 * 60 * 60}`;
    document.cookie = `auth_token=${token}; path=/; max-age=${7 * 24 * 60 * 60}`;
    
    // Redirect based on role
    const redirects = {
      admin: '/admin/dashboard',
      hr: '/hr/dashboard',
      candidate: '/candidate/dashboard'
    };
    
    router.push(redirects[role as keyof typeof redirects]);
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <div className="max-w-md w-full space-y-8">
        <div>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
            Admin Access
          </h2>
          <p className="mt-2 text-center text-sm text-gray-600">
            Quick access for testing the HR platform
          </p>
        </div>
        
        <form className="mt-8 space-y-6" onSubmit={handleLogin}>
          <div className="rounded-md shadow-sm -space-y-px">
            <div>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-t-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                placeholder="Email address"
              />
            </div>
            <div>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-b-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                placeholder="Password"
              />
            </div>
          </div>

          <div>
            <button
              type="submit"
              disabled={loading}
              className="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50"
            >
              {loading ? 'Signing in...' : 'Sign in as Admin'}
            </button>
          </div>
        </form>

        <div className="mt-6">
          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-gray-300" />
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-2 bg-gray-50 text-gray-500">Quick Access</span>
            </div>
          </div>

          <div className="mt-6 grid grid-cols-3 gap-3">
            <button
              onClick={() => handleQuickAccess('admin')}
              className="w-full inline-flex justify-center py-2 px-4 border border-gray-300 rounded-md shadow-sm bg-white text-sm font-medium text-gray-500 hover:bg-gray-50"
            >
              👑 Admin
            </button>
            <button
              onClick={() => handleQuickAccess('hr')}
              className="w-full inline-flex justify-center py-2 px-4 border border-gray-300 rounded-md shadow-sm bg-white text-sm font-medium text-gray-500 hover:bg-gray-50"
            >
              👔 HR
            </button>
            <button
              onClick={() => handleQuickAccess('candidate')}
              className="w-full inline-flex justify-center py-2 px-4 border border-gray-300 rounded-md shadow-sm bg-white text-sm font-medium text-gray-500 hover:bg-gray-50"
            >
              👤 Candidate
            </button>
          </div>
        </div>

        <div className="mt-4 text-center">
          <p className="text-xs text-gray-500">
            This sets authentication tokens for testing the platform
          </p>
        </div>
      </div>
    </div>
  );
}