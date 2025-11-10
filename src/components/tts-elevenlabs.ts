import axios from "axios";

export async function elevenlabsTTS(text: string, apiKey: string): Promise<string> {
  // ElevenLabs API endpoint for TTS
  const url = "https://api.elevenlabs.io/v1/text-to-speech";
  const voiceId = "EXAVITQu4vr4xnSDxMaL"; // Default voice, replace as needed

  const response = await axios.post(
    `${url}/${voiceId}`,
    {
      text,
      voice_settings: {
        stability: 0.5,
        similarity_boost: 0.75
      }
    },
    {
      headers: {
        "xi-api-key": apiKey,
        "Content-Type": "application/json"
      },
      responseType: "arraybuffer"
    }
  );

  // Convert arraybuffer to Blob URL for playback
  const blob = new Blob([response.data as ArrayBuffer], { type: "audio/mpeg" });
  return URL.createObjectURL(blob);
}
