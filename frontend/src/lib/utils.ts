import { ARENAS, DIFFICULTY_COLORS, DIFFICULTY_BG_CLASSES } from './constants';
import { GameStatus } from '@/types/game';

export function formatUSDC(amount: string | number): string {
  const num = typeof amount === 'string' ? parseFloat(amount) : amount;
  if (isNaN(num)) return '0.00';
  return new Intl.NumberFormat('en-US', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(num);
}

export function shortenAddress(address: string, chars: number = 4): string {
  if (!address) return '';
  return `${address.slice(0, chars + 2)}...${address.slice(-chars)}`;
}

export function getArenaById(id: number) {
  return ARENAS.find((arena) => arena.id === id);
}

export function getDifficultyColor(difficulty: string): string {
  return DIFFICULTY_COLORS[difficulty] || 'text-white';
}

export function getDifficultyBgClass(difficulty: string): string {
  return DIFFICULTY_BG_CLASSES[difficulty] || '';
}

export function getStatusLabel(status: GameStatus): string {
  const labels: Record<GameStatus, string> = {
    WAITING: 'Waiting for Players',
    LEVEL_1: 'Round 1 - Race!',
    LEVEL_2: 'Round 2 - Showdown!',
    LEVEL_3: 'Round 3 - Final!',
    COMPLETED: 'Completed',
    CANCELLED: 'Cancelled',
  };
  return labels[status] || status;
}

export function getStatusColor(status: GameStatus): string {
  const colors: Record<GameStatus, string> = {
    WAITING: 'text-gold',
    LEVEL_1: 'text-cyan',
    LEVEL_2: 'text-magenta',
    LEVEL_3: 'text-danger',
    COMPLETED: 'text-success',
    CANCELLED: 'text-gray-500',
  };
  return colors[status] || 'text-white';
}

export function formatTime(seconds: number): string {
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return `${mins}:${secs.toString().padStart(2, '0')}`;
}

export function calculatePrizePool(entryFee: string, participants: number): string {
  const fee = parseFloat(entryFee);
  const total = fee * participants;
  return formatUSDC(total);
}

export function calculateWinnerPrize(entryFee: string, participants: number): string {
  const fee = parseFloat(entryFee);
  const total = fee * participants;
  const winnerPrize = total * 0.9;
  return formatUSDC(winnerPrize);
}

export function cn(...classes: (string | undefined | null | boolean)[]): string {
  return classes.filter(Boolean).join(' ');
}
