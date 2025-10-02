// TypeScript interfaces for API responses and requests

export interface AIModel {
  id: string;
  name: string;
  provider: string;
  description: string;
  contextWindow: number;
  costPer1kTokens: number;
  capabilities: string[];
}

export interface GroupedModels {
  [provider: string]: AIModel[];
}

export interface ModelCapabilities {
  [capability: string]: string[];
}

export interface ModelStats {
  totalModels: number;
  totalProviders: number;
  averageCost: number;
  costRange: {
    min: number;
    max: number;
  };
  contextWindowRange: {
    min: number;
    max: number;
  };
  byProvider: Array<{
    provider: string;
    modelCount: number;
    avgCost: number;
  }>;
}

export interface CreateSessionRequest {
  selectedModels: string[];
}

export interface SessionResponse {
  sessionId: string;
  selectedModels: string[];
  isActive: boolean;
  createdAt: string;
}

export interface SubmitPromptRequest {
  prompt: string;
}

export interface TokenUsage {
  prompt_tokens: number;
  completion_tokens: number;
  total_tokens: number;
}

export interface ModelResponse {
  response?: string;
  error?: string;
  tokens?: TokenUsage;
  timeTakenMs: number;
  costEstimateUsd: number;
}

export interface PromptComparisonResponse {
  sessionId: string;
  prompt: string;
  results: Record<string, ModelResponse>;
  createdAt: string;
}

// WebSocket event types
export interface WebSocketPromptReceived {
  sessionId: string;
  prompt: string;
  submittedBy: string;
  timestamp: string;
}

export interface WebSocketModelTyping {
  model: string;
  isTyping: boolean;
  timestamp: string;
}

export interface WebSocketModelStream {
  model: string;
  chunk: string;
  progress: { current: number; total: number };
  timestamp: string;
}

export interface WebSocketModelComplete {
  model: string;
  finalResponse: string;
  tokens: TokenUsage;
  timeTakenMs: number;
  costEstimateUsd: number;
  timestamp: string;
}

export interface WebSocketComparisonComplete {
  sessionId: string;
  prompt: string;
  results: Record<string, ModelResponse>;
  createdAt: string;
  allModelsComplete: boolean;
  streamingComplete: boolean;
}

export interface WebSocketError {
  error: string;
  sessionId?: string;
  model?: string;
  timestamp: string;
}

// Streaming state types
export interface StreamingState {
  modelResponses: Record<string, string>;
  modelStatus: Record<string, 'idle' | 'typing' | 'streaming' | 'complete' | 'error'>;
  completedModels: string[];
  progress: { current: number; total: number };
  performanceMetrics: Record<string, { 
    chars: number; 
    duration: number; 
    charsPerSec: number;
    tokens?: TokenUsage;
    cost?: number;
  }>;
  isStreaming: boolean;
  totalModels: number;
}

// UI State types
export interface HistoryItem extends PromptComparisonResponse {
  id: string;
}

export interface SessionState {
  currentSession: SessionResponse | null;
  isCreatingSession: boolean;
  selectedModels: string[];
}