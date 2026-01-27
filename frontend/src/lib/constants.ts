import { Arena } from '@/types/arena';
import { BotCharacter } from '@/types/bot';

export const ARENAS: Arena[] = [
  {
    id: 1,
    name: 'Neon Nursery',
    entryFee: '1',
    difficulty: 'Easy',
    gridSize: { rows: 8, cols: 8 },
    obstacleCount: 5,
    timeLimit: 60,
    description: 'A beginner-friendly arena with a small grid and few obstacles. Perfect for new bots finding their way.',
    isActive: true,
  },
  {
    id: 2,
    name: 'Cyber Circuit',
    entryFee: '5',
    difficulty: 'Medium',
    gridSize: { rows: 10, cols: 10 },
    obstacleCount: 12,
    timeLimit: 90,
    description: 'A mid-tier arena with more obstacles and a larger grid. Requires smarter pathfinding.',
    isActive: true,
  },
  {
    id: 3,
    name: 'Plasma Gauntlet',
    entryFee: '10',
    difficulty: 'Hard',
    gridSize: { rows: 12, cols: 12 },
    obstacleCount: 20,
    timeLimit: 120,
    description: 'A challenging arena with dense obstacles. Only experienced bots survive all three rounds.',
    isActive: true,
  },
  {
    id: 4,
    name: 'Quantum Maze',
    entryFee: '25',
    difficulty: 'Expert',
    gridSize: { rows: 15, cols: 15 },
    obstacleCount: 35,
    timeLimit: 150,
    description: 'An expert-level arena with a massive grid and treacherous obstacles. High risk, high reward.',
    isActive: true,
  },
  {
    id: 5,
    name: 'Void Nexus',
    entryFee: '50',
    difficulty: 'Elite',
    gridSize: { rows: 20, cols: 20 },
    obstacleCount: 60,
    timeLimit: 180,
    description: 'The ultimate proving ground. A sprawling grid packed with obstacles. Only the best survive.',
    isActive: true,
  },
];

export const BOT_CHARACTERS: BotCharacter[] = [
  { id: 1, name: 'Blaze', color: '#FF6B35', emoji: '1' },
  { id: 2, name: 'Frost', color: '#00F0FF', emoji: '2' },
  { id: 3, name: 'Venom', color: '#00FF88', emoji: '3' },
  { id: 4, name: 'Shadow', color: '#8B5CF6', emoji: '4' },
  { id: 5, name: 'Nova', color: '#FF00FF', emoji: '5' },
  { id: 6, name: 'Titan', color: '#FFD700', emoji: '6' },
  { id: 7, name: 'Spark', color: '#FF3366', emoji: '7' },
  { id: 8, name: 'Echo', color: '#06B6D4', emoji: '8' },
  { id: 9, name: 'Pulse', color: '#F97316', emoji: '9' },
  { id: 10, name: 'Drift', color: '#A3E635', emoji: '10' },
];

export const CONTRACT_ADDRESSES = {
  ARENA: process.env.NEXT_PUBLIC_ARENA_CONTRACT_ADDRESS || '',
  USDC: process.env.NEXT_PUBLIC_USDC_ADDRESS || '0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913',
} as const;

export const CHAIN_CONFIG = {
  chainId: Number(process.env.NEXT_PUBLIC_CHAIN_ID) || 8453,
  name: 'Base',
  rpcUrl: 'https://mainnet.base.org',
  blockExplorer: 'https://basescan.org',
} as const;

export const API_BASE_URL = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:5000';
export const WS_URL = process.env.NEXT_PUBLIC_WS_URL || 'ws://localhost:5000';

export const GAME_CONFIG = {
  MAX_PARTICIPANTS: 10,
  LEVEL_1_ELIMINATION: 2,
  LEVEL_2_ELIMINATION: 4,
  WINNER_SHARE: 0.9,
  PLATFORM_FEE: 0.1,
} as const;

export const DIFFICULTY_COLORS: Record<string, string> = {
  Easy: 'text-success',
  Medium: 'text-cyan',
  Hard: 'text-gold',
  Expert: 'text-magenta',
  Elite: 'text-danger',
};

export const DIFFICULTY_BG_CLASSES: Record<string, string> = {
  Easy: 'difficulty-easy',
  Medium: 'difficulty-medium',
  Hard: 'difficulty-hard',
  Expert: 'difficulty-expert',
  Elite: 'difficulty-elite',
};
