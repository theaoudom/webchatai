'use client'; // This is CRITICAL for client-side functionality

import { useState, useEffect } from 'react';
import * as progressService from '../service/progressService'; // Adjust path if needed

export default function LessonFooter({ lessonId }) {
  const [isCompleted, setIsCompleted] = useState(false);

  // When the component first loads, check if the lesson is already complete
  useEffect(() => {
    setIsCompleted(progressService.isLessonComplete(lessonId));
  }, [lessonId]);

  const handleCompleteClick = () => {
    progressService.markLessonAsComplete(lessonId);
    setIsCompleted(true);
  };

  return (
    <div className="mt-8 pt-6 border-t text-center">
      {isCompleted ? (
        <p className="font-bold text-green-600">✓ Completed!</p>
      ) : (
        <button
          onClick={handleCompleteClick}
          className="bg-blue-600 text-white font-bold py-2 px-6 rounded-lg hover:bg-blue-700"
        >
          Mark as Complete
        </button>
      )}
    </div>
  );
}