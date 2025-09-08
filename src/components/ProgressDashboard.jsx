'use client';

import { useState, useEffect } from 'react';
import * as progressService from '../service/progressService';
import koreanCurriculum from '../data/korean.json';
import englishCurriculum from '../data/english.json';

const curriculum = {
  korean: koreanCurriculum,
  english: englishCurriculum,
};

export default function ProgressDashboard() {
  const [progress, setProgress] = useState({ completedLessons: [] });

  const updateProgress = () => {
    setProgress(progressService.getProgress());
  };

  useEffect(() => {
    updateProgress();
    window.addEventListener('progressUpdated', updateProgress);
    return () => {
      window.removeEventListener('progressUpdated', updateProgress);
    };
  }, []);

  // Updated logic for calculating total lessons from the nested structure
  const totalLessons = Object.values(curriculum)
    .flatMap(lang => Object.values(lang))
    .reduce((total, lessons) => total + lessons.length, 0);

  const completedCount = progress.completedLessons.length;
  const progressPercentage = totalLessons > 0 ? Math.round((completedCount / totalLessons) * 100) : 0;

  return (
    <div className="bg-white p-6 rounded-lg shadow-md mb-8">
      <h2 className="text-2xl font-bold mb-4">Your Progress</h2>
      <div className="flex justify-between items-center mb-2">
        <span className="font-semibold">Overall Completion</span>
        <span className="font-bold">{completedCount} / {totalLessons} Lessons</span>
      </div>
      <div className="w-full bg-gray-200 rounded-full h-4">
        <div 
          className="bg-blue-600 h-4 rounded-full transition-all duration-500" 
          style={{ width: `${progressPercentage}%` }}
        ></div>
      </div>
      <p className="text-right mt-1 text-lg font-semibold">{progressPercentage}%</p>
    </div>
  );
}