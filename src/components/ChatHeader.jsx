import Link from 'next/link';
import { FiSettings, FiMenu } from 'react-icons/fi';
import { AnimatePresence, motion } from 'framer-motion';

const ChatHeader = ({ onSettingsClick, onToggleSidebar, isSidebarOpen, isMobile }) => {
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
          <div className="flex items-center gap-4">
            <AnimatePresence>
              {isMobile && !isSidebarOpen && (
                <motion.button
                  onClick={onToggleSidebar}
                  className="p-2 rounded-full hover:bg-[rgba(var(--foreground-rgb),0.1)] transition-colors"
                  aria-label="Toggle Sidebar"
                  initial={{ opacity: 0, scale: 0.5 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.5 }}
                >
                  <FiMenu className="h-5 w-5" />
                </motion.button>
              )}
            </AnimatePresence>
            <Link href="/" className="text-2xl font-bold">
                DomAI
            </Link>
          </div>
          <div className="flex items-center gap-4">
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
