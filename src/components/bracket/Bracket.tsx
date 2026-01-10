import { useMemo } from 'react';
import type { Game, Conference } from '../../types';
import { getParticipantPick, getParticipantById } from '../../data/participants';
import { mapESPNGameToSlot } from '../../services/scoreCalculator';
import { getEliminatedTeams } from '../../utils/elimination';
import { calculateDivisionalMatchups } from '../../utils/reseeding';
import { buildPicksMap, getExpectedOpponent } from '../../utils/expectedMatchups';
import type { GameSlot as GameSlotType } from '../../data/participants';
import GameSlot from './GameSlot';

interface BracketProps {
  games: Game[];
  participantId: string;
}

export default function Bracket({ games, participantId }: BracketProps) {
  // Compute eliminated teams once
  const eliminatedTeams = useMemo(() => getEliminatedTeams(games), [games]);

  // Build picks map for expected opponent calculations
  const picksMap = useMemo(() => {
    const participant = getParticipantById(participantId);
    return participant ? buildPicksMap(participant.picks) : {};
  }, [participantId]);

  // Helper to get expected opponent for a game slot
  const getOpponent = (slotId: GameSlotType): string | null => {
    return getExpectedOpponent(picksMap, slotId);
  };

  // Helper to get game by slot ID
  const getGameBySlot = (slotId: string): Game | undefined => {
    return games.find(g => mapESPNGameToSlot(g) === slotId);
  };

  // Helper to get participant's pick for a game slot
  const getPick = (slotId: string): string | null => {
    return getParticipantPick(participantId, slotId) || null;
  };

  // Create placeholder games for rounds that haven't started
  const createPlaceholderGame = (slotId: string, conference: 'AFC' | 'NFC' | null, round: Game['round']): Game => ({
    id: slotId,
    round,
    conference,
    slot: 1,
    homeTeam: null,
    awayTeam: null,
    homeScore: null,
    awayScore: null,
    winner: null,
    status: 'scheduled',
    gameTime: null,
  });

  // Calculate divisional matchups based on Wild Card results (reseeding)
  const afcMatchups = useMemo(() => calculateDivisionalMatchups(games, 'AFC'), [games]);
  const nfcMatchups = useMemo(() => calculateDivisionalMatchups(games, 'NFC'), [games]);

  // Create divisional game with reseeded matchups
  const createDivisionalGame = (
    slotId: string,
    conference: Conference,
    isDiv1: boolean
  ): Game => {
    const matchups = conference === 'AFC' ? afcMatchups : nfcMatchups;

    // Div1: #1 seed (bye) vs lowest remaining
    // Div2: Two middle seeds
    const homeTeam = isDiv1 ? matchups.div1Home : matchups.div2Home;
    const awayTeam = isDiv1 ? matchups.div1Away : matchups.div2Away;

    return {
      id: slotId,
      round: 'divisional',
      conference,
      slot: isDiv1 ? 1 : 2,
      homeTeam: homeTeam || null,
      awayTeam: awayTeam || null,
      homeScore: null,
      awayScore: null,
      winner: null,
      status: 'scheduled',
      gameTime: null,
    };
  };

  // Get games for each slot, with placeholders if needed
  const afcWc1 = getGameBySlot('afcWc1') || createPlaceholderGame('afcWc1', 'AFC', 'wildcard');
  const afcWc2 = getGameBySlot('afcWc2') || createPlaceholderGame('afcWc2', 'AFC', 'wildcard');
  const afcWc3 = getGameBySlot('afcWc3') || createPlaceholderGame('afcWc3', 'AFC', 'wildcard');
  // Divisional games use reseeding - Div1: #1 vs lowest, Div2: middle seeds
  const afcDiv1 = getGameBySlot('afcDiv1') || createDivisionalGame('afcDiv1', 'AFC', true);
  const afcDiv2 = getGameBySlot('afcDiv2') || createDivisionalGame('afcDiv2', 'AFC', false);
  const afcConf = getGameBySlot('afcConf') || createPlaceholderGame('afcConf', 'AFC', 'conference');

  const nfcWc1 = getGameBySlot('nfcWc1') || createPlaceholderGame('nfcWc1', 'NFC', 'wildcard');
  const nfcWc2 = getGameBySlot('nfcWc2') || createPlaceholderGame('nfcWc2', 'NFC', 'wildcard');
  const nfcWc3 = getGameBySlot('nfcWc3') || createPlaceholderGame('nfcWc3', 'NFC', 'wildcard');
  // Divisional games use reseeding - Div1: #1 vs lowest, Div2: middle seeds
  const nfcDiv1 = getGameBySlot('nfcDiv1') || createDivisionalGame('nfcDiv1', 'NFC', true);
  const nfcDiv2 = getGameBySlot('nfcDiv2') || createDivisionalGame('nfcDiv2', 'NFC', false);
  const nfcConf = getGameBySlot('nfcConf') || createPlaceholderGame('nfcConf', 'NFC', 'conference');

  const superBowl = getGameBySlot('superBowl') || createPlaceholderGame('superBowl', null, 'superbowl');

  return (
    <div className="w-full h-full p-4 overflow-auto">
      <div className="grid grid-cols-7 gap-2 min-w-[1000px] h-full items-center">
        {/* AFC Wild Card */}
        <div className="flex flex-col gap-4 justify-around h-full">
          <div>
            <div className="text-xs font-bold text-afc-primary mb-1 text-center">AFC WILD CARD</div>
            <GameSlot game={afcWc1} participantPick={getPick('afcWc1')} eliminatedTeams={eliminatedTeams} />
          </div>
          <GameSlot game={afcWc2} participantPick={getPick('afcWc2')} eliminatedTeams={eliminatedTeams} />
          <GameSlot game={afcWc3} participantPick={getPick('afcWc3')} eliminatedTeams={eliminatedTeams} />
          <div className="bg-afc-bg rounded p-2 text-center">
            <div className="text-xs text-gray-500">BYE</div>
            <div className="text-sm font-bold text-afc-primary">#1 Denver</div>
          </div>
        </div>

        {/* AFC Divisional */}
        <div className="flex flex-col gap-6 justify-around h-full">
          <div>
            <div className="text-xs font-bold text-afc-primary mb-1 text-center">AFC DIVISIONAL</div>
            <GameSlot game={afcDiv1} participantPick={getPick('afcDiv1')} expectedOpponent={getOpponent('afcDiv1')} eliminatedTeams={eliminatedTeams} />
          </div>
          <GameSlot game={afcDiv2} participantPick={getPick('afcDiv2')} expectedOpponent={getOpponent('afcDiv2')} eliminatedTeams={eliminatedTeams} />
        </div>

        {/* AFC Championship */}
        <div className="flex flex-col justify-center h-full">
          <div className="text-xs font-bold text-afc-primary mb-1 text-center">AFC CHAMPIONSHIP</div>
          <GameSlot game={afcConf} participantPick={getPick('afcConf')} expectedOpponent={getOpponent('afcConf')} eliminatedTeams={eliminatedTeams} />
        </div>

        {/* Super Bowl (Center) */}
        <div className="flex flex-col justify-center h-full">
          <div className="text-center mb-2">
            <div className="text-lg font-bold text-superbowl-primary">SUPER BOWL</div>
            <div className="text-xs text-gray-500">LX</div>
          </div>
          <div className="transform scale-110">
            <GameSlot
              game={superBowl}
              participantPick={getPick('superBowl')}
              expectedOpponent={getOpponent('superBowl')}
              eliminatedTeams={eliminatedTeams}
              className="border-yellow-400 border-4 shadow-lg"
            />
          </div>
        </div>

        {/* NFC Championship */}
        <div className="flex flex-col justify-center h-full">
          <div className="text-xs font-bold text-nfc-primary mb-1 text-center">NFC CHAMPIONSHIP</div>
          <GameSlot game={nfcConf} participantPick={getPick('nfcConf')} expectedOpponent={getOpponent('nfcConf')} eliminatedTeams={eliminatedTeams} />
        </div>

        {/* NFC Divisional */}
        <div className="flex flex-col gap-6 justify-around h-full">
          <div>
            <div className="text-xs font-bold text-nfc-primary mb-1 text-center">NFC DIVISIONAL</div>
            <GameSlot game={nfcDiv1} participantPick={getPick('nfcDiv1')} expectedOpponent={getOpponent('nfcDiv1')} eliminatedTeams={eliminatedTeams} />
          </div>
          <GameSlot game={nfcDiv2} participantPick={getPick('nfcDiv2')} expectedOpponent={getOpponent('nfcDiv2')} eliminatedTeams={eliminatedTeams} />
        </div>

        {/* NFC Wild Card */}
        <div className="flex flex-col gap-4 justify-around h-full">
          <div>
            <div className="text-xs font-bold text-nfc-primary mb-1 text-center">NFC WILD CARD</div>
            <GameSlot game={nfcWc1} participantPick={getPick('nfcWc1')} eliminatedTeams={eliminatedTeams} />
          </div>
          <GameSlot game={nfcWc2} participantPick={getPick('nfcWc2')} eliminatedTeams={eliminatedTeams} />
          <GameSlot game={nfcWc3} participantPick={getPick('nfcWc3')} eliminatedTeams={eliminatedTeams} />
          <div className="bg-nfc-bg rounded p-2 text-center">
            <div className="text-xs text-gray-500">BYE</div>
            <div className="text-sm font-bold text-nfc-primary">#1 Seattle</div>
          </div>
        </div>
      </div>

      {/* Scoring Legend */}
      <div className="mt-4 flex justify-center gap-6 text-xs text-gray-600">
        <span>Wild Card: <strong>1 pt</strong></span>
        <span>Divisional: <strong>2 pts</strong></span>
        <span>Conference: <strong>3 pts</strong></span>
        <span>Super Bowl: <strong>5 pts</strong></span>
        <span className="text-gray-900 font-bold">Max: 25 pts</span>
      </div>
    </div>
  );
}
