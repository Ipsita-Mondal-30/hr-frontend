'use client';

import { useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { jwtDecode } from 'jwt-decode'; // ✅ Correct import

export default function AuthCallback() {
  const router = useRouter();
  const params = useSearchParams();
  const token = params.get('token');

  useEffect(() => {
    if (token) {
      localStorage.setItem('token', token);

      const decoded: any = jwtDecode(token);
      const role = decoded.role;

      localStorage.setItem('role', role);
      localStorage.setItem('user', JSON.stringify(decoded));

      if (role === 'admin') router.replace('/admin');
      else if (role === 'hr') router.replace('/hr');
      else if (role === 'candidate') router.replace('/candidate');
      else if (role === 'employee') router.replace('/employee');
      else router.replace('/select-role');
    } else {
      router.replace('/login');
    }
  }, [token, router]);

  return <p className="p-8 text-center">Processing login...</p>;
}
