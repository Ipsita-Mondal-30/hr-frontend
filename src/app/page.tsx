'use client';

import { useAuth } from '@/lib/AuthContext';
import Navbar from '@/components/Navbar';
import Link from 'next/link';

export default function HomePage() {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navbar />
        <div className="flex items-center justify-center h-96">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {user ? (
          <UserDashboard user={user} />
        ) : (
          <PublicHomePage />
        )}
      </main>
    </div>
  );
}

function UserDashboard({ user }: { user: any }) {
  const getDashboardLink = () => {
    switch (user.role) {
      case 'admin':
        return '/admin/dashboard';
      case 'hr':
        return '/hr/dashboard';
      case 'candidate':
        return '/candidate/dashboard';
      default:
        return '/';
    }
  };

  const getRoleDescription = () => {
    switch (user.role) {
      case 'admin':
        return 'Manage the entire HR system, approve jobs, and oversee all operations.';
      case 'hr':
        return 'Post jobs, review applications, and manage the hiring process.';
      case 'candidate':
        return 'Browse jobs, submit applications, and track your progress.';
      default:
        return 'Welcome to the HR system.';
    }
  };

  const getQuickActions = () => {
    switch (user.role) {
      case 'admin':
        return [
          { title: 'Pending Job Approvals', href: '/admin/jobs/pending', icon: '⏳' },
          { title: 'Manage Users', href: '/admin/users', icon: '👥' },
          { title: 'System Analytics', href: '/admin/analytics', icon: '📊' },
          { title: 'All Jobs', href: '/admin/jobs', icon: '💼' },
        ];
      case 'hr':
        return [
          { title: 'Post New Job', href: '/hr/jobs', icon: '➕' },
          { title: 'Review Applications', href: '/hr/applications', icon: '📋' },
          { title: 'Schedule Interviews', href: '/hr/interviews', icon: '📅' },
          { title: 'HR Reports', href: '/hr/reports', icon: '📈' },
        ];
      case 'candidate':
        return [
          { title: 'Browse Jobs', href: '/candidate/jobs', icon: '🔍' },
          { title: 'My Applications', href: '/candidate/applications', icon: '📄' },
          { title: 'Saved Jobs', href: '/candidate/saved', icon: '💾' },
          { title: 'Update Profile', href: '/candidate/profile', icon: '👤' },
        ];
      default:
        return [];
    }
  };

  return (
    <div className="space-y-8">
      {/* Welcome Section */}
      <div className="bg-white rounded-lg shadow-sm border p-8">
        <div className="flex items-center space-x-4 mb-4">
          <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center">
            <span className="text-blue-600 font-bold text-xl">
              {user.name.charAt(0).toUpperCase()}
            </span>
          </div>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">
              Welcome back, {user.name}!
            </h1>
            <p className="text-gray-600">
              {getRoleDescription()}
            </p>
          </div>
        </div>
        
        <Link
          href={getDashboardLink()}
          className="inline-flex items-center px-6 py-3 bg-blue-600 text-white rounded-md hover:bg-blue-700 font-medium"
        >
          Go to Dashboard →
        </Link>
      </div>

      {/* Quick Actions */}
      <div>
        <h2 className="text-xl font-semibold text-gray-900 mb-4">Quick Actions</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {getQuickActions().map((action, index) => (
            <Link
              key={index}
              href={action.href}
              className="bg-white rounded-lg shadow-sm border p-6 hover:shadow-md transition-shadow"
            >
              <div className="text-3xl mb-3">{action.icon}</div>
              <h3 className="font-medium text-gray-900">{action.title}</h3>
            </Link>
          ))}
        </div>
      </div>

      {/* Role-specific content */}
      {user.role === 'admin' && (
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6">
          <h3 className="text-lg font-medium text-yellow-800 mb-2">
            🔔 Admin Notice
          </h3>
          <p className="text-yellow-700">
            Remember: All jobs posted by HR need your approval before they become visible to candidates.
            Check the pending approvals regularly to keep the hiring process moving.
          </p>
        </div>
      )}
    </div>
  );
}

function PublicHomePage() {
  return (
    <div className="text-center space-y-12">
      {/* Hero Section */}
      <div className="space-y-6">
        <h1 className="text-4xl md:text-6xl font-bold text-gray-900">
          Smart HR System
        </h1>
        <p className="text-xl text-gray-600 max-w-3xl mx-auto">
          Streamline your hiring process with AI-powered matching, automated workflows, 
          and comprehensive candidate management.
        </p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Link
            href="/login"
            className="px-8 py-3 bg-blue-600 text-white rounded-md hover:bg-blue-700 font-medium"
          >
            Get Started
          </Link>
          <Link
            href="/candidate/jobs"
            className="px-8 py-3 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50 font-medium"
          >
            Browse Jobs
          </Link>
        </div>
      </div>

      {/* Features */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mt-16">
        <div className="text-center space-y-4">
          <div className="text-4xl">🤖</div>
          <h3 className="text-xl font-semibold">AI-Powered Matching</h3>
          <p className="text-gray-600">
            Advanced algorithms match candidates with the perfect job opportunities
          </p>
        </div>
        
        <div className="text-center space-y-4">
          <div className="text-4xl">⚡</div>
          <h3 className="text-xl font-semibold">Streamlined Process</h3>
          <p className="text-gray-600">
            Automated workflows make hiring faster and more efficient
          </p>
        </div>
        
        <div className="text-center space-y-4">
          <div className="text-4xl">📊</div>
          <h3 className="text-xl font-semibold">Analytics & Insights</h3>
          <p className="text-gray-600">
            Data-driven insights to improve your hiring decisions
          </p>
        </div>
      </div>

      {/* CTA Section */}
      <div className="bg-blue-50 rounded-lg p-8 mt-16">
        <h2 className="text-2xl font-bold text-gray-900 mb-4">
          Ready to transform your hiring process?
        </h2>
        <p className="text-gray-600 mb-6">
          Join thousands of companies using our platform to find the best talent.
        </p>
        <Link
          href="/login"
          className="inline-flex items-center px-6 py-3 bg-blue-600 text-white rounded-md hover:bg-blue-700 font-medium"
        >
          Start Free Trial →
        </Link>
      </div>
    </div>
  );
}