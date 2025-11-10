import React, { useState } from "react";
import { analyzeWithHumeAI } from "../../lib/humeAI";

export default function HumeAITest() {
  const [text, setText] = useState("");
  const [audio, setAudio] = useState<File | null>(null);
  const [image, setImage] = useState<File | null>(null);
  const [result, setResult] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  async function handleAnalyze() {
    setLoading(true);
    try {
      const res = await analyzeWithHumeAI({
        text,
        audio: audio || undefined,
        image: image || undefined
      });
      setResult(res);
    } catch (err) {
      setResult("Error: " + (err instanceof Error ? err.message : "Unknown error"));
    } finally {
      setLoading(false);
    }
  }

  return (
    <div style={{ maxWidth: 600, margin: "0 auto", padding: 24 }}>
      <h2>Hume AI Test</h2>
      <textarea value={text} onChange={e => setText(e.target.value)} placeholder="Text for Hume AI" />
      <input type="file" accept="audio/*" onChange={e => setAudio(e.target.files?.[0] || null)} />
      <input type="file" accept="image/*" onChange={e => setImage(e.target.files?.[0] || null)} />
      <button onClick={handleAnalyze} disabled={loading}>Analyze</button>
      {loading && <div>Analyzing with Hume AI...</div>}
      {result && <pre style={{ whiteSpace: "pre-wrap", wordBreak: "break-word" }}>{JSON.stringify(result, null, 2)}</pre>}
    </div>
  );
}
