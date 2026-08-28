'use client';

import Link from 'next/link';
import { motion } from 'motion/react';
import { ArrowRight, Sparkles, BarChart3, Mic, Wallet } from 'lucide-react';

const trustItems = [
  { icon: Sparkles, label: 'AI Matching' },
  { icon: Mic, label: 'Interview Prep' },
  { icon: BarChart3, label: 'HR Analytics' },
  { icon: Wallet, label: 'Payroll' },
];

export function HeroSection() {
  return (
    <section className="relative min-h-screen pt-24 pb-16 overflow-hidden bg-slate-950">
      {/* Animated gradient mesh */}
      <div className="absolute inset-0">
        <div className="absolute top-0 left-1/4 w-[500px] h-[500px] bg-indigo-600/30 rounded-full blur-[120px] animate-pulse" />
        <div className="absolute bottom-0 right-1/4 w-[400px] h-[400px] bg-violet-600/20 rounded-full blur-[100px] animate-pulse delay-1000" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-sky-600/10 rounded-full blur-[140px]" />
      </div>

      {/* Grid overlay */}
      <div
        className="absolute inset-0 opacity-[0.03]"
        style={{
          backgroundImage: `linear-gradient(rgba(255,255,255,0.1) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.1) 1px, transparent 1px)`,
          backgroundSize: '64px 64px',
        }}
      />

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16 items-center min-h-[80vh]">
          {/* Left */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7 }}
            className="space-y-8"
          >
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/5 border border-white/10 text-sm text-slate-300">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              All-in-one recruitment platform
            </div>

            <h1 className="text-5xl lg:text-6xl xl:text-7xl font-bold text-white leading-[1.1] tracking-tight">
              Hire smarter.
              <br />
              <span className="bg-gradient-to-r from-indigo-400 via-violet-400 to-sky-400 bg-clip-text text-transparent">
                Grow faster.
              </span>
            </h1>

            <p className="text-lg text-slate-400 leading-relaxed max-w-lg">
              Talora connects candidates, HR teams, employees, and admins in one intelligent
              ecosystem — from AI resume matching to interview prep and payroll.
            </p>

            <div className="flex flex-col sm:flex-row gap-4">
              <Link
                href="/login"
                className="group inline-flex items-center justify-center gap-2 px-8 py-4 bg-indigo-600 hover:bg-indigo-500 text-white font-semibold rounded-xl transition-all duration-300 shadow-lg shadow-indigo-600/25 hover:shadow-indigo-500/40"
              >
                Get Started Free
                <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </Link>
              <Link
                href="/jobs"
                className="inline-flex items-center justify-center px-8 py-4 border border-white/15 text-white font-semibold rounded-xl hover:bg-white/5 transition-all duration-300"
              >
                Browse Jobs
              </Link>
            </div>

            {/* Trust strip */}
            <div className="flex flex-wrap gap-4 pt-4">
              {trustItems.map((item) => (
                <div
                  key={item.label}
                  className="flex items-center gap-2 text-sm text-slate-400"
                >
                  <item.icon className="w-4 h-4 text-indigo-400" />
                  {item.label}
                </div>
              ))}
            </div>
          </motion.div>

          {/* Right — floating product mockup */}
          <motion.div
            initial={{ opacity: 0, x: 40 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="relative hidden lg:block"
          >
            <div className="relative rounded-2xl border border-white/10 bg-white/5 backdrop-blur-xl p-6 shadow-2xl">
              <div className="flex items-center gap-2 mb-6">
                <div className="w-3 h-3 rounded-full bg-red-400/80" />
                <div className="w-3 h-3 rounded-full bg-yellow-400/80" />
                <div className="w-3 h-3 rounded-full bg-green-400/80" />
                <span className="ml-3 text-xs text-slate-500">Talora Dashboard</span>
              </div>

              <div className="space-y-4">
                <div className="grid grid-cols-3 gap-3">
                  {['Applications', 'Interviews', 'Hires'].map((label, i) => (
                    <div key={label} className="rounded-xl bg-white/5 border border-white/10 p-4">
                      <div className="text-2xl font-bold text-white">{[128, 34, 12][i]}</div>
                      <div className="text-xs text-slate-400 mt-1">{label}</div>
                    </div>
                  ))}
                </div>

                <div className="rounded-xl bg-white/5 border border-white/10 p-4 space-y-3">
                  <div className="text-sm font-medium text-slate-300">Recent Applications</div>
                  {['Senior React Developer', 'Product Designer', 'Data Analyst'].map((role, i) => (
                    <div key={role} className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-gradient-to-br from-indigo-500 to-violet-500 flex items-center justify-center text-xs text-white font-bold">
                          {['JD', 'SK', 'AM'][i]}
                        </div>
                        <span className="text-sm text-slate-300">{role}</span>
                      </div>
                      <span className="text-xs font-medium text-emerald-400">{[92, 87, 78][i]}% match</span>
                    </div>
                  ))}
                </div>

                <div className="h-24 rounded-xl bg-gradient-to-r from-indigo-600/20 to-violet-600/20 border border-indigo-500/20 flex items-center justify-center">
                  <span className="text-sm text-indigo-300 font-medium">AI Match Score Active</span>
                </div>
              </div>
            </div>

            {/* Floating badge */}
            <motion.div
              animate={{ y: [0, -8, 0] }}
              transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
              className="absolute -top-4 -right-4 px-4 py-2 rounded-xl bg-emerald-500/90 text-white text-sm font-semibold shadow-lg"
            >
              94% Match Rate
            </motion.div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
