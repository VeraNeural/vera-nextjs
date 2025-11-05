export interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  createdAt: string;
  imageData?: string; // base64 encoded image data URL
}

export interface ChatRequest {
  message: string;
  imageData?: {
    base64: string;
    mimeType: string;
    name: string;
  };
  biometricData?: {
    heartRate?: number;
    hrv?: number;
    skinTemp?: number;
    respirationRate?: number;
  };
}

export interface ChatResponse {
  response: string;
  adaptiveCodes?: string[];
  quantumState?: string;
  isCrisis?: boolean;
}

export interface Conversation {
  id: string;
  userId: string;
  title: string;
  messages: Message[];
  createdAt: string;
  updatedAt: string;
}