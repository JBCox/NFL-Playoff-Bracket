import type { Game, Round, Conference, GameStatus, ESPNScoreboard, ESPNEvent } from '../types';
import { getTeamByAbbreviation } from '../data/teams';

const ESPN_BASE_URL = 'https://site.api.espn.com/apis/site/v2/sports/football/nfl';

// Playoff scoreboard endpoint (seasontype=3)
export async function fetchPlayoffScoreboard(): Promise<ESPNScoreboard> {
  const response = await fetch(`${ESPN_BASE_URL}/scoreboard?seasontype=3`);
  if (!response.ok) {
    throw new Error(`ESPN API error: ${response.status}`);
  }
  return response.json();
}

// Fetch scoreboard for specific playoff week
export async function fetchPlayoffWeek(week: number): Promise<ESPNScoreboard> {
  const response = await fetch(`${ESPN_BASE_URL}/scoreboard?seasontype=3&week=${week}`);
  if (!response.ok) {
    throw new Error(`ESPN API error: ${response.status}`);
  }
  return response.json();
}

// Determine round from week number
function weekToRound(week: number | undefined): Round {
  switch (week) {
    case 1: return 'wildcard';
    case 2: return 'divisional';
    case 3: return 'conference';
    case 4: return 'superbowl';
    default: return 'wildcard';
  }
}

// Determine game status
function parseStatus(statusName: string): GameStatus {
  const name = statusName.toLowerCase();
  if (name.includes('final')) return 'final';
  if (name.includes('progress') || name.includes('live')) return 'live';
  if (name.includes('postponed')) return 'postponed';
  return 'scheduled';
}

// Determine conference from team abbreviations
function determineConference(homeAbbr: string, awayAbbr: string): Conference | null {
  const afcTeams = ['DEN', 'HOU', 'BUF', 'LAC', 'PIT', 'NE', 'JAX'];
  const nfcTeams = ['SEA', 'PHI', 'GB', 'SF', 'CHI', 'LAR', 'CAR'];

  if (afcTeams.includes(homeAbbr) || afcTeams.includes(awayAbbr)) return 'AFC';
  if (nfcTeams.includes(homeAbbr) || nfcTeams.includes(awayAbbr)) return 'NFC';
  return null; // Super Bowl
}

// Parse ESPN event into our Game model
export function parseESPNEvent(event: ESPNEvent, slot: number = 1): Game {
  const competition = event.competitions[0];
  const homeCompetitor = competition.competitors.find(c => c.homeAway === 'home');
  const awayCompetitor = competition.competitors.find(c => c.homeAway === 'away');

  const homeAbbr = homeCompetitor?.team.abbreviation || '';
  const awayAbbr = awayCompetitor?.team.abbreviation || '';
  const homeScore = homeCompetitor?.score ? parseInt(homeCompetitor.score) : null;
  const awayScore = awayCompetitor?.score ? parseInt(awayCompetitor.score) : null;

  const status = parseStatus(competition.status.type.name);
  let winner: string | null = null;

  if (status === 'final') {
    if (homeScore !== null && awayScore !== null) {
      winner = homeScore > awayScore ? homeAbbr : awayAbbr;
    }
  }

  const round = weekToRound(event.week?.number);
  const conference = round === 'superbowl' ? null : determineConference(homeAbbr, awayAbbr);

  return {
    id: event.id,
    round,
    conference,
    slot,
    homeTeam: getTeamByAbbreviation(homeAbbr) || null,
    awayTeam: getTeamByAbbreviation(awayAbbr) || null,
    homeScore,
    awayScore,
    winner,
    status,
    gameTime: event.date,
    displayClock: competition.status.displayClock,
    period: competition.status.period,
  };
}

// Fetch and parse all playoff games (all weeks)
export async function fetchAllPlayoffGames(): Promise<Game[]> {
  try {
    // Fetch all 4 playoff weeks in parallel
    const [week1, week2, week3, week4] = await Promise.all([
      fetchPlayoffWeek(1), // Wild Card
      fetchPlayoffWeek(2), // Divisional
      fetchPlayoffWeek(3), // Conference
      fetchPlayoffWeek(4), // Super Bowl
    ]);

    const allEvents = [
      ...week1.events,
      ...week2.events,
      ...week3.events,
      ...week4.events,
    ];

    // Group by round and assign slots
    const gamesByRound: Record<string, Game[]> = {
      wildcard: [],
      divisional: [],
      conference: [],
      superbowl: [],
    };

    allEvents.forEach((event, index) => {
      const game = parseESPNEvent(event, index + 1);
      gamesByRound[game.round].push(game);
    });

    // Reassign slots within each round
    Object.values(gamesByRound).forEach(games => {
      games.forEach((game, idx) => {
        game.slot = idx + 1;
      });
    });

    return Object.values(gamesByRound).flat();
  } catch (error) {
    console.error('Failed to fetch playoff games:', error);
    return [];
  }
}

// Poll interval based on game status
export function getPollingInterval(games: Game[]): number {
  const hasLiveGame = games.some(g => g.status === 'live');
  if (hasLiveGame) return 30000; // 30 seconds during live games

  const hasGameToday = games.some(g => {
    if (!g.gameTime) return false;
    const gameDate = new Date(g.gameTime);
    const today = new Date();
    return gameDate.toDateString() === today.toDateString() && g.status === 'scheduled';
  });
  if (hasGameToday) return 120000; // 2 minutes on game day

  return 300000; // 5 minutes otherwise
}
