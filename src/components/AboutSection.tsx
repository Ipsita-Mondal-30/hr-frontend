export function AboutSection() {
    return (
      <section className="py-24 bg-gradient-to-b from-gray-50 to-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
            
            {/* Left Content */}
            <div className="space-y-8">
              <div className="space-y-4">
                <div className="inline-flex items-center px-4 py-2 rounded-full bg-purple-100 text-purple-700 text-sm font-medium">
                  <span className="w-2 h-2 bg-purple-500 rounded-full mr-2"></span>
                  About us
                </div>
                
                <h2 className="text-4xl lg:text-5xl font-bold text-gray-900 leading-tight">
                  Meet Talora: Your Design
                  <br />
                  <span className="text-purple-600">Partners</span>
                </h2>
                
                <p className="text-lg text-gray-600 leading-relaxed">
                We’re not just building a hiring platform; we’re crafting a complete ecosystem for candidates, HRs, employees, and admins. Since day one, our focus has been clear: to redefine recruitment through innovation, transparency, and seamless digital experiences.

Our approach blends deep insights into career journeys with cutting-edge technology, ensuring that opportunities are not just discovered but truly aligned with aspirations. Whether it’s a candidate seeking the right role, an HR managing applications, or an admin driving growth—we make careers thrive.
                </p>
              </div>
  
              {/* Stats Card */}
              <div className="bg-gradient-to-br from-gray-900 to-gray-800 rounded-3xl p-8 text-white relative overflow-hidden">
                <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-purple-500/20 to-transparent rounded-full -mr-16 -mt-16"></div>
                
                <div className="relative z-10">
                  <div className="text-5xl font-bold mb-2">40%</div>
                  <div className="text-gray-300 mb-4">Where Talent Meets the Right Opportunity.</div>
                  
                  <div className="grid grid-cols-3 gap-4">
                    <div className="text-center">
                      <div className="bg-white/10 backdrop-blur-sm rounded-xl py-3 px-4">
                        <div className="text-sm font-medium">Seamless Collaboration Between HR & Candidates</div>
                      </div>
                    </div>
                    <div className="text-center">
                      <div className="bg-white/10 backdrop-blur-sm rounded-xl py-3 px-4">
                        <div className="text-sm font-medium">Career Growth Tools for Employees</div>
                      </div>
                    </div>
                    <div className="text-center">

                    </div>
                  </div>
                </div>
  
                {/* Team Photos */}
                <div className="absolute bottom-4 right-4 flex -space-x-3">
                  <div className="w-12 h-12 bg-gradient-to-br from-purple-400 to-pink-400 rounded-full border-2 border-white"></div>
                  <div className="w-12 h-12 bg-gradient-to-br from-cyan-400 to-blue-400 rounded-full border-2 border-white"></div>
                  <div className="w-12 h-12 bg-gradient-to-br from-green-400 to-emerald-400 rounded-full border-2 border-white"></div>
                </div>
              </div>
            </div>
  
            {/* Right Content - Team Images */}
            <div className="relative">
              <div className="grid grid-cols-2 gap-6">
                <div className="space-y-6">
                  <div className="bg-gray-200 rounded-3xl h-48 overflow-hidden">
                    <img 
                      src="https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?ixlib=rb-4.0.3&auto=format&fit=crop&w=500&q=80"
                      alt="Team member"
                      className="w-full h-full object-cover hover:scale-110 transition-transform duration-500"
                    />
                  </div>
                  <div className="bg-gray-200 rounded-3xl h-32 overflow-hidden">
                    <img 
                      src="https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?ixlib=rb-4.0.3&auto=format&fit=crop&w=500&q=80"
                      alt="Team member"
                      className="w-full h-full object-cover hover:scale-110 transition-transform duration-500"
                    />
                  </div>
                </div>
                
                <div className="space-y-6 pt-12">
                  <div className="bg-gray-200 rounded-3xl h-32 overflow-hidden">
                    <img 
                      src="https://images.unsplash.com/photo-1494790108755-2616b612b77c?ixlib=rb-4.0.3&auto=format&fit=crop&w=500&q=80"
                      alt="Team member"
                      className="w-full h-full object-cover hover:scale-110 transition-transform duration-500"
                    />
                  </div>
                  <div className="bg-gray-200 rounded-3xl h-48 overflow-hidden">
                    <img 
                      src="https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?ixlib=rb-4.0.3&auto=format&fit=crop&w=500&q=80"
                      alt="Team member"
                      className="w-full h-full object-cover hover:scale-110 transition-transform duration-500"
                    />
                  </div>
                </div>
              </div>
  
              {/* Floating Elements */}
              <div className="absolute -top-6 -right-6 w-20 h-20 bg-purple-100 rounded-2xl rotate-12 flex items-center justify-center">
                <svg className="w-8 h-8 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                </svg>
              </div>
              
              <div className="absolute -bottom-4 -left-4 w-16 h-16 bg-yellow-100 rounded-2xl -rotate-12 flex items-center justify-center">
                <svg className="w-6 h-6 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                </svg>
              </div>
            </div>
          </div>
        </div>
      </section>
    );
  }