"use client";
import React from 'react';

export default function VeraResponseViewer({ response }: { response: string }) {
  function copyToClipboard() {
    navigator.clipboard.writeText(response);
  }

  return (
    <div>
      <pre style={{ whiteSpace: 'pre-wrap', wordBreak: 'break-word' }}>{response}</pre>
      <button onClick={copyToClipboard}>Copy</button>
    </div>
  );
}
