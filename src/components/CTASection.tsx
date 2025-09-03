import Link from "next/link";

export function CTASection() {
  return (
    <section className="py-16 bg-gradient-to-br from-gray-900 via-purple-900 to-gray-900 relative overflow-hidden">
      {/* Subtle Background Elements */}
      <div className="absolute inset-0">
        <div className="absolute top-0 left-1/3 w-64 h-64 bg-purple-500/10 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-0 right-1/3 w-64 h-64 bg-cyan-500/10 rounded-full blur-3xl animate-pulse delay-1000"></div>
      </div>

      {/* Refined Grid Pattern Overlay */}
      <div className="absolute inset-0 opacity-5">
        <div
          className="w-full h-full"
          style={{
            backgroundImage: `radial-gradient(circle at 1px 1px, rgba(255,255,255,0.3) 1px, transparent 0)`,
            backgroundSize: "40px 40px",
          }}
        ></div>
      </div>

      <div className="relative z-10 max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        {/* Main Content */}
        <div className="space-y-8">
          {/* Refined Badge */}
          <div className="inline-flex items-center px-5 py-2 rounded-full bg-white/10 backdrop-blur-sm border border-white/20 text-white font-medium text-sm">
            <span className="w-2 h-2 bg-green-400 rounded-full mr-3 animate-pulse"></span>
            Ready to get started?
          </div>

          {/* Streamlined Headline */}
          <h2 className="text-4xl lg:text-6xl font-bold text-white leading-tight">
            Transform Your
            <br />
            <span className="bg-gradient-to-r from-cyan-400 via-purple-400 to-pink-400 bg-clip-text text-transparent">
              Hiring Experience
            </span>
          </h2>

          {/* Concise Description */}
          <p className="text-lg text-gray-300 leading-relaxed max-w-2xl mx-auto">
            Join thousands of companies using Talora to streamline recruitment 
            and make smarter hiring decisions. Start your free trial today.
          </p>

          {/* Streamlined CTA Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center pt-6">
            <Link
              href="/login"
              className="group relative px-8 py-4 bg-gradient-to-r from-purple-600 via-purple-700 to-indigo-700 rounded-2xl text-white font-semibold text-lg hover:from-purple-700 hover:via-purple-800 hover:to-indigo-800 transition-all duration-300 transform hover:scale-105 hover:shadow-xl hover:shadow-purple-500/25 overflow-hidden"
            >
              <span className="relative z-10 flex items-center">
                Start Now
                <svg
                  className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform duration-300"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M17 8l4 4m0 0l-4 4m4-4H3"
                  />
                </svg>
              </span>
              <div className="absolute inset-0 bg-gradient-to-r from-white/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
              <div className="absolute -inset-1 bg-gradient-to-r from-purple-600 to-indigo-600 rounded-2xl blur opacity-30 group-hover:opacity-50 transition duration-300 -z-10" />
            </Link>
          </div>

          {/* Compact Trust Section */}
          <div className="pt-12 space-y-6">


            <div className="flex justify-center items-center space-x-8 opacity-40">
              {/* Simplified company placeholders */}
              
            </div>

            {/* Compact Stats */}
            <div className="grid grid-cols-3 gap-6 pt-8 border-t border-white/10 max-w-md mx-auto">
              <div className="text-center">
                <div className="text-xl font-bold text-white mb-1">24/7</div>
                <div className="text-gray-400 text-xs">Support</div>
              </div>
              <div className="text-center">
                <div className="text-xl font-bold text-white mb-1">99.9%</div>
                <div className="text-gray-400 text-xs">Uptime</div>
              </div>
              <div className="text-center">
                <div className="text-xl font-bold text-white mb-1">Free</div>
                <div className="text-gray-400 text-xs">Trial</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Minimal Floating Elements */}
      <div className="absolute top-16 left-16 w-3 h-3 bg-cyan-400 rounded-full opacity-40 animate-bounce"></div>
      <div className="absolute top-32 right-24 w-2 h-2 bg-purple-400 rounded-full opacity-40 animate-bounce delay-300"></div>
      <div className="absolute bottom-24 left-24 w-3 h-3 bg-pink-400 rounded-full opacity-40 animate-bounce delay-700"></div>
      <div className="absolute bottom-16 right-16 w-2 h-2 bg-yellow-400 rounded-full opacity-40 animate-bounce delay-1000"></div>
    </section>
  );
}