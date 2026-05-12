import React from 'react';
import Header from '../../components/Header';
import Footer from '../../components/Footer';

export const metadata = {
  title: 'Use Cases - How to Use DomAI',
  description: 'Discover the diverse ways you can use DomAI for work, education, coding, and creative projects.',
};

export default function UseCasesPage() {
  const useCases = [
    {
      title: 'For Developers & Engineers',
      icon: '💻',
      description: 'Accelerate your software development workflow with intelligent AI assistance.',
      benefits: [
        'Code Generation: Instantly generate boilerplate code or complex functions in JavaScript, Python, React, and more.',
        'Debugging: Paste error messages and code snippets to get detailed explanations of bugs and how to fix them.',
        'Code Refactoring: Improve code quality, optimize performance, and ensure best practices are met.',
        'Documentation: Automatically generate clear and comprehensive documentation for your codebase.'
      ]
    },
    {
      title: 'For Students & Educators',
      icon: '🎓',
      description: 'Transform the learning experience with personalized, AI-driven educational tools.',
      benefits: [
        'Homework Help: Get step-by-step explanations for complex math problems, science concepts, and history essays.',
        'Gamified Learning: Engage with interactive vocabulary flashcards, typing tests, and memory games to reinforce learning.',
        'Language Practice: Converse with the AI in different languages to improve grammar, vocabulary, and fluency.',
        'Lesson Planning: Educators can generate lesson outlines, quiz questions, and study guides in seconds.'
      ]
    },
    {
      title: 'For Writers & Content Creators',
      icon: '✍️',
      description: 'Overcome writer\'s block and produce high-quality content faster than ever.',
      benefits: [
        'Brainstorming: Generate hundreds of ideas for blog posts, YouTube videos, or social media campaigns.',
        'Drafting: Write articles, essays, and creative stories with AI assistance to speed up the drafting process.',
        'Copywriting: Create compelling marketing copy, ad descriptions, and email newsletters optimized for conversion.',
        'Editing & Proofreading: Ensure your text is grammatically correct, concise, and matches your desired tone.'
      ]
    },
    {
      title: 'For Business Professionals',
      icon: '📈',
      description: 'Boost productivity and streamline daily operational tasks in the workplace.',
      benefits: [
        'Email Drafting: Quickly draft professional emails for client outreach, internal communications, or customer support.',
        'Data Summarization: Condense long reports, meeting transcripts, and articles into actionable bullet points.',
        'Strategy Planning: Brainstorm business strategies, conduct basic market research, and structure project plans.',
        'Presentation Prep: Outline slide decks and generate talking points for your next big presentation.'
      ]
    }
  ];

  return (
    <div className="bg-gray-900 text-white min-h-screen flex flex-col">
      <Header isTransparent={false} />
      <main className="flex-grow max-w-5xl mx-auto px-4 py-16 w-full">
        <div className="text-center mb-16">
          <h1 className="text-4xl md:text-5xl font-bold mb-6 text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-pink-600">
            DomAI Use Cases
          </h1>
          <p className="text-xl text-gray-400 max-w-3xl mx-auto leading-relaxed">
            From writing code to drafting essays, discover how our conversational AI and interactive tools can supercharge your daily workflow and transform the way you learn.
          </p>
        </div>
        
        <div className="grid md:grid-cols-2 gap-8">
          {useCases.map((useCase, index) => (
            <div key={index} className="bg-gray-800/40 p-8 rounded-3xl border border-white/10 hover:border-purple-500/50 transition-colors duration-300">
              <div className="text-5xl mb-6">{useCase.icon}</div>
              <h2 className="text-2xl font-bold mb-4 text-white">{useCase.title}</h2>
              <p className="text-gray-400 mb-6 leading-relaxed">
                {useCase.description}
              </p>
              <ul className="space-y-3">
                {useCase.benefits.map((benefit, bIndex) => {
                  const [strongText, restText] = benefit.split(': ');
                  return (
                    <li key={bIndex} className="flex items-start">
                      <span className="text-pink-500 mr-2 mt-1">✓</span>
                      <span className="text-gray-300">
                        <strong className="text-white">{strongText}:</strong> {restText}
                      </span>
                    </li>
                  );
                })}
              </ul>
            </div>
          ))}
        </div>

        <div className="mt-20 text-center bg-gradient-to-br from-purple-900/40 to-pink-900/40 p-10 rounded-3xl border border-purple-500/20">
          <h2 className="text-3xl font-bold mb-4">Ready to elevate your productivity?</h2>
          <p className="text-gray-300 mb-8 text-lg">Join thousands of users who are already leveraging DomAI to work smarter and learn faster.</p>
          <a
            href="/chat"
            className="inline-flex items-center justify-center px-8 py-4 text-lg font-bold text-white bg-purple-600 rounded-full shadow-lg hover:bg-purple-700 transition-transform transform hover:scale-105"
          >
            Try DomAI Now
          </a>
        </div>
      </main>
      <Footer />
    </div>
  );
}
