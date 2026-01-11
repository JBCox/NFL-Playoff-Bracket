import type { Game, Participant, Conference } from '../types';
import { calculateParticipantScore, getGameResults, mapESPNGameToSlot } from './scoreCalculator';
import { getTeamWinProbability, type GameOdds } from './oddsClient';
import { getTeamByAbbreviation, getByeTeam } from '../data/teams';

// All game slots in bracket order
const ALL_GAME_SLOTS = [
  'afcWc1', 'afcWc2', 'afcWc3',
  'nfcWc1', 'nfcWc2', 'nfcWc3',
  'afcDiv1', 'afcDiv2', 'nfcDiv1', 'nfcDiv2',
  'afcConf', 'nfcConf',
  'superBowl'
] as const;

// Fixed Wild Card matchups (based on actual ESPN schedule)
const WC_MATCHUPS: Record<string, [string, string]> = {
  afcWc1: ['PIT', 'HOU'],   // PIT @ HOU
  afcWc2: ['JAX', 'BUF'],   // JAX @ BUF
  afcWc3: ['NE', 'LAC'],    // NE @ LAC
  nfcWc1: ['CAR', 'LAR'],   // CAR @ LAR
  nfcWc2: ['PHI', 'SF'],    // PHI @ SF
  nfcWc3: ['CHI', 'GB'],    // CHI @ GB
};

export interface WinProbabilities {
  fiftyFifty: number;
  vegas: number;
}

export interface ProbabilityResult {
  probabilities: Map<string, WinProbabilities>;
  isEliminated: Map<string, boolean>;
}

// Get the teams that could possibly win a game slot
function getPossibleWinners(
  slotId: string,
  currentResults: Map<string, string>,
  games: Game[]
): [string, string] | null {
  // For Wild Card games, teams are fixed
  if (slotId.includes('Wc')) {
    const game = games.find(g => mapESPNGameToSlot(g) === slotId);
    if (game && game.homeTeam && game.awayTeam) {
      return [game.homeTeam.abbreviation, game.awayTeam.abbreviation];
    }
    // Fallback to hardcoded matchups
    const matchup = WC_MATCHUPS[slotId];
    if (matchup) return matchup;
    return null;
  }

  // For Divisional games, determine matchups from WC results via reseeding
  if (slotId.includes('Div')) {
    const conference = slotId.startsWith('afc') ? 'AFC' : 'NFC';
    return getDivisionalMatchup(slotId, conference, currentResults);
  }

  // For Conference games, it's the two divisional winners
  if (slotId.includes('Conf')) {
    const conference = slotId.startsWith('afc') ? 'AFC' : 'NFC';
    const div1SlotId = conference === 'AFC' ? 'afcDiv1' : 'nfcDiv1';
    const div2SlotId = conference === 'AFC' ? 'afcDiv2' : 'nfcDiv2';

    const div1Winner = currentResults.get(div1SlotId);
    const div2Winner = currentResults.get(div2SlotId);

    if (div1Winner && div2Winner) {
      return [div1Winner, div2Winner];
    }
    return null;
  }

  // For Super Bowl, it's the two conference winners
  if (slotId === 'superBowl') {
    const afcWinner = currentResults.get('afcConf');
    const nfcWinner = currentResults.get('nfcConf');

    if (afcWinner && nfcWinner) {
      return [afcWinner, nfcWinner];
    }
    return null;
  }

  return null;
}

// Get divisional matchup based on WC results and reseeding
function getDivisionalMatchup(
  slotId: string,
  conference: Conference,
  currentResults: Map<string, string>
): [string, string] | null {
  const byeTeam = getByeTeam(conference);
  if (!byeTeam) return null;

  // Get WC slot IDs for this conference
  const wcSlots = conference === 'AFC'
    ? ['afcWc1', 'afcWc2', 'afcWc3']
    : ['nfcWc1', 'nfcWc2', 'nfcWc3'];

  // Get WC winners
  const wcWinners: string[] = [];
  for (const wcSlot of wcSlots) {
    const winner = currentResults.get(wcSlot);
    if (winner) {
      wcWinners.push(winner);
    }
  }

  // Need all 3 WC results to determine divisional matchups
  if (wcWinners.length !== 3) {
    return null;
  }

  // Get seeds of WC winners
  const wcWinnersWithSeeds = wcWinners.map(abbr => {
    const team = getTeamByAbbreviation(abbr);
    return { abbr, seed: team?.seed ?? 99 };
  });

  // Sort by seed (highest seed number = lowest remaining)
  wcWinnersWithSeeds.sort((a, b) => b.seed - a.seed);

  const isDiv1 = slotId.endsWith('Div1');

  if (isDiv1) {
    // Div1: #1 seed (bye) vs lowest remaining seed (highest seed number)
    return [byeTeam.abbreviation, wcWinnersWithSeeds[0].abbr];
  } else {
    // Div2: Higher remaining seed hosts lower remaining seed
    // wcWinnersWithSeeds[2] = lowest seed number = highest remaining
    // wcWinnersWithSeeds[1] = middle seed
    return [wcWinnersWithSeeds[2].abbr, wcWinnersWithSeeds[1].abbr];
  }
}

