'use client';

import { motion } from 'motion/react';
import {
  Brain,
  Mic,
  BarChart3,
  Wallet,
  LayoutDashboard,
  ShieldCheck,
} from 'lucide-react';

const features = [
  {
    icon: Brain,
    title: 'AI Resume Scoring',
    description: 'Automatically match candidates to roles with intelligent resume analysis and fit scores.',
    span: 'lg:col-span-2',
    accent: 'from-indigo-500 to-violet-600',
  },
  {
    icon: Mic,
    title: 'Voice Interview Prep',
    description: 'Practice with AI-powered mock interviews and get real-time feedback.',
    span: '',
    accent: 'from-sky-500 to-blue-600',
  },
  {
    icon: BarChart3,
    title: 'HR Analytics',
    description: 'Track hiring funnel, time-to-hire, and team performance at a glance.',
    span: '',
    accent: 'from-violet-500 to-purple-600',
  },
  {
    icon: Wallet,
    title: 'Payroll Management',
    description: 'Process salaries, approvals, and payment tracking in one place.',
    span: '',
    accent: 'from-emerald-500 to-teal-600',
  },
  {
    icon: LayoutDashboard,
    title: 'Role-Based Dashboards',
    description: 'Tailored experiences for candidates, HR, employees, and admins.',
    span: '',
    accent: 'from-orange-500 to-amber-600',
  },
  {
    icon: ShieldCheck,
    title: 'Admin Approvals',
    description: 'Verify HR accounts and approve job postings before they go live.',
    span: 'lg:col-span-2',
    accent: 'from-rose-500 to-pink-600',
  },
];

export function FeaturesSection() {
  return (
    <section className="py-24 bg-slate-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-indigo-50 text-indigo-700 text-sm font-medium mb-6">
            <span className="w-2 h-2 rounded-full bg-indigo-500" />
            Platform Features
          </div>
          <h2 className="text-4xl lg:text-5xl font-bold text-slate-900 mb-4">
            Everything you need to hire and grow
          </h2>
          <p className="text-lg text-slate-500 max-w-2xl mx-auto">
            Powerful tools for every role in your hiring ecosystem, powered by AI.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {features.map((feature, index) => (
            <motion.div
              key={feature.title}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: '-40px' }}
              transition={{ duration: 0.4, delay: index * 0.08 }}
              className={`group relative rounded-2xl border border-slate-200 bg-white p-8 hover:shadow-lg hover:border-indigo-100 hover:-translate-y-1 transition-all duration-300 ${feature.span}`}
            >
              <div className={`inline-flex p-3 rounded-xl bg-gradient-to-br ${feature.accent} mb-5`}>
                <feature.icon className="w-6 h-6 text-white" />
              </div>
              <h3 className="text-xl font-bold text-slate-900 mb-2">{feature.title}</h3>
              <p className="text-slate-500 leading-relaxed">{feature.description}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
