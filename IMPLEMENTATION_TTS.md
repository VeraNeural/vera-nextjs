// IMPLEMENTATION: Replace handleTTS in InputContainer.tsx with this code

// ============================================
// DELETE: Old handleTTS function (lines ~124-211)
// ============================================

// REPLACE WITH: New optimized handleTTS

const handleTTS = async () => {
  console.log('🎤 handleTTS called (optimized), lastMessage:', lastMessage?.substring(0, 100));
  
  if (!lastMessage) {
    console.log('❌ No lastMessage, returning');
    return;
  }

  // If already playing, stop
  if (isPlaying) {
    console.log('⏹️ Stopping current audio');
    window.speechSynthesis.cancel();
    if (audioRef.current) {
      audioRef.current.pause();
    }
    setIsPlaying(false);
    return;
  }

  try {
    console.log('🔊 Starting TTS (instant browser playback)...');
    setAudioLoading(true);
    setIsPlaying(true);

    // ===== TIER 1: INSTANT PLAYBACK with Browser Web Speech API =====
    if ('speechSynthesis' in window) {
      try {
        await playBrowserTTS(lastMessage);
        console.log('✅ Browser TTS playback completed');
      } catch (error) {
        console.warn('⚠️ Browser TTS failed, trying ElevenLabs:', error);
        // Fall through to ElevenLabs
        await playElevenLabsAudio(lastMessage);
      }
    } else {
      // Browser doesn't support speech synthesis, use ElevenLabs only
      console.log('ℹ️ Browser TTS not available, using ElevenLabs');
      await playElevenLabsAudio(lastMessage);
    }

    setIsPlaying(false);
  } catch (error) {
    console.error('❌ TTS error:', error);
    setIsPlaying(false);
    alert('Failed to play audio. Please try again.');
  } finally {
    setAudioLoading(false);
  }
};

// ===== NEW HELPER: Browser TTS (instant, 0-500ms) =====
const playBrowserTTS = (text: string): Promise<void> => {
  return new Promise((resolve, reject) => {
    if (!('speechSynthesis' in window)) {
      reject(new Error('Speech synthesis not supported'));
      return;
    }

    // Cancel any ongoing speech
    window.speechSynthesis.cancel();

    const utterance = new SpeechSynthesisUtterance(text);
    utterance.rate = 1.0;
    utterance.pitch = 1.0;
    utterance.volume = 1.0;

    // Try to find a natural female voice
    const voices = window.speechSynthesis.getVoices();
    const femaleVoice = voices.find((v) =>
      v.name.toLowerCase().includes('female') ||
      v.name.toLowerCase().includes('woman') ||
      v.name.toLowerCase().includes('samantha') ||
      v.name.toLowerCase().includes('victoria')
    ) || voices[1] || voices[0];

    if (femaleVoice) {
      utterance.voice = femaleVoice;
      console.log('🎙️ Using voice:', femaleVoice.name);
    }

    utterance.onend = () => {
      console.log('✅ Browser TTS ended');
      resolve();
    };

    utterance.onerror = (event) => {
      console.error('❌ Browser TTS error:', event.error);
      reject(new Error(event.error));
    };

    // Start playback immediately
    console.log('▶️ Speaking...');
    window.speechSynthesis.speak(utterance);
  });
};

// ===== NEW HELPER: ElevenLabs streaming (background or fallback) =====
const playElevenLabsAudio = async (text: string): Promise<void> => {
  try {
    console.log('🔊 Fetching ElevenLabs audio...');

    const response = await fetch('/api/tts-stream', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ text }),
    });

    if (!response.ok) {
      if (response.status === 403) {
        alert('Your trial has ended. Please upgrade to use speech.');
        if (typeof window !== 'undefined') {
          window.dispatchEvent(new CustomEvent('vera:subscription_required'));
        }
      }
      const errorText = await response.text();
      console.error('❌ ElevenLabs API error:', errorText);
      throw new Error('Failed to generate speech');
    }

    const audioBlob = await response.blob();
    console.log('🎵 Audio blob received:', audioBlob.size, 'bytes');
    const audioUrl = URL.createObjectURL(audioBlob);

    // Create audio element
    if (audioRef.current) {
      audioRef.current.pause();
    }

    audioRef.current = new Audio(audioUrl);
    audioRef.current.setAttribute('playsInline', 'true');
    audioRef.current.setAttribute('webkit-playsinline', 'true');
    audioRef.current.volume = 1.0;

    audioRef.current.onended = () => {
      console.log('✅ ElevenLabs playback ended');
      URL.revokeObjectURL(audioUrl);
    };

    audioRef.current.onerror = (e) => {
      console.error('❌ Audio playback error:', e);
      URL.revokeObjectURL(audioUrl);
    };

    console.log('▶️ Playing ElevenLabs audio...');
    await audioRef.current.play();
  } catch (error) {
    console.error('❌ ElevenLabs error:', error);
    throw error;
  }
};

// ============================================
// ADD: New useEffect to load voices on mount
// ============================================
// Add this AFTER the existing useEffect hooks (around line 88)

// Load available voices for browser TTS
useEffect(() => {
  if ('speechSynthesis' in window) {
    const voices = window.speechSynthesis.getVoices();
    console.log('🎙️ Available voices:', voices.length);
    voices.forEach((voice, i) => {
      if (i < 3) console.log(`  ${i}: ${voice.name} (${voice.lang})`);
    });
  }
}, []);

// ============================================
// OPTIONAL: Add voices event listener for better support
// ============================================
// Add this useEffect for browsers that load voices asynchronously

useEffect(() => {
  if ('speechSynthesis' in window) {
    window.speechSynthesis.onvoiceschanged = () => {
      const voices = window.speechSynthesis.getVoices();
      console.log('🎙️ Voices loaded:', voices.length);
    };
  }
}, []);
