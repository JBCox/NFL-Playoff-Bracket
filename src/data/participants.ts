import type { Participant } from '../types';
import { normalizeTeamName } from './teams';

// Game ID mapping for picks
// WC games: afcWc1, afcWc2, afcWc3, nfcWc1, nfcWc2, nfcWc3
// Div games: afcDiv1, afcDiv2, nfcDiv1, nfcDiv2
// Conf games: afcConf, nfcConf
// Super Bowl: superBowl

export type GameSlot =
  | 'afcWc1' | 'afcWc2' | 'afcWc3'
  | 'nfcWc1' | 'nfcWc2' | 'nfcWc3'
  | 'afcDiv1' | 'afcDiv2'
  | 'nfcDiv1' | 'nfcDiv2'
  | 'afcConf' | 'nfcConf'
  | 'superBowl';

// Raw picks data from spreadsheet (team names as entered)
interface RawParticipantPicks {
  name: string;
  afcWc1: string;  // Pit/Hou
  afcWc2: string;  // Jax/Buf
  afcWc3: string;  // NE/LAC
  afcDiv1: string;
  afcDiv2: string;
  afcConf: string;
  nfcWc1: string;  // Car/LAR
  nfcWc2: string;  // Phi/SF
  nfcWc3: string;  // Chi/GB
  nfcDiv1: string;
  nfcDiv2: string;
  nfcConf: string;
  superBowl: string;
}

// All participant picks from the original spreadsheet
const rawPicks: RawParticipantPicks[] = [
  {
    name: 'Jen',
    afcWc1: 'Pittsburgh', afcWc2: 'Jacksonville', afcWc3: 'New England',
    afcDiv1: 'Denver', afcDiv2: 'New England', afcConf: 'Denver',
    nfcWc1: 'Carolina', nfcWc2: 'Philadelphia', nfcWc3: 'Green Bay',
    nfcDiv1: 'Green Bay', nfcDiv2: 'Philadelphia', nfcConf: 'Green Bay',
    superBowl: 'Denver'
  },
  {
    name: 'Matt',
    afcWc1: 'Houston', afcWc2: 'Buffalo', afcWc3: 'New England',
    afcDiv1: 'Denver', afcDiv2: 'Buffalo', afcConf: 'Buffalo',
    nfcWc1: 'LA Rams', nfcWc2: 'Philadelphia', nfcWc3: 'Chicago',
    nfcDiv1: 'Seattle', nfcDiv2: 'Philadelphia', nfcConf: 'Philadelphia',
    superBowl: 'Buffalo'
  },
  {
    name: 'Rita',
    afcWc1: 'Pittsburgh', afcWc2: 'Jacksonville', afcWc3: 'New England',
    afcDiv1: 'Denver', afcDiv2: 'New England', afcConf: 'New England',
    nfcWc1: 'LA Rams', nfcWc2: 'San Francisco', nfcWc3: 'Green Bay',
    nfcDiv1: 'Green Bay', nfcDiv2: 'San Francisco', nfcConf: 'Green Bay',
    superBowl: 'Green Bay'
  },
  {
    name: 'Frank',
    afcWc1: 'Houston', afcWc2: 'Jacksonville', afcWc3: 'New England',
    afcDiv1: 'Denver', afcDiv2: 'Jacksonville', afcConf: 'Denver',
    nfcWc1: 'LA Rams', nfcWc2: 'San Francisco', nfcWc3: 'Chicago',
    nfcDiv1: 'Seattle', nfcDiv2: 'Chicago', nfcConf: 'Seattle',
    superBowl: 'Seattle'
  },
  {
    name: 'Spencer',
    afcWc1: 'Pittsburgh', afcWc2: 'Jacksonville', afcWc3: 'New England',
    afcDiv1: 'Denver', afcDiv2: 'New England', afcConf: 'New England',
    nfcWc1: 'LA Rams', nfcWc2: 'Philadelphia', nfcWc3: 'Chicago',
    nfcDiv1: 'LA Rams', nfcDiv2: 'Philadelphia', nfcConf: 'LA Rams',
    superBowl: 'LA Rams'
  },
  {
    name: 'Nick',
    afcWc1: 'Houston', afcWc2: 'Buffalo', afcWc3: 'New England',
    afcDiv1: 'Buffalo', afcDiv2: 'New England', afcConf: 'Buffalo',
    nfcWc1: 'LA Rams', nfcWc2: 'San Francisco', nfcWc3: 'Chicago',
    nfcDiv1: 'Seattle', nfcDiv2: 'San Francisco', nfcConf: 'Seattle',
    superBowl: 'Seattle'
  },
  {
    name: 'Josh',
    afcWc1: 'Houston', afcWc2: 'Buffalo', afcWc3: 'New England',
    afcDiv1: 'Buffalo', afcDiv2: 'New England', afcConf: 'New England',
    nfcWc1: 'LA Rams', nfcWc2: 'San Francisco', nfcWc3: 'Chicago',
    nfcDiv1: 'Seattle', nfcDiv2: 'Chicago', nfcConf: 'Chicago',
    superBowl: 'Chicago'
  },
  {
    name: 'Casey',
    afcWc1: 'Houston', afcWc2: 'Buffalo', afcWc3: 'New England',
    afcDiv1: 'Buffalo', afcDiv2: 'Houston', afcConf: 'Buffalo',
    nfcWc1: 'LA Rams', nfcWc2: 'San Francisco', nfcWc3: 'Chicago',
    nfcDiv1: 'Seattle', nfcDiv2: 'Chicago', nfcConf: 'Chicago',
    superBowl: 'Buffalo'
  },
  {
    name: 'David',
    afcWc1: 'Houston', afcWc2: 'Buffalo', afcWc3: 'New England',
    afcDiv1: 'Denver', afcDiv2: 'New England', afcConf: 'Denver',
    nfcWc1: 'LA Rams', nfcWc2: 'Philadelphia', nfcWc3: 'Chicago',
    nfcDiv1: 'Seattle', nfcDiv2: 'Chicago', nfcConf: 'Seattle',
    superBowl: 'Seattle'
  },
  {
    name: 'Joe',
    afcWc1: 'Houston', afcWc2: 'Buffalo', afcWc3: 'New England',
    afcDiv1: 'Buffalo', afcDiv2: 'Houston', afcConf: 'Buffalo',
    nfcWc1: 'LA Rams', nfcWc2: 'Philadelphia', nfcWc3: 'Green Bay',
    nfcDiv1: 'Seattle', nfcDiv2: 'LA Rams', nfcConf: 'LA Rams',
    superBowl: 'Buffalo'
  },
  {
    name: 'Aidan',
    afcWc1: 'Houston', afcWc2: 'Buffalo', afcWc3: 'New England',
    afcDiv1: 'Denver', afcDiv2: 'Houston', afcConf: 'Houston',
    nfcWc1: 'LA Rams', nfcWc2: 'Philadelphia', nfcWc3: 'Chicago',
    nfcDiv1: 'Seattle', nfcDiv2: 'Chicago', nfcConf: 'Seattle',
    superBowl: 'Seattle'
  },
];

