'use client';
import React, { useState, useEffect, useRef } from 'react';
import Confetti from 'react-confetti';

const cardSets = {
    easy: ['🐶', '🐱', '🐭', '🐹', '🐰', '🦊'],
    medium: ['🐶', '🐱', '🐭', '🐹', '🐰', '🦊', '🐻', '🐼'],
    hard: ['🐶', '🐱', '🐭', '🐹', '🐰', '🦊', '🐻', '🐼', '🐨', '🐯'],
    expert: ['🐶', '🐱', '🐭', '🐹', '🐰', '🦊', '🐻', '🐼', '🐨', '🐯', '🦁', '🐮'],
};

const gridClasses = {
    easy: 'grid-cols-4',
    medium: 'grid-cols-4',
    hard: 'grid-cols-5',
    expert: 'grid-cols-6',
};

const cardSizeClasses = {
    easy: 'w-20 h-20 md:w-24 md:h-24',
    medium: 'w-20 h-20 md:w-24 md:h-24',
    hard: 'w-20 h-20',
    expert: 'w-16 h-16',
};

const MemoryCardFlip = () => {
    const [gameMode, setGameMode] = useState(null); // '1P' or '2P'
    const [level, setLevel] = useState('easy');
    const [cards, setCards] = useState([]);
    const [flippedIndices, setFlippedIndices] = useState([]);
    const [matchedPairs, setMatchedPairs] = useState([]);
    
    // Player state
    const [turns, setTurns] = useState(0); // For 1P mode
    const [currentPlayer, setCurrentPlayer] = useState(1); // For 2P mode
    const [scores, setScores] = useState({ player1: 0, player2: 0 }); // For 2P mode

    const [isChecking, setIsChecking] = useState(false);
    const [initialCards, setInitialCards] = useState([]);
    const [showConfetti, setShowConfetti] = useState(false);
    const containerRef = useRef(null);
    const [dimensions, setDimensions] = useState({ width: 0, height: 0 });

    useEffect(() => {
        if (containerRef.current) {
            setDimensions({
                width: containerRef.current.offsetWidth,
                height: containerRef.current.offsetHeight,
            });
        }
    }, [showConfetti]);

    useEffect(() => {
        if (gameMode) {
            shuffleCards(level);
        }
    }, [level, gameMode]);

    const shuffleCards = (selectedLevel) => {
        const symbols = cardSets[selectedLevel];
        const newInitialCards = [...symbols, ...symbols];
        setInitialCards(newInitialCards);

        const shuffled = newInitialCards.sort(() => Math.random() - 0.5);
        setCards(shuffled.map((content, index) => ({ id: index, content })));
        
        setFlippedIndices([]);
        setMatchedPairs([]);
        setTurns(0);
        setCurrentPlayer(1);
        setScores({ player1: 0, player2: 0 });
        setShowConfetti(false);
    };

    const handleCardClick = (index) => {
        if (isChecking || flippedIndices.length >= 2 || flippedIndices.includes(index) || matchedPairs.includes(cards[index].content)) {
            return;
        }

        const newFlippedIndices = [...flippedIndices, index];
        setFlippedIndices(newFlippedIndices);

        if (newFlippedIndices.length === 2) {
            setIsChecking(true);
            const [firstIndex, secondIndex] = newFlippedIndices;
            
            if (cards[firstIndex].content === cards[secondIndex].content) {
                // It's a match!
                setMatchedPairs([...matchedPairs, cards[firstIndex].content]);
                if (gameMode === '2P') {
                    setScores(prevScores => ({
                        ...prevScores,
                        [`player${currentPlayer}`]: prevScores[`player${currentPlayer}`] + 1,
                    }));
                    // Current player gets to go again
                }
                setFlippedIndices([]);
                setIsChecking(false);
            } else {
                // Not a match
                setTimeout(() => {
                    setFlippedIndices([]);
                    setIsChecking(false);
                    if (gameMode === '2P') {
                        setCurrentPlayer(currentPlayer === 1 ? 2 : 1);
                    }
                }, 1000);
            }
            if (gameMode === '1P') {
                setTurns(turns + 1);
            }
        }
    };
    
    const handleLevelChange = (newLevel) => {
        setLevel(newLevel);
        setShowConfetti(false);
    };

    const getWinner = () => {
        if (scores.player1 > scores.player2) return "Player 1 Wins!";
        if (scores.player2 > scores.player1) return "Player 2 Wins!";
        return "It's a Draw!";
    };

    const isGameWon = matchedPairs.length > 0 && matchedPairs.length === initialCards.length / 2;

    useEffect(() => {
        if (isGameWon) {
            setShowConfetti(true);
            const timer = setTimeout(() => {
                setShowConfetti(false);
            }, 5000); // Confetti lasts for 5 seconds
            return () => clearTimeout(timer);
        }
    }, [isGameWon]);

    if (!gameMode) {
        return (
            <div className='flex flex-col items-center p-6 bg-white/30 dark:bg-gray-900/40 rounded-2xl shadow-2xl backdrop-blur-lg border border-white/20 dark:border-gray-100/20'>
                <h2 className="text-4xl font-bold mb-6 text-white" style={{ textShadow: '2px 2px 8px rgba(0,0,0,0.7)' }}>Select Game Mode</h2>
                <div className="flex gap-4">
                    <button onClick={() => setGameMode('1P')} className="btn-primary text-xl px-8 py-4">1 Player</button>
                    <button onClick={() => setGameMode('2P')} className="btn-primary text-xl px-8 py-4">2 Players</button>
                </div>
            </div>
        );
    }

    return (
        <div ref={containerRef} className='relative flex flex-col items-center p-6 bg-white/30 dark:bg-gray-900/40 rounded-2xl shadow-2xl backdrop-blur-lg border border-white/20 dark:border-gray-100/20'>
            {showConfetti && <Confetti width={dimensions.width} height={dimensions.height} />}
            <h2 className="text-4xl font-bold mb-4 text-white" style={{ textShadow: '2px 2px 8px rgba(0,0,0,0.7)' }}>Memory Game</h2>
            
            <div className="flex justify-center gap-4 mb-4">
                <button 
                    onClick={() => handleLevelChange('easy')} 
                    className={`btn-level ${level === 'easy' ? 'active' : ''}`}
                >
                    Easy
                </button>
                <button 
                    onClick={() => handleLevelChange('medium')} 
                    className={`btn-level ${level === 'medium' ? 'active' : ''}`}
                >
                    Medium
                </button>
                <button 
                    onClick={() => handleLevelChange('hard')} 
                    className={`btn-level ${level === 'hard' ? 'active' : ''}`}
                >
                    Hard
                </button>
                <button 
                    onClick={() => handleLevelChange('expert')} 
                    className={`btn-level ${level === 'expert' ? 'active' : ''}`}
                >
                    Expert
                </button>
            </div>

            {gameMode === '2P' && (
                <div className="w-full flex justify-around items-center bg-black/20 p-2 rounded-lg mb-4 text-white">
                    <div className={`p-2 rounded-md ${currentPlayer === 1 ? 'bg-blue-500' : ''}`}>
                        <span className="font-bold">Player 1:</span> {scores.player1}
                    </div>
                    <div className={`p-2 rounded-md ${currentPlayer === 2 ? 'bg-pink-500' : ''}`}>
                        <span className="font-bold">Player 2:</span> {scores.player2}
                    </div>
                </div>
            )}

            <div className="flex items-center justify-between w-full px-4 mb-4">
                {gameMode === '1P' ? (
                    <p className="text-xl font-bold text-white" style={{ textShadow: '1px 1px 4px rgba(0,0,0,0.5)' }}>Turns: {turns}</p>
                ) : (
                    <p className="text-xl font-bold text-white" style={{ textShadow: '1px 1px 4px rgba(0,0,0,0.5)' }}>
                        Turn: <span className={currentPlayer === 1 ? 'text-blue-300' : 'text-pink-300'}>Player {currentPlayer}</span>
                    </p>
                )}
                <button onClick={() => shuffleCards(level)} className="btn-primary">
                    New Game
                </button>
            </div>
            
            <div className={`grid ${gridClasses[level]} gap-3 p-4 bg-black/20 rounded-lg`}>
                {cards.map((card, index) => {
                    const isFlipped = flippedIndices.includes(index) || matchedPairs.includes(card.content);
                    return (
                       <div className={`${cardSizeClasses[level]} card-container`} key={index} onClick={() => handleCardClick(index)}>
                            <div className={`card ${isFlipped ? 'flipped' : ''}`}>
                                <div className="front">
                                    {card.content}
                                </div>
                                <div className="back">
                                    ?
                                </div>
                            </div>
                        </div>
                    );
                })}
            </div>

            {isGameWon && (
                <div className="mt-6 text-center">
                    <p className="text-2xl font-bold text-green-400" style={{ textShadow: '1px 1px 2px rgba(0,0,0,0.5)' }}>
                        {gameMode === '1P' ? `Congratulations! You won in ${turns} turns!` : getWinner()}
                    </p>
                    <button onClick={() => { setGameMode(null); setShowConfetti(false); }} className="btn-primary mt-2">Play Again</button>
                </div>
            )}
        </div>
    );
};

export default MemoryCardFlip;
