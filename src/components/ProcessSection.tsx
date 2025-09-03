export function ProcessSection() {
    const steps = [
      {
        number: "01",
        title: "Define",
        description: "We start by understanding your business goals, target audience, and project requirements. Through detailed research and stakeholder interviews, we establish a clear roadmap for success.",
        color: "from-purple-500 to-indigo-500"
      },
      {
        number: "02", 
        title: "Design",
        description: "Our design team crafts beautiful, user-centered experiences that align with your brand. We focus on creating interfaces that are both visually stunning and highly functional.",
        color: "from-pink-500 to-purple-500"
      },
      {
        number: "03",
        title: "Launch",
        description: "With rigorous testing and quality assurance, we ensure your product launches flawlessly. We provide ongoing support and optimization to guarantee continued success.",
        color: "from-cyan-500 to-blue-500"
      }
    ];
  
    return (
      <section className="py-24 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          
          {/* Section Header */}
          <div className="text-center mb-20">
            <div className="inline-flex items-center px-4 py-2 rounded-full bg-gray-100 text-gray-700 text-sm font-medium mb-6">
              <span className="w-2 h-2 bg-gray-500 rounded-full mr-2"></span>
              How we work
            </div>
            
            <h2 className="text-4xl lg:text-5xl font-bold text-gray-900 mb-6">
              Let us show you how we drive
              <br />
              your brand to new heights
            </h2>
            
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Our proven three-step process ensures every project delivers exceptional results 
              that exceed expectations and drive meaningful business growth.
            </p>
          </div>
  
          {/* Process Cards */}
          <div className="relative">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {steps.map((step, index) => (
                <div key={index} className="relative group">
                  {/* Connection Line (hidden on mobile) */}
                  {index < steps.length - 1 && (
                    <div className="hidden md:block absolute top-24 left-full w-full h-0.5 bg-gradient-to-r from-gray-200 to-gray-100 z-0">
                      <div className="absolute right-0 top-1/2 transform -translate-y-1/2 w-2 h-2 bg-gray-300 rounded-full"></div>
                    </div>
                  )}
  
                  {/* Card */}
                  <div className="relative z-10 bg-white rounded-3xl p-8 border-2 border-gray-100 hover:border-purple-200 transition-all duration-300 hover:shadow-xl group-hover:-translate-y-2">
                    
                    {/* Step Number */}
                    <div className="relative mb-6">
                      <div className={`w-16 h-16 bg-gradient-to-br ${step.color} rounded-2xl flex items-center justify-center text-white font-bold text-lg shadow-lg transform rotate-6 group-hover:rotate-0 transition-transform duration-300`}>
                        {step.number}
                      </div>
                      <div className="absolute -bottom-2 -right-2 w-6 h-6 bg-yellow-300 rounded-full opacity-80"></div>
                    </div>
  
                    {/* Content */}
                    <h3 className="text-2xl font-bold text-gray-900 mb-4">{step.title}</h3>
                    <p className="text-gray-600 leading-relaxed">{step.description}</p>
  
                    {/* Decorative Element */}
                    <div className="absolute top-6 right-6 opacity-10 group-hover:opacity-20 transition-opacity duration-300">
                      <svg className="w-12 h-12 text-gray-400" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M12 2L2 7v10c0 5.55 3.84 9.74 9 10.65 5.16-.91 9-5.1 9-10.65V7l-10-5z"/>
                      </svg>
                    </div>
                  </div>
                </div>
              ))}
            </div>
  
            {/* Bottom CTA */}
            <div className="text-center mt-16">
              <div className="inline-flex items-center text-purple-600 font-medium">
                <span className="mr-2">Ready to be delivered</span>
                <div className="w-8 h-8 bg-purple-100 rounded-full flex items-center justify-center">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                  </svg>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    );
  }