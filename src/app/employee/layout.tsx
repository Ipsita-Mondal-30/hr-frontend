'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useAuth } from '@/lib/AuthContext';
import api from '@/lib/api';

interface EmployeeData {
  performanceScore: number;
  projectCount: number;
}

type NavItem = { name: string; href: string; icon: string };
type QuickActionItem = { name: string; href: string; icon: string };

export default function EmployeeLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { user, logout } = useAuth();
  const pathname = usePathname();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [employeeData, setEmployeeData] = useState<EmployeeData>({
    performanceScore: 0,
    projectCount: 0,
  });

  useEffect(() => {
    if (user) {
      fetchEmployeeData();
    }
  }, [user]);

  const fetchEmployeeData = async () => {
    try {
      const [profileResponse, projectsResponse] = await Promise.all([
        api.get('/employees/me'),
        api.get('/employees/me/projects'),
      ]);

      setEmployeeData({
        performanceScore: profileResponse.data.performanceScore || 0,
        projectCount: projectsResponse.data.projects?.length || 0,
      });
    } catch (error) {
      console.error('Error fetching employee data:', error);
    }
  };

  const navigation: NavItem[] = [
    { name: 'Dashboard', href: '/employee/dashboard', icon: '📊' },
    { name: 'My Projects', href: '/employee/projects', icon: '📋' },
    { name: 'Performance & OKRs', href: '/employee/performance', icon: '🎯' },
    { name: 'Feedback & Reviews', href: '/employee/feedback', icon: '💬' },
    { name: 'Learning & Growth', href: '/employee/learning', icon: '📚' },
    { name: 'My Profile', href: '/employee/profile', icon: '👤' },
    { name: 'Achievements', href: '/employee/achievements', icon: '🏆' },
    { name: 'Payroll', href: '/employee/payroll', icon: '💰' },
  ];

  const quickActions: QuickActionItem[] = [
    { name: 'Request Feedback', href: '/employee/feedback/request', icon: '💬' },
    { name: 'View Payslip', href: '/employee/payroll', icon: '💰' },
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Mobile sidebar */}
      <div className={`fixed inset-0 z-50 lg:hidden ${sidebarOpen ? 'block' : 'hidden'}`}>
        <div
          className="fixed inset-0 bg-gray-600 bg-opacity-75"
          onClick={() => setSidebarOpen(false)}
        />
        <div className="fixed inset-y-0 left-0 flex w-64 flex-col bg-white">
          <EmployeeSidebar
            navigation={navigation}
            quickActions={quickActions}
            pathname={pathname}
            user={user}
            logout={logout}
            employeeData={employeeData}
          />
        </div>
      </div>

      {/* Desktop sidebar */}
      <div className="hidden lg:fixed lg:inset-y-0 lg:flex lg:w-64 lg:flex-col">
        <EmployeeSidebar
          navigation={navigation}
          quickActions={quickActions}
          pathname={pathname}
          user={user}
          logout={logout}
          employeeData={employeeData}
        />
      </div>

      {/* Main content */}
      <div className="lg:pl-64">
        {/* Mobile header */}
        <div className="sticky top-0 z-40 flex h-16 shrink-0 items-center gap-x-4 border-b border-gray-200 bg-white px-4 shadow-sm lg:hidden">
          <button
            type="button"
            className="-m-2.5 p-2.5 text-gray-700 lg:hidden"
            onClick={() => setSidebarOpen(true)}
          >
            <span className="sr-only">Open sidebar</span>
            ☰
          </button>
          <div className="flex-1 text-sm font-semibold leading-6 text-gray-900">Employee Portal</div>
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center text-white text-sm font-semibold">
              {user?.name?.charAt(0).toUpperCase()}
            </div>
          </div>
        </div>

        <main>{children}</main>
      </div>
    </div>
  );
}

interface EmployeeSidebarProps {
  navigation: NavItem[];
  quickActions: QuickActionItem[];
  pathname: string | null;
  user: { name?: string; email?: string } | null;
  logout: () => void;
  employeeData: EmployeeData;
}

