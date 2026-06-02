'use client';

import { useState, useRef, useEffect } from 'react';
import { FiChevronDown, FiCheck } from 'react-icons/fi';
import { AnimatePresence, motion } from 'framer-motion';
import { MODELS, getModelById } from '../data/models';

const ModelSelector = ({ selectedModel, onSelect }) => {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef(null);
  const current = getModelById(selectedModel);

  // Close when clicking outside the dropdown.
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (containerRef.current && !containerRef.current.contains(e.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <div className="relative" ref={containerRef}>
      <button
        onClick={() => setIsOpen((v) => !v)}
        className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm font-medium hover:bg-[rgba(var(--foreground-rgb),0.1)] transition-colors"
        aria-haspopup="listbox"
        aria-expanded={isOpen}
      >
        <span>{current.name}</span>
        <FiChevronDown
          className={`h-4 w-4 transition-transform ${isOpen ? 'rotate-180' : ''}`}
        />
      </button>

      <AnimatePresence>
        {isOpen && (
          <motion.ul
            role="listbox"
            initial={{ opacity: 0, y: -6, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -6, scale: 0.98 }}
            transition={{ duration: 0.15 }}
            className="absolute right-0 mt-2 w-64 rounded-xl border shadow-lg overflow-hidden z-30"
            style={{
              backgroundColor: 'var(--background)',
              borderColor: 'rgba(var(--foreground-rgb),0.12)',
            }}
          >
            {MODELS.map((model) => {
              const isActive = model.id === current.id;
              return (
                <li key={model.id} role="option" aria-selected={isActive}>
                  <button
                    onClick={() => {
                      onSelect(model.id);
                      setIsOpen(false);
                    }}
                    className="w-full text-left px-4 py-3 hover:bg-[rgba(var(--foreground-rgb),0.06)] transition-colors flex items-start gap-2"
                  >
                    <span className="flex-1">
                      <span className="block text-sm font-semibold">{model.name}</span>
                      <span className="block text-xs opacity-60 mt-0.5">
                        {model.description}
                      </span>
                    </span>
                    {isActive && (
                      <FiCheck className="h-4 w-4 mt-0.5 text-purple-500 shrink-0" />
                    )}
                  </button>
                </li>
              );
            })}
          </motion.ul>
        )}
      </AnimatePresence>
    </div>
  );
};

export default ModelSelector;
