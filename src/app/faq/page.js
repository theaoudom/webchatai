import React from 'react';
import Header from '../../components/Header';
import Footer from '../../components/Footer';

export const metadata = {
  title: 'Frequently Asked Questions - DomAI',
  description: 'Find answers to common questions about DomAI, including how it works, privacy, and features.',
};

export default function FAQPage() {
  const faqs = [
    {
      question: 'What is DomAI?',
      answer: 'DomAI is an advanced, conversational AI platform designed to assist users with learning, writing, coding, and creative tasks. It leverages state-of-the-art language models to provide human-like interactions, educational games, and productivity tools all in one place.'
    },
    {
      question: 'How do I use the chat feature?',
      answer: 'Simply navigate to the "Chat" section from the homepage or navigation menu. Type your query or prompt into the input box and hit send. The AI will analyze your request and generate a comprehensive response in real-time.'
    },
    {
      question: 'Is my data and privacy secure?',
      answer: 'Yes, absolutely. We take user privacy very seriously. We do not sell your personal data to third parties, and conversation logs are only used to maintain context during your active session. For more details, please review our comprehensive Privacy Policy.'
    },
    {
      question: 'Can I use DomAI for programming and coding?',
      answer: 'Yes! DomAI is highly capable of writing code, debugging errors, explaining complex algorithms, and helping you learn new programming languages. It supports popular languages like JavaScript, Python, React, and many more.'
    },
    {
      question: 'Are the educational games free to play?',
      answer: 'Yes, our suite of gamified learning tools, including Memory Cards, Typing Rush, and Vocabulary Flashcards, are completely free to use. We believe in making education accessible and engaging through AI.'
    },
    {
      question: 'How accurate is the information provided by the AI?',
      answer: 'While our AI models are trained on vast amounts of high-quality data, they can occasionally produce incorrect or biased information (known as hallucinations). We always recommend verifying critical factual information, especially for medical, legal, or financial decisions.'
    },
    {
      question: 'Do I need to create an account to use DomAI?',
      answer: 'Currently, you can explore many features of DomAI without creating an account. However, to save your chat history, track your learning progress, and access personalized features, we recommend signing up.'
    },
    {
      question: 'How can I provide feedback or report a bug?',
      answer: 'We value your feedback! You can reach out to our support team through the Contact page. If you encounter any bugs or have suggestions for new features, please do not hesitate to let us know.'
    }
  ];

  return (
    <div className="bg-gray-900 text-white min-h-screen flex flex-col">
      <Header isTransparent={false} />
      <main className="flex-grow max-w-4xl mx-auto px-4 py-16 w-full">
        <div className="text-center mb-12">
          <h1 className="text-4xl md:text-5xl font-bold mb-4 text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-pink-600">
            Frequently Asked Questions
          </h1>
          <p className="text-gray-400 text-lg">
            Everything you need to know about the product and how it works.
          </p>
        </div>
        
        <div className="space-y-6">
          {faqs.map((faq, index) => (
            <div key={index} className="bg-gray-800/50 p-6 rounded-2xl border border-white/10 shadow-lg">
              <h3 className="text-xl font-semibold mb-3 text-white flex items-center">
                <span className="text-purple-500 mr-3 text-2xl">•</span>
                {faq.question}
              </h3>
              <p className="text-gray-300 leading-relaxed ml-7">
                {faq.answer}
              </p>
            </div>
          ))}
        </div>

        <div className="mt-16 text-center bg-purple-900/20 p-8 rounded-2xl border border-purple-500/30">
          <h2 className="text-2xl font-bold mb-4">Still have questions?</h2>
          <p className="text-gray-400 mb-6">If you cannot find the answer to your question in our FAQ, you can always contact us directly.</p>
          <a
            href="/contact"
            className="inline-flex items-center justify-center px-6 py-3 text-base font-semibold text-white bg-purple-600 rounded-full shadow-lg hover:bg-purple-700 transition-colors"
          >
            Contact Support
          </a>
        </div>
      </main>
      <Footer />
    </div>
  );
}
