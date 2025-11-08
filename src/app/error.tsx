"use client";

import React from 'react';

// Route-level error boundary for the root route. This must NOT render <html> or <body>.
// Rendering document tags here can cause hydration/runtime errors (e.g., React errors 301/310).
export default function Error({ error, reset }: { error: Error; reset: () => void }) {
  React.useEffect(() => {
    // Log for debugging in production
    // eslint-disable-next-line no-console
    console.error('Route Error:', error);
  }, [error]);

  return (
    <div style={{
      height: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center',
      background: 'linear-gradient(180deg, #0a0a1e 0%, #1a1a3e 50%, #1a1535 100%)', color: '#fff'
    }}>
      <div style={{ maxWidth: 520, padding: 20, textAlign: 'center' }}>
        <h1 style={{ fontSize: 24, marginBottom: 8 }}>Something went wrong</h1>
        <p style={{ opacity: 0.85, marginBottom: 16 }}>
          The app hit a client-side error. Try reloading. If this keeps happening, we’ll investigate.
        </p>
        <pre style={{
          textAlign: 'left', whiteSpace: 'pre-wrap', fontSize: 12, opacity: 0.7,
          background: 'rgba(255,255,255,0.08)', padding: 12, borderRadius: 8, maxHeight: 220, overflow: 'auto'
        }}>{String(error?.message || error)}</pre>
        <button onClick={() => reset()} style={{
          marginTop: 16, padding: '10px 16px', borderRadius: 10,
          border: 'none', background: '#8B5CF6', color: '#fff', cursor: 'pointer'
        }}>Reload</button>
      </div>
    </div>
  );
}
