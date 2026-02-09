'use client';

import { motion } from 'framer-motion';
import Link from 'next/link';
import { Wallet, MousePointer, DollarSign, Eye, Trophy, HelpCircle, ArrowRight } from 'lucide-react';
import { ARENAS } from '@/lib/constants';
import { getDifficultyColor } from '@/lib/utils';

const STEPS = [
  { icon: Wallet, title: 'Connect Wallet', desc: 'Connect your wallet using RainbowKit. You\'ll need USDC on Base network to pay entry fees.' },
  { icon: MousePointer, title: 'Choose Arena', desc: 'Pick an arena tier that suits your budget. Higher tiers have larger grids, more obstacles, and bigger prizes.' },
  { icon: DollarSign, title: 'Pay Entry Fee', desc: 'Approve and pay the USDC entry fee. Your fee goes into the prize pool. Game starts when 5 bots join.' },
  { icon: Eye, title: 'Watch Your Bot Race', desc: 'Your AI bot navigates the grid automatically. It must reach the finish corner while avoiding obstacles.' },
  { icon: Trophy, title: 'Win Prizes', desc: 'Survive 3 elimination rounds and win 90% of the prize pool, paid instantly in USDC to your wallet.' },
];

const FAQS = [
  { q: 'What happens if my bot hits an obstacle?', a: 'Your bot resets to the start position (0,0) and receives a +10 second time penalty.' },
  { q: 'How are bots eliminated?', a: 'Level 1: Bottom 1 bot eliminated (5→4). Level 2: Bottom 2 (4→2). Level 3: Top 1 wins from final 2.' },
  { q: 'What if my bot doesn\'t finish in time?', a: 'Bots that exceed the time limit are automatically eliminated from that round.' },
  { q: 'How is the winner determined?', a: 'The bot with the fastest completion time in the final round wins. Obstacle collisions add penalty time.' },
  { q: 'When do I get paid?', a: 'Winners are paid automatically via the smart contract on Base. 90% goes to the winner, 10% to the platform.' },
  { q: 'What currency is used?', a: 'All entry fees and prizes are in USDC on Base network (Ethereum L2).' },
];

export default function HowToPlayPage() {
  return (
    <div className="min-h-screen py-12 px-4">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-16"
        >
          <h1 className="font-orbitron font-bold text-3xl md:text-4xl mb-3">
            How to <span className="text-cyan">Play</span>
          </h1>
          <p className="text-gray-500 max-w-lg mx-auto">
            Everything you need to know about competing in Bot Arena
          </p>
        </motion.div>

        {/* Steps */}
        <div className="space-y-6 mb-20">
          {STEPS.map((step, i) => (
            <motion.div
              key={step.title}
              initial={{ opacity: 0, x: -30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1 }}
              className="flex gap-5 items-start"
            >
              <div className="flex-shrink-0 w-14 h-14 rounded-xl bg-gradient-to-br from-cyan/20 to-magenta/20 border border-cyan/20 flex items-center justify-center">
                <step.icon className="w-6 h-6 text-cyan" />
              </div>
              <div>
                <div className="flex items-center gap-3 mb-1">
                  <span className="font-orbitron text-xs text-magenta font-bold">STEP {i + 1}</span>
                  <h3 className="font-orbitron font-bold text-lg">{step.title}</h3>
                </div>
                <p className="text-gray-500 text-sm leading-relaxed">{step.desc}</p>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Arena Tiers Table */}
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          className="mb-20"
        >
          <h2 className="font-orbitron font-bold text-2xl text-center mb-8">
            Arena <span className="text-magenta">Tiers</span>
          </h2>
          <div className="glass-card overflow-hidden">
            <div className="grid grid-cols-6 gap-2 px-6 py-3 bg-surface/50 border-b border-cyan/10 text-xs font-orbitron uppercase tracking-wider text-gray-500">
              <span>Arena</span>
              <span>Difficulty</span>
              <span>Entry Fee</span>
              <span>Grid Size</span>
              <span>Obstacles</span>
              <span>Time Limit</span>
            </div>
            {ARENAS.map((arena) => {
              const diffColor = getDifficultyColor(arena.difficulty);
              return (
                <div key={arena.id} className="grid grid-cols-6 gap-2 px-6 py-4 items-center border-b border-white/5 hover:bg-white/[0.02] transition-colors">
                  <span className="font-semibold text-sm text-white">{arena.name}</span>
                  <span className={`text-xs font-bold px-2 py-0.5 rounded w-fit ${diffColor}`}>{arena.difficulty}</span>
                  <span className="text-gold text-sm font-mono">${arena.entryFee}</span>
                  <span className="text-gray-400 text-sm">{arena.gridSize.rows}x{arena.gridSize.cols}</span>
                  <span className="text-gray-400 text-sm">{arena.obstacleCount}</span>
                  <span className="text-gray-400 text-sm">{arena.timeLimit}s</span>
                </div>
              );
            })}
          </div>
        </motion.div>

        {/* FAQ */}
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
        >
          <h2 className="font-orbitron font-bold text-2xl text-center mb-8">
            <HelpCircle className="w-6 h-6 inline-block mr-2 text-cyan" />
            FAQ
          </h2>
          <div className="space-y-4">
            {FAQS.map((faq, i) => (
              <div key={i} className="glass-card p-5">
                <h4 className="font-semibold text-sm text-white mb-2">{faq.q}</h4>
                <p className="text-gray-500 text-sm">{faq.a}</p>
              </div>
            ))}
          </div>
        </motion.div>

        {/* CTA */}
        <div className="text-center mt-16">
          <Link
            href="/#arenas"
            className="inline-flex items-center gap-2 px-8 py-4 bg-gradient-to-r from-cyan to-magenta text-dark-blue font-orbitron font-bold rounded-lg hover:opacity-90 transition-opacity"
          >
            Start Playing <ArrowRight className="w-5 h-5" />
          </Link>
        </div>
      </div>
    </div>
  );
}
