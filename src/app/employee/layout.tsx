'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useAuth } from '@/lib/AuthContext';
import api from '@/lib/api';
import { 
  LayoutDashboard, 
  Briefcase, 
  Target, 
  MessageSquare, 
  BookOpen, 
  User, 
  Award, 
  DollarSign,
  HelpCircle,
  LogOut,
  Menu,
  X
} from 'lucide-react';

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
    { name: 'Dashboard', href: '/employee/dashboard', icon: 'LayoutDashboard' },
    { name: 'My Projects', href: '/employee/projects', icon: 'Briefcase' },
    { name: 'Performance & OKRs', href: '/employee/performance', icon: 'Target' },
    { name: 'Feedback & Reviews', href: '/employee/feedback', icon: 'MessageSquare' },
    { name: 'Learning & Growth', href: '/employee/learning', icon: 'BookOpen' },
    { name: 'My Profile', href: '/employee/profile', icon: 'User' },
    { name: 'Achievements', href: '/employee/achievements', icon: 'Award' },
    { name: 'Payroll', href: '/employee/payroll', icon: 'DollarSign' },
  ];

  const quickActions: QuickActionItem[] = [
    { name: 'Request Feedback', href: '/employee/feedback/request', icon: 'MessageSquare' },
    { name: 'View Payslip', href: '/employee/payroll', icon: 'DollarSign' },
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
        <div className="sticky top-0 z-40 flex h-16 shrink-0 items-center gap-x-4 border-b border-slate-200 bg-white px-4 shadow-sm lg:hidden">
          <button
            type="button"
            className="-m-2.5 p-2.5 text-slate-700 lg:hidden hover:bg-slate-100 rounded-lg transition-colors"
            onClick={() => setSidebarOpen(true)}
          >
            <span className="sr-only">Open sidebar</span>
            <Menu className="w-6 h-6" />
          </button>
          <div className="flex-1 text-sm font-semibold leading-6 text-slate-900">Employee Portal</div>
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center text-white text-sm font-semibold shadow-sm">
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

const iconMap = {
  LayoutDashboard,
  Briefcase,
  Target,
  MessageSquare,
  BookOpen,
  User,
  Award,
  DollarSign,
  HelpCircle,
  LogOut
};

function getIcon(iconName: string, className: string = "w-5 h-5") {
  const IconComponent = iconMap[iconName as keyof typeof iconMap];
  return IconComponent ? <IconComponent className={className} /> : null;
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
        <div className="flex items-center space-x-2">
          <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
            <User className="w-5 h-5 text-white" />
          </div>
          <h1 className="text-xl font-bold text-slate-900">Employee Portal</h1>
        </div>
      </div>

      {/* Profile Section */}
      {user && (
        <div className="bg-gradient-to-r from-slate-50 to-blue-50 rounded-xl p-4 border border-slate-200">
          <div className="flex items-center space-x-3">
            <div className="w-12 h-12 bg-blue-600 rounded-xl flex items-center justify-center text-white font-semibold shadow-sm">
              {user.name?.charAt(0).toUpperCase()}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold text-slate-900 truncate">{user.name}</p>
              <p className="text-xs text-slate-600 truncate">{user.email}</p>
              <p className="text-xs text-blue-600 font-medium">Employee</p>
            </div>
          </div>

          {/* Quick Status */}
          <div className="mt-3 grid grid-cols-2 gap-2 text-xs">
            <div className="bg-white rounded-lg p-2 text-center border border-slate-100">
              <div className="font-semibold text-emerald-600">{employeeData.performanceScore}%</div>
              <div className="text-slate-500">Performance</div>
            </div>
            <div className="bg-white rounded-lg p-2 text-center border border-slate-100">
              <div className="font-semibold text-blue-600">{employeeData.projectCount}</div>
              <div className="text-slate-500">Projects</div>
            </div>
          </div>
        </div>
      )}

      {/* Navigation */}
      <nav className="flex flex-1 flex-col">
        <ul role="list" className="flex flex-1 flex-col gap-y-7">
          <li>
            <div className="text-xs font-semibold leading-6 text-slate-400 uppercase tracking-wide">
              Main Navigation
            </div>
            <ul role="list" className="-mx-2 mt-2 space-y-1">
              {navigation.map((item) => (
                <li key={item.name}>
                  <Link
                    href={item.href}
                    className={`group flex gap-x-3 rounded-lg p-3 text-sm leading-6 font-medium transition-all duration-200 ${
                      pathname === item.href
                        ? 'bg-blue-50 text-blue-700 border border-blue-200 shadow-sm'
                        : 'text-slate-700 hover:text-blue-600 hover:bg-slate-50 border border-transparent'
                    }`}
                  >
                    {getIcon(item.icon, "w-5 h-5")}
                    {item.name}
                  </Link>
                </li>
              ))}
            </ul>
          </li>

          {/* Quick Actions */}
          <li>
            <div className="text-xs font-semibold leading-6 text-slate-400 uppercase tracking-wide">
              Quick Actions
            </div>
            <ul role="list" className="-mx-2 mt-2 space-y-1">
              {quickActions.map((item) => (
                <li key={item.name}>
                  <Link
                    href={item.href}
                    className="group flex gap-x-3 rounded-lg p-3 text-sm leading-6 font-medium text-slate-600 hover:text-blue-600 hover:bg-slate-50 transition-all duration-200 border border-transparent hover:border-slate-200"
                  >
                    {getIcon(item.icon, "w-4 h-4")}
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
                className="group -mx-2 flex gap-x-3 rounded-lg p-3 text-sm font-medium leading-6 text-slate-700 hover:bg-slate-50 hover:text-blue-600 transition-all duration-200 border border-transparent hover:border-slate-200"
              >
                <HelpCircle className="w-5 h-5" />
                Help & Support
              </Link>
              <button
                onClick={logout}
                className="group -mx-2 flex w-full gap-x-3 rounded-lg p-3 text-sm font-medium leading-6 text-slate-700 hover:bg-red-50 hover:text-red-600 transition-all duration-200 border border-transparent hover:border-red-200"
              >
                <LogOut className="w-5 h-5" />
                Sign out
              </button>
            </div>
          </li>
        </ul>
      </nav>
    </div>
  );
}
