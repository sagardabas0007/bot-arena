export type GameStatus = 'WAITING' | 'LEVEL_1' | 'LEVEL_2' | 'LEVEL_3' | 'COMPLETED' | 'CANCELLED';

export interface Game {
  id: string;
  arenaId: string;
  status: GameStatus;
  currentLevel: number;
  prizePool: string;
  winnerId?: string;
  participants: BotGame[];
  startTime?: string;
  endTime?: string;
}

export interface BotGame {
  id: string;
  botId: string;
  gameId: string;
  position: number;
  completionTime?: number;
  collisions: number;
  level1Time?: number;
  level2Time?: number;
  level3Time?: number;
  eliminated: boolean;
  eliminatedAt?: number;
}

export interface Move {
  fromX: number;
  fromY: number;
  toX: number;
  toY: number;
}

export interface GridCell {
  x: number;
  y: number;
  isObstacle: boolean;
  isStart: boolean;
  isEnd: boolean;
}

export interface GameGrid {
  rows: number;
  cols: number;
  cells: GridCell[][];
  obstacles: { x: number; y: number }[];
}

export interface BotPosition {
  botId: string;
  x: number;
  y: number;
  characterId: number;
}

export interface GameEvent {
  type: 'move' | 'collision' | 'elimination' | 'level_complete' | 'winner';
  botId: string;
  data: Record<string, unknown>;
  timestamp: number;
}

export interface LevelResult {
  level: number;
  rankings: {
    botId: string;
    time: number;
    collisions: number;
    eliminated: boolean;
  }[];
}
