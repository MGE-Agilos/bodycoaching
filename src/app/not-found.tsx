import Link from 'next/link';

export default function NotFound() {
  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center">
      <div className="text-center">
        <div className="text-6xl mb-4">🏊🚴🏃</div>
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Page Not Found</h1>
        <p className="text-gray-500 mb-6">The page you&apos;re looking for doesn&apos;t exist.</p>
        <Link href="/" className="bg-sky-600 text-white px-6 py-3 rounded-xl font-medium hover:bg-sky-700 transition-colors">
          Go to Dashboard
        </Link>
      </div>
    </div>
  );
}
