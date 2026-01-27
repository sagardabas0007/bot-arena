'use client';

import { useState, useEffect, useCallback } from 'react';
import { ArenaWithStats } from '@/types/arena';
import { listArenas, getArena } from '@/lib/api';
import { ARENAS } from '@/lib/constants';

export function useArenaList() {
  const [arenas, setArenas] = useState<ArenaWithStats[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchArenas = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await listArenas();
      setArenas(data);
    } catch (err) {
      console.error('Failed to fetch arenas:', err);
      const fallback: ArenaWithStats[] = ARENAS.map((arena) => ({
        ...arena,
        activeGames: 0,
        totalGamesPlayed: 0,
      }));
      setArenas(fallback);
      setError(err instanceof Error ? err.message : 'Failed to fetch arenas');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchArenas();
  }, [fetchArenas]);

  return { arenas, loading, error, refetch: fetchArenas };
}

export function useArena(id: number) {
  const [arena, setArena] = useState<ArenaWithStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchArena = useCallback(async () => {
    if (!id) return;
    setLoading(true);
    setError(null);
    try {
      const data = await getArena(id);
      setArena(data);
    } catch (err) {
      console.error('Failed to fetch arena:', err);
      const fallback = ARENAS.find((a) => a.id === id);
      if (fallback) {
        setArena({ ...fallback, activeGames: 0, totalGamesPlayed: 0 });
      }
      setError(err instanceof Error ? err.message : 'Failed to fetch arena');
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    fetchArena();
  }, [fetchArena]);

  return { arena, loading, error, refetch: fetchArena };
}
