import type { Game, Team, Conference } from '../types';
import { getTeamByAbbreviation, getByeTeam } from '../data/teams';

export interface DivisionalMatchups {
  div1Home: Team | null;  // #1 seed (bye team)
  div1Away: Team | null;  // Lowest remaining seed (plays #1)
  div2Home: Team | null;  // Higher of two remaining seeds
  div2Away: Team | null;  // Lower of two remaining seeds
}

/**
 * Get Wild Card winners for a conference from completed games.
 */
export function getWildCardWinners(games: Game[], conference: Conference): Team[] {
  const winners: Team[] = [];

  for (const game of games) {
    if (
      game.round === 'wildcard' &&
      game.conference === conference &&
      game.status === 'final' &&
      game.winner
    ) {
      const winnerTeam = getTeamByAbbreviation(game.winner);
      if (winnerTeam) {
        winners.push(winnerTeam);
      }
    }
  }

  return winners;
}

/**
 * Check if all Wild Card games are complete for a conference.
 */
export function areWildCardGamesComplete(games: Game[], conference: Conference): boolean {
  const wcGames = games.filter(
    g => g.round === 'wildcard' && g.conference === conference
  );

  // Need exactly 3 Wild Card games per conference, all final
  return wcGames.length === 3 && wcGames.every(g => g.status === 'final');
}

/**
 * Calculate divisional matchups after Wild Card round based on NFL reseeding rules.
 *
 * NFL Reseeding:
 * - 4 teams remain: #1 seed (bye) + 3 Wild Card winners
 * - Div1: #1 seed vs lowest remaining seed
 * - Div2: Two middle seeds (higher seed hosts)
 */
export function calculateDivisionalMatchups(
  games: Game[],
  conference: Conference
): DivisionalMatchups {
  const byeTeam = getByeTeam(conference);

  // Default result with just the bye team
  const result: DivisionalMatchups = {
    div1Home: byeTeam || null,
    div1Away: null,
    div2Home: null,
    div2Away: null,
  };

  // If Wild Card not complete, return partial result
  if (!areWildCardGamesComplete(games, conference)) {
    return result;
  }

  // Get Wild Card winners
  const winners = getWildCardWinners(games, conference);
  if (winners.length !== 3) {
    return result;
  }

  // Sort by seed (ascending - lowest seed first)
  winners.sort((a, b) => b.seed - a.seed);

  // Reseeding:
  // winners[0] = highest seed number = lowest remaining = plays #1
  // winners[1] = middle seed
  // winners[2] = lowest seed number = highest remaining
  const lowestRemaining = winners[0];  // e.g., #7 seed
  const middleSeed = winners[1];       // e.g., #5 seed
  const highestRemaining = winners[2]; // e.g., #4 seed

  // Div1: #1 (bye) vs lowest remaining
  result.div1Away = lowestRemaining;

  // Div2: Higher remaining seed hosts lower remaining seed
  result.div2Home = highestRemaining;
  result.div2Away = middleSeed;

  return result;
}

/**
 * Get the divisional opponent for the bye team based on reseeding.
 * Returns null if Wild Card is not complete.
 */
export function getByeTeamOpponent(games: Game[], conference: Conference): Team | null {
  const matchups = calculateDivisionalMatchups(games, conference);
  return matchups.div1Away;
}
