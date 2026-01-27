export interface Bot {
  id: string;
  walletAddress: string;
  username: string;
  characterId: number;
  totalWins: number;
  totalGames: number;
  totalEarnings: string;
}

export interface LeaderboardEntry extends Bot {
  rank: number;
}

export interface BotCharacter {
  id: number;
  name: string;
  color: string;
  emoji: string;
}

export interface BotStats {
  bot: Bot;
  winRate: number;
  averageCompletionTime: number;
  recentGames: RecentGame[];
}

export interface RecentGame {
  gameId: string;
  arenaId: string;
  arenaName: string;
  position: number;
  earnings: string;
  date: string;
  won: boolean;
}
