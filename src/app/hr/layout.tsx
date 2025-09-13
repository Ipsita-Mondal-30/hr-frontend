'use client';

import { ReactNode, useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/AuthContext';
import TokenHandler from '@/components/TokenHandler';

export default function HRLayout({ children }: { children: ReactNode }) {
  const { user, loading, logout } = useAuth();
  const router = useRouter();
  const [isAuthorized, setIsAuthorized] = useState(false);

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
      <div className="flex items-center justify-center min-h-screen bg-red-50">
        <div className="text-center p-8 bg-white rounded-lg shadow-md">
          <div className="text-red-500 text-6xl mb-4">🔒</div>
          <h1 className="text-2xl font-bold text-red-600 mb-2">Access Denied</h1>
          <p className="text-gray-600 mb-4">HR credentials required to access this area</p>
          <button
            onClick={() => router.push('/')}
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
          >
            Go to Home
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen">
      <TokenHandler />
      <aside className="w-64 bg-gray-800 text-white p-6 space-y-4">
        <div className="mb-6">
          <h1 className="text-xl font-semibold text-white">HR Panel</h1>
          <p className="text-gray-300 text-sm">Welcome, {user?.name}</p>
        </div>
        
        <nav className="flex flex-col space-y-2">
          <Link 
            href="/" 
            className="px-3 py-2 rounded hover:bg-gray-700 transition-colors border-b border-gray-700 mb-2"
          >
            🏠 Back to Home
          </Link>
          <Link 
            href="/hr/dashboard" 
            className="px-3 py-2 rounded hover:bg-gray-700 transition-colors"
          >
            📊 Dashboard
          </Link>
          <Link 
            href="/hr/applications" 
            className="px-3 py-2 rounded hover:bg-gray-700 transition-colors"
          >
            👥 Candidate Management
          </Link>
          <Link 
            href="/hr/employees" 
            className="px-3 py-2 rounded hover:bg-gray-700 transition-colors"
          >
            👨‍💼 Employee Management
          </Link>
          <Link 
            href="/hr/payroll" 
            className="px-3 py-2 rounded hover:bg-gray-700 transition-colors"
          >
            💰 Payroll Management
          </Link>
          <Link 
            href="/hr/performance" 
            className="px-3 py-2 rounded hover:bg-gray-700 transition-colors"
          >
            📈 Performance & OKRs
          </Link>
          <Link 
            href="/hr/jobs" 
            className="px-3 py-2 rounded hover:bg-gray-700 transition-colors"
          >
            💼 Manage Jobs
          </Link>
          <Link 
            href="/hr/projects" 
            className="px-3 py-2 rounded hover:bg-gray-700 transition-colors"
          >
            📊 View Projects
          </Link>

          <Link 
            href="/hr/reports" 
            className="px-3 py-2 rounded hover:bg-gray-700 transition-colors"
          >
            📈 Reports & Analytics
          </Link>
          <Link 
            href="/hr/interviews" 
            className="px-3 py-2 rounded hover:bg-gray-700 transition-colors"
          >
            🎤 Interviews
          </Link>
        </nav>

        <div className="mt-auto pt-6 border-t border-gray-700">
          <button
            onClick={logout}
            className="w-full px-3 py-2 text-left rounded hover:bg-red-600 transition-colors text-red-300 hover:text-white"
          >
            🚪 Logout
          </button>
        </div>
      </aside>
      
      <main className="flex-1 bg-gray-50">
        {children}
      </main>
    </div>
  );
}
