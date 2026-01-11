import { useState, useEffect, useCallback } from 'react';
import type { Game } from './types';
import { participants, getParticipantById } from './data/participants';
import { fetchAllPlayoffGames, getPollingInterval } from './services/espnClient';
import { generateLeaderboard, calculateParticipantScore, getGameResults } from './services/scoreCalculator';
import { useOddsData } from './hooks/useOddsData';
import { useWinProbabilities } from './hooks/useWinProbabilities';
import HomePage from './components/home/HomePage';
import Bracket from './components/bracket/Bracket';
import { ArrowLeft, RefreshCw } from 'lucide-react';

type ViewMode = 'home' | 'bracket';

function App() {
  const [viewMode, setViewMode] = useState<ViewMode>('home');
  const [selectedParticipantId, setSelectedParticipantId] = useState<string | null>(null);
  const [games, setGames] = useState<Game[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [lastUpdated, setLastUpdated] = useState<string | null>(null);

  const selectedParticipant = selectedParticipantId ? getParticipantById(selectedParticipantId) : null;
  const leaderboard = generateLeaderboard(participants, games);
  const results = getGameResults(games);
  const score = selectedParticipant ? calculateParticipantScore(selectedParticipant, results) : null;

  // Fetch odds and calculate win probabilities
  const { oddsMap } = useOddsData();
  const { probabilities: winProbabilities, isEliminated: eliminatedParticipants } = useWinProbabilities(
    games,
    participants,
    oddsMap
  );

  // Fetch games from ESPN
  const fetchGames = useCallback(async () => {
    try {
      setIsLoading(true);
      const fetchedGames = await fetchAllPlayoffGames();
      setGames(fetchedGames);
      setLastUpdated(new Date().toISOString());
    } catch (error) {
      console.error('Failed to fetch games:', error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Initial fetch
  useEffect(() => {
    fetchGames();
  }, [fetchGames]);

  // Polling for live updates
  useEffect(() => {
    const interval = getPollingInterval(games);
    const timer = setInterval(fetchGames, interval);
    return () => clearInterval(timer);
  }, [games, fetchGames]);

  // Handle viewing a specific bracket
  const handleViewBracket = (participantId: string) => {
    setSelectedParticipantId(participantId);
    setViewMode('bracket');
  };

  // Handle going back to home
  const handleGoHome = () => {
    setViewMode('home');
    setSelectedParticipantId(null);
  };

  // Home Page View
  if (viewMode === 'home') {
    return (
      <div className="min-h-screen bg-gray-100">
        {/* Refresh button floating */}
        <button
          onClick={fetchGames}
          disabled={isLoading}
          className="fixed top-4 right-4 z-50 bg-white shadow-lg rounded-full p-3 hover:bg-gray-100 transition-colors disabled:opacity-50"
          title="Refresh scores"
        >
          <RefreshCw className={`w-5 h-5 text-gray-600 ${isLoading ? 'animate-spin' : ''}`} />
        </button>

        <HomePage
          games={games}
          leaderboard={leaderboard}
          participants={participants}
          onViewBracket={handleViewBracket}
          winProbabilities={winProbabilities}
          eliminatedParticipants={eliminatedParticipants}
        />

        {/* Footer */}
        <footer className="bg-gray-800 text-gray-400 text-center py-3 text-sm safe-area-bottom">
          <div>Data from ESPN • Auto-updates every {getPollingInterval(games) / 1000}s</div>
          {lastUpdated && (
            <div className="text-xs mt-1">Last updated: {new Date(lastUpdated).toLocaleTimeString()}</div>
          )}
        </footer>
      </div>
    );
  }

  // Individual Bracket View
  return (
    <div className="min-h-screen bg-gray-100 flex flex-col">
      {/* Header */}
      <header className="bg-gray-900 text-white shadow-lg">
        <div className="max-w-7xl mx-auto px-3 sm:px-4 py-2 sm:py-3 landscape-compact-header flex items-center justify-between gap-2">
          {/* Back Button - icon only on mobile */}
          <button
            onClick={handleGoHome}
            className="flex items-center gap-2 bg-gray-800 hover:bg-gray-700 p-2 sm:px-4 sm:py-2 rounded-lg transition-colors flex-shrink-0"
            title="Back to Home"
          >
            <ArrowLeft className="w-5 h-5 sm:w-4 sm:h-4" />
            <span className="hidden sm:inline">Back to Home</span>
          </button>

          {/* Title - compact on mobile */}
          <div className="text-center min-w-0 flex-1">
            <h1 className="text-base sm:text-xl font-bold truncate">{selectedParticipant?.name}'s Bracket</h1>
            {score && (
              <p className="text-xs sm:text-sm text-gray-400">
                {score.total} pts • #{leaderboard.find(e => e.participant.id === selectedParticipantId)?.rank || '-'}
              </p>
            )}
          </div>

          {/* Refresh - icon only on mobile */}
          <button
            onClick={fetchGames}
            disabled={isLoading}
            className="flex items-center gap-2 bg-gray-800 hover:bg-gray-700 p-2 sm:px-4 sm:py-2 rounded-lg transition-colors disabled:opacity-50 flex-shrink-0"
            title="Refresh"
          >
            <RefreshCw className={`w-5 h-5 sm:w-4 sm:h-4 ${isLoading ? 'animate-spin' : ''}`} />
            <span className="hidden sm:inline">Refresh</span>
          </button>
        </div>
      </header>

      {/* Bracket */}
      <main className="flex-1 overflow-hidden">
        <div className="h-full p-4">
          <div className="bg-white rounded-xl shadow-lg h-full overflow-hidden">
            <div className="h-full">
              {selectedParticipantId && (
                <Bracket games={games} participantId={selectedParticipantId} />
              )}
            </div>
          </div>
        </div>
      </main>

      {/* Participant Switcher */}
      <div className="bg-white border-t shadow-lg">
        <div className="max-w-7xl mx-auto px-3 sm:px-4 py-2 sm:py-3">
          <div className="relative">
            <div className="flex items-center gap-2 overflow-x-auto scrollbar-hide pb-1 pr-6 sm:pr-0">
              <span className="text-xs sm:text-sm text-gray-500 flex-shrink-0 hidden sm:block">Quick switch:</span>
              {leaderboard.map(entry => (
                <button
                  key={entry.participant.id}
                  onClick={() => setSelectedParticipantId(entry.participant.id)}
                  className={`px-3 py-2 sm:py-1 rounded-full text-xs sm:text-sm font-medium transition-colors flex-shrink-0 min-h-[40px] sm:min-h-0 active:scale-95 ${
                    entry.participant.id === selectedParticipantId
                      ? 'bg-blue-600 text-white'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200 active:bg-gray-300'
                  }`}
                >
                  <span className="sm:hidden">#{entry.rank} {entry.participant.name.split(' ')[0]}</span>
                  <span className="hidden sm:inline">#{entry.rank} {entry.participant.name} ({entry.score.total})</span>
                </button>
              ))}
            </div>
            {/* Scroll fade indicator - mobile only */}
            <div className="absolute right-0 top-0 bottom-1 w-8 bg-gradient-to-l from-white to-transparent pointer-events-none sm:hidden" />
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="bg-gray-800 text-gray-400 text-center py-2 text-sm safe-area-bottom">
        Data from ESPN • Updates every {getPollingInterval(games) / 1000}s
      </footer>
    </div>
  );
}

export default App;
