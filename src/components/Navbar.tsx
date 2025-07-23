'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import {jwtDecode } from 'jwt-decode';

type DecodedUser = {
  name: string;
  email: string;
  role: string;
};

export default function Navbar() {
  const [user, setUser] = useState<DecodedUser | null>(null);
  const router = useRouter();

  useEffect(() => {
    const updateUser = () => {
      const token = localStorage.getItem('token');
      if (token) {
        try {
          const decoded = jwtDecode<DecodedUser>(token);
          setUser(decoded);
        } catch (err) {
          localStorage.removeItem('token');
          setUser(null);
        }
      } else {
        setUser(null);
      }
    };

    updateUser();

    window.addEventListener('storage', updateUser);
    return () => window.removeEventListener('storage', updateUser);
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('token');
    router.push('/');
  };

  return (
    <nav className="bg-white shadow-md p-4 flex justify-between items-center">
      <Link href="/" className="text-xl font-bold text-blue-600">
        🧠 HR SmartHire
      </Link>

      <div className="flex items-center space-x-4">
        <Link href="/raise-ticket" className="text-sm text-gray-600 hover:text-black">
          Raise a Ticket
        </Link>

        {user?.role === 'admin' && (
          <Link href="/admin/dashboard" className="text-sm text-gray-700 hover:text-black">
            Admin Dashboard
          </Link>
        )}

        {user?.role === 'hr' && (
          <Link href="/hr/dashboard" className="text-sm text-gray-700 hover:text-black">
            HR Dashboard
          </Link>
        )}

        {user?.role === 'candidate' && (
          <Link href="/jobs" className="text-sm text-gray-700 hover:text-black">
            Jobs
          </Link>
        )}

        {!user ? (
          <a
            href="http://localhost:8080/api/auth/google"
            className="px-4 py-1 bg-blue-600 text-white rounded-full text-sm"
          >
            Login with Google
          </a>
        ) : (
          <div className="flex items-center space-x-3">
            <div className="text-sm text-gray-700">
              {user.name} <span className="text-gray-400">({user.role})</span>
            </div>
            <button
              onClick={handleLogout}
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
