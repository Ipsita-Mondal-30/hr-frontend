'use client';

import { useState, useEffect, useCallback } from 'react';
import { useParams, useRouter } from 'next/navigation';
import api from '@/lib/api';

interface Employee {
  _id: string;
  employeeId: string;
  user?: {
    name?: string;
    email?: string;
  } | null;
  position: string;
  department?: {
    name: string;
  };
  manager?: {
    user?: { name?: string } | null;
    position: string;
  };
  performanceScore: number;
  projectContribution: number;
  hireDate: string;
  skills: Array<{
    name: string;
    level: string;
    verified: boolean;
  }>;
  stats: {
    projectsCount: number;
    okrsCount: number;
    feedbackCount: number;
    avgRating: number;
  };
}

interface Project {
  _id: string;
  name: string;
  status: string;
  role: string;
  contributionPercentage: number;
  hoursWorked: number;
}

export default function EmployeeDetailPage() {
  const params = useParams();
  const router = useRouter();

  const [employee, setEmployee] = useState<Employee | null>(null);
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'overview' | 'projects' | 'performance'>('overview');

  // Fetch Employee Details
  const fetchEmployeeDetails = useCallback(async () => {
    if (!params.id) return;
    try {
      setLoading(true);
      const response = await api.get<Employee>(`/admin/employees/${params.id}`);
      setEmployee(response.data);
    } catch (error) {
      console.error('Error fetching employee details:', error);
      alert('Error loading employee details');
    } finally {
      setLoading(false);
    }
  }, [params.id]);

  // Fetch Employee Projects
  const fetchEmployeeProjects = useCallback(async () => {
    if (!params.id) return;
    try {
      const response = await api.get<Project[]>(`/admin/employees/${params.id}/projects`);
      setProjects(response.data);
    } catch (error) {
      console.error('Error fetching employee projects:', error);
    }
  }, [params.id]);

  // Load data on mount / params.id change
  useEffect(() => {
    if (params.id) {
      fetchEmployeeDetails();
      fetchEmployeeProjects();
    }
  }, [params.id, fetchEmployeeDetails, fetchEmployeeProjects]);

  const getSkillLevelColor = (level: string) => {
    switch (level.toLowerCase()) {
      case 'expert': return 'bg-green-100 text-green-800';
      case 'advanced': return 'bg-blue-100 text-blue-800';
      case 'intermediate': return 'bg-yellow-100 text-yellow-800';
      case 'beginner': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getProjectStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'completed': return 'bg-green-100 text-green-800';
      case 'in_progress': return 'bg-blue-100 text-blue-800';
      case 'on_hold': return 'bg-yellow-100 text-yellow-800';
      case 'cancelled': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!employee) {
    return (
      <div className="p-6">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Employee Not Found</h1>
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
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="flex justify-between items-start mb-6">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">{employee?.user?.name || 'No Name'}</h1>
            <p className="text-gray-600">{employee.position} • {employee.department?.name || 'No Department'}</p>
            <p className="text-sm text-gray-500">Employee ID: {employee.employeeId}</p>
          </div>
          <div className="flex items-center space-x-3">
            <button
              onClick={() => router.push(`/admin/employees/${employee._id}/edit`)}
              className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
            >
              Edit Employee
            </button>
            <button
              onClick={() => router.back()}
              className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
            >
              Back
            </button>
          </div>
        </div>

        {/* Tabs */}
        <div className="border-b border-gray-200 mb-6">
          <nav className="-mb-px flex space-x-8">
            {[
              { key: 'overview', label: 'Overview' },
              { key: 'projects', label: 'Projects' },
              { key: 'performance', label: 'Performance' }
            ].map((tab) => (
              <button
                key={tab.key}
                onClick={() => setActiveTab(tab.key as 'overview' | 'projects' | 'performance')}

                className={`py-2 px-1 border-b-2 font-medium text-sm ${
                  activeTab === tab.key
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </nav>
        </div>

        {/* Tab Content */}
        {activeTab === 'overview' && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Basic Info */}
            <div className="bg-white p-6 rounded-lg shadow">
              <h2 className="text-lg font-semibold mb-4">Basic Information</h2>
              <div className="space-y-3">
                <div>
                  <label className="text-sm font-medium text-gray-500">Email</label>
                  <p className="text-gray-900">{employee?.user?.email || 'No Email'}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-500">Position</label>
                  <p className="text-gray-900">{employee.position}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-500">Department</label>
                  <p className="text-gray-900">{employee.department?.name || 'No Department'}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-500">Manager</label>
                  <p className="text-gray-900">
                    {employee.manager ? `${employee.manager?.user?.name || 'No Name'} (${employee.manager.position})` : 'No Manager'}
                  </p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-500">Hire Date</label>
                  <p className="text-gray-900">
                    {new Date(employee.hireDate).toLocaleDateString()}
                  </p>
                </div>
              </div>
            </div>

            {/* Performance Metrics */}
            <div className="bg-white p-6 rounded-lg shadow">
              <h2 className="text-lg font-semibold mb-4">Performance Metrics</h2>
              <div className="space-y-4">
                <div>
                  <div className="flex justify-between items-center mb-1">
                    <span className="text-sm font-medium text-gray-700">Performance Score</span>
                    <span className="text-sm font-semibold text-blue-600">{employee.performanceScore}%</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div className="bg-blue-600 h-2 rounded-full" style={{ width: `${employee.performanceScore}%` }}></div>
                  </div>
                </div>
                <div>
                  <div className="flex justify-between items-center mb-1">
                    <span className="text-sm font-medium text-gray-700">Project Contribution</span>
                    <span className="text-sm font-semibold text-green-600">{employee.projectContribution}%</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div className="bg-green-600 h-2 rounded-full" style={{ width: `${employee.projectContribution}%` }}></div>
                  </div>
                </div>
              </div>
            </div>

            {/* Statistics */}
            <div className="bg-white p-6 rounded-lg shadow">
              <h2 className="text-lg font-semibold mb-4">Statistics</h2>
              <div className="grid grid-cols-2 gap-4">
                <div className="text-center">
                  <div className="text-2xl font-bold text-blue-600">{employee.stats?.projectsCount || 0}</div>
                  <div className="text-sm text-gray-600">Projects</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-green-600">{employee.stats?.okrsCount || 0}</div>
                  <div className="text-sm text-gray-600">OKRs</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-purple-600">{employee.stats?.feedbackCount || 0}</div>
                  <div className="text-sm text-gray-600">Feedback</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-yellow-600">{employee.stats?.avgRating?.toFixed(1) || '0.0'}★</div>
                  <div className="text-sm text-gray-600">Avg Rating</div>
                </div>
              </div>
            </div>

            {/* Skills */}
            <div className="lg:col-span-3 bg-white p-6 rounded-lg shadow">
              <h2 className="text-lg font-semibold mb-4">Skills</h2>
              {employee.skills && employee.skills.length > 0 ? (
                <div className="flex flex-wrap gap-2">
                  {employee.skills.map((skill, index) => (
                    <div
                      key={index}
                      className={`px-3 py-1 rounded-full text-sm font-medium ${getSkillLevelColor(skill.level)} ${
                        skill.verified ? 'ring-2 ring-green-300' : ''
                      }`}
                    >
                      {skill.name} ({skill.level})
                      {skill.verified && <span className="ml-1">✓</span>}
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-gray-500">No skills listed</p>
              )}
            </div>
          </div>
        )}

        {activeTab === 'projects' && (
          <div className="bg-white rounded-lg shadow">
            <div className="p-6">
              <h2 className="text-lg font-semibold mb-4">Project Assignments</h2>
              {projects.length > 0 ? (
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Project Name</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Role</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Contribution</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Hours Worked</th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {projects.map((project) => (
                        <tr key={project._id}>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm font-medium text-gray-900">{project.name}</div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm text-gray-900">{project.role}</div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span className={`px-2 py-1 text-xs font-medium rounded-full ${getProjectStatusColor(project.status)}`}>
                              {project.status.replace('_', ' ')}
                            </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm text-gray-900">{project.contributionPercentage}%</div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm text-gray-900">{project.hoursWorked}h</div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <p className="text-gray-500">No projects assigned</p>
              )}
            </div>
          </div>
        )}

        {activeTab === 'performance' && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="bg-white p-6 rounded-lg shadow">
              <h2 className="text-lg font-semibold mb-4">Performance Overview</h2>
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Overall Performance</span>
                  <span className="font-semibold text-blue-600">{employee.performanceScore}%</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Project Contribution</span>
                  <span className="font-semibold text-green-600">{employee.projectContribution}%</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Average Rating</span>
                  <span className="font-semibold text-yellow-600">{employee.stats?.avgRating?.toFixed(1) || '0.0'}★</span>
                </div>
              </div>
            </div>

            <div className="bg-white p-6 rounded-lg shadow">
              <h2 className="text-lg font-semibold mb-4">Quick Actions</h2>
              <div className="space-y-3">
                <button
                  onClick={() => router.push(`/admin/feedback/give?employee=${employee._id}`)}
                  className="w-full px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 text-left"
                >
                  Give Feedback
                </button>
                <button
                  onClick={() => router.push(`/admin/performance/review?employee=${employee._id}`)}
                  className="w-full px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 text-left"
                >
                  Conduct Review
                </button>
                <button
                  onClick={() => router.push(`/admin/payroll/create?employee=${employee._id}`)}
                  className="w-full px-4 py-2 bg-purple-600 text-white rounded-md hover:bg-purple-700 text-left"
                >
                  Create Payroll
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
