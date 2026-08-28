'use client';

import { useState, useEffect, useRef } from 'react';
import { motion } from 'motion/react';
import { CheckCircle2 } from 'lucide-react';

const highlights = [
  'AI-powered candidate matching',
  'End-to-end hiring workflow',
  'Role-based dashboards for every user',
  'Interview prep and voice practice',
];

export function AboutSection() {
  const [videoError, setVideoError] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    if (videoRef.current) {
      videoRef.current.play().catch(() => {});
    }
  }, []);

  return (
    <section className="py-24 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="space-y-8"
          >
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-indigo-50 text-indigo-700 text-sm font-medium">
              <span className="w-2 h-2 rounded-full bg-indigo-500" />
              About Talora
            </div>

            <h2 className="text-4xl lg:text-5xl font-bold text-slate-900 leading-tight">
              Built for the entire
              <br />
              <span className="text-indigo-600">hiring ecosystem</span>
            </h2>

            <p className="text-lg text-slate-500 leading-relaxed">
              Talora isn&apos;t just another job board. It&apos;s a complete platform where candidates
              discover opportunities, HR teams manage the full hiring pipeline, employees track
              performance, and admins maintain platform quality — all in one place.
            </p>

            <ul className="space-y-3">
              {highlights.map((item) => (
                <li key={item} className="flex items-center gap-3 text-slate-600">
                  <CheckCircle2 className="w-5 h-5 text-indigo-500 flex-shrink-0" />
                  {item}
                </li>
              ))}
            </ul>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: 30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.15 }}
            className="relative"
          >
            <div className="relative rounded-2xl overflow-hidden shadow-2xl border border-slate-200 bg-slate-900">
              {!videoError ? (
                <video
                  ref={videoRef}
                  autoPlay
                  loop
                  muted
                  playsInline
                  preload="auto"
                  className="w-full h-auto"
                  onError={() => setVideoError(true)}
                >
                  <source src="/Talora.mp4" type="video/mp4" />
                </video>
              ) : (
                <div className="aspect-video flex items-center justify-center bg-gradient-to-br from-indigo-900 to-slate-900 p-12">
                  <div className="text-center text-white">
                    <div className="text-5xl font-bold mb-2">Talora</div>
                    <p className="text-indigo-200">Where talent meets opportunity</p>
                  </div>
                </div>
              )}
              <div className="absolute inset-0 bg-gradient-to-t from-slate-900/40 via-transparent to-transparent pointer-events-none" />
            </div>

            <div className="absolute -bottom-6 -left-6 bg-white rounded-2xl shadow-xl border border-slate-100 p-5">
              <div className="text-3xl font-bold text-indigo-600">40%</div>
              <div className="text-sm text-slate-500">Faster time-to-hire</div>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
