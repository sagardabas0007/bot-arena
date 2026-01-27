'use client';

import { useMemo } from 'react';
import { motion } from 'framer-motion';
import { GameGrid as GameGridType, BotPosition } from '@/types/game';
import BotSprite from './BotSprite';
import { cn } from '@/lib/utils';

interface GameGridProps {
  gameGrid: GameGridType;
  botPositions: BotPosition[];
  cellSize?: number;
}

export default function GameGrid({ gameGrid, botPositions, cellSize: overrideCellSize }: GameGridProps) {
  const cellSize = overrideCellSize || Math.min(Math.floor(600 / Math.max(gameGrid.rows, gameGrid.cols)), 40);

  const gridWidth = gameGrid.cols * cellSize;
  const gridHeight = gameGrid.rows * cellSize;

  const obstacleSet = useMemo(() => {
    const set = new Set<string>();
    gameGrid.obstacles.forEach((obs) => set.add(`${obs.x},${obs.y}`));
    return set;
  }, [gameGrid.obstacles]);

  const botMap = useMemo(() => {
    const map = new Map<string, BotPosition>();
    botPositions.forEach((bp) => map.set(`${bp.x},${bp.y}`, bp));
    return map;
  }, [botPositions]);

  const getCellType = (x: number, y: number) => {
    if (x === 0 && y === 0) return 'start';
    if (x === gameGrid.cols - 1 && y === gameGrid.rows - 1) return 'end';
    if (obstacleSet.has(`${x},${y}`)) return 'obstacle';
    return 'normal';
  };

  return (
    <div className="relative">
      {/* Grid Legend */}
      <div className="flex items-center gap-4 mb-3 text-xs text-gray-400">
        <div className="flex items-center gap-1.5">
          <div className="w-3 h-3 rounded-sm bg-success/30 border border-success/60" />
          <span>Start</span>
        </div>
        <div className="flex items-center gap-1.5">
          <div className="w-3 h-3 rounded-sm bg-gold/30 border border-gold/60" />
          <span>Finish</span>
        </div>
        <div className="flex items-center gap-1.5">
          <div className="w-3 h-3 rounded-sm bg-danger/30 border border-danger/60" />
          <span>Obstacle</span>
        </div>
        <div className="flex items-center gap-1.5">
          <div className="w-4 h-4 rounded-full bg-cyan/40 border border-cyan/60" />
          <span>Bot</span>
        </div>
      </div>

      {/* Grid Container */}
      <div
        className="relative border border-cyan/20 rounded-lg overflow-hidden bg-dark-blue/50"
        style={{ width: gridWidth + 2, height: gridHeight + 2 }}
      >
        {/* Scanline effect */}
        <div
          className="absolute inset-0 pointer-events-none opacity-5 z-10"
          style={{
            background: 'repeating-linear-gradient(0deg, transparent, transparent 2px, rgba(0,240,255,0.1) 2px, rgba(0,240,255,0.1) 4px)',
          }}
        />

        {/* Grid Cells */}
        {Array.from({ length: gameGrid.rows }, (_, rowIndex) => (
          <div key={rowIndex} className="flex">
            {Array.from({ length: gameGrid.cols }, (_, colIndex) => {
              const cellType = getCellType(colIndex, rowIndex);
              const bot = botMap.get(`${colIndex},${rowIndex}`);

              return (
                <div
                  key={`${colIndex}-${rowIndex}`}
                  className={cn(
                    'relative flex items-center justify-center border border-surface-light/30',
                    cellType === 'start' && 'grid-cell-start',
                    cellType === 'end' && 'grid-cell-end',
                    cellType === 'obstacle' && 'grid-cell-obstacle',
                    cellType === 'normal' && 'grid-cell'
                  )}
                  style={{ width: cellSize, height: cellSize }}
                >
                  {cellType === 'obstacle' && (
                    <motion.div
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      className="w-3/4 h-3/4 rounded-sm bg-danger/40 border border-danger/60"
                      style={{
                        boxShadow: '0 0 4px rgba(255, 51, 102, 0.4)',
                      }}
                    />
                  )}

                  {cellType === 'start' && (
                    <div className="absolute inset-0 flex items-center justify-center">
                      <span className="text-success text-[8px] font-orbitron font-bold opacity-70">
                        S
                      </span>
                    </div>
                  )}

                  {cellType === 'end' && (
                    <motion.div
                      animate={{ opacity: [0.5, 1, 0.5] }}
                      transition={{ duration: 2, repeat: Infinity }}
                      className="absolute inset-0 flex items-center justify-center"
                    >
                      <span className="text-gold text-[8px] font-orbitron font-bold">
                        F
                      </span>
                    </motion.div>
                  )}

                  {bot && (
                    <BotSprite
                      botId={bot.botId}
                      characterId={bot.characterId}
                      size={cellSize - 4}
                    />
                  )}
                </div>
              );
            })}
          </div>
        ))}
      </div>

      {/* Grid coordinates */}
      <div className="flex mt-1" style={{ width: gridWidth + 2 }}>
        {Array.from({ length: gameGrid.cols }, (_, i) => (
          <div
            key={i}
            className="text-center text-[8px] text-gray-600 font-mono"
            style={{ width: cellSize }}
          >
            {i}
          </div>
        ))}
      </div>
    </div>
  );
}
