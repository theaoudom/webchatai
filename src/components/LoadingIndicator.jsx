import React from 'react';

const LoadingIndicator = () => {
  return (
    <div className="flex items-center space-x-2">
      <div className="w-3 h-3 bg-gray-500 rounded-full animate-pulse-fast"></div>
      <div
        className="w-3 h-3 bg-gray-500 rounded-full animate-pulse-fast"
        style={{ animationDelay: '0.2s' }}
      ></div>
      <div
        className="w-3 h-3 bg-gray-500 rounded-full animate-pulse-fast"
        style={{ animationDelay: '0.4s' }}
      ></div>
    </div>
  );
};

export default LoadingIndicator;
