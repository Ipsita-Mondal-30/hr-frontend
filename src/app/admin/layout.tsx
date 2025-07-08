'use client';
import { ReactNode } from 'react';
import Link from 'next/link';

export default function HRLayout({ children }: { children: ReactNode }) {
  return (
    <div className="flex min-h-screen">
      <aside className="w-64 bg-gray-100 p-6 space-y-4">
        <h1 className="text-xl font-semibold">Admin Panel</h1>
        <nav className="flex flex-col space-y-2">
        <Link href="/admin/departments" className="text-sm text-gray-600 hover:text-black">
  Departments
</Link>
<Link href="/admin/roles" className="text-sm text-gray-600 hover:text-black">
  Roles
</Link>
<Link href="/admin/users" className="text-sm text-gray-600 hover:text-black">
  User Management
</Link>
<Link href="/admin/jobs" className="text-sm text-gray-700 hover:text-black">
  All Jobs
</Link>
<Link href="/admin/applications" className="text-sm text-gray-700 hover:text-black">
  All Applications
</Link>


        </nav>
      </aside>
      <main className="flex-1 bg-white p-6">
        {children}
      </main>
    </div>
  );
}
