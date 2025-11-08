'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';

export default function Home() {
  const router = useRouter();
  const [isChecking, setIsChecking] = useState(true);

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const response = await fetch('/api/auth/profile');
        if (response.ok) {
          // User is authenticated, redirect to chat
          router.push('/chat-exact');
        } else {
          // User is not authenticated, redirect to signup
          router.push('/auth/signup');
        }
      } catch (error) {
        console.error('Auth check error:', error);
        // If error, redirect to signup as fallback
        router.push('/auth/signup');
      } finally {
        setIsChecking(false);
      }
    };

    checkAuth();
  }, [router]);

  return (
    <div style={{
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      height: '100vh',
      background: '#1a1a2e',
      color: 'white',
    }}>
      <p>Redirecting...</p>
    </div>
  );
}
