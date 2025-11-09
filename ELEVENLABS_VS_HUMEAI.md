# ElevenLabs vs Hume AI - TTS Comparison

You have **both** configured. Here's the breakdown:

---

## 📊 Quick Comparison

| Feature | ElevenLabs | Hume AI |
|---------|-----------|---------|
| **Voice Quality** | High-quality, natural | Expressive, emotional |
| **Best For** | Professional, consistent | Therapeutic, empathetic |
| **Latency** | ~500ms-1s | ~1-2s (streaming available) |
| **Cost** | $5/1M characters | $0.15-0.30 per 1M tokens |
| **Emotional Range** | Limited | **Expressive Speech (BETA)** |
| **Nervousness Tuning** | No | Yes (VERA specific!) |
| **Voice Cloning** | Yes (premium) | Limited |
| **Real-time** | Possible | Yes (streaming) |
| **Integration Complexity** | Simple REST API | Moderate (client SDK) |

---

## 🎯 ElevenLabs (Current)

**Status**: ✅ Configured

```
ELEVENLABS_API_KEY=sk_3c556a6f501cee6fb67d6913ed399d39cf46cc9ffd897e17
ELEVENLABS_VOICE_ID=ROMJ9yK1NAMuu1ggrjDW
```

### Strengths:
- **Fastest**: Low latency (~500ms)
- **Most Natural**: Sounds human-like across accents
- **Best for broadcasting**: Consistent quality
- **Easy to integrate**: Simple REST endpoint
- **Cost-effective at scale**: Cheap per 1M characters

