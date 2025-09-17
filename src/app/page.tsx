'use client';
import { useAuth } from '@/lib/AuthContext';
import Navbar from '@/components/Navbar';
import Link from 'next/link';
import { RoleCards3D } from '../components/RoleCards3D';
import { HeroSection } from '../components/HeroSection';
import { AboutSection } from '../components/AboutSection';
import { ProcessSection } from '../components/ProcessSection';
import { TestimonialsSection } from '../components/TestimonialsSection';
import { CTASection } from '../components/CTASection';
import { 
  Clock, 
  Users, 
  BarChart3, 
  Briefcase, 
  Plus, 
  FileText, 
  Calendar, 
  TrendingUp, 
  Search, 
  File, 
  Bookmark, 
  User 
} from 'lucide-react';

type UserRole = 'admin' | 'hr' | 'candidate' | 'user' | string;

interface DashboardUser {
  name: string;
  role: UserRole;
  email?: string;
  [key: string]: unknown;
}

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
      {user ? (
        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <UserDashboard user={user as DashboardUser} />
        </main>
      ) : (
        <PublicHomePage />
      )}
    </div>
  );
}

function UserDashboard({ user }: { user: DashboardUser }) {
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
          { title: 'Pending Job Approvals', href: '/admin/jobs/pending', icon: 'clock' },
          { title: 'Manage Users', href: '/admin/users', icon: 'users' },
          { title: 'System Analytics', href: '/admin/analytics', icon: 'bar-chart' },
          { title: 'All Jobs', href: '/admin/jobs', icon: 'briefcase' },
        ];
      case 'hr':
        return [
          { title: 'Post New Job', href: '/hr/jobs', icon: 'plus' },
          { title: 'Review Applications', href: '/hr/applications', icon: 'file-text' },
          { title: 'Schedule Interviews', href: '/hr/interviews', icon: 'calendar' },
          { title: 'HR Reports', href: '/hr/reports', icon: 'trending-up' },
        ];
      case 'candidate':
        return [
          { title: 'Browse Jobs', href: '/candidate/jobs', icon: 'search' },
          { title: 'My Applications', href: '/candidate/applications', icon: 'file' },
          { title: 'Saved Jobs', href: '/candidate/saved', icon: 'bookmark' },
          { title: 'Update Profile', href: '/candidate/profile', icon: 'user' },
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
              {user.name?.charAt(0).toUpperCase() || 'U'}
            </span>
          </div>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Welcome back, {user.name}!</h1>
            <p className="text-gray-600">{getRoleDescription()}</p>
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
            <Link key={index} href={action.href} className="bg-white rounded-lg shadow-sm border p-6 hover:shadow-md transition-shadow">
              <div className="mb-3">
                {action.icon === 'clock' && <Clock className="w-8 h-8 text-blue-600" />}
                {action.icon === 'users' && <Users className="w-8 h-8 text-blue-600" />}
                {action.icon === 'bar-chart' && <BarChart3 className="w-8 h-8 text-blue-600" />}
                {action.icon === 'briefcase' && <Briefcase className="w-8 h-8 text-blue-600" />}
                {action.icon === 'plus' && <Plus className="w-8 h-8 text-blue-600" />}
                {action.icon === 'file-text' && <FileText className="w-8 h-8 text-blue-600" />}
                {action.icon === 'calendar' && <Calendar className="w-8 h-8 text-blue-600" />}
                {action.icon === 'trending-up' && <TrendingUp className="w-8 h-8 text-blue-600" />}
                {action.icon === 'search' && <Search className="w-8 h-8 text-blue-600" />}
                {action.icon === 'file' && <File className="w-8 h-8 text-blue-600" />}
                {action.icon === 'bookmark' && <Bookmark className="w-8 h-8 text-blue-600" />}
                {action.icon === 'user' && <User className="w-8 h-8 text-blue-600" />}
              </div>
              <h3 className="font-medium text-gray-900">{action.title}</h3>
            </Link>
          ))}
        </div>
      </div>

      {/* Role-specific content */}
      {user.role === 'admin' && (
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6">
          <h3 className="text-lg font-medium text-yellow-800 mb-2">🔔 Admin Notice</h3>
          <p className="text-yellow-700">
            Remember: All jobs posted by HR need your approval before they become visible to
            candidates. Check the pending approvals regularly to keep the hiring process moving.
          </p>
        </div>
      )}
    </div>
  );
}

function PublicHomePage() {
  return (
    <div className="overflow-x-hidden">
      {/* Modern Hero Section */}
      <HeroSection />

      {/* About Section */}
      <AboutSection />

      {/* Services Section */}
      {/* <ServicesSection /> */}

      {/* 3D Role Cards Section */}
      <div className="py-24 bg-gradient-to-br from-gray-50 to-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <div className="inline-flex items-center px-4 py-2 rounded-full bg-purple-100 text-purple-700 text-sm font-medium mb-6">
              <span className="w-2 h-2 bg-purple-500 rounded-full mr-2"></span>
              Choose Your Role
            </div>
            <h2 className="text-4xl lg:text-5xl font-bold text-gray-900 mb-6">
              Discover the perfect tools and features
              <br />
              <span className="text-purple-600">designed for your role</span>
            </h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Whether you&apos;re an HR professional, admin, or job candidate, Talora provides
              specialized experiences tailored to your unique needs in the hiring ecosystem.
            </p>
          </div>
          <RoleCards3D />
          {/* Process Section */}
          <ProcessSection />
        </div>
      </div>

      {/* Testimonials Section */}
      <TestimonialsSection />

      {/* Final CTA Section */}
      <CTASection />
    </div>
  );
}
