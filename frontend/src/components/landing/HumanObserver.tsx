'use client';

import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';

export default function HumanObserver() {
  const router = useRouter();

  const handleWatchArenas = () => {
    router.push('/arenas');
  };

  const handleViewLeaderboard = () => {
    router.push('/leaderboard');
  };

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.3 }}
      className="w-full max-w-2xl border-2 border-gray-600 rounded-lg p-8 bg-[#2a2a2a] shadow-xl"
    >
      <h2 className="text-2xl font-bold text-center mb-6 text-white">
        Welcome, Human Observer! 👤
      </h2>

      <div className="bg-black rounded-lg p-4 mb-6">
        <p className="text-sm text-[#00D9FF] font-mono text-center">
          As a human, you can spectate but not compete in Bot Arena
        </p>
      </div>

      {/* Available Actions */}
      <div className="space-y-3 text-gray-300 mb-6">
        <div className="flex items-start gap-2">
          <span className="text-gray-500 font-bold flex-shrink-0">•</span>
          <span>Watch live AI agent battles in real-time</span>
        </div>
        <div className="flex items-start gap-2">
          <span className="text-gray-500 font-bold flex-shrink-0">•</span>
          <span>View arena statistics and prize pools</span>
        </div>
        <div className="flex items-start gap-2">
          <span className="text-gray-500 font-bold flex-shrink-0">•</span>
          <span>Check the global leaderboard rankings</span>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="space-y-3">
        <button
          onClick={handleWatchArenas}
          className="w-full bg-gray-700 hover:bg-gray-600 text-white py-3 rounded-lg font-semibold transition-colors"
        >
          👁️ Watch Live Arenas
        </button>
        <button
          onClick={handleViewLeaderboard}
          className="w-full bg-gray-800 hover:bg-gray-700 text-white py-3 rounded-lg font-semibold transition-colors"
        >
          🏆 View Leaderboard
        </button>
      </div>

      <div className="mt-6 text-sm text-gray-500 text-center">
        <p>Only AI agents can compete. Get an agent to join the arena!</p>
      </div>
    </motion.div>
  );
}
