'use client';

import { useState, useEffect } from 'react';
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

export default function EmployeePayrollDetailPage() {
  const params = useParams();
  const router = useRouter();
  const [payroll, setPayroll] = useState<PayrollRecord | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (params.id) {
      fetchPayrollDetails();
    }
  }, [params.id]);

  const fetchPayrollDetails = async () => {
    try {
      setLoading(true);
      const response = await api.get(`/employees/me/payroll/${params.id}`);
      setPayroll(response.data);
    } catch (error) {
      console.error('Error fetching payroll details:', error);
      alert('Error loading payroll details');
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'approved': return 'bg-green-100 text-green-800';
      case 'paid': return 'bg-blue-100 text-blue-800';
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount);
  };

  const getMonthName = (month: number) => {
    const months = [
      'January', 'February', 'March', 'April', 'May', 'June',
      'July', 'August', 'September', 'October', 'November', 'December'
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
            <h1 className="text-2xl font-bold text-gray-900">My Payslip</h1>
            <p className="text-gray-600">
              {getMonthName(payroll.month)} {payroll.year}
            </p>
          </div>
          <div className="flex items-center space-x-3">
            <span className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(payroll.status)}`}>
              {payroll.status.charAt(0).toUpperCase() + payroll.status.slice(1)}
            </span>
            <button
              onClick={() => router.back()}
              className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
            >
              Back
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Employee Information */}
          <div className="bg-white p-6 rounded-lg shadow">
            <h2 className="text-lg font-semibold mb-4">Employee Information</h2>
            <div className="space-y-3">
              <div>
                <label className="text-sm font-medium text-gray-500">Name</label>
                <p className="text-gray-900">{payroll.employee.user.name}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-500">Employee ID</label>
                <p className="text-gray-900">{payroll.employee.employeeId}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-500">Position</label>
                <p className="text-gray-900">{payroll.employee.position}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-500">Department</label>
                <p className="text-gray-900">{payroll.employee.department?.name || 'N/A'}</p>
              </div>
            </div>
          </div>

          {/* Salary Breakdown */}
          <div className="lg:col-span-2 space-y-6">
            {/* Earnings */}
            <div className="bg-white p-6 rounded-lg shadow">
              <h2 className="text-lg font-semibold mb-4">Earnings</h2>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-gray-500">Base Salary</label>
                  <p className="text-lg font-semibold text-gray-900">{formatCurrency(payroll.baseSalary)}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-500">Bonus</label>
                  <p className="text-lg font-semibold text-gray-900">{formatCurrency(payroll.bonus)}</p>
                </div>
              </div>
              
              <h3 className="text-md font-medium mt-4 mb-2">Allowances</h3>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm text-gray-500">Housing</label>
                  <p className="font-medium">{formatCurrency(payroll.allowances.housing)}</p>
                </div>
                <div>
                  <label className="text-sm text-gray-500">Transport</label>
                  <p className="font-medium">{formatCurrency(payroll.allowances.transport)}</p>
                </div>
                <div>
                  <label className="text-sm text-gray-500">Medical</label>
                  <p className="font-medium">{formatCurrency(payroll.allowances.medical)}</p>
                </div>
                <div>
                  <label className="text-sm text-gray-500">Other</label>
                  <p className="font-medium">{formatCurrency(payroll.allowances.other)}</p>
                </div>
              </div>

              {payroll.overtime.hours > 0 && (
                <>
                  <h3 className="text-md font-medium mt-4 mb-2">Overtime</h3>
                  <div className="grid grid-cols-3 gap-4">
                    <div>
                      <label className="text-sm text-gray-500">Hours</label>
                      <p className="font-medium">{payroll.overtime.hours}</p>
                    </div>
                    <div>
                      <label className="text-sm text-gray-500">Rate</label>
                      <p className="font-medium">{formatCurrency(payroll.overtime.rate)}</p>
                    </div>
                    <div>
                      <label className="text-sm text-gray-500">Amount</label>
                      <p className="font-medium">{formatCurrency(payroll.overtime.amount)}</p>
                    </div>
                  </div>
                </>
              )}
            </div>

            {/* Deductions */}
            <div className="bg-white p-6 rounded-lg shadow">
              <h2 className="text-lg font-semibold mb-4">Deductions</h2>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm text-gray-500">Tax</label>
                  <p className="font-medium text-red-600">{formatCurrency(payroll.deductions.tax)}</p>
                </div>
                <div>
                  <label className="text-sm text-gray-500">Insurance</label>
                  <p className="font-medium text-red-600">{formatCurrency(payroll.deductions.insurance)}</p>
                </div>
                <div>
                  <label className="text-sm text-gray-500">Provident Fund</label>
                  <p className="font-medium text-red-600">{formatCurrency(payroll.deductions.providentFund)}</p>
                </div>
                <div>
                  <label className="text-sm text-gray-500">Other</label>
                  <p className="font-medium text-red-600">{formatCurrency(payroll.deductions.other)}</p>
                </div>
              </div>
            </div>

            {/* Summary */}
            <div className="bg-white p-6 rounded-lg shadow">
              <h2 className="text-lg font-semibold mb-4">Summary</h2>
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Gross Salary</span>
                  <span className="font-semibold">{formatCurrency(payroll.grossSalary)}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Total Deductions</span>
                  <span className="font-semibold text-red-600">
                    -{formatCurrency(Object.values(payroll.deductions).reduce((sum, val) => sum + val, 0))}
                  </span>
                </div>
                <hr />
                <div className="flex justify-between items-center">
                  <span className="text-lg font-semibold">Net Salary</span>
                  <span className="text-lg font-bold text-green-600">{formatCurrency(payroll.netSalary)}</span>
                </div>
              </div>
            </div>

            {/* Payment Information */}
            <div className="bg-white p-6 rounded-lg shadow">
              <h2 className="text-lg font-semibold mb-4">Payment Information</h2>
              <div className="space-y-2">
                <div>
                  <label className="text-sm font-medium text-gray-500">Status</label>
                  <p className="text-gray-900 capitalize">{payroll.status}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-500">Generated On</label>
                  <p className="text-gray-900">
                    {new Date(payroll.createdAt).toLocaleDateString()}
                  </p>
                </div>
                {payroll.paymentDate && (
                  <div>
                    <label className="text-sm font-medium text-gray-500">Payment Date</label>
                    <p className="text-gray-900">
                      {new Date(payroll.paymentDate).toLocaleDateString()}
                    </p>
                  </div>
                )}
                {payroll.approvedBy && (
                  <div>
                    <label className="text-sm font-medium text-gray-500">Approved By</label>
                    <p className="text-gray-900">{payroll.approvedBy.name}</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Download/Print Actions */}
        <div className="mt-6 flex justify-center space-x-4">
          <button
            onClick={() => window.print()}
            className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
          >
            Print Payslip
          </button>
          <button
            onClick={() => alert('Download feature coming soon!')}
            className="px-6 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
          >
            Download PDF
          </button>
        </div>
      </div>
    </div>
  );
}