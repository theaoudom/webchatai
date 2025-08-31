'use client';

import React, { useState } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { vscDarkPlus } from 'react-syntax-highlighter/dist/esm/styles/prism';

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
      )}
      <div
        className={`p-4 rounded-2xl max-w-lg ${
          isModel
            ? 'bg-gray-700 rounded-tl-none'
            : 'bg-blue-600 rounded-br-none text-white'
        } ${message.isError ? 'bg-red-500/20 border border-red-500/50' : ''}`}
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
                <div className="relative">
                  <button
                    className="absolute top-2 right-2 bg-gray-600 hover:bg-gray-500 text-white font-bold py-1 px-2 rounded text-xs"
                    onClick={handleCopy}
                  >
                    {copied ? 'Copied!' : 'Copy'}
                  </button>
                  <SyntaxHighlighter
                    style={vscDarkPlus}
                    language={match[1]}
                    PreTag="div"
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
  );
};

export default Message;
