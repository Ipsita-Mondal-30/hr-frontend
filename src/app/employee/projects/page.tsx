'use client';

import { notify } from '@/lib/notify';
import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '@/lib/AuthContext';
import api from '@/lib/api';
import ProjectChat from '@/components/ProjectChat';
import ProjectWorkUpload from '@/components/ProjectWorkUpload';
import ProjectPerformanceOverview from '@/components/ProjectPerformanceOverview';
import { isProjectCompleted, projectDisplayStatus } from '@/lib/projectUtils';

interface ProjectTimeline {
  _id: string;
  name: string;
  description: string;
  status: string;
  priority: string;
  startDate: string;
  endDate?: string;
  completionPercentage: number;
  role: string;
  isProjectManager?: boolean;
  contributionPercentage: number;
  hoursWorked: number;
  projectManager?: {
    user?: { name?: string };
    position?: string;
  };
  milestones: Array<{
    _id: string;
    title: string;
    description?: string;
    status: string;
    dueDate: string;
    completedDate?: string;
    completionPercentage: number;
  }>;
  canSubmitWork?: boolean;
  performanceOverview?: {
    contributionPercentage: number;
    hoursWorked: number;
    performanceRating: string;
    performanceSummary: string;
    milestonesCompleted: number;
    milestonesTotal: number;
    onTimeRate: number;
    submissionsApproved: number;
    submissionsPending: number;
  };
}

