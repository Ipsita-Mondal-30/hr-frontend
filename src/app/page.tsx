'use client';

import { useAuth } from '@/lib/AuthContext';
import Navbar from '@/components/Navbar';
import Link from 'next/link';
import { RoleCards3D } from '@/components/RoleCards3D';
import { HeroSection } from '@/components/HerSection';

export default function HomePage() {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 to-white">
        <Navbar />
        <div className="flex items-center justify-center h-96">
          <div className="animate-spin rounded-full h-10 w-10 border-4 border-purple-200 border-t-purple-600"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-cyan-50">
      {/* Fixed navbar positioning */}
      <div className="relative z-10">
        <Navbar />
      </div>
      
      {/* Main content with proper spacing */}
      <main className="pt-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {user ? (
            <UserDashboard user={user} />
          ) : (
            <PublicHomePage />
          )}
        </div>
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
        return 'Manage the entire HR system, approve jobs, and oversee all operations with comprehensive administrative controls.';
      case 'hr':
        return 'Post job openings, review applications, and streamline the hiring process with professional tools.';
      case 'candidate':
        return 'Explore career opportunities, submit applications, and track your professional journey.';
      default:
        return 'Welcome to Talora - Your Professional HR Management Platform.';
    }
  };

  const getQuickActions = () => {
    switch (user.role) {
      case 'admin':
        return [
          { 
            title: 'Pending Job Approvals', 
            href: '/admin/jobs/pending', 
            icon: (
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            ),
            description: 'Review and approve pending job postings'
          },
          { 
            title: 'Manage Users', 
            href: '/admin/users', 
            icon: (
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z" />
              </svg>
            ),
            description: 'Oversee user accounts and permissions'
          },
          { 
            title: 'System Analytics', 
            href: '/admin/analytics', 
            icon: (
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
              </svg>
            ),
            description: 'View comprehensive system reports'
          },
          { 
            title: 'All Jobs', 
            href: '/admin/jobs', 
            icon: (
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2-2v2m8 0H8m8 0v6a2 2 0 01-2 2H10a2 2 0 01-2-2V6" />
              </svg>
            ),
            description: 'Monitor all job listings and status'
          },
        ];
      case 'hr':
        return [
          { 
            title: 'Post New Job', 
            href: '/hr/jobs', 
            icon: (
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
              </svg>
            ),
            description: 'Create and publish new job openings'
          },
          { 
            title: 'Review Applications', 
            href: '/hr/applications', 
            icon: (
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
            ),
            description: 'Evaluate candidate applications'
          },
          { 
            title: 'Schedule Interviews', 
            href: '/hr/interviews', 
            icon: (
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3a2 2 0 012-2h4a2 2 0 012 2v4m-6 4v10m6-10v10" />
              </svg>
            ),
            description: 'Coordinate interview schedules'
          },
          { 
            title: 'HR Reports', 
            href: '/hr/reports', 
            icon: (
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 8v8m-4-5v5m-4-2v2m-2 4h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
            ),
            description: 'Generate hiring analytics and insights'
          },
        ];
      case 'candidate':
        return [
          { 
            title: 'Browse Jobs', 
            href: '/candidate/jobs', 
            icon: (
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            ),
            description: 'Discover available opportunities'
          },
          { 
            title: 'My Applications', 
            href: '/candidate/applications', 
            icon: (
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
              </svg>
            ),
            description: 'Track your application status'
          },
          { 
            title: 'Saved Jobs', 
            href: '/candidate/saved', 
            icon: (
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z" />
              </svg>
            ),
            description: 'View your bookmarked positions'
          },
          { 
            title: 'Update Profile', 
            href: '/candidate/profile', 
            icon: (
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
              </svg>
            ),
            description: 'Enhance your professional profile'
          },
        ];
      default:
        return [];
    }
  };

  return (
    <div className="space-y-8">
      {/* Welcome Section */}
      <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg border border-purple-100 p-8">
        <div className="flex items-center space-x-6 mb-6">
          <div className="w-20 h-20 bg-gradient-to-br from-purple-500 to-cyan-500 rounded-2xl flex items-center justify-center shadow-lg">
            <span className="text-white font-bold text-2xl">
              {user.name.charAt(0).toUpperCase()}
            </span>
          </div>
          <div className="flex-1">
            <h1 className="text-3xl font-bold bg-gradient-to-r from-purple-600 to-cyan-600 bg-clip-text text-transparent mb-2">
              Welcome back, {user.name}
            </h1>
            <p className="text-gray-600 text-lg leading-relaxed">
              {getRoleDescription()}
            </p>
          </div>
        </div>
        
        <Link
          href={getDashboardLink()}
          className="inline-flex items-center px-8 py-4 bg-gradient-to-r from-purple-600 to-cyan-600 text-white rounded-xl hover:from-purple-700 hover:to-cyan-700 font-semibold shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1"
        >
          Access Dashboard
          <svg className="w-5 h-5 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 7l5 5m0 0l-5 5m5-5H6" />
          </svg>
        </Link>
      </div>

      {/* Quick Actions */}
      <div>
        <h2 className="text-2xl font-bold text-gray-800 mb-6">Quick Actions</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 xl:grid-cols-4 gap-6">
          {getQuickActions().map((action, index) => (
            <Link
              key={index}
              href={action.href}
              className="group bg-white/80 backdrop-blur-sm rounded-xl shadow-md border border-purple-100 p-6 hover:shadow-xl transition-all duration-300 transform hover:-translate-y-2 hover:border-purple-200"
            >
              <div className="flex items-center justify-between mb-4">
                <div className="p-3 bg-gradient-to-br from-purple-100 to-cyan-100 rounded-lg text-purple-600 group-hover:from-purple-200 group-hover:to-cyan-200 transition-colors duration-300">
                  {action.icon}
                </div>
                <div className="w-2 h-2 bg-cyan-400 rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
              </div>
              <h3 className="font-semibold text-gray-800 mb-2 text-lg">{action.title}</h3>
              <p className="text-gray-600 text-sm leading-relaxed">{action.description}</p>
            </Link>
          ))}
        </div>
      </div>

      {/* Role-specific content */}
      {user.role === 'admin' && (
        <div className="bg-gradient-to-r from-purple-50 to-cyan-50 border border-purple-200 rounded-xl p-6 shadow-sm">
          <div className="flex items-start space-x-4">
            <div className="p-2 bg-purple-100 rounded-lg">
              <svg className="w-6 h-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <div>
              <h3 className="text-lg font-semibold text-purple-800 mb-2">
                Administrative Notice
              </h3>
              <p className="text-purple-700 leading-relaxed">
                All job postings from HR personnel require administrative approval before becoming visible to candidates. 
                Please review pending approvals regularly to maintain an efficient hiring workflow.
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function PublicHomePage() {
  return (
    <div className="space-y-16">
      {/* Hero Section with proper spacing */}
      <div className="-mx-4 sm:-mx-6 lg:-mx-8">
        <HeroSection />
      </div>

      {/* 3D Role Cards Section */}
      <div className="pt-8">
        <div className="text-center mb-12">
          <h2 className="text-4xl font-bold bg-gradient-to-r from-purple-600 to-cyan-600 bg-clip-text text-transparent mb-4">
            Choose Your Professional Path
          </h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed">
            Discover comprehensive tools and features meticulously designed for your specific role in the modern hiring ecosystem.
          </p>
        </div>
        <RoleCards3D />
      </div>
    </div>
  );
}