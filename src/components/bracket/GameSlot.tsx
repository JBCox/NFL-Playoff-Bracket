import type { Game, PickStatus } from '../../types';
import TeamBox from './TeamBox';

interface GameSlotProps {
  game: Game;
  participantPick: string | null;
  expectedOpponent?: string | null;  // The opponent the participant expects based on their picks
  eliminatedTeams?: Set<string>;
  className?: string;
}

export default function GameSlot({ game, participantPick, expectedOpponent, eliminatedTeams, className = '' }: GameSlotProps) {
  // Check if the picked team is eliminated
  const isPickEliminated = participantPick && eliminatedTeams?.has(participantPick);

  const getPickStatus = (teamAbbr: string | undefined): PickStatus => {
    if (!teamAbbr || !participantPick) return 'pending';

    // Check if the picked team is already eliminated (before this game)
    if (participantPick === teamAbbr && isPickEliminated) {
      // Only mark as 'eliminated' if this isn't the game where they lost
      const isInThisGame =
        game.homeTeam?.abbreviation === participantPick ||
        game.awayTeam?.abbreviation === participantPick;

      if (!isInThisGame || game.status !== 'final') {
        return 'eliminated';
      }
    }

    if (game.status !== 'final') return 'pending';
    if (participantPick === teamAbbr && game.winner === teamAbbr) return 'correct';
    if (participantPick === teamAbbr && game.winner !== teamAbbr) return 'incorrect';
    return 'pending';
  };

  const getConferenceColor = () => {
    if (game.round === 'superbowl') return 'border-yellow-400';
    if (game.conference === 'AFC') return 'border-afc-primary';
    if (game.conference === 'NFC') return 'border-nfc-primary';
    return 'border-gray-300';
  };

  const isLive = game.status === 'live';

  // Determine what to show in each slot for future/partial games
  const awayTeamAbbr = game.awayTeam?.abbreviation;
  const homeTeamAbbr = game.homeTeam?.abbreviation;

  // For future games, we want to show the participant's expected matchup:
  // - Their pick (with star)
  // - Their expected opponent (derived from their earlier picks)

  // Determine which team goes in which slot:
  // Away slot (top): show away team if known, otherwise show pick OR expected opponent
  // Home slot (bottom): show home team if known, otherwise show pick OR expected opponent

  // If pick equals home team, show expected opponent in away slot
  // If pick equals away team, show expected opponent in home slot (unlikely but handle it)
  // If neither team is known, show pick in one slot and expected opponent in the other

  const pickMatchesHome = participantPick === homeTeamAbbr;
  const pickMatchesAway = participantPick === awayTeamAbbr;

  // Away slot: show pick if home is known (and isn't the pick), or show expected opponent if pick is home
  const showPickInAwaySlot = !game.awayTeam && !!participantPick && !pickMatchesHome;
  const showOpponentInAwaySlot = !game.awayTeam && !!expectedOpponent && (pickMatchesHome || !participantPick);

  // Home slot: show pick if away is known (and isn't the pick), or show expected opponent if pick is away
  const showPickInHomeSlot = !game.homeTeam && !!participantPick && !pickMatchesAway && !showPickInAwaySlot;
  const showOpponentInHomeSlot = !game.homeTeam && !!expectedOpponent && !showOpponentInAwaySlot && !showPickInHomeSlot;

  return (
    <div
      className={`
        flex flex-col gap-0.5 bg-white rounded-lg shadow-sm
        border-2 ${getConferenceColor()}
        ${isLive ? 'ring-2 ring-red-400 ring-opacity-50' : ''}
        ${className}
      `}
    >
      {/* Live indicator */}
      {isLive && (
        <div className="bg-red-500 text-white text-xs font-bold px-2 py-0.5 text-center rounded-t-md">
          <span className="live-indicator">LIVE</span>
          {game.displayClock && ` - Q${game.period} ${game.displayClock}`}
        </div>
      )}

      {/* Away team (top) */}
      <TeamBox
        team={game.awayTeam}
        score={game.awayScore}
        isPicked={participantPick === awayTeamAbbr || showPickInAwaySlot}
        isWinner={game.winner === awayTeamAbbr}
        pickStatus={getPickStatus(showPickInAwaySlot ? participantPick : awayTeamAbbr)}
        pickedTeamAbbr={showPickInAwaySlot ? participantPick : (showOpponentInAwaySlot ? expectedOpponent : undefined)}
        isExpectedOpponent={showOpponentInAwaySlot}
      />

      {/* Divider */}
      <div className="border-t border-gray-200" />

      {/* Home team (bottom) */}
      <TeamBox
        team={game.homeTeam}
        score={game.homeScore}
        isPicked={participantPick === homeTeamAbbr || showPickInHomeSlot}
        isWinner={game.winner === homeTeamAbbr}
        pickStatus={getPickStatus(showPickInHomeSlot ? participantPick : homeTeamAbbr)}
        pickedTeamAbbr={showPickInHomeSlot ? participantPick : (showOpponentInHomeSlot ? expectedOpponent : undefined)}
        isExpectedOpponent={showOpponentInHomeSlot}
      />

      {/* Game status footer */}
      {game.status === 'final' && (
        <div className="bg-gray-100 text-gray-600 text-xs text-center py-0.5 rounded-b-md">
          FINAL
        </div>
      )}
    </div>
  );
}
