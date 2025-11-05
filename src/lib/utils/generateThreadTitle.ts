// Generate a concise, emotional thread title from conversation content
export async function generateThreadTitle(
  userMessage: string,
  assistantResponse: string
): Promise<{ title: string; preview: string }> {
  try {
    // Use OpenAI to generate a contextual title
    const response = await fetch('/api/generate-title', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        userMessage,
        assistantResponse,
      }),
    });

    if (response.ok) {
      const data = await response.json();
      return data;
    }
  } catch (error) {
    console.error('Error generating thread title:', error);
  }

  // Fallback: Extract key words from user message
  return generateFallbackTitle(userMessage);
}

function generateFallbackTitle(message: string): { title: string; preview: string } {
  const lowerMessage = message.toLowerCase();
  
  // Emotional keywords mapping
  const emotionalKeywords = {
    'overwhelm': 'Feeling overwhelmed',
    'anxious': 'Managing anxiety',
    'anxiety': 'Managing anxiety',
    'panic': 'Panic response',
    'stress': 'Stress management',
    'sad': 'Processing sadness',
    'grief': 'Working through grief',
    'angry': 'Understanding anger',
    'fear': 'Exploring fear',
    'worry': 'Addressing worries',
    'trigger': 'Processing triggers',
    'flashback': 'Managing flashbacks',
    'dissociat': 'Grounding work',
    'shutdown': 'Navigating shutdown',
    'freeze': 'Understanding freeze',
    'breath': 'Breathing practice',
    'ground': 'Grounding practice',
    'journal': 'Journaling session',
    'regulat': 'Regulation practice',
    'sensation': 'Body awareness',
    'emotion': 'Emotional processing',
  };

  // Check for emotional keywords
  for (const [keyword, title] of Object.entries(emotionalKeywords)) {
    if (lowerMessage.includes(keyword)) {
      return {
        title,
        preview: message.substring(0, 60).trim() + (message.length > 60 ? '...' : ''),
      };
    }
  }

  // Default: Use first few words
  const words = message.split(' ').slice(0, 3).join(' ');
  return {
    title: words.charAt(0).toUpperCase() + words.slice(1),
    preview: message.substring(0, 60).trim() + (message.length > 60 ? '...' : ''),
  };
}
