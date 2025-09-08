'use client';
import { useState } from 'react';
import { useAudioPlayer } from '../hooks/useAudioPlayer';

const formatTime = (seconds) => {
    const minutes = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${minutes}:${secs < 10 ? '0' : ''}${secs}`;
};

export default function ListeningComponent({ lesson }) {
  const { isPlaying, progress, duration, togglePlayPause, seek, error } = useAudioPlayer(lesson.audioFile);
  const [showTranscript, setShowTranscript] = useState(false);
  const [selectedAnswers, setSelectedAnswers] = useState({});
  const [submitted, setSubmitted] = useState(false);

  const handleAnswerSelect = (questionIndex, option) => {
    if (submitted) return;
    setSelectedAnswers(prev => ({
      ...prev,
      [questionIndex]: option,
    }));
  };

  const checkAnswers = () => {
    setSubmitted(true);
  };
  
  const getButtonClass = (questionIndex, option) => {
    if (!submitted) {
        return selectedAnswers[questionIndex] === option ? 'bg-blue-200' : 'bg-gray-100 hover:bg-gray-200';
    }
    const correctAnswer = lesson.questions[questionIndex].answer;
    if (option === correctAnswer) {
        return 'bg-green-500 text-white';
    }
    if (selectedAnswers[questionIndex] === option) {
        return 'bg-red-500 text-white';
    }
    return 'bg-gray-100';
  }

  return (
    <div>
        <h2 className="text-3xl font-bold text-gray-800 mb-6">Listening Comprehension</h2>
        <div className="bg-white p-6 rounded-2xl shadow-lg">
            {error ? (
                <div className="text-red-600 bg-red-100 p-4 rounded-lg text-center">
                    <p className="font-bold">Audio Error</p>
                    <p>{error}</p>
                </div>
            ) : (
                <>
                    <div className="flex items-center space-x-4">
                        <button 
                            onClick={togglePlayPause} 
                            className="text-4xl text-blue-500"
                        >
                            {isPlaying ? '❚❚' : '▶'}
                        </button>
                        <input 
                            type="range"
                            min="0"
                            max={duration || 0}
                            value={progress}
                            onChange={(e) => seek(e.target.value)}
                            className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
                        />
                    </div>
                    <div className="flex justify-between text-sm text-gray-500 mt-1">
                        <span>{formatTime(progress)}</span>
                        <span>{formatTime(duration)}</span>
                    </div>
                </>
            )}
        </div>
        <div className="mt-6 text-center">
            <button 
                onClick={() => setShowTranscript(!showTranscript)}
                className="text-blue-500 hover:underline"
            >
                {showTranscript ? 'Hide' : 'Show'} Transcript
            </button>
        </div>
        {showTranscript && (
            <div className="mt-4 p-4 bg-gray-50 rounded-lg whitespace-pre-line text-gray-700">
                {lesson.transcript}
            </div>
        )}
        <div className="mt-8">
            <h3 className="text-2xl font-bold mb-4">Quiz</h3>
            <div className="space-y-6">
                {lesson.questions.map((q, index) => (
                    <div key={index} className="bg-white p-6 rounded-xl shadow-md">
                        <p className="font-semibold text-lg mb-4">{index + 1}. {q.question}</p>
                        <div className="space-y-3">
                            {q.options.map(opt => (
                                <button 
                                    key={opt}
                                    onClick={() => handleAnswerSelect(index, opt)}
                                    className={`w-full text-left p-4 rounded-lg transition-colors ${getButtonClass(index, opt)}`}
                                    disabled={submitted}
                                >
                                    {opt}
                                </button>
                            ))}
                        </div>
                    </div>
                ))}
            </div>
            {!submitted &&
                <div className="mt-8 text-center">
                    <button onClick={checkAnswers} className="px-8 py-3 bg-blue-500 text-white font-bold rounded-lg shadow-md hover:bg-blue-600 transition-all">
                        Check Answers
                    </button>
                </div>
            }
        </div>
    </div>
  );
}