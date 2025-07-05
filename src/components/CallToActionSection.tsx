export default function CallToActionSection() {
    return (
      <section className="bg-gray-800 text-white py-16 px-4 text-center">
        <h2 className="text-2xl font-semibold mb-4">
          Ready to Revolutionize Hiring?
        </h2>
        <p className="text-gray-300 mb-6">
          Sign in now to access personalized dashboards and insights.
        </p>
        <a
          href="/api/auth/google"
          className="bg-blue-500 px-6 py-3 rounded-full text-white font-medium hover:bg-blue-600"
        >
          Login with Google
        </a>
      </section>
    );
  }
  