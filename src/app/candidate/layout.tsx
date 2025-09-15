'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useAuth } from '@/lib/AuthContext';
import TokenHandler from '@/components/TokenHandler';

interface NavigationItem {
  name: string;
  href: string;
  icon: string;
}

interface CandidateSidebarProps {
  navigation: NavigationItem[];
  pathname: string;
  user: {
    name: string;
    email: string;
    profileCompleteness?: number;
  } | null;
  logout: () => void;
}

export default function CandidateLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { user, logout } = useAuth();
  const pathname = usePathname();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const navigation: NavigationItem[] = [
    { name: 'Back to Home', href: '/', icon: '🏠' },
    { name: 'Dashboard', href: '/candidate/dashboard', icon: '📊' },
    { name: 'Browse Jobs', href: '/candidate/jobs', icon: '🔍' },
    { name: 'Applied Jobs', href: '/candidate/applications', icon: '📋' },
    { name: 'Saved Jobs', href: '/candidate/saved', icon: '💾' },
    { name: 'Profile', href: '/candidate/profile', icon: '💾' },
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      <TokenHandler />
      {/* Mobile sidebar */}
      <div className={`fixed inset-0 z-50 lg:hidden ${sidebarOpen ? 'block' : 'hidden'}`}>
        <div className="fixed inset-0 bg-gray-600 bg-opacity-75" onClick={() => setSidebarOpen(false)} />
        <div className="fixed inset-y-0 left-0 flex w-64 flex-col bg-white">
          <CandidateSidebar navigation={navigation} pathname={pathname} user={user} logout={logout} />
        </div>
      </div>

      {/* Desktop sidebar */}
      <div className="hidden lg:fixed lg:inset-y-0 lg:flex lg:w-64 lg:flex-col">
        <CandidateSidebar navigation={navigation} pathname={pathname} user={user} logout={logout} />
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
          <div className="flex-1 text-sm font-semibold leading-6 text-gray-900">
            Candidate Portal
          </div>
        </div>

        <main className="py-6">
          {children}
        </main>
      </div>
    </div>
  );
}

function CandidateSidebar({ navigation, pathname, user, logout }: CandidateSidebarProps) {
  return (
    <div className="flex grow flex-col gap-y-5 overflow-y-auto border-r border-gray-200 bg-white px-6 pb-4">
      <div className="flex h-16 shrink-0 items-center">
        <h1 className="text-xl font-bold text-blue-600">Talora</h1>
      </div>

      {/* Profile Section */}
      {user && (
        <div className="bg-blue-50 rounded-lg p-4">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-blue-600 rounded-full flex items-center justify-center text-white font-semibold">
              {user.name?.charAt(0).toUpperCase()}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-gray-900 truncate">{user.name}</p>
              <p className="text-xs text-gray-500 truncate">{user.email}</p>
            </div>
          </div>
          <div className="mt-3">
            <div className="flex items-center justify-between text-xs text-gray-600">
              <span>Profile Completeness</span>
              <span>{user?.profileCompleteness || 0}%</span>
            </div>
            <div className="mt-1 w-full bg-gray-200 rounded-full h-2">
              <div className="bg-blue-600 h-2 rounded-full" style={{ width: `${user?.profileCompleteness || 0}%` }}></div>
            </div>
          </div>
          <Link
            href="/candidate/profile"
            className="mt-3 block w-full text-center bg-blue-600 text-white text-xs py-2 rounded hover:bg-blue-700"
          >
            Update Profile
          </Link>
        </div>
      )}

      <nav className="flex flex-1 flex-col">
        <ul role="list" className="flex flex-1 flex-col gap-y-7">
          <li>
            <ul role="list" className="-mx-2 space-y-1">
              {navigation.map((item: NavigationItem) => (
                <li key={item.name}>
                  <Link
                    href={item.href}
                    className={`group flex gap-x-3 rounded-md p-2 text-sm leading-6 font-semibold ${pathname === item.href
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
          <li className="mt-auto">
            <button
              onClick={logout}
              className="group -mx-2 flex w-full gap-x-3 rounded-md p-2 text-sm font-semibold leading-6 text-gray-700 hover:bg-gray-50 hover:text-red-600"
            >
              <span className="text-lg">🚪</span>
              Sign out
            </button>
          </li>
        </ul>
      </nav>
    </div>
  );
}
