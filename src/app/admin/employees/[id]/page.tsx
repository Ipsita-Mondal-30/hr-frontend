'use client';

import { notify } from '@/lib/notify';
import { useState, useEffect, useCallback } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import api from '@/lib/api';
import { isProjectCompleted, projectDisplayStatus } from '@/lib/projectUtils';
import EmployeeAIInsightsPanel, {
  type EmployeeAIInsights,
} from '@/components/employees/EmployeeAIInsightsPanel';

interface Employee {
  _id: string;
  employeeId: string;
  user: { name: string; email: string };
  position: string;
  department?: { _id?: string; name: string };
  manager?: { _id?: string; user: { name: string }; position: string };
  performanceScore: number;
  projectContribution: number;
  hireDate: string;
  status?: string;
  employmentType?: string;
  resume?: { fileName: string; fileUrl: string; uploadedAt: string };
  skills: Array<{ name: string; level: string; verified: boolean }>;
  stats: {
    projectsCount: number;
    okrsCount: number;
    feedbackCount: number;
    avgRating: number;
  };
  aiInsights?: EmployeeAIInsights;
}

interface Project {
  _id: string;
  name: string;
  description?: string;
  status: string;
  completionPercentage?: number;
  startDate?: string;
  endDate?: string;
  role: string;
  contributionPercentage: number;
  hoursWorked: number;
  isProjectManager?: boolean;
}

interface Department {
  _id: string;
  name: string;
}

interface ManagerOption {
  _id: string;
  user: { name: string };
  position: string;
}

function isApiError(err: unknown): err is { response?: { data?: { error?: string; message?: string } } } {
  return typeof err === 'object' && err !== null && 'response' in err;
}

function apiErrorMessage(err: unknown, fallback: string) {
  if (isApiError(err)) {
    return err.response?.data?.error || err.response?.data?.message || fallback;
  }
  return fallback;
}

