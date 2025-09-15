'use client';
import React from 'react';
import GamesHeader from '@/components/GamesHeader';
import Footer from '@/components/Footer';
import GameCategory from '@/components/GameCategory';
import { games } from '@/data/games';

const GamesPage = () => {
  return (
    <div className="flex flex-col min-h-screen bg-gray-50 dark:bg-gray-900 aurora-background">
      <GamesHeader />
      <main className="flex-grow container mx-auto p-4">
        <h1 className="text-5xl font-extrabold mb-8 text-center text-white" style={{ textShadow: '2px 2px 8px rgba(0,0,0,0.7)' }}>
          Game Center
        </h1>
        <GameCategory games={games} />
      </main>
      <Footer />
    </div>
  );
};

export default GamesPage;
