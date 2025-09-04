"use client";

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { FaDownload, FaTimes } from 'react-icons/fa';

const DownloadBanner = () => {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const bannerDismissed = localStorage.getItem('downloadBannerDismissed');
    if (!bannerDismissed) {
      // Add a small delay to make the banner less intrusive on page load
      const timer = setTimeout(() => {
        setIsVisible(true);
      }, 1000);
      return () => clearTimeout(timer);
    }
  }, []);

  const handleDismiss = () => {
    localStorage.setItem('downloadBannerDismissed', 'true');
    setIsVisible(false);
  };

  if (!isVisible) {
    return null;
  }

  return (
    <div className="fixed bottom-4 right-4 z-50">
      <div className="bg-gray-800 bg-opacity-80 backdrop-blur-lg text-white p-4 rounded-lg shadow-2xl flex items-center max-w-lg animate-fade-in-up">
        <FaDownload className="text-3xl text-purple-400 mr-4" />
        <div className="flex-grow">
          <h4 className="font-bold">Get the DomAI Mobile App</h4>
          <p className="text-sm text-gray-300">
            Experience the best of DomAI on your Android device.
          </p>
        </div>
        <Link href="/store" className="bg-purple-600 text-white font-bold py-2 px-4 rounded-lg hover:bg-purple-700 transition-colors duration-300 ml-4">
          Download
        </Link>
        <button
          onClick={handleDismiss}
          className="ml-4 text-gray-400 hover:text-white transition-colors"
          aria-label="Dismiss banner"
        >
          <FaTimes />
        </button>
      </div>
    </div>
  );
};

export default DownloadBanner;
