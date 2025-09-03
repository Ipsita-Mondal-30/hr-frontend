'use client';

import { useAuth } from '@/lib/AuthContext';
import Link from 'next/link';
import { useState } from 'react';
import {
  Navbar as ResizableNavbar,
  NavBody,
  NavItems,
  MobileNav,
  MobileNavHeader,
  MobileNavMenu,
  MobileNavToggle,
  NavbarButton
} from '../components/resizable-navabar';
import Image from "next/image";

export default function Navbar() {
  const { user, logout } = useAuth();
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const getDashboardLink = () => {
    if (!user) return '/';
    
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

  const getRoleDisplayName = () => {
    if (!user) return '';
    
    switch (user.role) {
      case 'admin':
        return 'Admin';
      case 'hr':
        return 'HR';
      case 'candidate':
        return 'Candidate';
      default:
        return user.role;
    }
  };

  const getRoleColor = () => {
    if (!user) return '';
    
    switch (user.role) {
      case 'admin':
        return 'bg-gradient-to-r from-purple-500 to-purple-600 text-white';
      case 'hr':
        return 'bg-gradient-to-r from-cyan-500 to-cyan-600 text-white';
      case 'candidate':
        return 'bg-gradient-to-r from-purple-400 to-cyan-400 text-white';
      default:
        return 'bg-gradient-to-r from-purple-400 to-cyan-400 text-white';
    }
  };

  const getNavigationItems = () => {
    if (!user) return [];

    const baseItems = [
      { name: 'Dashboard', link: getDashboardLink() }
    ];

    if (user.role === 'candidate') {
      return [
        ...baseItems,
        { name: 'Browse Jobs', link: '/candidate/jobs' },
        { name: 'My Applications', link: '/candidate/applications' },
        { name: 'Saved Jobs', link: '/candidate/saved' }
      ];
    }

    if (user.role === 'hr') {
      return [
        ...baseItems,
        { name: 'Manage Jobs', link: '/hr/jobs' },
        { name: 'Applications', link: '/hr/applications' }
      ];
    }

    if (user.role === 'admin') {
      return [
        ...baseItems,
        { name: 'Manage Jobs', link: '/admin/jobs' },
        { name: 'Users', link: '/admin/users' },
        { name: 'Pending Approvals', link: '/admin/jobs/pending' }
      ];
    }

    return baseItems;
  };

  const navigationItems = getNavigationItems();

  return (
    <div className="fixed top-0 left-0 right-0 z-50">
      {/* Glassmorphism Background */}
      <div className="absolute inset-0 bg-white/80 dark:bg-gray-900/80 backdrop-blur-lg border-b border-white/20 dark:border-gray-800/20" />
      
      <ResizableNavbar>
        {/* Desktop Navigation */}
        <NavBody className="relative z-10 max-w-full mx-auto px-4 sm:px-6 lg:px-8 w-full">
          {/* Logo */}
          <Link href="/" className="flex items-center space-x-3 group flex-shrink-0">
  <div className="relative">
    <Image 
      src="/talora.png" 
      alt="Talora Logo" 
      width={40} 
      height={40} 
      className="rounded-xl"
      priority // ensures it's loaded immediately (optional)
    />
    <div className="absolute -inset-1 bg-gradient-to-r from-purple-600 to-cyan-600 rounded-2xl blur opacity-40 group-hover:opacity-70 transition duration-300 -z-10" />
  </div>
  <div className="flex flex-col">
    <span className="text-2xl font-bold bg-gradient-to-r from-purple-700 via-purple-600 to-cyan-600 bg-clip-text text-transparent dark:from-purple-400 dark:via-purple-300 dark:to-cyan-400">
      Talora
    </span>
    <span className="text-xs text-gray-600 dark:text-gray-400 -mt-1 font-medium">
      Career Platform
    </span>
  </div>
</Link>

          {/* Navigation Items */}
          {user && navigationItems.length > 0 && (
            <div className="hidden lg:flex items-center space-x-1 flex-1 justify-center">
              {navigationItems.map((item, index) => (
                <Link
                  key={index}
                  href={item.link}
                  className="px-4 py-2 text-gray-700 hover:text-purple-600 dark:text-gray-300 dark:hover:text-purple-400 transition-all duration-300 font-medium rounded-xl hover:bg-white/50 dark:hover:bg-gray-800/50 backdrop-blur-sm relative group"
                >
                  {item.name}
                  <div className="absolute inset-x-0 -bottom-1 h-0.5 bg-gradient-to-r from-purple-600 to-cyan-600 scale-x-0 group-hover:scale-x-100 transition-transform duration-300 rounded-full" />
                </Link>
              ))}
            </div>
          )}

          {/* Right side content */}
          <div className="flex items-center space-x-4 flex-shrink-0">
            {user ? (
              <div className="relative group">
                <button
                  onClick={() => setIsMenuOpen(!isMenuOpen)}
                  className="flex items-center space-x-3 px-4 py-2.5 rounded-2xl text-sm font-medium transition-all duration-300 hover:bg-white/60 dark:hover:bg-gray-800/60 backdrop-blur-sm shadow-lg hover:shadow-xl border border-white/30 dark:border-gray-700/30"
                >
                  <div className="relative">
                    <div className="w-10 h-10 bg-gradient-to-br from-purple-100 to-cyan-100 dark:from-purple-900 dark:to-cyan-900 rounded-xl flex items-center justify-center ring-2 ring-white dark:ring-gray-800 shadow-md">
                      <span className="text-purple-700 dark:text-purple-300 font-bold text-sm">
                        {user.name.charAt(0).toUpperCase()}
                      </span>
                    </div>
                    <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-gradient-to-r from-green-400 to-emerald-500 rounded-full border-2 border-white dark:border-gray-800 shadow-sm" />
                  </div>
                  <div className="hidden sm:flex flex-col items-start">
                    <span className="font-semibold text-gray-900 dark:text-white">{user.name}</span>
                    <span className={`text-xs px-2 py-0.5 rounded-lg font-medium ${getRoleColor()}`}>
                      {getRoleDisplayName()}
                    </span>
                  </div>
                  <svg className={`w-4 h-4 transition-transform duration-300 ${isMenuOpen ? 'rotate-180' : ''} text-gray-600 dark:text-gray-400`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </button>

                {isMenuOpen && (
                  <div className="absolute right-0 mt-3 w-64 bg-white/95 dark:bg-gray-900/95 backdrop-blur-xl rounded-3xl shadow-2xl border border-white/20 dark:border-gray-800/20 py-3 animate-in slide-in-from-top-2 duration-300">
                    <div className="absolute -top-2 right-8 w-4 h-4 bg-white/95 dark:bg-gray-900/95 rotate-45 border-l border-t border-white/20 dark:border-gray-800/20" />
                    
                    <div className="px-6 py-4 border-b border-gray-100/50 dark:border-gray-800/50">
                      <div className="flex items-center space-x-3">
                        <div className="w-12 h-12 bg-gradient-to-br from-purple-100 to-cyan-100 dark:from-purple-900 dark:to-cyan-900 rounded-xl flex items-center justify-center">
                          <span className="text-purple-700 dark:text-purple-300 font-bold">
                            {user.name.charAt(0).toUpperCase()}
                          </span>
                        </div>
                        <div>
                          <div className="font-semibold text-gray-900 dark:text-white">{user.name}</div>
                          <div className="text-sm text-gray-500 dark:text-gray-400">{user.email || 'User'}</div>
                        </div>
                      </div>
                    </div>

                    <div className="py-2">
                      <Link
                        href={getDashboardLink()}
                        className="flex items-center px-6 py-3 text-sm text-gray-700 hover:bg-gradient-to-r hover:from-purple-50 hover:to-cyan-50 dark:text-gray-300 dark:hover:from-purple-950/20 dark:hover:to-cyan-950/20 transition-all duration-200 group"
                        onClick={() => setIsMenuOpen(false)}
                      >
                        <svg className="w-5 h-5 mr-3 text-purple-500 group-hover:text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
                        </svg>
                        Dashboard
                      </Link>
                      
                      {user.role === 'candidate' && (
                        <Link
                          href="/candidate/profile"
                          className="flex items-center px-6 py-3 text-sm text-gray-700 hover:bg-gradient-to-r hover:from-cyan-50 hover:to-purple-50 dark:text-gray-300 dark:hover:from-cyan-950/20 dark:hover:to-purple-950/20 transition-all duration-200 group"
                          onClick={() => setIsMenuOpen(false)}
                        >
                          <svg className="w-5 h-5 mr-3 text-cyan-500 group-hover:text-cyan-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                          </svg>
                          Profile
                        </Link>
                      )}
                    </div>

                    <div className="border-t border-gray-100/50 dark:border-gray-800/50 pt-2">
                      <button
                        onClick={() => {
                          logout();
                          setIsMenuOpen(false);
                        }}
                        className="flex items-center w-full px-6 py-3 text-sm text-red-600 hover:bg-red-50 dark:text-red-400 dark:hover:bg-red-950/20 transition-all duration-200 group"
                      >
                        <svg className="w-5 h-5 mr-3 group-hover:text-red-700 dark:group-hover:text-red-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                        </svg>
                        Sign Out
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <div className="flex items-center space-x-3">
                <Link
                  href="/candidate/jobs"
                  className="hidden sm:inline-flex items-center px-4 py-2 text-gray-700 hover:text-purple-600 dark:text-gray-300 dark:hover:text-purple-400 transition-all duration-300 font-medium rounded-xl hover:bg-white/50 dark:hover:bg-gray-800/50"
                >
                  
                </Link>
                <div className="relative group">
                  <NavbarButton
                    href="/login"
                    variant="primary"
                    className="bg-gradient-to-r from-purple-600 via-purple-700 to-cyan-600 text-white hover:from-purple-700 hover:via-purple-800 hover:to-cyan-700 border-none shadow-xl hover:shadow-2xl transition-all duration-300 font-semibold px-6 py-3 rounded-2xl relative overflow-hidden group"
                  >
                    <span className="relative z-10 flex items-center space-x-2">
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 16l-4-4m0 0l4-4m-4 4h14m-5 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h7a3 3 0 013 3v1" />
                      </svg>
                      <span>Get Started</span>
                    </span>
                    <div className="absolute inset-0 bg-gradient-to-r from-white/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                  </NavbarButton>
                  <div className="absolute -inset-1 bg-gradient-to-r from-purple-600 to-cyan-600 rounded-2xl blur opacity-40 group-hover:opacity-60 transition duration-300 -z-10" />
                </div>
              </div>
            )}
          </div>
        </NavBody>

        {/* Mobile Navigation */}
        <MobileNav>
          <MobileNavHeader className="relative z-10 px-4 py-3">
            {/* Logo */}
            <Link href="/" className="flex items-center space-x-3">
              <div className="relative">
                <div className="w-10 h-10 bg-gradient-to-br from-purple-600 via-purple-700 to-cyan-600 rounded-xl flex items-center justify-center shadow-lg">
                  <span className="text-white font-bold">T</span>
                </div>
                <div className="absolute -inset-0.5 bg-gradient-to-r from-purple-600 to-cyan-600 rounded-xl blur opacity-30 -z-10" />
              </div>
              <div className="flex flex-col">
                <span className="text-xl font-bold bg-gradient-to-r from-purple-700 via-purple-600 to-cyan-600 bg-clip-text text-transparent dark:from-purple-400 dark:via-purple-300 dark:to-cyan-400">
                  Talora
                </span>
                <span className="text-xs text-gray-600 dark:text-gray-400 -mt-1">
                  Career Platform
                </span>
              </div>
            </Link>

            {/* Mobile Menu Toggle */}
            <MobileNavToggle
              isOpen={isMenuOpen}
              onClick={() => setIsMenuOpen(!isMenuOpen)}
            />
          </MobileNavHeader>

          {/* Mobile Menu */}
          <MobileNavMenu
            isOpen={isMenuOpen}
            onClose={() => setIsMenuOpen(false)}
          >
            <div className="bg-white/95 dark:bg-gray-900/95 backdrop-blur-xl rounded-3xl p-6 m-4 border border-white/20 dark:border-gray-800/20 shadow-2xl">
              {user ? (
                <>
                  <div className="px-4 py-4 mb-4 bg-gradient-to-r from-purple-50 to-cyan-50 dark:from-purple-950/20 dark:to-cyan-950/20 rounded-2xl border border-purple-100/50 dark:border-purple-800/50 backdrop-blur-sm">
                    <div className="flex items-center space-x-3">
                      <div className="w-12 h-12 bg-gradient-to-br from-purple-100 to-cyan-100 dark:from-purple-900 dark:to-cyan-900 rounded-xl flex items-center justify-center">
                        <span className="text-purple-700 dark:text-purple-300 font-bold">
                          {user.name.charAt(0).toUpperCase()}
                        </span>
                      </div>
                      <div>
                        <div className="font-bold text-gray-900 dark:text-white">{user.name}</div>
                        <div className={`inline-block text-xs px-3 py-1 rounded-full font-medium ${getRoleColor()} mt-1`}>
                          {getRoleDisplayName()}
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    {navigationItems.map((item, index) => (
                      <Link
                        key={index}
                        href={item.link}
                        className="flex items-center px-4 py-3 text-gray-700 hover:bg-gradient-to-r hover:from-purple-50 hover:to-cyan-50 dark:text-gray-300 dark:hover:from-purple-950/20 dark:hover:to-cyan-950/20 rounded-xl transition-all duration-200 font-medium group"
                        onClick={() => setIsMenuOpen(false)}
                      >
                        <div className="w-2 h-2 bg-gradient-to-r from-purple-400 to-cyan-400 rounded-full mr-3 group-hover:scale-125 transition-transform duration-200" />
                        {item.name}
                      </Link>
                    ))}
                    
                    {user.role === 'candidate' && (
                      <Link
                        href="/candidate/profile"
                        className="flex items-center px-4 py-3 text-gray-700 hover:bg-gradient-to-r hover:from-cyan-50 hover:to-purple-50 dark:text-gray-300 dark:hover:from-cyan-950/20 dark:hover:to-purple-950/20 rounded-xl transition-all duration-200 font-medium group"
                        onClick={() => setIsMenuOpen(false)}
                      >
                        <div className="w-2 h-2 bg-gradient-to-r from-cyan-400 to-purple-400 rounded-full mr-3 group-hover:scale-125 transition-transform duration-200" />
                        Profile
                      </Link>
                    )}
                  </div>

                  <div className="border-t border-gray-200/50 dark:border-gray-800/50 mt-4 pt-4">
                    <button
                      onClick={() => {
                        logout();
                        setIsMenuOpen(false);
                      }}
                      className="flex items-center w-full px-4 py-3 text-red-600 hover:bg-red-50 dark:text-red-400 dark:hover:bg-red-950/20 rounded-xl transition-all duration-200 font-medium group"
                    >
                      <svg className="w-5 h-5 mr-3 group-hover:text-red-700 dark:group-hover:text-red-300 transition-colors duration-200" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                      </svg>
                      Sign Out
                    </button>
                  </div>
                </>
              ) : (
                <Link
                  href="/login"
                  className="flex items-center justify-center px-6 py-4 text-sm bg-gradient-to-r from-purple-600 via-purple-700 to-cyan-600 text-white hover:from-purple-700 hover:via-purple-800 hover:to-cyan-700 rounded-2xl transition-all duration-200 font-semibold shadow-xl hover:shadow-2xl group"
                  onClick={() => setIsMenuOpen(false)}
                >
                  <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 16l-4-4m0 0l4-4m-4 4h14m-5 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h7a3 3 0 013 3v1" />
                  </svg>
                  Get Started with Talora
                </Link>
              )}
            </div>
          </MobileNavMenu>
        </MobileNav>
      </ResizableNavbar>
    </div>
  );
}