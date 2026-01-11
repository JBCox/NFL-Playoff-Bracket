import type { Game } from '../../types';
import type { Participant } from '../../types';
import { Check, X } from 'lucide-react';
import { mapESPNGameToSlot } from '../../services/scoreCalculator';

interface GameCardProps {
  game: Game;
  participants: Participant[];
  showAllPicks?: boolean;
}

export default function GameCard({ game, participants, showAllPicks = false }: GameCardProps) {
  const gameSlotId = mapESPNGameToSlot(game);
  const isLive = game.status === 'live';
  const isFinal = game.status === 'final';

  // Get all picks for this game
  const getPicksForTeam = (teamAbbr: string | undefined) => {
    if (!teamAbbr || !gameSlotId) return [];
    return participants.filter(p => {
      const pick = p.picks.find(pk => pk.gameId === gameSlotId);
      return pick?.teamAbbreviation === teamAbbr;
    });
  };

  const awayPickers = getPicksForTeam(game.awayTeam?.abbreviation);
  const homePickers = getPicksForTeam(game.homeTeam?.abbreviation);

  const isAwayWinner = isFinal && game.winner === game.awayTeam?.abbreviation;
  const isHomeWinner = isFinal && game.winner === game.homeTeam?.abbreviation;

  const getConferenceColor = () => {
    if (game.round === 'superbowl') return 'border-l-yellow-500';
    if (game.conference === 'AFC') return 'border-l-blue-600';
    return 'border-l-red-600';
  };

  // Format pickers list - show all first names
  const formatPickers = (pickers: Participant[], isWinner: boolean, isLoser: boolean) => {
    if (pickers.length === 0) {
      return <span className="text-gray-400 italic">None</span>;
    }

    const firstName = (name: string) => name.split(' ')[0];
    const baseClass = isWinner
      ? 'text-green-700'
      : isLoser
        ? 'text-red-600'
        : 'text-gray-700';

    return (
      <span className={baseClass}>
        {pickers.map(p => firstName(p.name)).join(', ')}
        {isWinner && <Check className="w-3 h-3 inline ml-1 flex-shrink-0" />}
        {isLoser && <X className="w-3 h-3 inline ml-1 flex-shrink-0" />}
      </span>
    );
  };

  return (
    <div className={`bg-gray-50 rounded-lg border-l-4 ${getConferenceColor()} overflow-hidden`}>
      {/* Live indicator */}
      {isLive && (
        <div className="bg-red-500 text-white text-xs font-bold px-2 py-0.5 sm:px-3 sm:py-1 flex items-center gap-1 sm:gap-2">
          <span className="live-indicator">●</span>
          LIVE - Q{game.period} {game.displayClock}
        </div>
      )}

      <div className="p-2 sm:p-3">
        {/* Matchup - Compact on mobile */}
        <div className="grid grid-cols-[1fr_auto_1fr] gap-2 sm:gap-3 items-center">
          {/* Away Team */}
          <div className={`text-center p-2 sm:p-3 rounded-lg transition-all ${
            isAwayWinner
              ? 'bg-green-100 border-2 border-green-500'
              : isFinal && !isAwayWinner
                ? 'bg-gray-100 border-2 border-gray-200 opacity-60'
                : 'bg-white border-2 border-gray-200'
          }`}>
            <div className="flex items-center justify-center gap-1 sm:gap-2">
              {isAwayWinner && <Check className="w-4 h-4 sm:w-5 sm:h-5 text-green-600 flex-shrink-0" />}
              {game.awayTeam?.logo && (
                <img
                  src={game.awayTeam.logo}
                  alt={game.awayTeam.name}
                  className="w-5 h-5 sm:w-6 sm:h-6 object-contain flex-shrink-0"
                />
              )}
              <span className="font-bold text-sm sm:text-lg">
                {game.awayTeam ? `#${game.awayTeam.seed} ${game.awayTeam.shortName}` : 'TBD'}
              </span>
            </div>
            {(isLive || isFinal) && game.awayScore !== null && (
              <div className={`text-xl sm:text-2xl font-bold mt-1 ${isAwayWinner ? 'text-green-700' : 'text-gray-700'}`}>
                {game.awayScore}
              </div>
            )}
          </div>

          {/* VS / Score */}
          <div className="text-center">
            <div className="text-gray-400 font-bold text-sm sm:text-lg">
              {isFinal ? 'FINAL' : isLive ? 'VS' : '@'}
            </div>
          </div>

          {/* Home Team */}
          <div className={`text-center p-2 sm:p-3 rounded-lg transition-all ${
            isHomeWinner
              ? 'bg-green-100 border-2 border-green-500'
              : isFinal && !isHomeWinner
                ? 'bg-gray-100 border-2 border-gray-200 opacity-60'
                : 'bg-white border-2 border-gray-200'
          }`}>
            <div className="flex items-center justify-center gap-1 sm:gap-2">
              {game.homeTeam?.logo && (
                <img
                  src={game.homeTeam.logo}
                  alt={game.homeTeam.name}
                  className="w-5 h-5 sm:w-6 sm:h-6 object-contain flex-shrink-0"
                />
              )}
              <span className="font-bold text-sm sm:text-lg">
                {game.homeTeam ? `#${game.homeTeam.seed} ${game.homeTeam.shortName}` : 'TBD'}
              </span>
              {isHomeWinner && <Check className="w-4 h-4 sm:w-5 sm:h-5 text-green-600 flex-shrink-0" />}
            </div>
            {(isLive || isFinal) && game.homeScore !== null && (
              <div className={`text-xl sm:text-2xl font-bold mt-1 ${isHomeWinner ? 'text-green-700' : 'text-gray-700'}`}>
                {game.homeScore}
              </div>
            )}
          </div>
        </div>

        {/* Picks Section - Compact */}
        {showAllPicks && (game.awayTeam || game.homeTeam) && (
          <div className="mt-2 pt-2 border-t border-gray-200">
            <div className="grid grid-cols-2 gap-2 text-[11px] sm:text-xs">
              {/* Away Team Pickers */}
              <div className={`rounded px-2 py-1.5 ${
                isAwayWinner ? 'bg-green-50' : isFinal ? 'bg-red-50' : 'bg-gray-100'
              }`}>
                <div className="font-semibold text-gray-500 mb-0.5">{game.awayTeam?.abbreviation} ({awayPickers.length})</div>
                <div className="leading-tight">{formatPickers(awayPickers, isAwayWinner, isFinal && !isAwayWinner)}</div>
              </div>

              {/* Home Team Pickers */}
              <div className={`rounded px-2 py-1.5 ${
                isHomeWinner ? 'bg-green-50' : isFinal ? 'bg-red-50' : 'bg-gray-100'
              }`}>
                <div className="font-semibold text-gray-500 mb-0.5">{game.homeTeam?.abbreviation} ({homePickers.length})</div>
                <div className="leading-tight">{formatPickers(homePickers, isHomeWinner, isFinal && !isHomeWinner)}</div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
