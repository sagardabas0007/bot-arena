'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useAccount } from 'wagmi';
import { Trophy, Gamepad2, DollarSign, TrendingUp, Wallet } from 'lucide-react';
import WalletConnect from '@/components/WalletConnect';
import { getBotStats } from '@/lib/api';
import { formatUSDC, shortenAddress } from '@/lib/utils';

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

export default function MyStatsPage() {
  const { address, isConnected } = useAccount();
  const [stats, setStats] = useState<Stats | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!address) return;
    async function fetchStats() {
      setLoading(true);
      try {
        const res = await getBotStats(address!);
        const bot = res.bot;
        const winRate = bot.totalGames > 0
          ? ((bot.totalWins / bot.totalGames) * 100).toFixed(1)
          : '0.0';
        setStats({
          totalWins: bot.totalWins,
          totalGames: bot.totalGames,
          totalEarnings: bot.totalEarnings,
          winRate,
          recentGames: (res.recentGames || []).map((g: any) => ({
            id: g.id,
            arenaName: g.arena?.name || 'Unknown',
            result: g.winnerId === bot.id ? 'Won' : 'Lost',
            prize: g.winnerId === bot.id ? g.prizePool : '0',
            date: new Date(g.endTime || g.createdAt).toLocaleDateString(),
          })),
        });
      } catch {
        // Demo data fallback
        setStats({
          totalWins: 12,
          totalGames: 45,
          totalEarnings: '67.50',
          winRate: '26.7',
          recentGames: [
            { id: '1', arenaName: 'Elite Arena', result: 'Won', prize: '9.00', date: '2024-02-01' },
            { id: '2', arenaName: 'Rookie Arena', result: 'Lost', prize: '0', date: '2024-01-30' },
            { id: '3', arenaName: 'Challenger Arena', result: 'Won', prize: '4.50', date: '2024-01-28' },
          ],
        });
      } finally {
        setLoading(false);
      }
    }
    fetchStats();
  }, [address]);

  if (!isConnected) {
    return (
      <div className="min-h-screen flex items-center justify-center px-4">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="glass-card p-12 text-center max-w-md"
        >
          <Wallet className="w-16 h-16 text-cyan mx-auto mb-6 opacity-50" />
          <h2 className="font-orbitron font-bold text-2xl mb-3">Connect Your Wallet</h2>
          <p className="text-gray-500 mb-8">Connect your wallet to view your bot stats and game history.</p>
          <WalletConnect />
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen py-12 px-4">
      <div className="max-w-4xl mx-auto">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
          <h1 className="font-orbitron font-bold text-3xl mb-2">My Stats</h1>
          <p className="text-gray-500 font-mono text-sm mb-8">{shortenAddress(address || '')}</p>
        </motion.div>

        {loading ? (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
            {Array.from({ length: 4 }, (_, i) => (
              <div key={i} className="glass-card p-6 animate-pulse h-28" />
            ))}
          </div>
        ) : stats ? (
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
              {stats.recentGames.length === 0 ? (
                <div className="p-12 text-center text-gray-500">No games played yet</div>
              ) : (
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
              )}
            </div>
          </>
        ) : null}
      </div>
    </div>
  );
}
