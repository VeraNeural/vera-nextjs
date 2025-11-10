/**
 * VOICE ANALYSIS v5.0 - ElevenLabs Enhanced
 * 
 * Analyzes vocal biomarkers for nervous system state detection:
 * - Tone (pitch, frequency)
 * - Prosody (rhythm, stress patterns)
 * - Speech rate (pace, pauses)
 * - Vocal quality (breathiness, tension)
 * - Emotional resonance
 * 
 * Integrates with ElevenLabs for voice synthesis and analysis.
 * 
 * @author VeraNeural
 * @date 2025-11-08
 */

export interface VoiceAnalysis {
  // Core vocal metrics
  pitch: {
    average: number; // Hz
    variance: number;
    range: [number, number];
  };
  
  // Speech characteristics
  speechRate: {
    wordsPerMinute: number;
    syllablesPerSecond: number;
    pauseFrequency: number; // pauses per minute
    averagePauseLength: number; // seconds
  };
  
  // Prosody (rhythm and intonation)
  prosody: {
    intonationVariance: number; // 0-100
    stressPatterns: 'flat' | 'varied' | 'erratic';
    rhythmRegularity: number; // 0-100
  };
  
  // Vocal quality
  quality: {
    breathiness: number; // 0-100
    tension: number; // 0-100 (jaw/throat tension)
    clarity: number; // 0-100
    volume: number; // dB
  };
  
  // Emotional markers
  emotional: {
    arousal: number; // 0-100 (activation level)
    valence: number; // -100 to 100 (negative to positive)
    dominantEmotion: string;
  };
  
  // Nervous system inference
  nervousSystemState: {
    primary: 'ventral' | 'sympathetic' | 'dorsal';
    confidence: number;
    indicators: string[];
  };
}

export interface VocalBiomarkers {
  // Sympathetic (Fight/Flight) indicators
  sympatheticMarkers: {
    rapidSpeech: boolean;
    pitchElevation: boolean;
    breathlessness: boolean;
    voiceShaking: boolean;
    intensity: number; // 0-100
  };
  
  // Dorsal (Shutdown/Freeze) indicators
  dorsalMarkers: {
    slowSpeech: boolean;
    monotone: boolean;
    lowVolume: boolean;
    flatAffect: boolean;
    intensity: number; // 0-100
  };
  
  // Ventral (Safe & Social) indicators
  ventralMarkers: {
    variedProsody: boolean;
    naturalPacing: boolean;
    clearArticulation: boolean;
    warmth: boolean;
    intensity: number; // 0-100
  };
}

/**
 * Analyze voice data for nervous system state
 */
export function analyzeVoiceForNervousSystem(
  audioBuffer: ArrayBuffer,
  transcript?: string
): VoiceAnalysis {
  // In production, you'd use Web Audio API or a service like AssemblyAI
  // This is a conceptual implementation
  
  const analysis = extractVoiceFeatures(audioBuffer);
  const biomarkers = detectVocalBiomarkers(analysis);
  const nervousSystemState = inferNervousSystemState(biomarkers);
  
  return {
    pitch: analysis.pitch,
    speechRate: analysis.speechRate,
    prosody: analysis.prosody,
    quality: analysis.quality,
    emotional: analysis.emotional,
    nervousSystemState,
  };
}

/**
 * Extract voice features from audio
 */
function extractVoiceFeatures(audioBuffer: ArrayBuffer): any {
  // Simplified - in production use Web Audio API or external service
  return {
    pitch: {
      average: 150, // Hz - would calculate from FFT
      variance: 20,
      range: [120, 200] as [number, number],
    },
    speechRate: {
      wordsPerMinute: 140,
      syllablesPerSecond: 4.2,
      pauseFrequency: 8,
      averagePauseLength: 0.6,
    },
    prosody: {
      intonationVariance: 45,
      stressPatterns: 'varied' as const,
      rhythmRegularity: 65,
    },
    quality: {
      breathiness: 30,
      tension: 60,
      clarity: 75,
      volume: 65,
    },
    emotional: {
      arousal: 70,
      valence: -20,
      dominantEmotion: 'anxiety',
    },
  };
}

