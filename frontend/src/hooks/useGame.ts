'use client';

import { useState, useCallback } from 'react';
import { Game, Move } from '@/types/game';
import { createGame, joinGame, getGame, submitMove, getGameLeaderboard } from '@/lib/api';
import { useGameStore } from '@/store/gameStore';
import toast from 'react-hot-toast';

export function useGame() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { setGame, currentGame } = useGameStore();

  const handleCreateGame = useCallback(
    async (arenaId: number, walletAddress: string): Promise<Game | null> => {
      setLoading(true);
      setError(null);
      try {
        const game = await createGame(arenaId, walletAddress);
        setGame(game);
        toast.success('Game created! Waiting for players...');
        return game;
      } catch (err) {
        const message = err instanceof Error ? err.message : 'Failed to create game';
        setError(message);
        toast.error(message);
        return null;
      } finally {
        setLoading(false);
      }
    },
    [setGame]
  );

  const handleJoinGame = useCallback(
    async (gameId: string, walletAddress: string, txHash: string): Promise<Game | null> => {
      setLoading(true);
      setError(null);
      try {
        const game = await joinGame(gameId, walletAddress, txHash);
        setGame(game);
        toast.success('Joined game successfully!');
        return game;
      } catch (err) {
        const message = err instanceof Error ? err.message : 'Failed to join game';
        setError(message);
        toast.error(message);
        return null;
      } finally {
        setLoading(false);
      }
    },
    [setGame]
  );

  const handleGetGame = useCallback(
    async (gameId: string): Promise<Game | null> => {
      setLoading(true);
      setError(null);
      try {
        const game = await getGame(gameId);
        setGame(game);
        return game;
      } catch (err) {
        const message = err instanceof Error ? err.message : 'Failed to get game';
        setError(message);
        return null;
      } finally {
        setLoading(false);
      }
    },
    [setGame]
  );

  const handleSubmitMove = useCallback(
    async (gameId: string, botId: string, move: Move) => {
      try {
        const result = await submitMove(gameId, botId, move);
        return result;
      } catch (err) {
        const message = err instanceof Error ? err.message : 'Failed to submit move';
        toast.error(message);
        return null;
      }
    },
    []
  );

  const handleGetLeaderboard = useCallback(async (gameId: string) => {
    try {
      const result = await getGameLeaderboard(gameId);
      return result;
    } catch (err) {
      console.error('Failed to get game leaderboard:', err);
      return null;
    }
  }, []);

  return {
    loading,
    error,
    currentGame,
    createGame: handleCreateGame,
    joinGame: handleJoinGame,
    getGame: handleGetGame,
    submitMove: handleSubmitMove,
    getGameLeaderboard: handleGetLeaderboard,
  };
}
