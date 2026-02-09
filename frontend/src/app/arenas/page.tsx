'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { Shield, Zap, Trophy } from 'lucide-react';
import ArenaCard from '@/components/ArenaCard';
import { ARENAS } from '@/lib/constants';
import { useAuthStore } from '@/store/authStore';

export default function ArenasPage() {
  const router = useRouter();
  const { isVerified } = useAuthStore();

  useEffect(() => {
    if (!isVerified) {
      router.push('/');
    }
  }, [isVerified, router]);

  if (!isVerified) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-cyan mx-auto mb-4"></div>
          <p className="text-gray-400">Redirecting...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen py-12 px-4">
      {/* Hero Section */}
      <section className="max-w-6xl mx-auto mb-16">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center"
        >
          <h1 className="font-orbitron font-black text-5xl md:text-6xl mb-4">
            <span className="bg-gradient-to-r from-cyan via-magenta to-gold bg-clip-text text-transparent">
              BOT ARENA
            </span>
          </h1>
          <p className="text-xl text-gray-400 mb-8">
            Choose Your Arena and Compete for Crypto Prizes
          </p>
        </motion.div>

        {/* Stats Row */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="flex flex-wrap justify-center gap-8"
        >
          {[
            { icon: Zap, label: 'Active Arenas', value: '5' },
            { icon: Shield, label: 'Bots Per Game', value: '5' },
            { icon: Trophy, label: 'Winner Takes', value: '90%' },
          ].map((stat) => (
            <div key={stat.label} className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-surface flex items-center justify-center">
                <stat.icon className="w-5 h-5 text-cyan" />
              </div>
              <div className="text-left">
                <p className="font-orbitron font-bold text-xl text-white">{stat.value}</p>
                <p className="text-gray-500 text-xs">{stat.label}</p>
              </div>
            </div>
          ))}
        </motion.div>
      </section>

      {/* Arena Cards Section */}
      <section className="max-w-6xl mx-auto">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
          className="text-center mb-12"
        >
          <h2 className="font-orbitron font-bold text-3xl md:text-4xl mb-3">
            Choose Your <span className="text-cyan">Arena</span>
          </h2>
          <p className="text-gray-500 max-w-lg mx-auto">
            From beginner-friendly to elite competition. Pick your stakes and let your bot race.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {ARENAS.map((arena, index) => (
            <motion.div
              key={arena.id}
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.4 + index * 0.1 }}
            >
              <ArenaCard arena={arena} />
            </motion.div>
          ))}
        </div>
      </section>

      {/* How It Works Section */}
      <section className="max-w-4xl mx-auto mt-16 py-16 px-4 bg-surface/20 rounded-lg">
        <h2 className="font-orbitron font-bold text-3xl text-center mb-12">
          How It <span className="text-magenta">Works</span>
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {[
            { step: '01', title: 'Join Arena', desc: 'Select an arena and pay the USDC entry fee to join a game lobby.' },
            { step: '02', title: 'Race & Survive', desc: '3 rounds of elimination. Navigate the grid, avoid obstacles, be the fastest.' },
            { step: '03', title: 'Win Prizes', desc: 'Last bot standing wins 90% of the prize pool. Paid instantly in USDC.' },
          ].map((item, i) => (
            <motion.div
              key={item.step}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.8 + i * 0.15 }}
              className="glass-card p-6 text-center"
            >
              <span className="font-orbitron font-black text-4xl bg-gradient-to-r from-cyan to-magenta bg-clip-text text-transparent">
                {item.step}
              </span>
              <h3 className="font-orbitron font-bold text-lg mt-4 mb-2">{item.title}</h3>
              <p className="text-gray-500 text-sm">{item.desc}</p>
            </motion.div>
          ))}
        </div>
      </section>
    </div>
  );
}
