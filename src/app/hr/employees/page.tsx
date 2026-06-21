'use client';

import { notify } from '@/lib/notify';
import { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import api from '@/lib/api';

interface Employee {
  _id: string;
  employeeId: string;
  user: {
    name: string;
    email: string;
  };
  position: string;
  department?: {
    _id?: string;
    name: string;
  };
  manager?: {
    _id?: string;
    user?: { name: string };
    position?: string;
  };
  performanceScore: number;
  projectContribution: number;
  status: string;
  hireDate: string;
  resume?: {
    fileName: string;
    fileUrl: string;
    uploadedAt: string;
  };
  aiInsights?: {
    promotionReadiness?: {
      score: number;
      reasons: string[];
    };
    attritionRisk?: {
      score: number;
      factors: string[];
    };
    strengths: string[];
    improvementAreas: string[];
    lastAnalyzed?: string;
  };
}

type EmployeesApiResponse = { employees?: Employee[] } | Employee[];

function isAxiosError(e: unknown): e is { response?: { data?: unknown; status?: number } } {
  return typeof e === 'object' && e !== null && 'response' in e;
}

export default function EmployeesPage() {
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filters, setFilters] = useState({
    department: '',
    status: 'active',
    search: '',
  });
  const [selectedEmployee, setSelectedEmployee] = useState<Employee | null>(null);
  const [showInsights, setShowInsights] = useState(false);
  const [generatingInsights, setGeneratingInsights] = useState<string | null>(null);
  const [departments, setDepartments] = useState<Array<{ _id: string; name: string }>>([]);
  const [allEmployees, setAllEmployees] = useState<Employee[]>([]);
  const [assignForm, setAssignForm] = useState({ departmentId: '', managerId: '' });
  const [savingAssign, setSavingAssign] = useState(false);

  const fetchEmployees = useCallback(async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      if (filters.department) params.append('department', filters.department);
      if (filters.status) params.append('status', filters.status);

      const response = await api.get<EmployeesApiResponse>(`/hr/employees?${params.toString()}`);
      const listFromApi: Employee[] = Array.isArray(response.data)
        ? response.data
        : response.data?.employees || [];

      // Filter by search term (in-memory)
      let employeeList: Employee[] = listFromApi;
      if (filters.search) {
        const q = filters.search.toLowerCase();
        employeeList = employeeList.filter(
          (emp) =>
            emp.user?.name?.toLowerCase().includes(q) ||
            emp.user?.email?.toLowerCase().includes(q) ||
            emp.position?.toLowerCase().includes(q)
        );
      }

      setEmployees(employeeList);
      setAllEmployees(employeeList);
      setError(null);
    } catch (err: unknown) {
      console.error('Error fetching employees:', err);
      const data = isAxiosError(err) ? (err.response?.data as { error?: string; message?: string } | undefined) : undefined;
      const msg = data?.error || data?.message || 'Failed to fetch employees';
      setError(msg);
      setEmployees([]);
    } finally {
      setLoading(false);
    }
  }, [filters.department, filters.status, filters.search]);

  useEffect(() => {
    fetchEmployees();
  }, [fetchEmployees]);

  const openEmployeeProfile = async (employee: Employee) => {
    try {
      const [detailRes, deptRes] = await Promise.all([
        api.get<Employee>(`/hr/employees/${employee._id}`),
        api.get<Array<{ _id: string; name: string }>>('/admin/departments'),
      ]);
      setSelectedEmployee(detailRes.data);
      setDepartments(Array.isArray(deptRes.data) ? deptRes.data : []);
      setAssignForm({
        departmentId: detailRes.data.department?._id || '',
        managerId: detailRes.data.manager?._id || '',
      });
      setShowInsights(true);
    } catch (error) {
      console.error('Error loading employee profile:', error);
      setSelectedEmployee(employee);
      setShowInsights(true);
    }
  };

  const saveAssignment = async () => {
    if (!selectedEmployee) return;
    try {
      setSavingAssign(true);
      await api.put(`/hr/employees/${selectedEmployee._id}`, {
        departmentId: assignForm.departmentId || null,
        managerId: assignForm.managerId || null,
      });
      const refreshed = await api.get<Employee>(`/hr/employees/${selectedEmployee._id}`);
      setSelectedEmployee(refreshed.data);
      await fetchEmployees();
      notify('Department and manager updated');
    } catch (error) {
      console.error('Error saving assignment:', error);
      notify('Failed to update assignment');
    } finally {
      setSavingAssign(false);
    }
  };

  const generateAIInsights = async (employeeId: string) => {
    try {
      setGeneratingInsights(employeeId);
      const response = await api.post<{ insights: Employee['aiInsights'] }>(`/employees/${employeeId}/ai-insights`);

      // Update the employee in the list with new insights
      setEmployees((prev) =>
        prev.map((emp) => (emp._id === employeeId ? { ...emp, aiInsights: response.data.insights } : emp))
      );

      // Update selected employee if it's the same one
      if (selectedEmployee?._id === employeeId) {
        setSelectedEmployee((prev) => (prev ? { ...prev, aiInsights: response.data.insights } : null));
      }
    } catch (err: unknown) {
      console.error('Error generating AI insights:', err);
      notify('Failed to generate AI insights');
    } finally {
      setGeneratingInsights(null);
    }
  };

  const getPerformanceColor = (score: number) => {
    if (score >= 80) return 'text-green-600 bg-green-100';
    if (score >= 60) return 'text-yellow-600 bg-yellow-100';
    return 'text-red-600 bg-red-100';
  };

  const getRiskColor = (score: number) => {
    if (score >= 70) return 'text-red-600 bg-red-100';
    if (score >= 40) return 'text-yellow-600 bg-yellow-100';
    return 'text-green-600 bg-green-100';
  };

  if (loading) return <div className="p-6">Loading employees...</div>;

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-4">
        <h1 className="text-xl sm:text-2xl font-bold">Employee Management</h1>
        <div className="flex flex-col xs:flex-row sm:flex-row gap-2 w-full sm:w-auto">
          <Link href="/hr/employees/new" className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 text-center text-sm">
            Add Employee
          </Link>
          <Link href="/hr/projects" className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 text-center text-sm">
            Manage Projects
          </Link>
        </div>
      </div>

      {/* Filters */}
      <div className="talora-modal-panel shadow p-4">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Search</label>
            <input
              type="text"
              value={filters.search}
              onChange={(e) => setFilters((prev) => ({ ...prev, search: e.target.value }))}
              placeholder="Name, email, or position..."
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Department</label>
            <select
              value={filters.department}
              onChange={(e) => setFilters((prev) => ({ ...prev, department: e.target.value }))}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">All Departments</option>
              <option value="engineering">Engineering</option>
              <option value="design">Design</option>
              <option value="marketing">Marketing</option>
              <option value="sales">Sales</option>
              <option value="hr">HR</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
            <select
              value={filters.status}
              onChange={(e) => setFilters((prev) => ({ ...prev, status: e.target.value }))}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">All Status</option>
              <option value="active">Active</option>
              <option value="inactive">Inactive</option>
              <option value="on-leave">On Leave</option>
            </select>
          </div>
          <div className="flex items-end">
            <button onClick={fetchEmployees} className="w-full px-4 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-700">
              Refresh
            </button>
          </div>
        </div>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <p className="text-red-600">{error}</p>
        </div>
      )}

      {/* Employee List */}
      <div className="talora-modal-panel shadow overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200">
          <h2 className="text-lg font-semibold">Employees ({employees.length})</h2>
        </div>

        {employees.length === 0 ? (
          <div className="p-8 text-center text-gray-500">
            <div className="text-4xl mb-2">👥</div>
            <p>No employees found</p>
            <Link href="/hr/employees/new" className="text-blue-600 hover:text-blue-800 text-sm">
              Add your first employee →
            </Link>
          </div>
        ) : (
          <div className="divide-y divide-gray-200">
            {employees.map((employee) => (
              <div key={employee._id} className="p-4 sm:p-6 hover:bg-gray-50">
                <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
                  <div className="flex items-center space-x-4 min-w-0">
                    <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                      <span className="text-blue-600 font-semibold">
                        {employee.user?.name?.charAt(0).toUpperCase() || 'N'}
                      </span>
                    </div>
                    <div>
                      <h3 className="font-medium text-gray-900">{employee.user?.name || 'No Name'}</h3>
                      <p className="text-sm text-gray-600">{employee.position}</p>
                      <p className="text-xs text-gray-500">
                        {employee.department?.name} • ID: {employee.employeeId}
                      </p>
                    </div>
                  </div>

                  <div className="flex flex-wrap items-center gap-3 sm:gap-4">
                    {/* Performance Score */}
                    <div className="text-center">
                      <div className={`px-2 py-1 rounded-full text-xs font-medium ${getPerformanceColor(employee.performanceScore)}`}>
                        {employee.performanceScore}%
                      </div>
                      <div className="text-xs text-gray-500 mt-1">Performance</div>
                    </div>

                    {/* Project Contribution */}
                    <div className="text-center">
                      <div className="text-sm font-medium text-gray-900">{employee.projectContribution}%</div>
                      <div className="text-xs text-gray-500">Contribution</div>
                    </div>

                    {/* AI Insights */}
                    {employee.aiInsights && (
                      <div className="text-center">
                        <div
                          className={`px-2 py-1 rounded-full text-xs font-medium ${getRiskColor(
                            employee.aiInsights.attritionRisk?.score || 0
                          )}`}
                        >
                          {employee.aiInsights.attritionRisk?.score || 0}%
                        </div>
                        <div className="text-xs text-gray-500 mt-1">Risk</div>
                      </div>
                    )}

                    {/* Actions */}
                    <div className="flex flex-wrap gap-2">
                      <button
                        onClick={() => openEmployeeProfile(employee)}
                        className="px-3 py-1 text-xs bg-blue-100 text-blue-700 rounded hover:bg-blue-200"
                      >
                        View Profile
                      </button>
                      <button
                        onClick={() => generateAIInsights(employee._id)}
                        disabled={generatingInsights === employee._id}
                        className="px-3 py-1 text-xs bg-purple-100 text-purple-700 rounded hover:bg-purple-200 disabled:opacity-50"
                      >
                        {generatingInsights === employee._id ? 'Analyzing...' : 'AI Insights'}
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Employee Details Modal */}
      {showInsights && selectedEmployee && (
        <div className="talora-modal-overlay flex items-center justify-center z-50 p-4">
          <div className="talora-modal-panel max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-gray-200">
              <div className="flex justify-between items-center">
                <div>
                  <h2 className="text-xl font-semibold">{selectedEmployee.user?.name || 'No Name'}</h2>
                  <p className="text-gray-600">
                    {selectedEmployee.position} • {selectedEmployee.department?.name}
                  </p>
                </div>
                <button onClick={() => setShowInsights(false)} className="text-gray-400 hover:text-gray-600">
                  ✕
                </button>
              </div>
            </div>

            <div className="p-6 space-y-6">
              {/* Performance Overview */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="bg-blue-50 p-4 rounded-lg">
                  <div className="text-2xl font-bold text-blue-600">{selectedEmployee.performanceScore}%</div>
                  <div className="text-sm text-blue-700">Performance Score</div>
                </div>
                <div className="bg-green-50 p-4 rounded-lg">
                  <div className="text-2xl font-bold text-green-600">{selectedEmployee.projectContribution}%</div>
                  <div className="text-sm text-green-700">Project Contribution</div>
                </div>
                <div className="bg-purple-50 p-4 rounded-lg">
                  <div className="text-2xl font-bold text-purple-600">{new Date(selectedEmployee.hireDate).getFullYear()}</div>
                  <div className="text-sm text-purple-700">Hire Year</div>
                </div>
              </div>

              {/* Assignment (HR/Admin) */}
              <div className="bg-gray-50 rounded-lg p-4 border">
                <h3 className="text-sm font-semibold text-gray-900 mb-3">Assign Department & Manager</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <select
                    value={assignForm.departmentId}
                    onChange={(e) => setAssignForm((p) => ({ ...p, departmentId: e.target.value }))}
                    className="px-3 py-2 border border-gray-300 rounded-md text-sm"
                  >
                    <option value="">No department</option>
                    {departments.map((d) => (
                      <option key={d._id} value={d._id}>{d.name}</option>
                    ))}
                  </select>
                  <select
                    value={assignForm.managerId}
                    onChange={(e) => setAssignForm((p) => ({ ...p, managerId: e.target.value }))}
                    className="px-3 py-2 border border-gray-300 rounded-md text-sm"
                  >
                    <option value="">No manager</option>
                    {allEmployees
                      .filter((e) => e._id !== selectedEmployee._id)
                      .map((e) => (
                        <option key={e._id} value={e._id}>
                          {e.user?.name} — {e.position}
                        </option>
                      ))}
                  </select>
                </div>
                <button
                  onClick={saveAssignment}
                  disabled={savingAssign}
                  className="mt-3 px-4 py-2 bg-indigo-600 text-white text-sm rounded-md hover:bg-indigo-700 disabled:opacity-50"
                >
                  {savingAssign ? 'Saving...' : 'Save Assignment'}
                </button>
              </div>

              {/* Resume */}
              {selectedEmployee.resume?.fileUrl && (
                <div className="bg-blue-50 rounded-lg p-4 border border-blue-200">
                  <h3 className="text-sm font-semibold text-blue-900 mb-1">Employee Resume</h3>
                  <p className="text-sm text-blue-800">{selectedEmployee.resume.fileName}</p>
                  <a
                    href={selectedEmployee.resume.fileUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-sm text-blue-600 hover:text-blue-800 font-medium"
                  >
                    View / Download →
                  </a>
                </div>
              )}

              {/* AI Insights */}
              {selectedEmployee.aiInsights && (
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold">🤖 AI Insights</h3>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {/* Promotion Readiness */}
                    <div className="bg-green-50 p-4 rounded-lg border border-green-200">
                      <h4 className="font-medium text-green-800 mb-2">
                        🚀 Promotion Readiness: {selectedEmployee.aiInsights.promotionReadiness?.score || 0}%
                      </h4>
                      <ul className="text-sm text-green-700 space-y-1">
                        {selectedEmployee.aiInsights.promotionReadiness?.reasons?.map((reason, index) => (
                          <li key={index}>• {reason}</li>
                        ))}
                      </ul>
                    </div>

                    {/* Attrition Risk */}
                    <div className="bg-red-50 p-4 rounded-lg border border-red-200">
                      <h4 className="font-medium text-red-800 mb-2">
                        ⚠️ Attrition Risk: {selectedEmployee.aiInsights.attritionRisk?.score || 0}%
                      </h4>
                      <ul className="text-sm text-red-700 space-y-1">
                        {selectedEmployee.aiInsights.attritionRisk?.factors?.map((factor, index) => (
                          <li key={index}>• {factor}</li>
                        ))}
                      </ul>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {/* Strengths */}
                    <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
                      <h4 className="font-medium text-blue-800 mb-2">💪 Strengths</h4>
                      <ul className="text-sm text-blue-700 space-y-1">
                        {selectedEmployee.aiInsights.strengths?.map((strength, index) => (
                          <li key={index}>• {strength}</li>
                        ))}
                      </ul>
                    </div>

                    {/* Improvement Areas */}
                    <div className="bg-orange-50 p-4 rounded-lg border border-orange-200">
                      <h4 className="font-medium text-orange-800 mb-2">📈 Improvement Areas</h4>
                      <ul className="text-sm text-orange-700 space-y-1">
                        {selectedEmployee.aiInsights.improvementAreas?.map((area, index) => (
                          <li key={index}>• {area}</li>
                        ))}
                      </ul>
                    </div>
                  </div>

                  {selectedEmployee.aiInsights.lastAnalyzed && (
                    <div className="text-xs text-gray-500">
                      Last analyzed: {new Date(selectedEmployee.aiInsights.lastAnalyzed).toLocaleString()}
                    </div>
                  )}
                </div>
              )}

              {/* Actions */}
              <div className="flex space-x-3 pt-4 border-t border-gray-200">
                <Link
                  href={`/admin/employees/${selectedEmployee._id}`}
                  className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                >
                  Full Employee Profile
                </Link>
                <Link
                  href={`/hr/feedback/new?employee=${selectedEmployee._id}`}
                  className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700"
                >
                  Give Feedback
                </Link>
                <button
                  onClick={() => generateAIInsights(selectedEmployee._id)}
                  disabled={generatingInsights === selectedEmployee._id}
                  className="px-4 py-2 bg-purple-600 text-white rounded-md hover:bg-purple-700 disabled:opacity-50"
                >
                  {generatingInsights === selectedEmployee._id ? 'Analyzing...' : 'Refresh AI Insights'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
