'use client';

import { useState } from 'react';

type GroundingStep = {
  number: 5 | 4 | 3 | 2 | 1;
  sense: string;
  prompt: string;
  emoji: string;
  examples: string[];
};

const groundingSteps: GroundingStep[] = [
  {
    number: 5,
    sense: 'things you can see',
    prompt: 'Look around and name 5 things you can see right now',
    emoji: '👀',
    examples: ['a lamp', 'the ceiling', 'your hands', 'a picture', 'the floor'],
  },
  {
    number: 4,
    sense: 'things you can touch',
    prompt: 'Notice 4 things you can physically feel or touch',
    emoji: '✋',
    examples: ['your feet on the floor', 'your back on the chair', 'the texture of fabric', 'temperature of air'],
  },
  {
    number: 3,
    sense: 'things you can hear',
    prompt: 'Listen carefully and identify 3 sounds',
    emoji: '👂',
    examples: ['breathing', 'distant traffic', 'a fan', 'birds outside'],
  },
  {
    number: 2,
    sense: 'things you can smell',
    prompt: 'Notice 2 scents around you',
    emoji: '👃',
    examples: ['fresh air', 'coffee', 'soap', 'your clothing'],
  },
  {
    number: 1,
    sense: 'thing you can taste',
    prompt: 'Name 1 thing you can taste right now',
    emoji: '👅',
    examples: ['mint', 'coffee', 'water', 'your last meal'],
  },
];

interface GroundingSessionProps {
  onComplete?: () => void;
  onClose?: () => void;
}

export default function GroundingSession({ onComplete, onClose }: GroundingSessionProps) {
  const [currentStepIndex, setCurrentStepIndex] = useState(0);
  const [userInputs, setUserInputs] = useState<string[]>([]);
  const [currentInput, setCurrentInput] = useState('');
  const [isComplete, setIsComplete] = useState(false);

  const currentStep = groundingSteps[currentStepIndex];
  const progress = ((currentStepIndex + 1) / groundingSteps.length) * 100;

  const handleAddInput = () => {
    if (currentInput.trim()) {
      const newInputs = [...userInputs, currentInput.trim()];
      setUserInputs(newInputs);
      setCurrentInput('');

      // Check if current step is complete
      if (newInputs.length >= currentStep.number) {
        // Move to next step or complete
        if (currentStepIndex < groundingSteps.length - 1) {
          setTimeout(() => {
            setCurrentStepIndex(currentStepIndex + 1);
            setUserInputs([]);
          }, 500);
        } else {
          setIsComplete(true);
          onComplete?.();
        }
      }
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleAddInput();
    }
  };

  const handleRestart = () => {
    setCurrentStepIndex(0);
    setUserInputs([]);
    setCurrentInput('');
    setIsComplete(false);
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-bg-primary p-6">
      {/* Close Button */}
      {onClose && (
        <button
          onClick={onClose}
          className="absolute top-6 right-6 text-text-tertiary hover:text-text-primary transition-colors"
          aria-label="Close grounding session"
        >
          <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      )}

      <div className="w-full max-w-2xl">
        {!isComplete ? (
          <>
            {/* Progress Bar */}
            <div className="mb-8">
              <div className="flex justify-between text-sm text-text-secondary mb-2">
                <span>5-4-3-2-1 Grounding Exercise</span>
                <span>{Math.round(progress)}%</span>
              </div>
              <div className="h-2 bg-bg-tertiary rounded-full overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-orb-purple to-orb-blue transition-all duration-500"
                  style={{ width: `${progress}%` }}
                />
              </div>
            </div>

            {/* Current Step */}
            <div className="bg-bg-secondary rounded-2xl p-8 mb-6">
              <div className="text-center mb-6">
                <div className="text-6xl mb-4">{currentStep.emoji}</div>
                <div className="text-5xl font-bold text-orb-purple mb-3">
                  {currentStep.number}
                </div>
                <h2 className="text-2xl font-bold text-text-primary mb-2">
                  {currentStep.sense}
                </h2>
                <p className="text-text-secondary">
                  {currentStep.prompt}
                </p>
              </div>

              {/* User Inputs */}
              <div className="space-y-3 mb-6">
                {userInputs.map((input, index) => (
                  <div
                    key={index}
                    className="bg-bg-tertiary p-3 rounded-lg text-text-primary animate-messageSlideIn"
                  >
                    {index + 1}. {input}
                  </div>
                ))}
                
                {/* Empty slots */}
                {Array.from({ length: currentStep.number - userInputs.length }).map((_, index) => (
                  <div
                    key={`empty-${index}`}
                    className="bg-bg-tertiary/30 p-3 rounded-lg border border-dashed border-border-color text-text-tertiary"
                  >
                    {userInputs.length + index + 1}. ...
                  </div>
                ))}
              </div>

              {/* Input Field */}
              <div className="flex gap-3">
                <input
                  type="text"
                  value={currentInput}
                  onChange={(e) => setCurrentInput(e.target.value)}
                  onKeyPress={handleKeyPress}
                  placeholder={`e.g., ${currentStep.examples[userInputs.length] || currentStep.examples[0]}`}
                  className="flex-1 px-4 py-3 bg-bg-tertiary text-text-primary placeholder-text-tertiary rounded-xl focus:outline-none focus:ring-2 focus:ring-orb-purple"
                  autoFocus
                />
                <button
                  onClick={handleAddInput}
                  disabled={!currentInput.trim()}
                  className="gradient-button px-6 py-3 rounded-xl font-semibold text-white disabled:opacity-50 disabled:cursor-not-allowed hover:scale-105 transition-transform"
                >
                  Add
                </button>
              </div>
            </div>

            {/* Helper Text */}
            <p className="text-center text-text-tertiary text-sm">
              Press Enter or click Add to continue
            </p>
          </>
        ) : (
          /* Completion Screen */
          <div className="text-center">
            <div className="text-6xl mb-6">✨</div>
            <h2 className="text-3xl font-bold text-text-primary mb-4">
              Grounding Complete
            </h2>
            <p className="text-text-secondary mb-8 text-lg">
              You've successfully connected with your present moment through all five senses. 
              Notice how you feel now compared to when you started.
            </p>

            <div className="bg-bg-secondary rounded-2xl p-6 mb-8">
              <p className="text-text-secondary mb-4">
                You identified:
              </p>
              <div className="flex justify-center gap-4 text-orb-purple font-bold text-2xl">
                <span>5</span>
                <span>4</span>
                <span>3</span>
                <span>2</span>
                <span>1</span>
              </div>
              <p className="text-text-tertiary mt-2 text-sm">
                sensory experiences that anchored you to the present
              </p>
            </div>

            <div className="flex gap-4 justify-center">
              <button
                onClick={handleRestart}
                className="gradient-button px-8 py-3 rounded-xl font-semibold text-white hover:scale-105 transition-transform"
              >
                Practice Again
              </button>
              {onClose && (
                <button
                  onClick={onClose}
                  className="px-8 py-3 rounded-xl font-semibold text-text-secondary hover:text-text-primary transition-colors border border-border-color"
                >
                  Return to Chat
                </button>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
