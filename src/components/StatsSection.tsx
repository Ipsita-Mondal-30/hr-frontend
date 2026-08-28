'use client';

import { motion } from 'motion/react';
import { Briefcase, Users, Calendar, Target } from 'lucide-react';

const stats = [
  { icon: Briefcase, value: '500+', label: 'Jobs Posted', color: 'text-indigo-600', bg: 'bg-indigo-50' },
  { icon: Users, value: '2,400+', label: 'Active Candidates', color: 'text-violet-600', bg: 'bg-violet-50' },
  { icon: Calendar, value: '1,200+', label: 'Interviews Scheduled', color: 'text-sky-600', bg: 'bg-sky-50' },
  { icon: Target, value: '94%', label: 'Match Accuracy', color: 'text-emerald-600', bg: 'bg-emerald-50' },
];

export function StatsSection() {
  return (
    <section className="py-16 bg-white border-b border-slate-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
          {stats.map((stat, index) => (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: '-40px' }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              className="group relative rounded-2xl border border-slate-100 bg-white p-6 shadow-sm hover:shadow-md hover:border-indigo-100 transition-all duration-300"
            >
              <div className={`inline-flex p-3 rounded-xl ${stat.bg} mb-4`}>
                <stat.icon className={`w-6 h-6 ${stat.color}`} />
              </div>
              <div className="text-3xl font-bold text-slate-900 mb-1">{stat.value}</div>
              <div className="text-sm text-slate-500 font-medium">{stat.label}</div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
