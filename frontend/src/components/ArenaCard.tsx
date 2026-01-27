'use client';

import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { Grid3X3, Clock, AlertTriangle, Users, DollarSign } from 'lucide-react';
import { Arena, ArenaWithStats } from '@/types/arena';
import { getDifficultyBgClass, formatUSDC } from '@/lib/utils';

interface ArenaCardProps {
  arena: Arena | ArenaWithStats;
  index?: number;
}

export default function ArenaCard({ arena, index = 0 }: ArenaCardProps) {
  const router = useRouter();
  const activeGames = 'activeGames' in arena ? arena.activeGames : 0;

  const difficultyClass = getDifficultyBgClass(arena.difficulty);

  const borderGradients: Record<string, string> = {
    Easy: 'from-success/40 to-success/10',
    Medium: 'from-cyan/40 to-cyan/10',
    Hard: 'from-gold/40 to-gold/10',
    Expert: 'from-magenta/40 to-magenta/10',
    Elite: 'from-danger/40 to-danger/10',
  };

  const glowColors: Record<string, string> = {
    Easy: 'hover:shadow-[0_0_30px_rgba(0,255,136,0.15)]',
    Medium: 'hover:shadow-[0_0_30px_rgba(0,240,255,0.15)]',
    Hard: 'hover:shadow-[0_0_30px_rgba(255,215,0,0.15)]',
    Expert: 'hover:shadow-[0_0_30px_rgba(255,0,255,0.15)]',
    Elite: 'hover:shadow-[0_0_30px_rgba(255,51,102,0.15)]',
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: index * 0.1 }}
      whileHover={{ y: -8, transition: { duration: 0.3 } }}
      onClick={() => router.push(`/arena/${arena.id}`)}
      className={`relative cursor-pointer group ${glowColors[arena.difficulty] || ''}`}
    >
      {/* Gradient border effect */}
      <div className={`absolute inset-0 rounded-2xl bg-gradient-to-b ${borderGradients[arena.difficulty] || 'from-cyan/40 to-cyan/10'} opacity-0 group-hover:opacity-100 transition-opacity duration-500 -z-10 blur-sm`} />

      <div className="glass-card p-6 h-full flex flex-col">
        {/* Header */}
        <div className="flex items-start justify-between mb-4">
          <div>
            <h3 className="font-orbitron font-bold text-lg text-white group-hover:text-cyan transition-colors">
              {arena.name}
            </h3>
            <span
              className={`inline-block mt-1 px-2.5 py-0.5 rounded-full text-xs font-semibold border ${difficultyClass}`}
            >
              {arena.difficulty}
            </span>
          </div>
          <div className="text-right">
            <div className="flex items-center gap-1 text-gold">
              <DollarSign className="w-4 h-4" />
              <span className="font-orbitron font-bold text-lg">{formatUSDC(arena.entryFee)}</span>
            </div>
            <span className="text-gray-500 text-xs">USDC entry</span>
          </div>
        </div>

        {/* Description */}
        <p className="text-gray-400 text-sm mb-4 flex-grow leading-relaxed">
          {arena.description}
        </p>

        {/* Stats Grid */}
        <div className="grid grid-cols-3 gap-3 mb-4">
          <div className="bg-dark-blue/50 rounded-lg p-2.5 text-center">
            <Grid3X3 className="w-4 h-4 text-cyan mx-auto mb-1" />
            <span className="text-white text-sm font-semibold block">
              {arena.gridSize.rows}x{arena.gridSize.cols}
            </span>
            <span className="text-gray-500 text-xs">Grid</span>
          </div>
          <div className="bg-dark-blue/50 rounded-lg p-2.5 text-center">
            <AlertTriangle className="w-4 h-4 text-danger mx-auto mb-1" />
            <span className="text-white text-sm font-semibold block">{arena.obstacleCount}</span>
            <span className="text-gray-500 text-xs">Obstacles</span>
          </div>
          <div className="bg-dark-blue/50 rounded-lg p-2.5 text-center">
            <Clock className="w-4 h-4 text-gold mx-auto mb-1" />
            <span className="text-white text-sm font-semibold block">{arena.timeLimit}s</span>
            <span className="text-gray-500 text-xs">Time</span>
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between pt-3 border-t border-white/5">
          <div className="flex items-center gap-1.5 text-sm">
            <Users className="w-4 h-4 text-cyan" />
            <span className="text-gray-400">
              <span className="text-cyan font-semibold">{activeGames}</span> active
            </span>
          </div>
          <span className="text-cyan text-xs font-orbitron font-medium group-hover:text-white transition-colors">
            ENTER ARENA &rarr;
          </span>
        </div>
      </div>
    </motion.div>
  );
}
