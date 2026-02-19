'use client';
import React, { useState, useEffect, useRef, useCallback } from 'react';
import Confetti from 'react-confetti';

// ─── Constants ───────────────────────────────────────────────────────────────
const ROWS = 6;
const COLS = 7;
const EMPTY = null;
const PLAYER1 = 'player1';  // always red
const PLAYER2 = 'player2';  // yellow — human partner OR AI
const AI = PLAYER2;

const DIFFICULTY_DEPTH = { Easy: 2, Medium: 4, Hard: 7 };

// ─── Board Helpers ────────────────────────────────────────────────────────────
const createBoard = () => Array(ROWS).fill(null).map(() => Array(COLS).fill(EMPTY));

const dropDisc = (board, col, player) => {
    const newBoard = board.map(r => [...r]);
    for (let r = ROWS - 1; r >= 0; r--) {
        if (newBoard[r][col] === EMPTY) {
            newBoard[r][col] = player;
            return { board: newBoard, row: r };
        }
    }
    return null;
};

const isColPlayable = (board, col) => board[0][col] === EMPTY;

const checkWinner = (board) => {
    // Horizontal
    for (let r = 0; r < ROWS; r++)
        for (let c = 0; c <= COLS - 4; c++) {
            const p = board[r][c];
            if (p && p === board[r][c + 1] && p === board[r][c + 2] && p === board[r][c + 3])
                return { winner: p, cells: [[r, c], [r, c + 1], [r, c + 2], [r, c + 3]] };
        }
    // Vertical
    for (let r = 0; r <= ROWS - 4; r++)
        for (let c = 0; c < COLS; c++) {
            const p = board[r][c];
            if (p && p === board[r + 1][c] && p === board[r + 2][c] && p === board[r + 3][c])
                return { winner: p, cells: [[r, c], [r + 1, c], [r + 2, c], [r + 3, c]] };
        }
    // Diagonal ↘
    for (let r = 0; r <= ROWS - 4; r++)
        for (let c = 0; c <= COLS - 4; c++) {
            const p = board[r][c];
            if (p && p === board[r + 1][c + 1] && p === board[r + 2][c + 2] && p === board[r + 3][c + 3])
                return { winner: p, cells: [[r, c], [r + 1, c + 1], [r + 2, c + 2], [r + 3, c + 3]] };
        }
    // Diagonal ↙
    for (let r = 0; r <= ROWS - 4; r++)
        for (let c = 3; c < COLS; c++) {
            const p = board[r][c];
            if (p && p === board[r + 1][c - 1] && p === board[r + 2][c - 2] && p === board[r + 3][c - 3])
                return { winner: p, cells: [[r, c], [r + 1, c - 1], [r + 2, c - 2], [r + 3, c - 3]] };
        }
    return null;
};

const isBoardFull = (board) => board[0].every(cell => cell !== EMPTY);

// ─── Minimax AI ───────────────────────────────────────────────────────────────
const scoreWindow = (window, piece) => {
    const opp = piece === AI ? PLAYER1 : AI;
    const pieceCount = window.filter(c => c === piece).length;
    const emptyCount = window.filter(c => c === EMPTY).length;
    const oppCount = window.filter(c => c === opp).length;
    if (pieceCount === 4) return 100;
    if (pieceCount === 3 && emptyCount === 1) return 5;
    if (pieceCount === 2 && emptyCount === 2) return 2;
    if (oppCount === 3 && emptyCount === 1) return -4;
    return 0;
};

