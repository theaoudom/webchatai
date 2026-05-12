import React from 'react';
import Header from '../../components/Header';
import Footer from '../../components/Footer';
import { FiMessageSquare, FiMic, FiBookOpen, FiCode, FiZap, FiLock } from 'react-icons/fi';

export const metadata = {
  title: 'Features - Explore DomAI Capabilities',
  description: 'A deep dive into the powerful features that make DomAI the ultimate AI assistant and learning platform.',
};

export default function FeaturesPage() {
  const features = [
    {
      icon: <FiMessageSquare className="w-8 h-8" />,
      title: 'Advanced Conversational AI',
      description: 'Engage in natural, free-flowing conversations. Our underlying Large Language Models are tuned for context retention, allowing the AI to remember the nuances of your discussion across long chat sessions.'
    },
    {
      icon: <FiMic className="w-8 h-8" />,
      title: 'Voice Recognition & Synthesis',
      description: 'Interact entirely hands-free. Use your microphone to speak your prompts natively, and have DomAI read responses back to you with high-quality, natural-sounding Text-to-Speech (TTS) integration.'
    },
    {
      icon: <FiBookOpen className="w-8 h-8" />,
      title: 'Gamified Learning Hub',
      description: 'Turn education into play. Access interactive modules like Memory Card Flips, Typing Speed Tests, and Vocabulary Flashcards specifically designed to reinforce learning through gamification.'
    },
    {
      icon: <FiCode className="w-8 h-8" />,
      title: 'Developer Mode & Syntax Highlighting',
      description: 'Write, debug, and understand code seamlessly. The chat interface features built-in syntax highlighting for over 40 programming languages, making it the perfect pair-programming companion.'
    },
    {
      icon: <FiZap className="w-8 h-8" />,
      title: 'Lightning Fast Responses',
      description: 'Powered by an optimized backend architecture, DomAI delivers streaming responses in milliseconds, ensuring you never have to wait long for the answers you need.'
    },
    {
      icon: <FiLock className="w-8 h-8" />,
      title: 'Privacy-First Architecture',
      description: 'Your data belongs to you. We implement strict data minimization policies and secure encryption to ensure your chat histories and personal information are never compromised or sold.'
    }
  ];

  return (
    <div className="bg-gray-900 text-white min-h-screen flex flex-col">
      <Header isTransparent={false} />
      <main className="flex-grow max-w-6xl mx-auto px-4 py-16 w-full">
        <div className="text-center mb-16">
          <h1 className="text-4xl md:text-5xl font-bold mb-6 text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-pink-600">
            Powerful Features Built for You
          </h1>
          <p className="text-xl text-gray-400 max-w-2xl mx-auto">
            Discover the comprehensive suite of tools and capabilities that set DomAI apart as your all-in-one digital assistant.
          </p>
        </div>
        
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {features.map((feature, index) => (
            <div key={index} className="bg-gray-800/60 p-8 rounded-2xl border border-white/5 hover:bg-gray-800 transition-colors duration-300 shadow-xl group">
              <div className="w-16 h-16 bg-purple-900/50 rounded-xl flex items-center justify-center text-purple-400 mb-6 group-hover:scale-110 transition-transform duration-300">
                {feature.icon}
              </div>
              <h3 className="text-xl font-bold mb-3 text-white">{feature.title}</h3>
              <p className="text-gray-400 leading-relaxed text-sm md:text-base">
                {feature.description}
              </p>
            </div>
          ))}
        </div>

        <div className="mt-24 rounded-3xl overflow-hidden relative">
           <div className="absolute inset-0 bg-gradient-to-r from-purple-600 to-pink-600 opacity-20"></div>
           <div className="bg-gray-800/80 backdrop-blur-sm p-10 md:p-16 text-center border border-white/10 relative z-10">
              <h2 className="text-3xl md:text-4xl font-bold mb-6">Experience the Difference</h2>
              <p className="text-gray-300 max-w-2xl mx-auto mb-10 text-lg">
                Stop juggling multiple tools for writing, coding, and learning. Get access to all these features today in one unified platform.
              </p>
              <div className="flex flex-col sm:flex-row justify-center gap-4">
                 <a href="/chat" className="px-8 py-4 bg-purple-600 hover:bg-purple-700 text-white font-bold rounded-full transition-colors">
                    Start Chatting
                 </a>
                 <a href="/games" className="px-8 py-4 bg-transparent border-2 border-purple-500 hover:bg-purple-500/20 text-white font-bold rounded-full transition-colors">
                    Explore Games
                 </a>
              </div>
           </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}
