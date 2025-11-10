import axios from "axios";

export async function elevenlabsTTS(text: string, apiKey: string, voiceId: string): Promise<string> {
  // ElevenLabs API endpoint for TTS
  const url = "https://api.elevenlabs.io/v1/text-to-speech";
  try {
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

    // Check if response is valid audio
    const audioBuffer = response.data as ArrayBuffer;
    // Heuristic: if audio is too small, log raw response
    if (audioBuffer.byteLength < 10000) {
      // Try to decode as text for error message
      const decoder = new TextDecoder();
      const errorText = decoder.decode(audioBuffer);
      console.error('❌ ElevenLabs API returned non-audio response:', errorText);
      throw new Error('ElevenLabs API error: ' + errorText);
    }

    // Convert arraybuffer to Blob URL for playback
    const blob = new Blob([audioBuffer], { type: "audio/mpeg" });
    return URL.createObjectURL(blob);
  } catch (err: any) {
    // Log error and rethrow for UI display
    console.error('❌ ElevenLabs TTS request failed:', err?.message || err);
    throw err;
  }
}
