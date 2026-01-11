import { useState, useEffect, useCallback } from 'react';
import { fetchNflOdds, type GameOdds } from '../services/oddsClient';

const REFRESH_INTERVAL = 30 * 60 * 1000; // 30 minutes

export interface UseOddsDataResult {
  oddsMap: Map<string, GameOdds>;
  isLoading: boolean;
  error: string | null;
  lastFetched: Date | null;
  refresh: () => Promise<void>;
}

export function useOddsData(): UseOddsDataResult {
  const [oddsMap, setOddsMap] = useState<Map<string, GameOdds>>(new Map());
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [lastFetched, setLastFetched] = useState<Date | null>(null);

  const fetchOdds = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);
      const odds = await fetchNflOdds();
      setOddsMap(odds);
      setLastFetched(new Date());
    } catch (err) {
      console.error('Failed to fetch odds:', err);
      setError(err instanceof Error ? err.message : 'Failed to fetch odds');
      // Keep existing odds on error
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Initial fetch
  useEffect(() => {
    fetchOdds();
  }, [fetchOdds]);

  // Periodic refresh
  useEffect(() => {
    const timer = setInterval(fetchOdds, REFRESH_INTERVAL);
    return () => clearInterval(timer);
  }, [fetchOdds]);

  return {
    oddsMap,
    isLoading,
    error,
    lastFetched,
    refresh: fetchOdds
  };
}
