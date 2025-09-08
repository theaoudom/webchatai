'use client';

import { useState, useEffect, useRef } from 'react';

// A browser-only feature, so we define a placeholder for SSR
const SpeechRecognition =
  typeof window !== 'undefined' ? (window.SpeechRecognition || window.webkitSpeechRecognition) : null;

export default function SpeakingPractice({ lesson }) {
  const [isListening, setIsListening] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [feedback, setFeedback] = useState('');
  const [status, setStatus] = useState('Click the microphone to start speaking.');
  const recognitionRef = useRef(null);

  useEffect(() => {
    if (!SpeechRecognition) {
      setStatus('Sorry, your browser does not support speech recognition.');
      return;
    }

    const recognition = new SpeechRecognition();
    recognition.continuous = false;
    recognition.interimResults = false;
    recognition.lang = lesson.language === 'Korean' ? 'ko-KR' : 'en-US';

    recognition.onstart = () => {
      setIsListening(true);
      setStatus('Listening...');
    };

    recognition.onend = () => {
      setIsListening(false);
      setStatus('Processing...');
    };

    recognition.onerror = (event) => {
        setStatus(`Error: ${event.error}. Please try again.`);
        setIsListening(false);
    };

    recognition.onresult = async (event) => {
      const spokenText = event.results[0][0].transcript;
      setTranscript(spokenText);
      
      // Get feedback from our AI
      try {
        const response = await fetch('/api/learnWithAI/feedback', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ transcript: spokenText, lessonContext: lesson }),
        });
        if (!response.ok) throw new Error('API request failed');
        const data = await response.json();
        setFeedback(data.text);
        setStatus('Click the microphone to try again.');
      } catch (error) {
        setFeedback('Sorry, there was an error getting feedback.');
        setStatus('Click the microphone to try again.');
      }
    };

    recognitionRef.current = recognition;
  }, [lesson]);

  const handleListen = () => {
    if (isListening || !recognitionRef.current) {
      recognitionRef.current.stop();
    } else {
      setTranscript('');
      setFeedback('');
      recognitionRef.current.start();
    }
  };

  return (
    <div className="mt-8 pt-6 border-t text-center">
      <h2 className="text-2xl font-semibold mb-4">Speaking Practice</h2>
      <p className="text-gray-600 mb-4">{status}</p>
      
      <button 
        onClick={handleListen} 
        className={`mx-auto w-20 h-20 rounded-full flex items-center justify-center transition-colors ${isListening ? 'bg-red-500' : 'bg-blue-500'}`}
      >
        <svg className="w-10 h-10 text-white" fill="currentColor" viewBox="0 0 20 20">
            <path d="M7 4a3 3 0 016 0v6a3 3 0 11-6 0V4zM5 4a5 5 0 00-5 5v1a5 5 0 005 5h1a5 5 0 005-5v-1a5 5 0 00-5-5H5z"></path>
        </svg>
      </button>

      {transcript && (
        <div className="mt-6 text-left p-4 bg-gray-50 rounded-lg">
          <h3 className="font-semibold">Your attempt:</h3>
          <p className="italic">"{transcript}"</p>
        </div>
      )}

      {feedback && (
        <div className="mt-4 text-left p-4 bg-blue-50 rounded-lg">
          <h3 className="font-semibold">AI Feedback:</h3>
          <p className="whitespace-pre-wrap">{feedback}</p>
        </div>
      )}
    </div>
  );
}