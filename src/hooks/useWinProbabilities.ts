import { useMemo } from 'react';
import type { Game, Participant } from '../types';
import type { GameOdds } from '../services/oddsClient';
import { calculateWinProbabilities, type WinProbabilities, type ProbabilityResult } from '../services/probabilityCalculator';

export interface UseWinProbabilitiesResult {
  probabilities: Map<string, WinProbabilities>;
  isEliminated: Map<string, boolean>;
  getParticipantProbability: (name: string) => WinProbabilities | undefined;
  isParticipantEliminated: (name: string) => boolean;
}

export function useWinProbabilities(
  games: Game[],
  participants: Participant[],
  oddsMap: Map<string, GameOdds>
): UseWinProbabilitiesResult {
  // Memoize the probability calculation
  const result = useMemo<ProbabilityResult>(() => {
    // Only recalculate when games change (new results come in)
    // The calculation is fast (< 10ms for 64 scenarios) so this is fine
    return calculateWinProbabilities(games, participants, oddsMap);
  }, [games, participants, oddsMap]);

  const getParticipantProbability = (name: string): WinProbabilities | undefined => {
    return result.probabilities.get(name);
  };

  const isParticipantEliminated = (name: string): boolean => {
    return result.isEliminated.get(name) ?? false;
  };

  return {
    probabilities: result.probabilities,
    isEliminated: result.isEliminated,
    getParticipantProbability,
    isParticipantEliminated
  };
}
