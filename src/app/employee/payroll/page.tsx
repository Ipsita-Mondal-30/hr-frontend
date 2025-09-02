'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/lib/AuthContext';
import api from '@/lib/api';

interface PayrollRecord {
  _id: string;
  month: string;
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

export default function EmployeePayrollPage() {
  const { user } = useAuth();
  const [payrollRecords, setPayrollRecords] = useState<PayrollRecord[]>([]);
  const [selectedRecord, setSelectedRecord] = useState<PayrollRecord | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());

  const getMonthName = (month: number) => {
    const months = [
      'January', 'February', 'March', 'April', 'May', 'June',
      'July', 'August', 'September', 'October', 'November', 'December'
    ];
    return months[month - 1];
  };

  useEffect(() => {
    if (user) {
      fetchPayrollRecords();
    }
  }, [user, selectedYear]);

  const fetchPayrollRecords = async () => {
    try {
      setLoading(true);
      
      // Fetch real payroll data from API
      const response = await api.get('/employees/me/payroll');
      const records = response.data.map((record: any) => ({
        ...record,
        month: getMonthName(record.month)
      }));
      
      setPayrollRecords(records.filter((r: any) => r.year === selectedYear));
    } catch (error) {
      console.error('Error fetching payroll records:', error);
      // Fallback to mock data if API fails
      const mockRecords: PayrollRecord[] = [
        {
          _id: '1',
          month: 'August',
          year: 2024,
          baseSalary: 75000,
          allowances: {
            housing: 15000,
            transport: 5000,
            medical: 3000,
            other: 2000
          },
          deductions: {
            tax: 12000,
            insurance: 2000,
            providentFund: 3750,
            other: 500
          },
          overtime: {
            hours: 10,
            rate: 50,
            amount: 500
          },
          bonus: 5000,
          grossSalary: 105500,
          netSalary: 87250,
          payDate: '2024-08-31',
          status: 'paid'
        },
        {
          _id: '2',
          month: 'July',
          year: 2024,
          baseSalary: 75000,
          allowances: {
            housing: 15000,
            transport: 5000,
            medical: 3000,
            other: 2000
          },
          deductions: {
            tax: 11500,
            insurance: 2000,
            providentFund: 3750,
            other: 500
          },
          overtime: {
            hours: 8,
            rate: 50,
            amount: 400
          },
          bonus: 0,
          grossSalary: 100400,
          netSalary: 82650,
          payDate: '2024-07-31',
          status: 'paid'
        },
        {
          _id: '3',
          month: 'September',
          year: 2024,
          baseSalary: 75000,
          allowances: {
            housing: 15000,
            transport: 5000,
            medical: 3000,
            other: 2000
          },
          deductions: {
            tax: 12500,
            insurance: 2000,
            providentFund: 3750,
            other: 500
          },
          overtime: {
            hours: 0,
            rate: 50,
            amount: 0
          },
          bonus: 0,
          grossSalary: 100000,
          netSalary: 81250,
          payDate: '2024-09-30',
          status: 'processing'
        }
      ];

      const filteredRecords = mockRecords.filter(record => record.year === selectedYear);
      setPayrollRecords(filteredRecords);
      
    } catch (error) {
      console.error('Error fetching payroll records:', error);
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'paid':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'processing':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'pending':
        return 'bg-gray-100 text-gray-800 border-gray-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount);
  };

  const downloadPayslip = (record: PayrollRecord) => {
    // Open the download endpoint in a new tab
    window.open(`/api/employees/me/payroll/${record._id}/download`, '_blank');
  };

  if (loading) {
    return (
      <div className="p-6">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-gray-200 rounded w-1/3"></div>
          <div className="grid grid-cols-3 gap-4">
            {[1, 2, 3].map(i => (
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
            {[2024, 2023, 2022].map(year => (
              <option key={year} value={year}>{year}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Salary Overview */}
      {payrollRecords.length > 0 && (
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-lg font-semibold mb-4">Salary Overview - {selectedYear}</h2>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
              <div className="text-2xl font-bold text-blue-600">
                {formatCurrency(payrollRecords[0]?.baseSalary || 0)}
              </div>
              <div className="text-sm text-blue-700">Base Salary</div>
            </div>
            <div className="bg-green-50 p-4 rounded-lg border border-green-200">
              <div className="text-2xl font-bold text-green-600">
                {formatCurrency(
                  payrollRecords.reduce((sum, record) => sum + record.netSalary, 0) / payrollRecords.length || 0
                )}
              </div>
              <div className="text-sm text-green-700">Avg Net Salary</div>
            </div>
            <div className="bg-purple-50 p-4 rounded-lg border border-purple-200">
              <div className="text-2xl font-bold text-purple-600">
                {formatCurrency(payrollRecords.reduce((sum, record) => sum + record.bonus, 0))}
              </div>
              <div className="text-sm text-purple-700">Total Bonus</div>
            </div>
            <div className="bg-orange-50 p-4 rounded-lg border border-orange-200">
              <div className="text-2xl font-bold text-orange-600">
                {payrollRecords.reduce((sum, record) => sum + record.overtime.hours, 0)}h
              </div>
              <div className="text-sm text-orange-700">Overtime Hours</div>
            </div>
          </div>
        </div>
      )}

      {/* Payroll Records */}
      <div className="bg-white rounded-lg shadow">
        <div className="px-6 py-4 border-b border-gray-200">
          <h2 className="text-lg font-semibold">Payroll History</h2>
        </div>
        
        {payrollRecords.length === 0 ? (
          <div className="p-8 text-center text-gray-500">
            <div className="text-4xl mb-2">💰</div>
            <p>No payroll records found for {selectedYear}</p>
          </div>
        ) : (
          <div className="divide-y divide-gray-200">
            {payrollRecords
              .sort((a, b) => new Date(b.payDate).getTime() - new Date(a.payDate).getTime())
              .map((record) => (
                <div key={record._id} className="p-6 hover:bg-gray-50">
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <div className="flex items-center space-x-3 mb-2">
                        <h3 className="text-lg font-medium text-gray-900">
                          {record.month} {record.year}
                        </h3>
                        <span className={`px-2 py-1 text-xs font-medium rounded-full border ${getStatusColor(record.status)}`}>
                          {record.status}
                        </span>
                      </div>
                      
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                        <div>
                          <span className="text-gray-500">Gross Salary:</span>
                          <div className="font-medium">{formatCurrency(record.grossSalary)}</div>
                        </div>
                        <div>
                          <span className="text-gray-500">Net Salary:</span>
                          <div className="font-medium text-green-600">{formatCurrency(record.netSalary)}</div>
                        </div>
                        <div>
                          <span className="text-gray-500">Bonus:</span>
                          <div className="font-medium">{formatCurrency(record.bonus)}</div>
                        </div>
                        <div>
                          <span className="text-gray-500">Pay Date:</span>
                          <div className="font-medium">{new Date(record.payDate).toLocaleDateString()}</div>
                        </div>
                      </div>
                    </div>
                    
                    <div className="ml-4 flex space-x-2">
                      <button
                        onClick={() => window.location.href = `/employee/payroll/${record._id}`}
                        className="px-3 py-1 text-sm bg-blue-100 text-blue-700 rounded hover:bg-blue-200"
                      >
                        View Details
                      </button>
                      <button
                        onClick={() => setSelectedRecord(record)}
                        className="px-3 py-1 text-sm bg-gray-100 text-gray-700 rounded hover:bg-gray-200"
                      >
                        Quick View
                      </button>
                      {record.status === 'paid' && (
                        <button
                          onClick={() => downloadPayslip(record)}
                          className="px-3 py-1 text-sm bg-green-100 text-green-700 rounded hover:bg-green-200"
                        >
                          Download
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              ))}
          </div>
        )}
      </div>

      {/* Payslip Details Modal */}
      {selectedRecord && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-gray-200">
              <div className="flex justify-between items-center">
                <div>
                  <h2 className="text-xl font-semibold">Payslip Details</h2>
                  <p className="text-gray-600">{selectedRecord.month} {selectedRecord.year}</p>
                </div>
                <button
                  onClick={() => setSelectedRecord(null)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  ✕
                </button>
              </div>
            </div>
            
            <div className="p-6 space-y-6">
              {/* Employee Info */}
              <div className="bg-gray-50 rounded-lg p-4">
                <h3 className="font-medium text-gray-900 mb-2">Employee Information</h3>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="text-gray-500">Name:</span>
                    <div className="font-medium">{user?.name}</div>
                  </div>
                  <div>
                    <span className="text-gray-500">Pay Period:</span>
                    <div className="font-medium">{selectedRecord.month} {selectedRecord.year}</div>
                  </div>
                </div>
              </div>

              {/* Earnings */}
              <div>
                <h3 className="font-medium text-gray-900 mb-3">Earnings</h3>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span>Base Salary</span>
                    <span className="font-medium">{formatCurrency(selectedRecord.baseSalary)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Housing Allowance</span>
                    <span className="font-medium">{formatCurrency(selectedRecord.allowances.housing)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Transport Allowance</span>
                    <span className="font-medium">{formatCurrency(selectedRecord.allowances.transport)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Medical Allowance</span>
                    <span className="font-medium">{formatCurrency(selectedRecord.allowances.medical)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Other Allowances</span>
                    <span className="font-medium">{formatCurrency(selectedRecord.allowances.other)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Overtime ({selectedRecord.overtime.hours}h @ {formatCurrency(selectedRecord.overtime.rate)}/h)</span>
                    <span className="font-medium">{formatCurrency(selectedRecord.overtime.amount)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Bonus</span>
                    <span className="font-medium">{formatCurrency(selectedRecord.bonus)}</span>
                  </div>
                  <div className="border-t pt-2 flex justify-between font-semibold">
                    <span>Gross Salary</span>
                    <span>{formatCurrency(selectedRecord.grossSalary)}</span>
                  </div>
                </div>
              </div>

              {/* Deductions */}
              <div>
                <h3 className="font-medium text-gray-900 mb-3">Deductions</h3>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span>Income Tax</span>
                    <span className="font-medium text-red-600">-{formatCurrency(selectedRecord.deductions.tax)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Health Insurance</span>
                    <span className="font-medium text-red-600">-{formatCurrency(selectedRecord.deductions.insurance)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Provident Fund</span>
                    <span className="font-medium text-red-600">-{formatCurrency(selectedRecord.deductions.providentFund)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Other Deductions</span>
                    <span className="font-medium text-red-600">-{formatCurrency(selectedRecord.deductions.other)}</span>
                  </div>
                  <div className="border-t pt-2 flex justify-between font-semibold">
                    <span>Total Deductions</span>
                    <span className="text-red-600">
                      -{formatCurrency(
                        selectedRecord.deductions.tax + 
                        selectedRecord.deductions.insurance + 
                        selectedRecord.deductions.providentFund + 
                        selectedRecord.deductions.other
                      )}
                    </span>
                  </div>
                </div>
              </div>

              {/* Net Salary */}
              <div className="bg-green-50 rounded-lg p-4 border border-green-200">
                <div className="flex justify-between items-center">
                  <span className="text-lg font-semibold text-green-800">Net Salary</span>
                  <span className="text-2xl font-bold text-green-600">
                    {formatCurrency(selectedRecord.netSalary)}
                  </span>
                </div>
              </div>

              {/* Actions */}
              <div className="flex space-x-3 pt-4 border-t border-gray-200">
                {selectedRecord.status === 'paid' && (
                  <button
                    onClick={() => downloadPayslip(selectedRecord)}
                    className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 flex items-center gap-2"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                    Download Payslip
                  </button>
                )}
                <button
                  onClick={() => setSelectedRecord(null)}
                  className="px-4 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}