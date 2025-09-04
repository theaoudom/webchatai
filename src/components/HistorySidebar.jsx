'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  FiTrash2,
  FiPlus,
  FiMessageSquare,
  FiChevronDown,
  FiCheck,
  FiMenu,
} from 'react-icons/fi';

const HistorySidebar = ({
  isOpen,
  isMobile,
  history,
  onLoadChat,
  onNewChat,
  activeChatId,
  onDeleteChat,
  onToggle,
}) => {
  const [deletingId, setDeletingId] = useState(null);
  const [isHistoryVisible, setIsHistoryVisible] = useState(true);

  const handleDelete = (e, chatId) => {
    e.stopPropagation(); // Prevent card from being clicked
    if (deletingId === chatId) {
      onDeleteChat(chatId);
      setDeletingId(null);
    } else {
      setDeletingId(chatId);
    }
  };

  const handleMouseLeave = (chatId) => {
    if (deletingId === chatId) {
      setDeletingId(null);
    }
  };

  const desktopVariants = {
    open: { width: 320 },
    closed: { width: 80 },
  };

  const mobileVariants = {
    open: { x: 0 },
    closed: { x: '-100%' },
  };

  const baseClasses = "flex flex-col p-2";

  const sidebarProps = {
    className: `${baseClasses} ${
      isMobile 
        ? 'fixed h-full z-40 w-[320px] bg-[var(--background)] shadow-2xl' 
        : 'flex-shrink-0 bg-[color:rgba(var(--background-end-rgb),0.2)] border-r border-[color:rgba(var(--foreground-rgb),0.1)]'
    }`,
    variants: isMobile ? mobileVariants : desktopVariants,
    initial: "closed",
    animate: isOpen ? 'open' : 'closed',
    transition: { type: 'spring', stiffness: 400, damping: 40 },
  };

  return (
    <motion.div {...sidebarProps}>
      <div className="flex flex-col items-center w-full">
        {/* Logo */}
        <div className="p-2 mb-2 w-full">
            <button
              onClick={onToggle}
              className="flex items-center justify-center h-10 w-full rounded-full bg-[color:rgba(var(--foreground-rgb),0.05)] hover:bg-[color:rgba(var(--foreground-rgb),0.1)] transition-colors"
              aria-label="Toggle Sidebar"
            >
              <FiMessageSquare className="h-6 w-6" />
            </button>
        </div>
        {/* New Chat Button */}
        <div className="p-2 w-full">
          <button
            onClick={onNewChat}
            className="w-full flex items-center justify-center px-4 py-2 text-sm font-semibold rounded-full transition-colors"
            style={{
              backgroundColor: 'var(--primary)',
              color: 'var(--accent-foreground)',
            }}
          >
            <FiPlus className="h-5 w-5" />
            <AnimatePresence>
              {isOpen && <motion.span initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{delay: 0.1}} className="ml-2">New Chat</motion.span>}
            </AnimatePresence>
          </button>
        </div>
      </div>
      <AnimatePresence>
        {isOpen && (
            <motion.div 
                className="overflow-hidden flex-grow flex flex-col"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.2 }}
            >
                {/* History Title */}
                <div 
                    className="flex items-center justify-between p-2 mt-4 cursor-pointer"
                    onClick={() => setIsHistoryVisible(!isHistoryVisible)}
                >
                    <h2 className="text-sm font-semibold text-[color:rgba(var(--foreground-rgb),0.7)]">History</h2>
                    <motion.div
                        animate={{ rotate: isHistoryVisible ? 0 : -90 }}
                    >
                        <FiChevronDown className="h-5 w-5 text-[color:rgba(var(--foreground-rgb),0.7)]" />
                    </motion.div>
                </div>
                {/* History List */}
                <AnimatePresence>
                {isHistoryVisible && (
                    <motion.div
                        className="flex-grow overflow-y-auto pr-1"
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.3, ease: 'easeInOut' }}
                    >
                        {history.length === 0 ? (
                        <div className="text-center text-[color:rgba(var(--foreground-rgb),0.5)] mt-4 text-sm">
                            No history yet.
                        </div>
                        ) : (
                        <ul>
                            {history.map((chat) => (
                            <motion.li
                                key={chat.id}
                                className={`group flex justify-between items-center p-2 mb-1 rounded-md cursor-pointer transition-colors duration-200 ${
                                    activeChatId === chat.id
                                    ? 'bg-[color:rgba(var(--foreground-rgb),0.1)]'
                                    : 'hover:bg-[color:rgba(var(--foreground-rgb),0.05)]'
                                }`}
                                onMouseLeave={() => handleMouseLeave(chat.id)}
                            >
                                <motion.div
                                    className="flex-grow overflow-hidden"
                                    onClick={() => onLoadChat(chat)}
                                    whileTap={{ scale: 0.97 }}
                                >
                                <div className="font-medium truncate text-sm">{chat.title}</div>
                                </motion.div>
                                <button
                                onClick={(e) => handleDelete(e, chat.id)}
                                className={`flex-shrink-0 opacity-0 group-hover:opacity-100 p-1.5 rounded-full transition-all duration-200 ${
                                    deletingId === chat.id
                                    ? 'opacity-100 bg-red-500/20 text-red-500'
                                    : 'text-[color:rgba(var(--foreground-rgb),0.6)] hover:bg-red-500/20 hover:text-red-500'
                                }`}
                                >
                                {deletingId === chat.id ? <FiCheck size={14} /> : <FiTrash2 size={14} />}
                                </button>
                            </motion.li>
                            ))}
                        </ul>
                        )}
                    </motion.div>
                )}
                </AnimatePresence>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};

export default HistorySidebar;
