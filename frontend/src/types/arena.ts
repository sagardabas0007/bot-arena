export type ArenaDifficulty = 'Easy' | 'Medium' | 'Hard' | 'Expert' | 'Elite';

export interface Arena {
  id: number;
  name: string;
  entryFee: string;
  difficulty: ArenaDifficulty;
  gridSize: { rows: number; cols: number };
  obstacleCount: number;
  timeLimit: number;
  description: string;
  isActive: boolean;
}

export interface ArenaWithStats extends Arena {
  activeGames: number;
  totalGamesPlayed: number;
}
