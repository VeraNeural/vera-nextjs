'use client';

interface BreathingOrbProps {
  size?: number; // Size in pixels
  animate?: boolean;
  showShimmer?: boolean;
}

export default function BreathingOrb({ 
  size = 120, 
  animate = true,
  showShimmer = true 
}: BreathingOrbProps) {
  return (
    <div
      style={{
        position: 'relative',
        width: `${size}px`,
        height: `${size}px`,
      }}
    >
      {/* Outer glow/halo */}
      <div
        style={{
          position: 'absolute',
          inset: '-80%',
          borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(168, 184, 232, 0.6) 0%, rgba(200, 180, 230, 0.4) 25%, rgba(220, 190, 220, 0.3) 40%, rgba(230, 200, 220, 0.2) 55%, transparent 75%)',
          filter: 'blur(60px)',
          animation: animate ? 'gentlePulse 4s ease-in-out infinite' : 'none',
          pointerEvents: 'none',
        }}
      />

      {/* Main Orb */}
      <div
        style={{
          width: '100%',
          height: '100%',
          borderRadius: '50%',
          background: 'linear-gradient(180deg, #A8B8E8 0%, #B8A8E8 25%, #D8B0E8 50%, #E8B8D8 75%, #F0C0E0 100%)',
          animation: animate ? 'presencePulse 4s ease-in-out infinite' : 'none',
          filter: 'blur(0.5px)',
          position: 'relative',
          overflow: 'hidden',
        }}
      >
        {/* Subtle highlight on top */}
        <div
          style={{
            position: 'absolute',
            top: '15%',
            left: '20%',
            width: '40%',
            height: '40%',
            borderRadius: '50%',
            background: 'radial-gradient(circle, rgba(255, 255, 255, 0.25) 0%, transparent 70%)',
            pointerEvents: 'none',
          }}
        />

        {/* Shimmer overlay */}
        {showShimmer && (
          <div
            style={{
              position: 'absolute',
              top: '-50%',
              left: '-50%',
              width: '200%',
              height: '200%',
              background: 'linear-gradient(45deg, transparent 30%, rgba(255, 255, 255, 0.1) 50%, transparent 70%)',
              animation: 'orbShimmer 3s linear infinite',
              pointerEvents: 'none',
            }}
          />
        )}
      </div>
    </div>
  );
}