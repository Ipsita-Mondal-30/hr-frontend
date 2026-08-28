import Link from 'next/link';

export default function Footer() {
  return (
    <footer className="bg-slate-950 border-t border-white/5">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-10">
          <div className="md:col-span-2">
            <div className="text-2xl font-bold text-white mb-3">Talora</div>
            <p className="text-slate-400 text-sm leading-relaxed max-w-sm">
              The all-in-one recruitment platform connecting candidates, HR teams, employees,
              and admins.
            </p>
          </div>

          <div>
            <h4 className="text-sm font-semibold text-white mb-4">Platform</h4>
            <ul className="space-y-2 text-sm text-slate-400">
              <li><Link href="/jobs" className="hover:text-white transition-colors">Browse Jobs</Link></li>
              <li><Link href="/login" className="hover:text-white transition-colors">Sign In</Link></li>
              <li><Link href="/role-select" className="hover:text-white transition-colors">Choose Role</Link></li>
            </ul>
          </div>

          <div>
            <h4 className="text-sm font-semibold text-white mb-4">Roles</h4>
            <ul className="space-y-2 text-sm text-slate-400">
              <li>Candidate Portal</li>
              <li>HR Dashboard</li>
              <li>Admin Panel</li>
              <li>Employee Hub</li>
            </ul>
          </div>
        </div>

        <div className="pt-8 border-t border-white/5 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-sm text-slate-500">
            &copy; {new Date().getFullYear()} Talora. All rights reserved.
          </p>
          <p className="text-sm text-slate-600">Built with care for better hiring.</p>
        </div>
      </div>
    </footer>
  );
}
