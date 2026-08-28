'use client';

import React from 'react';
import Link from 'next/link';
import { motion } from 'motion/react';
import { Search, Briefcase, Shield, Users, ArrowRight } from 'lucide-react';

const roleData = [
  {
    title: 'Candidate',
    subtitle: 'Job Seeker',
    description: 'Find roles, apply, track applications, and prep for interviews.',
    icon: Search,
    color: 'from-sky-500 to-blue-600',
    borderHover: 'hover:border-sky-200',
    features: ['AI job matching', 'Application tracking', 'Interview prep'],
    ctaText: 'Sign in as Candidate',
    ctaLink: '/login',
  },
  {
    title: 'HR',
    subtitle: 'Recruiter',
    description: 'Post jobs, review applications, schedule interviews, and run analytics.',
    icon: Briefcase,
    color: 'from-emerald-500 to-teal-600',
    borderHover: 'hover:border-emerald-200',
    features: ['Job posting', 'Candidate pipeline', 'Interview scheduling'],
    ctaText: 'Sign in as HR',
    ctaLink: '/login',
  },
  {
    title: 'Admin',
    subtitle: 'Platform Owner',
    description: 'Verify HR accounts, approve jobs, and manage the entire platform.',
    icon: Shield,
    color: 'from-indigo-500 to-violet-600',
    borderHover: 'hover:border-indigo-200',
    features: ['User management', 'Job approvals', 'System analytics'],
    ctaText: 'Sign in as Admin',
    ctaLink: '/login',
  },
  {
    title: 'Employee',
    subtitle: 'Team Member',
    description: 'Access projects, performance reviews, payroll, and team collaboration.',
    icon: Users,
    color: 'from-orange-500 to-amber-600',
    borderHover: 'hover:border-orange-200',
    features: ['Project tracking', 'Performance reviews', 'Payroll access'],
    ctaText: 'Sign in as Employee',
    ctaLink: '/login',
  },
];

export function RoleCards3D() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      {roleData.map((role, index) => (
        <motion.div
          key={role.title}
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-40px' }}
          transition={{ duration: 0.5, delay: index * 0.1 }}
          className={`group relative rounded-2xl border border-slate-200 bg-white/80 backdrop-blur-sm p-8 ${role.borderHover} hover:shadow-lg hover:-translate-y-1 transition-all duration-300`}
        >
          <div className="flex items-start justify-between mb-6">
            <div className={`p-3 rounded-xl bg-gradient-to-br ${role.color}`}>
              <role.icon className="w-6 h-6 text-white" />
            </div>
            <span className="text-xs font-medium text-slate-400 uppercase tracking-wider">
              {role.subtitle}
            </span>
          </div>

          <h3 className="text-2xl font-bold text-slate-900 mb-2">{role.title}</h3>
          <p className="text-slate-500 mb-6 leading-relaxed">{role.description}</p>

          <ul className="space-y-2 mb-8">
            {role.features.map((feature) => (
              <li key={feature} className="flex items-center gap-2 text-sm text-slate-600">
                <span className="w-1.5 h-1.5 rounded-full bg-indigo-400" />
                {feature}
              </li>
            ))}
          </ul>

          <Link
            href={role.ctaLink}
            className={`inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-gradient-to-r ${role.color} text-white text-sm font-semibold hover:shadow-lg transition-all duration-300`}
          >
            {role.ctaText}
            <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
          </Link>
        </motion.div>
      ))}
    </div>
  );
}
