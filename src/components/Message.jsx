'use client';

import React, { useState } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { vscDarkPlus } from 'react-syntax-highlighter/dist/esm/styles/prism';
import MessageActions from './MessageActions';

const Message = ({ message }) => {
  const isModel = message.sender === 'model';

  return (
    <div
      className={`flex items-start gap-3 my-4 ${
        isModel ? 'justify-start' : 'justify-end'
      }`}
    >
      {isModel && (
        <div className="w-8 h-8 bg-purple-500 rounded-full flex-shrink-0"></div>
        // <div className="w-8 h-8 bg-purple-500 rounded-full flex-shrink-0 flex items-center justify-center">
        //   <Image
        //     src="/image/logo/Icon_chat.svg"
        //     alt="DomAI Icon"
        //     width={20}
        //     height={20}
        //   />
        // </div>
      )}
      <div className="flex flex-col items-start">
        <div
          className={`p-4 rounded-2xl ${
            isModel ? 'max-w-4xl' : 'max-w-lg'
          } ${
            isModel
              ? 'bg-gray-700 rounded-tl-none'
              : 'bg-blue-600 rounded-br-none text-white'
          } ${message.isError ? 'bg-red-500/20 border border-red-500/50' : ''}`}
        >
          <div
            className={`markdown-content ${
              !isModel ? 'user-message-markdown' : ''
            }`}
          >
            <ReactMarkdown
              remarkPlugins={[remarkGfm]}
              components={{
                code({ node, inline, className, children, ...props }) {
                  const match = /language-(\w+)/.exec(className || '');
                  const codeString = String(children).replace(/\n$/, '');
                  const [copied, setCopied] = useState(false);

                  const handleCopy = () => {
                    navigator.clipboard.writeText(codeString).then(() => {
                      setCopied(true);
                      setTimeout(() => setCopied(false), 2000);
                    });
                  };

                  return !inline && match ? (
                    <div className="relative my-4 overflow-hidden rounded-lg border border-gray-700 bg-gray-900">
                      <div className="flex items-center justify-between bg-gray-800 px-4 py-2">
                        <span className="text-sm font-semibold text-gray-400">
                          {match[1]}
                        </span>
                        <button
                          className="rounded bg-gray-700 px-2 py-1 text-xs font-semibold text-gray-300 hover:bg-gray-600"
                          onClick={handleCopy}
                        >
                          {copied ? 'Copied!' : 'Copy'}
                        </button>
                      </div>
                      <SyntaxHighlighter
                        style={vscDarkPlus}
                        language={match[1]}
                        PreTag="div"
                        customStyle={{ backgroundColor: '#111827' }}
                        {...props}
                      >
                        {codeString}
                      </SyntaxHighlighter>
                    </div>
                  ) : (
                    <code className={className} {...props}>
                      {children}
                    </code>
                  );
                },
              }}
            >
              {message.text}
            </ReactMarkdown>
          </div>
        </div>
        {isModel && <MessageActions message={message} />}
      </div>
    </div>
  );
};

export default Message;
