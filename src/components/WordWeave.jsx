'use client';
import React, { useState, useEffect, useRef } from 'react';
import Confetti from 'react-confetti';
import { wordBanks, levelConfig } from '@/data/word-weave-puzzles';
import { generatePuzzleGrid } from '@/utils/puzzle-generator';

const gridSize = 6;

const WordWeave = () => {
    const [level, setLevel] = useState(0);
    const [puzzle, setPuzzle] = useState(null);
    const [grid, setGrid] = useState([]);
    const [isSelecting, setIsSelecting] = useState(false);
    const [selectedLetters, setSelectedLetters] = useState([]); // [{ index, letter }]
    const [currentWord, setCurrentWord] = useState('');
    const [foundWords, setFoundWords] = useState([]);
    const [showConfetti, setShowConfetti] = useState(false);
    const containerRef = useRef(null);
    const [dimensions, setDimensions] = useState({ width: 0, height: 0 });

    useEffect(() => {
        // 1. Get current level configuration
        const currentLevelConfig = levelConfig[level];
        
        // 2. Get the word bank for the level's tier
        const bank = wordBanks[currentLevelConfig.tier];

        // 3. Randomly select words from the bank
        const shuffledBank = [...bank].sort(() => 0.5 - Math.random());
        const selectedWords = shuffledBank.slice(0, currentLevelConfig.wordCount);
        
        // 4. Create a new puzzle object for the current state
        const newPuzzle = {
            id: currentLevelConfig.id,
            words: selectedWords,
        };

        const newGrid = generatePuzzleGrid(newPuzzle.words);
        setPuzzle(newPuzzle);
        setGrid(newGrid);
        setFoundWords([]);
        setShowConfetti(false);
    }, [level]);

    useEffect(() => {
        if (containerRef.current) {
            setDimensions({
                width: containerRef.current.offsetWidth,
                height: containerRef.current.offsetHeight,
            });
        }
    }, [showConfetti]);

    const handleMouseDown = (index, letter) => {
        setIsSelecting(true);
        setSelectedLetters([{ index, letter }]);
        setCurrentWord(letter);
    };

    const handleMouseEnter = (index, letter) => {
        if (isSelecting && !selectedLetters.some(l => l.index === index)) {
            const lastLetter = selectedLetters[selectedLetters.length - 1];
            const lastRow = Math.floor(lastLetter.index / gridSize);
            const lastCol = lastLetter.index % gridSize;
            const currentRow = Math.floor(index / gridSize);
            const currentCol = index % gridSize;

            const isAdjacent = Math.abs(lastRow - currentRow) <= 1 && Math.abs(lastCol - currentCol) <= 1;

            if (isAdjacent) {
                setSelectedLetters([...selectedLetters, { index, letter }]);
                setCurrentWord(currentWord + letter);
            }
        }
    };

    const handleMouseUp = () => {
        setIsSelecting(false);
        
        if (puzzle.words.includes(currentWord) && !foundWords.includes(currentWord)) {
            setFoundWords([...foundWords, currentWord]);
            // setLastFoundIndices(selectedLetters.map(l => l.index)); // This line is removed as per new logic
            setTimeout(() => {
                // setLastFoundIndices([]); // This line is removed as per new logic
            }, 500); // Flash for 0.5s
        }
        
        setSelectedLetters([]);
        setCurrentWord('');
    };

    const loadNewPuzzle = () => {
        setShowConfetti(false);
        if (level < levelConfig.length - 1) {
            setLevel(level + 1);
        } else {
            // Optional: handle game completion or loop back to level 0
            setLevel(0); // Restart game
        }
    };

    const isGameWon = puzzle && foundWords.length === puzzle.words.length;

    useEffect(() => {
        if (isGameWon) {
            setShowConfetti(true);
            const timer = setTimeout(() => {
                setShowConfetti(false);
            }, 5000);
            return () => clearTimeout(timer);
        }
    }, [isGameWon]);

    if (!puzzle) {
        return <div>Loading...</div>; // Or a spinner
    }

    return (
        <div 
            ref={containerRef}
            className="relative flex flex-col items-center p-6 bg-white/30 dark:bg-gray-900/40 rounded-2xl shadow-2xl backdrop-blur-lg border border-white/20 dark:border-gray-100/20 select-none"
            onMouseUp={handleMouseUp}
            onMouseLeave={handleMouseUp}
        >
            {showConfetti && <Confetti width={dimensions.width} height={dimensions.height} />}
            <div className="w-full flex justify-between items-center mb-2">
                <h2 className="text-4xl font-bold text-white tracking-wider" style={{ textShadow: '2px 2px 8px rgba(0,0,0,0.7)' }}>Word Weave</h2>
                <div className="px-4 py-1 bg-black/20 rounded-full">
                    <span className="text-xl font-bold text-white">Level {level + 1}</span>
                </div>
            </div>
            
            <div className="h-12 w-full bg-black/20 rounded-lg mb-4 flex items-center justify-center">
                <p className="text-3xl font-mono text-white tracking-widest" style={{ textShadow: '2px 2px 4px rgba(0,0,0,0.5)' }}>
                    {currentWord || ' '}
                </p>
            </div>
            
            <div 
                className="grid gap-2 mb-4"
                style={{
                    gridTemplateColumns: `repeat(${gridSize}, 1fr)`,
                    width: '100%',
                    maxWidth: '400px',
                }}
            >
                {grid.map((letter, index) => {
                    const isSelected = selectedLetters.some(l => l.index === index);
                    // const isLastFound = lastFoundIndices.includes(index); // This line is removed as per new logic
                    return (
                        <div
                            key={index}
                            className={`flex items-center justify-center aspect-square text-2xl font-bold rounded-lg cursor-pointer transform transition-all duration-150
                                ${/* isLastFound */ false // This line is removed as per new logic
                                    ? 'bg-green-500 text-white scale-105'
                                    : isSelected 
                                    ? 'bg-yellow-400 dark:bg-yellow-500 text-gray-900 scale-110 rotate-3 shadow-lg' 
                                    : 'bg-white/20 dark:bg-black/20 text-gray-800 dark:text-gray-100 hover:bg-white/40 dark:hover:bg-black/40'}`
                                }
                            onMouseDown={() => handleMouseDown(index, letter)}
                            onMouseEnter={() => handleMouseEnter(index, letter)}
                        >
                            {letter}
                        </div>
                    );
                })}
            </div>

            <div className="w-full max-w-sm p-4 bg-black/10 dark:bg-white/10 rounded-lg">
                <h3 className="text-xl font-semibold mb-3 text-center text-white">
                    Words Found: {foundWords.length} / {puzzle.words.length}
                </h3>
                <div className="grid grid-cols-2 gap-2 text-center">
                    {puzzle.words.map((word, index) => (
                        <div 
                            key={index}
                            className="bg-white/10 dark:bg-black/10 rounded-md py-1"
                        >
                            <span className="text-lg font-medium text-white">
                                {foundWords.includes(word) ? word : '????'}
                            </span>
                        </div>
                    ))}
                </div>
            </div>

            {isGameWon && (
                <div className="mt-4 text-center">
                    <p className="text-2xl font-bold text-green-400" style={{ textShadow: '1px 1px 2px rgba(0,0,0,0.5)' }}>Congratulations! Level Complete!</p>
                    <button onClick={loadNewPuzzle} className="btn-primary mt-2">
                        {level < levelConfig.length - 1 ? 'Next Level' : 'Play Again'}
                    </button>
                </div>
            )}
        </div>
    );
};

export default WordWeave;
