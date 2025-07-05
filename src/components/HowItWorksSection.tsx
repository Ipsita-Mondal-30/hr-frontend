export default function HowItWorksSection() {
    const steps = [
      { title: "1. Post a Job", desc: "HR creates job openings." },
      { title: "2. Candidates Apply", desc: "Smart resume uploads & screening." },
      { title: "3. AI Scores & Filters", desc: "Match score, tags, and insights." },
      { title: "4. Interview & Hire", desc: "Suggested questions & reviews." },
    ];
  
    return (
      <section className="bg-blue-100 py-16 px-6">
        <h2 className="text-2xl font-semibold text-center mb-10">How It Works</h2>
        <div className="grid md:grid-cols-4 gap-6 max-w-6xl mx-auto">
          {steps.map((step, idx) => (
            <div key={idx} className="bg-white rounded-xl p-4 shadow-md">
              <h3 className="font-semibold text-blue-700">{step.title}</h3>
              <p className="text-gray-600 text-sm mt-1">{step.desc}</p>
            </div>
          ))}
        </div>
      </section>
    );
  }
  