'use client';

import { motion } from 'motion/react';

const steps = [
  {
    number: '01',
    title: 'Discover',
    description:
      'Candidates create profiles and browse AI-matched roles. HR posts jobs and defines requirements.',
    color: 'bg-indigo-600',
  },
  {
    number: '02',
    title: 'Connect',
    description:
      'Applications flow through a structured pipeline — review, shortlist, schedule interviews, and collaborate.',
    color: 'bg-violet-600',
  },
  {
    number: '03',
    title: 'Grow',
    description:
      'From hire to onboarding, employees access projects, performance reviews, and payroll — all in Talora.',
    color: 'bg-sky-600',
  },
];

export function ProcessSection() {
  return (
    <section className="py-24 bg-slate-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white border border-slate-200 text-slate-600 text-sm font-medium mb-6">
            <span className="w-2 h-2 rounded-full bg-indigo-500" />
            How it works
          </div>
          <h2 className="text-4xl lg:text-5xl font-bold text-slate-900 mb-4">
            Three steps to better hiring
          </h2>
          <p className="text-lg text-slate-500 max-w-2xl mx-auto">
            A streamlined process from job discovery to employee growth.
          </p>
        </div>

        <div className="relative">
          {/* Horizontal connector line */}
          <div className="hidden md:block absolute top-10 left-[16.67%] right-[16.67%] h-0.5 bg-gradient-to-r from-indigo-200 via-violet-200 to-sky-200" />

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {steps.map((step, index) => (
              <motion.div
                key={step.number}
                initial={{ opacity: 0, y: 24 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: index * 0.15 }}
                className="relative text-center"
              >
                <div className="flex justify-center mb-6">
                  <div
                    className={`relative z-10 w-20 h-20 ${step.color} rounded-2xl flex items-center justify-center text-white font-bold text-xl shadow-lg`}
                  >
                    {step.number}
                  </div>
                </div>
                <h3 className="text-xl font-bold text-slate-900 mb-3">{step.title}</h3>
                <p className="text-slate-500 leading-relaxed max-w-xs mx-auto">{step.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
