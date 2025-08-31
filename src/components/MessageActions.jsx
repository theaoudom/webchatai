'use client';

import React, { useState } from 'react';
import SpeakerButton from './SpeakerButton';
import { FaCopy, FaThumbsUp, FaThumbsDown, FaCheck } from 'react-icons/fa';

const MessageActions = ({ message }) => {
  const [isCopied, setIsCopied] = useState(false);
  const [feedback, setFeedback] = useState(null); // 'liked', 'disliked', or null

  const handleCopy = () => {
    navigator.clipboard.writeText(message.text).then(() => {
      setIsCopied(true);
      setTimeout(() => setIsCopied(false), 2000);
    });
  };

  const handleFeedback = (newFeedback) => {
    setFeedback((prevFeedback) =>
      prevFeedback === newFeedback ? null : newFeedback
    );
  };

  return (
    <div className="flex items-center gap-4 mt-2 text-gray-400">
      <button
        onClick={handleCopy}
        className={`transition-colors ${
          isCopied ? 'text-green-500' : 'hover:text-white'
        }`}
        aria-label="Copy message"
        disabled={isCopied}
      >
        {isCopied ? <FaCheck /> : <FaCopy />}
      </button>
      <button
        onClick={() => handleFeedback('liked')}
        className={`transition-colors ${
          feedback === 'liked' ? 'text-blue-500' : 'hover:text-white'
        }`}
        aria-label="Like message"
      >
        <FaThumbsUp />
      </button>
      <button
        onClick={() => handleFeedback('disliked')}
        className={`transition-colors ${
          feedback === 'disliked' ? 'text-red-500' : 'hover:text-white'
        }`}
        aria-label="Dislike message"
      >
        <FaThumbsDown />
      </button>
      <SpeakerButton text={message.text} />
    </div>
  );
};

export default MessageActions;
