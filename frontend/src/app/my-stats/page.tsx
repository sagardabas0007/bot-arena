'use client';

import { motion } from 'framer-motion';
import { Trophy, Gamepad2, DollarSign, TrendingUp } from 'lucide-react';
import { formatUSDC } from '@/lib/utils';

interface Stats {
  totalWins: number;
  totalGames: number;
  totalEarnings: string;
  winRate: string;
  recentGames: {
    id: string;
    arenaName: string;
    result: string;
    prize: string;
    date: string;
  }[];
}

// Demo stats to display
const demoStats: Stats = {
  totalWins: 12,
  totalGames: 45,
  totalEarnings: '67.50',
  winRate: '26.7',
  recentGames: [
    { id: '1', arenaName: 'Elite Arena', result: 'Won', prize: '9.00', date: '2024-02-01' },
    { id: '2', arenaName: 'Rookie Arena', result: 'Lost', prize: '0', date: '2024-01-30' },
    { id: '3', arenaName: 'Challenger Arena', result: 'Won', prize: '4.50', date: '2024-01-28' },
  ],
};

export default function MyStatsPage() {
  const stats = demoStats;

  return (
    <div className="min-h-screen py-12 px-4">
      <div className="max-w-4xl mx-auto">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
          <h1 className="font-orbitron font-bold text-3xl mb-2">My Stats</h1>
          <p className="text-gray-500 font-mono text-sm mb-8">Demo Statistics</p>
        </motion.div>

        <>
          {/* Stat Cards */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
            {[
              { icon: Trophy, label: 'Total Wins', value: stats.totalWins.toString(), color: 'text-gold' },
              { icon: Gamepad2, label: 'Games Played', value: stats.totalGames.toString(), color: 'text-cyan' },
              { icon: DollarSign, label: 'Earnings', value: `$${formatUSDC(stats.totalEarnings)}`, color: 'text-success' },
              { icon: TrendingUp, label: 'Win Rate', value: `${stats.winRate}%`, color: 'text-magenta' },
            ].map((stat, i) => (
              <motion.div
                key={stat.label}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.1 }}
                className="glass-card p-5"
              >
                <stat.icon className={`w-6 h-6 ${stat.color} mb-3`} />
                <p className="font-orbitron font-bold text-2xl">{stat.value}</p>
                <p className="text-gray-500 text-xs mt-1">{stat.label}</p>
              </motion.div>
            ))}
          </div>

          {/* Recent Games */}
          <div className="glass-card overflow-hidden">
            <div className="px-6 py-4 border-b border-cyan/10">
              <h2 className="font-orbitron font-bold text-lg">Recent Games</h2>
            </div>
            <div className="divide-y divide-white/5">
              {stats.recentGames.map((game) => (
                <div key={game.id} className="grid grid-cols-4 gap-4 px-6 py-4 items-center">
                  <span className="text-gray-300 text-sm">{game.arenaName}</span>
                  <span className={`text-sm font-bold ${game.result === 'Won' ? 'text-success' : 'text-danger'}`}>
                    {game.result}
                  </span>
                  <span className="text-gold text-sm font-mono">
                    {game.result === 'Won' ? `+$${formatUSDC(game.prize)}` : '-'}
                  </span>
                  <span className="text-gray-600 text-xs text-right">{game.date}</span>
                </div>
              ))}
            </div>
          </div>
        </>
      </div>
    </div>
  );
}
