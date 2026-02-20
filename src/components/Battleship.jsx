'use client';
import React, { useState, useEffect, useCallback, useRef } from 'react';
import Confetti from 'react-confetti';
import { motion, AnimatePresence } from 'framer-motion';

// ─── Constants ───────────────────────────────────────────────────────────────
const BOARD_SIZE = 10;
const SHIPS = [
    { name: 'Carrier', size: 5 },
    { name: 'Battleship', size: 4 },
    { name: 'Cruiser', size: 3 },
    { name: 'Submarine', size: 3 },
    { name: 'Destroyer', size: 2 },
];
const EMPTY = 0;
const SHIP = 1;
const MISS = 2;
const HIT = 3;

// ─── Utils ───────────────────────────────────────────────────────────────────
const createBoard = () => Array(BOARD_SIZE).fill(null).map(() => Array(BOARD_SIZE).fill(EMPTY));

const placeShip = (board, ship, row, col, isVertical) => {
    const newBoard = board.map(r => [...r]);
    const positions = [];

    for (let i = 0; i < ship.size; i++) {
        const r = isVertical ? row + i : row;
        const c = isVertical ? col : col + i;

        if (r >= BOARD_SIZE || c >= BOARD_SIZE || newBoard[r][c] !== EMPTY) {
            return null;
        }
        positions.push({ r, c });
    }

    positions.forEach(({ r, c }) => {
        newBoard[r][c] = SHIP;
    });

    return { board: newBoard, positions };
};

const getRandomPlacement = (board, ship) => {
    let placed = false;
    let newBoard = board;
    let positions = [];
    let attempts = 0;

    while (!placed && attempts < 100) {
        const isVertical = Math.random() < 0.5;
        const row = Math.floor(Math.random() * BOARD_SIZE);
        const col = Math.floor(Math.random() * BOARD_SIZE);
        const result = placeShip(board, ship, row, col, isVertical);

        if (result) {
            newBoard = result.board;
            positions = result.positions;
            placed = true;
        }
        attempts++;
    }
    return { board: newBoard, positions };
};

// ─── AI Logic (Hunt & Target) ────────────────────────────────────────────────
const getAIMove = (hits, misses, lastHit, difficulty) => {
    // EASY: Pure Random
    if (difficulty === 'easy') {
        let available = [];
        for (let r = 0; r < BOARD_SIZE; r++) {
            for (let c = 0; c < BOARD_SIZE; c++) {
                if (!hits.some(h => h.r === r && h.c === c) && !misses.some(m => m.r === r && m.c === c)) {
                    available.push({ r, c });
                }
            }
        }
        return available[Math.floor(Math.random() * available.length)];
    }

    // MEDIUM & HARD: Hunt & Target Logic

    // Target Mode (If we have a hit ship that isn't sunk)
    // Actually tracking "unsunk hits" is better, but using lastHit + recursion logic is simpler for now.
    // In a robust AI, we'd keep a stack of "potential targets".

    if (lastHit) {
        const { r, c } = lastHit;
        const potentialTargets = [
            { r: r - 1, c }, { r: r + 1, c }, { r, c: c - 1 }, { r, c: c + 1 }
        ].filter(p =>
            p.r >= 0 && p.r < BOARD_SIZE &&
            p.c >= 0 && p.c < BOARD_SIZE &&
            !hits.some(h => h.r === p.r && h.c === p.c) &&
            !misses.some(m => m.r === p.r && m.c === p.c)
        );

        if (potentialTargets.length > 0) {
            return potentialTargets[Math.floor(Math.random() * potentialTargets.length)];
        }
    }

    // Hunt Mode
    let available = [];
    for (let r = 0; r < BOARD_SIZE; r++) {
        for (let c = 0; c < BOARD_SIZE; c++) {
            if (!hits.some(h => h.r === r && h.c === c) && !misses.some(m => m.r === r && m.c === c)) {
                // HARD MODE: Parity (Checkerboard) Strategy
                // Only target cells where r+c is even (or odd).
                // This works because smallest ship is 2, so it MUST cross a parity line.
                // Wait, Destroyer is 2. Parity guarantees hitting any ship size >= 2.

                if (difficulty === 'hard') {
                    if ((r + c) % 2 === 0) available.push({ r, c });
                } else {
                    available.push({ r, c });
                }
            }
        }
    }

    // Fallback if no parity moves left (shouldn't happen unless board is full of parity hits but game not over, which logic prevents)
    // Or if we need to clean up odd cells (rare).
    if (available.length === 0 && difficulty === 'hard') {
        for (let r = 0; r < BOARD_SIZE; r++) {
            for (let c = 0; c < BOARD_SIZE; c++) {
                if (!hits.some(h => h.r === r && h.c === c) && !misses.some(m => m.r === r && m.c === c)) {
                    available.push({ r, c });
                }
            }
        }
    }

    return available[Math.floor(Math.random() * available.length)];
};


