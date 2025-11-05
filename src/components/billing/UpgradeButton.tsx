"use client";

interface UpgradeButtonProps {
  onClick: () => void;
}

export default function UpgradeButton({ onClick }: UpgradeButtonProps) {
  return (
    <button
      onClick={onClick}
      style={{
        position: 'fixed', top: 16, right: 170, zIndex: 110,
        background: 'linear-gradient(135deg, #8B5CF6, #3B82F6)',
        color: '#fff', border: 'none', borderRadius: 999,
        padding: '6px 10px', fontSize: 11, fontWeight: 700,
        boxShadow: '0 6px 16px rgba(59,130,246,0.35)', cursor: 'pointer'
      }}
      onMouseEnter={(e) => { e.currentTarget.style.transform = 'translateY(-1px)'; }}
      onMouseLeave={(e) => { e.currentTarget.style.transform = 'translateY(0)'; }}
      aria-label="Upgrade"
    >
      Upgrade • $12/mo
    </button>
  );
}
