import type { Participant, ScoreBreakdown } from '../../types';
import { ChevronDown, RefreshCw } from 'lucide-react';
import { useState } from 'react';

interface HeaderProps {
  participants: Participant[];
  selectedParticipant: Participant;
  onSelectParticipant: (id: string) => void;
  score: ScoreBreakdown;
  onRefresh: () => void;
  isLoading: boolean;
  lastUpdated: string | null;
}

export default function Header({
  participants,
  selectedParticipant,
  onSelectParticipant,
  score,
  onRefresh,
  isLoading,
  lastUpdated,
}: HeaderProps) {
  const [dropdownOpen, setDropdownOpen] = useState(false);

  return (
    <header className="bg-gray-900 text-white shadow-lg">
      <div className="max-w-7xl mx-auto px-4 py-3">
        <div className="flex items-center justify-between">
          {/* Logo / Title */}
          <div className="flex items-center gap-3">
            <div className="text-2xl font-bold">
              <span className="text-afc-light">🏈</span> NFL Playoff Bracket
            </div>
            <div className="text-sm text-gray-400">2025-26</div>
          </div>

          {/* Participant Selector */}
          <div className="relative">
            <button
              onClick={() => setDropdownOpen(!dropdownOpen)}
              className="flex items-center gap-2 bg-gray-800 hover:bg-gray-700 px-4 py-2 rounded-lg transition-colors"
            >
              <span className="text-gray-400 text-sm">Viewing:</span>
              <span className="font-medium">{selectedParticipant.name}</span>
              <ChevronDown className={`w-4 h-4 transition-transform ${dropdownOpen ? 'rotate-180' : ''}`} />
            </button>

            {dropdownOpen && (
              <>
                <div
                  className="fixed inset-0 z-10"
                  onClick={() => setDropdownOpen(false)}
                />
                <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-xl z-20 py-1 text-gray-900">
                  {participants.map((p) => (
                    <button
                      key={p.id}
                      onClick={() => {
                        onSelectParticipant(p.id);
                        setDropdownOpen(false);
                      }}
                      className={`
                        w-full text-left px-4 py-2 hover:bg-gray-100 transition-colors
                        ${p.id === selectedParticipant.id ? 'bg-blue-50 text-blue-700 font-medium' : ''}
                      `}
                    >
                      {p.name}
                    </button>
                  ))}
                </div>
              </>
            )}
          </div>

          {/* Score Display */}
          <div className="flex items-center gap-4">
            <div className="text-right">
              <div className="text-sm text-gray-400">Score</div>
              <div className="text-2xl font-bold">{score.total}<span className="text-gray-500 text-sm">/25</span></div>
            </div>

            {/* Refresh Button */}
            <button
              onClick={onRefresh}
              disabled={isLoading}
              className="p-2 bg-gray-800 hover:bg-gray-700 rounded-lg transition-colors disabled:opacity-50"
              title="Refresh scores"
            >
              <RefreshCw className={`w-5 h-5 ${isLoading ? 'animate-spin' : ''}`} />
            </button>
          </div>
        </div>

        {/* Last updated */}
        {lastUpdated && (
          <div className="text-xs text-gray-500 mt-1 text-right">
            Last updated: {new Date(lastUpdated).toLocaleTimeString()}
          </div>
        )}
      </div>
    </header>
  );
}
