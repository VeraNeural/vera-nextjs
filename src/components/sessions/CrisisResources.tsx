'use client';

interface CrisisResource {
  name: string;
  phone: string;
  description: string;
  availability: string;
  icon: string;
}

const crisisResources: CrisisResource[] = [
  {
    name: '988 Suicide & Crisis Lifeline',
    phone: '988',
    description: 'Free and confidential support for people in distress, 24/7',
    availability: '24/7',
    icon: '🆘',
  },
  {
    name: 'Crisis Text Line',
    phone: 'Text HOME to 741741',
    description: 'Free, 24/7 support via text message',
    availability: '24/7',
    icon: '💬',
  },
  {
    name: 'SAMHSA Helpline',
    phone: '1-800-662-4357',
    description: 'Treatment referral and information service',
    availability: '24/7',
    icon: '📞',
  },
  {
    name: 'Veterans Crisis Line',
    phone: '988, then press 1',
    description: 'Support for Veterans and their families',
    availability: '24/7',
    icon: '🎖️',
  },
  {
    name: 'Trevor Project (LGBTQ+)',
    phone: '1-866-488-7386',
    description: 'Crisis support for LGBTQ+ young people',
    availability: '24/7',
    icon: '🏳️‍🌈',
  },
];

interface CrisisResourcesProps {
  onClose?: () => void;
}

export default function CrisisResources({ onClose }: CrisisResourcesProps) {
  const handleCall = (phone: string) => {
    // Remove non-numeric characters for tel: link
    const cleanPhone = phone.replace(/[^0-9]/g, '');
    if (cleanPhone) {
      window.location.href = `tel:${cleanPhone}`;
    }
  };

  return (
    <div className="flex flex-col min-h-screen bg-bg-primary p-6">
      {/* Close Button */}
      {onClose && (
        <button
          onClick={onClose}
          className="absolute top-6 right-6 text-text-tertiary hover:text-text-primary transition-colors z-10"
          aria-label="Close crisis resources"
        >
          <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      )}

      <div className="max-w-4xl mx-auto w-full flex-1 flex flex-col justify-center py-8">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="text-5xl mb-4">🆘</div>
          <h1 className="text-3xl font-bold text-text-primary mb-3">
            Crisis Support Resources
          </h1>
          <p className="text-text-secondary max-w-2xl mx-auto">
            If you're in crisis or need immediate support, these resources are available to help you right now. 
            You don't have to face this alone.
          </p>
        </div>

        {/* Emergency Notice */}
        <div className="bg-trial-red/20 border border-trial-red/30 rounded-xl p-4 mb-8">
          <div className="flex items-start gap-3">
            <span className="text-2xl">⚠️</span>
            <div>
              <p className="text-text-primary font-semibold mb-1">
                Medical Emergency?
              </p>
              <p className="text-text-secondary text-sm">
                If you or someone else is in immediate danger, call 911 or go to the nearest emergency room.
              </p>
            </div>
          </div>
        </div>

        {/* Crisis Resources List */}
        <div className="space-y-4 mb-8">
          {crisisResources.map((resource, index) => (
            <div
              key={index}
              className="bg-bg-secondary rounded-xl p-6 border border-border-color hover:border-orb-purple/50 transition-colors"
            >
              <div className="flex items-start gap-4">
                <div className="text-4xl flex-shrink-0">
                  {resource.icon}
                </div>
                
                <div className="flex-1 min-w-0">
                  <h3 className="text-xl font-bold text-text-primary mb-2">
                    {resource.name}
                  </h3>
                  <p className="text-text-secondary mb-3">
                    {resource.description}
                  </p>
                  
                  <div className="flex flex-wrap items-center gap-4">
                    <button
                      onClick={() => handleCall(resource.phone)}
                      className="gradient-button px-6 py-2 rounded-lg font-semibold text-white hover:scale-105 transition-transform text-sm"
                    >
                      {resource.phone}
                    </button>
                    
                    <span className="text-xs text-text-tertiary flex items-center gap-1">
                      <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></span>
                      {resource.availability}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Additional Support */}
        <div className="bg-bg-secondary rounded-xl p-6">
          <h3 className="text-lg font-bold text-text-primary mb-3">
            Additional Resources
          </h3>
          <div className="space-y-2 text-sm text-text-secondary">
            <p>
              <strong className="text-text-primary">International:</strong> Visit{' '}
              <a 
                href="https://findahelpline.com" 
                target="_blank" 
                rel="noopener noreferrer"
                className="text-orb-blue hover:underline"
              >
                findahelpline.com
              </a>
            </p>
            <p>
              <strong className="text-text-primary">Domestic Violence:</strong> Call 1-800-799-7233 or text START to 88788
            </p>
            <p>
              <strong className="text-text-primary">Substance Abuse:</strong> SAMHSA at 1-800-662-4357
            </p>
          </div>
        </div>

        {/* Return Button */}
        {onClose && (
          <div className="text-center mt-8">
            <button
              onClick={onClose}
              className="px-8 py-3 rounded-xl font-semibold text-text-secondary hover:text-text-primary transition-colors border border-border-color"
            >
              Return to VERA
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
