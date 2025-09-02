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

  // Create navigation items based on user role
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
    <ResizableNavbar>
      {/* Desktop Navigation */}
      <NavBody>
        {/* Logo */}
        <Link href="/" className="flex items-center space-x-2 relative z-20">
          <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
            <span className="text-white font-bold text-sm">HR</span>
          </div>
          <span className="text-xl font-semibold text-gray-900 dark:text-white">Talora</span>
        </Link>

        {/* Navigation Items */}
        {user && navigationItems.length > 0 && (
          <NavItems 
            items={navigationItems}
            className="text-gray-700 dark:text-gray-300"
          />
        )}

        {/* Right side content */}
        <div className="flex items-center space-x-4 relative z-20">
          {user ? (
            <div className="relative">
              <button
                onClick={() => setIsMenuOpen(!isMenuOpen)}
                className="flex items-center space-x-2 text-gray-700 hover:text-blue-600 px-3 py-2 rounded-md text-sm font-medium dark:text-gray-300 dark:hover:text-blue-400"
              >
                <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                  <span className="text-blue-600 font-medium text-sm">
                    {user.name.charAt(0).toUpperCase()}
                  </span>
                </div>
                <span>{user.name}</span>
                <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded-full dark:bg-blue-900 dark:text-blue-200">
                  {getRoleDisplayName()}
                </span>
              </button>

              {isMenuOpen && (
                <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg py-1 z-50 dark:bg-neutral-900">
                  <Link
                    href={getDashboardLink()}
                    className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-neutral-800"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    Dashboard
                  </Link>
                  {user.role === 'candidate' && (
                    <Link
                      href="/candidate/profile"
                      className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-neutral-800"
                      onClick={() => setIsMenuOpen(false)}
                    >
                      Profile
                    </Link>
                  )}
                  <button
                    onClick={() => {
                      logout();
                      setIsMenuOpen(false);
                    }}
                    className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-neutral-800"
                  >
                    Logout
                  </button>
                </div>
              )}
            </div>
          ) : (
            <NavbarButton
              href="/login"
              variant="primary"
              className="bg-blue-600 text-white hover:bg-blue-700 border-none"
            >
              Login
            </NavbarButton>
          )}
        </div>
      </NavBody>

      {/* Mobile Navigation */}
      <MobileNav>
        <MobileNavHeader>
          {/* Logo */}
          <Link href="/" className="flex items-center space-x-2">
            <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-sm">HR</span>
            </div>
            <span className="text-xl font-semibold text-gray-900 dark:text-white">Talora</span>
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
          {user ? (
            <>
              <div className="px-3 py-2 text-sm font-medium text-gray-900 border-b dark:text-white dark:border-neutral-800">
                {user.name} ({getRoleDisplayName()})
              </div>
              
              {navigationItems.map((item, index) => (
                <Link
                  key={index}
                  href={item.link}
                  className="block px-3 py-2 text-sm text-gray-700 hover:bg-gray-100 rounded-md dark:text-gray-300 dark:hover:bg-neutral-800"
                  onClick={() => setIsMenuOpen(false)}
                >
                  {item.name}
                </Link>
              ))}
              
              {user.role === 'candidate' && (
                <Link
                  href="/candidate/profile"
                  className="block px-3 py-2 text-sm text-gray-700 hover:bg-gray-100 rounded-md dark:text-gray-300 dark:hover:bg-neutral-800"
                  onClick={() => setIsMenuOpen(false)}
                >
                  Profile
                </Link>
              )}

              <button
                onClick={() => {
                  logout();
                  setIsMenuOpen(false);
                }}
                className="block w-full text-left px-3 py-2 text-sm text-gray-700 hover:bg-gray-100 rounded-md dark:text-gray-300 dark:hover:bg-neutral-800"
              >
                Logout
              </button>
            </>
          ) : (
            <Link
              href="/login"
              className="block px-3 py-2 text-sm text-gray-700 hover:bg-gray-100 rounded-md dark:text-gray-300 dark:hover:bg-neutral-800"
              onClick={() => setIsMenuOpen(false)}
            >
              Login
            </Link>
          )}
        </MobileNavMenu>
      </MobileNav>
    </ResizableNavbar>
  );
}