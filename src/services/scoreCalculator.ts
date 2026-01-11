import type {
  Participant,
  Game,
  ScoreBreakdown,
  LeaderboardEntry,
  Round,
} from '../types';
import { POINTS_BY_ROUND } from '../types';

// Map game IDs to rounds
const gameIdToRound: Record<string, Round> = {
  afcWc1: 'wildcard',
  afcWc2: 'wildcard',
  afcWc3: 'wildcard',
  nfcWc1: 'wildcard',
  nfcWc2: 'wildcard',
  nfcWc3: 'wildcard',
  afcDiv1: 'divisional',
  afcDiv2: 'divisional',
  nfcDiv1: 'divisional',
  nfcDiv2: 'divisional',
  afcConf: 'conference',
  nfcConf: 'conference',
  superBowl: 'superbowl',
};

// Map ESPN game IDs to our internal game slot IDs
export function mapESPNGameToSlot(game: Game): string | null {
  // Wild Card games
  if (game.round === 'wildcard') {
    if (game.conference === 'AFC') {
      // AFC WC games: Pit/Hou, Jax/Buf, NE/LAC
      const teams = [game.homeTeam?.abbreviation, game.awayTeam?.abbreviation];
      if (teams.includes('PIT') || teams.includes('HOU')) return 'afcWc1';
      if (teams.includes('JAX') || teams.includes('BUF')) return 'afcWc2';
      if (teams.includes('NE') || teams.includes('LAC')) return 'afcWc3';
    } else {
      // NFC WC games based on actual ESPN schedule
      const teams = [game.homeTeam?.abbreviation, game.awayTeam?.abbreviation];
      if (teams.includes('CAR') || teams.includes('LAR')) return 'nfcWc1';
      if (teams.includes('PHI') || teams.includes('SF')) return 'nfcWc2';
      if (teams.includes('CHI') || teams.includes('GB')) return 'nfcWc3';
    }
  }

  // Divisional games - map by slot and conference
  if (game.round === 'divisional') {
    if (game.conference === 'AFC') {
      return game.slot === 1 ? 'afcDiv1' : 'afcDiv2';
    } else {
      return game.slot === 1 ? 'nfcDiv1' : 'nfcDiv2';
    }
  }

  // Conference Championships
  if (game.round === 'conference') {
    return game.conference === 'AFC' ? 'afcConf' : 'nfcConf';
  }

  // Super Bowl
  if (game.round === 'superbowl') {
    return 'superBowl';
  }

  return null;
}

// Get all completed games as a map of gameSlot -> winner abbreviation
export function getGameResults(games: Game[]): Map<string, string> {
  const results = new Map<string, string>();

  games.forEach(game => {
    if (game.status === 'final' && game.winner) {
      const slotId = mapESPNGameToSlot(game);
      if (slotId) {
        results.set(slotId, game.winner);
      }
    }
  });

  return results;
}

// Calculate score for a single participant
export function calculateParticipantScore(
  participant: Participant,
  results: Map<string, string>
): ScoreBreakdown {
  const score: ScoreBreakdown = {
    wildCard: 0,
    divisional: 0,
    conference: 0,
    superBowl: 0,
    total: 0,
  };

  participant.picks.forEach(pick => {
    const actualWinner = results.get(pick.gameId);
    if (actualWinner && actualWinner === pick.teamAbbreviation) {
      const round = gameIdToRound[pick.gameId];
      const points = POINTS_BY_ROUND[round];

      switch (round) {
        case 'wildcard':
          score.wildCard += points;
          break;
        case 'divisional':
          score.divisional += points;
          break;
        case 'conference':
          score.conference += points;
          break;
        case 'superbowl':
          score.superBowl += points;
          break;
      }
      score.total += points;
    }
  });

  return score;
}

// Count correct picks for a participant
export function countCorrectPicks(
  participant: Participant,
  results: Map<string, string>
): number {
  return participant.picks.filter(pick => {
    const actualWinner = results.get(pick.gameId);
    return actualWinner && actualWinner === pick.teamAbbreviation;
  }).length;
}

// Calculate maximum possible remaining points for a participant
export function calculatePossibleRemaining(
  participant: Participant,
  games: Game[],
  eliminatedTeams: Set<string>
): number {
  let possible = 0;

  participant.picks.forEach(pick => {
    const game = games.find(g => mapESPNGameToSlot(g) === pick.gameId);

    // If game hasn't been played yet
    if (!game || game.status === 'scheduled') {
      // Check if the picked team is still alive
      if (!eliminatedTeams.has(pick.teamAbbreviation)) {
        const round = gameIdToRound[pick.gameId];
        possible += POINTS_BY_ROUND[round];
      }
    }
  });

  return possible;
}

// Get set of eliminated teams based on game results
export function getEliminatedTeams(games: Game[]): Set<string> {
  const eliminated = new Set<string>();

  games.forEach(game => {
    if (game.status === 'final' && game.winner) {
      // The loser is eliminated
      const loser =
        game.homeTeam?.abbreviation === game.winner
          ? game.awayTeam?.abbreviation
          : game.homeTeam?.abbreviation;

      if (loser) {
        eliminated.add(loser);
      }
    }
  });

  return eliminated;
}

// Generate full leaderboard
export function generateLeaderboard(
  participants: Participant[],
  games: Game[]
): LeaderboardEntry[] {
  const results = getGameResults(games);
  const eliminatedTeams = getEliminatedTeams(games);

  const entries: LeaderboardEntry[] = participants.map(participant => ({
    participant,
    score: calculateParticipantScore(participant, results),
    rank: 0, // Will be assigned below
    correctPicks: countCorrectPicks(participant, results),
    possibleRemaining: calculatePossibleRemaining(participant, games, eliminatedTeams),
  }));

  // Sort by total score (descending), then by possible remaining (descending)
  entries.sort((a, b) => {
    if (b.score.total !== a.score.total) {
      return b.score.total - a.score.total;
    }
    return b.possibleRemaining - a.possibleRemaining;
  });

  // Assign ranks (handle ties)
  let currentRank = 1;
  entries.forEach((entry, index) => {
    if (index > 0 && entry.score.total < entries[index - 1].score.total) {
      currentRank = index + 1;
    }
    entry.rank = currentRank;
  });

  return entries;
}

// Check if a participant's pick for a game is correct
export function isPickCorrect(
  _participantId: string,
  gameSlotId: string,
  pick: string,
  results: Map<string, string>
): 'correct' | 'incorrect' | 'pending' {
  const actualWinner = results.get(gameSlotId);
  if (!actualWinner) return 'pending';
  return actualWinner === pick ? 'correct' : 'incorrect';
}
