import { useMemo, useState } from 'react';
import type { Game, Conference } from '../../types';
import { getParticipantPick, getParticipantById } from '../../data/participants';
import { mapESPNGameToSlot } from '../../services/scoreCalculator';
import { getEliminatedTeams } from '../../utils/elimination';
import { calculateDivisionalMatchups } from '../../utils/reseeding';
import { buildPicksMap, getExpectedOpponent } from '../../utils/expectedMatchups';
import type { GameSlot as GameSlotType } from '../../data/participants';
import GameSlot from './GameSlot';

interface InlineBracketProps {
  games: Game[];
  participantId: string;
}

export default function InlineBracket({ games, participantId }: InlineBracketProps) {
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

  // Get games for each slot
  const afcWc1 = getGameBySlot('afcWc1') || createPlaceholderGame('afcWc1', 'AFC', 'wildcard');
  const afcWc2 = getGameBySlot('afcWc2') || createPlaceholderGame('afcWc2', 'AFC', 'wildcard');
  const afcWc3 = getGameBySlot('afcWc3') || createPlaceholderGame('afcWc3', 'AFC', 'wildcard');
  const afcDiv1 = getGameBySlot('afcDiv1') || createDivisionalGame('afcDiv1', 'AFC', true);
  const afcDiv2 = getGameBySlot('afcDiv2') || createDivisionalGame('afcDiv2', 'AFC', false);
  const afcConf = getGameBySlot('afcConf') || createPlaceholderGame('afcConf', 'AFC', 'conference');

  const nfcWc1 = getGameBySlot('nfcWc1') || createPlaceholderGame('nfcWc1', 'NFC', 'wildcard');
  const nfcWc2 = getGameBySlot('nfcWc2') || createPlaceholderGame('nfcWc2', 'NFC', 'wildcard');
  const nfcWc3 = getGameBySlot('nfcWc3') || createPlaceholderGame('nfcWc3', 'NFC', 'wildcard');
  const nfcDiv1 = getGameBySlot('nfcDiv1') || createDivisionalGame('nfcDiv1', 'NFC', true);
  const nfcDiv2 = getGameBySlot('nfcDiv2') || createDivisionalGame('nfcDiv2', 'NFC', false);
  const nfcConf = getGameBySlot('nfcConf') || createPlaceholderGame('nfcConf', 'NFC', 'conference');

  const superBowl = getGameBySlot('superBowl') || createPlaceholderGame('superBowl', null, 'superbowl');

  // Conference navigation state
  const [activeConference, setActiveConference] = useState<'AFC' | 'NFC'>('AFC');

  // AFC bracket view (flows left to right: WC → Div → Conf)
  const AFCBracketView = () => {
    const primaryColor = 'text-afc-primary';
    const bgColor = 'bg-afc-bg';

    return (
      <div>
        {/* Column headers */}
        <div className="grid grid-cols-3 gap-2 mb-2">
          <div className={`text-[11px] font-bold ${primaryColor} text-center uppercase tracking-tight`}>Wild Card</div>
          <div className={`text-[11px] font-bold ${primaryColor} text-center uppercase tracking-tight`}>Divisional</div>
          <div className={`text-[11px] font-bold ${primaryColor} text-center uppercase tracking-tight`}>Conf</div>
        </div>

        {/* Bracket content - 3 columns */}
        <div className="grid grid-cols-3 gap-2">
          {/* Wild Card column */}
          <div className="flex flex-col gap-2">
            <GameSlot game={afcWc1} participantPick={getPick('afcWc1')} eliminatedTeams={eliminatedTeams} compact />
            <GameSlot game={afcWc2} participantPick={getPick('afcWc2')} eliminatedTeams={eliminatedTeams} compact />
            <GameSlot game={afcWc3} participantPick={getPick('afcWc3')} eliminatedTeams={eliminatedTeams} compact />
            <div className={`${bgColor} rounded p-1.5 text-center`}>
              <div className="text-[9px] text-gray-500">BYE</div>
              <div className={`text-[10px] font-bold ${primaryColor}`}>#1 Denver</div>
            </div>
          </div>

          {/* Divisional column */}
          <div className="flex flex-col justify-around">
            <GameSlot game={afcDiv1} participantPick={getPick('afcDiv1')} expectedOpponent={getOpponent('afcDiv1')} eliminatedTeams={eliminatedTeams} compact />
            <GameSlot game={afcDiv2} participantPick={getPick('afcDiv2')} expectedOpponent={getOpponent('afcDiv2')} eliminatedTeams={eliminatedTeams} compact />
          </div>

          {/* Conference column */}
          <div className="flex flex-col justify-center">
            <GameSlot game={afcConf} participantPick={getPick('afcConf')} expectedOpponent={getOpponent('afcConf')} eliminatedTeams={eliminatedTeams} compact />
          </div>
        </div>
      </div>
    );
  };

  // NFC bracket view (flows right to left: Conf ← Div ← WC)
  const NFCBracketView = () => {
    const primaryColor = 'text-nfc-primary';
    const bgColor = 'bg-nfc-bg';

    return (
      <div>
        {/* Column headers - reversed order */}
        <div className="grid grid-cols-3 gap-2 mb-2">
          <div className={`text-[11px] font-bold ${primaryColor} text-center uppercase tracking-tight`}>Conf</div>
          <div className={`text-[11px] font-bold ${primaryColor} text-center uppercase tracking-tight`}>Divisional</div>
          <div className={`text-[11px] font-bold ${primaryColor} text-center uppercase tracking-tight`}>Wild Card</div>
        </div>

        {/* Bracket content - 3 columns (reversed) */}
        <div className="grid grid-cols-3 gap-2">
          {/* Conference column */}
          <div className="flex flex-col justify-center">
            <GameSlot game={nfcConf} participantPick={getPick('nfcConf')} expectedOpponent={getOpponent('nfcConf')} eliminatedTeams={eliminatedTeams} compact />
          </div>

          {/* Divisional column */}
          <div className="flex flex-col justify-around">
            <GameSlot game={nfcDiv1} participantPick={getPick('nfcDiv1')} expectedOpponent={getOpponent('nfcDiv1')} eliminatedTeams={eliminatedTeams} compact />
            <GameSlot game={nfcDiv2} participantPick={getPick('nfcDiv2')} expectedOpponent={getOpponent('nfcDiv2')} eliminatedTeams={eliminatedTeams} compact />
          </div>

          {/* Wild Card column */}
          <div className="flex flex-col gap-2">
            <GameSlot game={nfcWc1} participantPick={getPick('nfcWc1')} eliminatedTeams={eliminatedTeams} compact />
            <GameSlot game={nfcWc2} participantPick={getPick('nfcWc2')} eliminatedTeams={eliminatedTeams} compact />
            <GameSlot game={nfcWc3} participantPick={getPick('nfcWc3')} eliminatedTeams={eliminatedTeams} compact />
            <div className={`${bgColor} rounded p-1.5 text-center`}>
              <div className="text-[9px] text-gray-500">BYE</div>
              <div className={`text-[10px] font-bold ${primaryColor}`}>#1 Seattle</div>
            </div>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="space-y-3">
      {/* Conference Toggle */}
      <div className="flex bg-gray-100 rounded-xl p-1">
        <button
          onClick={(e) => {
            e.stopPropagation();
            setActiveConference('AFC');
          }}
          className={`flex-1 py-2 rounded-lg text-sm font-bold transition-all ${
            activeConference === 'AFC'
              ? 'bg-afc-primary text-white shadow-sm'
              : 'text-gray-600 hover:text-afc-primary active:bg-gray-200'
          }`}
        >
          AFC
        </button>
        <button
          onClick={(e) => {
            e.stopPropagation();
            setActiveConference('NFC');
          }}
          className={`flex-1 py-2 rounded-lg text-sm font-bold transition-all ${
            activeConference === 'NFC'
              ? 'bg-nfc-primary text-white shadow-sm'
              : 'text-gray-600 hover:text-nfc-primary active:bg-gray-200'
          }`}
        >
          NFC
        </button>
      </div>

      {/* Conference Bracket */}
      <div className="bg-white rounded-xl p-3 shadow-sm border border-gray-200">
        {activeConference === 'AFC' ? <AFCBracketView /> : <NFCBracketView />}
      </div>

      {/* Super Bowl - Always Visible */}
      <div className="bg-gradient-to-r from-yellow-50 to-yellow-100 rounded-xl p-3 border-2 border-yellow-400">
        <div className="text-center mb-2">
          <div className="text-sm font-bold text-superbowl-secondary">SUPER BOWL LX</div>
        </div>
        <GameSlot
          game={superBowl}
          participantPick={getPick('superBowl')}
          expectedOpponent={getOpponent('superBowl')}
          eliminatedTeams={eliminatedTeams}
          compact
        />
      </div>

      {/* Scoring Legend */}
      <div className="flex flex-wrap justify-center gap-x-3 gap-y-1 text-[10px] text-gray-500 px-2">
        <span>WC: <strong className="text-gray-700">1pt</strong></span>
        <span>Div: <strong className="text-gray-700">2pt</strong></span>
        <span>Conf: <strong className="text-gray-700">3pt</strong></span>
        <span>SB: <strong className="text-gray-700">5pt</strong></span>
        <span className="text-gray-900 font-bold">Max: 25</span>
      </div>
    </div>
  );
}
