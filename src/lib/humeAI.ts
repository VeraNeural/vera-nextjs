import axios from "axios";

export async function analyzeWithHumeAI({ text, audio, image }: { text?: string; audio?: File; image?: File }) {
  const apiKey = process.env.NEXT_PUBLIC_HUME_API_KEY;
  const url = "https://api.hume.ai/v1/analytics";

  const formData = new FormData();
  if (text) formData.append("text", text);
  if (audio) formData.append("audio", audio);
  if (image) formData.append("image", image);

  const response = await axios.post(url, formData, {
    headers: {
      "X-Hume-Api-Key": apiKey,
      "Accept": "application/json"
    }
  });

  return response.data;
}
