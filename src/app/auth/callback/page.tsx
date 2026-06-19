'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { jwtDecode } from 'jwt-decode';
import { setAuthToken } from '@/lib/cookies';
import { getDashboardPath } from '@/lib/dashboardRoutes';

interface DecodedToken {
  _id: string;
  name: string;
  email: string;
  role?: 'admin' | 'hr' | 'candidate' | 'employee' | undefined;
}

export default function AuthCallbackPage() {
  const router = useRouter();

  useEffect(() => {
    // Get token from URL manually to avoid useSearchParams issues
    const urlParams = new URLSearchParams(window.location.search);
    const token = urlParams.get('token');

    console.log('Auth callback received token:', token);
    console.log('Full URL:', window.location.href);

    if (!token) {
      console.error('No token in callback URL');
      router.push('/');
      return;
    }

    try {
      // Set token in cookies immediately
      setAuthToken(token);
      console.log('Token set in cookies');

      const decoded: DecodedToken = jwtDecode(token);
      console.log('Decoded token:', decoded);

      // Add a small delay to ensure token is properly set
      setTimeout(() => {
        const dashboardPath = getDashboardPath(decoded.role);
        if (dashboardPath) {
          console.log('Role found:', decoded.role, 'redirecting to dashboard');
          if (typeof window !== 'undefined') {
            localStorage.removeItem('dashboardCache');
            sessionStorage.removeItem('userCache');
          }
          window.location.replace(dashboardPath);
          return;
        }

        console.log('No role found, redirecting to role-select');
        window.location.replace('/role-select');
      }, 100);

    } catch (err) {
      console.error('Token decode error:', err);
      router.push('/');
    }
  }, [router]);

  return (
    <div className="flex items-center justify-center h-screen">
      <div className="text-center">
        <p className="text-lg">Logging you in...</p>
        <p className="text-sm text-gray-500 mt-2">Please wait while we redirect you</p>
      </div>
    </div>
  );
}