### Weaknesses:
- Limited emotional expressiveness
- Can't adjust "tone" dynamically
- Fixed voice characteristics (can't make it sound nervous, compassionate, etc.)
- Not designed for therapeutic applications

### Use Case:
```
User: "Read this article"
ElevenLabs: Reads it perfectly, naturally, professionally
```

### Code Integration:
```typescript
const response = await fetch('https://api.elevenlabs.io/v1/text-to-speech/{voice_id}', {
  method: 'POST',
  headers: {
    'xi-api-key': process.env.ELEVENLABS_API_KEY,
  },
  body: JSON.stringify({
    text: message,
    model_id: 'eleven_monolingual_v1',
    voice_settings: {
      stability: 0.5,
      similarity_boost: 0.75,
    },
  }),
});
```

---

## 🧠 Hume AI (New)

**Status**: ✅ Configured

```
HUMEAI_API_KEY=RkpH20flgrFb2cAFTgYq09SjPqVGTWyHA125nMH8L3Ay8pvv
HUMEAI_SECRET_KEY=2r6NeMwp8MAe92GxKCcwp2FhWOaiTzPQbhc3uPAVnf8pZKaZO1YM8xPXrOnwkD8M
HUMEAI_VOICE_ID=5bb7de05-c8fe-426a-8fcc-ba4fc4ce9f9c
```

### Strengths:
- **Expressive Speech (BETA)**: Can make voice sound nervous, calm, compassionate, energetic
- **Perfect for VERA**: Designed for emotional intelligence and empathy
- **Streaming support**: Real-time voice generation
- **Emotion controls**: Adjust emotional tone dynamically
- **EVI (Empathic Voice Interface)**: Next-gen conversational AI voice
- **Biometric feedback integration**: Can use heart rate, voice analysis for adaptation

### Weaknesses:
- Slightly higher latency (~1-2s)
- More expensive than ElevenLabs
- Newer service (less battle-tested)
- Requires more complex integration
- BETA features may change

### Use Case (VERA-specific):
```
User: "I'm having a panic attack"
Hume AI: Responds with CALM, COMPASSIONATE tone
         Voice sounds slower, more supportive, grounded

vs

ElevenLabs: Same words, neutral/professional tone
```

### Key Hume AI Features:
1. **Expressive Speech Controls**:
   - Nervousness (0-100%)
   - Confidence (0-100%)
   - Sentiment (negative to positive)
   - Urgency (low to high)

2. **EVI (Empathic Voice Interface)**:
   - Two-way conversation (voice in, voice out)
   - Real-time emotion detection
   - Adaptive responses

3. **Biometric Integration**:
   - Accepts heart rate, HRV, skin conductance
   - Adjusts tone based on user's physiological state
   - VERA-aligned nervous system awareness

---

## 🎤 Recommendation for VERA

### **Use Hume AI for VERA's core voice** because:

1. **Therapeutic context**: VERA is a nervous system companion, not a content reader
2. **Emotional adaptation**: Can adjust tone based on user state
3. **Authenticity**: Matches VERA's identity (empathetic, adaptive, real)
4. **Biometric integration**: Perfect for VERA's nervous system focus
5. **Expressive capabilities**: Can sound genuinely supportive vs. robotic

### **Keep ElevenLabs as fallback** for:
- Reading articles/content (professional)
- Backup if Hume AI is slow
- Cost savings on high-volume reads

---

## 📋 Implementation Strategy

### Option 1: Hume AI Primary (Recommended)
```typescript
// Try Hume AI first (emotional, therapeutic)
if (isTherapeuticMode || hasEmotionalContent) {
  response = await humeAI.generateSpeech(message, {
    expressiveness: calculateExpressiveness(userState),
    emotion: detectNeededEmotion(message),
  });
}

// Fallback to ElevenLabs (professional, fast)
else {
  response = await elevenLabs.generateSpeech(message);
}
```

### Option 2: Hybrid (Best of Both)
```typescript
// Quick response: ElevenLabs (fast)
// Deep conversation: Hume AI (expressive)
if (messageCount < 3 || isPractical) {
  return elevenLabs(); // Fast, professional
} else {
  return humeAI(); // Expressive, therapeutic
}
```

### Option 3: Hume AI Streaming (Advanced)
```typescript
// Use Hume AI's streaming for real-time voice
const stream = await humeAI.streamSpeech(message, {
  voice_id: process.env.HUMEAI_VOICE_ID,
  expressiveness: {
    nervousness: 20, // Calm
    confidence: 85,  // Assured
    sentiment: 70,   // Positive
  },
});

// Stream directly to user
response.pipe(stream);
```

---

## 🚀 Next Steps

### To implement Hume AI:

1. **Create `/api/tts-hume` endpoint**:
   ```typescript
   // src/app/api/tts-hume/route.ts
   import { HumeClient } from 'hume';
   
   export async function POST(req: Request) {
     const { message, expressiveness } = await req.json();
     
     const hume = new HumeClient({
       apiKey: process.env.HUMEAI_API_KEY,
     });
     
     const response = await hume.expressiveText.audioV1({
       text: message,
       voice: {
         id: process.env.HUMEAI_VOICE_ID,
       },
       expressiveness_values: expressiveness || {
         nervousness: 0,
         confidence: 75,
         sentiment: 70,
         urgency: 20,
       },
     });
     
     return new Response(response.audioStream);
   }
   ```

2. **Update chat component to use Hume for therapeutic content**

3. **Test expressiveness controls with different user states**

4. **Monitor cost vs. quality trade-off**

---

## 💰 Cost Comparison (Example)

**Scenario**: VERA user sends 10 messages/day, 500 users

### ElevenLabs:
- Avg 200 chars per message × 10 × 500 = 1M chars/day
- Cost: $5/M = **$5/day** ($150/month)

### Hume AI:
- Avg 200 chars per message × 10 × 500 = 1M chars/day
- Cost: $0.30/M tokens ≈ **$6/day** ($180/month)
- Plus EVI features if needed

**Difference**: ~$30/month for emotional expressiveness

---

## ✅ Your Setup

You're all set:
- ✅ ElevenLabs configured and working
- ✅ Hume AI keys added
- ✅ Hume AI Voice ID ready
- ⏳ Just need to create the integration endpoint

**Suggestion**: Start with Hume AI for therapeutic/support messages, keep ElevenLabs for other content.

Would you like me to create the Hume AI integration endpoint?
