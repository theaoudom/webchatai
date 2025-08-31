import React from 'react';
import Message from './Message';
import LoadingIndicator from './LoadingIndicator';

const MessageList = ({ messages, isLoading }) => {
  return (
    <div className="flex-1 overflow-y-auto p-6">
      <div className="max-w-4xl mx-auto h-full">
        {messages.length === 0 && !isLoading ? (
          <div className="flex items-center justify-center h-full">
            <h1 className="text-4xl font-bold text-gray-500">
              How can Dom help you today?
            </h1>
          </div>
        ) : (
          messages.map((message) => <Message key={message.id} message={message} />)
        )}
        {isLoading && (
          <div className="flex mb-4 justify-start">
            <div className="rounded-lg p-3 max-w-4xl bg-gray-700">
              <LoadingIndicator />
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default MessageList;
