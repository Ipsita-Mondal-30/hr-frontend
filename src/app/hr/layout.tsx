// app/hr/layout.tsx
import { ReactNode } from 'react';
import Link from 'next/link';

export default function HRLayout({ children }: { children: ReactNode }) {
  return (
    <div className="flex min-h-screen">
      <aside className="w-64 bg-gray-100 p-6 space-y-4">
        <h1 className="text-xl font-semibold">HR Panel</h1>
        <nav className="flex flex-col space-y-2">
          <Link href="/hr/dashboard" className="hover:underline">Dashboard</Link>
          <Link href="/hr/applications" className="hover:underline">Applications</Link>
          <Link href="/hr/jobs" className="hover:underline">Jobs</Link>
        </nav>
      </aside>
      <main className="flex-1 bg-white p-6">
        {children}
      </main>
    </div>
  );
}
