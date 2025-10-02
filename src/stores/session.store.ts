import { atom } from 'jotai';
import { SessionResponse, StreamingState } from '../types/api';

// Session management atoms
export const currentSessionAtom = atom<SessionResponse | null>(null);
export const isCreatingSessionAtom = atom<boolean>(false);
export const sessionErrorAtom = atom<string | null>(null);

// WebSocket connection atoms
export const isWebSocketConnectedAtom = atom<boolean>(false);
export const webSocketErrorAtom = atom<string | null>(null);
export const reconnectAttemptsAtom = atom<number>(0);

// Session actions
export const createSessionLoadingAtom = atom<boolean>(false);

// Derived atoms
export const hasActiveSessionAtom = atom((get) => {
  const session = get(currentSessionAtom);
  return session !== null && session.isActive;
});

export const sessionModelsAtom = atom((get) => {
  const session = get(currentSessionAtom);
  return session?.selectedModels || [];
});

export const sessionIdAtom = atom((get) => {
  const session = get(currentSessionAtom);
  return session?.sessionId || null;
});

// Session reset action
export const resetSessionAtom = atom(
  null,
  (get, set) => {
    set(currentSessionAtom, null);
    set(sessionErrorAtom, null);
    set(isCreatingSessionAtom, false);
    set(streamingStateAtom, {
      modelResponses: {},
      modelStatus: {},
      completedModels: [],
      progress: { current: 0, total: 0 },
      performanceMetrics: {},
      isStreaming: false,
      totalModels: 0
    });
  }
);

// Streaming state atom
export const streamingStateAtom = atom<StreamingState>({
  modelResponses: {},
  modelStatus: {},
  completedModels: [],
  progress: { current: 0, total: 0 },
  performanceMetrics: {},
  isStreaming: false,
  totalModels: 0
});

// Streaming actions
export const initializeStreamingAtom = atom(
  null,
  (get, set, models: string[]) => {
    const initialStatus: Record<string, 'idle'> = {};
    models.forEach(model => {
      initialStatus[model] = 'idle';
    });

    set(streamingStateAtom, {
      modelResponses: {},
      modelStatus: initialStatus,
      completedModels: [],
      progress: { current: 0, total: models.length },
      performanceMetrics: {},
      isStreaming: true,
      totalModels: models.length
    });
  }
);

export const updateModelStatusAtom = atom(
  null,
  (get, set, modelId: string, status: StreamingState['modelStatus'][string]) => {
    const current = get(streamingStateAtom);
    set(streamingStateAtom, {
      ...current,
      modelStatus: {
        ...current.modelStatus,
        [modelId]: status
      }
    });
  }
);

export const appendModelResponseAtom = atom(
  null,
  (get, set, modelId: string, chunk: string) => {
    const current = get(streamingStateAtom);
    set(streamingStateAtom, {
      ...current,
      modelResponses: {
        ...current.modelResponses,
        [modelId]: (current.modelResponses[modelId] || '') + chunk
      }
    });
  }
);

export const completeModelResponseAtom = atom(
  null,
  (get, set, modelId: string, finalResponse: string, metrics: StreamingState['performanceMetrics'][string]) => {
    const current = get(streamingStateAtom);
    const newCompletedModels = [...current.completedModels, modelId];
    
    set(streamingStateAtom, {
      ...current,
      modelResponses: {
        ...current.modelResponses,
        [modelId]: finalResponse
      },
      modelStatus: {
        ...current.modelStatus,
        [modelId]: 'complete'
      },
      completedModels: newCompletedModels,
      progress: {
        ...current.progress,
        current: newCompletedModels.length
      },
      performanceMetrics: {
        ...current.performanceMetrics,
        [modelId]: metrics
      },
      isStreaming: newCompletedModels.length < current.totalModels
    });
  }
);

export const setModelErrorAtom = atom(
  null,
  (get, set, modelId: string, error: string) => {
    const current = get(streamingStateAtom);
    set(streamingStateAtom, {
      ...current,
      modelStatus: {
        ...current.modelStatus,
        [modelId]: 'error'
      },
      modelResponses: {
        ...current.modelResponses,
        [modelId]: `Error: ${error}`
      }
    });
  }
);

// WebSocket connection management
export const updateWebSocketStatusAtom = atom(
  null,
  (get, set, connected: boolean, error?: string, attempts?: number) => {
    set(isWebSocketConnectedAtom, connected);
    if (error) set(webSocketErrorAtom, error);
    if (attempts !== undefined) set(reconnectAttemptsAtom, attempts);
  }
);