'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useAuth } from '@/lib/AuthContext';
import api from '@/lib/api';
import { 
  User, 
  Briefcase, 
  TrendingUp, 
  Calendar, 
  Award, 
  DollarSign,
  Clock,
  Target,
  FileText,
  Settings
} from 'lucide-react';

interface EmployeeData {
  _id: string;
  user: {
    name: string;
    email: string;
  };
  position: string;
  department?: {
    name: string;
  };
  performanceScore?: number;
  salary?: number;
  hireDate: string;
}

interface DashboardStats {
  totalProjects: number;
  activeProjects: number;
  completedTasks: number;
  upcomingDeadlines: number;
  performanceScore: number;
  achievements: number;
}

export default function EmployeeDashboard() {
  const { user } = useAuth();
  const [employeeData, setEmployeeData] = useState<EmployeeData | null>(null);
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchDashboardData = async () => {
      if (!user) return;

      try {
        setLoading(true);
        setError(null);

        // Fetch employee profile
        const profileResponse = await api.get('/employee/profile');
        setEmployeeData(profileResponse.data);

        // Fetch dashboard stats
        const statsResponse = await api.get('/employee/dashboard/stats');
        setStats(statsResponse.data);

      } catch (err: unknown) {
        console.error('Error fetching dashboard data:', err);
        setError('Failed to load dashboard data');
        
        // Set default data if API fails
        if (user) {
          setEmployeeData({
            _id: 'temp',
            user: {
              name: user.name || 'Employee',
              email: user.email || 'employee@company.com'
            },
            position: 'Employee',
            hireDate: new Date().toISOString()
          });
          
          setStats({
            totalProjects: 0,
            activeProjects: 0,
            completedTasks: 0,
            upcomingDeadlines: 0,
            performanceScore: 0,
            achievements: 0
          });
        }
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, [user]);

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-slate-600 font-medium">Loading Dashboard</p>
        </div>
      </div>
    );
  }

  if (!employeeData) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="text-center bg-white p-8 rounded-lg shadow-sm border">
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <User className="w-8 h-8 text-red-600" />
          </div>
          <h2 className="text-xl font-semibold text-slate-900 mb-2">Access Denied</h2>
          <p className="text-slate-600 mb-4">Unable to load employee data</p>
          <button 
            onClick={() => window.location.reload()} 
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Error Display */}
        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-xl">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <svg className="h-5 w-5 text-red-400" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                </svg>
              </div>
              <div className="ml-3">
                <p className="text-sm font-medium text-red-800">{error}</p>
              </div>
              <div className="ml-auto pl-3">
                <button
                  onClick={() => setError(null)}
                  className="text-red-400 hover:text-red-600"
                >
                  <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                  </svg>
                </button>
              </div>
            </div>
          </div>
        )}
        {/* Header */}
        <div className="mb-8">
          <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl flex items-center justify-center">
                  <User className="w-8 h-8 text-white" />
                </div>
                <div>
                  <h1 className="text-2xl font-bold text-slate-900">
                    Welcome, {employeeData.user.name}
                  </h1>
                  <p className="text-slate-600 font-medium">
                    {employeeData.position}
                    {employeeData.department && ` • ${employeeData.department.name}`}
                  </p>
                  <p className="text-sm text-slate-500">{employeeData.user.email}</p>
                </div>
              </div>
              <div className="text-right">
                <p className="text-sm text-slate-500">Employee ID</p>
                <p className="font-mono text-slate-900">{employeeData._id.slice(-6).toUpperCase()}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-slate-600">Active Projects</p>
                <p className="text-3xl font-bold text-slate-900">{stats?.activeProjects || 0}</p>
              </div>
              <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                <Briefcase className="w-6 h-6 text-blue-600" />
              </div>
            </div>
          </div>

          <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-slate-600">Performance</p>
                <p className="text-3xl font-bold text-slate-900">{stats?.performanceScore || 0}%</p>
              </div>
              <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                <TrendingUp className="w-6 h-6 text-green-600" />
              </div>
            </div>
          </div>

          <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-slate-600">Achievements</p>
                <p className="text-3xl font-bold text-slate-900">{stats?.achievements || 0}</p>
              </div>
              <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
                <Award className="w-6 h-6 text-purple-600" />
              </div>
            </div>
          </div>

          <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-slate-600">Total Projects</p>
                <p className="text-3xl font-bold text-slate-900">{stats?.totalProjects || 0}</p>
              </div>
              <div className="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center">
                <Target className="w-6 h-6 text-orange-600" />
              </div>
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
          <Link
            href="/employee/projects"
            className="bg-white p-6 rounded-xl shadow-sm border border-slate-200 hover:shadow-md hover:border-slate-300 transition-all duration-200 group"
          >
            <div className="flex items-center space-x-4">
              <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center group-hover:bg-blue-200 transition-colors">
                <Briefcase className="w-6 h-6 text-blue-600" />
              </div>
              <div>
                <h3 className="font-semibold text-slate-900">My Projects</h3>
                <p className="text-sm text-slate-600">View and manage assigned projects</p>
              </div>
            </div>
          </Link>

          <Link
            href="/employee/performance"
            className="bg-white p-6 rounded-xl shadow-sm border border-slate-200 hover:shadow-md hover:border-slate-300 transition-all duration-200 group"
          >
            <div className="flex items-center space-x-4">
              <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center group-hover:bg-green-200 transition-colors">
                <TrendingUp className="w-6 h-6 text-green-600" />
              </div>
              <div>
                <h3 className="font-semibold text-slate-900">Performance</h3>
                <p className="text-sm text-slate-600">Track your progress and goals</p>
              </div>
            </div>
          </Link>

          <Link
            href="/employee/payroll"
            className="bg-white p-6 rounded-xl shadow-sm border border-slate-200 hover:shadow-md hover:border-slate-300 transition-all duration-200 group"
          >
            <div className="flex items-center space-x-4">
              <div className="w-12 h-12 bg-emerald-100 rounded-lg flex items-center justify-center group-hover:bg-emerald-200 transition-colors">
                <DollarSign className="w-6 h-6 text-emerald-600" />
              </div>
              <div>
                <h3 className="font-semibold text-slate-900">Payroll</h3>
                <p className="text-sm text-slate-600">View salary and payslips</p>
              </div>
            </div>
          </Link>

          <Link
            href="/employee/achievements"
            className="bg-white p-6 rounded-xl shadow-sm border border-slate-200 hover:shadow-md hover:border-slate-300 transition-all duration-200 group"
          >
            <div className="flex items-center space-x-4">
              <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center group-hover:bg-purple-200 transition-colors">
                <Award className="w-6 h-6 text-purple-600" />
              </div>
              <div>
                <h3 className="font-semibold text-slate-900">Achievements</h3>
                <p className="text-sm text-slate-600">View your awards and recognition</p>
              </div>
            </div>
          </Link>

          <Link
            href="/employee/feedback"
            className="bg-white p-6 rounded-xl shadow-sm border border-slate-200 hover:shadow-md hover:border-slate-300 transition-all duration-200 group"
          >
            <div className="flex items-center space-x-4">
              <div className="w-12 h-12 bg-indigo-100 rounded-lg flex items-center justify-center group-hover:bg-indigo-200 transition-colors">
                <FileText className="w-6 h-6 text-indigo-600" />
              </div>
              <div>
                <h3 className="font-semibold text-slate-900">Feedback</h3>
                <p className="text-sm text-slate-600">View performance feedback</p>
              </div>
            </div>
          </Link>

          <Link
            href="/employee/profile"
            className="bg-white p-6 rounded-xl shadow-sm border border-slate-200 hover:shadow-md hover:border-slate-300 transition-all duration-200 group"
          >
            <div className="flex items-center space-x-4">
              <div className="w-12 h-12 bg-slate-100 rounded-lg flex items-center justify-center group-hover:bg-slate-200 transition-colors">
                <Settings className="w-6 h-6 text-slate-600" />
              </div>
              <div>
                <h3 className="font-semibold text-slate-900">Profile</h3>
                <p className="text-sm text-slate-600">Manage your profile settings</p>
              </div>
            </div>
          </Link>
        </div>

        {/* Recent Activity */}
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-lg font-semibold text-slate-900">Recent Activity</h2>
            <Calendar className="w-5 h-5 text-slate-400" />
          </div>
          <div className="space-y-4">
            <div className="flex items-center space-x-3 p-4 bg-slate-50 rounded-lg border border-slate-100">
              <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
              <div className="flex-1">
                <p className="text-sm font-medium text-slate-900">Welcome to your Employee Dashboard</p>
                <p className="text-xs text-slate-500">Get started by exploring your workspace</p>
              </div>
              <Clock className="w-4 h-4 text-slate-400" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}