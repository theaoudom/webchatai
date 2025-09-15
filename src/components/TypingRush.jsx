'use client';
import React, { useState, useEffect, useCallback, useRef } from 'react';
import Confetti from 'react-confetti';
import { wordList } from '@/data/typing-rush-words';

const TypingRush = () => {
    const [currentWord, setCurrentWord] = useState('');
    const [inputValue, setInputValue] = useState('');
    const [position, setPosition] = useState(0);
    const [speed, setSpeed] = useState(1); // Initial speed
    const [score, setScore] = useState(0);
    const [gameOver, setGameOver] = useState(true);
    const [showConfetti, setShowConfetti] = useState(false);
    const containerRef = useRef(null);
    const [dimensions, setDimensions] = useState({ width: 0, height: 0 });
    const gameAreaRef = useRef(null);

    const selectNewWord = useCallback(() => {
        const randomIndex = Math.floor(Math.random() * wordList.length);
        setCurrentWord(wordList[randomIndex]);
    }, []);

    useEffect(() => {
        if (containerRef.current) {
            setDimensions({
                width: containerRef.current.offsetWidth,
                height: containerRef.current.offsetHeight,
            });
        }
    }, [showConfetti]);

    const handleGameOver = useCallback(() => {
        setGameOver(true);
        if (score > 0) {
            setShowConfetti(true);
            const timer = setTimeout(() => {
                setShowConfetti(false);
            }, 5000);
            // No cleanup needed here as component re-renders or unmounts.
        }
    }, [score]);

    useEffect(() => {
        if (!gameOver) {
            selectNewWord();
            setPosition(0);
        }
    }, [gameOver, selectNewWord]);

    useEffect(() => {
        if (gameOver) return;

        const interval = setInterval(() => {
            setPosition(prevPos => {
                if (gameAreaRef.current && prevPos > gameAreaRef.current.offsetHeight) {
                    handleGameOver();
                    return 0;
                }
                return prevPos + speed;
            });
        }, 16); // ~60fps

        return () => clearInterval(interval);
    }, [gameOver, currentWord, handleGameOver, speed]);
    
    useEffect(() => {
        if (inputValue.toUpperCase() === currentWord && currentWord !== '') {
            setScore(prevScore => prevScore + currentWord.length);
            setSpeed(prevSpeed => prevSpeed + 0.1); // Increase speed on correct word
            setInputValue('');
            selectNewWord();
            setPosition(0);
        }
    }, [inputValue, currentWord, selectNewWord]);

    const startGame = () => {
        setGameOver(false);
        setShowConfetti(false);
        setScore(0);
        setSpeed(1); // Reset speed
        setInputValue('');
    };

    return (
        <div ref={containerRef} className="relative flex flex-col items-center p-6 bg-white/30 dark:bg-gray-900/40 rounded-2xl shadow-2xl backdrop-blur-lg border border-white/20 dark:border-gray-100/20 text-white">
            {showConfetti && <Confetti width={dimensions.width} height={dimensions.height} />}
            <h2 className="text-4xl font-bold mb-4" style={{ textShadow: '2px 2px 8px rgba(0,0,0,0.7)' }}>Typing Rush</h2>
            <p className="text-2xl font-semibold mb-4" style={{ textShadow: '1px 1px 4px rgba(0,0,0,0.5)' }}>Score: {score}</p>

            <div ref={gameAreaRef} className="w-full h-96 bg-black/30 rounded-lg mb-4 relative overflow-hidden border-2 border-white/20">
                {!gameOver ? (
                    <span 
                        className="absolute text-2xl font-bold tracking-widest"
                        style={{ top: `${position}px`, left: '50%', transform: 'translateX(-50%)' }}
                    >
                        {currentWord}
                    </span>
                ) : (
                    <div className="flex flex-col items-center justify-center h-full">
                         <h3 className="text-3xl font-bold mb-4">{score > 0 ? `Game Over! Final Score: ${score}` : "Get Ready!"}</h3>
                        <button onClick={startGame} className="btn-primary">
                            {score > 0 ? "Play Again" : "Start Game"}
                        </button>
                    </div>
                )}
            </div>
            
            <input 
                type="text"
                className="w-full p-3 text-2xl font-mono text-center bg-white/20 rounded-lg border-2 border-white/30 focus:outline-none focus:ring-2 focus:ring-yellow-400 disabled:opacity-50"
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                disabled={gameOver}
                placeholder={gameOver ? "..." : "Type here..."}
                autoFocus
            />
        </div>
    );
};

export default TypingRush;
