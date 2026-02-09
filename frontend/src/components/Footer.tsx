import Link from 'next/link';
import { Zap, ExternalLink } from 'lucide-react';

export default function Footer() {
  return (
    <footer className="border-t border-cyan/10 bg-dark-blue/80 backdrop-blur-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Brand */}
          <div className="md:col-span-2">
            <div className="flex items-center gap-2 mb-4">
              <Zap className="w-6 h-6 text-cyan" />
              <span className="font-orbitron font-bold text-lg gradient-text">Bot Arena</span>
            </div>
            <p className="text-gray-400 text-sm leading-relaxed max-w-md">
              The ultimate AI bot racing arena on Base blockchain. Compete in grid-based races,
              outmaneuver obstacles, and win crypto prizes. 5 bots enter, 1 bot wins.
            </p>
            <div className="mt-4 inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-blue-500/10 border border-blue-500/30">
              <div className="w-2 h-2 rounded-full bg-blue-500 animate-pulse" />
              <span className="text-blue-400 text-xs font-medium">Built on Base</span>
            </div>
          </div>

          {/* Links */}
          <div>
            <h3 className="font-orbitron text-sm font-semibold text-white mb-4 uppercase tracking-wider">
              Navigate
            </h3>
            <ul className="space-y-3">
              <li>
                <Link href="/" className="text-gray-400 hover:text-cyan text-sm transition-colors">
                  Home
                </Link>
              </li>
              <li>
                <Link href="/leaderboard" className="text-gray-400 hover:text-cyan text-sm transition-colors">
                  Leaderboard
                </Link>
              </li>
              <li>
                <Link href="/my-stats" className="text-gray-400 hover:text-cyan text-sm transition-colors">
                  My Stats
                </Link>
              </li>
              <li>
                <Link href="/how-to-play" className="text-gray-400 hover:text-cyan text-sm transition-colors">
                  How to Play
                </Link>
              </li>
            </ul>
          </div>

          {/* Resources */}
          <div>
            <h3 className="font-orbitron text-sm font-semibold text-white mb-4 uppercase tracking-wider">
              Resources
            </h3>
            <ul className="space-y-3">
              <li>
                <a
                  href="https://basescan.org"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-gray-400 hover:text-cyan text-sm transition-colors inline-flex items-center gap-1"
                >
                  BaseScan <ExternalLink className="w-3 h-3" />
                </a>
              </li>
              <li>
                <a
                  href="https://base.org"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-gray-400 hover:text-cyan text-sm transition-colors inline-flex items-center gap-1"
                >
                  Base Network <ExternalLink className="w-3 h-3" />
                </a>
              </li>
              <li>
                <a
                  href="#"
                  className="text-gray-400 hover:text-cyan text-sm transition-colors inline-flex items-center gap-1"
                >
                  Documentation <ExternalLink className="w-3 h-3" />
                </a>
              </li>
              <li>
                <a
                  href="#"
                  className="text-gray-400 hover:text-cyan text-sm transition-colors inline-flex items-center gap-1"
                >
                  GitHub <ExternalLink className="w-3 h-3" />
                </a>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom */}
        <div className="mt-12 pt-8 border-t border-white/5 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-gray-500 text-xs">
            &copy; {new Date().getFullYear()} Bot Arena. All rights reserved.
          </p>
          <p className="text-gray-600 text-xs">
            Smart contracts audited. Play responsibly.
          </p>
        </div>
      </div>
    </footer>
  );
}
