'use client';

import { useState, useEffect } from 'react';
import * as progressService from '../service/progressService'; // Adjust path

export default function GamificationDashboard() {
  const [stats, setStats] = useState({ points: 0, streak: 0 });

  const updateStats = () => {
    const progress = progressService.getProgress();
    setStats({ points: progress.points, streak: progress.streak });
  };

  useEffect(() => {
    updateStats();
    window.addEventListener('progressUpdated', updateStats);
    return () => {
      window.removeEventListener('progressUpdated', updateStats);
    };
  }, []);

  return (
    <div className="grid grid-cols-2 gap-4 mb-8">
      {/* Points Card */}
      <div className="bg-white p-4 rounded-lg shadow-md flex items-center">
        <span className="text-4xl mr-4">⭐</span>
        <div>
          <p className="text-3xl font-bold">{stats.points}</p>
          <p className="text-gray-500">Total Points</p>
        </div>
      </div>
      {/* Streak Card */}
      <div className="bg-white p-4 rounded-lg shadow-md flex items-center">
        <span className="text-4xl mr-4">🔥</span>
        <div>
          <p className="text-3xl font-bold">{stats.streak}</p>
          <p className="text-gray-500">Day Streak</p>
        </div>
      </div>
    </div>
  );
}