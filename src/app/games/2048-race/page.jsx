'use client';
import React from 'react';
import Game2048Race from '@/components/Game2048Race';
import GamesHeader from '@/components/GamesHeader';
import Footer from '@/components/Footer';

const Game2048RacePage = () => {
    return (
        <div className="flex flex-col min-h-screen bg-slate-900 aurora-background">
            <GamesHeader />
            <main className="flex-grow flex items-center justify-center p-4">
                <Game2048Race />
            </main>
            <Footer />
        </div>
    );
};

export default Game2048RacePage;