// Convert raw picks to normalized Participant format
export const participants: Participant[] = rawPicks.map((raw) => ({
  id: raw.name.toLowerCase().replace(/\s+/g, '-'),
  name: raw.name,
  picks: [
    { gameId: 'afcWc1', teamAbbreviation: normalizeTeamName(raw.afcWc1) },
    { gameId: 'afcWc2', teamAbbreviation: normalizeTeamName(raw.afcWc2) },
    { gameId: 'afcWc3', teamAbbreviation: normalizeTeamName(raw.afcWc3) },
    { gameId: 'afcDiv1', teamAbbreviation: normalizeTeamName(raw.afcDiv1) },
    { gameId: 'afcDiv2', teamAbbreviation: normalizeTeamName(raw.afcDiv2) },
    { gameId: 'afcConf', teamAbbreviation: normalizeTeamName(raw.afcConf) },
    { gameId: 'nfcWc1', teamAbbreviation: normalizeTeamName(raw.nfcWc1) },
    { gameId: 'nfcWc2', teamAbbreviation: normalizeTeamName(raw.nfcWc2) },
    { gameId: 'nfcWc3', teamAbbreviation: normalizeTeamName(raw.nfcWc3) },
    { gameId: 'nfcDiv1', teamAbbreviation: normalizeTeamName(raw.nfcDiv1) },
    { gameId: 'nfcDiv2', teamAbbreviation: normalizeTeamName(raw.nfcDiv2) },
    { gameId: 'nfcConf', teamAbbreviation: normalizeTeamName(raw.nfcConf) },
    { gameId: 'superBowl', teamAbbreviation: normalizeTeamName(raw.superBowl) },
  ],
}));

// Helper to get participant by ID
export function getParticipantById(id: string): Participant | undefined {
  return participants.find(p => p.id === id);
}

// Helper to get participant's pick for a specific game
export function getParticipantPick(participantId: string, gameId: string): string | undefined {
  const participant = getParticipantById(participantId);
  if (!participant) return undefined;
  const pick = participant.picks.find(p => p.gameId === gameId);
  return pick?.teamAbbreviation;
}
