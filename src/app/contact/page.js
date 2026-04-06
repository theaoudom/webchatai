import React from 'react';
import Header from '../../components/Header';
import Footer from '../../components/Footer';

export const metadata = {
  title: 'Contact Us - DomAI',
  description: 'Get in touch with the DomAI team for support, business inquiries, or feedback.',
};

export default function ContactUs() {
  return (
    <div className="bg-gray-900 text-white min-h-screen flex flex-col">
      <Header isTransparent={false} />
      <main className="flex-grow max-w-4xl mx-auto px-4 py-16 w-full">
        <h1 className="text-4xl md:text-5xl font-bold mb-8 text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-pink-600 text-center">
          Contact Us
        </h1>
        
        <div className="bg-gray-800/50 p-8 rounded-2xl border border-white/10 max-w-2xl mx-auto">
          <p className="text-gray-300 text-center mb-8">
            Have a question, feedback, or a business inquiry? We'd love to hear from you. Fill out the form below and our team will get back to you as soon as possible.
          </p>

          <form className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label htmlFor="firstName" className="block text-sm font-medium text-gray-300 mb-2">First Name</label>
                <input type="text" id="firstName" name="firstName" className="w-full bg-gray-700 border border-gray-600 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-purple-500 focus:ring-1 focus:ring-purple-500" placeholder="John" required />
              </div>
              <div>
                <label htmlFor="lastName" className="block text-sm font-medium text-gray-300 mb-2">Last Name</label>
                <input type="text" id="lastName" name="lastName" className="w-full bg-gray-700 border border-gray-600 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-purple-500 focus:ring-1 focus:ring-purple-500" placeholder="Doe" required />
              </div>
            </div>

            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-300 mb-2">Email Address</label>
              <input type="email" id="email" name="email" className="w-full bg-gray-700 border border-gray-600 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-purple-500 focus:ring-1 focus:ring-purple-500" placeholder="john@example.com" required />
            </div>

            <div>
              <label htmlFor="subject" className="block text-sm font-medium text-gray-300 mb-2">Subject</label>
              <select id="subject" name="subject" className="w-full bg-gray-700 border border-gray-600 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-purple-500 focus:ring-1 focus:ring-purple-500">
                <option value="support">General Support</option>
                <option value="billing">Billing Inquiry</option>
                <option value="partnership">Partnership</option>
                <option value="other">Other</option>
              </select>
            </div>

            <div>
              <label htmlFor="message" className="block text-sm font-medium text-gray-300 mb-2">Message</label>
              <textarea id="message" name="message" rows="5" className="w-full bg-gray-700 border border-gray-600 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-purple-500 focus:ring-1 focus:ring-purple-500" placeholder="How can we help you?" required></textarea>
            </div>

            <div>
              <button type="submit" className="w-full bg-purple-600 hover:bg-purple-700 text-white font-semibold py-3 px-4 rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2 focus:ring-offset-gray-900">
                Send Message
              </button>
            </div>
            
            <p className="text-xs text-gray-500 text-center mt-4">
              By submitting this form, you agree to our Privacy Policy and Terms of Service.
            </p>
          </form>
        </div>
      </main>
      <Footer />
    </div>
  );
}
