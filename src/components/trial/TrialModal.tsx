'use client';

import { useEffect } from 'react';

interface TrialModalProps {
  isOpen: boolean;
  onClose: () => void;
  messagesUsed: number;
  totalMessages: number;
}

export default function TrialModal({
  isOpen,
  onClose,
  messagesUsed,
  totalMessages,
}: TrialModalProps) {
  // Prevent body scroll when modal is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

  // Close on escape key
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    
    if (isOpen) {
      window.addEventListener('keydown', handleEscape);
      return () => window.removeEventListener('keydown', handleEscape);
    }
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 animate-fadeIn">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="relative w-full max-w-md bg-bg-secondary rounded-2xl border border-border-color shadow-2xl animate-scaleIn">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-text-tertiary hover:text-text-primary transition-colors"
          aria-label="Close modal"
        >
          <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>

        {/* Content */}
        <div className="p-8">
          {/* Icon */}
          <div className="flex justify-center mb-6">
            <div className="w-16 h-16 rounded-full orb-gradient flex items-center justify-center text-3xl">
              ⭐
            </div>
          </div>

          {/* Title */}
          <h2 className="text-2xl font-bold text-text-primary text-center mb-3">
            {messagesUsed >= totalMessages ? 'Trial Complete' : 'Upgrade to VERA Pro'}
          </h2>

          {/* Description */}
          <p className="text-text-secondary text-center mb-6">
            {messagesUsed >= totalMessages
              ? "You've used all your free trial messages. Upgrade now to continue your journey with VERA."
              : `You've used ${messagesUsed} of ${totalMessages} trial messages. Unlock unlimited access to VERA's full capabilities.`}
          </p>

          {/* Features */}
          <div className="space-y-3 mb-8">
            <div className="flex items-start gap-3">
              <div className="w-6 h-6 rounded-full bg-orb-purple/20 flex items-center justify-center flex-shrink-0 mt-0.5">
                <span className="text-orb-purple text-sm">✓</span>
              </div>
              <div>
                <p className="text-text-primary font-semibold">Unlimited Conversations</p>
                <p className="text-text-tertiary text-sm">Chat as much as you need, whenever you need</p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <div className="w-6 h-6 rounded-full bg-orb-purple/20 flex items-center justify-center flex-shrink-0 mt-0.5">
                <span className="text-orb-purple text-sm">✓</span>
              </div>
              <div>
                <p className="text-text-primary font-semibold">Advanced Co-Regulation</p>
                <p className="text-text-tertiary text-sm">Voice input, breathing exercises, and more</p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <div className="w-6 h-6 rounded-full bg-orb-purple/20 flex items-center justify-center flex-shrink-0 mt-0.5">
                <span className="text-orb-purple text-sm">✓</span>
              </div>
              <div>
                <p className="text-text-primary font-semibold">Session History</p>
                <p className="text-text-tertiary text-sm">Access all your past conversations</p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <div className="w-6 h-6 rounded-full bg-orb-purple/20 flex items-center justify-center flex-shrink-0 mt-0.5">
                <span className="text-orb-purple text-sm">✓</span>
              </div>
              <div>
                <p className="text-text-primary font-semibold">Priority Support</p>
                <p className="text-text-tertiary text-sm">Get help when you need it most</p>
              </div>
            </div>
          </div>

          {/* Pricing */}
          <div className="bg-bg-tertiary rounded-xl p-4 mb-6">
            <div className="flex items-baseline justify-center gap-2 mb-2">
              <span className="text-3xl font-bold text-text-primary">$9.99</span>
              <span className="text-text-tertiary">/month</span>
            </div>
            <p className="text-center text-text-tertiary text-sm">
              Cancel anytime • 7-day money-back guarantee
            </p>
          </div>

          {/* Action Buttons */}
          <div className="space-y-3">
            <button className="w-full gradient-button py-3 rounded-xl font-semibold text-white hover:scale-105 transition-transform">
              Upgrade to Pro
            </button>
            
            <button
              onClick={onClose}
              className="w-full py-3 rounded-xl font-semibold text-text-secondary hover:text-text-primary transition-colors"
            >
              {messagesUsed >= totalMessages ? 'Maybe Later' : 'Continue Trial'}
            </button>
          </div>
        </div>
      </div>

      <style jsx>{`
        @keyframes fadeIn {
          from {
            opacity: 0;
          }
          to {
            opacity: 1;
          }
        }
        
        @keyframes scaleIn {
          from {
            opacity: 0;
            transform: scale(0.95);
          }
          to {
            opacity: 1;
            transform: scale(1);
          }
        }
        
        .animate-fadeIn {
          animation: fadeIn 0.2s ease-out;
        }
        
        .animate-scaleIn {
          animation: scaleIn 0.3s ease-out;
        }
      `}</style>
    </div>
  );
}
