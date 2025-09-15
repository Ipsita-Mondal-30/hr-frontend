'use client';

import { useEffect, useState } from 'react';
import api from '@/lib/api';
import { getAuthToken, setAuthToken } from '@/lib/cookies';

export default function QuickTestPage() {
  const [status, setStatus] = useState('Testing...');
  const [applications, setApplications] = useState([]);
  const [user, setUser] = useState(null);

  useEffect(() => {
    const runTest = async () => {
      try {
        // Step 1: Check current token
        const currentToken = getAuthToken();
        console.log('Current token:', currentToken ? 'Present' : 'Missing');
        
        if (!currentToken) {
          setStatus('No token found. Using test token...');
          
          // For testing, let's create a test HR token
          // This is a JWT token for an HR user that should work with the backend
          const testToken = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJfaWQiOiI2NzY5YzY5YzI5YzY5YzI5YzY5YzI5YzYiLCJuYW1lIjoiSFIgVGVzdCBVc2VyIiwiZW1haWwiOiJocnRlc3RAY29tcGFueS5jb20iLCJyb2xlIjoiaHIiLCJpc1ZlcmlmaWVkIjp0cnVlLCJpYXQiOjE3NTc5MTEyMDAsImV4cCI6MTc1ODUxNjAwMH0.test-signature';
          setAuthToken(testToken);
          setStatus('Test token set. Testing API...');
        }
        
        // Step 3: Test /auth/me
        try {
          const authResponse = await api.get('/auth/me');
          setUser(authResponse.data);
          console.log('Auth successful:', authResponse.data);
          setStatus(`Authenticated as: ${authResponse.data.name} (${authResponse.data.role})`);
        } catch (authError: any) {
          console.error('Auth failed:', authError);
          setStatus(`Auth failed: ${authError.response?.status} - ${authError.response?.data?.error}`);
          return;
        }
        
        // Step 4: Test applications API
        try {
          const appsResponse = await api.get('/applications?status=pending,reviewed,shortlisted');
          setApplications(appsResponse.data);
          setStatus(`Success! Found ${appsResponse.data.length} applications`);
        } catch (appsError: any) {
          console.error('Applications API failed:', appsError);
          setStatus(`Applications API failed: ${appsError.response?.status} - ${appsError.response?.data?.error}`);
        }
        
      } catch (error: any) {
        console.error('Test failed:', error);
        setStatus(`Test failed: ${error.message}`);
      }
    };
    
    runTest();
  }, []);

  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold mb-4">Quick Authentication Test</h1>
      
      <div className="mb-4">
        <strong>Status:</strong> {status}
      </div>
      
      {user && (
        <div className="mb-4 p-4 bg-green-50 border border-green-200 rounded">
          <h2 className="font-semibold">User Info:</h2>
          <p>Name: {(user as any).name}</p>
          <p>Email: {(user as any).email}</p>
          <p>Role: {(user as any).role}</p>
        </div>
      )}
      
      {applications.length > 0 && (
        <div className="mb-4">
          <h2 className="font-semibold mb-2">Applications ({applications.length}):</h2>
          <div className="space-y-2">
            {applications.slice(0, 3).map((app: any) => (
              <div key={app._id} className="p-2 bg-gray-50 border rounded">
                <p><strong>Name:</strong> {app.name}</p>
                <p><strong>Email:</strong> {app.email}</p>
                <p><strong>Status:</strong> {app.status}</p>
                {app.job && <p><strong>Job:</strong> {app.job.title}</p>}
              </div>
            ))}
          </div>
        </div>
      )}
      
      <div className="mt-4">
        <button 
          onClick={() => window.location.href = '/hr/interviews'}
          className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
        >
          Go to HR Interviews Page
        </button>
      </div>
    </div>
  );
}
