'use client';

import { useState, useRef, useEffect } from 'react';

export default function AiChatComponent({ lesson }) {
  const [history, setHistory] = useState([]);
  const [userInput, setUserInput] = useState('');
  const [loading, setLoading] = useState(false);
  const chatEndRef = useRef(null);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [history]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!userInput || loading) return;

    setLoading(true);
    const newHistory = [...history, { role: 'user', content: userInput }];
    setHistory(newHistory);
    setUserInput('');

    try {
      const response = await fetch('/api/learnWithAI', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ history: newHistory, lessonContext: lesson }),
      });

      if (!response.ok) throw new Error("API request failed.");
      
      const data = await response.json();
      setHistory(prev => [...prev, { role: 'ai', content: data.text }]);
    } catch (error) {
      setHistory(prev => [...prev, { role: 'ai', content: "Sorry, I'm having trouble connecting. Please try again." }]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="mt-8 pt-6 border-t">
      <h2 className="text-2xl font-semibold mb-4 text-center">Practice with your AI Tutor</h2>
      <div className="bg-gray-50 h-96 rounded-lg p-4 flex flex-col space-y-4 overflow-y-auto">
        {history.map((message, index) => (
          <div key={index} className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}>
            <p className={`max-w-md p-3 rounded-lg ${message.role === 'user' ? 'bg-blue-500 text-white' : 'bg-white shadow'}`}>
              {message.content}
            </p>
          </div>
        ))}
         {loading && <p className="p-3 rounded-lg bg-white shadow self-start">Thinking...</p>}
        <div ref={chatEndRef} />
      </div>
      <form onSubmit={handleSubmit} className="mt-4 flex space-x-2">
        <input 
          type="text"
          value={userInput}
          onChange={(e) => setUserInput(e.target.value)}
          placeholder="Ask a question or practice a sentence..."
          className="w-full p-3 border rounded-md"
        />
        <button type="submit" disabled={loading} className="bg-blue-600 text-white px-6 rounded-md disabled:bg-gray-400">
          Send
        </button>
      </form>
    </div>
  );
}