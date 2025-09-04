'use client';

import React from 'react';
import Link from 'next/link';
import { FaTimes, FaMobileAlt } from 'react-icons/fa';
import { useTheme } from '../context/ThemeContext';

const SettingsDialog = ({ isOpen, onClose }) => {
  const { theme, changeTheme } = useTheme();

  if (!isOpen) {
    return null;
  }

  const themes = [
    { name: 'dark', color: '#4b5563' }, // gray
    { name: 'light', color: '#f3f4f6' }, // gray
    { name: 'pink', color: '#ec4899' }, // pink
    { name: 'blue', color: '#3b82f6' }, // blue
    { name: 'purple', color: '#a855f7' }, // purple
  ];

  const appVersion = '0.1.2';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
      <div
        className="rounded-lg shadow-xl p-6 w-full max-w-md"
        style={{ backgroundColor: 'var(--muted)' }}
      >
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-semibold">Settings</h2>
          <button
            onClick={onClose}
            className="p-2 rounded-full hover:bg-[rgba(var(--foreground-rgb),0.1)] transition-colors"
          >
            <FaTimes />
          </button>
        </div>

        <div>
          <h3 className="text-lg font-medium mb-4">Theme</h3>
          <div className="flex items-center gap-4">
            {themes.map((themeOption) => (
              <button
                key={themeOption.name}
                onClick={() => changeTheme(themeOption.name)}
                className={`w-10 h-10 rounded-full border-2 transition-colors ${
                  theme === themeOption.name
                    ? 'border-[var(--foreground)]'
                    : 'border-transparent'
                } focus:outline-none focus:border-[var(--foreground)]`}
                style={{ backgroundColor: themeOption.color }}
                aria-label={`Select ${themeOption.name} theme`}
              />
            ))}
          </div>
        </div>

        <div className="mt-8">
          <h3 className="text-lg font-medium mb-4">Mobile App</h3>
          <Link href="/store" className="w-full flex items-center justify-center bg-[rgba(var(--foreground-rgb),0.05)] hover:bg-[rgba(var(--foreground-rgb),0.1)] text-[var(--foreground)] font-bold py-3 px-4 rounded-lg transition-colors duration-300">
            <FaMobileAlt className="mr-3" />
            Download for Android
          </Link>
        </div>

        <div className="mt-8 text-center text-sm">
          <p>Version: {appVersion}</p>
        </div>
      </div>
    </div>
  );
};

export default SettingsDialog;
