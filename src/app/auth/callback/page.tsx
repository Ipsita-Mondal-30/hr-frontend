'use client';

import { useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
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
  const params = useSearchParams();

  useEffect(() => {
    const token = params.get('token');
    if (!token) {
      router.push('/');
      return;
    }

    try {
      setAuthToken(token);
      const decoded: DecodedToken = jwtDecode(token);

      if (!decoded.role) {
        // Send token to select-role
        router.push(`/select-role?token=${token}`);
      } else {
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
    } catch (err) {
      console.error('Token decode error:', err);
      router.push('/');
    }
  }, [params, router]);

  return <p>Logging you in...</p>;
}
