import { getProbabilityTier } from '../../services/probabilityCalculator';

interface WinProbabilityPillProps {
  probability: number;
  isEliminated?: boolean;
  size?: 'sm' | 'md';
}

export default function WinProbabilityPill({
  probability,
  isEliminated = false,
  size = 'md'
}: WinProbabilityPillProps) {
  const tier = isEliminated ? 'eliminated' : getProbabilityTier(probability);

  // Color classes based on tier
  const colorClasses = {
    high: 'bg-green-100 text-green-800 border-green-300',
    medium: 'bg-yellow-100 text-yellow-800 border-yellow-300',
    low: 'bg-red-100 text-red-800 border-red-300',
    eliminated: 'bg-gray-100 text-gray-500 border-gray-300'
  };

  const sizeClasses = {
    sm: 'text-xs px-1.5 py-0.5',
    md: 'text-sm px-2 py-0.5'
  };

  const displayText = isEliminated || probability === 0
    ? 'Out'
    : `${Math.round(probability * 100)}%`;

  return (
    <span
      className={`
        inline-flex items-center justify-center
        font-semibold rounded-full border
        ${colorClasses[tier]}
        ${sizeClasses[size]}
      `}
      title={isEliminated ? 'Mathematically eliminated' : `${(probability * 100).toFixed(1)}% chance to win`}
    >
      {displayText}
    </span>
  );
}
