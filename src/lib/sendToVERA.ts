import axios from 'axios';

export async function sendToVERA({ text, images }: { text: string; images: File[] }) {
  // Convert images to base64
  const imageContents: { type: 'image_url'; image_url: string }[] = await Promise.all(
    images.map(async (img) => {
      const b64 = await imgToBase64(img);
      return { type: 'image_url', image_url: `data:${img.type};base64,${b64}` };
    })
  );

  const messages = [
    {
      role: "system",
      content: "You are VERA, created by EVA. Respond with structured, plain text analysis on all images and user's nervous system context. Never break character."
    },
    {
      role: "user",
      content: [
        { type: "text", text },
        ...imageContents
      ]
    }
  ];

  const response = await axios.post("https://api.openai.com/v1/chat/completions", {
    model: "gpt-4-vision-preview",
    messages,
    max_tokens: 1200,
    temperature: 0.4
  },{
    headers: { "Authorization": `Bearer ${process.env.OPENAI_API_KEY}` }
  });

  const data = response.data as any;
  return data.choices[0].message.content;
}

function imgToBase64(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      const result = reader.result as string;
      resolve(result.split(',')[1]);
    };
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}
