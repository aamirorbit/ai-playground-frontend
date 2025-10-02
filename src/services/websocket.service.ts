import io from 'socket.io-client';
import type { Socket } from 'socket.io-client';
import { 
  WebSocketPromptReceived,
  WebSocketModelTyping,
  WebSocketModelStream,
  WebSocketModelComplete,
  WebSocketComparisonComplete,
  WebSocketError
} from '../types/api';

export class WebSocketService {
  private socket: Socket | null = null;
  private reconnectAttempts = 0;
  private maxReconnectAttempts = 5;
  private reconnectDelay = 1000; // Start with 1 second

  /**
   * Connect to WebSocket server
   */
  connect(): Socket {
    if (this.socket?.connected) {
      return this.socket;
    }

    const wsUrl = process.env.NEXT_PUBLIC_WS_URL || 'http://localhost:3000';
    
    this.socket = io(wsUrl, {
      transports: ['websocket', 'polling'],
      autoConnect: true,
      reconnection: true,
      reconnectionDelay: this.reconnectDelay,
      reconnectionAttempts: this.maxReconnectAttempts,
    });

    this.setupConnectionHandlers();
    
    return this.socket;
  }

  /**
   * Set up connection event handlers
   */
  private setupConnectionHandlers(): void {
    if (!this.socket) return;

    this.socket.on('connect', () => {
      console.log('✅ WebSocket connected');
      this.reconnectAttempts = 0;
      this.reconnectDelay = 1000; // Reset delay
    });

    this.socket.on('disconnect', (reason: string) => {
      console.log('❌ WebSocket disconnected:', reason);
    });

    this.socket.on('connect_error', (error: Error) => {
      console.error('🔌 WebSocket connection error:', error);
      this.reconnectAttempts++;
      this.reconnectDelay = Math.min(this.reconnectDelay * 2, 30000); // Max 30 seconds
    });

    this.socket.on('reconnect', (attemptNumber: number) => {
      console.log(`🔄 WebSocket reconnected after ${attemptNumber} attempts`);
    });

    this.socket.on('reconnect_failed', () => {
      console.error('❌ WebSocket reconnection failed after maximum attempts');
    });
  }

  /**
   * Join a session room for real-time updates
   */
  joinSession(sessionId: string): void {
    if (this.socket?.connected) {
      console.log(`🏠 Joining session: ${sessionId}`);
      this.socket.emit('join_session', { sessionId });
    } else {
      console.warn('WebSocket not connected. Cannot join session.');
    }
  }

  /**
   * Submit prompt via WebSocket for real-time streaming
   */
  submitPrompt(sessionId: string, prompt: string): void {
    if (this.socket?.connected) {
      console.log(`📨 Submitting prompt via WebSocket to session: ${sessionId}`);
      this.socket.emit('submit_prompt', { sessionId, prompt });
    } else {
      throw new Error('WebSocket not connected. Cannot submit prompt.');
    }
  }

  /**
   * Listen for prompt acknowledgment
   */
  onPromptReceived(callback: (data: WebSocketPromptReceived) => void): void {
    this.socket?.on('prompt_received', callback);
  }

  /**
   * Listen for model typing indicators
   */
  onModelTyping(callback: (data: WebSocketModelTyping) => void): void {
    this.socket?.on('model_typing', callback);
  }

  /**
   * Listen for real-time character streaming
   */
  onModelStream(callback: (data: WebSocketModelStream) => void): void {
    this.socket?.on('model_stream', callback);
  }

  /**
   * Listen for individual model completion
   */
  onModelComplete(callback: (data: WebSocketModelComplete) => void): void {
    this.socket?.on('model_complete', callback);
  }

  /**
   * Listen for all models completion
   */
  onComparisonComplete(callback: (data: WebSocketComparisonComplete) => void): void {
    this.socket?.on('comparison_complete', callback);
  }

  /**
   * Listen for WebSocket errors
   */
  onError(callback: (error: WebSocketError) => void): void {
    this.socket?.on('prompt_error', callback);
  }

  /**
   * Remove all event listeners
   */
  removeAllListeners(): void {
    if (this.socket) {
      this.socket.removeAllListeners('prompt_received');
      this.socket.removeAllListeners('model_typing');
      this.socket.removeAllListeners('model_stream');
      this.socket.removeAllListeners('model_complete');
      this.socket.removeAllListeners('comparison_complete');
      this.socket.removeAllListeners('prompt_error');
    }
  }

  /**
   * Disconnect WebSocket
   */
  disconnect(): void {
    if (this.socket) {
      console.log('🔌 Disconnecting WebSocket');
      this.socket.disconnect();
      this.socket = null;
    }
  }

  /**
   * Check if WebSocket is connected
   */
  isConnected(): boolean {
    return this.socket?.connected || false;
  }

  /**
   * Get connection status
   */
  getConnectionStatus(): {
    connected: boolean;
    reconnectAttempts: number;
    id?: string;
  } {
    return {
      connected: this.isConnected(),
      reconnectAttempts: this.reconnectAttempts,
      id: this.socket?.id
    };
  }
}

// Export singleton instance
export const webSocketService = new WebSocketService();