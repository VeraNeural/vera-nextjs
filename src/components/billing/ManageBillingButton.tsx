"use client";
 
import React from 'react';

interface ManageBillingButtonProps {
  onClick: () => void | Promise<void>;
  label?: string;
}

export default function ManageBillingButton({ onClick, label = 'Manage Billing' }: ManageBillingButtonProps) {
  const [loading, setLoading] = React.useState(false);

  const handleClick = React.useCallback(() => {
    if (loading) return;
    setLoading(true);
    Promise.resolve(onClick())
      .catch(() => {
        // Swallow error here; parent can also toast
      })
      .finally(() => setLoading(false));
  }, [onClick, loading]);

  return (
    <button
      onClick={handleClick}
      disabled={loading}
      style={{
        position: 'fixed',
        bottom: 16,
        right: 16,
        padding: '10px 14px',
        borderRadius: 9999,
        background: loading ? 'rgba(0,0,0,0.04)' : 'transparent',
        color: loading ? 'var(--text-muted)' : 'var(--text-soft)',
        border: '1px solid var(--border-soft)',
        backdropFilter: 'blur(6px)',
        WebkitBackdropFilter: 'blur(6px)',
        boxShadow: '0 2px 10px rgba(0,0,0,0.15)',
        cursor: loading ? 'progress' : 'pointer',
        fontSize: 13,
        opacity: loading ? 0.8 : 1,
        display: 'inline-flex',
        alignItems: 'center',
        gap: 8,
      }}
      aria-label="Manage subscription"
      title="Manage subscription"
      aria-busy={loading}
    >
      {loading && (
        <span
          aria-hidden
          style={{
            width: 14,
            height: 14,
            borderRadius: '50%',
            border: '2px solid var(--border-soft)',
            borderTopColor: 'var(--text-soft)',
            display: 'inline-block',
            animation: 'vera-spin 0.9s linear infinite',
          }}
        />
      )}
      <span>{label}</span>
      <style>{`
        @keyframes vera-spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
      `}</style>
    </button>
  );
}
