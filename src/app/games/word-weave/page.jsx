'use client';
import React from 'react';
import Link from 'next/link';
import GamesHeader from '@/components/GamesHeader';
import Footer from '@/components/Footer';
import WordWeave from '@/components/WordWeave';

const WordWeavePage = () => {
    return (
        <div className="flex flex-col min-h-screen bg-gray-50 dark:bg-gray-900 aurora-background">
            <GamesHeader />
            <main className="flex-grow container mx-auto p-4 flex flex-col">
                <Link href="/games" className="btn-primary mb-4 self-start">
                    &larr; Back to Games
                </Link>
                <div className="flex-grow flex items-center justify-center">
                    <div className="w-full max-w-lg">
                        <WordWeave />
                    </div>
                </div>
            </main>
            <Footer />
        </div>
    );
};

export default WordWeavePage;
