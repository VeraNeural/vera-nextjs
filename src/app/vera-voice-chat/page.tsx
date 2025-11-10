"use client";
import React from 'react';
import VeraChatSession from '../../components/VeraChatSession';

export default function VeraChatSessionPage() {
  // Use server-side env vars for ElevenLabs
  const elevenLabsApiKey = process.env.ELEVENLABS_API_KEY || '';
  const elevenLabsVoiceId = process.env.ELEVENLABS_VOICE_ID || '';

  return (
    <div style={{ maxWidth: 600, margin: '0 auto', padding: 24 }}>
      <h2>VERA Voice-Enabled Chat</h2>
      <VeraChatSession elevenLabsApiKey={elevenLabsApiKey} elevenLabsVoiceId={elevenLabsVoiceId} />
    </div>
  );
}
