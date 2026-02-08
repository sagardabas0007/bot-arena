'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import { motion } from 'framer-motion';
import { Clock, Users, AlertTriangle, Zap, ArrowLeft } from 'lucide-react';
import Link from 'next/link';
import toast from 'react-hot-toast';
import GameGrid from '@/components/GameGrid';
import PrizePool from '@/components/PrizePool';
import BotSprite from '@/components/BotSprite';
import { useGameStore } from '@/store/gameStore';
import { useWebSocket } from '@/hooks/useWebSocket';
import { ARENAS, GAME_CONFIG } from '@/lib/constants';
import { getStatusLabel, getDifficultyColor } from '@/lib/utils';
import type { GameGrid as GameGridType, BotPosition, GameStatus } from '@/types/game';

function generateDemoGrid(rows: number, cols: number, obstacleCount: number): GameGridType {
  const obstacles: { x: number; y: number }[] = [];
  const used = new Set<string>();
  used.add('0,0');
  used.add(`${cols - 1},${rows - 1}`);

  while (obstacles.length < obstacleCount) {
    const x = Math.floor(Math.random() * cols);
    const y = Math.floor(Math.random() * rows);
    const key = `${x},${y}`;
    if (!used.has(key)) {
      used.add(key);
      obstacles.push({ x, y });
    }
  }

  const cells = Array.from({ length: rows }, (_, y) =>
    Array.from({ length: cols }, (_, x) => ({
      x,
      y,
      isObstacle: obstacles.some((o) => o.x === x && o.y === y),
      isStart: x === 0 && y === 0,
      isEnd: x === cols - 1 && y === rows - 1,
    }))
  );

  return { rows, cols, cells, obstacles };
}

