import Link from 'next/link';
import { FiHome } from 'react-icons/fi';

export default function NotFound() {
  return (
    <div className="bg-gray-900 text-white min-h-screen flex flex-col items-center justify-center text-center p-4">
      <div className="max-w-md">
        <h1 className="text-6xl md:text-8xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-purple-400 to-pink-600">
          404
        </h1>
        <p className="text-2xl md:text-3xl font-semibold mt-4">
          Page Not Found
        </p>
        <p className="text-gray-400 mt-4">
          Sorry, we couldn’t find the page you’re looking for.
        </p>
        <Link
          href="/"
          className="mt-8 inline-flex items-center justify-center px-8 py-4 text-lg font-semibold text-white bg-purple-600 rounded-full shadow-lg hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-purple-400 focus:ring-opacity-75 transition-transform transform hover:scale-105"
        >
          <FiHome className="mr-2" />
          Go Back Home
        </Link>
      </div>
    </div>
  );
}
