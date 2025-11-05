# Voice Features Implementation

## Overview
Added Text-to-Speech (TTS) and Speech-to-Text (STT) functionality to VERA's chat interface using ElevenLabs API and Web Speech API.

---

## Features Implemented

### 1. Speech-to-Text (STT) - Voice Input
**Location:** Voice button (microphone icon) in InputContainer

**Functionality:**
- Click microphone button to start recording
- Browser-based speech recognition (Web Speech API)
- Real-time transcription appears in textarea
- Click again to stop recording
- Works in Chrome, Edge (browsers with Web Speech API support)

**Visual Feedback:**
- Recording: Red gradient background with pulsing animation
- Idle: Standard button style with hover effects
- Button state persists during recording

**Technical Details:**
- Uses `SpeechRecognition` / `webkitSpeechRecognition`
- Continuous recognition with interim results
- Language: English (en-US)
- Transcribed text appends to existing message

---

### 2. Text-to-Speech (TTS) - Voice Playback
**Location:** TTS button (speaker icon) in InputContainer

**Functionality:**
- Speaks VERA's last assistant message using ElevenLabs voice
- Click to play, click again to stop
- Shows loading spinner during audio generation
- Button disabled when no message available

**Visual Feedback:**
- Playing: Purple gradient background (orb colors)
- Loading: Animated spinner
- Idle: Standard button style with hover effects
- Disabled: Reduced opacity when no message

**Technical Details:**
- ElevenLabs API integration via `/api/tts` endpoint
- Model: `eleven_monolingual_v1`
- Voice settings: stability 0.5, similarity_boost 0.75
- Audio format: MP3
- Browser Audio API for playback

---

## API Endpoints

### POST `/api/tts`
**Purpose:** Generate speech audio from text using ElevenLabs

**Request:**
```json
{
  "text": "VERA's message to speak"
}
```

**Response:**
- Success: Audio/mpeg binary data
- Error: JSON with error message

**Environment Variables Required:**
- `ELEVENLABS_API_KEY` - Your ElevenLabs API key
- `ELEVENLABS_VOICE_ID` - Voice ID to use

---

## Files Modified

### 1. `src/components/chat/InputContainer.tsx`
**Changes:**
- Added `lastMessage` prop for TTS
- Added state: `isRecording`, `isPlaying`, `audioLoading`
- Added refs: `recognitionRef`, `audioRef`
- Implemented `handleVoiceInput()` for STT
- Implemented `handleTTS()` for voice playback
- Updated voice button with recording state
- Updated TTS button with playing state
- Added animations: `recordingPulse`, `spin`

### 2. `src/app/page.tsx`
**Changes:**
- Passed `lastMessage` prop to InputContainer
- Extracts last assistant message from chat history

### 3. `src/app/api/tts/route.ts` (NEW)
**Purpose:** ElevenLabs TTS API endpoint
**Features:**
- Accepts text in POST body
- Calls ElevenLabs text-to-speech API
- Returns audio stream
- Error handling with fallbacks

---

## User Experience

### Voice Input Flow:
1. User clicks microphone button
2. Browser requests microphone permission (first time)
3. Button turns red with pulsing animation
4. User speaks naturally
5. Text appears in textarea in real-time
6. User clicks button again to stop recording
7. User can edit transcribed text or send immediately

### Voice Playback Flow:
1. VERA responds with message
2. TTS button becomes active (enabled)
3. User clicks speaker button
4. Button shows loading spinner briefly
5. VERA's voice plays through speakers
6. Button shows purple gradient during playback
7. User can click to stop playback early
8. Button returns to idle state when finished

---

## Browser Compatibility

### Speech-to-Text (STT):
- ✅ Chrome (full support)
- ✅ Edge (full support)
- ✅ Safari (partial support)
- ❌ Firefox (not supported)
- Fallback: Alert message for unsupported browsers

### Text-to-Speech (TTS):
- ✅ All modern browsers (uses Audio API)
- Works with any browser that supports HTML5 audio

---

## Future Enhancements

### Suggested Improvements:
1. **Auto-play toggle** - Automatically play VERA's responses
   - Add setting in Profile > Settings tab
   - Store preference in `user_preferences` table

2. **Voice selection** - Allow users to choose different ElevenLabs voices
   - Add voice picker in settings
   - Store preference per user

3. **Playback controls** - Pause/resume, speed adjustment, volume
   - Add slider for playback speed (0.5x - 2x)
   - Volume control in settings

4. **STT language support** - Multi-language speech recognition
   - Detect user's preferred language
   - Configure recognition language dynamically

5. **Offline fallback** - Browser TTS for when API unavailable
   - Use `window.speechSynthesis` as fallback
   - Lower quality but works offline

6. **Voice messages** - Allow users to send voice notes
   - Record and save audio files
   - Transcribe and store both audio + text

---

## Testing Checklist

### STT (Voice Input):
- [ ] Microphone permission granted
- [ ] Recording starts on first click
- [ ] Text appears in textarea while speaking
- [ ] Recording stops on second click
- [ ] Transcription appends to existing text
- [ ] Works in Chrome/Edge
- [ ] Shows error message in unsupported browsers

### TTS (Voice Playback):
- [ ] Button disabled with no messages
- [ ] Button enabled after VERA responds
- [ ] Loading spinner appears during generation
- [ ] Audio plays correctly
- [ ] Button shows playing state
- [ ] Clicking again stops playback
- [ ] Audio cleans up properly
- [ ] Works across page navigations

---

## Configuration

### Environment Variables (.env.local):
```env
ELEVENLABS_API_KEY=your_api_key_here
ELEVENLABS_VOICE_ID=your_voice_id_here
```

### ElevenLabs Voice Settings:
```typescript
voice_settings: {
  stability: 0.5,        // 0-1, lower = more expressive
  similarity_boost: 0.75 // 0-1, higher = more similar to original
}
```

---

## Troubleshooting

### Issue: "Speech recognition not supported"
**Solution:** Use Chrome or Edge browser

### Issue: TTS button not working
**Check:**
1. ELEVENLABS_API_KEY is set in .env.local
2. ELEVENLABS_VOICE_ID is correct
3. Check browser console for API errors
4. Verify ElevenLabs account has credits

### Issue: Audio not playing
**Check:**
1. Browser audio permissions
2. System volume not muted
3. Browser console for playback errors

### Issue: Recording stops immediately
**Check:**
1. Microphone permissions granted
2. Microphone connected and working
3. Browser console for recognition errors

---

## Security Considerations

1. **API Key Protection:** 
   - Never expose ELEVENLABS_API_KEY in client code
   - All API calls go through server-side route handler

2. **Audio Data:**
   - Audio blobs cleaned up after playback
   - URL.revokeObjectURL() prevents memory leaks

3. **User Privacy:**
   - Speech recognition happens locally in browser
   - Only transcribed text sent to server
   - No audio recordings stored

---

## Performance Notes

- **TTS latency:** ~1-3 seconds for typical VERA responses
- **Audio size:** ~50KB per 100 words (MP3)
- **Memory usage:** Audio blobs released after playback
- **Network:** Streaming not yet implemented (loads full audio first)

---

## Development Status

✅ **Completed:**
- STT with Web Speech API
- TTS with ElevenLabs integration
- Visual feedback for both features
- Error handling and fallbacks
- Browser compatibility checks
- Audio cleanup and memory management

⚠️ **Known Limitations:**
- No audio streaming (buffers entire file)
- Single voice only
- No playback controls (pause/resume)
- No auto-play option yet

🔮 **Future Additions:**
- User voice preferences in settings
- Auto-play toggle
- Multiple voice options
- Playback speed/volume controls