// ─── Components ──────────────────────────────────────────────────────────────
const GridCell = ({ value, onClick, isTarget, showShips, disabled, isShipHit }) => {
    let bg = 'bg-blue-900/40 border-blue-500/30';
    let content = null;

    if (value === SHIP && showShips) bg = 'bg-gray-600 border-gray-500';
    if (value === MISS) {
        bg = 'bg-blue-900/40 border-blue-500/30';
        content = <div className="w-2 h-2 md:w-3 md:h-3 rounded-full bg-white/50 animate-pulse" />;
    }
    if (value === HIT) {
        bg = 'bg-red-900/60 border-red-500';
        content = <div className="text-red-500 font-bold text-lg">❌</div>;
    }

    return (
        <div
            onClick={!disabled ? onClick : undefined}
            className={`w-7 h-7 md:w-9 md:h-9 flex items-center justify-center border transition-colors ${bg} ${!disabled ? 'cursor-crosshair hover:bg-blue-700/50' : ''}`}
        >
            {content}
        </div>
    );
};

export default function Battleship() {
    const [phase, setPhase] = useState('mode'); // 'mode' | 'difficultySelect' | 'placement' | 'battle' | 'gameOver'
    const [gameMode, setGameMode] = useState(null); // 'ai' | 'partner'
    const [difficulty, setDifficulty] = useState('medium'); // 'easy' | 'medium' | 'hard'

    // Game Data
    const [boards, setBoards] = useState({ p1: createBoard(), p2: createBoard() });
    const [ships, setShips] = useState({ p1: [], p2: [] });
    const [turn, setTurn] = useState('p1'); // 'p1' | 'p2'

    // Placement State
    const [currentShipIndex, setCurrentShipIndex] = useState(0);
    const [isVertical, setIsVertical] = useState(false);
    const [placingPlayer, setPlacingPlayer] = useState('p1'); // 'p1' | 'p2'

    // AI & Game Logic State
    const [aiLastHit, setAiLastHit] = useState(null);
    const [winner, setWinner] = useState(null);
    const [log, setLog] = useState(['Welcome, Commander! Select a mode.']);
    const [showConfetti, setShowConfetti] = useState(false);

    // UI Refs
    const containerRef = useRef(null);
    const [dims, setDims] = useState({ width: 0, height: 0 });

    useEffect(() => {
        if (containerRef.current)
            setDims({ width: containerRef.current.offsetWidth, height: containerRef.current.offsetHeight });
    }, []);

    const addLog = (msg) => setLog(prev => [msg, ...prev].slice(0, 5));

    // ─── Game Flow ─────────────────────────────────────────────────────────────
    const handleModeSelect = (mode) => {
        setGameMode(mode);
        if (mode === 'ai') {
            setPhase('difficultySelect');
        } else {
            startGame(mode);
        }
    };

    const startGame = (mode, diff = 'medium') => {
        setGameMode(mode);
        setDifficulty(diff);
        setBoards({ p1: createBoard(), p2: createBoard() });
        setShips({ p1: [], p2: [] });
        setTurn('p1');
        setPlacingPlayer('p1');
        setCurrentShipIndex(0);
        setPhase('placement');
        setWinner(null);
        setLog([`Starting ${mode === 'ai' ? `Vs AI (${diff})` : 'Vs Partner'} Mode. Player 1, deploy fleet!`]);
    };

    const nextPhase = () => {
        if (phase === 'placement') {
            if (gameMode === 'ai') {
                // AI placement logic
                setupAiBoard();
                setPhase('battle');
                addLog("Enemy fleet detected! Battle stations!");
            } else {
                // Partner mode: switch to P2 placement or Battle
                if (placingPlayer === 'p1') {
                    setPlacingPlayer('p2');
                    setCurrentShipIndex(0);
                    addLog("Player 2, deploy your fleet.");
                } else {
                    setPhase('battle');
                    setTurn('p1');
                    addLog("All fleets deployed. Battle stations!");
                }
            }
        }
    };

    // ─── Placement Logic ───────────────────────────────────────────────────────
    const handlePlacementClick = (r, c) => {
        if (phase !== 'placement') return;

        // Safety: ensure P1 clicks Left, P2 clicks Right.
        const isTarget = placingPlayer === 'p1' ? 'p1' : 'p2'; // Actually, in renderGrid we enforce this.
        // So we just rely on calling renderGrid's onClick.

        const activePlayer = placingPlayer;
        const ship = SHIPS[currentShipIndex];
        if (!ship) return;

        // Logic is handled in renderBoard's onClick, so we just place on activePlayer board.
        const result = placeShip(boards[activePlayer], ship, r, c, isVertical);

        if (result) {
            setBoards(prev => ({ ...prev, [activePlayer]: result.board }));
            setShips(prev => ({
                ...prev,
                [activePlayer]: [...prev[activePlayer], { ...ship, hits: 0, positions: result.positions, sunk: false }]
            }));

            if (currentShipIndex < SHIPS.length - 1) {
                setCurrentShipIndex(currentShipIndex + 1);
            } else {
                nextPhase();
            }
        }
    };

    const setupAiBoard = () => {
        let board = createBoard();
        let aiShipsList = [];

        SHIPS.forEach(ship => {
            const result = getRandomPlacement(board, ship);
            board = result.board;
            aiShipsList.push({ ...ship, hits: 0, positions: result.positions, sunk: false });
        });
        setBoards(prev => ({ ...prev, p2: board }));
        setShips(prev => ({ ...prev, p2: aiShipsList }));
    };

    // ─── Battle Logic ──────────────────────────────────────────────────────────
    const handleFire = (r, c, targetPlayer) => {
        if (phase !== 'battle') return;

        // Who is firing?
        const attacker = turn;

        // Target validation
        if (targetPlayer === attacker) return; // Cannot shoot yourself

        // AI Check
        if (gameMode === 'ai' && attacker === 'p2') return; // User cannot fire for AI

        const defender = targetPlayer;

        // Check if cell already hit
        const defenderBoard = boards[defender];
        if (defenderBoard[r][c] === HIT || defenderBoard[r][c] === MISS) return;

        const isHit = defenderBoard[r][c] === SHIP;

        // Update Board
        const newDefenderBoard = defenderBoard.map(row => [...row]);
        newDefenderBoard[r][c] = isHit ? HIT : MISS;
        setBoards(prev => ({ ...prev, [defender]: newDefenderBoard }));

        // Update Ships & Logs
        if (isHit) {
            const newShips = ships[defender].map(s => {
                const hitPos = s.positions.find(p => p.r === r && p.c === c);
                if (hitPos) return { ...s, hits: s.hits + 1, sunk: s.hits + 1 === s.size };
                return s;
            });
            setShips(prev => ({ ...prev, [defender]: newShips }));

            addLog(`${attacker === 'p1' ? 'Player 1' : 'Player 2'} HIT at ${String.fromCharCode(65 + c)}${r + 1}!`);

            // Check Sunk/Win
            const sunkShip = newShips.find(s => s.hits === s.size && !ships[defender].find(old => old.name === s.name).sunk);
            if (sunkShip) {
                addLog(`Sunk ${sunkShip.name}!`);
                setAiLastHit(null); // Reset AI target on sink
            }

            if (newShips.every(s => s.sunk)) {
                setWinner(attacker);
                setPhase('gameOver');
                setShowConfetti(true);
                return;
            }
        } else {
            addLog(`${attacker === 'p1' ? 'Player 1' : 'Player 2'} missed.`);

            // Switch Turn
            if (gameMode === 'ai') {
                setTurn('p2');
            } else {
                setTurn(turn === 'p1' ? 'p2' : 'p1');
            }
        }
    };

    // AI Turn Effect
    useEffect(() => {
        if (gameMode === 'ai' && phase === 'battle' && turn === 'p2') {
            const timeout = setTimeout(() => {
                // AI Logic: AI targets P1 (Left Grid)
                const hits = [];
                const misses = [];
                boards.p1.forEach((row, r) => row.forEach((cell, c) => {
                    if (cell === HIT) hits.push({ r, c });
                    if (cell === MISS) misses.push({ r, c });
                }));

                const move = getAIMove(hits, misses, aiLastHit, difficulty);
                if (move) {
                    const { r, c } = move;
                    const isHit = boards.p1[r][c] === SHIP;

                    // Update P1 Board (AI hits player)
                    const newP1Board = boards.p1.map(row => [...row]);
                    newP1Board[r][c] = isHit ? HIT : MISS;
                    setBoards(prev => ({ ...prev, p1: newP1Board }));

                    if (isHit) {
                        setAiLastHit({ r, c });
                        const newShips = ships.p1.map(s => {
                            const hitPos = s.positions.find(p => p.r === r && p.c === c);
                            if (hitPos) return { ...s, hits: s.hits + 1, sunk: s.hits + 1 === s.size };
                            return s;
                        });
                        setShips(prev => ({ ...prev, p1: newShips }));
                        addLog(`AI HIT your ship!`);

                        // If sunk, reset AI Memory
                        const sunkShip = newShips.find(s => s.hits === s.size && !ships.p1.find(old => old.name === s.name).sunk);
                        if (sunkShip) setAiLastHit(null);

                        if (newShips.every(s => s.sunk)) {
                            setWinner('p2');
                            setPhase('gameOver');
                        }
                    } else {
                        addLog(`AI missed.`);
                        setTurn('p1');
                    }
                }
            }, 1000);
            return () => clearTimeout(timeout);
        }
    }, [gameMode, phase, turn, boards.p1, ships.p1, aiLastHit, difficulty]);


    // ─── Render ────────────────────────────────────────────────────────────────
    // Fixed Layout: Left = P1, Right = P2
    const renderGrid = (playerKey) => {
        const board = boards[playerKey];

        // Placement Interaction
        const isPlacementTarget = phase === 'placement' && placingPlayer === playerKey;

        // Battle Interaction
        const isBattleTarget = phase === 'battle' && turn !== playerKey;

        let disabled = true;
        if (phase === 'placement') disabled = !isPlacementTarget;
        if (phase === 'battle') {
            if (gameMode === 'ai' && turn === 'p2') disabled = true; // AI Turn lock
            else disabled = !isBattleTarget;
        }
        if (phase === 'gameOver') disabled = true;

        const showShips = phase === 'gameOver' || (phase === 'placement' && isPlacementTarget);

        return (
            <div className={`relative flex flex-col items-center p-2 rounded-xl transition-all duration-300 border-4 ${(phase === 'placement' && placingPlayer === playerKey) || (phase === 'battle' && turn === playerKey)
                    ? (playerKey === 'p1' ? 'border-blue-500 bg-blue-900/20 shadow-blue-500/20' : 'border-red-500 bg-red-900/20 shadow-red-500/20')
                    : 'border-slate-700 bg-slate-800/50 opacity-80'
                }`}>
                <h3 className={`mb-2 font-bold uppercase tracking-widest ${playerKey === 'p1' ? 'text-blue-300' : 'text-red-300'}`}>
                    {playerKey === 'p1' ? 'Player 1 Fleet' : 'Player 2 Fleet'}
                </h3>

                <div className="grid grid-cols-10 gap-px bg-slate-900/50 border-2 border-slate-600 p-1">
                    {board.map((row, r) => (
                        row.map((cell, c) => (
                            <GridCell
                                key={`${r}-${c}`}
                                value={cell}
                                showShips={showShips}
                                disabled={disabled}
                                onClick={() => phase === 'placement' ? handlePlacementClick(r, c) : handleFire(r, c, playerKey)}
                            />
                        ))
                    ))}
                </div>

                {/* Fleet Status */}
                <div className={`mt-4 w-full grid grid-cols-2 gap-2 transition-opacity ${phase === 'placement' ? 'opacity-0' : 'opacity-100'}`}>
                    {ships[playerKey].map(s => (
                        <div key={s.name} className={`text-xs px-2 py-1 rounded border transition-colors ${s.sunk
                                ? 'bg-red-900/50 border-red-500 text-red-300 line-through'
                                : 'bg-slate-800 border-slate-600 text-slate-400'
                            }`}>
                            {s.name}
                        </div>
                    ))}
                </div>
            </div>
        );
    };

    return (
        <div ref={containerRef} className="relative flex flex-col items-center w-full max-w-6xl mx-auto p-4 text-white min-h-[600px]">
            {showConfetti && <Confetti width={dims.width} height={dims.height} recycle={false} />}

            <h1 className="text-4xl font-bold mb-8 tracking-widest uppercase text-slate-200 drop-shadow-lg">
                Battleship Command
            </h1>

            {/* Mode Selection */}
            {phase === 'mode' && (
                <div className="flex flex-col gap-6 items-center animate-in fade-in zoom-in duration-500 p-10 bg-slate-800/50 rounded-3xl border border-slate-700">
                    <h2 className="text-2xl text-slate-300">Select Game Mode</h2>
                    <div className="flex gap-6">
                        <button onClick={() => handleModeSelect('ai')} className="px-10 py-8 bg-slate-800 hover:bg-slate-700 border-2 border-blue-500 rounded-2xl flex flex-col items-center gap-3 transition-all hover:scale-105 shadow-xl">
                            <span className="text-5xl">🤖</span>
                            <span className="font-bold text-xl">Vs AI</span>
                            <span className="text-xs text-slate-400">Solo Mission</span>
                        </button>
                        <button onClick={() => startGame('partner')} className="px-10 py-8 bg-slate-800 hover:bg-slate-700 border-2 border-red-500 rounded-2xl flex flex-col items-center gap-3 transition-all hover:scale-105 shadow-xl">
                            <span className="text-5xl">⚔️</span>
                            <span className="font-bold text-xl">Vs Partner</span>
                            <span className="text-xs text-slate-400">Head to Head</span>
                        </button>
                    </div>
                </div>
            )}

            {/* Difficulty Selection */}
            {phase === 'difficultySelect' && (
                <div className="flex flex-col gap-6 items-center animate-in fade-in zoom-in duration-500 p-10 bg-slate-800/50 rounded-3xl border border-slate-700">
                    <h2 className="text-2xl text-slate-300 mb-4">Select AI Difficulty</h2>
                    <div className="flex gap-4">
                        <button onClick={() => startGame('ai', 'easy')} className="px-8 py-6 bg-slate-800 hover:bg-green-900/40 border-2 border-green-500 rounded-xl flex flex-col items-center gap-2 hover:scale-105 transition-all">
                            <span className="text-3xl">🐣</span>
                            <span className="font-bold">Easy</span>
                            <span className="text-xs text-slate-400">Blind Firing</span>
                        </button>
                        <button onClick={() => startGame('ai', 'medium')} className="px-8 py-6 bg-slate-800 hover:bg-yellow-900/40 border-2 border-yellow-500 rounded-xl flex flex-col items-center gap-2 hover:scale-105 transition-all">
                            <span className="text-3xl">🐺</span>
                            <span className="font-bold">Medium</span>
                            <span className="text-xs text-slate-400">Hunt & Target</span>
                        </button>
                        <button onClick={() => startGame('ai', 'hard')} className="px-8 py-6 bg-slate-800 hover:bg-red-900/40 border-2 border-red-500 rounded-xl flex flex-col items-center gap-2 hover:scale-105 transition-all">
                            <span className="text-3xl">💀</span>
                            <span className="font-bold">Hard</span>
                            <span className="text-xs text-slate-400">Strategist</span>
                        </button>
                    </div>
                    <button onClick={() => setPhase('mode')} className="mt-4 text-slate-500 hover:text-white underline">Back</button>
                </div>
            )}

            {(phase === 'placement' || phase === 'battle' || phase === 'gameOver') && (
                <div className="flex flex-col gap-6 w-full animate-in fade-in duration-500">
                    {/* Status Bar */}
                    <div className="flex justify-between items-center bg-slate-900/80 p-4 rounded-xl border border-slate-700 backdrop-blur-md">
                        <div className="flex flex-col">
                            <span className="text-xs text-slate-500 uppercase">Mission Status</span>
                            <span className="text-xl font-bold text-yellow-400">
                                {phase === 'placement'
                                    ? `${placingPlayer === 'p1' ? 'Player 1' : 'Player 2'} Deploying...`
                                    : (turn === 'p1' ? 'Player 1 Attacking' : (gameMode === 'ai' ? 'Enemy Attacking' : 'Player 2 Attacking'))
                                }
                            </span>
                        </div>
                        <div className="font-mono text-green-400 text-sm md:text-base">{log[0]}</div>
                    </div>

                    {/* Main Game Area */}
                    <div className="flex flex-col md:flex-row gap-8 justify-center items-start">

                        {/* Left Side: Player 1 */}
                        {renderGrid('p1')}

                        {/* Center Controls (Placement Only) */}
                        {phase === 'placement' && (
                            <div className="flex flex-col gap-4 p-4 bg-slate-800 rounded-xl border border-slate-600 h-fit self-center">
                                <div className="text-center">
                                    <p className="text-xs text-slate-400 uppercase">Deploying</p>
                                    <p className="text-xl font-bold text-white">{SHIPS[currentShipIndex].name}</p>
                                    <p className="text-xs text-slate-500">Size: {SHIPS[currentShipIndex].size}</p>
                                </div>
                                <button
                                    onClick={() => setIsVertical(!isVertical)}
                                    className="px-6 py-2 bg-slate-700 hover:bg-slate-600 rounded font-bold transition-colors border border-slate-500"
                                >
                                    {isVertical ? 'Vertical ↕' : 'Horizontal ↔'}
                                </button>
                            </div>
                        )}

                        {/* Right Side: Player 2 */}
                        {renderGrid('p2')}

                    </div>
                </div>
            )}

            {/* Game Over Modal */}
            {phase === 'gameOver' && (
                <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 animate-in zoom-in duration-300">
                    <div className="bg-slate-900 p-10 rounded-3xl border-2 border-white/10 text-center max-w-lg shadow-2xl">
                        <h2 className={`text-6xl font-black mb-4 ${(winner === 'p1') ? 'text-blue-500' : 'text-red-500'
                            }`}>
                            {winner === 'p1' ? 'PLAYER 1 WINS' : 'PLAYER 2 WINS'}
                        </h2>
                        <p className="text-slate-400 text-xl mb-8">
                            {winner === 'p1' ? 'Sector secured. Enemy fleet eliminated.' : 'Defense failed. Sector lost.'}
                        </p>
                        <button
                            onClick={() => window.location.reload()}
                            className="px-10 py-4 bg-white text-slate-900 hover:bg-slate-200 rounded-xl font-bold text-xl shadow-lg hover:scale-105 transition-all"
                        >
                            New Mission
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
}
