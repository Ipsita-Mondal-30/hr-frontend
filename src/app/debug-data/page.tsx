'use client';

import { useState, useEffect } from 'react';
import api from '@/lib/api';

interface User {
  _id: string;
  name?: string;
  email?: string;
  role?: string;
  isActive?: boolean;
  isVerified?: boolean;
}

interface Employee {
  _id: string;
  user?: User;
  position?: string;
  status?: string;
}

interface Payroll {
  _id: string;
  employee?: Employee;
  month: number;
  year: number;
  status: string;
  netSalary?: number;
}

function isErrorWithMessage(error: unknown): error is { message: string } {
  return typeof error === 'object' && error !== null && 'message' in error && typeof (error as { message?: unknown }).message === 'string';
}

export default function DebugDataPage() {
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [payrolls, setPayrolls] = useState<Payroll[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchData = async () => {
    try {
      setLoading(true);
      setError(null);

      // Fetch employees
      try {
        const empResponse = await api.get('/hr/employees');
        setEmployees(empResponse.data?.employees || empResponse.data || []);
      } catch (err) {
        console.error('Error fetching employees:', err);
      }

      // Fetch payrolls
      try {
        const payrollResponse = await api.get('/hr/payroll');
        setPayrolls(payrollResponse.data || []);
      } catch (err) {
        console.error('Error fetching payrolls:', err);
      }

      // Fetch users for debugging
      try {
        const userResponse = await api.get('/auth/debug-users');
        setUsers(userResponse.data?.users || []);
      } catch (err) {
        console.error('Error fetching users:', err);
      }

    } catch (err: unknown) {
      const errorMessage = isErrorWithMessage(err) ? err.message : 'An unknown error occurred';
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Data Debug Dashboard</h1>
          <p className="text-gray-600 mt-2">Debug employee, payroll, and user data issues</p>
          <button
            onClick={fetchData}
            className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
          >
            Refresh Data
          </button>
        </div>

        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
            <h3 className="text-red-800 font-medium">Error</h3>
            <p className="text-red-700">{error}</p>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Users */}
          <div className="bg-white rounded-lg shadow-sm border">
            <div className="px-6 py-4 border-b border-gray-200">
              <h2 className="text-lg font-semibold text-gray-900">
                Users ({users.length})
              </h2>
            </div>
            <div className="p-6">
              <div className="space-y-3 max-h-96 overflow-y-auto">
                {users.length === 0 ? (
                  <p className="text-gray-500 text-center py-8">No users found</p>
                ) : (
                  users.map((user, index) => (
                    <div key={user._id || index} className="p-3 bg-gray-50 rounded border">
                      <div className="text-sm">
                        <p><strong>Name:</strong> {user.name || 'No Name'}</p>
                        <p><strong>Email:</strong> {user.email || 'No Email'}</p>
                        <p><strong>Role:</strong> {user.role || 'No Role'}</p>
                        <p><strong>Active:</strong> {user.isActive ? 'Yes' : 'No'}</p>
                        <p><strong>Verified:</strong> {user.isVerified ? 'Yes' : 'No'}</p>
                        <p><strong>ID:</strong> {user._id}</p>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>

          {/* Employees */}
          <div className="bg-white rounded-lg shadow-sm border">
            <div className="px-6 py-4 border-b border-gray-200">
              <h2 className="text-lg font-semibold text-gray-900">
                Employees ({employees.length})
              </h2>
            </div>
            <div className="p-6">
              <div className="space-y-3 max-h-96 overflow-y-auto">
                {employees.length === 0 ? (
                  <p className="text-gray-500 text-center py-8">No employees found</p>
                ) : (
                  employees.map((employee, index) => (
                    <div key={employee._id || index} className="p-3 bg-gray-50 rounded border">
                      <div className="text-sm">
                        <p><strong>Name:</strong> {employee.user?.name || 'No Name'}</p>
                        <p><strong>Email:</strong> {employee.user?.email || 'No Email'}</p>
                        <p><strong>Position:</strong> {employee.position || 'No Position'}</p>
                        <p><strong>Status:</strong> {employee.status || 'No Status'}</p>
                        <p><strong>User ID:</strong> {employee.user?._id || 'No User ID'}</p>
                        <p><strong>Employee ID:</strong> {employee._id}</p>
                        {!employee.user && (
                          <p className="text-red-600 font-medium">⚠️ Missing User Reference</p>
                        )}
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>

          {/* Payrolls */}
          <div className="bg-white rounded-lg shadow-sm border">
            <div className="px-6 py-4 border-b border-gray-200">
              <h2 className="text-lg font-semibold text-gray-900">
                Payrolls ({payrolls.length})
              </h2>
            </div>
            <div className="p-6">
              <div className="space-y-3 max-h-96 overflow-y-auto">
                {payrolls.length === 0 ? (
                  <p className="text-gray-500 text-center py-8">No payrolls found</p>
                ) : (
                  payrolls.map((payroll, index) => (
                    <div key={payroll._id || index} className="p-3 bg-gray-50 rounded border">
                      <div className="text-sm">
                        <p><strong>Employee:</strong> {payroll.employee?.user?.name || 'No Name'}</p>
                        <p><strong>Email:</strong> {payroll.employee?.user?.email || 'No Email'}</p>
                        <p><strong>Period:</strong> {payroll.month}/{payroll.year}</p>
                        <p><strong>Status:</strong> {payroll.status}</p>
                        <p><strong>Net Salary:</strong> ${payroll.netSalary?.toLocaleString()}</p>
                        <p><strong>Employee ID:</strong> {payroll.employee?._id || 'No Employee ID'}</p>
                        {!payroll.employee?.user && (
                          <p className="text-red-600 font-medium">⚠️ Missing Employee/User Reference</p>
                        )}
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Data Issues Summary */}
        <div className="mt-8 bg-white rounded-lg shadow-sm border p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Data Issues Summary</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="p-4 bg-red-50 border border-red-200 rounded">
              <h3 className="font-medium text-red-900">Employees with Missing Users</h3>
              <p className="text-2xl font-bold text-red-600">
                {employees.filter(emp => !emp.user).length}
              </p>
            </div>
            <div className="p-4 bg-yellow-50 border border-yellow-200 rounded">
              <h3 className="font-medium text-yellow-900">Payrolls with Missing Employee Data</h3>
              <p className="text-2xl font-bold text-yellow-600">
                {payrolls.filter(pay => !pay.employee?.user).length}
              </p>
            </div>
            <div className="p-4 bg-blue-50 border border-blue-200 rounded">
              <h3 className="font-medium text-blue-900">Users without Employee Profiles</h3>
              <p className="text-2xl font-bold text-blue-600">
                {users.filter(user => user.role === 'employee' && !employees.find(emp => emp.user?._id === user._id)).length}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
