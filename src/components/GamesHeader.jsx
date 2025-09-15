'use client';
import Link from 'next/link';
import React from 'react';

const GamesHeader = () => {
    return (
        <header className="sticky top-0 z-50 p-4 bg-white/30 dark:bg-gray-900/40 shadow-lg backdrop-blur-lg border-b border-white/20 dark:border-gray-100/20">
            <div className="container mx-auto flex items-center justify-between">
                <Link href="/" className="text-3xl font-bold text-white" style={{ textShadow: '2px 2px 8px rgba(0,0,0,0.5)' }}>
                    DomAI
                </Link>
                {/* Future links can be added here */}
            </div>
        </header>
    );
};

export default GamesHeader;
