'use client';

import { useState, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { motion } from 'motion/react';
import { ArrowLeft, Shield, Sparkles, Users } from 'lucide-react';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:8080';

const features = [
  { icon: Users, label: 'One platform for every role' },
  { icon: Shield, label: 'Secure Google sign-in' },
  { icon: Sparkles, label: 'Instant account setup' },
];

export default function LoginContent() {
  const [error, setError] = useState<string | null>(null);
  const searchParams = useSearchParams();

  useEffect(() => {
    const errorParam = searchParams.get('error');
    const messageParam = searchParams.get('message');

    if (errorParam) {
      if (errorParam === 'oauth_failed') {
        setError(`OAuth Login Failed: ${messageParam || 'Unknown error'}`);
      } else {
        setError(`Login Error: ${messageParam || errorParam}`);
      }
    }
  }, [searchParams]);

  const googleAuthUrl = `${API_BASE_URL}/api/auth/google?frontend=${encodeURIComponent(
    typeof window !== 'undefined' ? window.location.origin : 'https://hr-frontend-54b2.vercel.app'
  )}`;

  return (
    <div className="relative min-h-screen overflow-hidden bg-slate-950">
      {/* Ambient background */}
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

      {/* Header */}
      <header className="relative z-20 px-6 py-6 sm:px-10">
        <div className="mx-auto flex max-w-6xl items-center justify-between">
          <Link href="/" className="group flex items-center gap-3">
            <div className="rounded-xl bg-white/10 p-1.5 ring-1 ring-white/15 backdrop-blur-sm transition group-hover:bg-white/15">
              <Image src="/talora.png" alt="Talora" width={32} height={32} className="rounded-lg" />
            </div>
            <span className="text-lg font-semibold tracking-tight text-white">Talora</span>
          </Link>
          <Link
            href="/"
            className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/5 px-4 py-2 text-sm font-medium text-white/80 backdrop-blur-sm transition hover:border-white/25 hover:bg-white/10 hover:text-white"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Home
          </Link>
        </div>
      </header>

      {/* Main */}
      <main className="relative z-10 flex min-h-[calc(100vh-5.5rem)] items-center justify-center px-6 pb-12 pt-4">
        <div className="mx-auto grid w-full max-w-5xl items-center gap-12 lg:grid-cols-[1fr_420px]">
          {/* Left panel — brand copy */}
          <motion.div
            initial={{ opacity: 0, x: -24 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, ease: 'easeOut' }}
            className="hidden lg:block"
          >
            <p className="mb-4 inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/5 px-4 py-1.5 text-sm font-medium text-purple-200 backdrop-blur-sm">
              <Sparkles className="h-3.5 w-3.5" />
              Welcome back
            </p>
            <h1 className="text-4xl font-bold leading-tight tracking-tight text-white xl:text-5xl">
              Sign in to{' '}
              <span className="bg-gradient-to-r from-cyan-300 via-purple-300 to-pink-300 bg-clip-text text-transparent">
                Talora
              </span>
            </h1>
            <p className="mt-4 max-w-md text-lg leading-relaxed text-slate-300">
              Connect with your team, manage careers, and access everything you need in one seamless HR ecosystem.
            </p>
            <ul className="mt-10 space-y-4">
              {features.map(({ icon: Icon, label }) => (
                <li key={label} className="flex items-center gap-3 text-slate-300">
                  <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-white/10 ring-1 ring-white/10">
                    <Icon className="h-4 w-4 text-purple-300" />
                  </span>
                  {label}
                </li>
              ))}
            </ul>
          </motion.div>

          {/* Login card */}
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1, ease: 'easeOut' }}
            className="w-full"
          >
            <div className="rounded-3xl border border-white/10 bg-white/[0.07] p-8 shadow-2xl shadow-purple-950/50 backdrop-blur-xl sm:p-10">
              {/* Mobile-only header */}
              <div className="mb-8 text-center lg:hidden">
                <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-white/10 ring-1 ring-white/15">
                  <Image src="/talora.png" alt="Talora" width={36} height={36} className="rounded-xl" />
                </div>
                <h2 className="text-2xl font-bold text-white">Welcome to Talora</h2>
                <p className="mt-2 text-sm text-slate-400">Sign in to continue</p>
              </div>

              <div className="mb-8 hidden lg:block">
                <h2 className="text-2xl font-bold text-white">Sign in</h2>
                <p className="mt-2 text-sm text-slate-400">
                  Use your Google account to access your dashboard
                </p>
              </div>

              {error && (
                <div className="mb-6 rounded-xl border border-red-400/30 bg-red-500/10 p-4">
                  <div className="flex items-start gap-3">
                    <div className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-red-500/20">
                      <span className="text-xs font-bold text-red-300">!</span>
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-medium text-red-200">Login Error</p>
                      <p className="mt-1 text-sm text-red-300/90">{error}</p>
                      <button
                        onClick={() => setError(null)}
                        className="mt-2 text-xs font-medium text-red-200 underline-offset-2 hover:underline"
                      >
                        Dismiss
                      </button>
                    </div>
                  </div>
                </div>
              )}

              <a
                href={googleAuthUrl}
                className="group flex w-full items-center justify-center gap-3 rounded-xl border border-white/15 bg-white px-5 py-3.5 text-sm font-semibold text-slate-800 shadow-lg shadow-black/10 transition hover:-translate-y-0.5 hover:bg-slate-50 hover:shadow-xl hover:shadow-black/20 active:translate-y-0"
              >
                <svg className="h-5 w-5 shrink-0" viewBox="0 0 24 24" aria-hidden="true">
                  <path
                    fill="#4285F4"
                    d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                  />
                  <path
                    fill="#34A853"
                    d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                  />
                  <path
                    fill="#FBBC05"
                    d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                  />
                  <path
                    fill="#EA4335"
                    d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                  />
                </svg>
                Continue with Google
              </a>

              <div className="mt-6 rounded-xl bg-white/5 px-4 py-3 ring-1 ring-white/10">
                <p className="text-center text-xs leading-relaxed text-slate-400">
                  New to Talora? Your account is created automatically the first time you sign in with Google.
                </p>
              </div>

              <p className="mt-6 text-center text-xs text-slate-500">
                By continuing, you agree to our platform&apos;s terms of use and privacy policy.
              </p>
            </div>
          </motion.div>
        </div>
      </main>
    </div>
  );
}