function EmployeeSidebar({
  navigation,
  quickActions,
  pathname,
  user,
  logout,
  employeeData,
}: EmployeeSidebarProps) {
  return (
    <div className="flex grow flex-col gap-y-5 overflow-y-auto border-r border-gray-200 bg-white px-6 pb-4">
      <div className="flex h-16 shrink-0 items-center">
        <h1 className="text-xl font-bold text-blue-600">Employee Portal</h1>
      </div>

      {/* Profile Section */}
      {user && (
        <div className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-lg p-4 border border-blue-200">
          <div className="flex items-center space-x-3">
            <div className="w-12 h-12 bg-blue-600 rounded-full flex items-center justify-center text-white font-semibold">
              {user.name?.charAt(0).toUpperCase()}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-gray-900 truncate">{user.name}</p>
              <p className="text-xs text-gray-500 truncate">{user.email}</p>
              <p className="text-xs text-blue-600 font-medium">Employee</p>
            </div>
          </div>

          {/* Quick Status */}
          <div className="mt-3 grid grid-cols-2 gap-2 text-xs">
            <div className="bg-white rounded p-2 text-center">
              <div className="font-semibold text-green-600">{employeeData.performanceScore}%</div>
              <div className="text-gray-500">Performance</div>
            </div>
            <div className="bg-white rounded p-2 text-center">
              <div className="font-semibold text-blue-600">{employeeData.projectCount}</div>
              <div className="text-gray-500">Projects</div>
            </div>
          </div>
        </div>
      )}

      {/* Navigation */}
      <nav className="flex flex-1 flex-col">
        <ul role="list" className="flex flex-1 flex-col gap-y-7">
          <li>
            <div className="text-xs font-semibold leading-6 text-gray-400 uppercase tracking-wide">
              Main Navigation
            </div>
            <ul role="list" className="-mx-2 mt-2 space-y-1">
              {navigation.map((item) => (
                <li key={item.name}>
                  <Link
                    href={item.href}
                    className={`group flex gap-x-3 rounded-md p-2 text-sm leading-6 font-semibold ${
                      pathname === item.href
                        ? 'bg-blue-50 text-blue-600'
                        : 'text-gray-700 hover:text-blue-600 hover:bg-gray-50'
                    }`}
                  >
                    <span className="text-lg">{item.icon}</span>
                    {item.name}
                  </Link>
                </li>
              ))}
            </ul>
          </li>

          {/* Quick Actions */}
          <li>
            <div className="text-xs font-semibold leading-6 text-gray-400 uppercase tracking-wide">
              Quick Actions
            </div>
            <ul role="list" className="-mx-2 mt-2 space-y-1">
              {quickActions.map((item) => (
                <li key={item.name}>
                  <Link
                    href={item.href}
                    className="group flex gap-x-3 rounded-md p-2 text-sm leading-6 font-medium text-gray-600 hover:text-blue-600 hover:bg-gray-50"
                  >
                    <span className="text-base">{item.icon}</span>
                    {item.name}
                  </Link>
                </li>
              ))}
            </ul>
          </li>

          {/* Bottom Actions */}
          <li className="mt-auto">
            <div className="space-y-1">
              <Link
                href="/employee/help"
                className="group -mx-2 flex gap-x-3 rounded-md p-2 text-sm font-semibold leading-6 text-gray-700 hover:bg-gray-50 hover:text-blue-600"
              >
                <span className="text-lg">❓</span>
                Help & Support
              </Link>
              <button
                onClick={logout}
                className="group -mx-2 flex w-full gap-x-3 rounded-md p-2 text-sm font-semibold leading-6 text-gray-700 hover:bg-gray-50 hover:text-red-600"
              >
                <span className="text-lg">🚪</span>
                Sign out
              </button>
            </div>
          </li>
        </ul>
      </nav>
    </div>
  );
}
