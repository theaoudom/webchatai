'use client';
import React from 'react';
import ConnectFour from '@/components/ConnectFour';
import GamesHeader from '@/components/GamesHeader';
import Footer from '@/components/Footer';

const ConnectFourPage = () => {
    return (
        <div className="flex flex-col min-h-screen bg-gray-900 aurora-background">
            <GamesHeader />
            <main className="flex-grow flex items-center justify-center p-4">
                <div className="w-full max-w-lg">
                    <ConnectFour />
                </div>
            </main>
            <Footer />
        </div>
    );
};

export default ConnectFourPage;
