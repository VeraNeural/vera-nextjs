import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        // VERA Brand Colors
        'vera-purple': '#667eea',
        'vera-dark': '#1a1a2e',
        'vera-accent': '#764ba2',
        'vera-light': '#b19cd9',
        
        // Background Colors (from globals.css)
        'bg-primary': '#0a0e27',
        'bg-secondary': '#151832',
        'bg-tertiary': '#1a1d3a',
        
        // Text Colors
        'text-primary': 'rgba(255, 255, 255, 0.95)',
        'text-secondary': 'rgba(255, 255, 255, 0.7)',
        'text-tertiary': 'rgba(255, 255, 255, 0.5)',
        
        // Border & Accent Colors
        'border-color': 'rgba(255, 255, 255, 0.08)',
        'orb-purple': '#9B59B6',
        'orb-light-purple': '#B19CD9',
        'orb-blue': '#64B5F6',
        'accent-blue': '#7B9EF0',
        'hover-blue': 'rgba(123, 158, 240, 0.1)',
        
        // Trial Badge Colors
        'trial-yellow': '#F5A623',
        'trial-orange': '#FF9800',
        'trial-red': '#F44336',
      },
      animation: {
        'orb-breathe': 'orbBreathe 5.5s ease-in-out infinite',
        'breatheOrb': 'breatheOrb 8s ease-in-out infinite',
        'orbGlow': 'orbGlow 4s infinite',
        'messageSlideIn': 'messageSlideIn 0.4s ease-out',
        'typingBounce': 'typingBounce 1.4s infinite',
        'fade-in': 'fadeIn 0.5s ease-out',
        'slide-up': 'slideUp 0.3s ease-out',
        'pulse-glow': 'pulseGlow 2s ease-in-out infinite',
      },
      keyframes: {
        orbBreathe: {
          '0%, 100%': { 
            transform: 'scale(1)', 
            opacity: '0.85',
            boxShadow: '0 0 80px rgba(102, 126, 234, 0.6), 0 0 160px rgba(118, 75, 162, 0.4)'
          },
          '50%': { 
            transform: 'scale(1.15)', 
            opacity: '1',
            boxShadow: '0 0 120px rgba(102, 126, 234, 0.8), 0 0 240px rgba(118, 75, 162, 0.6)'
          },
        },
        breatheOrb: {
          '0%, 100%': {
            transform: 'scale(1)',
            boxShadow: '0 0 60px rgba(155, 89, 182, 0.5)',
          },
          '50%': {
            transform: 'scale(1.1)',
            boxShadow: '0 0 100px rgba(155, 89, 182, 0.8)',
          },
        },
        orbGlow: {
          '0%, 100%': {
            boxShadow: '0 0 20px rgba(155, 89, 182, 0.4)',
          },
          '50%': {
            boxShadow: '0 0 30px rgba(155, 89, 182, 0.6)',
          },
        },
        messageSlideIn: {
          from: {
            opacity: '0',
            transform: 'translateY(20px)',
          },
          to: {
            opacity: '1',
            transform: 'translateY(0)',
          },
        },
        typingBounce: {
          '0%, 60%, 100%': {
            transform: 'translateY(0)',
          },
          '30%': {
            transform: 'translateY(-10px)',
          },
        },
        fadeIn: {
          from: { opacity: '0' },
          to: { opacity: '1' },
        },
        slideUp: {
          from: { transform: 'translateY(10px)', opacity: '0' },
          to: { transform: 'translateY(0)', opacity: '1' },
        },
        pulseGlow: {
          '0%, 100%': { boxShadow: '0 0 20px rgba(102, 126, 234, 0.5)' },
          '50%': { boxShadow: '0 0 40px rgba(102, 126, 234, 0.8)' },
        },
      },
    },
  },
  plugins: [],
};

export default config;
