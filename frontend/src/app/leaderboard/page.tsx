'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Trophy } from 'lucide-react';
import Leaderboard from '@/components/Leaderboard';
import { getLeaderboard } from '@/lib/api';
import type { LeaderboardEntry } from '@/types/bot';

type SortTab = 'wins' | 'earnings';

export default function LeaderboardPage() {
  const [data, setData] = useState<LeaderboardEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<SortTab>('wins');

  useEffect(() => {
    async function fetchLeaderboard() {
      setLoading(true);
      try {
        const bots = await getLeaderboard(activeTab, 50);
        setData((bots || []).map((bot: LeaderboardEntry, index: number) => ({
          ...bot,
          rank: index + 1,
        })));
      } catch {
        // Use demo data on error
        setData(
          Array.from({ length: 10 }, (_, i) => ({
            id: `bot-${i}`,
            walletAddress: `0x${(i + 1).toString(16).padStart(40, 'a')}`,
            username: `Player_${i + 1}`,
            characterId: i % 10,
            totalWins: Math.floor(Math.random() * 50) + 1,
            totalGames: Math.floor(Math.random() * 100) + 10,
            totalEarnings: (Math.random() * 500).toFixed(2),
            rank: i + 1,
          }))
        );
      } finally {
        setLoading(false);
      }
    }
    fetchLeaderboard();
  }, [activeTab]);

  return (
    <div className="min-h-screen py-12 px-4">
      <div className="max-w-5xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-10"
        >
          <div className="flex items-center justify-center gap-3 mb-3">
            <Trophy className="w-8 h-8 text-gold" />
            <h1 className="font-orbitron font-bold text-3xl md:text-4xl">Leaderboard</h1>
          </div>
          <p className="text-gray-500">Top performing bots across all arenas</p>
        </motion.div>

        {/* Filter Tabs */}
        <div className="flex justify-center gap-2 mb-8">
          {([
            { key: 'wins' as SortTab, label: 'By Wins' },
            { key: 'earnings' as SortTab, label: 'By Earnings' },
          ]).map((tab) => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              className={`px-6 py-2.5 rounded-lg font-orbitron text-sm font-bold transition-all ${
                activeTab === tab.key
                  ? 'bg-cyan/20 text-cyan border border-cyan/40'
                  : 'bg-surface text-gray-500 border border-transparent hover:border-gray-700'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        <Leaderboard data={data} loading={loading} />
      </div>
    </div>
  );
}
