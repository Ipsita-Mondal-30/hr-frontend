export default function TestRoutePage() {
  return (
    <div className="flex items-center justify-center h-screen">
      <div className="text-center">
        <h1 className="text-2xl font-bold mb-4">Test Route Working!</h1>
        <p>If you can see this, Next.js routing is working properly.</p>
        <p className="text-sm text-gray-500 mt-2">URL: {typeof window !== 'undefined' ? window.location.href : 'Loading...'}</p>
      </div>
    </div>
  );
}