'use client';

import { useState } from 'react';

export default function QuizComponent({ lesson }) {
  const [userAnswers, setUserAnswers] = useState({});
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [score, setScore] = useState(0);

  const handleOptionSelect = (questionIndex, option) => {
    // Don't allow changes after submitting
    if (isSubmitted) return;

    setUserAnswers({
      ...userAnswers,
      [questionIndex]: option,
    });
  };

  const handleSubmit = () => {
    let correctAnswers = 0;
    lesson.questions.forEach((q, index) => {
      if (userAnswers[index] === q.answer) {
        correctAnswers++;
      }
    });
    setScore(correctAnswers);
    setIsSubmitted(true);
    // In the future, you could save this score using progressService
  };

  const getButtonClass = (q, option, index) => {
    if (!isSubmitted) {
      return userAnswers[index] === option 
        ? 'bg-blue-200 border-blue-500' // Selected
        : 'bg-white hover:bg-gray-100'; // Default
    } else {
      if (option === q.answer) {
        return 'bg-green-200 border-green-500'; // Correct answer
      }
      if (userAnswers[index] === option && option !== q.answer) {
        return 'bg-red-200 border-red-500'; // Incorrectly selected
      }
      return 'bg-gray-100 border-gray-300 text-gray-500'; // Not selected
    }
  };

  return (
    <div>
      <h2 className="text-2xl font-semibold mb-4">{lesson.title}</h2>
      {lesson.questions.map((q, index) => (
        <div key={index} className="mb-6 p-4 bg-gray-50 rounded-md">
          <p className="font-semibold mb-3">{index + 1}. {q.question}</p>
          <div className="flex flex-col space-y-2">
            {q.options.map(opt => (
              <button 
                key={opt}
                onClick={() => handleOptionSelect(index, opt)}
                disabled={isSubmitted}
                className={`w-full text-left p-3 border rounded-md transition-colors ${getButtonClass(q, opt, index)}`}
              >
                {opt}
              </button>
            ))}
          </div>
        </div>
      ))}
      
      {!isSubmitted && (
        <div className="text-center">
          <button 
            onClick={handleSubmit} 
            className="bg-green-600 text-white font-bold py-2 px-8 rounded-lg hover:bg-green-700"
          >
            Submit Answers
          </button>
        </div>
      )}

      {isSubmitted && (
        <div className="text-center mt-6 p-4 bg-blue-50 rounded-lg">
          <h3 className="text-2xl font-bold">Your Score: {score} / {lesson.questions.length}</h3>
        </div>
      )}
    </div>
  );
}