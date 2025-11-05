'use client';

import { ReactNode, useEffect, useState } from 'react';

interface MainLayoutProps {
  children: ReactNode;
  showSidebar?: boolean;
}

export default function MainLayout({ children, showSidebar = true }: MainLayoutProps) {
  const [theme, setTheme] = useState<'light' | 'dark' | 'deep'>('dark');

  useEffect(() => {
    // Load theme from localStorage
    const savedTheme = localStorage.getItem('vera-theme') as 'light' | 'dark' | 'deep' | null;
    if (savedTheme) {
      setTheme(savedTheme);
      document.documentElement.setAttribute('data-theme', savedTheme);
    } else {
      document.documentElement.setAttribute('data-theme', 'dark');
    }
  }, []);

  const handleThemeChange = (newTheme: 'light' | 'dark' | 'deep') => {
    setTheme(newTheme);
    document.documentElement.setAttribute('data-theme', newTheme);
    localStorage.setItem('vera-theme', newTheme);
  };

  return (
    <>
      {/* Living Background - 3 breath circles */}
      <div
        style={{
          position: 'fixed',
          top: 0,
          left: 0,
          width: '100%',
          height: '100%',
          zIndex: 0,
          pointerEvents: 'none',
          overflow: 'hidden',
        }}
      >
        <div
          style={{
            position: 'absolute',
            top: '10%',
            left: '5%',
            width: '400px',
            height: '400px',
            borderRadius: '50%',
            background: 'var(--breath-circle)',
            animation: 'breathe 8s ease-in-out infinite',
            animationDelay: '0s',
          }}
        />
        <div
          style={{
            position: 'absolute',
            top: '50%',
            right: '5%',
            width: '350px',
            height: '350px',
            borderRadius: '50%',
            background: 'var(--breath-circle)',
            animation: 'breathe 8s ease-in-out infinite',
            animationDelay: '2.6s',
          }}
        />
        <div
          style={{
            position: 'absolute',
            bottom: '10%',
            left: '50%',
            transform: 'translateX(-50%)',
            width: '300px',
            height: '300px',
            borderRadius: '50%',
            background: 'var(--breath-circle)',
            animation: 'breathe 8s ease-in-out infinite',
            animationDelay: '5.3s',
          }}
        />
      </div>

      {/* Main Content - Frozen header/footer layout */}
      <div
        style={{
          position: 'relative',
          zIndex: 1,
          height: '100vh',
          width: '100%',
          display: 'flex',
          flexDirection: 'column',
          overflow: 'hidden',
        }}
      >
        {children}
      </div>

      {/* Theme provider context */}
      <script
        dangerouslySetInnerHTML={{
          __html: `window.VERA_THEME = { current: '${theme}', set: ${handleThemeChange.toString()} };`,
        }}
      />
    </>
  );
}
