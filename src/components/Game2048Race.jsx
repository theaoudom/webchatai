'use client';

import React, { useState, useEffect, useCallback, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

const GRID_SIZE = 4;
const INITIAL_TILES = 2; // Number of tiles to spawn at start
const WIN_TILE = 2048;

const Game2048Race = () => {
    const [gameState, setGameState] = useState('menu'); // 'menu', 'playing', 'won', 'lost', 'draw'
    const [difficulty, setDifficulty] = useState('medium'); // 'easy', 'medium', 'hard'
    const [winner, setWinner] = useState(null);
    const [playerBoard, setPlayerBoard] = useState([]);
    const [aiBoard, setAiBoard] = useState([]);
    const [playerScore, setPlayerScore] = useState(0);
    const [aiScore, setAiScore] = useState(0);
    const playerBoardRef = useRef(playerBoard); // Keep ref for event listeners
    const aiBoardRef = useRef(aiBoard);
    const aiIntervalRef = useRef(null);
    const difficultyRef = useRef(difficulty); // Ref for interval access

    // --- Core Logic ---

    // Initialize a new board
    const createBoard = () => {
        let board = Array(GRID_SIZE).fill(null).map(() => Array(GRID_SIZE).fill(0));
        for (let i = 0; i < INITIAL_TILES; i++) {
            board = placeRandomTile(board);
        }
        return board;
    };

    // Place a random tile (2 or 4)
    const placeRandomTile = (board) => {
        const emptyCells = [];
        for (let r = 0; r < GRID_SIZE; r++) {
            for (let c = 0; c < GRID_SIZE; c++) {
                if (board[r][c] === 0) emptyCells.push({ r, c });
            }
        }
        if (emptyCells.length === 0) return board;

        const { r, c } = emptyCells[Math.floor(Math.random() * emptyCells.length)];
        const newBoard = board.map(row => [...row]);
        newBoard[r][c] = Math.random() < 0.9 ? 2 : 4;
        return newBoard;
    };

    // Move logic (slide & merge)
    // Direction: 0: Up, 1: Right, 2: Down, 3: Left
    const moveBoard = (board, direction) => {
        let newBoard = board.map(row => [...row]);
        let score = 0;
        let moved = false;

        const rotateLeft = (b) => {
            const size = b.length;
            const res = Array(size).fill(null).map(() => Array(size).fill(0));
            for (let i = 0; i < size; i++) {
                for (let j = 0; j < size; j++) {
                    res[i][j] = b[j][size - 1 - i];
                }
            }
            return res;
        };

        const rotateRight = (b) => {
            const size = b.length;
            const res = Array(size).fill(null).map(() => Array(size).fill(0));
            for (let i = 0; i < size; i++) {
                for (let j = 0; j < size; j++) {
                    res[i][j] = b[size - 1 - j][i];
                }
            }
            return res;
        };


        // Normalize to checking "Left" movement by rotating
        // Up (0) -> Rotate Left -> Move Left -> Rotate Right to restore
        // Right (1) -> Rotate 180 (Left x2) -> Move Left? No wait.
        // Let's standardise:
        // Left (3): Base case.
        // Right (1): Flip horizontally? Or Rotate 180.
        // Up (0): Rotate Left (counter-clockwise 90).
        // Down (2): Rotate Right (clockwise 90). (Wait, moving left on rotated right board = moving down on original?)

        // Let's use simpler index math or just rotate until "Left" is the operation
        // 0: Up -> Rotate Left (ccw) -> Slide Left -> Rotate Right (cw)
        // 1: Right -> Rotate 180 -> Slide Left -> Rotate 180
        // 2: Down -> Rotate Right (cw) -> Slide Left -> Rotate Left (ccw)
        // 3: Left -> Slide Left

        let rotations = 0;
        if (direction === 0) rotations = 1; // Up -> Rotate Left to make "Up" point "Left"? No.
        // If we want to slide Up, we rotate such that Top becomes Left. That is Rotate Left (Counter Clockwise).
        //   1 2      2 4
        //   3 4  ->  1 3
        // If we slide left: 2 4 / 1 3. Then rotate back (Right/Clockwise):
        //   2 4      1 2
        //   1 3  ->  3 4  (Wait, this matches original if no change)

        if (direction === 0) { // Up
            newBoard = rotateLeft(newBoard);
            rotations = 1;
        } else if (direction === 1) { // Right
            newBoard = rotateLeft(newBoard);
            newBoard = rotateLeft(newBoard);
            rotations = 2;
        } else if (direction === 2) { // Down
            newBoard = rotateRight(newBoard);
            rotations = 3; // Equivalent to 1 right
        }
        // If direction == 3 (Left), no rotation needed.

        // Slide Left Logic
        for (let r = 0; r < GRID_SIZE; r++) {
            let row = newBoard[r].filter(val => val !== 0); // Remove zeros
            let newRow = [];
            let skip = false;

            for (let c = 0; c < row.length; c++) {
                if (skip) {
                    skip = false;
                    continue;
                }
                if (c + 1 < row.length && row[c] === row[c + 1]) {
                    newRow.push(row[c] * 2);
                    score += row[c] * 2;
                    skip = true;
                } else {
                    newRow.push(row[c]);
                }
            }
            // Fill rest with zeros
            while (newRow.length < GRID_SIZE) {
                newRow.push(0);
            }

            if (newRow.join(',') !== newBoard[r].join(',')) {
                moved = true;
            }
            newBoard[r] = newRow;
        }

        // Restore rotation
        if (rotations === 1) { // Was Up (Rotated Left), need Rotate Right
            newBoard = rotateRight(newBoard);
        } else if (rotations === 2) { // Was Right (Rotated 180), need Rotate 180
            newBoard = rotateLeft(newBoard);
            newBoard = rotateLeft(newBoard);
        } else if (rotations === 3) { // Was Down (Rotated Right), need Rotate Left
            newBoard = rotateLeft(newBoard);
        }

        return { board: newBoard, score, moved };
    };

    const checkWin = (board) => {
        for (let r = 0; r < GRID_SIZE; r++) {
            for (let c = 0; c < GRID_SIZE; c++) {
                if (board[r][c] >= WIN_TILE) return true;
            }
        }
        return false;
    };

    const isGameOver = (board) => {
        // Check for empty cells
        for (let r = 0; r < GRID_SIZE; r++) {
            for (let c = 0; c < GRID_SIZE; c++) {
                if (board[r][c] === 0) return false;
            }
        }
        // Check for possible merges
        for (let r = 0; r < GRID_SIZE; r++) {
            for (let c = 0; c < GRID_SIZE; c++) {
                // Check right
                if (c + 1 < GRID_SIZE && board[r][c] === board[r][c + 1]) return false;
                // Check down
                if (r + 1 < GRID_SIZE && board[r][c] === board[r + 1][c]) return false;
            }
        }
        return true;
    };


    // --- AI Logic ---
    const getAiMove = (board) => {
        const diff = difficultyRef.current;
        let randomFactor = 0.2; // default medium

        if (diff === 'easy') randomFactor = 0.5; // 50% chance of random move
        if (diff === 'hard') randomFactor = 0.05; // 5% chance of randomness (very low error)

        // Random move logic (simulate human error or lack of strategy)
        if (Math.random() < randomFactor) {
            const moves = [0, 1, 2, 3];
            // Shuffle
            for (let i = moves.length - 1; i > 0; i--) {
                const j = Math.floor(Math.random() * (i + 1));
                [moves[i], moves[j]] = [moves[j], moves[i]];
            }
            for (let move of moves) {
                const result = moveBoard(board, move);
                if (result.moved) return move;
            }
            return 0; // Fallback
        }

        // Heuristic strategy: Corner hugger (Down-Right)
        const moves = [2, 1, 3, 0]; // Down, Right, Left, Up
        for (let move of moves) {
            const result = moveBoard(board, move);
            if (result.moved) return move;
        }
        return 0;
    };


    // --- Game Loop & Effects ---

    const startGame = () => {
        setPlayerBoard(createBoard());
        setAiBoard(createBoard());
        setPlayerScore(0);
        setAiScore(0);
        setGameState('playing');
        setWinner(null);
    };

    // Keep difficulty ref in sync for interval
    useEffect(() => {
        difficultyRef.current = difficulty;
    }, [difficulty]);

    const handlePlayerMove = useCallback((direction) => {
        if (gameState !== 'playing') return;

        const { board: newBoard, score, moved } = moveBoard(playerBoardRef.current, direction);
        if (moved) {
            const boardWithTile = placeRandomTile(newBoard);
            setPlayerBoard(boardWithTile);
            setPlayerScore(prev => prev + score);
            playerBoardRef.current = boardWithTile; // Update ref for immediate access

            if (checkWin(boardWithTile)) {
                setGameState('won');
                setWinner('Player');
            } else if (isGameOver(boardWithTile)) {
                // Player stuck, check if AI is also stuck? 
                // For race, if you get stuck you essentially lose time or the game if AI continues.
                // Maybe just "Game Over" for player.
                setGameState('lost');
                setWinner('AI');
            }
        }
    }, [gameState]); // Dep on gameState to prevent moves when not playing

    // AI Loop
    useEffect(() => {
        if (gameState !== 'playing') {
            if (aiIntervalRef.current) clearInterval(aiIntervalRef.current);
            return;
        }

        let speed = 600; // Medium
        if (difficulty === 'easy') speed = 1000;
        if (difficulty === 'hard') speed = 300;

        aiIntervalRef.current = setInterval(() => {
            const aiMoveDir = getAiMove(aiBoardRef.current);
            const { board: newBoard, score, moved } = moveBoard(aiBoardRef.current, aiMoveDir);

            if (moved) {
                const boardWithTile = placeRandomTile(newBoard);
                setAiBoard(boardWithTile);
                setAiScore(prev => prev + score);
                aiBoardRef.current = boardWithTile;

                if (checkWin(boardWithTile)) {
                    setGameState('lost');
                    setWinner('AI');
                } else if (isGameOver(boardWithTile)) {
                    // AI stuck. 
                    // In a race, if AI dies, player keeps going until win or stuck.
                    // We can just stop AI updates.
                    clearInterval(aiIntervalRef.current);
                }
            } else {
                // AI stuck but hasn't detected it? Retry or stop.
            }

        }, speed);

        return () => clearInterval(aiIntervalRef.current);
    }, [gameState, difficulty]);


    // Keyboard Listeners
    useEffect(() => {
        const handleKeyDown = (e) => {
            if (gameState !== 'playing') return;

            // Prevent scrolling
            if (["ArrowUp", "ArrowDown", "ArrowLeft", "ArrowRight"].indexOf(e.code) > -1) {
                e.preventDefault();
            }

            if (e.key === 'ArrowUp') handlePlayerMove(0);
            else if (e.key === 'ArrowRight') handlePlayerMove(1);
            else if (e.key === 'ArrowDown') handlePlayerMove(2);
            else if (e.key === 'ArrowLeft') handlePlayerMove(3);
        };

        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [gameState, handlePlayerMove]);

    // Keep refs in sync (for listeners that might capture stale state if not careful, though we use refs inside handlers mostly)
    useEffect(() => {
        playerBoardRef.current = playerBoard;
    }, [playerBoard]);
    useEffect(() => {
        aiBoardRef.current = aiBoard;
    }, [aiBoard]);


    // --- Render Helpers ---

    const getTileColor = (value) => {
        const colors = {
            2: 'bg-slate-200 text-slate-800',
            4: 'bg-slate-300 text-slate-800',
            8: 'bg-orange-200 text-white',
            16: 'bg-orange-300 text-white',
            32: 'bg-orange-400 text-white',
            64: 'bg-orange-500 text-white',
            128: 'bg-red-400 text-white',
            256: 'bg-red-500 text-white',
            512: 'bg-yellow-400 text-white',
            1024: 'bg-yellow-500 text-white',
            2048: 'bg-yellow-600 text-white shadow-[0_0_15px_rgba(234,179,8,0.6)]',
        };
        return colors[value] || 'bg-slate-800 text-slate-800'; // Default / Super high
    };

    const renderBoard = (board, isPlayer) => (
        <div className="relative bg-slate-800 p-2 rounded-lg shadow-xl border-2 border-slate-700">
            <div className="absolute -top-10 left-0 w-full flex justify-between items-end mb-2 px-1">
                <span className={`font-bold text-lg ${isPlayer ? 'text-teal-400' : 'text-red-400'}`}>
                    {isPlayer ? 'YOU' : 'AI OPPONENT'}
                </span>
                <span className="text-slate-400 text-sm font-mono">
                    Score: {isPlayer ? playerScore : aiScore}
                </span>
            </div>

            <div className="grid grid-cols-4 gap-2 w-64 h-64 sm:w-72 sm:h-72">
                {board.map((row, r) =>
                    row.map((val, c) => (
                        <div
                            key={`${r}-${c}`}
                            className={`
                                flex items-center justify-center rounded-md font-bold text-2xl transition-all duration-100
                                ${val === 0 ? 'bg-slate-700/50' : getTileColor(val)}
                            `}
                        >
                            {val > 0 && (
                                <motion.span
                                    initial={{ scale: 0.5, opacity: 0 }}
                                    animate={{ scale: 1, opacity: 1 }}
                                    key={val} // Re-animate on value change
                                >
                                    {val}
                                </motion.span>
                            )}
                        </div>
                    ))
                )}
            </div>

            {/* Overlay for game over on individual board (optional, using global overlay instead) */}
        </div>
    );

    return (
        <div className="flex flex-col items-center justify-center space-y-8 w-full max-w-4xl mx-auto">
            {/* Header */}
            <div className="text-center space-y-2">
                <h1 className="text-4xl md:text-5xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-teal-400 to-blue-500">
                    2048 RACE
                </h1>
                <p className="text-slate-400">Reach <span className="text-yellow-400 font-bold">2048</span> before the AI!</p>
            </div>

            {/* Game Area */}
            <div className="flex flex-col md:flex-row gap-8 md:gap-16 items-center justify-center">
                {gameState === 'menu' ? (
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="bg-slate-800/80 p-8 rounded-2xl border border-slate-700 backdrop-blur-sm text-center max-w-md"
                    >
                        <h2 className="text-2xl font-bold text-white mb-4">Ready to Race?</h2>

                        <div className="mb-6 space-y-2">
                            <p className="text-slate-400 text-sm mb-2">Select Difficulty</p>
                            <div className="flex gap-2 justify-center">
                                {['easy', 'medium', 'hard'].map((level) => (
                                    <button
                                        key={level}
                                        onClick={() => setDifficulty(level)}
                                        className={`px-4 py-2 rounded-lg text-sm font-bold capitalize transition-all ${difficulty === level
                                            ? 'bg-teal-500 text-slate-900 shadow-lg'
                                            : 'bg-slate-700 text-slate-400 hover:bg-slate-600'
                                            }`}
                                    >
                                        {level}
                                    </button>
                                ))}
                            </div>
                        </div>

                        <p className="text-slate-300 mb-6">
                            Use your arrow keys to move tiles. Combine matching numbers to double them.
                            Race against a bot to see who hits 2048 first!
                        </p>
                        <button
                            onClick={startGame}
                            className="px-8 py-3 bg-teal-500 hover:bg-teal-400 text-slate-900 font-bold rounded-full shadow-lg hover:shadow-teal-500/30 transition-all transform hover:scale-105"
                        >
                            Start Engine
                        </button>
                    </motion.div>
                ) : (
                    <>
                        {renderBoard(playerBoard, true)}

                        <div className="hidden md:flex flex-col items-center justify-center text-slate-600 font-mono text-xs space-y-1">
                            <span>V</span>
                            <span>S</span>
                        </div>

                        {renderBoard(aiBoard, false)}
                    </>
                )}
            </div>

            {/* Game Over Overlay */}
            <AnimatePresence>
                {(gameState === 'won' || gameState === 'lost') && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4"
                    >
                        <motion.div
                            initial={{ scale: 0.9, y: 20 }}
                            animate={{ scale: 1, y: 0 }}
                            className="bg-slate-900 border-2 border-slate-700 p-8 rounded-2xl shadow-2xl text-center max-w-sm w-full"
                        >
                            <div className="text-6xl mb-4">
                                {gameState === 'won' ? '🏆' : '💀'}
                            </div>
                            <h2 className={`text-3xl font-bold mb-2 ${gameState === 'won' ? 'text-teal-400' : 'text-red-400'}`}>
                                {gameState === 'won' ? 'VICTORY!' : 'DEFEAT'}
                            </h2>
                            <p className="text-slate-300 mb-6">
                                {gameState === 'won'
                                    ? "You reached 2048 first! Speed demon!"
                                    : "The AI beat you to the finish line."}
                            </p>
                            <div className="flex gap-4 justify-center">
                                <button
                                    onClick={() => setGameState('menu')} // Back to menu
                                    className="px-6 py-2 bg-slate-700 hover:bg-slate-600 text-white rounded-lg transition-colors"
                                >
                                    Back
                                </button>
                                <button
                                    onClick={startGame}
                                    className="px-6 py-2 bg-teal-500 hover:bg-teal-400 text-slate-900 font-bold rounded-lg shadow-lg"
                                >
                                    Race Again
                                </button>
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Mobile Controls Hint */}
            {gameState === 'playing' && (
                <div className="md:hidden text-slate-500 text-sm mt-4 animate-pulse">
                    Swipe or use on-screen controls (Coming Soon)
                    {/* TODO: Add swipe handlers if this was a real mobile app deployment */}
                </div>
            )}
        </div>
    );
};

export default Game2048Race;
