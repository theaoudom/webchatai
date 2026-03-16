import React from 'react';
import Header from '../../components/Header';
import Footer from '../../components/Footer';

export const metadata = {
  title: 'Terms of Service - DomAI',
  description: 'Terms of Service for DomAI applications and services.',
};

export default function TermsOfService() {
  return (
    <div className="bg-gray-900 text-white min-h-screen flex flex-col">
      <Header isTransparent={false} />
      <main className="flex-grow max-w-4xl mx-auto px-4 py-16 w-full">
        <h1 className="text-4xl font-bold mb-8 text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-pink-600">
          Terms of Service
        </h1>
        
        <div className="space-y-6 text-gray-300">
          <p>Last updated: {new Date().toLocaleDateString()}</p>
          
          <section>
            <h2 className="text-2xl font-semibold mb-4 text-white">1. Agreement to Terms</h2>
            <p>
              These Terms of Service constitute a legally binding agreement made between you, whether personally or on behalf of an entity (“you”) 
              and DomAI, concerning your access to and use of the website as well as any other media form, media channel, mobile website or 
              mobile application related, linked, or otherwise connected thereto (collectively, the “Site”).
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4 text-white">2. Acceptable Use</h2>
            <p>
              You may not access or use the Site for any purpose other than that for which we make the Site available. The Site may not be used in connection with any commercial endeavors except those that are specifically endorsed or approved by us.
            </p>
            <ul className="list-disc pl-6 mt-2 space-y-2">
              <li>Systematically retrieve data or other content from the Site to create or compile, directly or indirectly, a collection, compilation, database, or directory without written permission from us.</li>
              <li>Make any unauthorized use of the Site, including collecting usernames and/or email addresses of users by electronic or other means for the purpose of sending unsolicited email.</li>
              <li>Use the Site to advertise or offer to sell goods and services.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4 text-white">3. User Generated Contributions</h2>
            <p>
              The Site may invite you to chat, contribute to, or participate in blogs, message boards, online forums, and other functionality, 
              and may provide you with the opportunity to create, submit, post, display, transmit, perform, publish, distribute, or broadcast content 
              and materials to us or on the Site, including but not limited to text, writings, video, audio, photographs, graphics, comments, 
              suggestions, or personal information or other material.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4 text-white">4. Modifications and Interruptions</h2>
            <p>
              We reserve the right to change, modify, or remove the contents of the Site at any time or for any reason at our sole discretion without notice. 
              However, we have no obligation to update any information on our Site. We also reserve the right to modify or discontinue all or part of the Site 
              without notice at any time.
            </p>
          </section>
        </div>
      </main>
      <Footer />
    </div>
  );
}
