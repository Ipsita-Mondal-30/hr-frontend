'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { jwtDecode } from 'jwt-decode';
import { getAuthToken, setAuthToken } from '@/lib/cookies';
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
    const urlParams = new URLSearchParams(window.location.search);
    const oauthError = urlParams.get('error');
    const oauthMessage = urlParams.get('message');

    if (oauthError) {
      const qs = new URLSearchParams({ error: oauthError });
      if (oauthMessage) qs.set('message', oauthMessage);
      router.replace(`/login?${qs.toString()}`);
      return;
    }

    const token = urlParams.get('token') || getAuthToken();

    if (!token) {
      router.replace('/login?error=no_token&message=Sign-in%20did%20not%20return%20a%20token.%20Try%20again.');
      return;
    }

    try {
      setAuthToken(token);
      window.history.replaceState({}, '', window.location.pathname);

      const decoded: DecodedToken = jwtDecode(token);
      const dashboardPath = getDashboardPath(decoded.role);

      if (typeof window !== 'undefined') {
        localStorage.removeItem('dashboardCache');
        sessionStorage.removeItem('userCache');
      }

      if (dashboardPath) {
        window.location.replace(dashboardPath);
        return;
      }

      window.location.replace('/role-select');
    } catch {
      router.replace('/login?error=token_failed&message=Invalid%20sign-in%20token');
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
