'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { setAuthToken, removeAuthToken } from '@/lib/cookies';

export default function SetEmployeeTokenPage() {
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState('');
  const router = useRouter();

  // Employee JWT token (24 hours expiry)
  const EMPLOYEE_TOKEN = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJfaWQiOiI2OGM4MmMzYjU5MDdhNzUwNDg5M2QzMGQiLCJuYW1lIjoiQXZpIiwiZW1haWwiOiJzcml2YXN0YXZhYXZpMjZAZ21haWwuY29tIiwicm9sZSI6ImVtcGxveWVlIiwiaWF0IjoxNzU4NjA5Njg4LCJleHAiOjE3NTg2OTYwODh9.rlNLkhYZxyM-nxLewbTK1-46v4b8I0kK_BcFwkPJLdE';

  const handleSetToken = async () => {
    setIsLoading(true);
    setMessage('Setting employee token...');

    try {
      // Clear any existing tokens first
      removeAuthToken();
      localStorage.removeItem('auth_token');
      
      // Set the new employee token
      setAuthToken(EMPLOYEE_TOKEN);
      localStorage.setItem('auth_token', EMPLOYEE_TOKEN);
      
      setMessage('✅ Employee token set successfully! Redirecting to dashboard...');
      
      // Wait a moment then redirect
      setTimeout(() => {
        router.push('/employee/dashboard');
      }, 1500);
      
    } catch (error) {
      console.error('Error setting token:', error);
      setMessage('❌ Error setting token. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleClearTokens = () => {
    removeAuthToken();
    localStorage.removeItem('auth_token');
    setMessage('🗑️ All tokens cleared!');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg shadow-xl p-8 max-w-md w-full">
        <div className="text-center mb-6">
          <div className="w-16 h-16 bg-blue-600 rounded-full flex items-center justify-center mx-auto mb-4">
            <span className="text-white text-2xl font-bold">👤</span>
          </div>
          <h1 className="text-2xl font-bold text-gray-900 mb-2">
            Employee Token Setter
          </h1>
          <p className="text-gray-600">
            Set authentication token for employee dashboard access
          </p>
        </div>

        <div className="space-y-4">
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <h3 className="font-semibold text-blue-900 mb-2">Employee Details:</h3>
            <div className="text-sm text-blue-800">
              <p><strong>Name:</strong> Avi</p>
              <p><strong>Email:</strong> srivastavaavi26@gmail.com</p>
              <p><strong>Role:</strong> Employee</p>
              <p><strong>Token Expiry:</strong> 24 hours</p>
            </div>
          </div>

          <button
            onClick={handleSetToken}
            disabled={isLoading}
            className="w-full bg-blue-600 text-white py-3 px-4 rounded-lg font-semibold hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            {isLoading ? 'Setting Token...' : '🔑 Set Employee Token'}
          </button>

          <button
            onClick={handleClearTokens}
            className="w-full bg-gray-500 text-white py-2 px-4 rounded-lg font-medium hover:bg-gray-600 transition-colors"
          >
            🗑️ Clear All Tokens
          </button>

          {message && (
            <div className={`p-3 rounded-lg text-sm ${
              message.includes('✅') 
                ? 'bg-green-50 text-green-800 border border-green-200'
                : message.includes('❌')
                ? 'bg-red-50 text-red-800 border border-red-200'
                : 'bg-blue-50 text-blue-800 border border-blue-200'
            }`}>
              {message}
            </div>
          )}

          <div className="text-center pt-4">
            <p className="text-sm text-gray-500 mb-2">
              After setting the token, you'll be redirected to:
            </p>
            <a 
              href="/employee/dashboard" 
              className="text-blue-600 hover:text-blue-800 text-sm font-medium"
            >
              Employee Dashboard →
            </a>
          </div>
        </div>

        <div className="mt-6 pt-4 border-t border-gray-200">
          <div className="text-xs text-gray-500 space-y-1">
            <p><strong>Backend:</strong> https://hr-system-x2uf.onrender.com</p>
            <p><strong>Frontend:</strong> https://hr-frontend-54b2.vercel.app</p>
            <p><strong>Local Dev:</strong> http://localhost:3001</p>
          </div>
        </div>
      </div>
    </div>
  );
}