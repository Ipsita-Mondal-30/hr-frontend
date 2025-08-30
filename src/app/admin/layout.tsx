'use client';
import { ReactNode } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

export default function AdminLayout({ children }: { children: ReactNode }) {
  const pathname = usePathname();

  const isActive = (path: string) => pathname === path;

  const navItems = [
    { href: '/admin/dashboard', label: '📊 Dashboard', icon: '📊' },
    {
      label: '👥 User Management',
      items: [
        { href: '/admin/users', label: 'All Users' },
        { href: '/admin/users/candidates', label: 'View Candidates' },
        { href: '/admin/users/hr', label: 'View HR Users' },
        { href: '/admin/users/verification', label: 'HR Verification' }
      ]
    },
    {
      label: '💼 Job Management',
      items: [
        { href: '/admin/jobs', label: 'All Jobs' },
        { href: '/admin/jobs/pending', label: 'Pending Approval' }
      ]
    },
    {
      label: '👥 Employee Management',
      items: [
        { href: '/admin/employees', label: 'View Employees' },
        { href: '/admin/employees/create', label: 'Add Employee' },
        { href: '/admin/payroll', label: 'Payroll Management' }
      ]
    },
    {
      label: '📊 Project Management',
      items: [
        { href: '/admin/projects', label: 'All Projects' },
        { href: '/admin/projects/create', label: 'Create Project' }
      ]
    },
    {
      label: '📅 Interview Management',
      items: [
        { href: '/admin/interviews', label: 'All Interviews' },
        { href: '/admin/interviews/scheduled', label: 'Scheduled' },
        { href: '/admin/interviews/completed', label: 'Completed' }
      ]
    },
    {
      label: '📈 Reports & Analytics',
      items: [
        { href: '/admin/analytics', label: 'Platform Analytics' },
        { href: '/admin/reports', label: 'Basic Reports' },
        { href: '/admin/reports/hiring', label: 'Hiring Trends' },
        { href: '/admin/reports/activity', label: 'User Activity' }
      ]
    },
    {
      label: '⚙️ Settings',
      items: [
        { href: '/admin/settings/departments', label: 'Departments' },
        { href: '/admin/settings/roles', label: 'Roles' }
      ]
    },
    {
      label: '🎧 Support',
      items: [
        { href: '/admin/support/tickets', label: 'Support Tickets' },
        { href: '/admin/support/reports', label: 'User Reports' }
      ]
    }
  ];

  return (
    <div className="flex min-h-screen bg-gray-50">
      <aside className="w-72 bg-white shadow-sm border-r border-gray-200">
        <div className="p-6 border-b border-gray-200">
          <h1 className="text-xl font-bold text-gray-900">🛠️ Admin Panel</h1>
          <p className="text-sm text-gray-600 mt-1">Platform Management</p>
        </div>

        <nav className="p-4 space-y-2 max-h-screen overflow-y-auto">
          {/* Home Link */}
          <Link
            href="/"
            className="flex items-center px-3 py-2 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-100 mb-4 border-b border-gray-200"
          >
            🏠 Back to Home
          </Link>
          
          {navItems.map((item, index) => (
            <div key={index}>
              {item.href ? (
                <Link
                  href={item.href}
                  className={`flex items-center px-3 py-2 rounded-md text-sm font-medium transition-colors ${isActive(item.href)
                    ? 'bg-blue-100 text-blue-700'
                    : 'text-gray-700 hover:bg-gray-100'
                    }`}
                >
                  {item.label}
                </Link>
              ) : (
                <div className="mt-6 first:mt-0">
                  <h3 className="px-3 text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">
                    {item.label}
                  </h3>
                  <div className="space-y-1">
                    {item.items?.map((subItem, subIndex) => (
                      <Link
                        key={subIndex}
                        href={subItem.href}
                        className={`flex items-center px-3 py-2 rounded-md text-sm transition-colors ${isActive(subItem.href)
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
      </aside>

      <main className="flex-1 overflow-auto">
        <div className="p-6">
          {children}
        </div>
      </main>
    </div>
  );
}
