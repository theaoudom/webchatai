'use client';

import Link from 'next/link';
import { FiArrowRight } from 'react-icons/fi';

const Header = ({ isTransparent }) => {
  return (
    <header
      className={`sticky top-0 left-0 right-0 z-20 transition-all duration-300 ${
        isTransparent
          ? 'bg-transparent border-b border-transparent'
          : 'bg-gray-900/50 backdrop-blur-md border-b border-white/10'
      }`}
    >
      <div className="max-w-6xl mx-auto px-4 py-4">
        <div className="flex justify-between items-center">
          <Link href="/" className="text-2xl font-bold text-white">
            DomAI
          </Link>
          <Link
            href="/chat"
            className="hidden md:inline-flex items-center justify-center px-6 py-2 text-sm font-semibold text-white bg-white/10 rounded-full backdrop-blur-sm border border-white/20 hover:bg-white/20 transition-colors"
          >
            Go to Chat
            <FiArrowRight className="ml-2" />
          </Link>
        </div>
      </div>
    </header>
  );
};

export default Header;