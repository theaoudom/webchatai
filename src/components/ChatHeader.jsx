import Link from 'next/link';
import { FiPlus, FiSettings } from 'react-icons/fi';

const ChatHeader = ({ onNewChat, onSettingsClick }) => {
  return (
    <header
      className="backdrop-blur-sm border-b sticky top-0 z-20"
      style={{
        backgroundColor: `rgba(var(--background-rgb), 0.5)`,
        borderColor: `rgba(var(--foreground-rgb), 0.1)`,
      }}
    >
      <div className="max-w-6xl mx-auto px-4 py-3">
        <div className="flex justify-between items-center">
          <Link href="/" className="text-2xl font-bold">
            DomAI
          </Link>
          <div className="flex items-center gap-4">
            <button
              onClick={onNewChat}
              className="inline-flex items-center justify-center px-6 py-2 text-sm font-semibold rounded-full transition-colors"
              style={{
                backgroundColor: 'var(--primary)',
                color: 'var(--accent-foreground)',
              }}
            >
              <FiPlus className="mr-2 -ml-1" />
              New Chat
            </button>
            <button
              onClick={onSettingsClick}
              className="p-2 rounded-full hover:bg-[rgba(var(--foreground-rgb),0.1)] transition-colors"
              aria-label="Settings"
            >
              <FiSettings className="h-5 w-5" />
            </button>
          </div>
        </div>
      </div>
    </header>
  );
};

export default ChatHeader;
