'use client';
export default function HeroSection() {
  return (
    <section className="bg-blue-50 py-20 text-center px-4">
      <h1 className="text-4xl font-bold text-gray-900 mb-4">
        Smarter Hiring Starts Here
      </h1>
      <p className="text-lg text-gray-600 mb-6">
        AI-powered recruitment platform for HRs, Admins, and Candidates.
      </p>
      <a
        href="/api/auth/google"
        className="bg-blue-600 text-white px-6 py-3 rounded-full hover:bg-blue-700 transition"
      >
        Get Started
      </a>
    </section>
  );
}