const scoreBoard = (board) => {
    let score = 0;
    const centerCol = board.map(r => r[Math.floor(COLS / 2)]);
    score += centerCol.filter(c => c === AI).length * 3;
    for (let r = 0; r < ROWS; r++)
        for (let c = 0; c <= COLS - 4; c++)
            score += scoreWindow([board[r][c], board[r][c + 1], board[r][c + 2], board[r][c + 3]], AI);
    for (let r = 0; r <= ROWS - 4; r++)
        for (let c = 0; c < COLS; c++)
            score += scoreWindow([board[r][c], board[r + 1][c], board[r + 2][c], board[r + 3][c]], AI);
    for (let r = 0; r <= ROWS - 4; r++)
        for (let c = 0; c <= COLS - 4; c++)
            score += scoreWindow([board[r][c], board[r + 1][c + 1], board[r + 2][c + 2], board[r + 3][c + 3]], AI);
    for (let r = 0; r <= ROWS - 4; r++)
        for (let c = 3; c < COLS; c++)
            score += scoreWindow([board[r][c], board[r + 1][c - 1], board[r + 2][c - 2], board[r + 3][c - 3]], AI);
    return score;
};

const minimax = (board, depth, alpha, beta, maximizing) => {
    const result = checkWinner(board);
    if (result?.winner === AI) return { score: 100000 + depth };
    if (result?.winner === PLAYER1) return { score: -100000 - depth };
    if (isBoardFull(board) || depth === 0) return { score: scoreBoard(board) };

    const playable = Array.from({ length: COLS }, (_, i) => i).filter(c => isColPlayable(board, c));
    if (maximizing) {
        let best = { score: -Infinity, col: playable[0] };
        for (const col of playable) {
            const res = dropDisc(board, col, AI);
            if (!res) continue;
            const { score } = minimax(res.board, depth - 1, alpha, beta, false);
            if (score > best.score) best = { score, col };
            alpha = Math.max(alpha, score);
            if (alpha >= beta) break;
        }
        return best;
    } else {
        let best = { score: Infinity, col: playable[0] };
        for (const col of playable) {
            const res = dropDisc(board, col, PLAYER1);
            if (!res) continue;
            const { score } = minimax(res.board, depth - 1, alpha, beta, true);
            if (score < best.score) best = { score, col };
            beta = Math.min(beta, score);
            if (alpha >= beta) break;
        }
        return best;
    }
};

const getBestMove = (board, depth) => {
    if (depth === DIFFICULTY_DEPTH.Easy) {
        const playable = Array.from({ length: COLS }, (_, i) => i).filter(c => isColPlayable(board, c));
        return playable[Math.floor(Math.random() * playable.length)];
    }
    return minimax(board, depth, -Infinity, Infinity, true).col;
};

// ─── Cell Component ───────────────────────────────────────────────────────────
const Cell = ({ value, isWinning, isHovered, turn, onClick, onMouseEnter, onMouseLeave }) => {
    const base = 'w-10 h-10 md:w-12 md:h-12 rounded-full transition-all duration-200';
    let color = 'bg-gray-800/60';
    if (value === PLAYER1) color = isWinning
        ? 'bg-red-400 shadow-[0_0_16px_4px_rgba(248,113,113,0.8)] scale-110'
        : 'bg-red-500 shadow-[inset_0_-4px_8px_rgba(0,0,0,0.4)]';
    if (value === PLAYER2) color = isWinning
        ? 'bg-yellow-300 shadow-[0_0_16px_4px_rgba(253,224,71,0.8)] scale-110'
        : 'bg-yellow-400 shadow-[inset_0_-4px_8px_rgba(0,0,0,0.4)]';

    const hoverColor = turn === PLAYER1 ? 'bg-red-500/30' : 'bg-yellow-400/30';

    return (
        <div className="p-1 cursor-pointer" onClick={onClick} onMouseEnter={onMouseEnter} onMouseLeave={onMouseLeave}>
            <div className={`${base} ${color} ${isHovered && !value ? hoverColor : ''}`} />
        </div>
    );
};

