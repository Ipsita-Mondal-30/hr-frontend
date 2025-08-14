'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { jwtDecode } from 'jwt-decode';
import { setAuthToken } from '@/lib/cookies';

interface DecodedToken {
  _id: string;
  name: string;
  email: string;
  role?: 'admin' | 'hr' | 'candidate' | 'employee';
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
        if (!decoded.role) {
          // Send token to select-role
          console.log('No role found, redirecting to select-role');
          router.push(`/select-role?token=${token}`);
        } else {
          console.log('Role found:', decoded.role, 'redirecting to dashboard');
          switch (decoded.role) {
            case 'admin':
              router.push('/admin/dashboard');
              break;
            case 'hr':
              router.push('/hr/dashboard');
              break;
            case 'candidate':
              router.push('/candidate/dashboard');
              break;
            case 'employee':
              router.push('/employee/dashboard');
              break;
            default:
              router.push('/');
          }
        }
      }, 500); // Slightly longer delay for better reliability
      
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
