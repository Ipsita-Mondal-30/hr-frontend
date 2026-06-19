'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { jwtDecode } from 'jwt-decode';
import { motion } from 'motion/react';
import {
  ArrowLeft,
  Briefcase,
  Building2,
  CheckCircle2,
  Loader2,
  Shield,
  Sparkles,
  UserCircle,
  Users,
} from 'lucide-react';
import { setAuthToken, getAuthToken } from '@/lib/cookies';
import { getDashboardPath } from '@/lib/dashboardRoutes';
import api from '@/lib/api';

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
    ring: 'ring-purple-500/50',
  },
  {
    id: 'hr',
    label: 'HR Manager',
    description: 'Post jobs, review applications, and manage hiring workflows.',
    icon: Building2,
    accent: 'from-cyan-500 to-blue-600',
    ring: 'ring-cyan-500/50',
  },
  {
    id: 'candidate',
    label: 'Job Candidate',
    description: 'Browse openings, apply to roles, and track your applications.',
    icon: Briefcase,
    accent: 'from-emerald-500 to-teal-600',
    ring: 'ring-emerald-500/50',
  },
  {
    id: 'employee',
    label: 'Employee',
    description: 'View projects, performance, payroll, and team feedback.',
    icon: Users,
    accent: 'from-orange-500 to-amber-600',
    ring: 'ring-orange-500/50',
  },
] as const;

function readSession(): { token: string; userInfo: DecodedJwt | null } {
  if (typeof window === 'undefined') return { token: '', userInfo: null };

  const jwtFromQuery = new URLSearchParams(window.location.search).get('token');
  const jwt = jwtFromQuery || getAuthToken() || '';

  if (!jwt) return { token: '', userInfo: null };

  try {
    const decoded = jwtDecode<DecodedJwt>(jwt);
    setAuthToken(jwt);
    return { token: jwt, userInfo: decoded };
  } catch {
    return { token: '', userInfo: null };
  }
}

function isErrorWithMessage(e: unknown): e is { message: string } {
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
      const res = await api.post<{ token?: string; error?: string }>(
        '/auth/set-role',
        { role },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      if (res.data.token) {
        setAuthToken(res.data.token);
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

  if (!token || checkingExistingRole) {
    return (
      <div className="relative flex min-h-screen items-center justify-center bg-slate-950">
        <div className="flex flex-col items-center text-white/70">
          <Loader2 className="mb-4 h-10 w-10 animate-spin text-purple-400" />
          <p className="text-sm">{checkingExistingRole ? 'Checking your account...' : 'Redirecting to sign in...'}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="relative min-h-screen overflow-hidden bg-slate-950">
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

      <header className="relative z-20 px-6 py-6 sm:px-10">
        <div className="mx-auto flex max-w-4xl items-center justify-between">
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

      <main className="relative z-10 mx-auto max-w-2xl px-6 pb-16 pt-4">
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.25 }}
        >
          <div className="mb-8 text-center">
            <p className="mb-3 inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/5 px-4 py-1.5 text-sm font-medium text-purple-200 backdrop-blur-sm">
              <Sparkles className="h-3.5 w-3.5" />
              Almost there
            </p>
            <h1 className="text-3xl font-bold tracking-tight text-white sm:text-4xl">
              Choose your role
            </h1>
            <p className="mt-2 text-slate-400">
              Select how you&apos;ll use Talora. You can update this later from your profile.
            </p>
          </div>

          {userInfo && (
            <div className="mb-8 flex items-center gap-4 rounded-2xl border border-white/10 bg-white/5 p-4 backdrop-blur-sm">
              <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-purple-500 to-cyan-500 text-xl font-bold text-white shadow-lg">
                {initials}
              </div>
              <div className="min-w-0 text-left">
                <p className="truncate font-semibold text-white">{userInfo.name}</p>
                <p className="truncate text-sm text-slate-400">{userInfo.email}</p>
              </div>
              <UserCircle className="ml-auto hidden h-8 w-8 shrink-0 text-white/20 sm:block" />
            </div>
          )}

          {error && (
            <div className="mb-6 rounded-xl border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-200">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid gap-3 sm:grid-cols-2">
              {ROLES.map((r) => {
                const Icon = r.icon;
                const selected = role === r.id;
                return (
                  <button
                    key={r.id}
                    type="button"
                    disabled={submitting}
                    onClick={() => {
                      setRole(r.id);
                      setError('');
                    }}
                    className={`group relative rounded-2xl border p-4 text-left transition-all duration-200 disabled:opacity-50 ${
                      selected
                        ? `border-transparent bg-white/10 ring-2 ${r.ring} shadow-lg`
                        : 'border-white/10 bg-white/5 hover:border-white/20 hover:bg-white/[0.07]'
                    }`}
                  >
                    {selected && (
                      <CheckCircle2 className="absolute right-3 top-3 h-5 w-5 text-emerald-400" />
                    )}
                    <div
                      className={`mb-3 inline-flex rounded-xl bg-gradient-to-br ${r.accent} p-2.5 shadow-md`}
                    >
                      <Icon className="h-5 w-5 text-white" />
                    </div>
                    <p className="font-semibold text-white">{r.label}</p>
                    <p className="mt-1 text-xs leading-relaxed text-slate-400">{r.description}</p>
                  </button>
                );
              })}
            </div>

            <button
              type="submit"
              disabled={!token || !role || submitting}
              className="flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-purple-600 to-indigo-600 py-3.5 text-sm font-semibold text-white shadow-lg shadow-purple-500/25 transition hover:from-purple-500 hover:to-indigo-500 disabled:cursor-not-allowed disabled:from-slate-600 disabled:to-slate-700 disabled:shadow-none"
            >
              {submitting ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Redirecting...
                </>
              ) : (
                <>
                  Continue to dashboard
                  <ArrowLeft className="h-4 w-4 rotate-180" />
                </>
              )}
            </button>
          </form>
        </motion.div>
      </main>
    </div>
  );
}
