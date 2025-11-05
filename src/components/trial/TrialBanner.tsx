'use client';

import { useEffect, useState } from 'react';

interface TrialBannerProps {
  messagesRemaining: number;
  totalMessages: number;
  timeRemaining: string;
  onUpgrade: () => void;
}

export default function TrialBanner({
  messagesRemaining,
  totalMessages,
  timeRemaining,
  onUpgrade,
}: TrialBannerProps) {
  const [isVisible, setIsVisible] = useState(true);
  const percentage = (messagesRemaining / totalMessages) * 100;
  
  // Determine color based on remaining messages
  const getColorClass = () => {
    if (percentage > 50) return 'text-trial-yellow';
    if (percentage > 20) return 'text-trial-orange';
    return 'text-trial-red';
  };

  const getProgressColor = () => {
    if (percentage > 50) return 'bg-trial-yellow';
    if (percentage > 20) return 'bg-trial-orange';
    return 'bg-trial-red';
  };

  if (!isVisible) return null;

  return (
    <div className="bg-bg-secondary border-b border-border-color px-6 py-3">
      <div className="max-w-4xl mx-auto flex items-center justify-between gap-4">
        {/* Trial Info */}
        <div className="flex items-center gap-4 flex-1">
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-trial-yellow animate-pulse" />
            <span className="text-sm font-semibold text-text-primary">Free Trial</span>
          </div>
          
          <div className="flex items-center gap-2 text-sm">
            <span className={`font-bold ${getColorClass()}`}>
              {messagesRemaining}/{totalMessages}
            </span>
            <span className="text-text-secondary">messages left</span>
          </div>

          {timeRemaining && (
            <div className="hidden md:flex items-center gap-2 text-sm text-text-secondary">
              <span>⏱️</span>
              <span>{timeRemaining} remaining</span>
            </div>
          )}
        </div>

        {/* Progress Bar */}
        <div className="hidden sm:flex items-center gap-3 flex-1 max-w-[200px]">
          <div className="flex-1 h-2 bg-bg-tertiary rounded-full overflow-hidden">
            <div
              className={`h-full ${getProgressColor()} transition-all duration-500`}
              style={{ width: `${percentage}%` }}
            />
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-2">
          <button
            onClick={onUpgrade}
            className="gradient-button px-4 py-2 rounded-lg text-sm font-semibold text-white hover:scale-105 transition-transform"
          >
            Upgrade Now
          </button>
          
          <button
            onClick={() => setIsVisible(false)}
            className="p-2 text-text-tertiary hover:text-text-primary transition-colors"
            aria-label="Dismiss banner"
          >
            ×
          </button>
        </div>
      </div>
    </div>
  );
}
