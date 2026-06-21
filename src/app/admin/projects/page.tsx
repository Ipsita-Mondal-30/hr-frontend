'use client';

import { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import api from '@/lib/api';
import ProjectChat from '@/components/ProjectChat';
import AdminMilestonePanel from '@/components/AdminMilestonePanel';
import AdminWorkReviewPanel from '@/components/AdminWorkReviewPanel';
import ProjectPerformanceOverview from '@/components/ProjectPerformanceOverview';
import { isProjectCompleted, projectDisplayStatus } from '@/lib/projectUtils';

interface ProjectUser {
  name?: string;
  email?: string;
}

interface ProjectEmployee {
  _id?: string;
  user?: ProjectUser | string;
  position?: string;
}

interface Project {
  _id: string;
  name: string;
  description?: string;
  status: string;
  priority: string;
  startDate: string;
  endDate?: string;
  estimatedHours?: number;
  actualHours?: number;
  completionPercentage?: number;
  projectManager?: ProjectEmployee | null;
  teamMembers?: Array<{
    employee?: ProjectEmployee | null;
    role?: string;
    contributionPercentage?: number;
    hoursWorked?: number;
  }>;
  department?: { name?: string } | string | null;
  budget?: number;
  actualCost?: number;
}

function managerName(pm: Project['projectManager']): string {
  if (!pm) return 'Unassigned';
  const user = pm.user;
  if (user && typeof user === 'object' && user.name) return user.name;
  return 'Unassigned';
}

function memberName(employee: ProjectEmployee | null | undefined): string {
  if (!employee) return 'Unknown';
  const user = employee.user;
  if (user && typeof user === 'object' && user.name) return user.name;
  return 'Unknown';
}

function formatMoney(value?: number): string {
  return `$${(value ?? 0).toLocaleString()}`;
}

export default function AdminProjectsPage() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchProjects = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const params = new URLSearchParams();
      if (filter !== 'all') params.append('status', filter);

      const response = await api.get(`/projects?${params.toString()}`, {
        skipAuthRedirect: true,
      });
      const list = response.data?.projects;
      setProjects(Array.isArray(list) ? list : []);
    } catch (err) {
      console.error('Error fetching projects:', err);
      setProjects([]);
      setError('Could not load projects. Make sure you are logged in and the backend is running.');
    } finally {
      setLoading(false);
    }
  }, [filter]);

  const refreshProjectDetails = useCallback(async (projectId: string) => {
    try {
      const res = await api.get(`/projects/${projectId}`, { skipAuthRedirect: true });
      const fresh = res.data.project as Project;
      setSelectedProject(fresh);
      setProjects((prev) => prev.map((p) => (p._id === projectId ? fresh : p)));
    } catch (err) {
      console.error('Error refreshing project:', err);
    }
  }, []);

  const openProjectDetails = async (project: Project) => {
    setSelectedProject(project);
    await refreshProjectDetails(project._id);
  };

  const getAllTeamMembers = (project: Project) => {
    const members: Array<{
      employee?: ProjectEmployee | null;
      role?: string;
      contributionPercentage?: number;
      hoursWorked?: number;
      isManager?: boolean;
    }> = [];

    if (project.projectManager) {
      members.push({
        employee: project.projectManager,
        role: 'project-manager',
        contributionPercentage: 0,
        hoursWorked: 0,
        isManager: true,
      });
    }

    (project.teamMembers ?? []).forEach((member) => {
      const pmId = project.projectManager?._id;
      const empId = member.employee?._id;
      if (pmId && empId && pmId === empId) return;
      members.push(member);
    });

    return members;
  };

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

  const avgProgress =
    projects.length > 0
      ? Math.round(
          projects.reduce((sum, p) => sum + (p.completionPercentage ?? 0), 0) / projects.length
        )
      : 0;

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
      <div className="flex justify-between items-center flex-wrap gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Project Management</h1>
          <p className="text-gray-600">Create, assign, and manage company projects</p>
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
          <Link
            href="/admin/projects/create"
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
          >
            Create Project
          </Link>
        </div>
      </div>

      {error && (
        <div className="rounded-lg border border-amber-200 bg-amber-50 px-4 py-3 text-amber-900 text-sm">
          {error}
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
          <div className="text-2xl font-bold text-blue-600">{projects.length}</div>
          <div className="text-sm text-blue-700">Total Projects</div>
        </div>
        <div className="bg-green-50 p-4 rounded-lg border border-green-200">
          <div className="text-2xl font-bold text-green-600">
            {projects.filter((p) => p.status === 'active' && !isProjectCompleted(p)).length}
          </div>
          <div className="text-sm text-green-700">Active Projects</div>
        </div>
        <div className="bg-purple-50 p-4 rounded-lg border border-purple-200">
          <div className="text-2xl font-bold text-purple-600">
            {projects.filter((p) => isProjectCompleted(p)).length}
          </div>
          <div className="text-sm text-purple-700">Completed</div>
        </div>
        <div className="bg-orange-50 p-4 rounded-lg border border-orange-200">
          <div className="text-2xl font-bold text-orange-600">{avgProgress}%</div>
          <div className="text-sm text-orange-700">Avg Progress</div>
        </div>
      </div>

      <div className="talora-modal-panel shadow">
        <div className="px-6 py-4 border-b border-gray-200">
          <h2 className="text-lg font-semibold">Projects ({projects.length})</h2>
        </div>

        {projects.length === 0 ? (
          <div className="p-8 text-center text-gray-500">
            <div className="text-4xl mb-2">📊</div>
            <p className="mb-4">No projects found</p>
            <Link
              href="/admin/projects/create"
              className="inline-block px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
            >
              Create Your First Project
            </Link>
          </div>
        ) : (
          <div className="divide-y divide-gray-200">
            {projects.map((project) => {
              const team = project.teamMembers ?? [];
              const progress = project.completionPercentage ?? 0;

              return (
                <div key={project._id} className="p-6 hover:bg-gray-50">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1 min-w-0">
                      <div className="flex flex-wrap items-center gap-2 mb-2">
                        <h3 className="text-lg font-medium text-gray-900">{project.name}</h3>
                        <div
                          className={`w-3 h-3 rounded-full ${getPriorityColor(project.priority || 'medium')}`}
                          title={`${project.priority || 'medium'} priority`}
                        />
                        <span
                          className={`px-2 py-1 text-xs font-medium rounded-full border ${getStatusColor(
                            projectDisplayStatus(project)
                          )}`}
                        >
                          {projectDisplayStatus(project)}
                        </span>
                      </div>

                      <p className="text-gray-600 mb-3">{project.description || 'No description'}</p>

                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm mb-4">
                        <div>
                          <span className="text-gray-500">Project Manager:</span>
                          <div className="font-medium">{managerName(project.projectManager)}</div>
                        </div>
                        <div>
                          <span className="text-gray-500">Team Size:</span>
                          <div className="font-medium">{team.length} members</div>
                        </div>
                        <div>
                          <span className="text-gray-500">Budget:</span>
                          <div className="font-medium">{formatMoney(project.budget)}</div>
                        </div>
                        <div>
                          <span className="text-gray-500">Start Date:</span>
                          <div className="font-medium">
                            {project.startDate
                              ? new Date(project.startDate).toLocaleDateString()
                              : '—'}
                          </div>
                        </div>
                      </div>

                      <div className="mb-3">
                        <div className="flex justify-between text-sm text-gray-600 mb-1">
                          <span>Progress</span>
                          <span>{progress}%</span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-2">
                          <div
                            className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                            style={{ width: `${Math.min(100, Math.max(0, progress))}%` }}
                          />
                        </div>
                      </div>

                      {team.length > 0 && (
                        <div className="flex items-center space-x-2">
                          <span className="text-sm text-gray-500">Team:</span>
                          <div className="flex -space-x-2">
                            {team.slice(0, 4).map((member, index) => (
                              <div
                                key={index}
                                className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center text-xs font-medium text-blue-600 border-2 border-white"
                                title={memberName(member.employee)}
                              >
                                {memberName(member.employee).charAt(0).toUpperCase()}
                              </div>
                            ))}
                            {team.length > 4 && (
                              <div className="w-8 h-8 bg-gray-100 rounded-full flex items-center justify-center text-xs font-medium text-gray-600 border-2 border-white">
                                +{team.length - 4}
                              </div>
                            )}
                          </div>
                        </div>
                      )}
                    </div>

                    <div className="flex flex-col space-y-2 shrink-0">
                      <button
                        type="button"
                        onClick={() => openProjectDetails(project)}
                        className="px-3 py-1 text-sm bg-blue-100 text-blue-700 rounded hover:bg-blue-200"
                      >
                        View Details
                      </button>
                      <Link
                        href={`/admin/projects/${project._id}/edit`}
                        className="px-3 py-1 text-sm bg-gray-100 text-gray-700 rounded hover:bg-gray-200 text-center"
                      >
                        Edit
                      </Link>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {selectedProject && (() => {
        const team = getAllTeamMembers(selectedProject);
        return (
        <div className="talora-modal-overlay flex items-center justify-center z-50 p-4">
          <div className="talora-modal-panel max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-gray-200">
              <div className="flex justify-between items-start">
                <div>
                  <h2 className="text-xl font-semibold">{selectedProject.name}</h2>
                  <p className="text-gray-600 mt-1">{selectedProject.description || 'No description'}</p>
                  <div className="flex items-center space-x-4 mt-2">
                    <span
                      className={`px-2 py-1 text-xs font-medium rounded-full border ${getStatusColor(
                        projectDisplayStatus(selectedProject)
                      )}`}
                    >
                      {projectDisplayStatus(selectedProject)}
                    </span>
                    {isProjectCompleted(selectedProject) && (
                      <span className="text-sm text-green-600 font-medium">✓ Completed</span>
                    )}
                    {selectedProject.startDate && (
                      <span className="text-sm text-gray-500">
                        Started: {new Date(selectedProject.startDate).toLocaleDateString()}
                      </span>
                    )}
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setSelectedProject(null)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  ✕
                </button>
              </div>
            </div>

            <div className="p-6 space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="bg-blue-50 p-4 rounded-lg">
                  <div className="text-lg font-semibold text-blue-600">
                    {selectedProject.completionPercentage ?? 0}%
                  </div>
                  <div className="text-sm text-blue-700">Completion</div>
                  <div className="mt-2 w-full bg-blue-200 rounded-full h-1.5">
                    <div
                      className="bg-blue-600 h-1.5 rounded-full transition-all"
                      style={{ width: `${selectedProject.completionPercentage ?? 0}%` }}
                    />
                  </div>
                </div>
                <div className="bg-green-50 p-4 rounded-lg">
                  <div className="text-lg font-semibold text-green-600">
                    {formatMoney(selectedProject.budget)}
                  </div>
                  <div className="text-sm text-green-700">Budget</div>
                </div>
                <div className="bg-purple-50 p-4 rounded-lg">
                  <div className="text-lg font-semibold text-purple-600">
                    {team.length}
                  </div>
                  <div className="text-sm text-purple-700">Team Members</div>
                </div>
              </div>

              <div>
                <h3 className="text-lg font-semibold mb-4">Team Members</h3>
                {team.length === 0 ? (
                  <p className="text-gray-500 text-sm">No team members assigned.</p>
                ) : (
                  <div className="space-y-3">
                    {team.map((member, index) => (
                      <div
                        key={index}
                        className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
                      >
                        <div className="flex items-center space-x-3">
                          <div className={`w-10 h-10 rounded-full flex items-center justify-center font-semibold ${
                            member.isManager ? 'bg-indigo-100 text-indigo-600' : 'bg-blue-100 text-blue-600'
                          }`}>
                            {memberName(member.employee).charAt(0).toUpperCase()}
                          </div>
                          <div>
                            <h4 className="font-medium text-gray-900">
                              {memberName(member.employee)}
                              {member.isManager && (
                                <span className="ml-2 text-xs bg-indigo-100 text-indigo-700 px-2 py-0.5 rounded-full">PM</span>
                              )}
                            </h4>
                            <p className="text-sm text-gray-600">
                              {member.employee?.position || '—'}
                            </p>
                          </div>
                        </div>
                        <div className="text-right text-sm">
                          <div className="font-medium capitalize">{(member.role || 'member').replace('-', ' ')}</div>
                          <div className="text-xs text-gray-500">
                            {member.contributionPercentage ?? 0}% • {member.hoursWorked ?? 0}h
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <AdminWorkReviewPanel
                projectId={selectedProject._id}
                onReviewed={(project) => {
                  if (project.completionPercentage !== undefined) {
                    setSelectedProject((prev) =>
                      prev
                        ? {
                            ...prev,
                            completionPercentage: project.completionPercentage,
                            status:
                              (project.completionPercentage ?? 0) >= 100
                                ? 'completed'
                                : prev.status,
                          }
                        : prev
                    );
                  }
                  refreshProjectDetails(selectedProject._id);
                }}
              />

              <ProjectPerformanceOverview projectId={selectedProject._id} />

              <AdminMilestonePanel
                projectId={selectedProject._id}
                employees={team.flatMap((member): { _id: string; user?: { name?: string } }[] => {
                  const emp = member.employee;
                  if (!emp?._id) return [];
                  const user =
                    emp.user && typeof emp.user === 'object' ? { name: emp.user.name } : undefined;
                  return [{ _id: emp._id, user }];
                })}
                onCreated={() => refreshProjectDetails(selectedProject._id)}
              />

              <div>
                <h3 className="text-lg font-semibold mb-3">Team updates (live chat)</h3>
                <ProjectChat
                  projectId={selectedProject._id}
                  projectName={selectedProject.name}
                  isProjectManager
                  onProjectUpdated={() => refreshProjectDetails(selectedProject._id)}
                />
              </div>
            </div>
          </div>
        </div>
        );
      })()}

      {showCreateModal && (
        <div className="talora-modal-overlay flex items-center justify-center z-50 p-4">
          <div className="talora-modal-panel max-w-2xl w-full">
            <div className="p-6 border-b border-gray-200 flex justify-between items-center">
              <h2 className="text-xl font-semibold">Create New Project</h2>
              <button
                type="button"
                onClick={() => setShowCreateModal(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                ✕
              </button>
            </div>
            <div className="p-6 text-center text-gray-600">
              <p className="mb-4">Use the full create form for new projects.</p>
              <Link
                href="/admin/projects/create"
                className="inline-block px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                onClick={() => setShowCreateModal(false)}
              >
                Go to Create Project
              </Link>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
