'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import api from '@/lib/api';
import { User } from '@/types';
import { useRouter } from 'next/navigation';

export default function Navbar() {
  const [user, setUser] = useState<User | null>(null);
  const router = useRouter();

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const res = await api.get('/auth/me');
        const userData = res.data;
        setUser(userData);

        // Redirect to /select-role if role is not set
        if (!userData.role && window.location.pathname !== '/select-role') {
          router.push('/select-role');
        }
      } catch (err) {
        setUser(null); // Not logged in
      }
    };
    fetchUser();
  }, [router]);

  return (
    <nav className="bg-white shadow-md p-4 flex justify-between items-center">
      <Link href="/" className="text-xl font-bold text-blue-600">
        🧠 HR SmartHire
      </Link>

      <div className="flex items-center space-x-4">
        <Link href="/raise-ticket" className="text-sm text-gray-600 hover:text-black">
          Raise a Ticket
        </Link>

        {user && user.role === 'admin' && (
          <Link href="/admin/dashboard" className="text-sm text-gray-700 hover:text-black">
            Admin Dashboard
          </Link>
        )}

        {user && user.role === 'hr' && (
          <Link href="/hr/dashboard" className="text-sm text-gray-700 hover:text-black">
            HR Dashboard
          </Link>
        )}

        {user && user.role === 'candidate' && (
          <Link href="/jobs" className="text-sm text-gray-700 hover:text-black">
            Jobs
          </Link>
        )}

        {!user ? (
          <a
            href="http://localhost:8080/auth/google"
            className="px-4 py-1 bg-blue-600 text-white rounded-full text-sm"
          >
            Login with Google
          </a>
        ) : (
          <div className="flex items-center space-x-3">
            <div className="text-sm text-gray-700">
              {user.name} <span className="text-gray-400">({user.role || 'no role'})</span>
            </div>
            <button
            onClick={async () => {
                try {
                  await fetch('http://localhost:8080/auth/logout', {
                    method: 'GET',
                    credentials: 'include',
                  });
                  window.location.href = '/';
                } catch (err) {
                  console.error('Logout failed:', err);
                }
              }}
              
              className="text-sm bg-gray-100 px-3 py-1 rounded hover:bg-gray-200"
            >
              Logout
            </button>
          </div>
        )}
      </div>
    </nav>
  );
}
