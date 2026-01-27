'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { DollarSign, Users, Trophy } from 'lucide-react';
import { formatUSDC, calculateWinnerPrize } from '@/lib/utils';
import { GAME_CONFIG } from '@/lib/constants';

interface PrizePoolProps {
  prizePool: string;
  participantCount: number;
  entryFee?: string;
  maxParticipants?: number;
}

export default function PrizePool({
  prizePool,
  participantCount,
  entryFee = '0',
  maxParticipants = GAME_CONFIG.MAX_PARTICIPANTS,
}: PrizePoolProps) {
  const winnerPrize = calculateWinnerPrize(entryFee, participantCount);
  const isFull = participantCount >= maxParticipants;
  const fillPercentage = (participantCount / maxParticipants) * 100;

  return (
    <div className="glass-card p-5">
      {/* Prize Pool Amount */}
      <div className="text-center mb-4">
        <div className="flex items-center justify-center gap-2 mb-1">
          <Trophy className="w-5 h-5 text-gold" />
          <span className="text-gray-400 text-sm font-medium uppercase tracking-wider">Prize Pool</span>
        </div>
        <AnimatePresence mode="wait">
          <motion.div
            key={prizePool}
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 1.2, opacity: 0 }}
            transition={{ type: 'spring', stiffness: 300, damping: 20 }}
            className="flex items-center justify-center gap-2"
          >
            <DollarSign className="w-7 h-7 text-gold" />
            <span className="font-orbitron font-bold text-3xl neon-text-gold">
              {formatUSDC(prizePool)}
            </span>
          </motion.div>
        </AnimatePresence>
        <span className="text-gray-500 text-xs">USDC</span>
      </div>

      {/* Winner Prize */}
      <div className="bg-gold/5 border border-gold/20 rounded-lg p-3 mb-4 text-center">
        <span className="text-gray-400 text-xs block mb-1">Winner Takes (90%)</span>
        <span className="font-orbitron font-bold text-lg text-gold">{winnerPrize} USDC</span>
      </div>

      {/* Participant Progress */}
      <div className="space-y-2">
        <div className="flex items-center justify-between text-sm">
          <div className="flex items-center gap-1.5">
            <Users className="w-4 h-4 text-cyan" />
            <span className="text-gray-400">Players</span>
          </div>
          <span className={`font-orbitron font-semibold ${isFull ? 'text-success' : 'text-cyan'}`}>
            {participantCount}/{maxParticipants}
          </span>
        </div>

        {/* Progress Bar */}
        <div className="h-2 bg-dark-blue rounded-full overflow-hidden">
          <motion.div
            className="h-full rounded-full"
            style={{
              background: isFull
                ? 'linear-gradient(90deg, #00FF88, #00CC6A)'
                : 'linear-gradient(90deg, #00F0FF, #FF00FF)',
            }}
            initial={{ width: 0 }}
            animate={{ width: `${fillPercentage}%` }}
            transition={{ duration: 0.5, ease: 'easeOut' }}
          />
        </div>

        {isFull && (
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-success text-xs text-center font-medium"
          >
            Arena Full - Race Starting Soon!
          </motion.p>
        )}
      </div>
    </div>
  );
}
