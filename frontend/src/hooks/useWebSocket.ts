'use client';

import { useEffect, useRef, useCallback } from 'react';
import { io, Socket } from 'socket.io-client';
import { useGameStore } from '@/store/gameStore';
import { WS_URL } from '@/lib/constants';
import { BotPosition, Game } from '@/types/game';
import toast from 'react-hot-toast';

interface WebSocketEvents {
  'game:start': (data: { game: Game; grid: { rows: number; cols: number; cells: unknown[][]; obstacles: { x: number; y: number }[] }; positions: BotPosition[] }) => void;
  'game:update': (data: { game: Game; positions: BotPosition[] }) => void;
  'game:move_result': (data: { botId: string; x: number; y: number; collision: boolean }) => void;
  'game:collision': (data: { botId: string; x: number; y: number }) => void;
  'game:level_complete': (data: { level: number; rankings: { botId: string; time: number; collisions: number; eliminated: boolean }[]; nextLevel: number }) => void;
  'game:winner': (data: { winnerId: string; prize: string }) => void;
  'pool:update': (data: { gameId: string; prizePool: string; participants: number }) => void;
  'error': (data: { message: string }) => void;
}

export function useWebSocket(gameId?: string) {
  const socketRef = useRef<Socket | null>(null);
  const { setGame, updateBotPositions, updateSingleBotPosition, setGrid, setConnected, addGameEvent } = useGameStore();

  const connect = useCallback(() => {
    if (socketRef.current?.connected) return;

    const socket = io(WS_URL, {
      transports: ['websocket', 'polling'],
      autoConnect: true,
      reconnection: true,
      reconnectionAttempts: 5,
      reconnectionDelay: 1000,
    });

    socket.on('connect', () => {
      setConnected(true);
      if (gameId) {
        socket.emit('game:join_room', { gameId });
      }
    });

    socket.on('disconnect', () => {
      setConnected(false);
    });

    socket.on('game:start', ((data: Parameters<WebSocketEvents['game:start']>[0]) => {
      setGame(data.game);
      setGrid({
        rows: data.grid.rows,
        cols: data.grid.cols,
        cells: data.grid.cells as never,
        obstacles: data.grid.obstacles,
      });
      updateBotPositions(data.positions);
      addGameEvent('Game started! Round 1 begins!');
      toast.success('The race has begun!');
    }) as never);

    socket.on('game:update', ((data: Parameters<WebSocketEvents['game:update']>[0]) => {
      setGame(data.game);
      updateBotPositions(data.positions);
    }) as never);

    socket.on('game:move_result', ((data: Parameters<WebSocketEvents['game:move_result']>[0]) => {
      updateSingleBotPosition(data.botId, data.x, data.y);
      if (data.collision) {
        addGameEvent(`Bot ${data.botId.slice(0, 6)} hit an obstacle!`);
      }
    }) as never);

    socket.on('game:collision', ((data: Parameters<WebSocketEvents['game:collision']>[0]) => {
      addGameEvent(`Collision! Bot ${data.botId.slice(0, 6)} at (${data.x}, ${data.y})`);
    }) as never);

    socket.on('game:level_complete', ((data: Parameters<WebSocketEvents['game:level_complete']>[0]) => {
      const eliminated = data.rankings.filter((r) => r.eliminated);
      addGameEvent(`Round ${data.level} complete! ${eliminated.length} bot(s) eliminated.`);
      if (data.nextLevel) {
        addGameEvent(`Round ${data.nextLevel} starting soon...`);
      }
      toast.success(`Round ${data.level} complete!`);
    }) as never);

    socket.on('game:winner', ((data: Parameters<WebSocketEvents['game:winner']>[0]) => {
      addGameEvent(`Winner! Bot ${data.winnerId.slice(0, 6)} wins ${data.prize} USDC!`);
      toast.success(`Game over! Winner takes ${data.prize} USDC!`);
    }) as never);

    socket.on('pool:update', ((data: Parameters<WebSocketEvents['pool:update']>[0]) => {
      addGameEvent(`Prize pool updated: ${data.prizePool} USDC (${data.participants}/10 players)`);
    }) as never);

    socket.on('error', ((data: Parameters<WebSocketEvents['error']>[0]) => {
      toast.error(data.message);
      addGameEvent(`Error: ${data.message}`);
    }) as never);

    socketRef.current = socket;
  }, [gameId, setGame, updateBotPositions, updateSingleBotPosition, setGrid, setConnected, addGameEvent]);

  const disconnect = useCallback(() => {
    if (socketRef.current) {
      socketRef.current.disconnect();
      socketRef.current = null;
      setConnected(false);
    }
  }, [setConnected]);

  const emit = useCallback((event: string, data?: unknown) => {
    if (socketRef.current?.connected) {
      socketRef.current.emit(event, data);
    }
  }, []);

  useEffect(() => {
    if (gameId) {
      connect();
    }

    return () => {
      disconnect();
    };
  }, [gameId, connect, disconnect]);

  return {
    socket: socketRef.current,
    connect,
    disconnect,
    emit,
    isConnected: socketRef.current?.connected || false,
  };
}
