import React, { useState } from "react";
import ImageUploadChat from "./ImageUploadChat";
import VeraResponseViewer from "./VeraResponseViewer";
import { sendToVERA } from "../lib/sendToVERA";
import { elevenlabsTTS } from "./tts-elevenlabs";

export default function VeraChatSession({ elevenLabsApiKey }: { elevenLabsApiKey: string }) {
  const [history, setHistory] = useState<{ from: string; message: string }[]>([]);
  const [pending, setPending] = useState(false);

  // TTS for latest VERA message
  React.useEffect(() => {
    const last = history[history.length - 1];
    if (!last || last.from !== "VERA") return;
    elevenlabsTTS(last.message, elevenLabsApiKey).then(audioUrl => {
      const audio = new Audio(audioUrl);
      audio.play();
    });
  }, [history, elevenLabsApiKey]);

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
