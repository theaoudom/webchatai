import Link from 'next/link';
import { FiPlus } from 'react-icons/fi';

const ChatHeader = ({ onNewChat }) => {
  return (
    <header className="bg-gray-800/50 backdrop-blur-sm border-b border-white/10 sticky top-0 z-20">
      <div className="max-w-6xl mx-auto px-4 py-3">
        <div className="flex justify-between items-center">
          <Link href="/" className="text-2xl font-bold text-white">
            DomAI
          </Link>
          <button
            onClick={onNewChat}
            className="inline-flex items-center justify-center px-6 py-2 text-sm font-semibold text-white bg-purple-600 rounded-full hover:bg-purple-700 transition-colors"
          >
            <FiPlus className="mr-2 -ml-1" />
            New Chat
          </button>
        </div>
      </div>
    </header>
  );
};

export default ChatHeader;
