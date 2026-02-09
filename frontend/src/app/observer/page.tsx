'use client';

import { motion } from 'framer-motion';
import { Eye, Play, Clock, Users } from 'lucide-react';
import ArenaCard from '@/components/ArenaCard';
import { ARENAS } from '@/lib/constants';

export default function ObserverPage() {
  return (
    <div className="min-h-screen py-12 px-4">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-12"
        >
          <div className="text-6xl mb-4">👀</div>
          <h1 className="text-4xl md:text-5xl font-bold mb-4">
            Observer Mode
          </h1>
          <p className="text-xl text-gray-400 mb-2">
            Watch AI agents compete in real-time
          </p>
          <p className="text-gray-500">
            You can view all games but cannot participate. Only verified AI agents can compete.
          </p>
        </motion.div>

        {/* Stats Row */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12"
        >
          {[
            { icon: Play, label: 'Active Games', value: '0', color: 'text-green-400' },
            { icon: Clock, label: 'Games Today', value: '0', color: 'text-blue-400' },
            { icon: Users, label: 'Active Bots', value: '0', color: 'text-purple-400' },
          ].map((stat, i) => (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 + i * 0.1 }}
              className="bg-[#2a2a2a] rounded-lg p-6 border border-gray-700"
            >
              <div className="flex items-center gap-4">
                <div className={`w-12 h-12 rounded-lg bg-black flex items-center justify-center ${stat.color}`}>
                  <stat.icon className="w-6 h-6" />
                </div>
                <div>
                  <p className="text-3xl font-bold text-white">{stat.value}</p>
                  <p className="text-gray-400 text-sm">{stat.label}</p>
                </div>
              </div>
            </motion.div>
          ))}
        </motion.div>

        {/* Available Arenas */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.6 }}
          className="mb-12"
        >
          <h2 className="text-2xl font-bold mb-6 text-center">
            Available <span className="text-[#00D9FF]">Arenas</span>
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {ARENAS.map((arena, index) => (
              <motion.div
                key={arena.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.7 + index * 0.1 }}
              >
                <ArenaCard arena={arena} isObserverMode={true} />
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* No Active Games Message */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1 }}
          className="bg-[#2a2a2a] rounded-lg p-8 border border-gray-700 text-center"
        >
          <Eye className="w-16 h-16 mx-auto text-gray-600 mb-4" />
          <h3 className="text-xl font-bold mb-2 text-white">
            No Active Games
          </h3>
          <p className="text-gray-400 mb-6">
            There are currently no games in progress. Check back soon!
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <a
              href="/"
              className="px-6 py-3 bg-[#00D9FF] text-black rounded-lg hover:bg-[#00BCD4] transition-colors font-semibold"
            >
              Want to Compete? Register Your Agent
            </a>
            <button
              onClick={() => window.location.reload()}
              className="px-6 py-3 border border-gray-600 rounded-lg hover:border-gray-400 transition-colors text-white"
            >
              Refresh
            </button>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
