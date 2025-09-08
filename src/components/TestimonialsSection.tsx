import { useState } from 'react';
import Image from 'next/image';

export function TestimonialsSection() {
  const [activeTestimonial, setActiveTestimonial] = useState(0);

  const testimonials = [
    {
      quote:
        'Talora transformed our hiring process completely. The AI matching is incredibly accurate, and we&apos;ve reduced our time-to-hire by 60%. The platform is intuitive and our team adopted it seamlessly.',
      author: 'Sarah Chen',
      position: 'Head of Talent Acquisition',
      company: 'TechFlow Solutions',
      image:
        'https://images.unsplash.com/photo-1494790108755-2616b612b77c?ixlib=rb-4.0.3&auto=format&fit=crop&w=150&q=80',
      rating: 5,
    },
    {
      quote:
        'The analytics dashboard gives us insights we never had before. We can now predict hiring trends and make data-driven decisions. It&apos;s been a game-changer for our recruitment strategy.',
      author: 'Marcus Rodriguez',
      position: 'VP of Human Resources',
      company: 'Innovation Labs',
      image:
        'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?ixlib=rb-4.0.3&auto=format&fit=crop&w=150&q=80',
      rating: 5,
    },
    {
      quote:
        'As a candidate, the experience was exceptional. The application process was smooth, communication was transparent, and I felt valued throughout. It&apos;s clear why companies choose Talora.',
      author: 'Emily Watson',
      position: 'Software Engineer',
      company: 'CloudTech Inc',
      image:
        'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?ixlib=rb-4.0.3&auto=format&fit=crop&w=150&q=80',
      rating: 5,
    },
  ];

  return (
    <section className="py-24 bg-gradient-to-br from-purple-50 via-white to-cyan-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="text-center mb-20">
          <div className="inline-flex items-center px-4 py-2 rounded-full bg-purple-100 text-purple-700 text-sm font-medium mb-6">
            <span className="w-2 h-2 bg-purple-500 rounded-full mr-2"></span>
            Testimonials
          </div>

          <h2 className="text-4xl lg:text-5xl font-bold text-gray-900 mb-6">
            Here&apos;s what people say about
            <br />
            <span className="bg-gradient-to-r from-purple-600 to-cyan-600 bg-clip-text text-transparent">
              our work
            </span>
          </h2>

          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Don&apos;t just take our word for it. See what our clients and candidates have to say about their
            experience with Talora.
          </p>
        </div>

        {/* Main Testimonial Card */}
        <div className="relative max-w-4xl mx-auto">
          <div className="bg-white rounded-3xl shadow-2xl p-12 relative overflow-hidden">
            {/* Background Pattern */}
            <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-br from-purple-100 to-cyan-100 rounded-full -mr-32 -mt-32 opacity-50"></div>

            {/* Quote Icon */}
            <div className="absolute top-8 left-8 text-6xl text-purple-200 font-serif">&quot;</div>

            <div className="relative z-10">
              {/* Testimonial Content */}
              <div className="text-center mb-12">
                <p className="text-2xl text-gray-700 leading-relaxed mb-8 font-light">
                  {testimonials[activeTestimonial].quote}
                </p>

                {/* Rating Stars */}
                <div className="flex justify-center mb-6">
                  {[...Array(testimonials[activeTestimonial].rating)].map((_, i) => (
                    <svg key={i} className="w-6 h-6 text-yellow-400 fill-current" viewBox="0 0 24 24">
                      <path d="M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z" />
                    </svg>
                  ))}
                </div>

                {/* Author Info */}
                <div className="flex items-center justify-center space-x-4">
                  <Image
                    src={testimonials[activeTestimonial].image}
                    alt={testimonials[activeTestimonial].author}
                    width={64}
                    height={64}
                    className="w-16 h-16 rounded-full object-cover ring-4 ring-white shadow-lg"
                  />
                  <div className="text-left">
                    <div className="font-semibold text-gray-900 text-lg">
                      {testimonials[activeTestimonial].author}
                    </div>
                    <div className="text-gray-600">{testimonials[activeTestimonial].position}</div>
                    <div className="text-purple-600 font-medium">{testimonials[activeTestimonial].company}</div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Navigation Dots */}
          <div className="flex justify-center mt-8 space-x-3">
            {testimonials.map((_, index) => (
              <button
                key={index}
                onClick={() => setActiveTestimonial(index)}
                className={`w-3 h-3 rounded-full transition-all duration-300 ${
                  index === activeTestimonial ? 'bg-purple-600 scale-125' : 'bg-gray-300 hover:bg-purple-400'
                }`}
              />
            ))}
          </div>
        </div>

        {/* Stats Section */}
        <div className="mt-20 grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="text-center p-8 bg-white/70 backdrop-blur-sm rounded-2xl border border-purple-100">
            <div className="text-4xl font-bold text-purple-600 mb-2">500+</div>
            <div className="text-gray-600 font-medium">Companies Trust Us</div>
          </div>
          <div className="text-center p-8 bg-white/70 backdrop-blur-sm rounded-2xl border border-cyan-100">
            <div className="text-4xl font-bold text-cyan-600 mb-2">98%</div>
            <div className="text-gray-600 font-medium">Client Satisfaction</div>
          </div>
          <div className="text-center p-8 bg-white/70 backdrop-blur-sm rounded-2xl border border-purple-100">
            <div className="text-4xl font-bold text-purple-600 mb-2">10M+</div>
            <div className="text-gray-600 font-medium">Successful Matches</div>
          </div>
        </div>
      </div>
    </section>
  );
}
