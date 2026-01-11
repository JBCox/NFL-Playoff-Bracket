import type { LeaderboardEntry } from '../../types';
import { Trophy, Clock } from 'lucide-react';

interface BracketPreviewProps {
  entry: LeaderboardEntry;
  onClick: () => void;
}

export default function BracketPreview({ entry, onClick }: BracketPreviewProps) {
  const { participant, score, rank, possibleRemaining } = entry;

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


  return (
    <button
      onClick={onClick}
      className="bg-white rounded-xl shadow-md hover:shadow-lg transition-all p-4 text-left w-full group hover:scale-[1.02] active:scale-[0.98] active:shadow-sm"
    >
      {/* Header */}
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          {getRankBadge()}
          <h4 className="font-bold text-gray-900">{participant.name}</h4>
        </div>
        <div className="text-2xl font-bold text-gray-900">
          {score.total}<span className="text-sm text-gray-400">/25</span>
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

      {/* View prompt - visible on mobile, hover-enhanced on desktop */}
      <div className="mt-3 text-center text-xs text-blue-600 opacity-60 sm:opacity-0 sm:group-hover:opacity-100 transition-opacity">
        Tap to view full bracket →
      </div>
    </button>
  );
}
