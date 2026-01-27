import { create } from 'zustand';
import { Arena } from '@/types/arena';
import { Game, GameGrid, BotPosition } from '@/types/game';
import { Bot } from '@/types/bot';

interface GameState {
  currentGame: Game | null;
  currentArena: Arena | null;
  botPositions: BotPosition[];
  gameGrid: GameGrid | null;
  isConnected: boolean;
  myBot: Bot | null;
  gameEvents: string[];
  countdown: number | null;

  setGame: (game: Game | null) => void;
  setArena: (arena: Arena | null) => void;
  updateBotPositions: (positions: BotPosition[]) => void;
  updateSingleBotPosition: (botId: string, x: number, y: number) => void;
  setGrid: (grid: GameGrid | null) => void;
  setConnected: (connected: boolean) => void;
  setMyBot: (bot: Bot | null) => void;
  addGameEvent: (event: string) => void;
  setCountdown: (countdown: number | null) => void;
  reset: () => void;
}

const initialState = {
  currentGame: null,
  currentArena: null,
  botPositions: [],
  gameGrid: null,
  isConnected: false,
  myBot: null,
  gameEvents: [],
  countdown: null,
};

export const useGameStore = create<GameState>((set) => ({
  ...initialState,

  setGame: (game) => set({ currentGame: game }),

  setArena: (arena) => set({ currentArena: arena }),

  updateBotPositions: (positions) => set({ botPositions: positions }),

  updateSingleBotPosition: (botId, x, y) =>
    set((state) => ({
      botPositions: state.botPositions.map((bp) =>
        bp.botId === botId ? { ...bp, x, y } : bp
      ),
    })),

  setGrid: (grid) => set({ gameGrid: grid }),

  setConnected: (connected) => set({ isConnected: connected }),

  setMyBot: (bot) => set({ myBot: bot }),

  addGameEvent: (event) =>
    set((state) => ({
      gameEvents: [...state.gameEvents.slice(-49), event],
    })),

  setCountdown: (countdown) => set({ countdown }),

  reset: () => set(initialState),
}));
