import BreathingOrb from '../orb/BreathingOrb';

export default function WelcomeState() {
  return (
    <div className="flex-1 flex flex-col items-center justify-center px-6">
      <BreathingOrb size="large" />
      
      <h2 className="mt-8 text-2xl font-bold text-text-primary text-center">
        I'm VERA
      </h2>
      
      <p className="mt-4 text-text-secondary text-center max-w-md">
        Your compassionate companion for mental wellness. I'm here to listen, support, and guide you through whatever you're experiencing.
      </p>

      <div className="mt-8 grid grid-cols-2 md:grid-cols-4 gap-4 w-full max-w-2xl">
        <button className="p-4 bg-bg-secondary hover:bg-bg-tertiary rounded-xl transition-colors text-center">
          <div className="text-2xl mb-2">🫁</div>
          <div className="text-sm text-text-primary">Breathing</div>
        </button>
        
        <button className="p-4 bg-bg-secondary hover:bg-bg-tertiary rounded-xl transition-colors text-center">
          <div className="text-2xl mb-2">🌱</div>
          <div className="text-sm text-text-primary">Grounding</div>
        </button>
        
        <button className="p-4 bg-bg-secondary hover:bg-bg-tertiary rounded-xl transition-colors text-center">
          <div className="text-2xl mb-2">💭</div>
          <div className="text-sm text-text-primary">Chat</div>
        </button>
        
        <button className="p-4 bg-bg-secondary hover:bg-bg-tertiary rounded-xl transition-colors text-center">
          <div className="text-2xl mb-2">🆘</div>
          <div className="text-sm text-text-primary">Support</div>
        </button>
      </div>
    </div>
  );
}