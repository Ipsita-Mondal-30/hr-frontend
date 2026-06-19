import { Suspense } from 'react';
import LoginContent from '@/components/LoginContent';

function LoginFallback() {
  return (
    <div className="relative min-h-screen overflow-hidden bg-slate-950">
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute -left-32 top-0 h-[28rem] w-[28rem] rounded-full bg-purple-600/30 blur-[120px]" />
        <div className="absolute -right-24 bottom-0 h-[32rem] w-[32rem] rounded-full bg-indigo-500/25 blur-[120px]" />
        <div className="absolute inset-0 bg-gradient-to-br from-slate-950 via-purple-950/80 to-slate-950" />
      </div>
      <div className="relative z-10 flex min-h-screen items-center justify-center px-6">
        <div className="w-full max-w-md rounded-3xl border border-white/10 bg-white/[0.07] p-10 text-center shadow-2xl backdrop-blur-xl">
          <div className="mx-auto mb-6 h-10 w-10 animate-spin rounded-full border-2 border-white/20 border-t-purple-400" />
          <h2 className="text-xl font-semibold text-white">Welcome to Talora</h2>
          <p className="mt-2 text-sm text-slate-400">Loading...</p>
        </div>
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={<LoginFallback />}>
      <LoginContent />
    </Suspense>
  );
}
