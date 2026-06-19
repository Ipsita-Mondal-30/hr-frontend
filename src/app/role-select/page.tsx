'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { jwtDecode } from 'jwt-decode';
import { motion } from 'motion/react';
import {
  ArrowLeft,
  ArrowRight,
  Briefcase,
  Building2,
  CheckCircle2,
  Shield,
  Sparkles,
  Target,
  UserCircle,
  Users,
} from 'lucide-react';
import { setAuthToken, getAuthToken } from '@/lib/cookies';
import { getDashboardPath } from '@/lib/dashboardRoutes';
import api from '@/lib/api';
import TaloraLoader from '@/components/TaloraLoader';
import { useAuth } from '@/lib/AuthContext';

interface DecodedJwt {
  name?: string;
  email?: string;
  role?: string;
  sub?: string;
  iat?: number;
  exp?: number;
  [key: string]: unknown;
}

const ROLES = [
  {
    id: 'admin',
    label: 'Admin',
    description: 'Manage users, approve jobs, and oversee the entire platform.',
    icon: Shield,
    accent: 'from-purple-500 to-violet-600',
    ring: 'ring-purple-400/60',
    glow: 'shadow-purple-500/20',
  },
  {
    id: 'hr',
    label: 'HR Manager',
    description: 'Post jobs, review applications, and manage hiring workflows.',
    icon: Building2,
    accent: 'from-cyan-500 to-blue-600',
    ring: 'ring-cyan-400/60',
    glow: 'shadow-cyan-500/20',
  },
  {
    id: 'candidate',
    label: 'Job Candidate',
    description: 'Browse openings, apply to roles, and track your applications.',
    icon: Briefcase,
    accent: 'from-emerald-500 to-teal-600',
    ring: 'ring-emerald-400/60',
    glow: 'shadow-emerald-500/20',
  },
  {
    id: 'employee',
    label: 'Employee',
    description: 'View projects, performance, payroll, and team feedback.',
    icon: Users,
    accent: 'from-orange-500 to-amber-600',
    ring: 'ring-orange-400/60',
    glow: 'shadow-orange-500/20',
  },
] as const;

const HIGHLIGHTS = [
  { icon: Target, label: 'Tailored dashboard for your role' },
  { icon: Sparkles, label: 'One account, switch anytime from profile' },
  { icon: Shield, label: 'Secure Google sign-in' },
];

function readSession(): { token: string; userInfo: DecodedJwt | null } {
  if (typeof window === 'undefined') return { token: '', userInfo: null };

  const jwtFromQuery = new URLSearchParams(window.location.search).get('token');
  if (jwtFromQuery) {
    setAuthToken(jwtFromQuery);
    // Drop stale ?token= from URL — cookie is the source of truth after role is set
    window.history.replaceState({}, '', window.location.pathname);
  }

  const jwt = getAuthToken() || '';
  if (!jwt) return { token: '', userInfo: null };

  try {
    const decoded = jwtDecode<DecodedJwt>(jwt);
    return { token: jwt, userInfo: decoded };
  } catch {
    return { token: '', userInfo: null };
  }
}

function isErrorWithMessage(e: unknown): e is { message: string; response?: { data?: { error?: string } } } {
  if (typeof e !== 'object' || e === null) return false;
  const maybe = e as { message?: unknown; response?: { data?: { error?: string } } };
  if (typeof maybe.message === 'string') return true;
  return typeof maybe.response?.data?.error === 'string';
}

function getErrorMessage(err: unknown): string {
  if (isErrorWithMessage(err)) {
    return err.response?.data?.error || err.message;
  }
  return 'Please try again.';
}

