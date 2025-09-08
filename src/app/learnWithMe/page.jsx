'use client';

import Link from 'next/link';
import ProgressDashboard from '../../components/ProgressDashboard';
import GamificationDashboard from '../../components/GamificationDashboard';

// Define the languages you offer
const languages = [
  { name: 'Korean', code: 'korean', emoji: '🇰🇷', bgColor: 'bg-blue-500', hoverColor: 'hover:bg-blue-600' },
  { name: 'English', code: 'english', emoji: '🇬🇧', bgColor: 'bg-red-500', hoverColor: 'hover:bg-red-600' },
];

export default function LearnHomePage() {
  return (
    <div className="container mx-auto p-8">
      <GamificationDashboard />
      <ProgressDashboard /> 

      <h1 className="text-5xl font-extrabold text-center mb-12 text-gray-800">Choose Your Language</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {languages.map(lang => (
          <Link key={lang.code} href={`/learnWithMe/${lang.code}`}>
            <div className={`p-10 rounded-2xl shadow-lg text-white text-center transition-all transform hover:scale-105 hover:shadow-2xl ${lang.bgColor} ${lang.hoverColor} cursor-pointer`}>
              <span className="text-7xl block mb-4">{lang.emoji}</span>
              <h2 className="text-4xl font-bold">{lang.name}</h2>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}