/**
 * Detect vocal biomarkers for each nervous system state
 */
function detectVocalBiomarkers(analysis: any): VocalBiomarkers {
  const sympatheticMarkers = {
    rapidSpeech: analysis.speechRate.wordsPerMinute > 160,
    pitchElevation: analysis.pitch.average > 200,
    breathlessness: analysis.quality.breathiness > 60,
    voiceShaking: analysis.pitch.variance > 30,
    intensity: 0,
  };
  sympatheticMarkers.intensity = 
    [sympatheticMarkers.rapidSpeech, sympatheticMarkers.pitchElevation, 
     sympatheticMarkers.breathlessness, sympatheticMarkers.voiceShaking]
    .filter(Boolean).length * 25;

  const dorsalMarkers = {
    slowSpeech: analysis.speechRate.wordsPerMinute < 100,
    monotone: analysis.prosody.intonationVariance < 20,
    lowVolume: analysis.quality.volume < 40,
    flatAffect: analysis.prosody.stressPatterns === 'flat',
    intensity: 0,
  };
  dorsalMarkers.intensity = 
    [dorsalMarkers.slowSpeech, dorsalMarkers.monotone, 
     dorsalMarkers.lowVolume, dorsalMarkers.flatAffect]
    .filter(Boolean).length * 25;

  const ventralMarkers = {
    variedProsody: analysis.prosody.intonationVariance > 40,
    naturalPacing: analysis.speechRate.wordsPerMinute >= 120 && 
                   analysis.speechRate.wordsPerMinute <= 160,
    clearArticulation: analysis.quality.clarity > 70,
    warmth: analysis.emotional.valence > 0,
    intensity: 0,
  };
  ventralMarkers.intensity = 
    [ventralMarkers.variedProsody, ventralMarkers.naturalPacing, 
     ventralMarkers.clearArticulation, ventralMarkers.warmth]
    .filter(Boolean).length * 25;

  return { sympatheticMarkers, dorsalMarkers, ventralMarkers };
}

/**
 * Infer nervous system state from vocal biomarkers
 */
function inferNervousSystemState(biomarkers: VocalBiomarkers): any {
  const { sympatheticMarkers, dorsalMarkers, ventralMarkers } = biomarkers;
  
  const indicators: string[] = [];
  let primary: 'ventral' | 'sympathetic' | 'dorsal';
  let confidence: number;

  if (sympatheticMarkers.intensity > dorsalMarkers.intensity && 
      sympatheticMarkers.intensity > ventralMarkers.intensity) {
    primary = 'sympathetic';
    confidence = sympatheticMarkers.intensity;
    if (sympatheticMarkers.rapidSpeech) indicators.push('Rapid, rushed speech');
    if (sympatheticMarkers.pitchElevation) indicators.push('High-pitched, strained voice');
    if (sympatheticMarkers.breathlessness) indicators.push('Breathless quality');
  } else if (dorsalMarkers.intensity > ventralMarkers.intensity) {
    primary = 'dorsal';
    confidence = dorsalMarkers.intensity;
    if (dorsalMarkers.slowSpeech) indicators.push('Slow, labored speech');
    if (dorsalMarkers.monotone) indicators.push('Flat, monotone delivery');
    if (dorsalMarkers.lowVolume) indicators.push('Quiet, withdrawn voice');
  } else {
    primary = 'ventral';
    confidence = ventralMarkers.intensity;
    if (ventralMarkers.variedProsody) indicators.push('Natural prosody variation');
    if (ventralMarkers.naturalPacing) indicators.push('Balanced speech rate');
  }

  return { primary, confidence, indicators };
}

/**
 * Enhanced VERA response with voice-aware co-regulation
 */
