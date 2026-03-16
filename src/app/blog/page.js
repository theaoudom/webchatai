import React from 'react';
import Header from '../../components/Header';
import Footer from '../../components/Footer';
import Link from 'next/link';

export const metadata = {
  title: 'Blog - DomAI',
  description: 'Read the latest articles and news from DomAI about Artificial Intelligence, chatbots, and technology.',
};

export default function BlogIndex() {
  const articles = [
    {
      title: "The Future of AI Chatbots in 2026",
      excerpt: "Explore how large language models are transforming digital communication, from customer service to personal AI assistants.",
      date: "March 16, 2026",
      slug: "the-future-of-ai-chat"
    },
    {
      title: "How Gamification Enhances Learning",
      excerpt: "Discover the science behind our educational games and how interactive elements boost memory retention.",
      date: "March 10, 2026",
      slug: "#"
    },
    {
      title: "Understanding Prompting for Better Results",
      excerpt: "A beginner's guide on how to talk to conversational AI agents to get the exact output you need.",
      date: "February 28, 2026",
      slug: "#"
    }
  ];

  return (
    <div className="bg-gray-900 text-white min-h-screen flex flex-col">
      <Header isTransparent={false} />
      <main className="flex-grow max-w-4xl mx-auto px-4 py-16 w-full">
        <h1 className="text-4xl md:text-5xl font-bold mb-4 text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-pink-600 text-center">
          Our Blog
        </h1>
        <p className="text-gray-400 text-center mb-12 text-lg">
          Insights, updates, and thoughts on AI and interactive technology.
        </p>
        
        <div className="space-y-8">
          {articles.map((article, index) => (
            <article key={index} className="bg-gray-800/50 p-8 rounded-2xl border border-white/10 hover:border-purple-500/50 transition-colors">
              <div className="text-sm text-purple-400 mb-2">{article.date}</div>
              <h2 className="text-2xl font-bold mb-3 text-white">
                <Link href={`/blog/${article.slug}`} className="hover:text-purple-300 transition-colors">
                  {article.title}
                </Link>
              </h2>
              <p className="text-gray-300 mb-4 leading-relaxed">
                {article.excerpt}
              </p>
              <Link href={`/blog/${article.slug}`} className="text-pink-400 font-semibold hover:text-pink-300 inline-flex items-center">
                Read Article <span className="ml-1">→</span>
              </Link>
            </article>
          ))}
        </div>
      </main>
      <Footer />
    </div>
  );
}