export default function RoleSelectPage() {
  const { user, updateUser } = useAuth();
  const [session] = useState(readSession);
  const token = session.token;
  const userInfo = session.userInfo;
  const [role, setRole] = useState(() =>
    userInfo?.role && ROLES.some((r) => r.id === userInfo.role) ? (userInfo.role as string) : ''
  );
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(() => (!session.token ? 'Session expired. Please sign in again.' : ''));
  const [checkingExistingRole, setCheckingExistingRole] = useState(!!session.token);
  const router = useRouter();

  const redirectToDashboard = useCallback((roleValue: string) => {
    const path = getDashboardPath(roleValue);
    if (path) window.location.replace(path);
  }, []);

  // Redirect as soon as auth context or JWT confirms a role
  useEffect(() => {
    const roleValue = user?.role || userInfo?.role;
    const path = getDashboardPath(roleValue);
    if (path) {
      window.location.replace(path);
    }
  }, [user?.role, userInfo?.role]);

  useEffect(() => {
    if (!token) {
      const t = setTimeout(() => router.replace('/login'), 2000);
      return () => clearTimeout(t);
    }

    const jwtPath = getDashboardPath(userInfo?.role);
    if (jwtPath) {
      window.location.replace(jwtPath);
      return;
    }

    let cancelled = false;
    (async () => {
      try {
        const res = await api.get<{ role?: string }>('/auth/me');
        if (cancelled) return;
        const path = getDashboardPath(res.data.role);
        if (path) {
          window.location.replace(path);
          return;
        }
      } catch {
        // User still needs to pick a role — show the form
      } finally {
        if (!cancelled) setCheckingExistingRole(false);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [token, userInfo?.role, router]);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!role) {
      setError('Please select a role to continue');
      return;
    }

    if (submitting) return;
    setSubmitting(true);
    setError('');

    try {
      const res = await api.post<{ token?: string; error?: string; user?: { _id: string; name: string; email: string; role: 'admin' | 'hr' | 'candidate' | 'employee' } }>(
        '/auth/set-role',
        { role },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      if (res.data.token) {
        setAuthToken(res.data.token);
      }

      if (res.data.user) {
        updateUser(res.data.user as Parameters<typeof updateUser>[0]);
      }

      redirectToDashboard(role);
    } catch (err: unknown) {
      const msg = getErrorMessage(err);
      let errorMessage = 'Failed to set role. ';

      if (msg.includes('Backend server is not running') || msg.includes('Network Error')) {
        errorMessage += 'Cannot reach the server. Please try again in a moment.';
      } else if (msg.includes('Database connection failed')) {
        errorMessage += 'Database issue. Try again later.';
      } else {
        errorMessage += msg || 'Please try again.';
      }

      setError(errorMessage);
      setSubmitting(false);
    }
  };

  const initials = userInfo?.name?.charAt(0).toUpperCase() || '?';
  const selectedRole = ROLES.find((r) => r.id === role);

  if (!token || checkingExistingRole) {
    return (
      <div className="relative min-h-screen bg-slate-950">
        <Background />
        <TaloraLoader
          fullScreen
          dark
          message={checkingExistingRole ? 'Checking your account...' : 'Redirecting to sign in...'}
        />
      </div>
    );
  }

  if (submitting) {
    return (
      <div className="relative min-h-screen bg-slate-950">
        <Background />
        <TaloraLoader fullScreen dark message="Setting up your dashboard..." />
      </div>
    );
  }

  return (
    <div className="relative min-h-screen overflow-hidden bg-slate-950">
      <Background />

      <header className="relative z-20 px-6 py-6 sm:px-10">
        <div className="mx-auto flex max-w-6xl items-center justify-between">
          <Link href="/" className="group flex items-center gap-3">
            <div className="rounded-xl bg-white/10 p-1.5 ring-1 ring-white/15 backdrop-blur-sm transition group-hover:bg-white/15">
              <Image src="/talora.png" alt="Talora" width={32} height={32} className="rounded-lg" />
            </div>
            <span className="text-lg font-semibold tracking-tight text-white">Talora</span>
          </Link>
          <Link
            href="/login"
            className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/5 px-4 py-2 text-sm font-medium text-white/80 backdrop-blur-sm transition hover:border-white/25 hover:bg-white/10 hover:text-white"
          >
            <ArrowLeft className="h-4 w-4" />
            Back
          </Link>
        </div>
      </header>

      <main className="relative z-10 flex min-h-[calc(100vh-5.5rem)] items-center justify-center px-6 pb-12 pt-2">
        <div className="mx-auto grid w-full max-w-5xl items-center gap-10 lg:grid-cols-[1fr_440px] lg:gap-14">
          {/* Left — brand panel */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, ease: 'easeOut' }}
            className="hidden lg:block"
          >
            <p className="mb-4 inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/5 px-4 py-1.5 text-sm font-medium text-purple-200 backdrop-blur-sm">
              <Sparkles className="h-3.5 w-3.5" />
              Step 2 of 2
            </p>
            <h1 className="text-4xl font-bold leading-tight tracking-tight text-white xl:text-5xl">
              Choose your{' '}
              <span className="bg-gradient-to-r from-cyan-300 via-purple-300 to-pink-300 bg-clip-text text-transparent">
                workspace
              </span>
            </h1>
            <p className="mt-4 max-w-md text-lg leading-relaxed text-slate-300">
              Pick the role that matches how you&apos;ll use Talora today. Your dashboard and tools will be tailored instantly.
            </p>
            <ul className="mt-10 space-y-4">
              {HIGHLIGHTS.map(({ icon: Icon, label }) => (
                <li key={label} className="flex items-center gap-3 text-slate-300">
                  <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-white/10 ring-1 ring-white/10">
                    <Icon className="h-4 w-4 text-purple-300" />
                  </span>
                  {label}
                </li>
              ))}
            </ul>
          </motion.div>

          {/* Right — selection card */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.08, ease: 'easeOut' }}
            className="w-full"
          >
            <div className="rounded-3xl border border-white/10 bg-white/[0.07] p-6 shadow-2xl shadow-purple-950/50 backdrop-blur-xl sm:p-8">
              <div className="mb-6 text-center lg:text-left">
                <p className="mb-3 inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/5 px-3 py-1 text-xs font-medium text-purple-200 lg:hidden">
                  <Sparkles className="h-3 w-3" />
                  Almost there
                </p>
                <h2 className="text-2xl font-bold text-white sm:text-3xl">Choose your role</h2>
                <p className="mt-2 text-sm text-slate-400">
                  Select how you&apos;ll use Talora. You can change this later from your profile.
                </p>
              </div>

              {userInfo && (
                <div className="mb-6 flex items-center gap-4 rounded-2xl border border-white/10 bg-gradient-to-r from-purple-500/10 to-cyan-500/10 p-4">
                  <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-purple-500 to-cyan-500 text-lg font-bold text-white shadow-lg shadow-purple-500/30">
                    {initials}
                  </div>
                  <div className="min-w-0 flex-1 text-left">
                    <p className="truncate font-semibold text-white">{userInfo.name}</p>
                    <p className="truncate text-sm text-slate-400">{userInfo.email}</p>
                  </div>
                  <UserCircle className="hidden h-7 w-7 shrink-0 text-white/20 sm:block" />
                </div>
              )}

              {error && (
                <div className="mb-5 rounded-xl border border-red-400/30 bg-red-500/10 px-4 py-3 text-sm text-red-200">
                  {error}
                </div>
              )}

              <form onSubmit={handleSubmit} className="space-y-5">
                <div className="grid gap-3 sm:grid-cols-2">
                  {ROLES.map((r) => {
                    const Icon = r.icon;
                    const selected = role === r.id;
                    return (
                      <button
                        key={r.id}
                        type="button"
                        onClick={() => {
                          setRole(r.id);
                          setError('');
                        }}
                        className={`group relative rounded-2xl border p-4 text-left transition-all duration-200 ${
                          selected
                            ? `border-transparent bg-white/10 ring-2 ${r.ring} shadow-lg ${r.glow}`
                            : 'border-white/10 bg-white/[0.04] hover:border-white/20 hover:bg-white/[0.08]'
                        }`}
                      >
                        {selected && (
                          <CheckCircle2 className="absolute right-3 top-3 h-5 w-5 text-emerald-400" />
                        )}
                        <div
                          className={`mb-3 inline-flex rounded-xl bg-gradient-to-br ${r.accent} p-2.5 shadow-md transition group-hover:scale-105`}
                        >
                          <Icon className="h-5 w-5 text-white" />
                        </div>
                        <p className="font-semibold text-white">{r.label}</p>
                        <p className="mt-1 text-xs leading-relaxed text-slate-400">{r.description}</p>
                      </button>
                    );
                  })}
                </div>

                {selectedRole && (
                  <motion.p
                    initial={{ opacity: 0, y: 4 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="text-center text-xs text-slate-400 lg:text-left"
                  >
                    You selected <span className="font-medium text-purple-300">{selectedRole.label}</span>
                  </motion.p>
                )}

                <button
                  type="submit"
                  disabled={!token || !role}
                  className="flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-purple-600 to-indigo-600 py-3.5 text-sm font-semibold text-white shadow-lg shadow-purple-500/25 transition hover:from-purple-500 hover:to-indigo-500 disabled:cursor-not-allowed disabled:from-slate-600 disabled:to-slate-700 disabled:shadow-none"
                >
                  Continue to dashboard
                  <ArrowRight className="h-4 w-4" />
                </button>
              </form>
            </div>
          </motion.div>
        </div>
      </main>
    </div>
  );
}

function Background() {
  return (
    <div className="pointer-events-none absolute inset-0">
      <div className="absolute -left-32 top-0 h-[28rem] w-[28rem] rounded-full bg-purple-600/30 blur-[120px]" />
      <div className="absolute -right-24 bottom-0 h-[32rem] w-[32rem] rounded-full bg-indigo-500/25 blur-[120px]" />
      <div className="absolute left-1/2 top-1/3 h-64 w-64 -translate-x-1/2 rounded-full bg-cyan-400/10 blur-[100px]" />
      <div
        className="absolute inset-0 opacity-[0.15]"
        style={{
          backgroundImage:
            'linear-gradient(rgba(255,255,255,0.06) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.06) 1px, transparent 1px)',
          backgroundSize: '48px 48px',
        }}
      />
      <div className="absolute inset-0 bg-gradient-to-br from-slate-950 via-purple-950/80 to-slate-950" />
    </div>
  );
}