export default function EmployeeProjectsPage() {
  const { user } = useAuth();
  const [projects, setProjects] = useState<ProjectTimeline[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedProject, setSelectedProject] = useState<ProjectTimeline | null>(null);
  const [filter, setFilter] = useState('all');

  const fetchProjects = useCallback(async () => {
    try {
      const profileRes = await api.get('/employees/me', { skipAuthRedirect: true });
      const employeeId = profileRes.data._id;
      const projectsRes = await api.get(`/employees/${employeeId}/projects`, {
        skipAuthRedirect: true,
      });
      setProjects(projectsRes.data?.projects || []);
    } catch (error) {
      console.error('Error fetching projects:', error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (user) fetchProjects();
  }, [user, fetchProjects]);

  const refreshSelectedProject = useCallback(async () => {
    await fetchProjects();
    if (selectedProject) {
      const profileRes = await api.get('/employees/me', { skipAuthRedirect: true });
      const employeeId = profileRes.data._id;
      const projectsRes = await api.get(`/employees/${employeeId}/projects`, { skipAuthRedirect: true });
      const updated = (projectsRes.data?.projects || []).find(
        (p: ProjectTimeline) => p._id === selectedProject._id
      );
      if (updated) setSelectedProject(updated);
    }
  }, [selectedProject, fetchProjects]);

  const filteredProjects = projects.filter((project) => {
    if (filter === 'all') return true;
    if (filter === 'completed') return isProjectCompleted(project);
    return project.status === filter;
  });

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
          <div className="h-8 bg-gray-200 rounded w-1/4"></div>
          <div className="space-y-3">
            {[1, 2, 3].map(i => (
              <div key={i} className="h-24 bg-gray-200 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-gray-900">My Projects & Timeline</h1>
          <p className="text-sm sm:text-base text-gray-600">Track your project involvement and milestone progress</p>
        </div>
        <div className="w-full sm:w-auto">
          <select
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
            className="w-full sm:w-auto px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="all">All Projects</option>
            <option value="active">Active</option>
            <option value="completed">Completed</option>
            <option value="on-hold">On Hold</option>
          </select>
        </div>
      </div>

      {/* Project Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
          <div className="text-2xl font-bold text-blue-600">
            {projects.filter(p => !isProjectCompleted(p) && p.status === 'active').length}
          </div>
          <div className="text-sm text-blue-700">Active Projects</div>
        </div>
        <div className="bg-green-50 p-4 rounded-lg border border-green-200">
          <div className="text-2xl font-bold text-green-600">
            {projects.filter(p => isProjectCompleted(p)).length}
          </div>
          <div className="text-sm text-green-700">Completed Projects</div>
        </div>
        <div className="bg-purple-50 p-4 rounded-lg border border-purple-200">
          <div className="text-2xl font-bold text-purple-600">
            {Math.round(projects.reduce((sum, p) => sum + p.contributionPercentage, 0) / projects.length || 0)}%
          </div>
          <div className="text-sm text-purple-700">Avg Contribution</div>
        </div>
        <div className="bg-orange-50 p-4 rounded-lg border border-orange-200">
          <div className="text-2xl font-bold text-orange-600">
            {projects.reduce((sum, p) => sum + p.hoursWorked, 0)}h
          </div>
          <div className="text-sm text-orange-700">Total Hours</div>
        </div>
      </div>

      {/* Projects Timeline */}
      <div className="bg-white rounded-lg shadow">
        <div className="px-6 py-4 border-b border-gray-200">
          <h2 className="text-lg font-semibold">Project Timeline</h2>
        </div>
        
        {filteredProjects.length === 0 ? (
          <div className="p-8 text-center text-gray-500">
            <div className="text-4xl mb-2">📋</div>
            <p>No projects found for the selected filter</p>
          </div>
        ) : (
          <div className="divide-y divide-gray-200">
            {filteredProjects.map((project) => (
              <div key={project._id} className="p-4 sm:p-6 hover:bg-gray-50">
                <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center space-x-3 mb-2">
                      <h3 className="text-lg font-medium text-gray-900">{project.name}</h3>
                      <div className={`w-3 h-3 rounded-full ${getPriorityColor(project.priority)}`} title={`${project.priority} priority`}></div>
                      <span className={`px-2 py-1 text-xs font-medium rounded-full border ${getStatusColor(projectDisplayStatus(project))}`}>
                        {projectDisplayStatus(project)}
                      </span>
                    </div>
                    
                    <p className="text-gray-600 mb-3">{project.description}</p>
                    
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                      <div>
                        <span className="text-gray-500">My Role:</span>
                        <div className="font-medium capitalize">{project.role.replace('-', ' ')}</div>
                      </div>
                      <div>
                        <span className="text-gray-500">Contribution:</span>
                        <div className="font-medium">{project.contributionPercentage}%</div>
                      </div>
                      <div>
                        <span className="text-gray-500">Hours Worked:</span>
                        <div className="font-medium">{project.hoursWorked}h</div>
                      </div>
                      <div>
                        <span className="text-gray-500">Project Manager:</span>
                        <div className="font-medium">
                          {project.projectManager?.user?.name || 'Unassigned'}
                        </div>
                      </div>
                    </div>
                    
                    {/* Progress Bar */}
                    <div className="mt-4">
                      <div className="flex justify-between text-sm text-gray-600 mb-1">
                        <span>Project Progress</span>
                        <span>{project.completionPercentage}%</span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div 
                          className="bg-blue-600 h-2 rounded-full transition-all duration-300" 
                          style={{ width: `${project.completionPercentage}%` }}
                        ></div>
                      </div>
                    </div>
                  </div>
                  
                  <div className="ml-4">
                    <button
                      onClick={() => setSelectedProject(project)}
                      className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 text-sm"
                    >
                      View Details
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Project Details Modal */}
      {selectedProject && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-gray-200">
              <div className="flex justify-between items-start">
                <div>
                  <h2 className="text-xl font-semibold">{selectedProject.name}</h2>
                  <p className="text-gray-600 mt-1">{selectedProject.description}</p>
                  <div className="flex items-center space-x-4 mt-2">
                    <span className={`px-2 py-1 text-xs font-medium rounded-full border ${getStatusColor(projectDisplayStatus(selectedProject))}`}>
                      {projectDisplayStatus(selectedProject)}
                    </span>
                    {isProjectCompleted(selectedProject) && (
                      <span className="text-sm text-green-600 font-medium">✓ Project Completed</span>
                    )}
                    <span className="text-sm text-gray-500">
                      Started: {new Date(selectedProject.startDate).toLocaleDateString()}
                    </span>
                    {selectedProject.endDate && (
                      <span className="text-sm text-gray-500">
                        Ended: {new Date(selectedProject.endDate).toLocaleDateString()}
                      </span>
                    )}
                  </div>
                </div>
                <button
                  onClick={() => setSelectedProject(null)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  ✕
                </button>
              </div>
            </div>
            
            <div className="p-6 space-y-6">
              {/* Project Overview */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="bg-blue-50 p-4 rounded-lg">
                  <div className="text-lg font-semibold text-blue-600">
                    {selectedProject.performanceOverview?.contributionPercentage ?? selectedProject.contributionPercentage}%
                  </div>
                  <div className="text-sm text-blue-700">My Contribution</div>
                </div>
                <div className="bg-green-50 p-4 rounded-lg">
                  <div className="text-lg font-semibold text-green-600">
                    {selectedProject.performanceOverview?.hoursWorked ?? selectedProject.hoursWorked}h
                  </div>
                  <div className="text-sm text-green-700">Hours Worked</div>
                </div>
                <div className="bg-purple-50 p-4 rounded-lg">
                  <div className="text-lg font-semibold text-purple-600">{selectedProject.completionPercentage}%</div>
                  <div className="text-sm text-purple-700">Project Complete</div>
                </div>
              </div>

              {selectedProject.performanceOverview && (
                <div className="bg-indigo-50 border border-indigo-100 rounded-lg p-4">
                  <div className="flex justify-between items-center mb-2">
                    <h4 className="font-medium text-indigo-900">My Performance</h4>
                    <span className="text-xs px-2 py-1 rounded-full bg-indigo-100 text-indigo-800 capitalize">
                      {selectedProject.performanceOverview.performanceRating.replace('-', ' ')}
                    </span>
                  </div>
                  <p className="text-sm text-indigo-800">{selectedProject.performanceOverview.performanceSummary}</p>
                  <div className="grid grid-cols-3 gap-3 mt-3 text-sm">
                    <div>
                      <span className="text-indigo-600 text-xs">Milestones</span>
                      <div className="font-semibold">
                        {selectedProject.performanceOverview.milestonesCompleted}/{selectedProject.performanceOverview.milestonesTotal}
                      </div>
                    </div>
                    <div>
                      <span className="text-indigo-600 text-xs">On-time rate</span>
                      <div className="font-semibold">{selectedProject.performanceOverview.onTimeRate}%</div>
                    </div>
                    <div>
                      <span className="text-indigo-600 text-xs">Approved work</span>
                      <div className="font-semibold">{selectedProject.performanceOverview.submissionsApproved}</div>
                    </div>
                  </div>
                </div>
              )}

              <ProjectPerformanceOverview
                projectId={selectedProject._id}
                compact
                employeeOnly
                employeeName={user?.name}
              />

              <ProjectWorkUpload
                projectId={selectedProject._id}
                milestones={selectedProject.milestones || []}
                canSubmitWork={selectedProject.canSubmitWork}
                projectComplete={selectedProject.completionPercentage >= 100}
                onSubmitted={refreshSelectedProject}
              />

              {/* Milestones */}
              <div>
                <h3 className="text-lg font-semibold mb-4">My Milestones</h3>
                {(selectedProject.milestones?.length ?? 0) === 0 ? (
                  <p className="text-gray-500">No milestones assigned to you in this project.</p>
                ) : (
                  <div className="space-y-3">
                    {selectedProject.milestones.map((milestone) => (
                      <MilestoneRespondCard
                        key={milestone._id}
                        milestone={milestone}
                        onUpdated={refreshSelectedProject}
                      />
                    ))}
                  </div>
                )}
              </div>

              {/* Real-time chat with PM */}
              <div>
                <h3 className="text-lg font-semibold mb-3">Updates chat</h3>
                <ProjectChat
                  projectId={selectedProject._id}
                  projectName={selectedProject.name}
                  isProjectManager={selectedProject.isProjectManager}
                  onProjectUpdated={refreshSelectedProject}
                />
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function MilestoneRespondCard({
  milestone,
  onUpdated,
}: {
  milestone: ProjectTimeline['milestones'][0];
  onUpdated: () => void;
}) {
  const [note, setNote] = useState('');
  const [saving, setSaving] = useState(false);
  const isComplete = milestone.status === 'completed';

  const submit = async () => {
    if (!note.trim()) {
      notify('Add a brief update note for your PM');
      return;
    }

    setSaving(true);
    try {
      await api.patch(`/projects/milestones/${milestone._id}/respond`, {
        message: note.trim(),
      });
      setNote('');
      onUpdated();
    } catch (e: unknown) {
      console.error(e);
      const err = e as { response?: { data?: { error?: string } } };
      notify(err.response?.data?.error || 'Failed to submit update');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="border border-gray-200 rounded-lg p-4">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h4 className="font-medium text-gray-900">{milestone.title}</h4>
          {milestone.description && (
            <p className="text-sm text-gray-600 mt-1">{milestone.description}</p>
          )}
          <p className="text-sm text-gray-500 mt-1">
            Due: {new Date(milestone.dueDate).toLocaleDateString()} · {milestone.status}
          </p>
        </div>
        <span className="text-sm font-medium">{milestone.completionPercentage}%</span>
      </div>
      {!isComplete && (
        <div className="mt-3 flex flex-wrap gap-2 items-end">
          <div className="flex-1 min-w-[200px]">
            <label className="text-xs text-gray-500">Quick note to PM (use Submit Work above for files)</label>
            <input
              type="text"
              value={note}
              onChange={(e) => setNote(e.target.value)}
              placeholder="Status update…"
              className="block w-full px-2 py-1 border rounded text-sm"
            />
          </div>
          <button
            type="button"
            onClick={submit}
            disabled={saving}
            className="px-3 py-1.5 bg-green-600 text-white text-sm rounded hover:bg-green-700 disabled:opacity-50"
          >
            {saving ? 'Sending…' : 'Send note'}
          </button>
        </div>
      )}
    </div>
  );
}