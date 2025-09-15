'use client';

import { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import api from '@/lib/api';
import { showToast } from '@/lib/toast';

interface Employee {
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
  manager?: {
    user: { name: string };
    position: string;
  };
  performanceScore: number;
  projectContribution: number;
  status: string;
  hireDate: string;
  employmentType: string;
  salary?: number;
  skills: Array<{
    name: string;
    level: string;
    verified: boolean;
  }>;
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

interface EmployeeProject {
  _id: string;
  name: string;
  status: string;
  completionPercentage: number;
  role: string;
  contributionPercentage: number;
  hoursWorked: number;
}

export default function AdminEmployeesPage() {
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedEmployee, setSelectedEmployee] = useState<Employee | null>(null);
  const [employeeProjects, setEmployeeProjects] = useState<EmployeeProject[]>([]);
  const [filters, setFilters] = useState({
    department: '',
    status: 'active',
    search: '',
  });

  const fetchEmployees = useCallback(async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      if (filters.department) params.append('department', filters.department);
      if (filters.status) params.append('status', filters.status);

      const response = await api.get(`/admin/employees?${params.toString()}`);
      let employeeList = response.data?.employees || response.data || [];

      // Filter by search term
      if (filters.search) {
        const q = filters.search.toLowerCase();
        employeeList = employeeList.filter((emp: Employee) =>
          emp.user?.name?.toLowerCase().includes(q) ||
          emp.user?.email?.toLowerCase().includes(q) ||
          emp.position?.toLowerCase().includes(q)
        );
      }

      setEmployees(employeeList);
    } catch (error) {
      console.error('Error fetching employees:', error);
    } finally {
      setLoading(false);
    }
  }, [filters.department, filters.status, filters.search]);

  useEffect(() => {
    fetchEmployees();
  }, [fetchEmployees]);

  const fetchEmployeeProjects = async (employeeId: string) => {
    try {
      const response = await api.get(`/admin/employees/${employeeId}/projects`);
      setEmployeeProjects(response.data?.projects || []);
    } catch (error) {
      console.error('Error fetching employee projects:', error);
      setEmployeeProjects([]);
    }
  };

  const generateAIInsights = async (employeeId: string) => {
    try {
      await api.post(`/admin/employees/${employeeId}/ai-insights`);
      await fetchEmployees(); // Refresh to get updated insights
    } catch (error) {
      console.error('Error generating AI insights:', error);
      showToast.error('Failed to generate AI insights');
    }
  };

  const getPerformanceColor = (score: number) => {
    if (score >= 90) return 'text-green-600 bg-green-100';
    if (score >= 80) return 'text-blue-600 bg-blue-100';
    if (score >= 70) return 'text-yellow-600 bg-yellow-100';
    if (score >= 60) return 'text-orange-600 bg-orange-100';
    return 'text-red-600 bg-red-100';
  };

  const getRiskColor = (score: number) => {
    if (score >= 70) return 'text-red-600 bg-red-100';
    if (score >= 40) return 'text-yellow-600 bg-yellow-100';
    return 'text-green-600 bg-green-100';
  };

  const handleEmployeeSelect = (employee: Employee) => {
    setSelectedEmployee(employee);
    fetchEmployeeProjects(employee._id);
  };

  if (loading) {
    return (
      <div className="p-6">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-gray-200 rounded w-1/3"></div>
          <div className="grid grid-cols-4 gap-4">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="h-20 bg-gray-200 rounded"></div>
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
          <h1 className="text-2xl font-bold text-gray-900">Employee Management</h1>
          <p className="text-gray-600">Complete oversight of all company employees</p>
        </div>
        <div className="flex space-x-2">
          <Link
            href="/admin/employees/create"
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
          >
            Add Employee
          </Link>
          <Link
            href="/admin/projects/create"
            className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700"
          >
            Create Project
          </Link>
        </div>
      </div>

      {/* Employee Overview Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
          <div className="text-2xl font-bold text-blue-600">{employees.length}</div>
          <div className="text-sm text-blue-700">Total Employees</div>
        </div>
        <div className="bg-green-50 p-4 rounded-lg border border-green-200">
          <div className="text-2xl font-bold text-green-600">
            {employees.filter((e) => e.performanceScore >= 85).length}
          </div>
          <div className="text-sm text-green-700">High Performers</div>
        </div>
        <div className="bg-purple-50 p-4 rounded-lg border border-purple-200">
          <div className="text-2xl font-bold text-purple-600">
            {Math.round(
              (employees.reduce((sum, e) => sum + e.performanceScore, 0) / employees.length) || 0
            )}
            %
          </div>
          <div className="text-sm text-purple-700">Avg Performance</div>
        </div>
        <div className="bg-orange-50 p-4 rounded-lg border border-orange-200">
          <div className="text-2xl font-bold text-orange-600">
            {
              employees.filter(
                (e) => e.aiInsights?.attritionRisk?.score && e.aiInsights.attritionRisk.score > 60
              ).length
            }
          </div>
          <div className="text-sm text-orange-700">At Risk</div>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-lg shadow p-4">
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
            <button
              onClick={fetchEmployees}
              className="w-full px-4 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-700"
            >
              Refresh
            </button>
          </div>
        </div>
      </div>

      {/* Employee List */}
      <div className="bg-white rounded-lg shadow">
        <div className="px-6 py-4 border-b border-gray-200">
          <h2 className="text-lg font-semibold">All Employees ({employees.length})</h2>
        </div>

        {employees.length === 0 ? (
          <div className="p-8 text-center text-gray-500">
            <div className="text-4xl mb-2">👥</div>
            <p>No employees found</p>
          </div>
        ) : (
          <div className="divide-y divide-gray-200">
            {employees.map((employee) => (
              <div key={employee._id} className="p-6 hover:bg-gray-50">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-4">
                    <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                      <span className="text-blue-600 font-semibold">
                        {employee.user?.name?.charAt(0).toUpperCase() || 'N'}
                      </span>
                    </div>
                    <div>
                      <h3 className="font-medium text-gray-900">{employee.user?.name || 'No Name'}</h3>
                      <p className="text-sm text-gray-600">{employee.position || 'No Position'}</p>
                      <p className="text-xs text-gray-500">
                        {employee.department?.name || 'No Department'} • ID: {employee.employeeId || 'N/A'}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center space-x-6">
                    {/* Performance Score */}
                    <div className="text-center">
                      <div
                        className={`px-3 py-1 rounded-full text-sm font-medium ${getPerformanceColor(
                          employee.performanceScore
                        )}`}
                      >
                        {employee.performanceScore}%
                      </div>
                      <div className="text-xs text-gray-500 mt-1">Performance</div>
                    </div>

                    {/* Project Contribution */}
                    <div className="text-center">
                      <div className="text-sm font-medium text-gray-900">{employee.projectContribution}%</div>
                      <div className="text-xs text-gray-500">Contribution</div>
                    </div>

                    {/* Salary */}
                    {employee.salary && (
                      <div className="text-center">
                        <div className="text-sm font-medium text-gray-900">
                          ${employee.salary.toLocaleString()}
                        </div>
                        <div className="text-xs text-gray-500">Salary</div>
                      </div>
                    )}

                    {/* AI Risk Assessment */}
                    {employee.aiInsights?.attritionRisk && (
                      <div className="text-center">
                        <div
                          className={`px-2 py-1 rounded-full text-xs font-medium ${getRiskColor(
                            employee.aiInsights.attritionRisk.score
                          )}`}
                        >
                          {employee.aiInsights.attritionRisk.score}%
                        </div>
                        <div className="text-xs text-gray-500 mt-1">Risk</div>
                      </div>
                    )}

                    {/* Actions */}
                    <div className="flex space-x-2">
                      <button
                        onClick={() => handleEmployeeSelect(employee)}
                        className="px-3 py-1 text-xs bg-blue-100 text-blue-700 rounded hover:bg-blue-200"
                      >
                        View Details
                      </button>
                      <button
                        onClick={() => generateAIInsights(employee._id)}
                        className="px-3 py-1 text-xs bg-purple-100 text-purple-700 rounded hover:bg-purple-200"
                      >
                        AI Analysis
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
      {selectedEmployee && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-6xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-gray-200">
              <div className="flex justify-between items-center">
                <div>
                  <h2 className="text-xl font-semibold">{selectedEmployee.user?.name || 'No Name'}</h2>
                  <p className="text-gray-600">
                    {selectedEmployee.position || 'No Position'} • {selectedEmployee.department?.name || 'No Department'}
                  </p>
                  <p className="text-sm text-gray-500">Employee ID: {selectedEmployee.employeeId || 'N/A'}</p>
                </div>
                <button onClick={() => setSelectedEmployee(null)} className="text-gray-400 hover:text-gray-600">
                  ✕
                </button>
              </div>
            </div>

            <div className="p-6 space-y-6">
              {/* Employee Overview */}
              <div className="grid grid-cols-1 md-grid-cols-4 md:grid-cols-4 gap-4">
                <div className="bg-blue-50 p-4 rounded-lg">
                  <div className="text-2xl font-bold text-blue-600">{selectedEmployee.performanceScore}%</div>
                  <div className="text-sm text-blue-700">Performance Score</div>
                </div>
                <div className="bg-green-50 p-4 rounded-lg">
                  <div className="text-2xl font-bold text-green-600">{selectedEmployee.projectContribution}%</div>
                  <div className="text-sm text-green-700">Project Contribution</div>
                </div>
                <div className="bg-purple-50 p-4 rounded-lg">
                  <div className="text-2xl font-bold text-purple-600">
                    {selectedEmployee.salary ? `$${selectedEmployee.salary.toLocaleString()}` : 'N/A'}
                  </div>
                  <div className="text-sm text-purple-700">Annual Salary</div>
                </div>
                <div className="bg-orange-50 p-4 rounded-lg">
                  <div className="text-2xl font-bold text-orange-600">
                    {
                      Math.floor(
                        (new Date().getTime() - new Date(selectedEmployee.hireDate).getTime()) /
                          (1000 * 60 * 60 * 24 * 365)
                      )
                    }
                    y
                  </div>
                  <div className="text-sm text-orange-700">Years at Company</div>
                </div>
              </div>

              {/* Current Projects */}
              <div>
                <h3 className="text-lg font-semibold mb-4">Current Projects</h3>
                {employeeProjects.length === 0 ? (
                  <div className="text-center py-8 text-gray-500">
                    <div className="text-4xl mb-2">📊</div>
                    <p>No projects assigned</p>
                    <Link href="/admin/projects/create" className="text-blue-600 hover:text-blue-800 text-sm">
                      Assign to a project →
                    </Link>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {employeeProjects.map((project) => (
                      <div key={project._id} className="border border-gray-200 rounded-lg p-4">
                        <div className="flex justify-between items-start mb-2">
                          <h4 className="font-medium text-gray-900">{project.name}</h4>
                          <span
                            className={`px-2 py-1 text-xs rounded-full ${
                              project.status === 'completed'
                                ? 'bg-green-100 text-green-800'
                                : project.status === 'active'
                                ? 'bg-blue-100 text-blue-800'
                                : 'bg-gray-100 text-gray-800'
                            }`}
                          >
                            {project.status}
                          </span>
                        </div>
                        <div className="text-sm text-gray-600 mb-2">
                          Role: {project.role} • {project.contributionPercentage}% contribution
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-2">
                          <div
                            className="bg-blue-600 h-2 rounded-full"
                            style={{ width: `${project.completionPercentage}%` }}
                          ></div>
                        </div>
                        <div className="text-xs text-gray-500 mt-1">
                          {project.completionPercentage}% complete • {project.hoursWorked}h worked
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* AI Insights */}
              {selectedEmployee.aiInsights && (
                <div>
                  <h3 className="text-lg font-semibold mb-4">🤖 AI Performance Insights</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {/* Promotion Readiness */}
                    <div className="bg-green-50 p-4 rounded-lg border border-green-200">
                      <h4 className="font-medium text-green-800 mb-2">
                        🚀 Promotion Readiness: {selectedEmployee.aiInsights.promotionReadiness?.score || 0}%
                      </h4>
                      <ul className="text-sm text-green-700 space-y-1">
                        {selectedEmployee.aiInsights.promotionReadiness?.reasons?.slice(0, 3).map((reason, index) => (
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
                        {selectedEmployee.aiInsights.attritionRisk?.factors?.slice(0, 3).map((factor, index) => (
                          <li key={index}>• {factor}</li>
                        ))}
                      </ul>
                    </div>
                  </div>
                </div>
              )}

              {/* Admin Actions */}
              <div className="bg-gray-50 rounded-lg p-4">
                <h4 className="font-medium text-gray-900 mb-3">Admin Actions</h4>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                  <button className="px-3 py-2 bg-blue-100 text-blue-700 rounded text-sm hover:bg-blue-200">
                    📊 Assign Project
                  </button>
                  <button className="px-3 py-2 bg-green-100 text-green-700 rounded text-sm hover:bg-green-200">
                    💰 Update Salary
                  </button>
                  <button className="px-3 py-2 bg-purple-100 text-purple-700 rounded text-sm hover:bg-purple-200">
                    📝 Give Feedback
                  </button>
                  <button className="px-3 py-2 bg-orange-100 text-orange-700 rounded text-sm hover:bg-orange-200">
                    🎯 Set OKRs
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