export default function ArenaPage() {
  const params = useParams();
  const arenaId = Number(params.id);
  const arena = ARENAS.find((a) => a.id === arenaId);

  const { currentGame, botPositions, updateBotPositions } = useGameStore();
  const { isConnected, emit } = useWebSocket();

  const [gameStatus, setGameStatus] = useState<GameStatus>('WAITING');
  const [participants, setParticipants] = useState<{ botId: string; username: string; characterId: number }[]>([]);
  const [timer, setTimer] = useState(0);
  const [currentLevel, setCurrentLevel] = useState(1);
  const [gameGrid, setGameGrid] = useState<GameGridType | null>(null);
  const [joining, setJoining] = useState(false);

  useEffect(() => {
    if (arena) {
      setGameGrid(generateDemoGrid(arena.gridSize.rows, arena.gridSize.cols, arena.obstacleCount));
      // Demo participants
      const demoBots = Array.from({ length: 4 }, (_, i) => ({
        botId: `bot-${i}`,
        username: `Bot_${i + 1}`,
        characterId: i,
      }));
      setParticipants(demoBots);

      const demoPositions: BotPosition[] = demoBots.map((b, i) => ({
        botId: b.botId,
        x: Math.floor(Math.random() * Math.min(arena.gridSize.cols, 5)),
        y: Math.floor(Math.random() * Math.min(arena.gridSize.rows, 5)),
        characterId: b.characterId,
      }));
      updateBotPositions(demoPositions);
    }
  }, [arena, updateBotPositions]);

  useEffect(() => {
    if (gameStatus === 'LEVEL_1' || gameStatus === 'LEVEL_2' || gameStatus === 'LEVEL_3') {
      const interval = setInterval(() => setTimer((t) => t + 1), 1000);
      return () => clearInterval(interval);
    }
  }, [gameStatus]);


  const handleJoinGame = async () => {
    if (!arena) return;
    setJoining(true);
    try {
      toast.success('Joined arena successfully!');

      // Create a new bot entry with a unique ID
      const newBotId = `bot-${participants.length}`;
      const newBot = {
        botId: newBotId,
        username: `Bot_${participants.length + 1}`,
        characterId: participants.length % 10,
      };

      // Update participants list
      setParticipants((prev) => [...prev, newBot]);

      // Update bot positions to include the new bot
      const newPosition: BotPosition = {
        botId: newBotId,
        x: Math.floor(Math.random() * Math.min(arena.gridSize.cols, 5)),
        y: Math.floor(Math.random() * Math.min(arena.gridSize.rows, 5)),
        characterId: newBot.characterId,
      };

      updateBotPositions([...botPositions, newPosition]);
    } catch {
      toast.error('Failed to join arena');
    } finally {
      setJoining(false);
    }
  };

  if (!arena) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h2 className="font-orbitron text-2xl text-gray-400 mb-4">Arena Not Found</h2>
          <Link href="/" className="text-cyan hover:underline">Back to Home</Link>
        </div>
      </div>
    );
  }

  const diffColor = getDifficultyColor(arena.difficulty);
  const prizePool = (parseFloat(arena.entryFee) * participants.length).toFixed(2);

  return (
    <div className="min-h-screen py-8 px-4">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex items-center gap-4 mb-8">
          <Link href="/" className="p-2 rounded-lg bg-surface hover:bg-surface-light transition-colors">
            <ArrowLeft className="w-5 h-5 text-gray-400" />
          </Link>
          <div>
            <h1 className="font-orbitron font-bold text-2xl md:text-3xl">{arena.name}</h1>
            <div className="flex items-center gap-3 mt-1">
              <span className={`text-xs font-bold px-2 py-0.5 rounded ${diffColor}`}>
                {arena.difficulty}
              </span>
              <span className="text-gray-500 text-sm">{arena.gridSize.rows}x{arena.gridSize.cols} grid</span>
              <span className="text-gray-500 text-sm">{arena.obstacleCount} obstacles</span>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left - Game Grid */}
          <div className="lg:col-span-2">
            <div className="glass-card p-6">
              {/* Game Status Bar */}
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className={`w-2 h-2 rounded-full ${gameStatus === 'WAITING' ? 'bg-gold animate-pulse' : 'bg-success'}`} />
                  <span className="font-orbitron text-sm text-gray-400">{getStatusLabel(gameStatus)}</span>
                </div>
                <div className="flex items-center gap-4">
                  <div className="flex items-center gap-1.5 text-sm text-gray-400">
                    <Zap className="w-4 h-4 text-cyan" />
                    <span>Level {currentLevel}/3</span>
                  </div>
                  <div className="flex items-center gap-1.5 text-sm text-gray-400">
                    <Clock className="w-4 h-4 text-magenta" />
                    <span>{timer}s / {arena.timeLimit}s</span>
                  </div>
                </div>
              </div>

              {/* Grid */}
              {gameGrid && (
                <GameGrid gameGrid={gameGrid} botPositions={botPositions} />
              )}
            </div>
          </div>

          {/* Right - Info Panel */}
          <div className="space-y-6">
            {/* Prize Pool */}
            <PrizePool
              prizePool={prizePool}
              participantCount={participants.length}
              entryFee={arena.entryFee}
            />

            {/* Join Button */}
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={handleJoinGame}
              disabled={joining || participants.length >= GAME_CONFIG.MAX_PARTICIPANTS}
              className="w-full py-4 px-6 bg-gradient-to-r from-cyan to-magenta text-dark-blue font-orbitron font-bold rounded-lg hover:opacity-90 transition-opacity disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {joining ? 'Joining...' : `Join Arena - ${arena.entryFee} USDC`}
            </motion.button>

            {/* Participants */}
            <div className="glass-card p-5">
              <div className="flex items-center gap-2 mb-4">
                <Users className="w-4 h-4 text-cyan" />
                <span className="font-orbitron text-sm font-bold">
                  Participants ({participants.length}/{GAME_CONFIG.MAX_PARTICIPANTS})
                </span>
              </div>
              <div className="space-y-3">
                {participants.map((p) => (
                  <div key={p.botId} className="flex items-center gap-3 p-2 rounded-lg bg-surface/50">
                    <BotSprite botId={p.botId} characterId={p.characterId} size={28} />
                    <span className="text-sm text-gray-300">{p.username}</span>
                  </div>
                ))}
                {participants.length === 0 && (
                  <p className="text-gray-600 text-sm text-center py-4">Waiting for players...</p>
                )}
              </div>
            </div>

            {/* Game Rules */}
            <div className="glass-card p-5">
              <h3 className="font-orbitron text-sm font-bold mb-3 flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 text-gold" /> Rules
              </h3>
              <ul className="space-y-2 text-xs text-gray-500">
                <li>Navigate from top-left (0,0) to bottom-right corner</li>
                <li>Hitting an obstacle resets to start + 10s penalty</li>
                <li>Level 1: Top 8 advance | Level 2: Top 4 | Level 3: Winner</li>
                <li>Bots that exceed {arena.timeLimit}s are eliminated</li>
                <li>Winner receives 90% of the prize pool</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