export async function generateVoiceAwareResponse(
  textResponse: string,
  detectedNervousSystemState: 'ventral' | 'sympathetic' | 'dorsal',
  elevenLabsApiKey: string
): Promise<{ audioUrl: string; voiceSettings: any }> {
  // Adjust VERA's voice characteristics based on user's nervous system state
  let voiceSettings = {
    stability: 0.75,
    similarity_boost: 0.75,
    style: 0.5,
    use_speaker_boost: true,
  };

  // Co-regulation through voice modulation
  if (detectedNervousSystemState === 'sympathetic') {
    // User is activated → VERA uses slower, calmer voice
    voiceSettings = {
      stability: 0.85, // More stable/calm
      similarity_boost: 0.65,
      style: 0.3, // Less expressive to ground
      use_speaker_boost: true,
    };
  } else if (detectedNervousSystemState === 'dorsal') {
    // User is shutdown → VERA uses warmer, more animated voice
    voiceSettings = {
      stability: 0.65,
      similarity_boost: 0.75,
      style: 0.7, // More expressive to energize
      use_speaker_boost: true,
    };
  }

  // Call ElevenLabs API
  const ttsStart = Date.now();
  const response = await fetch('https://api.elevenlabs.io/v1/text-to-speech/YOUR_VOICE_ID', {
    method: 'POST',
    headers: {
      'Accept': 'audio/mpeg',
      'Content-Type': 'application/json',
      'xi-api-key': elevenLabsApiKey,
    },
    body: JSON.stringify({
      text: textResponse,
      model_id: 'eleven_monolingual_v1',
      voice_settings: voiceSettings,
    }),
  });
  const ttsEnd = Date.now();
  console.log(`[VERA TTS] ElevenLabs API call took ${((ttsEnd-ttsStart)/1000).toFixed(2)} seconds`);

  const blobStart = Date.now();
  const audioBlob = await response.blob();
  const blobEnd = Date.now();
  console.log(`[VERA TTS] response.blob() took ${((blobEnd-blobStart)/1000).toFixed(2)} seconds`);

  const audioUrl = URL.createObjectURL(audioBlob);
  return { audioUrl, voiceSettings };
}

/**
 * Real-time voice analysis during conversation
 */
export class VoiceStreamAnalyzer {
  private audioContext: AudioContext;
  private analyser: AnalyserNode;
  private dataArray: Uint8Array;
  
  constructor() {
    this.audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
    this.analyser = this.audioContext.createAnalyser();
    this.analyser.fftSize = 2048;
    this.dataArray = new Uint8Array(this.analyser.frequencyBinCount);
  }

  async startAnalysis(stream: MediaStream): Promise<void> {
    const source = this.audioContext.createMediaStreamSource(stream);
    source.connect(this.analyser);
    
    // Begin real-time analysis loop
    this.analyze();
  }

  private analyze(): void {
    requestAnimationFrame(() => this.analyze());
    
    this.analyser.getByteFrequencyData(this.dataArray as any);
    
    // Calculate pitch
    const pitch = this.detectPitch(this.dataArray);
    
    // Calculate volume
    const volume = this.calculateVolume(this.dataArray);
    
    // Emit analysis results
    this.emit('analysis', { pitch, volume, timestamp: Date.now() });
  }

  private detectPitch(frequencyData: Uint8Array): number {
    // Simplified pitch detection - in production use autocorrelation or YIN algorithm
    let maxValue = 0;
    let maxIndex = 0;
    
    for (let i = 0; i < frequencyData.length; i++) {
      if (frequencyData[i] > maxValue) {
        maxValue = frequencyData[i];
        maxIndex = i;
      }
    }
    
    const nyquist = this.audioContext.sampleRate / 2;
    const frequency = (maxIndex * nyquist) / frequencyData.length;
    
    return frequency;
  }

  private calculateVolume(frequencyData: Uint8Array): number {
    const sum = frequencyData.reduce((a, b) => a + b, 0);
    return (sum / frequencyData.length) / 255 * 100;
  }

  private emit(event: string, data: any): void {
    // Custom event emitter - in production use EventEmitter or similar
    console.log(`[VoiceStreamAnalyzer] ${event}:`, data);
  }

  stop(): void {
    this.audioContext.close();
  }
}