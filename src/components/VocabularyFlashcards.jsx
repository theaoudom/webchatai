'use client';

import { useState } from 'react';

// Helper function to play audio
const playAudio = (audioFile) => {
    if (audioFile && typeof Audio !== 'undefined') {
        const audio = new Audio(audioFile);
        audio.play().catch(err => {
            console.error(`Audio play failed for path: ${audioFile}. Please ensure the file exists and that you've run the generation script.`, err);
        });
    }
};

export default function VocabularyFlashcards({ lesson }) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);

  const currentCard = lesson.content[currentIndex];

  const handleFlip = () => setIsFlipped(!isFlipped);
  
  const handleNext = () => {
    setIsFlipped(false); // Show the front of the next card
    setCurrentIndex((prevIndex) => (prevIndex + 1) % lesson.content.length);
  };

  const handlePrev = () => {
    setIsFlipped(false); // Show the front of the previous card
    setCurrentIndex((prevIndex) => (prevIndex - 1 + lesson.content.length) % lesson.content.length);
  };

  return (
    <div>
      <h2 className="text-3xl font-bold text-center mb-6">Vocabulary Flashcards</h2>
      
      {/* The Flashcard */}
      <div 
        onClick={handleFlip} 
        className="w-full h-80 bg-blue-100 rounded-xl shadow-lg flex items-center justify-center cursor-pointer border-4 border-blue-200"
        style={{ perspective: '1000px' }}
      >
        <div 
          className="relative w-full h-full text-center flex items-center justify-center"
          style={{ transformStyle: 'preserve-3d', transition: 'transform 0.7s', transform: isFlipped ? 'rotateY(180deg)' : 'none' }}
        >
          {/* Front of the Card */}
          <div className="absolute w-full h-full p-4 flex flex-col items-center justify-center" style={{ backfaceVisibility: 'hidden' }}>
            {currentCard.digit && <p className="text-8xl font-bold text-blue-600 mb-4">{currentCard.digit}</p>}
            <p className="text-5xl font-bold text-gray-800">{currentCard.word}</p>
            {currentCard.romanization && <p className="text-2xl text-gray-500 mt-2">{currentCard.romanization}</p>}
            {currentCard.audioFile && (
                <button 
                    onClick={(e) => { e.stopPropagation(); playAudio(currentCard.audioFile); }} 
                    className="mt-4 text-3xl"
                >
                    🔊
                </button>
            )}
          </div>
          {/* Back of the Card */}
          <div className="absolute w-full h-full p-4 flex items-center justify-center bg-green-100 rounded-lg border-4 border-green-200" style={{ backfaceVisibility: 'hidden', transform: 'rotateY(180deg)' }}>
            <p className="text-4xl font-semibold text-gray-800">{currentCard.meaning}</p>
          </div>
        </div>
      </div>
      
      {/* Controls */}
      <div className="mt-8 flex justify-between items-center">
        <button onClick={handlePrev} className="px-6 py-3 bg-gray-200 text-gray-700 font-semibold rounded-lg shadow-md hover:bg-gray-300 transition-colors">Previous</button>
        <p className="text-lg font-medium text-gray-600">{currentIndex + 1} / {lesson.content.length}</p>
        <button onClick={handleNext} className="px-6 py-3 bg-gray-200 text-gray-700 font-semibold rounded-lg shadow-md hover:bg-gray-300 transition-colors">Next</button>
      </div>
    </div>
  );
}