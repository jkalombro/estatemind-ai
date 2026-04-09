import { Link } from 'react-router-dom';
import { Home, AlertCircle } from 'lucide-react';

export function NotFound() {
  return (
    <div className="min-h-[60vh] flex flex-col items-center justify-center text-center px-4">
      <div className="bg-red-50 dark:bg-red-900/20 p-6 rounded-full mb-6">
        <AlertCircle className="w-16 h-16 text-red-600 dark:text-red-400" />
      </div>
      <h1 className="text-4xl font-black text-gray-900 dark:text-white mb-4 tracking-tight">404 - Page Not Found</h1>
      <p className="text-gray-600 dark:text-gray-400 max-w-md mb-8 text-lg">
        Oops! The page you're looking for doesn't exist or has been moved.
      </p>
      <Link
        to="/"
        className="inline-flex items-center gap-2 bg-blue-600 text-white px-8 py-3 rounded-xl font-bold hover:bg-blue-700 transition-all shadow-lg shadow-blue-200 dark:shadow-none"
      >
        <Home className="w-5 h-5" />
        Back to Home
      </Link>
    </div>
  );
}