function ProjectTable({ projects, emptyMessage }: { projects: Project[]; emptyMessage: string }) {
  const getProjectStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'completed':
        return 'bg-green-100 text-green-800';
      case 'active':
        return 'bg-blue-100 text-blue-800';
      case 'planning':
        return 'bg-purple-100 text-purple-800';
      case 'on-hold':
        return 'bg-yellow-100 text-yellow-800';
      case 'cancelled':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  if (projects.length === 0) {
    return <p className="text-gray-500 text-sm">{emptyMessage}</p>;
  }

  return (
    <div className="overflow-x-auto">
      <table className="min-w-full divide-y divide-gray-200">
        <thead className="bg-gray-50">
          <tr>
            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Project</th>
            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Role</th>
            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Progress</th>
            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Contribution</th>
            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Hours</th>
            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Timeline</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-200">
          {projects.map((project) => (
            <tr key={project._id}>
              <td className="px-4 py-3">
                <div className="text-sm font-medium text-gray-900">{project.name}</div>
                {project.description && (
                  <div className="text-xs text-gray-500 line-clamp-1">{project.description}</div>
                )}
              </td>
              <td className="px-4 py-3 text-sm text-gray-700 capitalize">
                {project.isProjectManager ? 'Project Manager' : project.role.replace('-', ' ')}
              </td>
              <td className="px-4 py-3">
                <span
                  className={`px-2 py-1 text-xs font-medium rounded-full ${getProjectStatusColor(
                    projectDisplayStatus(project)
                  )}`}
                >
                  {projectDisplayStatus(project).replace('-', ' ')}
                </span>
              </td>
              <td className="px-4 py-3 text-sm">{project.completionPercentage ?? 0}%</td>
              <td className="px-4 py-3 text-sm">{project.contributionPercentage}%</td>
              <td className="px-4 py-3 text-sm">{project.hoursWorked}h</td>
              <td className="px-4 py-3 text-xs text-gray-500">
                {project.startDate ? new Date(project.startDate).toLocaleDateString() : '—'}
                {project.endDate ? ` → ${new Date(project.endDate).toLocaleDateString()}` : ''}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default function EmployeeDetailPage() {
  const params = useParams();
  const router = useRouter();
  const employeeId = params.id as string;

  const [employee, setEmployee] = useState<Employee | null>(null);
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'overview' | 'projects' | 'ai' | 'performance'>('overview');
  const [showAssignModal, setShowAssignModal] = useState(false);
  const [departments, setDepartments] = useState<Department[]>([]);
  const [managerOptions, setManagerOptions] = useState<ManagerOption[]>([]);
  const [assignForm, setAssignForm] = useState({ departmentId: '', managerId: '' });
  const [savingAssign, setSavingAssign] = useState(false);
  const [generatingInsights, setGeneratingInsights] = useState(false);

  const fetchEmployeeDetails = useCallback(async () => {
    if (!employeeId) return;
    try {
      setLoading(true);
      const response = await api.get<Employee>(`/admin/employees/${employeeId}`);
      setEmployee(response.data);
    } catch (error) {
      console.error('Error fetching employee details:', error);
      notify(apiErrorMessage(error, 'Error loading employee details'));
      setEmployee(null);
    } finally {
      setLoading(false);
    }
  }, [employeeId]);

  const fetchEmployeeProjects = useCallback(async () => {
    if (!employeeId) return;
    try {
      const response = await api.get<{ projects: Project[] }>(`/admin/employees/${employeeId}/projects`);
      setProjects(response.data?.projects || []);
    } catch (error) {
      console.error('Error fetching employee projects:', error);
    }
  }, [employeeId]);

  useEffect(() => {
    fetchEmployeeDetails();
    fetchEmployeeProjects();
  }, [fetchEmployeeDetails, fetchEmployeeProjects]);

  const loadAssignOptions = async () => {
    try {
      const [deptRes, empRes] = await Promise.all([
        api.get('/admin/departments'),
        api.get('/admin/employees'),
      ]);
      setDepartments(Array.isArray(deptRes.data) ? deptRes.data : []);
      const emps = Array.isArray(empRes.data) ? empRes.data : empRes.data?.employees || [];
      setManagerOptions(emps.filter((e: ManagerOption) => e._id !== employeeId));
    } catch (error) {
      console.error('Error loading assign options:', error);
    }
  };

  const openAssignModal = async () => {
    await loadAssignOptions();
    setAssignForm({
      departmentId: employee?.department?._id || '',
      managerId: employee?.manager?._id || '',
    });
    setShowAssignModal(true);
  };

  const saveAssignment = async () => {
    if (!employee) return;
    try {
      setSavingAssign(true);
      await api.put(`/admin/employees/${employee._id}`, {
        departmentId: assignForm.departmentId || null,
        managerId: assignForm.managerId || null,
      });
      await fetchEmployeeDetails();
      setShowAssignModal(false);
      notify('Department and manager updated successfully');
    } catch (error) {
      console.error('Error saving assignment:', error);
      notify(apiErrorMessage(error, 'Failed to update assignment'));
    } finally {
      setSavingAssign(false);
    }
  };

  const generateAIInsights = async () => {
    if (!employee) return;
    try {
      setGeneratingInsights(true);
      const res = await api.post<{ insights: EmployeeAIInsights }>(
        `/admin/employees/${employee._id}/ai-insights`
      );
      setEmployee((prev) => (prev ? { ...prev, aiInsights: res.data.insights } : prev));
      setActiveTab('ai');
    } catch (error) {
      console.error('Error generating AI insights:', error);
      notify(apiErrorMessage(error, 'Failed to generate AI insights'));
    } finally {
      setGeneratingInsights(false);
    }
  };

  const getSkillLevelColor = (level: string) => {
    switch (level.toLowerCase()) {
      case 'expert':
        return 'bg-green-100 text-green-800';
      case 'advanced':
        return 'bg-blue-100 text-blue-800';
      case 'intermediate':
        return 'bg-yellow-100 text-yellow-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const activeProjects = projects.filter((p) => !isProjectCompleted(p));
  const completedProjects = projects.filter((p) => isProjectCompleted(p));

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600" />
      </div>
    );
  }

  if (!employee) {
    return (
      <div className="p-6 text-center">
        <h1 className="text-2xl font-bold text-gray-900 mb-4">Employee Not Found</h1>
        <button
          onClick={() => router.push('/admin/employees')}
          className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
        >
          Back to Employees
        </button>
      </div>
    );
  }

  return (
    <div className="p-6">
      <div className="max-w-6xl mx-auto">
        <div className="flex justify-between items-start mb-6">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">{employee.user?.name}</h1>
            <p className="text-gray-600">
              {employee.position} • {employee.department?.name || 'No Department'}
            </p>
            <p className="text-sm text-gray-500">Employee ID: {employee.employeeId}</p>
          </div>
          <div className="flex flex-wrap gap-2">
            <button
              onClick={openAssignModal}
              className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700"
            >
              Assign Dept / Manager
            </button>
            <Link
              href={`/hr/performance/employee/${employee._id}`}
              className="px-4 py-2 bg-purple-600 text-white rounded-md hover:bg-purple-700"
            >
              Performance
            </Link>
            <button
              onClick={() => router.push('/admin/employees')}
              className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
            >
              Back
            </button>
          </div>
        </div>

        <div className="border-b border-gray-200 mb-6">
          <nav className="-mb-px flex space-x-8">
            {[
              { key: 'overview', label: 'Overview' },
              { key: 'projects', label: `Projects (${projects.length})` },
              { key: 'ai', label: 'AI Analysis' },
              { key: 'performance', label: 'Admin Actions' },
            ].map((tab) => (
              <button
                key={tab.key}
                onClick={() => setActiveTab(tab.key as typeof activeTab)}
                className={`py-2 px-1 border-b-2 font-medium text-sm ${
                  activeTab === tab.key
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </nav>
        </div>

        {activeTab === 'overview' && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="bg-white p-6 rounded-lg shadow">
              <h2 className="text-lg font-semibold mb-4">Basic Information</h2>
              <div className="space-y-3 text-sm">
                <div>
                  <span className="text-gray-500">Email</span>
                  <p className="text-gray-900">{employee.user?.email}</p>
                </div>
                <div>
                  <span className="text-gray-500">Position</span>
                  <p className="text-gray-900">{employee.position}</p>
                </div>
                <div>
                  <span className="text-gray-500">Department</span>
                  <p className="text-gray-900">{employee.department?.name || 'No Department'}</p>
                </div>
                <div>
                  <span className="text-gray-500">Manager</span>
                  <p className="text-gray-900">
                    {employee.manager?.user?.name
                      ? `${employee.manager.user.name}${employee.manager.position ? ` (${employee.manager.position})` : ''}`
                      : 'No Manager'}
                  </p>
                </div>
                <div>
                  <span className="text-gray-500">Hire Date</span>
                  <p className="text-gray-900">{new Date(employee.hireDate).toLocaleDateString()}</p>
                </div>
                <div>
                  <span className="text-gray-500">Status</span>
                  <p className="text-gray-900 capitalize">{employee.status || 'active'}</p>
                </div>
              </div>
            </div>

            <div className="bg-white p-6 rounded-lg shadow">
              <h2 className="text-lg font-semibold mb-4">Performance Metrics</h2>
              <div className="space-y-4">
                <div>
                  <div className="flex justify-between text-sm mb-1">
                    <span>Performance Score</span>
                    <span className="font-semibold text-blue-600">{employee.performanceScore ?? 0}%</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div
                      className="bg-blue-600 h-2 rounded-full"
                      style={{ width: `${employee.performanceScore ?? 0}%` }}
                    />
                  </div>
                </div>
                <div>
                  <div className="flex justify-between text-sm mb-1">
                    <span>Project Contribution</span>
                    <span className="font-semibold text-green-600">{employee.projectContribution ?? 0}%</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div
                      className="bg-green-600 h-2 rounded-full"
                      style={{ width: `${employee.projectContribution ?? 0}%` }}
                    />
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-white p-6 rounded-lg shadow">
              <h2 className="text-lg font-semibold mb-4">Statistics</h2>
              <div className="grid grid-cols-2 gap-4 text-center">
                <div>
                  <div className="text-2xl font-bold text-blue-600">{employee.stats?.projectsCount ?? 0}</div>
                  <div className="text-sm text-gray-600">Projects</div>
                </div>
                <div>
                  <div className="text-2xl font-bold text-green-600">{employee.stats?.okrsCount ?? 0}</div>
                  <div className="text-sm text-gray-600">OKRs</div>
                </div>
                <div>
                  <div className="text-2xl font-bold text-purple-600">{employee.stats?.feedbackCount ?? 0}</div>
                  <div className="text-sm text-gray-600">Feedback</div>
                </div>
                <div>
                  <div className="text-2xl font-bold text-yellow-600">
                    {(employee.stats?.avgRating ?? 0).toFixed(1)}★
                  </div>
                  <div className="text-sm text-gray-600">Avg Rating</div>
                </div>
              </div>
            </div>

            <div className="bg-white p-6 rounded-lg shadow">
              <h2 className="text-lg font-semibold mb-4">Resume</h2>
              {employee.resume?.fileUrl ? (
                <div>
                  <p className="font-medium">{employee.resume.fileName}</p>
                  <p className="text-sm text-gray-500 mb-3">
                    Uploaded {new Date(employee.resume.uploadedAt).toLocaleDateString()}
                  </p>
                  <a
                    href={employee.resume.fileUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-blue-600 hover:text-blue-800 text-sm font-medium"
                  >
                    View / Download Resume →
                  </a>
                </div>
              ) : (
                <p className="text-sm text-gray-500">No resume uploaded yet</p>
              )}
            </div>

            <div className="lg:col-span-3 bg-white p-6 rounded-lg shadow">
              <h2 className="text-lg font-semibold mb-4">Skills</h2>
              {employee.skills?.length ? (
                <div className="flex flex-wrap gap-2">
                  {employee.skills.map((skill, index) => (
                    <span
                      key={index}
                      className={`px-3 py-1 rounded-full text-sm font-medium ${getSkillLevelColor(skill.level)}`}
                    >
                      {skill.name} ({skill.level}){skill.verified ? ' ✓' : ''}
                    </span>
                  ))}
                </div>
              ) : (
                <p className="text-gray-500">No skills listed</p>
              )}
            </div>
          </div>
        )}

        {activeTab === 'projects' && (
          <div className="space-y-6">
            <div className="bg-white rounded-lg shadow p-6">
              <h2 className="text-lg font-semibold mb-4">Current Projects ({activeProjects.length})</h2>
              <ProjectTable projects={activeProjects} emptyMessage="No active projects assigned" />
            </div>
            <div className="bg-white rounded-lg shadow p-6">
              <h2 className="text-lg font-semibold mb-4">Previous / Completed Projects ({completedProjects.length})</h2>
              <ProjectTable projects={completedProjects} emptyMessage="No completed projects yet" />
            </div>
          </div>
        )}

        {activeTab === 'ai' && (
          <div className="bg-white rounded-lg shadow p-6">
            {employee.aiInsights?.lastAnalyzed ? (
              <EmployeeAIInsightsPanel insights={employee.aiInsights} />
            ) : (
              <div className="text-center py-12">
                <p className="text-gray-600 mb-4">
                  No AI analysis yet. Run analysis using Gemini (primary) or Cohere (fallback).
                </p>
                <button
                  onClick={generateAIInsights}
                  disabled={generatingInsights}
                  className="px-6 py-2 bg-purple-600 text-white rounded-md hover:bg-purple-700 disabled:opacity-50"
                >
                  {generatingInsights ? 'Analyzing…' : 'Run AI Analysis'}
                </button>
              </div>
            )}
            {employee.aiInsights?.lastAnalyzed && (
              <div className="mt-6 pt-4 border-t">
                <button
                  onClick={generateAIInsights}
                  disabled={generatingInsights}
                  className="px-4 py-2 bg-purple-600 text-white rounded-md hover:bg-purple-700 disabled:opacity-50"
                >
                  {generatingInsights ? 'Re-analyzing…' : 'Refresh AI Analysis'}
                </button>
              </div>
            )}
          </div>
        )}

        {activeTab === 'performance' && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="bg-white p-6 rounded-lg shadow">
              <h2 className="text-lg font-semibold mb-4">Performance Overview</h2>
              <div className="space-y-3 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-600">Overall Performance</span>
                  <span className="font-semibold text-blue-600">{employee.performanceScore ?? 0}%</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Project Contribution</span>
                  <span className="font-semibold text-green-600">{employee.projectContribution ?? 0}%</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Average Rating</span>
                  <span className="font-semibold text-yellow-600">
                    {(employee.stats?.avgRating ?? 0).toFixed(1)}★
                  </span>
                </div>
              </div>
            </div>

            <div className="bg-white p-6 rounded-lg shadow">
              <h2 className="text-lg font-semibold mb-4">Admin Actions</h2>
              <div className="space-y-3">
                <Link
                  href={`/hr/feedback/new?employee=${employee._id}`}
                  className="block w-full px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 text-center"
                >
                  Give Feedback
                </Link>
                <Link
                  href={`/hr/performance/review?employee=${employee._id}`}
                  className="block w-full px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 text-center"
                >
                  Conduct Performance Review
                </Link>
                <Link
                  href={`/admin/payroll/create?employee=${employee._id}`}
                  className="block w-full px-4 py-2 bg-purple-600 text-white rounded-md hover:bg-purple-700 text-center"
                >
                  Create Payroll
                </Link>
                <Link
                  href={`/hr/performance/employee/${employee._id}`}
                  className="block w-full px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 text-center"
                >
                  Full Performance History
                </Link>
                <button
                  onClick={generateAIInsights}
                  disabled={generatingInsights}
                  className="w-full px-4 py-2 bg-orange-600 text-white rounded-md hover:bg-orange-700 disabled:opacity-50"
                >
                  {generatingInsights ? 'Generating...' : 'Generate AI Insights'}
                </button>
                <button
                  onClick={openAssignModal}
                  className="w-full px-4 py-2 border border-gray-300 rounded-md hover:bg-gray-50"
                >
                  Assign Department / Manager
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

      {showAssignModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-md w-full p-6">
            <h3 className="text-lg font-semibold mb-4">Assign Department & Manager</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Department</label>
                <select
                  value={assignForm.departmentId}
                  onChange={(e) => setAssignForm((p) => ({ ...p, departmentId: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md"
                >
                  <option value="">Not assigned</option>
                  {departments.map((d) => (
                    <option key={d._id} value={d._id}>
                      {d.name}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Manager</label>
                <select
                  value={assignForm.managerId}
                  onChange={(e) => setAssignForm((p) => ({ ...p, managerId: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md"
                >
                  <option value="">Not assigned</option>
                  {managerOptions.map((m) => (
                    <option key={m._id} value={m._id}>
                      {m.user?.name} — {m.position}
                    </option>
                  ))}
                </select>
              </div>
              <div className="flex gap-3 pt-2">
                <button
                  onClick={() => setShowAssignModal(false)}
                  className="flex-1 px-4 py-2 border border-gray-300 rounded-md hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  onClick={saveAssignment}
                  disabled={savingAssign}
                  className="flex-1 px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 disabled:opacity-50"
                >
                  {savingAssign ? 'Saving...' : 'Save'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
