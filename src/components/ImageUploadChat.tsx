"use client";
import React, { useState } from 'react';

type MessagePayload = {
  text: string;
  images: File[];
};

export default function ImageUploadChat({
  onSend,
}: {
  onSend: (message: MessagePayload) => void;
}) {
  const [text, setText] = useState('');
  const [images, setImages] = useState<File[]>([]);

  function handleImageChange(e: React.ChangeEvent<HTMLInputElement>) {
    setImages(Array.from(e.target.files || []));
  }

  function sendMessage() {
    onSend({ text, images });
    setText('');
    setImages([]);
  }

  return (
    <div>
      <textarea value={text} onChange={e => setText(e.target.value)} placeholder="Message VERA..." />
      <input type="file" multiple accept="image/*" onChange={handleImageChange} />
      <button onClick={sendMessage}>Send</button>
      {images.length > 0 && <div>
        {images.map((img, idx) => <span key={idx}>{img.name}</span>)}
      </div>}
    </div>
  );
}
