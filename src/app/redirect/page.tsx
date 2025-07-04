'use client';
import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/AuthContext';

export default function RedirectPage() {
  const { user, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading) {
      if (!user) {
        router.push('/login');
      } else if (user.role === 'admin') {
        router.push('/admin/dashboard');
      } else if (user.role === 'hr') {
        router.push('/hr/dashboard');
      } else {
        router.push('/jobs');
      }
    }
  }, [user, loading, router]);

  return <div className="p-4">Redirecting...</div>;
}
