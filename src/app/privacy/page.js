import React from 'react';
import Header from '../../components/Header';
import Footer from '../../components/Footer';

export const metadata = {
  title: 'Privacy Policy - DomAI',
  description: 'Privacy Policy for DomAI applications and services.',
};

export default function PrivacyPolicy() {
  return (
    <div className="bg-gray-900 text-white min-h-screen flex flex-col">
      <Header isTransparent={false} />
      <main className="flex-grow max-w-4xl mx-auto px-4 py-16 w-full">
        <h1 className="text-4xl font-bold mb-8 text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-pink-600">
          Privacy Policy
        </h1>
        
        <div className="space-y-6 text-gray-300">
          <p>Last updated: {new Date().toLocaleDateString()}</p>
          
          <section>
            <h2 className="text-2xl font-semibold mb-4 text-white">1. Introduction</h2>
            <p>
              Welcome to DomAI. We are committed to protecting your personal information and your right to privacy. 
              If you have any questions or concerns about this privacy notice, or our practices with regards to your personal information, 
              please contact us.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4 text-white">2. Information We Collect</h2>
            <p>
              We collect personal information that you voluntarily provide to us when you register on the website, 
              express an interest in obtaining information about us or our products and Services, when you participate in activities on the website,
              or otherwise when you contact us.
            </p>
            <ul className="list-disc pl-6 mt-2 space-y-2">
              <li><strong>Personal Information Provided by You:</strong> We collect names; email addresses; usernames; passwords; contact preferences; and other similar information.</li>
              <li><strong>Automatically Collected Information:</strong> Some information—such as your Internet Protocol (IP) address and/or browser and device characteristics—is collected automatically when you visit our services.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4 text-white">3. How We Use Your Information</h2>
            <p>
              We use personal information collected via our Website for a variety of business purposes described below. 
              We process your personal information for these purposes in reliance on our legitimate business interests, 
              in order to enter into or perform a contract with you, with your consent, and/or for compliance with our legal obligations.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4 text-white">4. Will Your Information Be Shared With Anyone?</h2>
            <p>
              We only share information with your consent, to comply with laws, to provide you with services, 
              to protect your rights, or to fulfill business obligations.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4 text-white">5. Third-Party Advertisers</h2>
            <p>
              We may use third-party advertising companies to serve ads when you visit or use the Website. 
              These companies may use information about your visits to our Website(s) and other websites that are contained in web cookies 
              and other tracking technologies in order to provide advertisements about goods and services of interest to you. 
              Specifically, we use Google AdSense to publish ads on certain pages.
            </p>
          </section>
        </div>
      </main>
      <Footer />
    </div>
  );
}
