import React from 'react';
import Image from 'next/image';
import Link from 'next/link';

const GameCategory = ({ games }) => {
    return (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {games.map((game) => (
                <Link href={`/games/${game.id}`} key={game.id}>
                    <div
                        className="bg-white dark:bg-gray-800 rounded-lg shadow-lg overflow-hidden cursor-pointer transform transition-transform hover:scale-105 h-full"
                    >
                        <div className="relative h-48 w-full">
                            <Image
                                src={game.imageUrl}
                                alt={game.title}
                                layout="fill"
                                objectFit="cover"
                            />
                        </div>
                        <div className="p-6">
                            <h3 className="text-2xl font-bold text-gray-800 dark:text-white mb-2">{game.title}</h3>
                            <p className="text-gray-600 dark:text-gray-300">{game.description}</p>
                        </div>
                    </div>
                </Link>
            ))}
        </div>
    );
};

export default GameCategory;
