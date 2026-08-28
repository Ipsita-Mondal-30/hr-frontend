'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Star, ChevronLeft, ChevronRight } from 'lucide-react';

const testimonials = [
  {
    quote:
      'Talora transformed our hiring process. AI matching is incredibly accurate and we reduced time-to-hire by 60%.',
    author: 'Sarah Chen',
    position: 'Head of Talent Acquisition',
    company: 'TechFlow Solutions',
    role: 'HR',
    initials: 'SC',
    color: 'from-indigo-500 to-violet-500',
  },
  {
    quote:
      'The analytics dashboard gives us insights we never had. We can predict hiring trends and make data-driven decisions.',
    author: 'Marcus Rodriguez',
    position: 'VP of Human Resources',
    company: 'Innovation Labs',
    role: 'Admin',
    initials: 'MR',
    color: 'from-sky-500 to-blue-500',
  },
  {
    quote:
      'As a candidate, the experience was exceptional. Smooth applications, transparent communication, and great interview prep tools.',
    author: 'Emily Watson',
    position: 'Software Engineer',
    company: 'CloudTech Inc',
    role: 'Candidate',
    initials: 'EW',
    color: 'from-emerald-500 to-teal-500',
  },
];

export function TestimonialsSection() {
  const [active, setActive] = useState(0);

  const prev = () => setActive((i) => (i === 0 ? testimonials.length - 1 : i - 1));
  const next = () => setActive((i) => (i === testimonials.length - 1 ? 0 : i + 1));

  return (
    <section className="py-24 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-indigo-50 text-indigo-700 text-sm font-medium mb-6">
            <span className="w-2 h-2 rounded-full bg-indigo-500" />
            Testimonials
          </div>
          <h2 className="text-4xl lg:text-5xl font-bold text-slate-900 mb-4">
            Loved by teams everywhere
          </h2>
          <p className="text-lg text-slate-500 max-w-2xl mx-auto">
            See what HR leaders, admins, and candidates say about Talora.
          </p>
        </div>

        <div className="relative max-w-3xl mx-auto">
          <AnimatePresence mode="wait">
            <motion.div
              key={active}
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -16 }}
              transition={{ duration: 0.3 }}
              className="bg-slate-50 rounded-2xl border border-slate-100 p-10 md:p-12"
            >
              <div className="flex gap-1 mb-6">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} className="w-5 h-5 text-amber-400 fill-amber-400" />
                ))}
              </div>

              <p className="text-xl text-slate-700 leading-relaxed mb-8">
                &ldquo;{testimonials[active].quote}&rdquo;
              </p>

              <div className="flex items-center gap-4">
                <div
                  className={`w-12 h-12 rounded-full bg-gradient-to-br ${testimonials[active].color} flex items-center justify-center text-white font-bold text-sm`}
                >
                  {testimonials[active].initials}
                </div>
                <div>
                  <div className="font-semibold text-slate-900">{testimonials[active].author}</div>
                  <div className="text-sm text-slate-500">
                    {testimonials[active].position} · {testimonials[active].company}
                  </div>
                </div>
                <span className="ml-auto px-3 py-1 rounded-full bg-indigo-50 text-indigo-600 text-xs font-medium">
                  {testimonials[active].role}
                </span>
              </div>
            </motion.div>
          </AnimatePresence>

          <div className="flex items-center justify-center gap-4 mt-8">
            <button
              onClick={prev}
              className="p-2 rounded-full border border-slate-200 hover:bg-slate-50 transition-colors"
              aria-label="Previous testimonial"
            >
              <ChevronLeft className="w-5 h-5 text-slate-600" />
            </button>
            <div className="flex gap-2">
              {testimonials.map((_, i) => (
                <button
                  key={i}
                  onClick={() => setActive(i)}
                  className={`w-2.5 h-2.5 rounded-full transition-all ${
                    i === active ? 'bg-indigo-600 scale-125' : 'bg-slate-300 hover:bg-indigo-300'
                  }`}
                  aria-label={`Go to testimonial ${i + 1}`}
                />
              ))}
            </div>
            <button
              onClick={next}
              className="p-2 rounded-full border border-slate-200 hover:bg-slate-50 transition-colors"
              aria-label="Next testimonial"
            >
              <ChevronRight className="w-5 h-5 text-slate-600" />
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}
