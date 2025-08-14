'use client';

import { useAuth } from '@/lib/AuthContext';
import Link from 'next/link';

export default function HeroSection() {
  const { user } = useAuth();

  return (
    <section className="bg-blue-50 py-20 text-center px-4">
      <h1 className="text-4xl font-bold text-gray-900 mb-4">
        Smarter Hiring Starts Here
      </h1>
      <p className="text-lg text-gray-600 mb-6">
        AI-powered recruitment platform for HRs, Admins, and Candidates.
      </p>
      
      {!user ? (
        <a
          href="http://localhost:8080/api/auth/google"
          className="bg-blue-600 text-white px-6 py-3 rounded-full hover:bg-blue-700 transition"
        >
          Get Started with Google
        </a>
      ) : (
        <div className="space-y-4">
          <p className="text-lg text-gray-700">
            Welcome back, <strong>{user.name}</strong>! 
          </p>
          <div className="flex justify-center space-x-4">
            {user.role === 'admin' && (
              <Link
                href="/admin/dashboard"
                className="bg-red-600 text-white px-6 py-3 rounded-full hover:bg-red-700 transition"
              >
                👑 Admin Dashboard
              </Link>
            )}
            {user.role === 'hr' && (
              <Link
                href="/hr/dashboard"
                className="bg-green-600 text-white px-6 py-3 rounded-full hover:bg-green-700 transition"
              >
                💼 HR Dashboard
              </Link>
            )}
            {user.role === 'candidate' && (
              <Link
                href="/candidate/dashboard"
                className="bg-purple-600 text-white px-6 py-3 rounded-full hover:bg-purple-700 transition"
              >
                👤 Candidate Dashboard
              </Link>
            )}
          </div>
        </div>
      )}
    </section>
  );
}
