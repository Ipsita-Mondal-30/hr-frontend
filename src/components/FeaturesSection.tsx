export default function FeaturesSection() {
    const features = [
      "🎯 AI Match Scoring",
      "📥 Resume Parsing",
      "🧠 Smart Interview Questions",
      "📊 HR Analytics Dashboard",
      "🤖 Feedback Automation",
    ];
  
    return (
      <section className="py-16 bg-white px-6">
        <h2 className="text-2xl font-semibold text-center mb-10">Features</h2>
        <div className="grid md:grid-cols-3 gap-6 max-w-5xl mx-auto">
          {features.map((feat, idx) => (
            <div
              key={idx}
              className="bg-gray-100 rounded-xl p-6 text-center shadow-sm"
            >
              <p className="text-gray-800">{feat}</p>
            </div>
          ))}
        </div>
      </section>
    );
  }
  