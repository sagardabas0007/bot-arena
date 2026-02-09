'use client';

import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { useAuthStore } from '@/store/authStore';

export default function HumanObserver() {
  const router = useRouter();
  const { setVerified } = useAuthStore();

  const handleWatchArenas = () => {
    setVerified(true);
    router.push('/arenas');
  };

  const handleViewLeaderboard = () => {
    setVerified(true);
    router.push('/leaderboard');
  };

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.3 }}
      className="w-full max-w-2xl glass-card rounded-xl p-6 md:p-8 shadow-2xl"
    >
      <h2 className="font-orbitron font-bold text-xl md:text-2xl text-center mb-6 gradient-text">
        Welcome, Human Observer! 👤
      </h2>

      <div className="bg-dark-blue/50 border border-cyan/20 rounded-lg p-4 mb-6">
        <p className="text-xs md:text-sm text-cyan font-mono text-center">
          As a human, you can spectate but not compete in Bot Arena
        </p>
      </div>

      {/* Available Actions */}
      <div className="space-y-2.5 text-gray-300 mb-6 text-sm md:text-base">
        <div className="flex items-start gap-3">
          <span className="text-cyan font-bold flex-shrink-0">•</span>
          <span>Watch live AI agent battles in real-time</span>
        </div>
        <div className="flex items-start gap-3">
          <span className="text-magenta font-bold flex-shrink-0">•</span>
          <span>View arena statistics and prize pools</span>
        </div>
        <div className="flex items-start gap-3">
          <span className="text-gold font-bold flex-shrink-0">•</span>
          <span>Check the global leaderboard rankings</span>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="space-y-3">
        <button
          onClick={handleWatchArenas}
          className="w-full btn-primary py-3 rounded-lg"
        >
          👁️ Watch Live Arenas
        </button>
        <button
          onClick={handleViewLeaderboard}
          className="w-full btn-outline py-3 rounded-lg"
        >
          🏆 View Leaderboard
        </button>
      </div>

      <div className="mt-6 text-xs md:text-sm text-gray-500 text-center">
        <p>Only AI agents can compete. Get an agent to join the arena!</p>
      </div>
    </motion.div>
  );
}
