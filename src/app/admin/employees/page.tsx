'use client';
import TaloraLoader from '@/components/TaloraLoader';

import { notify } from '@/lib/notify';
import { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import api from '@/lib/api';
import EmployeeAIInsightsPanel, {
  type EmployeeAIInsights,
} from '@/components/employees/EmployeeAIInsightsPanel';

interface Employee {
  _id: string;
  employeeId: string;
  user: { name: string; email: string };
  position: string;
  department?: { name: string };
  performanceScore: number;
  projectContribution: number;
  status: string;
  stats?: { projectsCount: number };
  aiInsights?: EmployeeAIInsights;
}

type EmployeesResponse = { employees?: Employee[] } | Employee[];

function isApiError(err: unknown): err is { response?: { data?: { error?: string } } } {
  return typeof err === 'object' && err !== null && 'response' in err;
}

export default function AdminEmployeesPage() {
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('active');
  const [analyzingId, setAnalyzingId] = useState<string | null>(null);
  const [aiModalEmployee, setAiModalEmployee] = useState<Employee | null>(null);

  const fetchEmployees = useCallback(async () => {
    try {
      setLoading(true);
      const res = await api.get<EmployeesResponse>('/admin/employees');
      const list = Array.isArray(res.data) ? res.data : res.data?.employees || [];
      setEmployees(list);
    } catch (err) {
      console.error('Error fetching employees:', err);
      notify(isApiError(err) ? err.response?.data?.error || 'Failed to load employees' : 'Failed to load employees');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchEmployees();
  }, [fetchEmployees]);

  const runAIAnalysis = async (employee: Employee) => {
    try {
      setAnalyzingId(employee._id);
      const res = await api.post<{ insights: EmployeeAIInsights }>(
        `/admin/employees/${employee._id}/ai-insights`
      );
      const insights = res.data.insights;
      setEmployees((prev) =>
        prev.map((e) => (e._id === employee._id ? { ...e, aiInsights: insights } : e))
      );
      setAiModalEmployee({ ...employee, aiInsights: insights });
    } catch (err) {
      console.error('AI analysis failed:', err);
      notify(isApiError(err) ? err.response?.data?.error || 'AI analysis failed' : 'AI analysis failed');
    } finally {
      setAnalyzingId(null);
    }
  };

  const filtered = employees.filter((emp) => {
    const matchesStatus = !statusFilter || emp.status === statusFilter;
    const q = search.toLowerCase();
    const matchesSearch =
      !q ||
      emp.user?.name?.toLowerCase().includes(q) ||
      emp.user?.email?.toLowerCase().includes(q) ||
      emp.position?.toLowerCase().includes(q) ||
      emp.employeeId?.toLowerCase().includes(q);
    return matchesStatus && matchesSearch;
  });

  if (loading) {
    return (
      <TaloraLoader size="sm" className="min-h-64" />
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-gray-900">Employees</h1>
          <p className="text-sm sm:text-base text-gray-600">View employees and run Gemini/Cohere AI performance analysis</p>
        </div>
        <Link
          href="/hr/employees"
          className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 text-center text-sm sm:text-base shrink-0"
        >
          HR Employee Tools
        </Link>
      </div>

      <div className="talora-modal-panel shadow-sm border p-4 flex flex-col md:flex-row gap-4">
        <input
          type="text"
          placeholder="Search by name, email, position, or ID..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500"
        />
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="px-3 py-2 border border-gray-300 rounded-md"
        >
          <option value="">All statuses</option>
          <option value="active">Active</option>
          <option value="inactive">Inactive</option>
          <option value="on-leave">On leave</option>
        </select>
        <button
          onClick={fetchEmployees}
          className="px-4 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-700"
        >
          Refresh
        </button>
      </div>

      <div className="talora-modal-panel shadow-sm border overflow-hidden">
        <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Employee</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Department</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Performance</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">AI Analysis</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {filtered.map((employee) => (
              <tr key={employee._id} className="hover:bg-gray-50">
                <td className="px-6 py-4">
                  <div className="font-medium text-gray-900">{employee.user?.name}</div>
                  <div className="text-sm text-gray-500">{employee.position}</div>
                  <div className="text-xs text-gray-400">{employee.employeeId}</div>
                </td>
                <td className="px-6 py-4 text-sm text-gray-600">
                  {employee.department?.name || '—'}
                </td>
                <td className="px-6 py-4">
                  <span className="text-sm font-semibold text-blue-600">
                    {employee.performanceScore ?? 0}%
                  </span>
                </td>
                <td className="px-6 py-4">
                  {employee.aiInsights?.lastAnalyzed ? (
                    <button
                      type="button"
                      onClick={() => setAiModalEmployee(employee)}
                      className="text-left"
                    >
                      <EmployeeAIInsightsPanel insights={employee.aiInsights} compact />
                    </button>
                  ) : (
                    <span className="text-xs text-gray-400">Not analyzed yet</span>
                  )}
                </td>
                <td className="px-6 py-4">
                  <span className="px-2 py-1 text-xs rounded-full bg-green-100 text-green-800 capitalize">
                    {employee.status}
                  </span>
                </td>
                <td className="px-6 py-4">
                  <div className="flex flex-wrap gap-2">
                    <Link
                      href={`/admin/employees/${employee._id}`}
                      className="px-3 py-1 text-xs bg-blue-100 text-blue-700 rounded hover:bg-blue-200"
                    >
                      View Details
                    </Link>
                    <button
                      type="button"
                      onClick={() => runAIAnalysis(employee)}
                      disabled={analyzingId === employee._id}
                      className="px-3 py-1 text-xs bg-purple-100 text-purple-700 rounded hover:bg-purple-200 disabled:opacity-50"
                    >
                      {analyzingId === employee._id ? 'Analyzing…' : 'AI Analyze'}
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        </div>
        {filtered.length === 0 && (
          <div className="text-center py-12 text-gray-500">No employees found</div>
        )}
      </div>

      {aiModalEmployee?.aiInsights && (
        <div className="talora-modal-overlay flex items-center justify-center z-50 p-4">
          <div className="talora-modal-panel max-w-3xl w-full max-h-[90vh] overflow-y-auto p-6">
            <div className="flex justify-between items-start mb-4">
              <div>
                <h2 className="text-xl font-semibold">{aiModalEmployee.user?.name}</h2>
                <p className="text-sm text-gray-500">{aiModalEmployee.position}</p>
              </div>
              <button
                type="button"
                onClick={() => setAiModalEmployee(null)}
                className="text-gray-400 hover:text-gray-600 text-xl"
              >
                ×
              </button>
            </div>
            <EmployeeAIInsightsPanel insights={aiModalEmployee.aiInsights} />
            <div className="flex gap-3 mt-6 pt-4 border-t">
              <button
                type="button"
                onClick={() => runAIAnalysis(aiModalEmployee)}
                disabled={analyzingId === aiModalEmployee._id}
                className="px-4 py-2 bg-purple-600 text-white rounded-md hover:bg-purple-700 disabled:opacity-50"
              >
                {analyzingId === aiModalEmployee._id ? 'Re-analyzing…' : 'Refresh Analysis'}
              </button>
              <Link
                href={`/admin/employees/${aiModalEmployee._id}`}
                className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
              >
                Full Profile
              </Link>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
