'use client';
import { useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { getAuthToken, setAuthToken } from '@/lib/cookies';
import Link from 'next/link';

interface UserInfo {
  name?: string;
  email?: string;
  role?: 'admin' | 'hr' | 'candidate' | 'employee' | string;
  [key: string]: unknown;
}

export default function TestRedirectPage() {
  const [status, setStatus] = useState('Checking...');
  const [userInfo, setUserInfo] = useState<UserInfo | null>(null);
  const router = useRouter();
  const searchParams = useSearchParams();

  useEffect(() => {
    const token = searchParams.get('token');
    const existingToken = getAuthToken();

    console.log('🔍 Test Redirect Page');
    console.log('Token from URL:', token ? 'Present' : 'Missing');
    console.log('Existing token:', existingToken ? 'Present' : 'Missing');

    const decodeAndSet = (jwt: string) => {
      const parts = jwt.split('.');
      const payloadPart = parts;
      if (!payloadPart) {
        setStatus('Invalid token format');
        return;
      }
      try {
        const payload: UserInfo = JSON.parse(atob(parts[1]));
        setUserInfo(payload);
        console.log('👤 User info:', payload);
        setStatus(`Token set successfully! User: ${payload.name ?? 'Unknown'} (${payload.role ?? 'Unknown'})`);
      } catch {
        console.error('❌ Failed to decode token');
        setStatus('Failed to decode token');
      }
    };

    if (token) {
      console.log('💾 Setting token from URL');
      setAuthToken(token);
      if (typeof window !== 'undefined') {
        localStorage.setItem('auth_token', token);
        localStorage.setItem('token', token);
      }
      decodeAndSet(token);
      // Manual redirect only - no auto-redirect
    } else if (existingToken) {
      decodeAndSet(existingToken);
      setStatus((prev) => (prev.startsWith('Invalid') ? prev : prev.replace('set successfully', 'Using existing token')));
    } else {
      setStatus('No token found');
    }
  }, [searchParams, router]);

  const manualRedirect = (role: string) => {
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
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <div className="max-w-md w-full bg-white p-8 rounded-lg shadow">
        <h1 className="text-2xl font-bold mb-6 text-center">Redirect Test Page</h1>

        <div className="space-y-4">
          <div className="p-4 bg-blue-50 rounded">
            <p className="text-sm font-medium">Status:</p>
            <p className="text-sm">{status}</p>
          </div>

          {userInfo && (
            <div className="p-4 bg-green-50 rounded">
              <p className="text-sm font-medium">User Info:</p>
              <p className="text-sm">Name: {userInfo.name}</p>
              <p className="text-sm">Email: {userInfo.email}</p>
              <p className="text-sm">Role: {userInfo.role}</p>
              <p className="text-xs text-gray-500 mt-2">Click the button below to go to your dashboard</p>
            </div>
          )}

          {userInfo && (
            <div className="space-y-2">
              <p className="text-sm font-medium">Manual Redirect:</p>
              <button
                onClick={() => manualRedirect(String(userInfo.role))}
                className="w-full bg-blue-600 text-white py-2 px-4 rounded hover:bg-blue-700"
              >
                Go to {String(userInfo.role)} Dashboard
              </button>
            </div>
          )}

          <div className="space-y-2">
            <p className="text-sm font-medium">Test Links:</p>
            <Link href="/login" className="block text-blue-600 hover:underline text-sm">
              ← Back to Login
            </Link>
            <Link href="/auth-debug" className="block text-blue-600 hover:underline text-sm">
              Auth Debug Page
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
