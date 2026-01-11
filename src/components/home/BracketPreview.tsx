import { useState, useEffect } from 'react';
import type { LeaderboardEntry, Game } from '../../types';
import type { WinProbabilities } from '../../services/probabilityCalculator';
import { Trophy, Clock, ChevronDown, ChevronUp } from 'lucide-react';
import InlineBracket from '../bracket/InlineBracket';
import WinProbabilityPill from '../ui/WinProbabilityPill';

interface BracketPreviewProps {
  entry: LeaderboardEntry;
  games: Game[];
  onClick: () => void;
  winProbability?: WinProbabilities;
  isEliminated?: boolean;
}

export default function BracketPreview({
  entry,
  games,
  onClick,
  winProbability,
  isEliminated = false
}: BracketPreviewProps) {
  const { participant, score, rank, possibleRemaining } = entry;
  const [isExpanded, setIsExpanded] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

  // Detect mobile screen size
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 640); // sm breakpoint
    };

    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  const getRankBadge = () => {
    switch (rank) {
      case 1:
        return <Trophy className="w-5 h-5 text-yellow-500" />;
      case 2:
        return <Trophy className="w-5 h-5 text-gray-400" />;
      case 3:
        return <Trophy className="w-5 h-5 text-orange-500" />;
      default:
        return <span className="text-sm font-bold text-gray-500">#{rank}</span>;
    }
  };

  const handleClick = () => {
    if (isMobile) {
      setIsExpanded(!isExpanded);
    } else {
      onClick();
    }
  };

  return (
    <div className={`bg-white rounded-xl shadow-md transition-all ${isExpanded ? 'ring-2 ring-blue-400' : 'hover:shadow-lg'}`}>
      <button
        onClick={handleClick}
        className={`p-4 text-left w-full group ${!isExpanded ? 'hover:scale-[1.02] active:scale-[0.98] active:shadow-sm' : ''} transition-all`}
      >
        {/* Header */}
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            {getRankBadge()}
            <h4 className="font-bold text-gray-900">{participant.name}</h4>
          </div>
          <div className="flex items-center gap-2">
            <div className="text-2xl font-bold text-gray-900">
              {score.total}<span className="text-sm text-gray-400">/25</span>
            </div>
            {/* Win Probability Pill */}
            {winProbability !== undefined && (
              <WinProbabilityPill
                probability={winProbability.vegas}
                isEliminated={isEliminated}
                size="sm"
              />
            )}
            {/* Mobile expand/collapse indicator */}
            <div className="sm:hidden text-gray-400">
              {isExpanded ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
            </div>
          </div>
        </div>

        {/* Score Breakdown Bar */}
        <div className="h-2 bg-gray-200 rounded-full overflow-hidden mb-3">
          <div
            className="h-full bg-gradient-to-r from-green-400 to-green-600 transition-all"
            style={{ width: `${(score.total / 25) * 100}%` }}
          />
        </div>

        {/* Stats & Round Breakdown */}
        <div className="flex items-center justify-between text-xs">
          <div className="flex items-center gap-3 text-gray-500">
            <span><span className="text-gray-400">WC</span> <span className="font-bold text-gray-700">{score.wildCard}/6</span></span>
            <span><span className="text-gray-400">Div</span> <span className="font-bold text-gray-700">{score.divisional}/8</span></span>
            <span><span className="text-gray-400">Conf</span> <span className="font-bold text-gray-700">{score.conference}/6</span></span>
            <span><span className="text-gray-400">SB</span> <span className="font-bold text-gray-700">{score.superBowl}/5</span></span>
          </div>
          <div className="flex items-center gap-1 text-gray-500">
            <Clock className="w-3 h-3" />
            <span>{possibleRemaining} pts possible</span>
          </div>
        </div>

        {/* View prompt - different for mobile vs desktop */}
        <div className="mt-3 text-center text-xs text-blue-600 opacity-60 sm:opacity-0 sm:group-hover:opacity-100 transition-opacity">
          <span className="sm:hidden">{isExpanded ? 'Tap to collapse' : 'Tap to view bracket'}</span>
          <span className="hidden sm:inline">Tap to view full bracket →</span>
        </div>
      </button>

      {/* Expanded Bracket (Mobile Only) */}
      {isExpanded && isMobile && (
        <div className="px-4 pb-4 border-t border-gray-100 pt-4">
          {/* Win Probability Breakdown */}
          {winProbability !== undefined && (
            <div className="mb-4 p-3 bg-gray-50 rounded-lg">
              <div className="text-xs font-semibold text-gray-600 mb-2">Win Probability</div>
              <div className="grid grid-cols-2 gap-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-500">Vegas lines:</span>
                  <span className="font-bold text-gray-900">
                    {isEliminated ? 'Out' : `${Math.round(winProbability.vegas * 100)}%`}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">If all 50/50:</span>
                  <span className="font-bold text-gray-900">
                    {isEliminated ? 'Out' : `${Math.round(winProbability.fiftyFifty * 100)}%`}
                  </span>
                </div>
              </div>
            </div>
          )}
          <InlineBracket games={games} participantId={participant.id} />
        </div>
      )}
    </div>
  );
}
