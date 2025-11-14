'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';

export default function Home() {
  const router = useRouter();
  const [isChecking, setIsChecking] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const response = await fetch('/api/health/session');
        const data = await response.json();
        
        if (data.authenticated) {
          // User is authenticated, redirect to chat
          setIsAuthenticated(true);
          router.push('/chat-exact');
        } else {
          // User is not authenticated, show landing page
          setIsAuthenticated(false);
          setIsChecking(false);
        }
      } catch (error) {
        console.error('Auth check error:', error);
        // If error, show landing page
        setIsAuthenticated(false);
        setIsChecking(false);
      }
    };

    checkAuth();
  }, [router]);

  if (isChecking || isAuthenticated) {
    return (
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        height: '100vh',
        background: '#1a1a2e',
        color: 'white',
      }}>
        <p>Loading VERA...</p>
      </div>
    );
  }

  // Render the landing page iframe
  return (
    <iframe
      src="/landing.html"
      style={{
        width: '100%',
        height: '100vh',
        border: 'none',
        display: 'block',
      }}
      title="VERA Landing Page"
    />
  );
}