// Calculate win probabilities for all participants
export function calculateWinProbabilities(
  games: Game[],
  participants: Participant[],
  oddsMap: Map<string, GameOdds>
): ProbabilityResult {
  // Get completed results
  const completedResults = getGameResults(games);

  // Find remaining (incomplete) game slots
  const remainingSlots = ALL_GAME_SLOTS.filter(slot => !completedResults.has(slot));

  // Track wins
  const wins = new Map<string, { fiftyFifty: number; vegas: number }>();
  for (const p of participants) {
    wins.set(p.name, { fiftyFifty: 0, vegas: 0 });
  }

  // If all games complete, return final standings
  if (remainingSlots.length === 0) {
    const scores = participants.map(p => ({
      participant: p,
      score: calculateParticipantScore(p, completedResults).total
    }));
    scores.sort((a, b) => b.score - a.score);

    const topScore = scores[0].score;
    const winners = scores.filter(s => s.score === topScore);

    const probabilities = new Map<string, WinProbabilities>();
    const isEliminated = new Map<string, boolean>();

    for (const p of participants) {
      const isWinner = winners.some(w => w.participant.name === p.name);
      probabilities.set(p.name, {
        fiftyFifty: isWinner ? 1 / winners.length : 0,
        vegas: isWinner ? 1 / winners.length : 0
      });
      isEliminated.set(p.name, !isWinner);
    }

    return { probabilities, isEliminated };
  }

  const n = remainingSlots.length;
  const numScenarios = Math.pow(2, n);

  let totalVegasWeight = 0;
  let validScenarios = 0;

  // Enumerate all possible outcomes
  for (let i = 0; i < numScenarios; i++) {
    const scenarioResults = new Map(completedResults);
    let vegasWeight = 1.0;
    let isValid = true;

    // Build this scenario's results
    for (let j = 0; j < n; j++) {
      const slotId = remainingSlots[j];
      const outcomeIndex = (i >> j) & 1; // 0 or 1

      // Get possible winners for this slot
      const possibleWinners = getPossibleWinners(slotId, scenarioResults, games);

      if (!possibleWinners) {
        // Can't determine matchup yet - this scenario might be invalid
        // or we need more info. Skip this scenario.
        isValid = false;
        break;
      }

      const winner = possibleWinners[outcomeIndex];
      scenarioResults.set(slotId, winner);

      // Get probability for this outcome
      const winProb = getTeamWinProbability(oddsMap, possibleWinners[0], possibleWinners[1], winner);
      vegasWeight *= winProb;
    }

    if (!isValid) continue;

    validScenarios++;
    totalVegasWeight += vegasWeight;

    // Calculate scores for all participants
    const scores = participants.map(p => ({
      participant: p,
      score: calculateParticipantScore(p, scenarioResults).total
    }));

    // Find winner(s) - highest score
    scores.sort((a, b) => b.score - a.score);
    const topScore = scores[0].score;
    const tiedWinners = scores.filter(s => s.score === topScore);
    const winShare = 1 / tiedWinners.length;

    // Credit winners
    for (const tied of tiedWinners) {
      const current = wins.get(tied.participant.name)!;
      current.fiftyFifty += winShare;
      current.vegas += vegasWeight * winShare;
    }
  }

  // Convert to probabilities
  const probabilities = new Map<string, WinProbabilities>();
  const isEliminated = new Map<string, boolean>();

  for (const p of participants) {
    const w = wins.get(p.name)!;
    const fiftyFifty = validScenarios > 0 ? w.fiftyFifty / validScenarios : 0;
    const vegas = totalVegasWeight > 0 ? w.vegas / totalVegasWeight : 0;

    probabilities.set(p.name, { fiftyFifty, vegas });
    isEliminated.set(p.name, fiftyFifty === 0 && vegas === 0);
  }

  return { probabilities, isEliminated };
}

// Get probability tier for color coding
export function getProbabilityTier(probability: number): 'high' | 'medium' | 'low' | 'eliminated' {
  if (probability === 0) return 'eliminated';
  if (probability > 0.4) return 'high';
  if (probability >= 0.15) return 'medium';
  return 'low';
}
