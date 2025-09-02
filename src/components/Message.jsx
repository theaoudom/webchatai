'use client';

import React, { useState } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import {
  vscDarkPlus,
  prism,
} from 'react-syntax-highlighter/dist/esm/styles/prism';
import MessageActions from './MessageActions';
import { useTheme } from '../context/ThemeContext';

const Message = ({ message }) => {
  const isModel = message.sender === 'model';
  const { theme } = useTheme();

  return (
    <div
      className={`flex items-start gap-3 my-4 ${
        isModel ? 'justify-start' : 'justify-end'
      }`}
    >
      {isModel && (
        <div
          className="w-8 h-8 rounded-full flex-shrink-0"
          style={{ backgroundColor: 'var(--primary)' }}
        ></div>
      )}
      <div className="flex flex-col items-start">
        {isModel ? (
          <div className="markdown-content max-w-sm md:max-w-3xl">
            {/* Model message has no background */}
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
                    <div
                      className="relative my-4 overflow-hidden rounded-lg border"
                      style={{
                        backgroundColor: 'var(--muted)',
                        borderColor: `rgba(var(--foreground-rgb), 0.1)`,
                      }}
                    >
                      <div
                        className="flex items-center justify-between px-4 py-2"
                        style={{
                          backgroundColor: `rgba(var(--foreground-rgb), 0.05)`,
                        }}
                      >
                        <span className="text-sm font-semibold">
                          {match[1]}
                        </span>
                        <button
                          className="rounded px-2 py-1 text-xs font-semibold"
                          style={{
                            backgroundColor: `rgba(var(--foreground-rgb), 0.1)`,
                          }}
                          onClick={handleCopy}
                        >
                          {copied ? 'Copied!' : 'Copy'}
                        </button>
                      </div>
                      <SyntaxHighlighter
                        style={theme === 'dark' ? vscDarkPlus : prism}
                        language={match[1]}
                        PreTag="div"
                        customStyle={{
                          backgroundColor: 'transparent',
                          margin: 0,
                          padding: '1rem',
                        }}
                        {...props}
                      >
                        {codeString}
                      </SyntaxHighlighter>
                    </div>
                  ) : (
                    <code
                      className={className}
                      {...props}
                      style={{
                        backgroundColor: 'var(--muted)',
                        padding: '0.2rem 0.4rem',
                        borderRadius: '0.25rem',
                      }}
                    >
                      {children}
                    </code>
                  );
                },
              }}
            >
              {message.text}
            </ReactMarkdown>
          </div>
        ) : (
          <div
            className={`px-4 py-2 rounded-xl max-w-sm md:max-w-3xl rounded-br-none`}
            style={{
              backgroundColor: 'var(--secondary)',
              color: 'var(--accent-foreground)',
            }}
          >
            <div className="markdown-content user-message-markdown">
              <ReactMarkdown remarkPlugins={[remarkGfm]}>
                {message.text}
              </ReactMarkdown>
            </div>
          </div>
        )}
        {isModel && <MessageActions message={message} />}
      </div>
    </div>
  );
};

export default Message;
