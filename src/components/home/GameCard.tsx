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

  return (
    <div className={`bg-gray-50 rounded-lg border-l-4 ${getConferenceColor()} overflow-hidden`}>
      {/* Live indicator */}
      {isLive && (
        <div className="bg-red-500 text-white text-xs font-bold px-3 py-1 flex items-center gap-2">
          <span className="live-indicator">●</span>
          LIVE - Q{game.period} {game.displayClock}
        </div>
      )}

      <div className="p-3">
        {/* Matchup */}
        <div className="grid grid-cols-[1fr_auto_1fr] gap-3 items-center">
          {/* Away Team */}
          <div className={`text-center p-3 rounded-lg transition-all ${
            isAwayWinner
              ? 'bg-green-100 border-2 border-green-500 shadow-md'
              : isFinal && !isAwayWinner
                ? 'bg-gray-100 border-2 border-gray-200 opacity-60'
                : 'bg-white border-2 border-gray-200'
          }`}>
            <div className="flex items-center justify-center gap-2 mb-1">
              {isAwayWinner && <Check className="w-5 h-5 text-green-600" />}
              <div
                className="w-4 h-4 rounded-full"
                style={{ backgroundColor: game.awayTeam?.primaryColor }}
              />
              <span className="font-bold text-lg">{game.awayTeam?.shortName || 'TBD'}</span>
            </div>
            {game.awayTeam && (
              <div className="text-xs text-gray-500">#{game.awayTeam.seed} seed</div>
            )}
            {(isLive || isFinal) && game.awayScore !== null && (
              <div className={`text-2xl font-bold mt-1 ${isAwayWinner ? 'text-green-700' : 'text-gray-700'}`}>
                {game.awayScore}
              </div>
            )}
          </div>

          {/* VS / Score */}
          <div className="text-center">
            <div className="text-gray-400 font-bold text-lg">
              {isFinal ? 'FINAL' : isLive ? 'VS' : '@'}
            </div>
          </div>

          {/* Home Team */}
          <div className={`text-center p-3 rounded-lg transition-all ${
            isHomeWinner
              ? 'bg-green-100 border-2 border-green-500 shadow-md'
              : isFinal && !isHomeWinner
                ? 'bg-gray-100 border-2 border-gray-200 opacity-60'
                : 'bg-white border-2 border-gray-200'
          }`}>
            <div className="flex items-center justify-center gap-2 mb-1">
              <div
                className="w-4 h-4 rounded-full"
                style={{ backgroundColor: game.homeTeam?.primaryColor }}
              />
              <span className="font-bold text-lg">{game.homeTeam?.shortName || 'TBD'}</span>
              {isHomeWinner && <Check className="w-5 h-5 text-green-600" />}
            </div>
            {game.homeTeam && (
              <div className="text-xs text-gray-500">#{game.homeTeam.seed} seed</div>
            )}
            {(isLive || isFinal) && game.homeScore !== null && (
              <div className={`text-2xl font-bold mt-1 ${isHomeWinner ? 'text-green-700' : 'text-gray-700'}`}>
                {game.homeScore}
              </div>
            )}
          </div>
        </div>

        {/* Picks Section */}
        {showAllPicks && (game.awayTeam || game.homeTeam) && (
          <div className="mt-3 pt-3 border-t border-gray-200">
            <div className="text-xs font-bold text-gray-500 mb-2 text-center">WHO PICKED WHO</div>
            <div className="grid grid-cols-2 gap-3">
              {/* Away Team Pickers */}
              <div className={`rounded-lg p-2 ${
                isAwayWinner ? 'bg-green-50' : isFinal ? 'bg-red-50' : 'bg-gray-50'
              }`}>
                <div className="text-xs font-medium text-gray-600 mb-1 text-center">
                  {game.awayTeam?.abbreviation} ({awayPickers.length})
                </div>
                <div className="flex flex-wrap gap-1 justify-center">
                  {awayPickers.length === 0 ? (
                    <span className="text-xs text-gray-400 italic">No picks</span>
                  ) : (
                    awayPickers.map(p => (
                      <span
                        key={p.id}
                        className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium ${
                          isAwayWinner
                            ? 'bg-green-200 text-green-800'
                            : isFinal
                              ? 'bg-red-200 text-red-800'
                              : 'bg-blue-100 text-blue-800'
                        }`}
                      >
                        {p.name}
                        {isAwayWinner && <Check className="w-3 h-3" />}
                        {isFinal && !isAwayWinner && <X className="w-3 h-3" />}
                      </span>
                    ))
                  )}
                </div>
              </div>

              {/* Home Team Pickers */}
              <div className={`rounded-lg p-2 ${
                isHomeWinner ? 'bg-green-50' : isFinal ? 'bg-red-50' : 'bg-gray-50'
              }`}>
                <div className="text-xs font-medium text-gray-600 mb-1 text-center">
                  {game.homeTeam?.abbreviation} ({homePickers.length})
                </div>
                <div className="flex flex-wrap gap-1 justify-center">
                  {homePickers.length === 0 ? (
                    <span className="text-xs text-gray-400 italic">No picks</span>
                  ) : (
                    homePickers.map(p => (
                      <span
                        key={p.id}
                        className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium ${
                          isHomeWinner
                            ? 'bg-green-200 text-green-800'
                            : isFinal
                              ? 'bg-red-200 text-red-800'
                              : 'bg-blue-100 text-blue-800'
                        }`}
                      >
                        {p.name}
                        {isHomeWinner && <Check className="w-3 h-3" />}
                        {isFinal && !isHomeWinner && <X className="w-3 h-3" />}
                      </span>
                    ))
                  )}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
