'use client';

import { useState } from 'react';

export default function TestPerformancePage() {
  const [employeeId] = useState('68b2b01bb155a69cbf5f494b'); // Known employee ID

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-6">Test Performance Routes</h1>
      
      <div className="space-y-4">
        <div className="bg-white p-4 rounded border">
          <h2 className="text-lg font-semibold mb-2">Available Routes:</h2>
          <ul className="space-y-2">
            <li>
              <a 
                href={`/hr/performance/employee/${employeeId}`}
                className="text-blue-600 hover:underline"
                target="_blank"
              >
                Employee Performance Details: /hr/performance/employee/{employeeId}
              </a>
            </li>
            <li>
              <a 
                href={`/hr/performance/feedback/${employeeId}`}
                className="text-blue-600 hover:underline"
                target="_blank"
              >
                Give Feedback: /hr/performance/feedback/{employeeId}
              </a>
            </li>
            <li>
              <a 
                href="/hr/performance"
                className="text-blue-600 hover:underline"
                target="_blank"
              >
                Performance Management: /hr/performance
              </a>
            </li>
            <li>
              <a 
                href="/admin/payroll"
                className="text-blue-600 hover:underline"
                target="_blank"
              >
                Admin Payroll: /admin/payroll
              </a>
            </li>
          </ul>
        </div>

        <div className="bg-yellow-50 p-4 rounded border border-yellow-200">
          <h3 className="font-semibold text-yellow-800 mb-2">Note:</h3>
          <p className="text-yellow-700">
            These routes require authentication. Please log in first at{' '}
            <a href="/login" className="text-blue-600 hover:underline">/login</a>
          </p>
        </div>

        <div className="bg-blue-50 p-4 rounded border border-blue-200">
          <h3 className="font-semibold text-blue-800 mb-2">Employee ID for Testing:</h3>
          <p className="text-blue-700 font-mono">{employeeId}</p>
          <p className="text-blue-600 text-sm mt-1">
            This is the ID of the employee "Ipsita Mondal" in the database
          </p>
        </div>
      </div>
    </div>
  );
}