"use client";
import React, { useState } from "react";
import ImageUploadChat from "./ImageUploadChat";
import VeraResponseViewer from "./VeraResponseViewer";
import { sendToVERA } from "../lib/sendToVERA";
import { openaiTTS } from "../lib/openaiTTS";
import { elevenlabsTTS } from "./tts-elevenlabs";

type TTSProvider = "openai" | "elevenlabs";

export default function VeraChatSession({ elevenLabsApiKey, elevenLabsVoiceId }: { elevenLabsApiKey: string, elevenLabsVoiceId: string }) {
  const [history, setHistory] = useState<{ from: string; message: string }[]>([]);
  const [pending, setPending] = useState(false);
  const [ttsProvider, setTTSProvider] = useState<TTSProvider>("openai");
  const [ttsError, setTTSError] = useState<string | null>(null);

  // TTS for latest VERA message
  React.useEffect(() => {
    const last = history[history.length - 1];
    if (!last || last.from !== "VERA") return;
    setTTSError(null);
    if (ttsProvider === "openai") {
      openaiTTS(last.message)
        .then((audioUrl: string) => {
          const audio = new Audio(audioUrl);
          audio.play();
        })
        .catch((err: any) => {
          setTTSError("OpenAI TTS error: " + (err?.message || err?.toString()));
        });
    } else if (ttsProvider === "elevenlabs") {
      elevenlabsTTS(last.message, elevenLabsApiKey, elevenLabsVoiceId)
        .then((audioUrl: string) => {
          // Fetch the audio blob to check its size
          fetch(audioUrl)
            .then(res => res.blob())
            .then(blob => {
              console.log('🔊 ElevenLabs audio blob size:', blob.size, 'bytes');
              if (blob.size < 10000) {
                setTTSError('Warning: ElevenLabs audio is very short or silent. Check API response and voice ID.');
              }
              const audio = new Audio(audioUrl);
              audio.onplay = () => console.log('▶️ ElevenLabs audio playback started');
              audio.onended = () => console.log('✅ ElevenLabs audio playback ended');
              audio.onerror = (event) => {
                const errorMessage =
                  (event as any)?.message ||
                  audio.error?.message ||
                  audio.error?.code?.toString() ||
                  'Unknown error';
                setTTSError('Audio playback error: ' + errorMessage);
              };
              audio.play();
            });
        })
        .catch((err: any) => {
          setTTSError("ElevenLabs TTS error: " + (err?.message || err?.toString()));
        });
    }
  }, [history, elevenLabsApiKey, elevenLabsVoiceId, ttsProvider]);

  async function handleSend({ text, images }: { text: string; images: File[] }) {
    setPending(true);
    setHistory(h => [...h, { from: "USER", message: text }]);
    const response = await sendToVERA({ text, images });
    setHistory(h => [...h, { from: "VERA", message: response }]);
    setPending(false);
  }

  return (
    <div>
      <div style={{ marginBottom: 12 }}>
        <label htmlFor="tts-provider">TTS Provider: </label>
        <select id="tts-provider" value={ttsProvider} onChange={e => setTTSProvider(e.target.value as TTSProvider)}>
          <option value="openai">OpenAI TTS</option>
          <option value="elevenlabs">ElevenLabs TTS</option>
        </select>
      </div>
      {ttsError && (
        <div style={{ color: 'red', marginBottom: 8 }}>
          <strong>TTS Error:</strong> {ttsError}
        </div>
      )}
      {history.map((msg, idx) => (
        <VeraResponseViewer key={idx} response={msg.message} />
      ))}
      <ImageUploadChat onSend={handleSend} />
      {pending && <div>VERA is thinking...</div>}
    </div>
  );
}

