'use client';

import { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import api from '@/lib/api';
import { 
  Plus, 
  Search, 
  Filter, 
  Briefcase, 
  Users, 
  Calendar, 
  DollarSign,
  TrendingUp,
  Clock,
  CheckCircle,
  AlertTriangle
} from 'lucide-react';

interface Project {
  _id: string;
  name: string;
  description: string;
  status: string;
  priority: string;
  startDate: string;
  endDate?: string;
  estimatedHours: number;
  actualHours: number;
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
  budget: number;
  actualCost: number;
}

export default function AdminProjectsPage() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');

  const fetchProjects = useCallback(async () => {
    try {
      setLoading(true);
      const response = await api.get('/admin/projects');
      setProjects(response.data || []);
    } catch (error) {
      console.error('Error fetching projects:', error);
      setProjects([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchProjects();
  }, [fetchProjects]);

  const getStatusIcon = (status: string) => {
    switch (status.toLowerCase()) {
      case 'completed':
        return <CheckCircle className="w-4 h-4 text-green-600" />;
      case 'active':
      case 'in-progress':
        return <Clock className="w-4 h-4 text-blue-600" />;
      case 'on-hold':
        return <AlertTriangle className="w-4 h-4 text-yellow-600" />;
      default:
        return <Briefcase className="w-4 h-4 text-slate-600" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'completed':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'active':
      case 'in-progress':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'on-hold':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      default:
        return 'bg-slate-100 text-slate-800 border-slate-200';
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority.toLowerCase()) {
      case 'high':
        return 'bg-red-100 text-red-800 border-red-200';
      case 'medium':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'low':
        return 'bg-green-100 text-green-800 border-green-200';
      default:
        return 'bg-slate-100 text-slate-800 border-slate-200';
    }
  };

  const filteredProjects = projects.filter(project => {
    const matchesFilter = filter === 'all' || project.status.toLowerCase() === filter;
    const matchesSearch = project.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         project.description.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesFilter && matchesSearch;
  });

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-slate-600 font-medium">Loading Projects</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-slate-900">Project Management</h1>
            <p className="text-slate-600 mt-2">Oversee and manage all organizational projects</p>
          </div>
          <Link
            href="/admin/projects/create"
            className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
          >
            <Plus className="w-4 h-4 mr-2" />
            Create Project
          </Link>
        </div>

        {/* Filters and Search */}
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 mb-8">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="w-5 h-5 text-slate-400 absolute left-3 top-1/2 transform -translate-y-1/2" />
                <input
                  type="text"
                  placeholder="Search projects..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
            </div>
            <div className="flex items-center space-x-2">
              <Filter className="w-5 h-5 text-slate-400" />
              <select
                value={filter}
                onChange={(e) => setFilter(e.target.value)}
                className="px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="all">All Projects</option>
                <option value="active">Active</option>
                <option value="completed">Completed</option>
                <option value="on-hold">On Hold</option>
              </select>
            </div>
          </div>
        </div>

        {/* Projects Grid */}
        {filteredProjects.length === 0 ? (
          <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-12 text-center">
            <Briefcase className="w-16 h-16 text-slate-300 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-slate-900 mb-2">No Projects Found</h3>
            <p className="text-slate-600 mb-6">Get started by creating your first project</p>
            <Link
              href="/admin/projects/create"
              className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
            >
              <Plus className="w-4 h-4 mr-2" />
              Create Project
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
            {filteredProjects.map((project) => (
              <div key={project._id} className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 hover:shadow-md transition-shadow">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1">
                    <h3 className="text-lg font-semibold text-slate-900 mb-2">{project.name}</h3>
                    <p className="text-sm text-slate-600 line-clamp-2">{project.description}</p>
                  </div>
                  <div className="flex space-x-2 ml-4">
                    <span className={`inline-flex items-center px-2 py-1 rounded-md text-xs font-medium border ${getStatusColor(project.status)}`}>
                      {getStatusIcon(project.status)}
                      <span className="ml-1">{project.status}</span>
                    </span>
                    <span className={`inline-flex items-center px-2 py-1 rounded-md text-xs font-medium border ${getPriorityColor(project.priority)}`}>
                      {project.priority}
                    </span>
                  </div>
                </div>

                <div className="space-y-3 mb-4">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-slate-600">Progress</span>
                    <span className="font-medium text-slate-900">{project.completionPercentage}%</span>
                  </div>
                  <div className="w-full bg-slate-200 rounded-full h-2">
                    <div
                      className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                      style={{ width: `${project.completionPercentage}%` }}
                    ></div>
                  </div>
                </div>

                <div className="flex items-center justify-between text-sm text-slate-600 mb-4">
                  <div className="flex items-center">
                    <Users className="w-4 h-4 mr-1" />
                    <span>{project.teamMembers?.length || 0} members</span>
                  </div>
                  <div className="flex items-center">
                    <Calendar className="w-4 h-4 mr-1" />
                    <span>{new Date(project.startDate).toLocaleDateString()}</span>
                  </div>
                </div>

                <div className="flex items-center justify-between pt-4 border-t border-slate-100">
                  <div className="flex items-center text-sm text-slate-600">
                    <DollarSign className="w-4 h-4 mr-1" />
                    <span>${project.budget?.toLocaleString() || 0}</span>
                  </div>
                  <Link
                    href={`/admin/projects/${project._id}`}
                    className="inline-flex items-center text-sm font-medium text-blue-600 hover:text-blue-700"
                  >
                    View Details
                    <TrendingUp className="w-4 h-4 ml-1" />
                  </Link>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}