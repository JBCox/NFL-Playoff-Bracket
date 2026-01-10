import type { GameSlot } from '../data/participants';
import { getByeTeam, getTeamByAbbreviation } from '../data/teams';

/**
 * Given a participant's picks, derive the expected opponent for each game.
 * This shows what matchup the participant EXPECTS based on their earlier picks.
 */
export function getExpectedOpponent(
  picks: Record<string, string>,
  gameSlot: GameSlot
): string | null {
  switch (gameSlot) {
    // Divisional games: opponent comes from participant's Wild Card picks
    case 'afcDiv1':
      return getDivisionalOpponent(picks, 'AFC', 'div1');

    case 'afcDiv2':
      return getDivisionalOpponent(picks, 'AFC', 'div2');

    case 'nfcDiv1':
      return getDivisionalOpponent(picks, 'NFC', 'div1');

    case 'nfcDiv2':
      return getDivisionalOpponent(picks, 'NFC', 'div2');

    // Conference Championship: opponent is the other Divisional winner
    case 'afcConf': {
      const pick = picks['afcConf'];
      const div1Pick = picks['afcDiv1'];
      const div2Pick = picks['afcDiv2'];
      return pick === div1Pick ? div2Pick : div1Pick;
    }

    case 'nfcConf': {
      const pick = picks['nfcConf'];
      const div1Pick = picks['nfcDiv1'];
      const div2Pick = picks['nfcDiv2'];
      return pick === div1Pick ? div2Pick : div1Pick;
    }

    // Super Bowl: opponent is the other Conference winner
    case 'superBowl': {
      const pick = picks['superBowl'];
      const afcConfPick = picks['afcConf'];
      const nfcConfPick = picks['nfcConf'];
      return pick === afcConfPick ? nfcConfPick : afcConfPick;
    }

    // Wild Card games have actual opponents from the schedule
    default:
      return null;
  }
}

/**
 * Get the expected opponent for a divisional game based on NFL reseeding rules.
 *
 * NFL Reseeding after Wild Card:
 * - 4 teams remain: #1 seed (bye) + 3 Wild Card winners
 * - Teams are reseeded by original seed
 * - Div1: #1 seed vs lowest remaining seed (highest seed number)
 * - Div2: Two middle remaining seeds play each other
 */
function getDivisionalOpponent(
  picks: Record<string, string>,
  conference: 'AFC' | 'NFC',
  game: 'div1' | 'div2'
): string | null {
  const prefix = conference.toLowerCase();
  const byeTeam = getByeTeam(conference);

  // Get participant's Wild Card picks (expected winners)
  const wc1Pick = picks[`${prefix}Wc1`];
  const wc2Pick = picks[`${prefix}Wc2`];
  const wc3Pick = picks[`${prefix}Wc3`];

  // Get participant's divisional picks
  const div1Pick = picks[`${prefix}Div1`];
  const div2Pick = picks[`${prefix}Div2`];
  const divPick = game === 'div1' ? div1Pick : div2Pick;

  // Look up seed numbers for each WC winner
  const wcWinners = [wc1Pick, wc2Pick, wc3Pick]
    .filter(Boolean)
    .map(abbr => {
      const team = getTeamByAbbreviation(abbr);
      return team ? { abbr, seed: team.seed } : null;
    })
    .filter((t): t is { abbr: string; seed: number } => t !== null);

  // Sort ascending by seed number (lower = better)
  wcWinners.sort((a, b) => a.seed - b.seed);

  // wcWinners[0] = best remaining WC winner (lowest seed #)
  // wcWinners[1] = middle
  // wcWinners[2] = worst remaining (highest seed #) - plays bye team
  const worstWcWinner = wcWinners[2]?.abbr;

  if (game === 'div1') {
    // Div1: #1 seed (bye) vs worst remaining (highest seed #)
    // If participant picked bye team to win, opponent is worst WC winner
    // If participant picked an upset, opponent is bye team
    if (divPick === byeTeam?.abbreviation) {
      // Normally show worst WC winner, but avoid showing team they picked for Div2
      if (worstWcWinner && worstWcWinner !== div2Pick) {
        return worstWcWinner;
      }
      // If worst WC winner is their Div2 pick, show next worst
      const nextWorst = wcWinners[1]?.abbr;
      if (nextWorst && nextWorst !== div2Pick) {
        return nextWorst;
      }
      return wcWinners[0]?.abbr || null;
    } else {
      return byeTeam?.abbreviation || null;
    }
  } else {
    // Div2: The two WC winners NOT playing in Div1
    // Div1 has: bye team vs worst WC winner (OR an upset pick)

    // Figure out who is "used" in Div1
    const div1Teams = new Set<string>();
    div1Teams.add(byeTeam?.abbreviation || '');
    div1Teams.add(div1Pick); // whoever they picked for Div1
    // If they picked bye team, the opponent is worst WC winner
    if (div1Pick === byeTeam?.abbreviation) {
      div1Teams.add(worstWcWinner || '');
    }

    // Div2 candidates are WC winners NOT in Div1
    const div2Candidates = wcWinners
      .map(w => w.abbr)
      .filter(abbr => !div1Teams.has(abbr));

    // Return the opponent (whichever candidate they didn't pick)
    const opponent = div2Candidates.find(abbr => abbr !== div2Pick);
    return opponent || div2Candidates[0] || null;
  }
}

/**
 * Build a map of all picks for a participant (gameId -> teamAbbr)
 */
export function buildPicksMap(participantPicks: { gameId: string; teamAbbreviation: string }[]): Record<string, string> {
  const map: Record<string, string> = {};
  for (const pick of participantPicks) {
    map[pick.gameId] = pick.teamAbbreviation;
  }
  return map;
}
