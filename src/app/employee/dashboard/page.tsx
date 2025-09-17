'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useAuth } from '@/lib/AuthContext';
import api from '@/lib/api';
import { User, Briefcase, TrendingUp, Calendar, Award, DollarSign } from 'lucide-react';

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
      // Set a timeout to prevent infinite loading
      const timeoutId = setTimeout(() => {
        if (loading) {
          console.warn('Dashboard loading timeout, setting default data');
          setLoading(false);
          setError('Dashboard loading timeout');
        }
      }, 10000); // 10 second timeout

      try {
        setLoading(true);
        setError(null);

        // If no user after reasonable time, set default data
        if (!user) {
          console.log('No user found, setting default employee data');
          setEmployeeData({
            _id: 'default',
            user: {
              name: 'Employee',
              email: 'employee@company.com'
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
          setLoading(false);
          clearTimeout(timeoutId);
          return;
        }

        // Try to fetch employee profile with fallback
        try {
          const profileResponse = await api.get('/employees/profile');
          setEmployeeData(profileResponse.data);
        } catch (profileErr) {
          console.warn('Failed to fetch employee profile, using user data:', profileErr);
          setEmployeeData({
            _id: user._id || 'temp',
            user: {
              name: user.name || 'Employee',
              email: user.email || 'employee@company.com'
            },
            position: 'Employee',
            hireDate: new Date().toISOString()
          });
        }

        // Try to fetch dashboard stats with fallback
        try {
          const statsResponse = await api.get('/employees/dashboard/stats');
          setStats(statsResponse.data);
        } catch (statsErr) {
          console.warn('Failed to fetch dashboard stats, using defaults:', statsErr);
          setStats({
            totalProjects: 0,
            activeProjects: 0,
            completedTasks: 0,
            upcomingDeadlines: 0,
            performanceScore: 0,
            achievements: 0
          });
        }

      } catch (err: any) {
        console.error('Error fetching dashboard data:', err);
        setError('Failed to load dashboard data');
        
        // Set default data if everything fails
        setEmployeeData({
          _id: 'fallback',
          user: {
            name: user?.name || 'Employee',
            email: user?.email || 'employee@company.com'
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
      } finally {
        setLoading(false);
        clearTimeout(timeoutId);
      }
    };

    // Add a small delay to allow auth context to load
    const delayedFetch = setTimeout(() => {
      fetchDashboardData();
    }, 1000);

    return () => clearTimeout(delayedFetch);
  }, [user, loading]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading your dashboard...</p>
        </div>
      </div>
    );
  }

  if (!employeeData) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-600 mb-4">Failed to load employee data</p>
          <button 
            onClick={() => window.location.reload()} 
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="bg-white rounded-lg shadow-sm border p-6">
            <div className="flex items-center space-x-4">
              <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center">
                <User className="w-8 h-8 text-blue-600" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">
                  Welcome back, {employeeData.user.name}!
                </h1>
                <p className="text-gray-600">
                  {employeeData.position}
                  {employeeData.department && ` • ${employeeData.department.name}`}
                </p>
                <p className="text-sm text-gray-500">{employeeData.user.email}</p>
              </div>
            </div>
          </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <Briefcase className="w-8 h-8 text-blue-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Active Projects</p>
                <p className="text-2xl font-bold text-gray-900">{stats?.activeProjects || 0}</p>
              </div>
            </div>
          </div>

          <div className="bg-white p-6 rounded-lg shadow-sm border">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <TrendingUp className="w-8 h-8 text-green-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Performance</p>
                <p className="text-2xl font-bold text-gray-900">{stats?.performanceScore || 0}%</p>
              </div>
            </div>
          </div>

          <div className="bg-white p-6 rounded-lg shadow-sm border">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <Award className="w-8 h-8 text-purple-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Achievements</p>
                <p className="text-2xl font-bold text-gray-900">{stats?.achievements || 0}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Link
            href="/employee/projects"
            className="bg-white p-6 rounded-lg shadow-sm border hover:shadow-md transition-shadow"
          >
            <div className="text-center">
              <Briefcase className="w-8 h-8 text-blue-600 mx-auto mb-3" />
              <h3 className="font-medium text-gray-900">My Projects</h3>
              <p className="text-sm text-gray-600 mt-1">View and manage projects</p>
            </div>
          </Link>

          <Link
            href="/employee/performance"
            className="bg-white p-6 rounded-lg shadow-sm border hover:shadow-md transition-shadow"
          >
            <div className="text-center">
              <TrendingUp className="w-8 h-8 text-green-600 mx-auto mb-3" />
              <h3 className="font-medium text-gray-900">Performance</h3>
              <p className="text-sm text-gray-600 mt-1">Track your progress</p>
            </div>
          </Link>

          <Link
            href="/employee/payroll"
            className="bg-white p-6 rounded-lg shadow-sm border hover:shadow-md transition-shadow"
          >
            <div className="text-center">
              <DollarSign className="w-8 h-8 text-yellow-600 mx-auto mb-3" />
              <h3 className="font-medium text-gray-900">Payroll</h3>
              <p className="text-sm text-gray-600 mt-1">View salary & payslips</p>
            </div>
          </Link>

          <Link
            href="/employee/achievements"
            className="bg-white p-6 rounded-lg shadow-sm border hover:shadow-md transition-shadow"
          >
            <div className="text-center">
              <Award className="w-8 h-8 text-purple-600 mx-auto mb-3" />
              <h3 className="font-medium text-gray-900">Achievements</h3>
              <p className="text-sm text-gray-600 mt-1">View your awards</p>
            </div>
          </Link>
        </div>

        {/* Recent Activity */}
        <div className="bg-white rounded-lg shadow-sm border p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Recent Activity</h2>
          <div className="space-y-4">
            <div className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
              <Calendar className="w-5 h-5 text-gray-400" />
              <div>
                <p className="text-sm font-medium text-gray-900">Welcome to the Employee Portal</p>
                <p className="text-xs text-gray-500">Get started by exploring your dashboard</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}