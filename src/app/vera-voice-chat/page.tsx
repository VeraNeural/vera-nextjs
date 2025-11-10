"use client";
import React from 'react';
import VeraChatSession from '../../components/VeraChatSession';

export default function VeraChatSessionPage() {
  // You can set your ElevenLabs API key here or fetch from env/config
  const elevenLabsApiKey = process.env.NEXT_PUBLIC_ELEVENLABS_API_KEY || '';

  return (
    <div style={{ maxWidth: 600, margin: '0 auto', padding: 24 }}>
      <h2>VERA Voice-Enabled Chat</h2>
      <VeraChatSession elevenLabsApiKey={elevenLabsApiKey} />
    </div>
  );
}
