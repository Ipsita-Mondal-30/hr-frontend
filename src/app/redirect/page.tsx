'use client';
import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import api from '@/lib/api';

export default function RedirectPage() {
  const router = useRouter();

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const res = await api.get('/me', { withCredentials: true });
        const user = res.data;

        if (user.role === 'admin') {
          router.push('/admin/dashboard');
        } else if (user.role === 'hr') {
          router.push('/hr/jobs');
        } else {
          router.push('/candidate/jobs');
        }
      } catch (err) {
        console.error('User fetch failed', err);
        router.push('/');
      }
    };

    fetchUser();
  }, [router]);

  return <p className="p-6">Logging you in...</p>;
}
