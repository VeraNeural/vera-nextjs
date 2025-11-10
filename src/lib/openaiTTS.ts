import axios from "axios";

export async function openaiTTS(text: string, voice: string = "onyx", model: string = "tts-1") {
  const apiKey = process.env.OPENAI_API_KEY;
  const url = "https://api.openai.com/v1/audio/speech";

  const response = await axios.post(
    url,
    {
      model,
      input: text,
      voice,
      response_format: "mp3"
    },
    {
      headers: {
        "Authorization": `Bearer ${apiKey}`,
        "Content-Type": "application/json"
      },
      responseType: "arraybuffer"
    }
  );

  // Convert arraybuffer to Blob URL for playback
  const blob = new Blob([response.data as ArrayBuffer], { type: "audio/mpeg" });
  return URL.createObjectURL(blob);
}
