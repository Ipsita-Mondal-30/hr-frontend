'use client';

import { useState, useEffect, useCallback } from 'react';
import api from '@/lib/api';

interface Project {
  _id: string;
  name: string;
  description: string;
  status: string;
  priority: string;
  startDate: string;
  endDate?: string;
  completionPercentage: number;
  projectManager: {
    user: { name: string };
    position: string;
  };
  teamMembers: Array<{
    employee: {
      _id: string;
      user: { name: string };
      position: string;
    };
    role: string;
    contributionPercentage: number;
    hoursWorked: number;
  }>;
  department?: {
    name: string;
  };
}

export default function HRProjectsPage() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);

  const fetchProjects = useCallback(async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      if (filter !== 'all') params.append('status', filter);

      const response = await api.get<{ projects?: Project[] } | Project[]>(`/projects?${params.toString()}`);
      const list = Array.isArray(response.data) ? response.data : response.data?.projects || [];
      setProjects(list);
    } catch (error) {
      console.error('Error fetching projects:', error);
      setProjects([]);
    } finally {
      setLoading(false);
    }
  }, [filter]);

  useEffect(() => {
    fetchProjects();
  }, [fetchProjects]);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'active':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'on-hold':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'cancelled':
        return 'bg-red-100 text-red-800 border-red-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'critical':
        return 'bg-red-500';
      case 'high':
        return 'bg-orange-500';
      case 'medium':
        return 'bg-yellow-500';
      case 'low':
        return 'bg-green-500';
      default:
        return 'bg-gray-500';
    }
  };

  if (loading) {
    return (
      <div className="p-6">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-gray-200 rounded w-1/3"></div>
          <div className="space-y-3">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-24 bg-gray-200 rounded"></div>
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
          <h1 className="text-2xl font-bold text-gray-900">Company Projects</h1>
          <p className="text-gray-600">Monitor employee progress and project status</p>
        </div>
        <div className="flex items-center space-x-4">
          <select
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="all">All Projects</option>
            <option value="active">Active</option>
            <option value="completed">Completed</option>
            <option value="on-hold">On Hold</option>
            <option value="planning">Planning</option>
          </select>
          <div className="text-sm text-gray-600 bg-yellow-50 px-3 py-2 rounded border border-yellow-200">
            📝 View Only - Projects managed by Admin
          </div>
        </div>
      </div>

      {/* Project Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
          <div className="text-2xl font-bold text-blue-600">{projects.length}</div>
          <div className="text-sm text-blue-700">Total Projects</div>
        </div>
        <div className="bg-green-50 p-4 rounded-lg border border-green-200">
          <div className="text-2xl font-bold text-green-600">{projects.filter((p) => p.status === 'active').length}</div>
          <div className="text-sm text-green-700">Active Projects</div>
        </div>
        <div className="bg-purple-50 p-4 rounded-lg border border-purple-200">
          <div className="text-2xl font-bold text-purple-600">
            {projects.reduce((sum, p) => sum + p.teamMembers.length, 0)}
          </div>
          <div className="text-sm text-purple-700">Total Employees</div>
        </div>
        <div className="bg-orange-50 p-4 rounded-lg border border-orange-200">
          <div className="text-2xl font-bold text-orange-600">
            {Math.round(projects.reduce((sum, p) => sum + p.completionPercentage, 0) / projects.length || 0)}%
          </div>
          <div className="text-sm text-orange-700">Avg Progress</div>
        </div>
      </div>

      {/* Projects List */}
      <div className="bg-white rounded-lg shadow">
        <div className="px-6 py-4 border-b border-gray-200">
          <h2 className="text-lg font-semibold">Projects Overview</h2>
        </div>

        {projects.length === 0 ? (
          <div className="p-8 text-center text-gray-500">
            <div className="text-4xl mb-2">📊</div>
            <p>No projects found</p>
          </div>
        ) : (
          <div className="divide-y divide-gray-200">
            {projects.map((project) => (
              <div key={project._id} className="p-6 hover:bg-gray-50">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center space-x-3 mb-2">
                      <h3 className="text-lg font-medium text-gray-900">{project.name}</h3>
                      <div
                        className={`w-3 h-3 rounded-full ${getPriorityColor(project.priority)}`}
                        title={`${project.priority} priority`}
                      ></div>
                      <span className={`px-2 py-1 text-xs font-medium rounded-full border ${getStatusColor(project.status)}`}>
                        {project.status}
                      </span>
                    </div>

                    <p className="text-gray-600 mb-3">{project.description}</p>

                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm mb-4">
                      <div>
                        <span className="text-gray-500">Project Manager:</span>
                        <div className="font-medium">{project.projectManager.user.name}</div>
                      </div>
                      <div>
                        <span className="text-gray-500">Team Size:</span>
                        <div className="font-medium">{project.teamMembers.length} members</div>
                      </div>
                      <div>
                        <span className="text-gray-500">Department:</span>
                        <div className="font-medium">{project.department?.name || 'N/A'}</div>
                      </div>
                      <div>
                        <span className="text-gray-500">Start Date:</span>
                        <div className="font-medium">{new Date(project.startDate).toLocaleDateString()}</div>
                      </div>
                    </div>

                    {/* Progress Bar */}
                    <div className="mb-3">
                      <div className="flex justify-between text-sm text-gray-600 mb-1">
                        <span>Progress</span>
                        <span>{project.completionPercentage}%</span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div
                          className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                          style={{ width: `${project.completionPercentage}%` }}
                        ></div>
                      </div>
                    </div>

                    {/* Team Members Preview */}
                    <div className="flex items-center space-x-2">
                      <span className="text-sm text-gray-500">Team:</span>
                      <div className="flex -space-x-2">
                        {project.teamMembers.slice(0, 4).map((member, index) => (
                          <div
                            key={index}
                            className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center text-xs font-medium text-blue-600 border-2 border-white"
                            title={`${member.employee?.user?.name || 'Unknown'} - ${member.role}`}
                          >
                            {(member.employee?.user?.name || 'U').charAt(0).toUpperCase()}
                          </div>
                        ))}
                        {project.teamMembers.length > 4 && (
                          <div className="w-8 h-8 bg-gray-100 rounded-full flex items-center justify-center text-xs font-medium text-gray-600 border-2 border-white">
                            +{project.teamMembers.length - 4}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="ml-4">
                    <button
                      onClick={() => setSelectedProject(project)}
                      className="px-3 py-1 text-sm bg-blue-100 text-blue-700 rounded hover:bg-blue-200"
                    >
                      View Team Details
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Project Team Details Modal */}
      {selectedProject && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-gray-200">
              <div className="flex justify-between items-start">
                <div>
                  <h2 className="text-xl font-semibold">{selectedProject.name}</h2>
                  <p className="text-gray-600 mt-1">{selectedProject.description}</p>
                  <div className="flex items-center space-x-4 mt-2">
                    <span className={`px-2 py-1 text-xs font-medium rounded-full border ${getStatusColor(selectedProject.status)}`}>
                      {selectedProject.status}
                    </span>
                    <span className="text-sm text-gray-500">
                      Started: {new Date(selectedProject.startDate).toLocaleDateString()}
                    </span>
                  </div>
                </div>
                <button onClick={() => setSelectedProject(null)} className="text-gray-400 hover:text-gray-600">
                  ✕
                </button>
              </div>
            </div>

            <div className="p-6 space-y-6">
              {/* Project Metrics */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="bg-blue-50 p-4 rounded-lg">
                  <div className="text-lg font-semibold text-blue-600">{selectedProject.completionPercentage}%</div>
                  <div className="text-sm text-blue-700">Completion</div>
                </div>
                <div className="bg-green-50 p-4 rounded-lg">
                  <div className="text-lg font-semibold text-green-600">{selectedProject.teamMembers.length}</div>
                  <div className="text-sm text-green-700">Team Members</div>
                </div>
                <div className="bg-purple-50 p-4 rounded-lg">
                  <div className="text-lg font-semibold text-purple-600">
                    {selectedProject.teamMembers.reduce((sum, m) => sum + m.hoursWorked, 0)}h
                  </div>
                  <div className="text-sm text-purple-700">Total Hours</div>
                </div>
              </div>

              {/* Team Members Performance */}
              <div>
                <h3 className="text-lg font-semibold mb-4">Team Performance</h3>
                <div className="space-y-3">
                  {selectedProject.teamMembers.map((member, index) => (
                    <div key={index} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                      <div className="flex items-center space-x-3">
                        <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center text-blue-600 font-semibold">
                          {member.employee.user.name.charAt(0).toUpperCase()}
                        </div>
                        <div>
                          <h4 className="font-medium text-gray-900">{member.employee.user.name}</h4>
                          <p className="text-sm text-gray-600">{member.employee.position}</p>
                          <p className="text-xs text-gray-500">{member.role}</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="text-sm font-medium text-blue-600">{member.contributionPercentage}% contribution</div>
                        <div className="text-xs text-gray-500">{member.hoursWorked} hours worked</div>
                        <div className="mt-1">
                          <div className="w-24 bg-gray-200 rounded-full h-1.5">
                            <div className="bg-blue-600 h-1.5 rounded-full" style={{ width: `${member.contributionPercentage}%` }}></div>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* HR Actions */}
              <div className="bg-yellow-50 rounded-lg p-4 border border-yellow-200">
                <h4 className="font-medium text-yellow-800 mb-2">HR Actions Available</h4>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                  <button className="px-3 py-2 bg-blue-100 text-blue-700 rounded text-sm hover:bg-blue-200">📝 Give Team Feedback</button>
                  <button className="px-3 py-2 bg-green-100 text-green-700 rounded text-sm hover:bg-green-200">📊 Performance Review</button>
                  <button className="px-3 py-2 bg-purple-100 text-purple-700 rounded text-sm hover:bg-purple-200">🎯 Set Team OKRs</button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
