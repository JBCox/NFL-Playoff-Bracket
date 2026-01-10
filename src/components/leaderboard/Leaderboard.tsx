import type { LeaderboardEntry } from '../../types';
import { Trophy } from 'lucide-react';

interface LeaderboardProps {
  entries: LeaderboardEntry[];
  selectedParticipantId: string;
  onSelectParticipant: (id: string) => void;
}

export default function Leaderboard({
  entries,
  selectedParticipantId,
  onSelectParticipant,
}: LeaderboardProps) {
  const getRankIcon = (rank: number) => {
    if (rank === 1) return <Trophy className="w-4 h-4 text-yellow-500" />;
    if (rank === 2) return <Trophy className="w-4 h-4 text-gray-400" />;
    if (rank === 3) return <Trophy className="w-4 h-4 text-amber-600" />;
    return <span className="w-4 text-center text-gray-500">{rank}</span>;
  };

  return (
    <div className="bg-white rounded-lg shadow-md overflow-hidden">
      <div className="bg-gray-800 text-white px-4 py-3">
        <h2 className="text-lg font-bold">Leaderboard</h2>
      </div>

      <div className="divide-y divide-gray-100">
        {entries.map((entry) => (
          <button
            key={entry.participant.id}
            onClick={() => onSelectParticipant(entry.participant.id)}
            className={`
              w-full px-4 py-3 flex items-center gap-3 text-left transition-colors
              hover:bg-gray-50
              ${selectedParticipantId === entry.participant.id ? 'bg-blue-50 border-l-4 border-blue-500' : ''}
            `}
          >
            {/* Rank */}
            <div className="w-6 flex justify-center">
              {getRankIcon(entry.rank)}
            </div>

            {/* Name */}
            <div className="flex-1">
              <div className="font-medium text-gray-900">{entry.participant.name}</div>
              <div className="text-xs text-gray-500">
                {entry.correctPicks} correct • {entry.possibleRemaining} pts possible
              </div>
            </div>

            {/* Score breakdown */}
            <div className="text-right">
              <div className="text-lg font-bold text-gray-900">{entry.score.total}</div>
              <div className="text-xs text-gray-500">
                {entry.score.wildCard}/{entry.score.divisional}/{entry.score.conference}/{entry.score.superBowl}
              </div>
            </div>
          </button>
        ))}
      </div>

      {/* Legend */}
      <div className="bg-gray-50 px-4 py-2 text-xs text-gray-500 border-t">
        Score format: WC / Div / Conf / SB
      </div>
    </div>
  );
}
