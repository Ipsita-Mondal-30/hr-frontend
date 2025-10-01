'use client';

import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '@/lib/AuthContext';
import api from '@/lib/api';
import { DollarSign, TrendingUp, Target, Calendar } from 'lucide-react';

interface PayrollRecord {
  _id: string;
  month: string; // after mapping to month name
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
  payDate: string;
  status: 'pending' | 'paid' | 'processing';
}

type ApiPayrollRecord = Omit<PayrollRecord, 'month'> & { month: number; createdAt?: string };

export default function EmployeePayrollPage() {
  const { user } = useAuth();
  const [payrollRecords, setPayrollRecords] = useState<PayrollRecord[]>([]);
  const [selectedRecord, setSelectedRecord] = useState<PayrollRecord | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());

  const getMonthName = (month: number) => {
    const months = [
      'January', 'February', 'March', 'April', 'May', 'June',
      'July', 'August', 'September', 'October', 'November', 'December',
    ];
    return months[month - 1];
  };

  const fetchPayrollRecords = useCallback(async () => {
    if (!user) return;

    try {
      setLoading(true);
      const response = await api.get(`/employee/payroll?year=${selectedYear}`);
      const records: ApiPayrollRecord[] = response.data || [];

      // Transform month number to month name
      const transformedRecords: PayrollRecord[] = records.map(record => ({
        ...record,
        month: getMonthName(record.month),
        payDate: record.createdAt || new Date().toISOString(),
      }));

      setPayrollRecords(transformedRecords);
    } catch (error) {
      console.error('Error fetching payroll records:', error);
      setPayrollRecords([]);
    } finally {
      setLoading(false);
    }
  }, [user, selectedYear]);

  useEffect(() => {
    fetchPayrollRecords();
  }, [fetchPayrollRecords]);

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(amount);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'paid':
        return 'bg-green-100 text-green-800';
      case 'processing':
        return 'bg-blue-100 text-blue-800';
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const downloadPayslip = (recordId: string) => {
    // In a real app, this would generate and download a PDF
    window.open(`/api/employee/payroll/${recordId}/download`, '_blank');
  };

  const currentYear = new Date().getFullYear();
  const years = Array.from({ length: 5 }, (_, i) => currentYear - i);

  if (loading) {
    return (
      <div className="p-6">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-gray-200 rounded w-1/3"></div>
          <div className="grid grid-cols-3 gap-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-32 bg-gray-200 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Payroll & Salary</h1>
          <p className="text-gray-600">View your salary details and download payslips</p>
        </div>
        <div className="flex items-center space-x-4">
          <select
            value={selectedYear}
            onChange={(e) => setSelectedYear(parseInt(e.target.value))}
            className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            {years.map((year) => (
              <option key={year} value={year}>
                {year}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Summary Cards */}
      {payrollRecords.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white p-6 rounded-lg shadow">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <div className="w-8 h-8 bg-emerald-500 rounded-lg flex items-center justify-center">
                  <DollarSign className="w-4 h-4 text-white" />
                </div>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Total Earned (YTD)</p>
                <p className="text-2xl font-bold text-gray-900">
                  {formatCurrency(
                    payrollRecords.reduce((sum, record) => sum + record.netSalary, 0)
                  )}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white p-6 rounded-lg shadow">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <div className="w-8 h-8 bg-blue-500 rounded-lg flex items-center justify-center">
                  <TrendingUp className="w-4 h-4 text-white" />
                </div>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Average Monthly</p>
                <p className="text-2xl font-bold text-gray-900">
                  {formatCurrency(
                    payrollRecords.length > 0
                      ? payrollRecords.reduce((sum, record) => sum + record.netSalary, 0) / payrollRecords.length
                      : 0
                  )}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white p-6 rounded-lg shadow">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <div className="w-8 h-8 bg-purple-500 rounded-lg flex items-center justify-center">
                  <Target className="w-4 h-4 text-white" />
                </div>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Payslips</p>
                <p className="text-2xl font-bold text-gray-900">{payrollRecords.length}</p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Payroll Records */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200">
          <h2 className="text-lg font-semibold text-gray-900">Payroll History</h2>
        </div>

        {payrollRecords.length === 0 ? (
          <div className="p-12 text-center">
            <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <DollarSign className="w-8 h-8 text-slate-400" />
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">No Payroll Records</h3>
            <p className="text-gray-600">No payroll records found for {selectedYear}</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Period
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Gross Salary
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Deductions
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Net Salary
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {payrollRecords.map((record) => (
                  <tr key={record._id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div>
                        <div className="text-sm font-medium text-gray-900">
                          {record.month} {record.year}
                        </div>
                        <div className="text-sm text-gray-500">
                          {new Date(record.payDate).toLocaleDateString()}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {formatCurrency(record.grossSalary)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {formatCurrency(
                        Object.values(record.deductions).reduce((sum, val) => sum + val, 0)
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      {formatCurrency(record.netSalary)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(record.status)}`}>
                        {record.status.charAt(0).toUpperCase() + record.status.slice(1)}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium space-x-2">
                      <button
                        onClick={() => setSelectedRecord(record)}
                        className="text-indigo-600 hover:text-indigo-900"
                      >
                        View Details
                      </button>
                      {record.status === 'paid' && (
                        <button
                          onClick={() => downloadPayslip(record._id)}
                          className="text-green-600 hover:text-green-900"
                        >
                          Download
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Payroll Detail Modal */}
      {selectedRecord && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-start mb-6">
              <div>
                <h2 className="text-xl font-bold text-gray-900">Payroll Details</h2>
                <p className="text-gray-600">{selectedRecord.month} {selectedRecord.year}</p>
              </div>
              <button
                onClick={() => setSelectedRecord(null)}
                className="text-gray-400 hover:text-gray-600"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <div className="space-y-6">
              {/* Salary Breakdown */}
              <div>
                <h3 className="text-lg font-semibold mb-4">Salary Breakdown</h3>
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span>Base Salary</span>
                    <span className="font-medium">{formatCurrency(selectedRecord.baseSalary)}</span>
                  </div>

                  <div className="border-t pt-3">
                    <h4 className="font-medium text-green-600 mb-2">Allowances</h4>
                    <div className="space-y-1 text-sm pl-4">
                      <div className="flex justify-between">
                        <span>Housing</span>
                        <span>{formatCurrency(selectedRecord.allowances.housing)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Transport</span>
                        <span>{formatCurrency(selectedRecord.allowances.transport)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Medical</span>
                        <span>{formatCurrency(selectedRecord.allowances.medical)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Other</span>
                        <span>{formatCurrency(selectedRecord.allowances.other)}</span>
                      </div>
                    </div>
                  </div>

                  <div className="border-t pt-3">
                    <h4 className="font-medium text-red-600 mb-2">Deductions</h4>
                    <div className="space-y-1 text-sm pl-4">
                      <div className="flex justify-between">
                        <span>Tax</span>
                        <span>{formatCurrency(selectedRecord.deductions.tax)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Insurance</span>
                        <span>{formatCurrency(selectedRecord.deductions.insurance)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Provident Fund</span>
                        <span>{formatCurrency(selectedRecord.deductions.providentFund)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Other</span>
                        <span>{formatCurrency(selectedRecord.deductions.other)}</span>
                      </div>
                    </div>
                  </div>

                  {selectedRecord.bonus > 0 && (
                    <div className="flex justify-between border-t pt-3">
                      <span>Bonus</span>
                      <span className="font-medium text-green-600">{formatCurrency(selectedRecord.bonus)}</span>
                    </div>
                  )}

                  <div className="border-t pt-3 space-y-2">
                    <div className="flex justify-between">
                      <span>Gross Salary</span>
                      <span className="font-medium">{formatCurrency(selectedRecord.grossSalary)}</span>
                    </div>
                    <div className="flex justify-between text-lg font-bold">
                      <span>Net Salary</span>
                      <span className="text-green-600">{formatCurrency(selectedRecord.netSalary)}</span>
                    </div>
                  </div>
                </div>
              </div>

              <div className="flex justify-end space-x-3">
                <button
                  onClick={() => setSelectedRecord(null)}
                  className="px-4 py-2 bg-gray-300 text-gray-700 rounded-md hover:bg-gray-400"
                >
                  Close
                </button>
                {selectedRecord.status === 'paid' && (
                  <button
                    onClick={() => downloadPayslip(selectedRecord._id)}
                    className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700"
                  >
                    Download Payslip
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}