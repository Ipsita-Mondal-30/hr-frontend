'use client';

import { useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { getAuthToken, setAuthToken } from '@/lib/cookies';

export default function TestRedirectPage() {
  const [status, setStatus] = useState('Checking...');
  const [userInfo, setUserInfo] = useState<any>(null);
  const router = useRouter();
  const searchParams = useSearchParams();

  useEffect(() => {
    const token = searchParams.get('token');
    const existingToken = getAuthToken();
    
    console.log('🔍 Test Redirect Page');
    console.log('Token from URL:', token ? 'Present' : 'Missing');
    console.log('Existing token:', existingToken ? 'Present' : 'Missing');
    
    if (token) {
      console.log('💾 Setting token from URL');
      setAuthToken(token);
      localStorage.setItem('auth_token', token);
      localStorage.setItem('token', token);
      
      // Decode token to get user info
      try {
        const payload = JSON.parse(atob(token.split('.')[1]));
        setUserInfo(payload);
        console.log('👤 User info:', payload);
        
        setStatus(`Token set successfully! User: ${payload.name} (${payload.role})`);
        
        // Manual redirect only - no auto-redirect
        
      } catch (err) {
        console.error('❌ Failed to decode token:', err);
        setStatus('Failed to decode token');
      }
    } else if (existingToken) {
      try {
        const payload = JSON.parse(atob(existingToken.split('.')[1]));
        setUserInfo(payload);
        setStatus(`Using existing token! User: ${payload.name} (${payload.role})`);
      } catch (err) {
        setStatus('Invalid existing token');
      }
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
              <p className="text-xs text-gray-500 mt-2">
                Click the button below to go to your dashboard
              </p>
            </div>
          )}
          
          {userInfo && (
            <div className="space-y-2">
              <p className="text-sm font-medium">Manual Redirect:</p>
              <button
                onClick={() => manualRedirect(userInfo.role)}
                className="w-full bg-blue-600 text-white py-2 px-4 rounded hover:bg-blue-700"
              >
                Go to {userInfo.role} Dashboard
              </button>
            </div>
          )}
          
          <div className="space-y-2">
            <p className="text-sm font-medium">Test Links:</p>
            <a href="/login" className="block text-blue-600 hover:underline text-sm">
              ← Back to Login
            </a>
            <a href="/auth-debug" className="block text-blue-600 hover:underline text-sm">
              Auth Debug Page
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}