// The Odds API client for fetching NFL betting odds
// API documentation: https://the-odds-api.com/liveapi/guides/v4/

const ODDS_API_BASE_URL = 'https://api.the-odds-api.com/v4';
const SPORT = 'americanfootball_nfl';

// Odds for a single game
export interface GameOdds {
  homeTeam: string;
  awayTeam: string;
  homeWinProbability: number;
  awayWinProbability: number;
}

// Raw API response types
interface OddsApiOutcome {
  name: string;
  price: number;
}

interface OddsApiMarket {
  key: string;
  outcomes: OddsApiOutcome[];
}

interface OddsApiBookmaker {
  key: string;
  markets: OddsApiMarket[];
}

interface OddsApiGame {
  id: string;
  home_team: string;
  away_team: string;
  bookmakers: OddsApiBookmaker[];
}

// Convert decimal odds to implied probability
function decimalOddsToProbability(odds: number): number {
  return 1 / odds;
}

// Remove vig (juice) by normalizing probabilities to 100%
function removeVig(homeProbability: number, awayProbability: number): { home: number; away: number } {
  const total = homeProbability + awayProbability;
  return {
    home: homeProbability / total,
    away: awayProbability / total,
  };
}

// Map common team name variations to abbreviations
const teamNameToAbbreviation: Record<string, string> = {
  'Denver Broncos': 'DEN',
  'Houston Texans': 'HOU',
  'Buffalo Bills': 'BUF',
  'Los Angeles Chargers': 'LAC',
  'Pittsburgh Steelers': 'PIT',
  'New England Patriots': 'NE',
  'Jacksonville Jaguars': 'JAX',
  'Seattle Seahawks': 'SEA',
  'Philadelphia Eagles': 'PHI',
  'Green Bay Packers': 'GB',
  'San Francisco 49ers': 'SF',
  'Chicago Bears': 'CHI',
  'Los Angeles Rams': 'LAR',
  'Carolina Panthers': 'CAR',
  // Add shortened versions as well
  'Broncos': 'DEN',
  'Texans': 'HOU',
  'Bills': 'BUF',
  'Chargers': 'LAC',
  'Steelers': 'PIT',
  'Patriots': 'NE',
  'Jaguars': 'JAX',
  'Seahawks': 'SEA',
  'Eagles': 'PHI',
  'Packers': 'GB',
  '49ers': 'SF',
  'Bears': 'CHI',
  'Rams': 'LAR',
  'Panthers': 'CAR',
};

function normalizeTeamName(name: string): string {
  return teamNameToAbbreviation[name] || name;
}

// Fetch odds from The Odds API
export async function fetchNflOdds(): Promise<Map<string, GameOdds>> {
  const apiKey = import.meta.env.VITE_ODDS_API_KEY;

  if (!apiKey) {
    console.warn('VITE_ODDS_API_KEY not set, using 50/50 odds');
    return new Map();
  }

  try {
    const url = new URL(`${ODDS_API_BASE_URL}/sports/${SPORT}/odds`);
    url.searchParams.set('apiKey', apiKey);
    url.searchParams.set('regions', 'us');
    url.searchParams.set('markets', 'h2h');
    url.searchParams.set('bookmakers', 'draftkings');

    const response = await fetch(url.toString());

    if (!response.ok) {
      throw new Error(`Odds API error: ${response.status}`);
    }

    const games: OddsApiGame[] = await response.json();
    const oddsMap = new Map<string, GameOdds>();

    for (const game of games) {
      // Find DraftKings bookmaker
      const bookmaker = game.bookmakers.find(b => b.key === 'draftkings') || game.bookmakers[0];
      if (!bookmaker) continue;

      // Find h2h (moneyline) market
      const market = bookmaker.markets.find(m => m.key === 'h2h');
      if (!market || market.outcomes.length < 2) continue;

      // Get odds for each team
      const homeOutcome = market.outcomes.find(o => o.name === game.home_team);
      const awayOutcome = market.outcomes.find(o => o.name === game.away_team);

      if (!homeOutcome || !awayOutcome) continue;

      // Convert to probabilities
      const rawHomeProbability = decimalOddsToProbability(homeOutcome.price);
      const rawAwayProbability = decimalOddsToProbability(awayOutcome.price);

      // Remove vig
      const { home, away } = removeVig(rawHomeProbability, rawAwayProbability);

      const homeAbbr = normalizeTeamName(game.home_team);
      const awayAbbr = normalizeTeamName(game.away_team);

      // Create a key that matches both possible orderings
      const gameKey = [homeAbbr, awayAbbr].sort().join('-');

      oddsMap.set(gameKey, {
        homeTeam: homeAbbr,
        awayTeam: awayAbbr,
        homeWinProbability: home,
        awayWinProbability: away,
      });
    }

    return oddsMap;
  } catch (error) {
    console.error('Failed to fetch odds:', error);
    return new Map();
  }
}

// Get win probability for a specific team in a matchup
export function getTeamWinProbability(
  oddsMap: Map<string, GameOdds>,
  team1Abbr: string,
  team2Abbr: string,
  targetTeamAbbr: string
): number {
  // Create consistent key for lookup
  const gameKey = [team1Abbr, team2Abbr].sort().join('-');
  const odds = oddsMap.get(gameKey);

  if (!odds) {
    // No odds available, return 50/50
    return 0.5;
  }

  if (targetTeamAbbr === odds.homeTeam) {
    return odds.homeWinProbability;
  } else if (targetTeamAbbr === odds.awayTeam) {
    return odds.awayWinProbability;
  }

  // Team not found in odds, return 50/50
  return 0.5;
}
