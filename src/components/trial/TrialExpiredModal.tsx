// src/components/trial/TrialExpiredModal.tsx
'use client';

import { useRouter } from 'next/navigation';
import { X, Zap } from 'lucide-react';

interface TrialExpiredModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function TrialExpiredModal({ isOpen, onClose }: TrialExpiredModalProps) {
  const router = useRouter();

  if (!isOpen) return null;

  const handleUpgrade = () => {
    router.push('/pricing');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="relative w-full max-w-md mx-4 bg-white rounded-2xl shadow-2xl animate-in zoom-in-95 duration-200">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 text-gray-400 hover:text-gray-600 rounded-full hover:bg-gray-100 transition-colors"
          aria-label="Close"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="p-8 text-center">
          {/* Icon */}
          <div className="mx-auto w-16 h-16 bg-gradient-to-br from-purple-500 to-pink-500 rounded-full flex items-center justify-center mb-4">
            <Zap className="w-8 h-8 text-white" />
          </div>

          {/* Title */}
          <h2 className="text-2xl font-bold text-gray-900 mb-2">
            Your Trial Has Ended
          </h2>

          {/* Description */}
          <p className="text-gray-600 mb-6">
            Continue your healing journey with VERA. Subscribe now to unlock unlimited conversations, voice support, and all therapeutic modes.
          </p>

          {/* Features */}
          <div className="bg-gradient-to-br from-purple-50 to-pink-50 rounded-xl p-4 mb-6 text-left">
            <h3 className="font-semibold text-gray-900 mb-3">What You'll Get:</h3>
            <ul className="space-y-2 text-sm text-gray-700">
              <li className="flex items-center gap-2">
                <div className="w-1.5 h-1.5 rounded-full bg-purple-500" />
                Unlimited therapeutic conversations
              </li>
              <li className="flex items-center gap-2">
                <div className="w-1.5 h-1.5 rounded-full bg-purple-500" />
                Voice input & audio responses
              </li>
              <li className="flex items-center gap-2">
                <div className="w-1.5 h-1.5 rounded-full bg-purple-500" />
                Image analysis with Vision AI
              </li>
              <li className="flex items-center gap-2">
                <div className="w-1.5 h-1.5 rounded-full bg-purple-500" />
                All modes: Therapeutic, Real Talk, Decode
              </li>
              <li className="flex items-center gap-2">
                <div className="w-1.5 h-1.5 rounded-full bg-purple-500" />
                Ambient sounds & full chat history
              </li>
            </ul>
          </div>

          {/* Pricing */}
          <div className="flex gap-3 mb-6">
            <div className="flex-1 border-2 border-purple-200 rounded-lg p-3 text-left">
              <div className="text-sm text-gray-600">Monthly</div>
              <div className="text-xl font-bold text-purple-600">$12<span className="text-sm text-gray-500">/mo</span></div>
            </div>
            <div className="flex-1 border-2 border-purple-500 rounded-lg p-3 text-left relative">
              <div className="absolute -top-2 right-2 px-2 py-0.5 bg-purple-500 text-white text-xs font-bold rounded">
                SAVE 31%
              </div>
              <div className="text-sm text-gray-600">Yearly</div>
              <div className="text-xl font-bold text-purple-600">$99<span className="text-sm text-gray-500">/yr</span></div>
            </div>
          </div>

          {/* CTA Button */}
          <button
            onClick={handleUpgrade}
            className="w-full px-6 py-3 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-lg font-semibold hover:from-purple-700 hover:to-pink-700 transition-all transform hover:scale-105 shadow-lg"
          >
            Continue with VERA
          </button>

          {/* Support */}
          <p className="mt-4 text-xs text-gray-500">
            Need help? Contact support@vera.ai
          </p>
        </div>
      </div>
    </div>
  );
}
