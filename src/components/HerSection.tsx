import Link from "next/link";
import { useState, useEffect } from 'react';

export function ModernHeroSection() {
  const [currentSlide, setCurrentSlide] = useState(0);
  
  const images = [
    "https://images.unsplash.com/photo-1497032205916-ac775f0649ae?ixlib=rb-4.0.3&auto=format&fit=crop&w=2070&q=80",
    "https://images.unsplash.com/photo-1559136555-9303baea8ebd?ixlib=rb-4.0.3&auto=format&fit=crop&w=2070&q=80",
    "https://images.unsplash.com/photo-1504384308090-c894fdcc538d?ixlib=rb-4.0.3&auto=format&fit=crop&w=2070&q=80",
    "https://images.unsplash.com/photo-1573164713714-d95e436ab8d6?ixlib=rb-4.0.3&auto=format&fit=crop&w=2069&q=80",
  ];

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % images.length);
    }, 5000);
    return () => clearInterval(timer);
  }, []);

  return (
    <section className="relative min-h-[90vh] overflow-hidden bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
      {/* Background Images with Parallax Effect */}
      <div className="absolute inset-0">
        {images.map((image, index) => (
          <div
            key={index}
            className={`absolute inset-0 transition-opacity duration-1000 ${
              index === currentSlide ? 'opacity-30' : 'opacity-0'
            }`}
          >
            <div
              className="w-full h-full bg-cover bg-center bg-no-repeat transform scale-110 transition-transform duration-[10s] ease-out"
              style={{ backgroundImage: `url(${image})` }}
            />
          </div>
        ))}
      </div>

      {/* Gradient Overlays */}
      <div className="absolute inset-0 bg-gradient-to-r from-purple-900/80 via-slate-900/60 to-indigo-900/80" />
      <div className="absolute inset-0 bg-gradient-to-t from-slate-900/50 via-transparent to-slate-900/30" />

      {/* Content Container */}
      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-full min-h-[90vh] flex items-center">
        <div className="w-full grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          
          {/* Left Content */}
          <div className="text-white space-y-8 animate-in slide-in-from-left duration-1000">
            <div className="space-y-2">
              <div className="inline-flex items-center px-3 py-1 rounded-full bg-white/10 backdrop-blur-sm border border-white/20 text-sm font-medium text-white/90 mb-4">
                <span className="w-2 h-2 bg-green-400 rounded-full mr-2 animate-pulse"></span>
                Welcome to Talora
              </div>
              
              <h1 className="text-5xl lg:text-7xl font-bold leading-tight">
                WE CRAFT{' '}
                <span className="bg-gradient-to-r from-cyan-400 via-purple-400 to-pink-400 bg-clip-text text-transparent">
                  CAREERS
                </span>
                <br />
                & DIGITAL<br />
                <span className="bg-gradient-to-r from-purple-400 via-pink-400 to-cyan-400 bg-clip-text text-transparent">
                  EXPERIENCES
                </span>
              </h1>
            </div>
            
            <p className="text-xl text-gray-300 leading-relaxed max-w-2xl">
              Experience Next-Level Recruitment Solutions. From AI-powered matching 
              to seamless candidate management - We're redefining how talent meets opportunity.
            </p>

            <div className="flex flex-col sm:flex-row gap-4">
              <Link
                href="/login"
                className="group relative px-8 py-4 bg-gradient-to-r from-purple-600 via-purple-700 to-indigo-700 rounded-2xl text-white font-semibold text-lg hover:from-purple-700 hover:via-purple-800 hover:to-indigo-800 transition-all duration-300 transform hover:scale-105 hover:shadow-2xl hover:shadow-purple-500/25"
              >
                <span className="relative z-10 flex items-center">
                  Solutions for Brand Identity
                  <svg className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform duration-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                  </svg>
                </span>
                <div className="absolute inset-0 bg-gradient-to-r from-white/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-2xl" />
              </Link>
              
              <button className="px-8 py-4 border-2 border-white/20 rounded-2xl text-white font-semibold text-lg hover:bg-white/10 hover:border-white/30 transition-all duration-300 backdrop-blur-sm">
                Let's Talk
              </button>
            </div>

            {/* Trust Indicators */}
            <div className="flex items-center space-x-8 pt-8 opacity-80">
              <div className="text-center">
                <div className="text-2xl font-bold text-white">500+</div>
                <div className="text-sm text-gray-400">Companies</div>
              </div>
              <div className="w-px h-8 bg-white/20"></div>
              <div className="text-center">
                <div className="text-2xl font-bold text-white">10k+</div>
                <div className="text-sm text-gray-400">Candidates</div>
              </div>
              <div className="w-px h-8 bg-white/20"></div>
              <div className="text-center">
                <div className="text-2xl font-bold text-white">95%</div>
                <div className="text-sm text-gray-400">Success Rate</div>
              </div>
            </div>
          </div>

          {/* Right Content - Feature Cards */}
          <div className="relative lg:block hidden">
            <div className="relative z-10 space-y-6">
              {/* Main Feature Card */}
              <div className="bg-white/10 backdrop-blur-lg border border-white/20 rounded-3xl p-8 transform rotate-3 hover:rotate-0 transition-transform duration-500">
                <div className="flex items-start space-x-4">
                  <div className="w-12 h-12 bg-gradient-to-r from-purple-500 to-pink-500 rounded-xl flex items-center justify-center">
                    <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                    </svg>
                  </div>
                  <div>
                    <h3 className="text-white font-semibold text-lg mb-2">AI-Powered Matching</h3>
                    <p className="text-gray-300 text-sm">Smart algorithms connect the right talent with perfect opportunities instantly.</p>
                  </div>
                </div>
              </div>

              {/* Secondary Feature Card */}
              <div className="bg-white/10 backdrop-blur-lg border border-white/20 rounded-3xl p-8 transform -rotate-2 hover:rotate-0 transition-transform duration-500 ml-8">
                <div className="flex items-start space-x-4">
                  <div className="w-12 h-12 bg-gradient-to-r from-cyan-500 to-blue-500 rounded-xl flex items-center justify-center">
                    <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                    </svg>
                  </div>
                  <div>
                    <h3 className="text-white font-semibold text-lg mb-2">Analytics Dashboard</h3>
                    <p className="text-gray-300 text-sm">Comprehensive insights and metrics to optimize your hiring strategy.</p>
                  </div>
                </div>
              </div>

              {/* Third Feature Card */}
              <div className="bg-white/10 backdrop-blur-lg border border-white/20 rounded-3xl p-6 transform rotate-1 hover:rotate-0 transition-transform duration-500 mr-8">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-gradient-to-r from-green-500 to-emerald-500 rounded-lg flex items-center justify-center">
                    <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                  </div>
                  <div>
                    <h4 className="text-white font-medium">Real-time Collaboration</h4>
                    <p className="text-gray-300 text-xs">Seamless team workflows</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Floating Elements */}
            <div className="absolute -top-4 -right-4 w-24 h-24 bg-gradient-to-r from-purple-400 to-pink-400 rounded-full opacity-20 animate-pulse"></div>
            <div className="absolute -bottom-8 -left-4 w-16 h-16 bg-gradient-to-r from-cyan-400 to-blue-400 rounded-full opacity-20 animate-ping"></div>
          </div>
        </div>
      </div>

      {/* Slide Indicators */}
      <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 flex space-x-2 z-10">
        {images.map((_, index) => (
          <button
            key={index}
            onClick={() => setCurrentSlide(index)}
            className={`w-3 h-3 rounded-full transition-all duration-300 ${
              index === currentSlide 
                ? 'bg-white shadow-lg' 
                : 'bg-white/30 hover:bg-white/50'
            }`}
          />
        ))}
      </div>

      {/* Scroll Indicator */}
      <div className="absolute bottom-8 right-8 z-10">
        <div className="flex flex-col items-center text-white/60 animate-bounce">
          <span className="text-xs mb-2 rotate-90 origin-center whitespace-nowrap">Scroll down</span>
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 14l-7 7m0 0l-7-7m7 7V3" />
          </svg>
        </div>
      </div>
    </section>
  );
}