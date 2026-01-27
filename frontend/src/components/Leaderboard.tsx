'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { Trophy, ChevronUp, ChevronDown, Minus } from 'lucide-react';
import { LeaderboardEntry } from '@/types/bot';
import { shortenAddress, formatUSDC, cn } from '@/lib/utils';

type SortField = 'rank' | 'totalWins' | 'totalGames' | 'totalEarnings';
type SortDirection = 'asc' | 'desc';

interface LeaderboardProps {
  data: LeaderboardEntry[];
  loading?: boolean;
}

export default function Leaderboard({ data, loading = false }: LeaderboardProps) {
  const [sortField, setSortField] = useState<SortField>('rank');
  const [sortDirection, setSortDirection] = useState<SortDirection>('asc');

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection(field === 'rank' ? 'asc' : 'desc');
    }
  };

  const sortedData = [...data].sort((a, b) => {
    let aVal: number;
    let bVal: number;

    switch (sortField) {
      case 'rank':
        aVal = a.rank;
        bVal = b.rank;
        break;
      case 'totalWins':
        aVal = a.totalWins;
        bVal = b.totalWins;
        break;
      case 'totalGames':
        aVal = a.totalGames;
        bVal = b.totalGames;
        break;
      case 'totalEarnings':
        aVal = parseFloat(a.totalEarnings);
        bVal = parseFloat(b.totalEarnings);
        break;
      default:
        return 0;
    }

    return sortDirection === 'asc' ? aVal - bVal : bVal - aVal;
  });

  const getRankStyle = (rank: number) => {
    if (rank === 1) return 'text-gold border-gold/30 bg-gold/5';
    if (rank === 2) return 'text-gray-300 border-gray-400/30 bg-gray-400/5';
    if (rank === 3) return 'text-orange-400 border-orange-400/30 bg-orange-400/5';
    return 'text-gray-500 border-transparent bg-transparent';
  };

  const getRankIcon = (rank: number) => {
    if (rank <= 3) {
      return (
        <Trophy
          className={cn(
            'w-4 h-4',
            rank === 1 && 'text-gold',
            rank === 2 && 'text-gray-300',
            rank === 3 && 'text-orange-400'
          )}
        />
      );
    }
    return null;
  };

  const SortIcon = ({ field }: { field: SortField }) => {
    if (sortField !== field) return <Minus className="w-3 h-3 text-gray-600" />;
    return sortDirection === 'asc' ? (
      <ChevronUp className="w-3 h-3 text-cyan" />
    ) : (
      <ChevronDown className="w-3 h-3 text-cyan" />
    );
  };

  if (loading) {
    return (
      <div className="glass-card p-6">
        <div className="space-y-4">
          {Array.from({ length: 5 }, (_, i) => (
            <div key={i} className="h-12 bg-surface rounded-lg animate-pulse" />
          ))}
        </div>
      </div>
    );
  }

  if (data.length === 0) {
    return (
      <div className="glass-card p-12 text-center">
        <Trophy className="w-12 h-12 text-gray-600 mx-auto mb-4" />
        <p className="text-gray-400 text-lg">No leaderboard data yet</p>
        <p className="text-gray-600 text-sm mt-1">Be the first to compete!</p>
      </div>
    );
  }

  return (
    <div className="glass-card overflow-hidden">
      {/* Table Header */}
      <div className="grid grid-cols-12 gap-2 px-6 py-3 bg-surface/50 border-b border-cyan/10 text-xs font-orbitron uppercase tracking-wider text-gray-500">
        <button
          onClick={() => handleSort('rank')}
          className="col-span-1 flex items-center gap-1 hover:text-cyan transition-colors"
        >
          Rank <SortIcon field="rank" />
        </button>
        <div className="col-span-3">Player</div>
        <div className="col-span-2">Wallet</div>
        <button
          onClick={() => handleSort('totalWins')}
          className="col-span-2 flex items-center gap-1 hover:text-cyan transition-colors"
        >
          Wins <SortIcon field="totalWins" />
        </button>
        <button
          onClick={() => handleSort('totalGames')}
          className="col-span-2 flex items-center gap-1 hover:text-cyan transition-colors"
        >
          Games <SortIcon field="totalGames" />
        </button>
        <button
          onClick={() => handleSort('totalEarnings')}
          className="col-span-2 flex items-center gap-1 hover:text-cyan transition-colors text-right justify-end"
        >
          Earnings <SortIcon field="totalEarnings" />
        </button>
      </div>

      {/* Table Body */}
      <div className="divide-y divide-white/5">
        {sortedData.map((entry, index) => (
          <motion.div
            key={entry.id}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.3, delay: index * 0.05 }}
            className={cn(
              'grid grid-cols-12 gap-2 px-6 py-4 items-center hover:bg-white/[0.02] transition-colors',
              entry.rank <= 3 && 'bg-white/[0.01]'
            )}
          >
            {/* Rank */}
            <div className="col-span-1">
              <div
                className={cn(
                  'inline-flex items-center justify-center gap-1 w-8 h-8 rounded-lg border text-sm font-bold',
                  getRankStyle(entry.rank)
                )}
              >
                {getRankIcon(entry.rank) || entry.rank}
              </div>
            </div>

            {/* Username */}
            <div className="col-span-3">
              <span className={cn(
                'font-semibold text-sm',
                entry.rank === 1 && 'text-gold',
                entry.rank === 2 && 'text-gray-200',
                entry.rank === 3 && 'text-orange-400',
                entry.rank > 3 && 'text-white'
              )}>
                {entry.username}
              </span>
            </div>

            {/* Wallet */}
            <div className="col-span-2">
              <span className="text-gray-500 text-xs font-mono">
                {shortenAddress(entry.walletAddress)}
              </span>
            </div>

            {/* Wins */}
            <div className="col-span-2">
              <span className="text-cyan font-semibold text-sm">{entry.totalWins}</span>
            </div>

            {/* Games */}
            <div className="col-span-2">
              <span className="text-gray-300 text-sm">{entry.totalGames}</span>
            </div>

            {/* Earnings */}
            <div className="col-span-2 text-right">
              <span className="text-gold font-semibold text-sm font-mono">
                ${formatUSDC(entry.totalEarnings)}
              </span>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
