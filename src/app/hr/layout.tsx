'use client';

import { ReactNode, useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter, usePathname } from 'next/navigation';
import { useAuth } from '@/lib/AuthContext';
import { 
  LayoutDashboard, 
  Users, 
  UserCheck, 
  DollarSign, 
  TrendingUp, 
  Briefcase, 
  FolderOpen, 
  BarChart3, 
  Calendar, 
  Home, 
  LogOut,
  Menu,
  X,
  Shield
} from 'lucide-react';

export default function HRLayout({ children }: { children: ReactNode }) {
  const { user, loading, logout } = useAuth();
  const router = useRouter();
  const pathname = usePathname();
  const [isAuthorized, setIsAuthorized] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  useEffect(() => {
    if (!loading) {
      if (!user) {
        router.push('/');
        return;
      }
      
      if (user.role !== 'hr' && user.role !== 'admin') {
        // Show access denied message
        alert('Access Denied: HR credentials required');
        router.push('/');
        return;
      }
      
      setIsAuthorized(true);
    }
  }, [user, loading, router]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p>Loading...</p>
        </div>
      </div>
    );
  }

  if (!isAuthorized) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-slate-50">
        <div className="text-center p-8 bg-white rounded-xl shadow-lg border border-slate-200 max-w-md">
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <Shield className="w-8 h-8 text-red-600" />
          </div>
          <h1 className="text-2xl font-bold text-slate-900 mb-2">Access Denied</h1>
          <p className="text-slate-600 mb-6">HR credentials required to access this area</p>
          <button
            onClick={() => router.push('/')}
            className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
          >
            Go to Home
          </button>
        </div>
      </div>
    );
  }

  const navigationItems = [
    { name: 'Dashboard', href: '/hr/dashboard', icon: LayoutDashboard },
    { name: 'Candidates', href: '/hr/applications', icon: Users, badge: '3' },
    { name: 'Employees', href: '/hr/employees', icon: UserCheck },
    { name: 'Payroll', href: '/hr/payroll', icon: DollarSign, badge: '2' },
    { name: 'Performance', href: '/hr/performance', icon: TrendingUp },
    { name: 'Jobs', href: '/hr/jobs', icon: Briefcase },
    { name: 'Projects', href: '/hr/projects', icon: FolderOpen },
    { name: 'Reports', href: '/hr/reports', icon: BarChart3 },
    { name: 'Interviews', href: '/hr/interviews', icon: Calendar, badge: '1' },
  ];

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Mobile sidebar */}
      <div className={`fixed inset-0 z-50 lg:hidden ${sidebarOpen ? 'block' : 'hidden'}`}>
        <div
          className="fixed inset-0 bg-slate-600 bg-opacity-75"
          onClick={() => setSidebarOpen(false)}
        />
        <div className="fixed inset-y-0 left-0 flex w-64 flex-col bg-white shadow-xl">
          <HRSidebar
            navigationItems={navigationItems}
            pathname={pathname}
            user={user}
            logout={logout}
            onClose={() => setSidebarOpen(false)}
          />
        </div>
      </div>

      {/* Desktop sidebar */}
      <div className="hidden lg:fixed lg:inset-y-0 lg:flex lg:w-64 lg:flex-col">
        <HRSidebar
          navigationItems={navigationItems}
          pathname={pathname}
          user={user}
          logout={logout}
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
          <div className="flex-1 text-sm font-semibold leading-6 text-slate-900">HR Portal</div>
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center text-white text-sm font-semibold shadow-sm">
              {user?.name?.charAt(0).toUpperCase()}
            </div>
          </div>
        </div>

        <main className="py-8 min-h-screen">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}

interface HRSidebarProps {
  navigationItems: Array<{
    name: string;
    href: string;
    icon: React.ComponentType<{ className?: string }>;
    badge?: string;
  }>;
  pathname: string | null;
  user: { name?: string; email?: string } | null;
  logout: () => void;
  onClose?: () => void;
}

function HRSidebar({ navigationItems, pathname, user, logout, onClose }: HRSidebarProps) {
  return (
    <div className="flex grow flex-col gap-y-5 overflow-y-auto bg-white px-6 pb-4 border-r border-slate-200">
      <div className="flex h-16 shrink-0 items-center">
        <div className="flex items-center space-x-3">
          <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
            <UserCheck className="w-5 h-5 text-white" />
          </div>
          <h1 className="text-xl font-bold text-slate-900">HR Portal</h1>
        </div>
        {onClose && (
          <button
            onClick={onClose}
            className="ml-auto lg:hidden p-2 text-slate-400 hover:text-slate-600"
          >
            <X className="w-5 h-5" />
          </button>
        )}
      </div>

      {/* Enhanced Profile Section */}
      {user && (
        <div className="bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 rounded-xl p-4 border border-slate-200 shadow-sm">
          <div className="flex items-center space-x-3">
            <div className="relative">
              <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl flex items-center justify-center text-white font-semibold shadow-lg">
                {user.name?.charAt(0).toUpperCase()}
              </div>
              <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-emerald-500 rounded-full border-2 border-white"></div>
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold text-slate-900 truncate">{user.name}</p>
              <p className="text-xs text-slate-600 truncate">{user.email}</p>
              <div className="flex items-center space-x-1 mt-1">
                <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                <p className="text-xs text-blue-600 font-medium">HR Manager</p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Navigation */}
      <nav className="flex flex-1 flex-col">
        <ul role="list" className="flex flex-1 flex-col gap-y-7">
          <li>
            <div className="text-xs font-semibold leading-6 text-slate-400 uppercase tracking-wide mb-2">
              Navigation
            </div>
            <ul role="list" className="-mx-2 mt-2 space-y-1">
              <li>
                <Link
                  href="/"
                  className="group flex gap-x-3 rounded-lg p-3 text-sm leading-6 font-medium text-slate-700 hover:text-blue-600 hover:bg-slate-50 transition-all duration-200 border border-transparent hover:border-slate-200"
                  onClick={onClose}
                >
                  <Home className="w-5 h-5" />
                  Back to Home
                </Link>
              </li>
              {navigationItems.map((item) => {
                const IconComponent = item.icon;
                return (
                  <li key={item.name}>
                    <Link
                      href={item.href}
                      className={`group flex gap-x-3 rounded-lg p-3 text-sm leading-6 font-medium transition-all duration-200 relative ${
                        pathname === item.href
                          ? 'bg-blue-50 text-blue-700 border border-blue-200 shadow-sm'
                          : 'text-slate-700 hover:text-blue-600 hover:bg-slate-50 border border-transparent hover:border-slate-200'
                      }`}
                      onClick={onClose}
                    >
                      <IconComponent className="w-5 h-5" />
                      <span className="flex-1">{item.name}</span>
                      {item.badge && (
                        <span className="inline-flex items-center justify-center w-5 h-5 text-xs font-bold text-white bg-red-500 rounded-full">
                          {item.badge}
                        </span>
                      )}
                    </Link>
                  </li>
                );
              })}
            </ul>
          </li>

          {/* Bottom Actions */}
          <li className="mt-auto">
            <button
              onClick={() => {
                logout();
                onClose?.();
              }}
              className="group -mx-2 flex w-full gap-x-3 rounded-lg p-3 text-sm font-medium leading-6 text-slate-700 hover:bg-red-50 hover:text-red-600 transition-all duration-200 border border-transparent hover:border-red-200"
            >
              <LogOut className="w-5 h-5" />
              Sign out
            </button>
          </li>
        </ul>
      </nav>
    </div>
  );
}
