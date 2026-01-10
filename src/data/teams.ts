import type { Team, Conference } from '../types';

// 2025-26 NFL Playoff Teams
export const playoffTeams: Team[] = [
  // AFC Teams
  {
    id: 'den',
    name: 'Denver Broncos',
    abbreviation: 'DEN',
    shortName: 'Denver',
    conference: 'AFC',
    seed: 1,
    primaryColor: '#FB4F14',
    secondaryColor: '#002244',
  },
  {
    id: 'hou',
    name: 'Houston Texans',
    abbreviation: 'HOU',
    shortName: 'Houston',
    conference: 'AFC',
    seed: 2,
    primaryColor: '#03202F',
    secondaryColor: '#A71930',
  },
  {
    id: 'buf',
    name: 'Buffalo Bills',
    abbreviation: 'BUF',
    shortName: 'Buffalo',
    conference: 'AFC',
    seed: 3,
    primaryColor: '#00338D',
    secondaryColor: '#C60C30',
  },
  {
    id: 'lac',
    name: 'Los Angeles Chargers',
    abbreviation: 'LAC',
    shortName: 'LA Chargers',
    conference: 'AFC',
    seed: 4,
    primaryColor: '#0080C6',
    secondaryColor: '#FFC20E',
  },
  {
    id: 'pit',
    name: 'Pittsburgh Steelers',
    abbreviation: 'PIT',
    shortName: 'Pittsburgh',
    conference: 'AFC',
    seed: 5,
    primaryColor: '#FFB612',
    secondaryColor: '#101820',
  },
  {
    id: 'ne',
    name: 'New England Patriots',
    abbreviation: 'NE',
    shortName: 'New England',
    conference: 'AFC',
    seed: 6,
    primaryColor: '#002244',
    secondaryColor: '#C60C30',
  },
  {
    id: 'jax',
    name: 'Jacksonville Jaguars',
    abbreviation: 'JAX',
    shortName: 'Jacksonville',
    conference: 'AFC',
    seed: 7,
    primaryColor: '#006778',
    secondaryColor: '#D7A22A',
  },

  // NFC Teams
  {
    id: 'sea',
    name: 'Seattle Seahawks',
    abbreviation: 'SEA',
    shortName: 'Seattle',
    conference: 'NFC',
    seed: 1,
    primaryColor: '#002244',
    secondaryColor: '#69BE28',
  },
  {
    id: 'phi',
    name: 'Philadelphia Eagles',
    abbreviation: 'PHI',
    shortName: 'Philadelphia',
    conference: 'NFC',
    seed: 2,
    primaryColor: '#004C54',
    secondaryColor: '#A5ACAF',
  },
  {
    id: 'gb',
    name: 'Green Bay Packers',
    abbreviation: 'GB',
    shortName: 'Green Bay',
    conference: 'NFC',
    seed: 3,
    primaryColor: '#203731',
    secondaryColor: '#FFB612',
  },
  {
    id: 'sf',
    name: 'San Francisco 49ers',
    abbreviation: 'SF',
    shortName: 'San Francisco',
    conference: 'NFC',
    seed: 4,
    primaryColor: '#AA0000',
    secondaryColor: '#B3995D',
  },
  {
    id: 'chi',
    name: 'Chicago Bears',
    abbreviation: 'CHI',
    shortName: 'Chicago',
    conference: 'NFC',
    seed: 5,
    primaryColor: '#0B162A',
    secondaryColor: '#C83803',
  },
  {
    id: 'lar',
    name: 'Los Angeles Rams',
    abbreviation: 'LAR',
    shortName: 'LA Rams',
    conference: 'NFC',
    seed: 6,
    primaryColor: '#003594',
    secondaryColor: '#FFA300',
  },
  {
    id: 'car',
    name: 'Carolina Panthers',
    abbreviation: 'CAR',
    shortName: 'Carolina',
    conference: 'NFC',
    seed: 7,
    primaryColor: '#0085CA',
    secondaryColor: '#101820',
  },
];

// Helper functions
export function getTeamByAbbreviation(abbr: string): Team | undefined {
  return playoffTeams.find(t => t.abbreviation === abbr);
}

export function getTeamByName(name: string): Team | undefined {
  const normalized = name.toLowerCase().trim();
  return playoffTeams.find(t =>
    t.name.toLowerCase() === normalized ||
    t.shortName.toLowerCase() === normalized ||
    t.abbreviation.toLowerCase() === normalized
  );
}

export function getTeamsByConference(conference: Conference): Team[] {
  return playoffTeams.filter(t => t.conference === conference);
}

export function getByeTeam(conference: Conference): Team | undefined {
  return playoffTeams.find(t => t.conference === conference && t.seed === 1);
}

// Team name normalization map (handles variations)
export const teamNameMap: Record<string, string> = {
  // AFC
  'denver': 'DEN',
  'broncos': 'DEN',
  'houston': 'HOU',
  'texans': 'HOU',
  'buffalo': 'BUF',
  'bills': 'BUF',
  'la chargers': 'LAC',
  'chargers': 'LAC',
  'los angeles chargers': 'LAC',
  'pittsburgh': 'PIT',
  'steelers': 'PIT',
  'new england': 'NE',
  'patriots': 'NE',
  'jacksonville': 'JAX',
  'jaguars': 'JAX',

  // NFC
  'seattle': 'SEA',
  'seahawks': 'SEA',
  'philadelphia': 'PHI',
  'eagles': 'PHI',
  'green bay': 'GB',
  'packers': 'GB',
  'san francisco': 'SF',
  '49ers': 'SF',
  'chicago': 'CHI',
  'bears': 'CHI',
  'la rams': 'LAR',
  'rams': 'LAR',
  'los angeles rams': 'LAR',
  'carolina': 'CAR',
  'panthers': 'CAR',
};

export function normalizeTeamName(name: string): string {
  const normalized = name.toLowerCase().trim();
  return teamNameMap[normalized] || name.toUpperCase();
}