// ─── Main Component ───────────────────────────────────────────────────────────
export default function ConnectFour() {
    // 'mode' | 'difficulty' | 'game'
    const [screen, setScreen] = useState('mode');
    const [gameMode, setGameMode] = useState(null); // 'ai' | 'partner'
    const [difficulty, setDifficulty] = useState('Medium');

    const [board, setBoard] = useState(createBoard());
    const [turn, setTurn] = useState(PLAYER1);
    const [winResult, setWinResult] = useState(null);
    const [isDraw, setIsDraw] = useState(false);
    const [hoveredCol, setHoveredCol] = useState(null);
    const [gameOver, setGameOver] = useState(false);
    const [showConfetti, setShowConfetti] = useState(false);
    const [aiThinking, setAiThinking] = useState(false);

    const containerRef = useRef(null);
    const [dims, setDims] = useState({ width: 0, height: 0 });

    useEffect(() => {
        if (containerRef.current)
            setDims({ width: containerRef.current.offsetWidth, height: containerRef.current.offsetHeight });
    }, [showConfetti, screen]);

    const endGame = useCallback((newBoard) => {
        const result = checkWinner(newBoard);
        if (result) {
            setWinResult(result);
            setGameOver(true);
            setShowConfetti(true);
            setTimeout(() => setShowConfetti(false), 6000);
            return true;
        }
        if (isBoardFull(newBoard)) {
            setIsDraw(true);
            setGameOver(true);
            return true;
        }
        return false;
    }, []);

    // AI move effect — only fires in 'ai' mode when it's PLAYER2's turn
    useEffect(() => {
        if (gameMode !== 'ai' || turn !== PLAYER2 || gameOver || screen !== 'game') return;
        setAiThinking(true);
        const timer = setTimeout(() => {
            const depth = DIFFICULTY_DEPTH[difficulty];
            const col = getBestMove(board, depth);
            const result = dropDisc(board, col, PLAYER2);
            if (result) {
                setBoard(result.board);
                if (!endGame(result.board)) setTurn(PLAYER1);
            }
            setAiThinking(false);
        }, 450);
        return () => clearTimeout(timer);
    }, [turn, gameOver, board, difficulty, screen, gameMode, endGame]);

    const handleColumnClick = (col) => {
        if (gameOver || aiThinking || !isColPlayable(board, col)) return;
        // In AI mode only PLAYER1 can click; in partner mode both can
        if (gameMode === 'ai' && turn !== PLAYER1) return;

        const result = dropDisc(board, col, turn);
        if (!result) return;
        setBoard(result.board);
        if (!endGame(result.board)) {
            setTurn(prev => prev === PLAYER1 ? PLAYER2 : PLAYER1);
        }
    };

    const startGame = (diff = difficulty) => {
        setDifficulty(diff);
        setBoard(createBoard());
        setTurn(PLAYER1);
        setWinResult(null);
        setIsDraw(false);
        setGameOver(false);
        setShowConfetti(false);
        setAiThinking(false);
        setScreen('game');
    };

    const resetGame = () => {
        setBoard(createBoard());
        setTurn(PLAYER1);
        setWinResult(null);
        setIsDraw(false);
        setGameOver(false);
        setShowConfetti(false);
        setAiThinking(false);
    };

    const isWinningCell = (r, c) =>
        winResult?.cells.some(([wr, wc]) => wr === r && wc === c) ?? false;

    // ── 1. Mode Selection ──
    if (screen === 'mode') {
        return (
            <div className="relative flex flex-col items-center p-8 bg-gray-900/60 rounded-2xl shadow-2xl backdrop-blur-lg border border-white/10 text-white min-h-[420px] justify-center gap-8">
                <div className="text-center">
                    <div className="text-6xl mb-4">🔴🟡</div>
                    <h2 className="text-4xl font-extrabold tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-red-400 to-yellow-400">
                        Connect Four
                    </h2>
                    <p className="mt-2 text-gray-400 text-lg">Choose how you want to play</p>
                </div>

                <div className="flex flex-col sm:flex-row gap-4 w-full max-w-sm">
                    {/* vs AI */}
                    <button
                        onClick={() => { setGameMode('ai'); setScreen('difficulty'); }}
                        className="flex-1 flex flex-col items-center gap-3 py-6 px-4 rounded-2xl bg-purple-600/40 border-2 border-purple-500/50 hover:bg-purple-600/60 hover:border-purple-400 hover:scale-105 active:scale-95 transition-all duration-200 shadow-[0_0_20px_rgba(147,51,234,0.3)]"
                    >
                        <span className="text-5xl">🤖</span>
                        <span className="text-xl font-bold">vs AI</span>
                        <span className="text-xs text-gray-400 text-center">Challenge the computer</span>
                    </button>

                    {/* vs Partner */}
                    <button
                        onClick={() => { setGameMode('partner'); startGame(); }}
                        className="flex-1 flex flex-col items-center gap-3 py-6 px-4 rounded-2xl bg-pink-600/40 border-2 border-pink-500/50 hover:bg-pink-600/60 hover:border-pink-400 hover:scale-105 active:scale-95 transition-all duration-200 shadow-[0_0_20px_rgba(236,72,153,0.3)]"
                    >
                        <span className="text-5xl">🧑‍🤝‍🧑</span>
                        <span className="text-xl font-bold">vs Partner</span>
                        <span className="text-xs text-gray-400 text-center">Play with a friend locally</span>
                    </button>
                </div>
            </div>
        );
    }

    // ── 2. Difficulty Selection (AI only) ──
    if (screen === 'difficulty') {
        return (
            <div className="relative flex flex-col items-center p-8 bg-gray-900/60 rounded-2xl shadow-2xl backdrop-blur-lg border border-white/10 text-white min-h-[420px] justify-center gap-8">
                <div className="text-center">
                    <div className="text-5xl mb-3">🤖</div>
                    <h2 className="text-3xl font-extrabold bg-clip-text text-transparent bg-gradient-to-r from-purple-400 to-pink-400">
                        Choose Difficulty
                    </h2>
                    <p className="mt-2 text-gray-400">How strong should the AI be?</p>
                </div>

                <div className="flex flex-col gap-3 w-full max-w-xs">
                    {[
                        { label: '😊 Easy', value: 'Easy', cls: 'bg-green-500 hover:bg-green-400 shadow-[0_0_16px_rgba(34,197,94,0.4)]' },
                        { label: '🤔 Medium', value: 'Medium', cls: 'bg-yellow-500 hover:bg-yellow-400 shadow-[0_0_16px_rgba(234,179,8,0.4)]' },
                        { label: '🔥 Hard', value: 'Hard', cls: 'bg-red-600 hover:bg-red-500 shadow-[0_0_16px_rgba(239,68,68,0.4)]' },
                    ].map(({ label, value, cls }) => (
                        <button
                            key={value}
                            onClick={() => startGame(value)}
                            className={`w-full py-3 rounded-xl text-xl font-bold transition-all duration-200 hover:scale-105 active:scale-95 ${cls}`}
                        >
                            {label}
                        </button>
                    ))}
                </div>

                <button
                    onClick={() => setScreen('mode')}
                    className="text-gray-500 hover:text-white text-sm transition-colors"
                >
                    ← Back
                </button>
            </div>
        );
    }

    // ── 3. Game Screen ──
    const isPartner = gameMode === 'partner';

    const p1Label = '🔴 Player 1';
    const p2Label = isPartner ? '🟡 Player 2' : '🟡 AI';

    const winnerName = winResult?.winner === PLAYER1
        ? (isPartner ? '🎊 Player 1 Wins!' : '🎉 You Win!')
        : (isPartner ? '🎊 Player 2 Wins!' : '🤖 AI Wins!');

    const statusLabel = gameOver
        ? (isDraw ? "🤝 It's a Draw!" : winnerName)
        : aiThinking
            ? '🤖 AI is thinking...'
            : turn === PLAYER1
                ? `${p1Label}'s Turn`
                : `${p2Label}'s Turn`;

    const statusColor = gameOver && winResult?.winner === PLAYER1
        ? 'bg-green-600/40 border-green-400/50 text-green-300'
        : gameOver && winResult?.winner === PLAYER2
            ? isPartner ? 'bg-yellow-600/40 border-yellow-400/50 text-yellow-300' : 'bg-red-600/40 border-red-400/50 text-red-300'
            : gameOver
                ? 'bg-gray-600/40 border-gray-400/30 text-gray-300'
                : aiThinking
                    ? 'bg-yellow-600/20 border-yellow-400/30 text-yellow-300'
                    : turn === PLAYER1
                        ? 'bg-red-600/20 border-red-400/30 text-red-200'
                        : 'bg-yellow-600/20 border-yellow-400/30 text-yellow-200';

    return (
        <div
            ref={containerRef}
            className="relative flex flex-col items-center p-4 md:p-6 bg-gray-900/60 rounded-2xl shadow-2xl backdrop-blur-lg border border-white/10 text-white select-none"
        >
            {showConfetti && <Confetti width={dims.width} height={dims.height} recycle={false} numberOfPieces={300} />}

            {/* Header */}
            <div className="w-full flex items-center justify-between mb-4">
                <button
                    onClick={() => setScreen('mode')}
                    className="text-sm text-gray-400 hover:text-white transition-colors px-3 py-1 rounded-lg border border-white/10 hover:border-white/30"
                >
                    ← Menu
                </button>
                <h2 className="text-2xl font-extrabold bg-clip-text text-transparent bg-gradient-to-r from-red-400 to-yellow-400">
                    Connect Four
                </h2>
                <span className="text-sm px-3 py-1 rounded-full border border-white/10 text-gray-300">
                    {isPartner ? '2P' : difficulty}
                </span>
            </div>

            {/* Status Bar */}
            <div className={`mb-4 px-6 py-2 rounded-full text-base font-bold transition-all duration-300 border ${statusColor}`}>
                {statusLabel}
            </div>

            {/* Board */}
            <div className="p-3 md:p-4 rounded-2xl bg-blue-700/80 shadow-[0_8px_32px_rgba(29,78,216,0.5)] border border-blue-500/50">
                {board.map((row, r) => (
                    <div key={r} className="flex">
                        {row.map((cell, c) => (
                            <Cell
                                key={c}
                                value={cell}
                                isWinning={isWinningCell(r, c)}
                                isHovered={hoveredCol === c}
                                turn={turn}
                                onClick={() => handleColumnClick(c)}
                                onMouseEnter={() => setHoveredCol(c)}
                                onMouseLeave={() => setHoveredCol(null)}
                            />
                        ))}
                    </div>
                ))}
            </div>

            {/* Legend */}
            <div className="flex gap-6 mt-4 text-sm text-gray-400">
                <span className="flex items-center gap-2">
                    <span className="w-4 h-4 rounded-full bg-red-500 inline-block" />
                    {isPartner ? 'Player 1' : 'You'}
                </span>
                <span className="flex items-center gap-2">
                    <span className="w-4 h-4 rounded-full bg-yellow-400 inline-block" />
                    {isPartner ? 'Player 2' : 'AI'}
                </span>
            </div>

            {/* Game Over Overlay */}
            {gameOver && (
                <div className="absolute inset-0 flex flex-col items-center justify-center rounded-2xl bg-black/70 backdrop-blur-sm gap-5">
                    <div className="text-center">
                        <p className="text-5xl mb-2">
                            {winResult ? '🎊' : '🤝'}
                        </p>
                        <p className="text-4xl font-extrabold text-white">
                            {isDraw ? "It's a Draw!" : winnerName}
                        </p>
                        <p className="text-gray-400 mt-2">
                            {isDraw
                                ? 'Perfectly matched! Play again?'
                                : winResult?.winner === PLAYER1
                                    ? (isPartner ? 'Player 1 takes the win!' : 'Outstanding! You beat the AI!')
                                    : (isPartner ? 'Player 2 takes the win!' : 'The AI wins this round!')}
                        </p>
                    </div>
                    <div className="flex gap-4 flex-wrap justify-center">
                        <button
                            onClick={resetGame}
                            className="px-6 py-3 bg-purple-600 hover:bg-purple-500 rounded-xl font-bold text-lg transition-all hover:scale-105 active:scale-95 shadow-lg"
                        >
                            Play Again
                        </button>
                        <button
                            onClick={() => setScreen('mode')}
                            className="px-6 py-3 bg-gray-700 hover:bg-gray-600 rounded-xl font-bold text-lg transition-all hover:scale-105 active:scale-95"
                        >
                            Change Mode
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
}
