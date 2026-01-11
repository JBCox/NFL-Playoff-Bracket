import type { LeaderboardEntry } from '../../types';
import { Trophy, ChevronRight } from 'lucide-react';

interface MiniLeaderboardProps {
  entries: LeaderboardEntry[];
  onViewBracket: (participantId: string) => void;
}

export default function MiniLeaderboard({ entries, onViewBracket }: MiniLeaderboardProps) {
  const getRankStyle = (rank: number) => {
    switch (rank) {
      case 1:
        return 'bg-yellow-100 text-yellow-800 border-yellow-300';
      case 2:
        return 'bg-gray-100 text-gray-700 border-gray-300';
      case 3:
        return 'bg-orange-100 text-orange-800 border-orange-300';
      default:
        return 'bg-white text-gray-600 border-gray-200';
    }
  };

  const getRankIcon = (rank: number) => {
    switch (rank) {
      case 1:
        return <Trophy className="w-5 h-5 text-yellow-500" />;
      case 2:
        return <Trophy className="w-5 h-5 text-gray-400" />;
      case 3:
        return <Trophy className="w-5 h-5 text-orange-500" />;
      default:
        return <span className="w-5 text-center font-bold">{rank}</span>;
    }
  };

  return (
    <div className="bg-white rounded-xl shadow-md overflow-hidden">
      <div className="bg-gradient-to-r from-gray-800 to-gray-900 text-white px-4 py-3">
        <h3 className="font-bold flex items-center gap-2">
          <Trophy className="w-5 h-5 text-yellow-400" />
          Leaderboard
        </h3>
      </div>

      <div className="divide-y divide-gray-100">
        {entries.map((entry) => (
          <button
            key={entry.participant.id}
            onClick={() => onViewBracket(entry.participant.id)}
            className={`w-full px-4 py-3 flex items-center gap-3 hover:bg-gray-50 active:bg-gray-100 transition-colors text-left border-l-4 ${getRankStyle(entry.rank)}`}
          >
            {/* Rank */}
            <div className="w-6 flex justify-center">
              {getRankIcon(entry.rank)}
            </div>

            {/* Name & Stats */}
            <div className="flex-1 min-w-0">
              <div className="font-semibold text-gray-900 truncate">
                {entry.participant.name}
              </div>
              <div className="text-xs text-gray-500">
                {entry.possibleRemaining} pts still possible
              </div>
            </div>

            {/* Score */}
            <div className="text-right">
              <div className="text-xl font-bold text-gray-900">{entry.score.total}</div>
              <div className="text-xs text-gray-400">/ 25</div>
            </div>

            <ChevronRight className="w-4 h-4 text-gray-400" />
          </button>
        ))}
      </div>
    </div>
  );
}
