'use client';

import { useState, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import {
  Navbar,
  NavBody,
  MobileNav,
  MobileNavHeader,
  MobileNavMenu,
  MobileNavToggle,
  NavbarLogo,
  NavbarButton,
} from '@/components/ui/resizable-navbar';
import Link from 'next/link';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:8080';



export default function LoginContent() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const searchParams = useSearchParams();

  useEffect(() => {
    const errorParam = searchParams.get('error');
    const messageParam = searchParams.get('message');
    
    if (errorParam) {
      if (errorParam === 'oauth_failed') {
        setError(`OAuth Login Failed: ${messageParam || 'Unknown error'}`);
      } else {
        setError(`Login Error: ${messageParam || errorParam}`);
      }
    }
  }, [searchParams]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      {/* Navbar */}
      <Navbar className="fixed top-0">
        <NavBody>
          <NavbarLogo />
          <NavbarButton href="/login" variant="primary">
            Login
          </NavbarButton>
        </NavBody>
        <MobileNav>
          <MobileNavHeader>
            <NavbarLogo />
            <MobileNavToggle
              isOpen={mobileMenuOpen}
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            />
          </MobileNavHeader>
          <MobileNavMenu
            isOpen={mobileMenuOpen}
            onClose={() => setMobileMenuOpen(false)}
          >
            <NavbarButton href="/login" variant="primary" className="mt-4">
              Login
            </NavbarButton>
          </MobileNavMenu>
        </MobileNav>
      </Navbar>

      {/* Main Content */}
      <div className="flex items-center justify-center min-h-screen pt-32">
        <div className="max-w-md w-full space-y-8 bg-white p-8 rounded-2xl shadow-xl border border-gray-200">
          <div className="text-center">
            <h2 className="text-3xl font-extrabold text-gray-900 mb-2">
              Welcome to Talora
            </h2>
            <p className="text-gray-600 mb-8">
              Sign in with your Google account to continue
            </p>
          </div>

          {/* Error Display */}
          {error && (
            <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
              <div className="flex items-start">
                <div className="flex-shrink-0">
                  <svg className="h-5 w-5 text-red-400" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                  </svg>
                </div>
                <div className="ml-3">
                  <h3 className="text-sm font-medium text-red-800">Login Error</h3>
                  <p className="mt-1 text-sm text-red-700">{error}</p>
                  <div className="mt-2">
                    <button
                      onClick={() => setError(null)}
                      className="text-sm text-red-600 hover:text-red-500 underline"
                    >
                      Dismiss
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Google OAuth Login */}
          <div className="space-y-4">
            <a
              href={`${API_BASE_URL}/api/auth/google`}
              className="w-full inline-flex justify-center items-center py-3 px-4 border border-gray-300 rounded-lg shadow-sm bg-white text-base font-medium text-gray-700 hover:bg-gray-50 hover:border-gray-400 transition-colors duration-200"
            >
              <svg className="w-6 h-6 mr-3" viewBox="0 0 24 24">
                <path
                  fill="#4285F4"
                  d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                />
                <path
                  fill="#34A853"
                  d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                />
                <path
                  fill="#FBBC05"
                  d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                />
                <path
                  fill="#EA4335"
                  d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                />
              </svg>
              Continue with Google
            </a>
          </div>

          {/* Footer Links */}
          <div className="mt-8 text-center space-y-2">
            <p className="text-sm text-gray-500">
              New to our platform? Your account will be created automatically
              after Google authentication.
            </p>
            <div className="text-xs text-gray-400">
              <Link href="/" className="text-blue-500 hover:underline flex items-center space-x-1">
                <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
                </svg>
                <span>Back to Home</span>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}