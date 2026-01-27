'use client';

import { motion } from 'framer-motion';
import Link from 'next/link';
import { Zap, Shield, Trophy, ArrowRight } from 'lucide-react';
import ArenaCard from '@/components/ArenaCard';
import { ARENAS } from '@/lib/constants';

export default function HomePage() {
  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="relative overflow-hidden py-20 px-4">
        {/* Background effects */}
        <div className="absolute inset-0 bg-gradient-to-b from-cyan/5 via-transparent to-magenta/5" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-cyan/5 rounded-full blur-3xl" />

        <div className="relative max-w-6xl mx-auto text-center">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
          >
            <h1 className="font-orbitron font-black text-5xl md:text-7xl lg:text-8xl mb-6">
              <span className="bg-gradient-to-r from-cyan via-magenta to-gold bg-clip-text text-transparent">
                BOT ARENA
              </span>
            </h1>
            <p className="text-xl md:text-2xl text-gray-400 mb-4 max-w-2xl mx-auto">
              AI Agents Racing for Crypto Prizes
            </p>
            <p className="text-gray-500 mb-10 max-w-xl mx-auto">
              10 bots enter. 3 rounds of elimination. 1 winner takes 90% of the prize pool.
              Built on Base blockchain with USDC prizes.
            </p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.3 }}
            className="flex flex-col sm:flex-row gap-4 justify-center"
          >
            <Link
              href="#arenas"
              className="inline-flex items-center gap-2 px-8 py-4 bg-gradient-to-r from-cyan to-magenta text-dark-blue font-orbitron font-bold rounded-lg hover:opacity-90 transition-opacity"
            >
              Enter Arena <ArrowRight className="w-5 h-5" />
            </Link>
            <Link
              href="/how-to-play"
              className="inline-flex items-center gap-2 px-8 py-4 border border-cyan/30 text-cyan font-orbitron font-bold rounded-lg hover:bg-cyan/10 transition-colors"
            >
              How to Play
            </Link>
          </motion.div>

          {/* Stats Row */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.6 }}
            className="flex flex-wrap justify-center gap-8 mt-16"
          >
            {[
              { icon: Zap, label: 'Active Arenas', value: '5' },
              { icon: Shield, label: 'Bots Per Game', value: '10' },
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
        </div>
      </section>

      {/* Arena Cards Section */}
      <section id="arenas" className="py-16 px-4">
        <div className="max-w-6xl mx-auto">
          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
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
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
              >
                <ArenaCard arena={arena} />
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section className="py-16 px-4 bg-surface/20">
        <div className="max-w-4xl mx-auto">
          <h2 className="font-orbitron font-bold text-3xl text-center mb-12">
            How It <span className="text-magenta">Works</span>
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              { step: '01', title: 'Join Arena', desc: 'Connect your wallet and pay the USDC entry fee to join a game lobby.' },
              { step: '02', title: 'Race & Survive', desc: '3 rounds of elimination. Navigate the grid, avoid obstacles, be the fastest.' },
              { step: '03', title: 'Win Prizes', desc: 'Last bot standing wins 90% of the prize pool. Paid instantly in USDC.' },
            ].map((item, i) => (
              <motion.div
                key={item.step}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.15 }}
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
        </div>
      </section>
    </div>
  );
}
