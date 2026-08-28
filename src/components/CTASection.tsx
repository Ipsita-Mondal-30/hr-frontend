import Link from 'next/link';
import { ArrowRight } from 'lucide-react';

export function CTASection() {
  return (
    <section className="py-24 bg-slate-950 relative overflow-hidden">
      <div className="absolute inset-0">
        <div className="absolute top-0 left-1/3 w-64 h-64 bg-indigo-600/20 rounded-full blur-[100px]" />
        <div className="absolute bottom-0 right-1/3 w-64 h-64 bg-violet-600/15 rounded-full blur-[100px]" />
      </div>

      <div className="relative z-10 max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        <h2 className="text-4xl lg:text-5xl font-bold text-white mb-6 leading-tight">
          Ready to transform
          <br />
          <span className="bg-gradient-to-r from-indigo-400 to-violet-400 bg-clip-text text-transparent">
            how you hire?
          </span>
        </h2>

        <p className="text-lg text-slate-400 mb-10 max-w-2xl mx-auto">
          Join thousands of teams using Talora to find talent, manage hiring, and grow their
          organizations — all in one platform.
        </p>

        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Link
            href="/login"
            className="group inline-flex items-center justify-center gap-2 px-8 py-4 bg-indigo-600 hover:bg-indigo-500 text-white font-semibold rounded-xl transition-all duration-300 shadow-lg shadow-indigo-600/25"
          >
            Get Started Free
            <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
          </Link>
          <Link
            href="/jobs"
            className="inline-flex items-center justify-center px-8 py-4 border border-white/15 text-white font-semibold rounded-xl hover:bg-white/5 transition-all duration-300"
          >
            Explore Open Roles
          </Link>
        </div>
      </div>
    </section>
  );
}
