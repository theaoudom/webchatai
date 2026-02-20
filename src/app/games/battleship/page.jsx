'use client';
import React from 'react';
import Battleship from '@/components/Battleship';
import GamesHeader from '@/components/GamesHeader';
import Footer from '@/components/Footer';

const BattleshipPage = () => {
    return (
        <div className="flex flex-col min-h-screen bg-slate-900 aurora-background">
            <GamesHeader />
            <main className="flex-grow flex items-center justify-center p-4">
                <Battleship />
            </main>
            <Footer />
        </div>
    );
};

export default BattleshipPage;
