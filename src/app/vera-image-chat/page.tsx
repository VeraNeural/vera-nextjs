import React, { useState } from 'react';
import ImageUploadChat from '../../components/ImageUploadChat';
import VeraResponseViewer from '../../components/VeraResponseViewer';
import { sendToVERA } from '../../lib/sendToVERA';

export default function VeraImageChatPage() {
  const [response, setResponse] = useState('');
  const [loading, setLoading] = useState(false);

  async function handleSend(message: { text: string; images: File[] }) {
    setLoading(true);
    try {
      const result = await sendToVERA(message);
      setResponse(result);
    } catch (err) {
      setResponse('Error: ' + (err instanceof Error ? err.message : 'Unknown error'));
    } finally {
      setLoading(false);
    }
  }

  return (
    <div style={{ maxWidth: 600, margin: '0 auto', padding: 24 }}>
      <h2>VERA Image/Text Chat</h2>
      <ImageUploadChat onSend={handleSend} />
      {loading && <div>Analyzing with VERA...</div>}
      {response && <VeraResponseViewer response={response} />}
    </div>
  );
}
