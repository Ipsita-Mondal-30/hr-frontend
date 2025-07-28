'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { jwtDecode } from 'jwt-decode';
import { getAuthToken, removeAuthToken } from '@/lib/cookies';

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
      const token = getAuthToken();
      if (token) {
        try {
          const decoded = jwtDecode<DecodedUser>(token);
          setUser(decoded);
        } catch (err) {
          removeAuthToken();
          setUser(null);
        }
      } else {
        setUser(null);
      }
    };

    updateUser();

    // Listen for cookie changes
    const checkUser = () => {
      setTimeout(updateUser, 100);
    };
    
    window.addEventListener('focus', checkUser);
    return () => window.removeEventListener('focus', checkUser);
  }, []);

  const handleLogout = async () => {
    try {
      await fetch('http://localhost:8080/api/auth/logout', {
        method: 'POST',
        credentials: 'include'
      });
    } catch (err) {
      console.error('Logout error:', err);
    } finally {
      removeAuthToken();
      setUser(null);
      router.push('/');
    }
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
