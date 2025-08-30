'use client';

import { useState } from 'react';
import api from '@/lib/api';

export default function DebugPayrollPage() {
  const [results, setResults] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  const testAPI = async (endpoint: string) => {
    setLoading(true);
    try {
      console.log('Testing endpoint:', endpoint);
      const response = await api.get(endpoint);
      console.log('Response:', response.data);
      setResults({ success: true, data: response.data, endpoint });
    } catch (error: any) {
      console.error('Error:', error);
      setResults({ 
        success: false, 
        error: error.response?.data || error.message, 
        status: error.response?.status,
        endpoint 
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-6">Debug Payroll API</h1>
      
      <div className="space-y-4 mb-6">
        <button
          onClick={() => testAPI('/admin/payroll')}
          className="px-4 py-2 bg-blue-600 text-white rounded mr-2"
          disabled={loading}
        >
          Test /admin/payroll
        </button>
        
        <button
          onClick={() => testAPI('/admin/payroll/stats')}
          className="px-4 py-2 bg-green-600 text-white rounded mr-2"
          disabled={loading}
        >
          Test /admin/payroll/stats
        </button>
        
        <button
          onClick={() => testAPI('/hr/employees')}
          className="px-4 py-2 bg-purple-600 text-white rounded mr-2"
          disabled={loading}
        >
          Test /hr/employees
        </button>
      </div>

      {loading && (
        <div className="text-blue-600">Loading...</div>
      )}

      {results && (
        <div className="mt-6">
          <h2 className="text-lg font-semibold mb-2">Results for {results.endpoint}:</h2>
          <div className={`p-4 rounded ${results.success ? 'bg-green-100' : 'bg-red-100'}`}>
            {results.success ? (
              <pre className="text-sm overflow-auto">
                {JSON.stringify(results.data, null, 2)}
              </pre>
            ) : (
              <div>
                <div className="font-semibold text-red-700">Error (Status: {results.status})</div>
                <pre className="text-sm mt-2">
                  {JSON.stringify(results.error, null, 2)}
                </pre>
              </div>
            )}
          </div>
        </div>
      )}

      <div className="mt-8">
        <h2 className="text-lg font-semibold mb-2">Auth Debug Info:</h2>
        <div className="bg-gray-100 p-4 rounded">
          <div>Token in localStorage: {typeof window !== 'undefined' && localStorage.getItem('token') ? 'Yes' : 'No'}</div>
          <div>Auth token in localStorage: {typeof window !== 'undefined' && localStorage.getItem('auth_token') ? 'Yes' : 'No'}</div>
          <div>Cookies: {typeof window !== 'undefined' ? document.cookie || 'None' : 'Server-side'}</div>
        </div>
      </div>
    </div>
  );
}