'use client';

import { ReactNode, useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  LayoutDashboard,
  Users,
  Briefcase,
  UserCheck,
  FolderOpen,
  Calendar,
  BarChart3,
  Headphones,
  Home,
  Shield,
  Building2,
  ClipboardList,
  Menu,
  X,
  type LucideIcon,
} from 'lucide-react';

type NavItem =
  | { href: string; label: string; icon: LucideIcon }
  | { label: string; icon: LucideIcon; items: { href: string; label: string }[] };

const navItems: NavItem[] = [
  { href: '/admin/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  {
    label: 'User Management',
    icon: Users,
    items: [
      { href: '/admin/users', label: 'All Users' },
      { href: '/admin/users/candidates', label: 'View Candidates' },
      { href: '/admin/users/hr', label: 'View HR Users' },
      { href: '/admin/users/verification', label: 'HR Verification' },
    ],
  },
  {
    label: 'Job Management',
    icon: Briefcase,
    items: [
      { href: '/admin/jobs', label: 'All Jobs' },
      { href: '/admin/jobs/pending', label: 'Pending Approval' },
    ],
  },
  {
    label: 'Employee Management',
    icon: UserCheck,
    items: [
      { href: '/admin/employees', label: 'View Employees' },
      { href: '/admin/employees/create', label: 'Add Employee' },
      { href: '/admin/payroll', label: 'Payroll Management' },
      { href: '/admin/achievements', label: 'Achievements' },
    ],
  },
  {
    label: 'Project Management',
    icon: FolderOpen,
    items: [
      { href: '/admin/projects', label: 'All Projects' },
      { href: '/admin/projects/create', label: 'Create Project' },
    ],
  },
  {
    label: 'Interview Management',
    icon: Calendar,
    items: [
      { href: '/admin/interviews', label: 'All Interviews' },
      { href: '/admin/interviews/scheduled', label: 'Scheduled' },
      { href: '/admin/interviews/completed', label: 'Completed' },
    ],
  },
  {
    label: 'Reports & Analytics',
    icon: BarChart3,
    items: [
      { href: '/admin/hiring', label: 'Hiring Intelligence' },
      { href: '/admin/analytics', label: 'Platform Analytics' },
      { href: '/admin/reports', label: 'Basic Reports' },
      { href: '/admin/reports/activity', label: 'User Activity' },
    ],
  },
  { href: '/admin/hire-approvals', label: 'Hire Approvals', icon: UserCheck },
  { href: '/admin/settings/departments', label: 'Departments', icon: Building2 },
  { href: '/admin/settings/roles', label: 'Roles', icon: ClipboardList },
  {
    label: 'Support',
    icon: Headphones,
    items: [
      { href: '/admin/support/tickets', label: 'Support Tickets' },
      { href: '/admin/support/reports', label: 'User Reports' },
    ],
  },
];

function AdminSidebar({
  pathname,
  onNavigate,
}: {
  pathname: string | null;
  onNavigate?: () => void;
}) {
  const isActive = (path: string) => pathname === path;

  return (
    <div className="flex h-full flex-col bg-white border-r border-gray-200">
      <div className="p-4 sm:p-6 border-b border-gray-200 shrink-0">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
            <Shield className="w-5 h-5 text-blue-600" />
          </div>
          <div className="min-w-0">
            <h1 className="text-lg sm:text-xl font-bold text-gray-900 truncate">Admin Panel</h1>
            <p className="text-xs sm:text-sm text-gray-600 truncate">Platform Management</p>
          </div>
        </div>
      </div>

      <nav className="flex-1 overflow-y-auto p-4 space-y-2">
        <Link
          href="/"
          onClick={onNavigate}
          className="flex items-center gap-2 px-3 py-2 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-100 mb-4 border-b border-gray-200 pb-4"
        >
          <Home className="w-4 h-4 flex-shrink-0" />
          Back to Home
        </Link>

        {navItems.map((item, index) => (
          <div key={index}>
            {'href' in item ? (
              <Link
                href={item.href}
                onClick={onNavigate}
                className={`flex items-center gap-2 px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                  isActive(item.href)
                    ? 'bg-blue-100 text-blue-700'
                    : 'text-gray-700 hover:bg-gray-100'
                }`}
              >
                <item.icon className="w-4 h-4 flex-shrink-0" />
                {item.label}
              </Link>
            ) : (
              <div className="mt-4 first:mt-0">
                <h3 className="flex items-center gap-2 px-3 text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">
                  <item.icon className="w-3.5 h-3.5 flex-shrink-0" />
                  {item.label}
                </h3>
                <div className="space-y-1">
                  {item.items.map((subItem) => (
                    <Link
                      key={subItem.href}
                      href={subItem.href}
                      onClick={onNavigate}
                      className={`flex items-center px-3 py-2 rounded-md text-sm transition-colors ${
                        isActive(subItem.href)
                          ? 'bg-blue-100 text-blue-700 font-medium'
                          : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                      }`}
                    >
                      {subItem.label}
                    </Link>
                  ))}
                </div>
              </div>
            )}
          </div>
        ))}
      </nav>
    </div>
  );
}

export default function AdminLayout({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="min-h-screen bg-gray-50">
      <div className={`fixed inset-0 z-50 lg:hidden ${sidebarOpen ? 'block' : 'hidden'}`}>
        <div className="fixed inset-0 bg-gray-600/75" onClick={() => setSidebarOpen(false)} />
        <div className="fixed inset-y-0 left-0 flex w-72 max-w-[85vw] flex-col bg-white shadow-xl">
          <div className="flex items-center justify-end p-2 border-b border-gray-200">
            <button
              type="button"
              onClick={() => setSidebarOpen(false)}
              className="p-2 rounded-md text-gray-500 hover:bg-gray-100"
              aria-label="Close menu"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
          <AdminSidebar pathname={pathname} onNavigate={() => setSidebarOpen(false)} />
        </div>
      </div>

      <div className="hidden lg:fixed lg:inset-y-0 lg:flex lg:w-72 lg:flex-col">
        <AdminSidebar pathname={pathname} />
      </div>

      <div className="lg:pl-72 min-w-0">
        <div className="sticky top-0 z-40 flex h-14 shrink-0 items-center gap-x-3 border-b border-gray-200 bg-white px-4 shadow-sm lg:hidden">
          <button
            type="button"
            onClick={() => setSidebarOpen(true)}
            className="p-2 -ml-1 rounded-md text-gray-700 hover:bg-gray-100"
            aria-label="Open menu"
          >
            <Menu className="w-6 h-6" />
          </button>
          <span className="text-sm font-semibold text-gray-900 truncate">Admin Panel</span>
        </div>

        <main className="overflow-x-hidden">
          <div className="p-4 sm:p-6 max-w-full">{children}</div>
        </main>
      </div>
    </div>
  );
}
