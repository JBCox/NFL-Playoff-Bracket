import { useMemo, useState } from 'react';
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

  // Mobile conference navigation
  const [mobileConference, setMobileConference] = useState<'AFC' | 'NFC'>('AFC');

  // Mobile bracket view for a single conference
  const MobileBracketView = ({ conference }: { conference: 'AFC' | 'NFC' }) => {
    const isAFC = conference === 'AFC';
    const primaryColor = isAFC ? 'text-afc-primary' : 'text-nfc-primary';
    const bgColor = isAFC ? 'bg-afc-bg' : 'bg-nfc-bg';

    // Get games for this conference
    const wc1 = isAFC ? afcWc1 : nfcWc1;
    const wc2 = isAFC ? afcWc2 : nfcWc2;
    const wc3 = isAFC ? afcWc3 : nfcWc3;
    const div1 = isAFC ? afcDiv1 : nfcDiv1;
    const div2 = isAFC ? afcDiv2 : nfcDiv2;
    const conf = isAFC ? afcConf : nfcConf;

    const wcPrefix = isAFC ? 'afcWc' : 'nfcWc';
    const divPrefix = isAFC ? 'afcDiv' : 'nfcDiv';
    const confSlot = isAFC ? 'afcConf' : 'nfcConf';

    const byeTeam = isAFC ? 'Denver' : 'Seattle';

    return (
      <div className="grid grid-cols-3 gap-2 items-center">
        {/* Column headers */}
        <div className={`text-[11px] font-bold ${primaryColor} text-center uppercase tracking-tight`}>Wild Card</div>
        <div className={`text-[11px] font-bold ${primaryColor} text-center uppercase tracking-tight`}>Divisional</div>
        <div className={`text-[11px] font-bold ${primaryColor} text-center uppercase tracking-tight`}>Conf</div>

        {/* Row 1: WC Game 1 → Div Game 1 (top half) */}
        <GameSlot game={wc1} participantPick={getPick(`${wcPrefix}1`)} eliminatedTeams={eliminatedTeams} compact />
        <div className="row-span-2 flex items-center">
          <GameSlot game={div1} participantPick={getPick(`${divPrefix}1`)} expectedOpponent={getOpponent(`${divPrefix}1`)} eliminatedTeams={eliminatedTeams} compact />
        </div>
        <div className="row-span-4 flex items-center">
          <GameSlot game={conf} participantPick={getPick(confSlot)} expectedOpponent={getOpponent(confSlot)} eliminatedTeams={eliminatedTeams} compact />
        </div>

        {/* Row 2: WC Game 2 → Div Game 1 (bottom half) */}
        <GameSlot game={wc2} participantPick={getPick(`${wcPrefix}2`)} eliminatedTeams={eliminatedTeams} compact />

        {/* Row 3: WC Game 3 → Div Game 2 (top half) */}
        <GameSlot game={wc3} participantPick={getPick(`${wcPrefix}3`)} eliminatedTeams={eliminatedTeams} compact />
        <div className="row-span-2 flex items-center">
          <GameSlot game={div2} participantPick={getPick(`${divPrefix}2`)} expectedOpponent={getOpponent(`${divPrefix}2`)} eliminatedTeams={eliminatedTeams} compact />
        </div>

        {/* Row 4: Bye → Div Game 2 (bottom half) */}
        <div className={`${bgColor} rounded p-1.5 text-center`}>
          <div className="text-[9px] text-gray-500">BYE</div>
          <div className={`text-[10px] font-bold ${primaryColor}`}>#1 {byeTeam}</div>
        </div>
      </div>
    );
  };

  return (
    <div className="w-full h-full p-4 landscape-bracket overflow-auto">
      {/* Mobile Layout - shown on small screens */}
      <div className="lg:hidden space-y-3">
        {/* Conference Toggle */}
        <div className="flex bg-gray-100 rounded-xl p-1">
          <button
            onClick={() => setMobileConference('AFC')}
            className={`flex-1 py-2.5 rounded-lg text-sm font-bold transition-all ${
              mobileConference === 'AFC'
                ? 'bg-afc-primary text-white shadow-sm'
                : 'text-gray-600 hover:text-afc-primary active:bg-gray-200'
            }`}
          >
            AFC
          </button>
          <button
            onClick={() => setMobileConference('NFC')}
            className={`flex-1 py-2.5 rounded-lg text-sm font-bold transition-all ${
              mobileConference === 'NFC'
                ? 'bg-nfc-primary text-white shadow-sm'
                : 'text-gray-600 hover:text-nfc-primary active:bg-gray-200'
            }`}
          >
            NFC
          </button>
        </div>

        {/* Conference Bracket */}
        <div className="bg-white rounded-xl p-3 shadow-sm">
          <MobileBracketView conference={mobileConference} />
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

        {/* Mobile Scoring Legend - hidden in landscape */}
        <div className="flex flex-wrap justify-center gap-x-3 gap-y-1 text-[10px] text-gray-500 px-2 landscape-hide">
          <span>WC: <strong className="text-gray-700">1pt</strong></span>
          <span>Div: <strong className="text-gray-700">2pt</strong></span>
          <span>Conf: <strong className="text-gray-700">3pt</strong></span>
          <span>SB: <strong className="text-gray-700">5pt</strong></span>
          <span className="text-gray-900 font-bold">Max: 25</span>
        </div>
      </div>

      {/* Desktop Layout - hidden on small screens, shown on lg+ */}
      <div className="hidden lg:block">
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

        {/* Desktop Scoring Legend */}
        <div className="mt-4 flex justify-center gap-6 text-xs text-gray-600">
          <span>Wild Card: <strong>1 pt</strong></span>
          <span>Divisional: <strong>2 pts</strong></span>
          <span>Conference: <strong>3 pts</strong></span>
          <span>Super Bowl: <strong>5 pts</strong></span>
          <span className="text-gray-900 font-bold">Max: 25 pts</span>
        </div>
      </div>
    </div>
  );
}
