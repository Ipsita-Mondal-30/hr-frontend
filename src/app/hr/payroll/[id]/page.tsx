'use client';

import { useState, useEffect, useCallback } from 'react';
import { useParams, useRouter } from 'next/navigation';
import api from '@/lib/api';

interface PayrollRecord {
  _id: string;
  employee: {
    _id: string;
    employeeId: string;
    user: {
      name: string;
      email: string;
    };
    position: string;
    department?: {
      name: string;
    };
  };
  month: number;
  year: number;
  baseSalary: number;
  allowances: {
    housing: number;
    transport: number;
    medical: number;
    other: number;
  };
  deductions: {
    tax: number;
    insurance: number;
    providentFund: number;
    other: number;
  };
  overtime: {
    hours: number;
    rate: number;
    amount: number;
  };
  bonus: number;
  grossSalary: number;
  netSalary: number;
  status: string;
  paymentDate?: string;
  approvedBy?: {
    name: string;
    email: string;
  };
  approvedAt?: string;
  createdAt: string;
  updatedAt: string;
}

export default function HRPayrollDetailPage() {
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const [payroll, setPayroll] = useState<PayrollRecord | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchPayrollDetails = useCallback(async () => {
    if (!params?.id) return;
    try {
      setLoading(true);
      const response = await api.get<PayrollRecord>(`/hr/payroll/${params.id}`);
      setPayroll(response.data);
    } catch (error) {
      console.error('Error fetching payroll details:', error);
      alert('Error loading payroll details');
    } finally {
      setLoading(false);
    }
  }, [params?.id]);

  useEffect(() => {
    fetchPayrollDetails();
  }, [fetchPayrollDetails]);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'paid':
        return 'bg-green-100 text-green-800';
      case 'approved':
        return 'bg-blue-100 text-blue-800';
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(amount);
  };

  const getMonthName = (month: number) => {
    const months = [
      'January', 'February', 'March', 'April', 'May', 'June',
      'July', 'August', 'September', 'October', 'November', 'December',
    ];
    return months[month - 1];
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!payroll) {
    return (
      <div className="p-6">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Payroll Not Found</h1>
          <button
            onClick={() => router.back()}
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
          >
            Go Back
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="flex justify-between items-start mb-6">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Payroll Details</h1>
            <p className="text-gray-600">
              {payroll.employee.user.name} - {getMonthName(payroll.month)} {payroll.year}
            </p>
          </div>
          <div className="flex items-center space-x-3">
            <span className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(payroll.status)}`}>
              {payroll.status.charAt(0).toUpperCase() + payroll.status.slice(1)}
            </span>
            <button
              onClick={() => router.back()}
              className="px-4 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-700"
            >
              Back
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Employee Information */}
          <div className="bg-white p-6 rounded-lg shadow">
            <h2 className="text-lg font-semibold mb-4">Employee Information</h2>
            <div className="space-y-3">
              <div>
                <label className="text-sm font-medium text-gray-500">Name</label>
                <p className="text-gray-900">{payroll.employee.user.name}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-500">Email</label>
                <p className="text-gray-900">{payroll.employee.user.email}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-500">Position</label>
                <p className="text-gray-900">{payroll.employee.position}</p>
              </div>
              {payroll.employee.department && (
                <div>
                  <label className="text-sm font-medium text-gray-500">Department</label>
                  <p className="text-gray-900">{payroll.employee.department.name}</p>
                </div>
              )}
            </div>
          </div>

          {/* Salary Breakdown */}
          <div className="bg-white p-6 rounded-lg shadow">
            <h2 className="text-lg font-semibold mb-4">Salary Breakdown</h2>
            <div className="space-y-4">
              <div className="flex justify-between">
                <span>Base Salary</span>
                <span className="font-medium">{formatCurrency(payroll.baseSalary)}</span>
              </div>
              
              <div className="border-t pt-2">
                <h3 className="font-medium text-green-600 mb-2">Allowances</h3>
                <div className="space-y-1 text-sm">
                  <div className="flex justify-between">
                    <span>Housing</span>
                    <span>{formatCurrency(payroll.allowances.housing)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Transport</span>
                    <span>{formatCurrency(payroll.allowances.transport)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Medical</span>
                    <span>{formatCurrency(payroll.allowances.medical)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Other</span>
                    <span>{formatCurrency(payroll.allowances.other)}</span>
                  </div>
                </div>
              </div>

              <div className="border-t pt-2">
                <h3 className="font-medium text-red-600 mb-2">Deductions</h3>
                <div className="space-y-1 text-sm">
                  <div className="flex justify-between">
                    <span>Tax</span>
                    <span>{formatCurrency(payroll.deductions.tax)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Insurance</span>
                    <span>{formatCurrency(payroll.deductions.insurance)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Provident Fund</span>
                    <span>{formatCurrency(payroll.deductions.providentFund)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Other</span>
                    <span>{formatCurrency(payroll.deductions.other)}</span>
                  </div>
                </div>
              </div>

              {payroll.bonus > 0 && (
                <div className="flex justify-between border-t pt-2">
                  <span>Bonus</span>
                  <span className="font-medium text-green-600">{formatCurrency(payroll.bonus)}</span>
                </div>
              )}

              <div className="border-t pt-2 space-y-2">
                <div className="flex justify-between">
                  <span>Gross Salary</span>
                  <span className="font-medium">{formatCurrency(payroll.grossSalary)}</span>
                </div>
                <div className="flex justify-between text-lg font-bold">
                  <span>Net Salary</span>
                  <span className="text-green-600">{formatCurrency(payroll.netSalary)}</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Approval Information */}
        {(payroll.approvedBy || payroll.paymentDate) && (
          <div className="mt-6 bg-white p-6 rounded-lg shadow">
            <h2 className="text-lg font-semibold mb-4">Approval Information</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {payroll.approvedBy && (
                <div>
                  <label className="text-sm font-medium text-gray-500">Approved By</label>
                  <p className="text-gray-900">{payroll.approvedBy.name}</p>
                  <p className="text-sm text-gray-500">{payroll.approvedBy.email}</p>
                </div>
              )}
              {payroll.approvedAt && (
                <div>
                  <label className="text-sm font-medium text-gray-500">Approved At</label>
                  <p className="text-gray-900">
                    {new Date(payroll.approvedAt).toLocaleString()}
                  </p>
                </div>
              )}
              {payroll.paymentDate && (
                <div>
                  <label className="text-sm font-medium text-gray-500">Payment Date</label>
                  <p className="text-gray-900">
                    {new Date(payroll.paymentDate).toLocaleDateString()}
                  </p>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}