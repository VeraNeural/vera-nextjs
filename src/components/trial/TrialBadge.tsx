'use client';

interface TrialBadgeProps {
  messagesRemaining: number;
  totalMessages: number;
  onClick?: () => void;
}

export default function TrialBadge({
  messagesRemaining,
  totalMessages,
  onClick,
}: TrialBadgeProps) {
  const percentage = (messagesRemaining / totalMessages) * 100;
  
  // Determine badge style based on remaining messages
  const getBadgeStyle = () => {
    if (percentage > 50) {
      return 'bg-trial-yellow/20 text-trial-yellow border-trial-yellow/30';
    }
    if (percentage > 20) {
      return 'bg-trial-orange/20 text-trial-orange border-trial-orange/30';
    }
    return 'bg-trial-red/20 text-trial-red border-trial-red/30';
  };

  return (
    <button
      onClick={onClick}
      className={`
        flex items-center gap-2 px-3 py-1.5 rounded-full border
        ${getBadgeStyle()}
        hover:scale-105 transition-transform cursor-pointer
      `}
    >
      <div className="w-1.5 h-1.5 rounded-full bg-current animate-pulse" />
      <span className="text-xs font-semibold">
        {messagesRemaining}/{totalMessages} Trial
      </span>
    </button>
  );
}
