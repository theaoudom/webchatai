import React, { useCallback } from 'react';
import MicrophoneButton from './MicrophoneButton';

const MessageInput = ({ input, setInput, handleSend, isLoading }) => {
  const handleTranscriptChange = useCallback(
    (transcript) => {
      setInput(transcript);
    },
    [setInput]
  );

  return (
    <div className="p-4 bg-transparent">
      <div className="max-w-4xl mx-auto">
        <div
          className="flex items-center rounded-full p-2 shadow-md"
          style={{ backgroundColor: 'var(--muted)' }}
        >
          <input
            type="text"
            placeholder={isLoading ? 'Loading...' : 'Type your message...'}
            className="flex-1 bg-transparent focus:outline-none px-4 themed-placeholder"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && !isLoading && handleSend()}
            disabled={isLoading}
          />
          <div className="flex items-center gap-2">
            <MicrophoneButton onTranscriptChange={handleTranscriptChange} />
            <button
              className="rounded-full p-2 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              style={{
                backgroundColor: 'var(--secondary)',
                color: 'var(--background)',
              }}
              onClick={handleSend}
              disabled={isLoading}
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-6 w-6"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M5 12h14M12 5l7 7-7 7"
                />
              </svg>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MessageInput;
