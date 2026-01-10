import { useState } from 'react';
import type { Game, LeaderboardEntry } from '../../types';
import type { Participant } from '../../types';
import { Users, Calendar, TrendingUp } from 'lucide-react';
import GameCard from './GameCard';
import MiniLeaderboard from './MiniLeaderboard';
import BracketPreview from './BracketPreview';

interface HomePageProps {
  games: Game[];
  leaderboard: LeaderboardEntry[];
  participants: Participant[];
  onViewBracket: (participantId: string) => void;
}

export default function HomePage({
  games,
  leaderboard,
  participants,
  onViewBracket,
}: HomePageProps) {
  const [activeTab, setActiveTab] = useState<'games' | 'brackets'>('games');

  // Separate games by status
  const liveGames = games.filter(g => g.status === 'live');
  const upcomingGames = games.filter(g => g.status === 'scheduled');
  const completedGames = games.filter(g => g.status === 'final');

  // Group games by round
  const gamesByRound = {
    wildcard: games.filter(g => g.round === 'wildcard'),
    divisional: games.filter(g => g.round === 'divisional'),
    conference: games.filter(g => g.round === 'conference'),
    superbowl: games.filter(g => g.round === 'superbowl'),
  };

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Hero Header */}
      <div className="bg-gradient-to-r from-gray-900 via-gray-800 to-gray-900 text-white py-8">
        <div className="max-w-7xl mx-auto px-4">
          <h1 className="text-4xl font-bold text-center mb-2">
            🏈 NFL Playoff Bracket Challenge
          </h1>
          <p className="text-gray-400 text-center">2025-26 Season</p>

          {/* Quick Stats */}
          <div className="flex justify-center gap-8 mt-6">
            <div className="text-center">
              <div className="text-3xl font-bold text-yellow-400">{participants.length}</div>
              <div className="text-sm text-gray-400">Players</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-green-400">{completedGames.length}</div>
              <div className="text-sm text-gray-400">Games Played</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-blue-400">{upcomingGames.length}</div>
              <div className="text-sm text-gray-400">Games Left</div>
            </div>
            {liveGames.length > 0 && (
              <div className="text-center">
                <div className="text-3xl font-bold text-red-400 live-indicator">{liveGames.length}</div>
                <div className="text-sm text-gray-400">Live Now!</div>
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-6">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Content - Left 2 columns */}
          <div className="lg:col-span-2 space-y-6">
            {/* Live Games Alert */}
            {liveGames.length > 0 && (
              <div className="bg-red-50 border-2 border-red-400 rounded-xl p-4">
                <h2 className="text-lg font-bold text-red-700 flex items-center gap-2 mb-3">
                  <span className="live-indicator">🔴</span> Live Games
                </h2>
                <div className="space-y-3">
                  {liveGames.map(game => (
                    <GameCard key={game.id} game={game} participants={participants} showAllPicks />
                  ))}
                </div>
              </div>
            )}

            {/* Tab Navigation */}
            <div className="flex gap-2 border-b border-gray-200">
              <button
                onClick={() => setActiveTab('games')}
                className={`px-4 py-2 font-medium transition-colors ${
                  activeTab === 'games'
                    ? 'text-blue-600 border-b-2 border-blue-600'
                    : 'text-gray-500 hover:text-gray-700'
                }`}
              >
                <Calendar className="w-4 h-4 inline mr-2" />
                Games by Round
              </button>
              <button
                onClick={() => setActiveTab('brackets')}
                className={`px-4 py-2 font-medium transition-colors ${
                  activeTab === 'brackets'
                    ? 'text-blue-600 border-b-2 border-blue-600'
                    : 'text-gray-500 hover:text-gray-700'
                }`}
              >
                <Users className="w-4 h-4 inline mr-2" />
                All Brackets
              </button>
            </div>

            {/* Games Tab */}
            {activeTab === 'games' && (
              <div className="space-y-6">
                {/* Wild Card */}
                <div className="bg-white rounded-xl shadow-md overflow-hidden">
                  <div className="bg-gradient-to-r from-blue-600 to-red-600 text-white px-4 py-2">
                    <h3 className="font-bold">Wild Card Round</h3>
                  </div>
                  <div className="p-4 space-y-3">
                    {gamesByRound.wildcard.map(game => (
                      <GameCard key={game.id} game={game} participants={participants} showAllPicks />
                    ))}
                  </div>
                </div>

                {/* Divisional */}
                {gamesByRound.divisional.length > 0 && (
                  <div className="bg-white rounded-xl shadow-md overflow-hidden">
                    <div className="bg-gradient-to-r from-blue-700 to-red-700 text-white px-4 py-2">
                      <h3 className="font-bold">Divisional Round</h3>
                    </div>
                    <div className="p-4 space-y-3">
                      {gamesByRound.divisional.map(game => (
                        <GameCard key={game.id} game={game} participants={participants} showAllPicks />
                      ))}
                    </div>
                  </div>
                )}

                {/* Conference Championships */}
                {gamesByRound.conference.length > 0 && (
                  <div className="bg-white rounded-xl shadow-md overflow-hidden">
                    <div className="bg-gradient-to-r from-blue-800 to-red-800 text-white px-4 py-2">
                      <h3 className="font-bold">Conference Championships</h3>
                    </div>
                    <div className="p-4 space-y-3">
                      {gamesByRound.conference.map(game => (
                        <GameCard key={game.id} game={game} participants={participants} showAllPicks />
                      ))}
                    </div>
                  </div>
                )}

                {/* Super Bowl */}
                {gamesByRound.superbowl.length > 0 && (
                  <div className="bg-white rounded-xl shadow-md overflow-hidden border-4 border-yellow-400">
                    <div className="bg-gradient-to-r from-yellow-500 to-yellow-600 text-white px-4 py-2">
                      <h3 className="font-bold">🏆 Super Bowl LX</h3>
                    </div>
                    <div className="p-4">
                      {gamesByRound.superbowl.map(game => (
                        <GameCard key={game.id} game={game} participants={participants} showAllPicks />
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Brackets Tab */}
            {activeTab === 'brackets' && (
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                {leaderboard.map(entry => (
                  <BracketPreview
                    key={entry.participant.id}
                    entry={entry}
                    onClick={() => onViewBracket(entry.participant.id)}
                  />
                ))}
              </div>
            )}
          </div>

          {/* Sidebar - Right column */}
          <div className="space-y-6">
            {/* Leaderboard */}
            <MiniLeaderboard
              entries={leaderboard}
              onViewBracket={onViewBracket}
            />

            {/* Scoring Legend */}
            <div className="bg-white rounded-xl shadow-md p-4">
              <h3 className="font-bold text-gray-800 mb-3 flex items-center gap-2">
                <TrendingUp className="w-4 h-4" />
                Scoring
              </h3>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-600">Wild Card</span>
                  <span className="font-bold">1 pt</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Divisional</span>
                  <span className="font-bold">2 pts</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Conference</span>
                  <span className="font-bold">3 pts</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Super Bowl</span>
                  <span className="font-bold">5 pts</span>
                </div>
                <div className="border-t pt-2 flex justify-between font-bold">
                  <span>Maximum</span>
                  <span className="text-green-600">25 pts</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
