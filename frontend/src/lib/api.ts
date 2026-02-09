import axios from 'axios';
import { Arena, ArenaWithStats } from '@/types/arena';
import { Game, Move } from '@/types/game';
import { Bot, LeaderboardEntry, BotStats } from '@/types/bot';
import { API_BASE_URL } from './constants';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 15000,
});

api.interceptors.response.use(
  (response) => response,
  (error) => {
    const message = error.response?.data?.message || error.message || 'An error occurred';
    console.error('API Error:', message);
    return Promise.reject(new Error(message));
  }
);

export async function listArenas(): Promise<ArenaWithStats[]> {
  const response = await api.get('/api/arenas');
  return response.data;
}

export async function getArena(id: number): Promise<ArenaWithStats> {
  const response = await api.get(`/api/arenas/${id}`);
  return response.data;
}

export async function createGame(arenaId: number, walletAddress: string): Promise<Game> {
  const response = await api.post('/api/games', { arenaId, walletAddress });
  return response.data;
}

export async function joinGame(gameId: string, walletAddress: string, txHash: string): Promise<Game> {
  const response = await api.post(`/api/games/${gameId}/join`, { walletAddress, txHash });
  return response.data;
}

export async function getGame(gameId: string): Promise<Game> {
  const response = await api.get(`/api/games/${gameId}`);
  return response.data;
}

export async function submitMove(gameId: string, botId: string, move: Move): Promise<{ success: boolean; newPosition: { x: number; y: number }; collision: boolean }> {
  const response = await api.post(`/api/games/${gameId}/move`, { botId, move });
  return response.data;
}

export async function getGameLeaderboard(gameId: string): Promise<{ rankings: { botId: string; time: number; collisions: number; eliminated: boolean }[] }> {
  const response = await api.get(`/api/games/${gameId}/leaderboard`);
  return response.data;
}

export async function registerBot(walletAddress: string, username: string, characterId: number): Promise<Bot> {
  const response = await api.post('/api/bots/register', { walletAddress, username, characterId });
  return response.data;
}

export async function getBotStats(walletAddress: string): Promise<BotStats> {
  const response = await api.get(`/api/stats/${walletAddress}`);
  return response.data;
}

export async function getLeaderboard(sortBy: 'wins' | 'earnings' = 'wins', limit: number = 50): Promise<LeaderboardEntry[]> {
  const response = await api.get('/api/leaderboard', { params: { sortBy, limit } });
  return response.data;
}

export async function getActiveGames(arenaId?: number): Promise<Game[]> {
  const params = arenaId ? { arenaId } : {};
  const response = await api.get('/api/games/active', { params });
  return response.data;
}

export async function getBotByWallet(walletAddress: string): Promise<Bot | null> {
  try {
    const response = await api.get(`/api/bots/${walletAddress}`);
    return response.data;
  } catch {
    return null;
  }
}

export { api };
export default api;
