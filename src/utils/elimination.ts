import type { Game } from '../types';

/**
 * Get all eliminated teams from completed games.
 * A team is eliminated when they lose a playoff game (status: 'final' and not the winner).
 */
export function getEliminatedTeams(games: Game[]): Set<string> {
  const eliminated = new Set<string>();

  for (const game of games) {
    if (game.status === 'final' && game.winner) {
      // The losing team is eliminated
      if (game.homeTeam && game.homeTeam.abbreviation !== game.winner) {
        eliminated.add(game.homeTeam.abbreviation);
      }
      if (game.awayTeam && game.awayTeam.abbreviation !== game.winner) {
        eliminated.add(game.awayTeam.abbreviation);
      }
    }
  }

  return eliminated;
}

/**
 * Check if a specific team has been eliminated from the playoffs.
 */
export function isTeamEliminated(teamAbbr: string, games: Game[]): boolean {
  return getEliminatedTeams(games).has(teamAbbr);
}

/**
 * Get the round in which a team was eliminated, if applicable.
 */
export function getEliminationRound(teamAbbr: string, games: Game[]): string | null {
  for (const game of games) {
    if (game.status === 'final' && game.winner && game.winner !== teamAbbr) {
      // Check if this team lost this game
      const isHomeTeam = game.homeTeam?.abbreviation === teamAbbr;
      const isAwayTeam = game.awayTeam?.abbreviation === teamAbbr;

      if (isHomeTeam || isAwayTeam) {
        return game.round;
      }
    }
  }
  return null;
}
