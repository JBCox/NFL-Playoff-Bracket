// Core types for NFL Playoff Bracket App

export type Conference = 'AFC' | 'NFC';
export type Round = 'wildcard' | 'divisional' | 'conference' | 'superbowl';
export type GameStatus = 'scheduled' | 'live' | 'final' | 'postponed';
export type PickStatus = 'correct' | 'incorrect' | 'pending' | 'eliminated';

export interface Team {
  id: string;
  name: string;
  abbreviation: string;
  shortName: string;
  conference: Conference;
  seed: number;
  primaryColor: string;
  secondaryColor: string;
  logo?: string;
}

export interface Game {
  id: string;
  round: Round;
  conference: Conference | null; // null for Super Bowl
  slot: number; // Position within the round (1, 2, 3, etc.)
  homeTeam: Team | null;
  awayTeam: Team | null;
  homeScore: number | null;
  awayScore: number | null;
  winner: string | null; // Team abbreviation
  status: GameStatus;
  gameTime: string | null;
  displayClock?: string;
  period?: number;
  feedsInto?: string; // ID of next game
}

export interface ParticipantPick {
  gameId: string;
  teamAbbreviation: string;
}

export interface Participant {
  id: string;
  name: string;
  picks: ParticipantPick[];
}

export interface ScoreBreakdown {
  wildCard: number;      // max 6 (6 games x 1 pt)
  divisional: number;    // max 8 (4 games x 2 pts)
  conference: number;    // max 6 (2 games x 3 pts)
  superBowl: number;     // max 5 (1 game x 5 pts)
  total: number;         // max 25
}

export interface LeaderboardEntry {
  participant: Participant;
  score: ScoreBreakdown;
  rank: number;
  correctPicks: number;
  possibleRemaining: number;
}

export interface PlayoffBracket {
  season: number;
  games: Game[];
  lastUpdated: string;
}

// ESPN API response types
export interface ESPNEvent {
  id: string;
  date: string;
  name: string;
  competitions: ESPNCompetition[];
  status: {
    type: {
      name: string;
      shortDetail: string;
    };
    displayClock?: string;
    period?: number;
  };
  season: {
    year: number;
    type: number;
  };
  week?: {
    number: number;
  };
}

export interface ESPNCompetition {
  id: string;
  competitors: ESPNCompetitor[];
  status: {
    type: {
      name: string;
      shortDetail: string;
    };
    displayClock?: string;
    period?: number;
  };
}

export interface ESPNCompetitor {
  id: string;
  homeAway: 'home' | 'away';
  score?: string;
  winner?: boolean;
  team: {
    id: string;
    abbreviation: string;
    displayName: string;
    shortDisplayName: string;
    color?: string;
    alternateColor?: string;
    logo?: string;
  };
}

export interface ESPNScoreboard {
  events: ESPNEvent[];
  season: {
    year: number;
    type: number;
  };
  week?: {
    number: number;
  };
}

// Commentary types for AI announcer
export type CommentaryType =
  | 'standings'
  | 'gameReaction'
  | 'personalSpotlight'
  | 'rivalry'
  | 'preRound';

export interface Commentary {
  id: string;
  type: CommentaryType;
  content: string;
  participantIds: string[];
  round: Round;
  generatedAt: string;
  expiresAt: string;
}

// Scoring constants
export const POINTS_BY_ROUND: Record<Round, number> = {
  wildcard: 1,
  divisional: 2,
  conference: 3,
  superbowl: 5,
};

export const MAX_POINTS: ScoreBreakdown = {
  wildCard: 6,
  divisional: 8,
  conference: 6,
  superBowl: 5,
  total: 25,
};
