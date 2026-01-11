import type { Team, PickStatus } from '../../types';
import { Check, X, Star } from 'lucide-react';
import { getTeamByAbbreviation } from '../../data/teams';

interface TeamBoxProps {
  team: Team | null;
  score: number | null;
  isPicked: boolean;
  isWinner: boolean;
  pickStatus: PickStatus;
  showSeed?: boolean;
  pickedTeamAbbr?: string; // For showing team when actual team is unknown
  isExpectedOpponent?: boolean; // True if this is the expected opponent, not the pick
  compact?: boolean; // Smaller variant for mobile bracket view
}

export default function TeamBox({
  team,
  score,
  isPicked,
  isWinner,
  pickStatus,
  showSeed = true,
  pickedTeamAbbr,
  isExpectedOpponent = false,
  compact = false,
}: TeamBoxProps) {
  // If team is null but we have a pickedTeamAbbr, look up that team
  const displayTeam = team || (pickedTeamAbbr ? getTeamByAbbreviation(pickedTeamAbbr) : null);
  // Only treat as "future pick" if it's not an expected opponent
  const isFuturePick = !team && !!pickedTeamAbbr && !!displayTeam && !isExpectedOpponent;

  if (!displayTeam) {
    return (
      <div className={`${compact ? 'h-6' : 'h-9'} bg-gray-100 rounded flex items-center justify-center text-gray-400 text-xs`}>
        TBD
      </div>
    );
  }

  // Determine if this is the picked team (either directly or via future pick)
  const isThisPicked = isPicked || isFuturePick;

  const getBackgroundClass = () => {
    if (pickStatus === 'correct') return 'bg-green-50 border-l-green-500';
    if (pickStatus === 'incorrect') return 'bg-red-50 border-l-red-500';
    if (pickStatus === 'eliminated') return 'bg-gray-100 border-l-gray-400';
    if (isThisPicked && pickStatus === 'pending') {
      // Use team color tint for pending picks
      return 'border-l-4';
    }
    return 'bg-gray-50 border-l-gray-300';
  };

  const getTextClass = () => {
    if (pickStatus === 'incorrect') return 'text-gray-500 line-through';
    if (pickStatus === 'eliminated') return 'text-gray-400 line-through';
    if (isWinner) return 'font-bold text-gray-900';
    if (isThisPicked) return 'font-semibold text-gray-900';
    return 'text-gray-700';
  };

  // Get team color for picked teams background tint
  const getTeamColorStyle = () => {
    if (isThisPicked && pickStatus === 'pending') {
      // Create a tinted background using team's primary color
      return {
        backgroundColor: `${displayTeam.primaryColor}15`, // 15 = ~8% opacity in hex
        borderLeftColor: displayTeam.primaryColor,
      };
    }
    return {};
  };

  return (
    <div
      className={`
        flex items-center rounded transition-colors
        ${compact ? 'gap-1 px-1.5 py-1 border-l-2' : 'gap-2 px-2 py-1.5 border-l-4'}
        ${getBackgroundClass()}
        ${isFuturePick ? 'border-dashed' : ''}
      `}
      style={getTeamColorStyle()}
    >
      {/* Team logo */}
      <img
        src={displayTeam.logo}
        alt={displayTeam.name}
        className={`${compact ? 'w-4 h-4' : 'w-5 h-5'} object-contain flex-shrink-0`}
      />

      {/* Seed - hidden in compact mode */}
      {showSeed && !compact && (
        <span className="text-xs text-gray-500 font-medium w-4 flex-shrink-0">
          {displayTeam.seed}
        </span>
      )}

      {/* Pick star indicator - shown for all picks */}
      {isThisPicked && pickStatus !== 'correct' && pickStatus !== 'incorrect' && (
        <Star
          className={`${compact ? 'w-2.5 h-2.5' : 'w-3.5 h-3.5'} flex-shrink-0`}
          style={{ color: displayTeam.primaryColor }}
          fill={displayTeam.primaryColor}
        />
      )}

      {/* Team name */}
      <span className={`flex-1 truncate ${compact ? 'text-xs' : 'text-sm'} ${getTextClass()}`}>
        {compact ? displayTeam.abbreviation : displayTeam.shortName}
      </span>

      {/* Score (if game in progress or final) */}
      {score !== null && (
        <span className={`${compact ? 'text-xs' : 'text-sm'} font-mono font-semibold ${isWinner ? 'text-gray-900' : 'text-gray-600'}`}>
          {score}
        </span>
      )}

      {/* Result indicators */}
      {isThisPicked && pickStatus === 'correct' && (
        <Check className={`${compact ? 'w-3 h-3' : 'w-4 h-4'} text-green-600 flex-shrink-0`} />
      )}
      {isThisPicked && pickStatus === 'incorrect' && (
        <X className={`${compact ? 'w-3 h-3' : 'w-4 h-4'} text-red-500 flex-shrink-0`} />
      )}
      {isThisPicked && pickStatus === 'eliminated' && (
        <X className={`${compact ? 'w-3 h-3' : 'w-4 h-4'} text-gray-400 flex-shrink-0`} />
      )}
    </div>
  );
}
