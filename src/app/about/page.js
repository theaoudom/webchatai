import React from 'react';
import Header from '../../components/Header';
import Footer from '../../components/Footer';

export const metadata = {
  title: 'About Us - DomAI',
  description: 'Learn more about DomAI, our mission, and our team.',
};

export default function AboutUs() {
  return (
    <div className="bg-gray-900 text-white min-h-screen flex flex-col">
      <Header isTransparent={false} />
      <main className="flex-grow max-w-4xl mx-auto px-4 py-16 w-full">
        <h1 className="text-4xl md:text-5xl font-bold mb-8 text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-pink-600 text-center">
          About DomAI
        </h1>
        
        <div className="space-y-8 text-gray-300">
          <section className="bg-gray-800/50 p-8 rounded-2xl border border-white/10">
            <h2 className="text-3xl font-semibold mb-4 text-white">Our Mission</h2>
            <p className="text-lg leading-relaxed">
              At DomAI, we believe that the power of artificial intelligence should be accessible to everyone. 
              Our mission is to build intuitive, educational, and engaging AI experiences that help people learn, 
              play, and work more effectively. We are passionate about the intersection of technology and human creativity.
            </p>
          </section>

          <div className="grid md:grid-cols-2 gap-8">
            <section className="bg-gray-800/50 p-8 rounded-2xl border border-white/10">
              <h2 className="text-2xl font-semibold mb-4 text-white">What We Do</h2>
              <p className="leading-relaxed mb-4">
                We develop a suite of applications ranging from conversational AI agents to interactive learning games. 
                Our platforms are designed to showcase the capabilities of modern machine learning models in a user-friendly environment.
              </p>
              <ul className="list-disc pl-5 space-y-2">
                <li>Intelligent Conversation Assistants</li>
                <li>Educational Gamification</li>
                <li>Language Learning Tools</li>
              </ul>
            </section>

            <section className="bg-gray-800/50 p-8 rounded-2xl border border-white/10">
              <h2 className="text-2xl font-semibold mb-4 text-white">Why Choose Us?</h2>
              <p className="leading-relaxed">
                We focus on creating aesthetic, fast, and responsive web experiences. Our tools are built with the latest 
                web technologies ensuring that whether you are practicing a new language or just having a chat with an AI, 
                your experience is seamless and enjoyable.
              </p>
            </section>
          </div>

          <section className="text-center mt-12">
             <h2 className="text-2xl font-semibold mb-4 text-white">Join Our Community</h2>
             <p className="mb-6">
                Explore our features, read our latest articles, or try out our games today!
             </p>
              <a
                href="/chat"
                className="inline-flex items-center justify-center px-8 py-4 text-lg font-semibold text-white bg-purple-600 rounded-full shadow-lg hover:bg-purple-700 transition-colors"
              >
                Start Chatting Now
              </a>
          </section>
        </div>
      </main>
      <Footer />
    </div>
  );
}
