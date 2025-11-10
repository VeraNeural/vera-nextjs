"use client";
import React, { useState } from "react";
import ImageUploadChat from "./ImageUploadChat";
import VeraResponseViewer from "./VeraResponseViewer";
import { sendToVERA } from "../lib/sendToVERA";
import { openaiTTS } from "../lib/openaiTTS";
import { elevenlabsTTS } from "./tts-elevenlabs";

type TTSProvider = "openai" | "elevenlabs";

export default function VeraChatSession({ elevenLabsApiKey }: { elevenLabsApiKey: string }) {
  const [history, setHistory] = useState<{ from: string; message: string }[]>([]);
  const [pending, setPending] = useState(false);
  const [ttsProvider, setTTSProvider] = useState<TTSProvider>("openai");

  // TTS for latest VERA message
  React.useEffect(() => {
    const last = history[history.length - 1];
    if (!last || last.from !== "VERA") return;
    if (ttsProvider === "openai") {
      openaiTTS(last.message).then((audioUrl: string) => {
        const audio = new Audio(audioUrl);
        audio.play();
      });
    } else if (ttsProvider === "elevenlabs") {
      elevenlabsTTS(last.message, elevenLabsApiKey).then((audioUrl: string) => {
        const audio = new Audio(audioUrl);
        audio.play();
      });
    }
  }, [history, elevenLabsApiKey, ttsProvider]);

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
      {history.map((msg, idx) => (
        <VeraResponseViewer key={idx} response={msg.message} />
      ))}
      <ImageUploadChat onSend={handleSend} />
      {pending && <div>VERA is thinking...</div>}
    </div>
  );
}

export default function VeraChatSession({ elevenLabsApiKey }: { elevenLabsApiKey: string }) {
  const [history, setHistory] = useState<{ from: string; message: string }[]>([]);
  const [pending, setPending] = useState(false);

  // TTS temporarily disabled for Hume AI testing

  async function handleSend({ text, images }: { text: string; images: File[] }) {
    setPending(true);
    setHistory(h => [...h, { from: "USER", message: text }]);
    const response = await sendToVERA({ text, images });
    setHistory(h => [...h, { from: "VERA", message: response }]);
    setPending(false);
  }

  return (
    <div>
      {history.map((msg, idx) => (
        <VeraResponseViewer key={idx} response={msg.message} />
      ))}
      <ImageUploadChat onSend={handleSend} />
      {pending && <div>VERA is thinking...</div>}
    </div>
  );
}
