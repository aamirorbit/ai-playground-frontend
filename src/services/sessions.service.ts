import api from './api';
import { CreateSessionRequest, SessionResponse } from '../types/api';
import { AxiosInstance } from 'axios';

export const sessionsService = {
  /**
   * Create a new comparison session with selected models
   */
  async createSession(data: CreateSessionRequest, apiClient: AxiosInstance = api): Promise<SessionResponse> {
    const response = await apiClient.post<SessionResponse>('/sessions', data);
    return response.data;
  },

  /**
   * Get session details by ID
   */
  async getSession(sessionId: string, apiClient: AxiosInstance = api): Promise<SessionResponse> {
    const response = await apiClient.get<SessionResponse>(`/sessions/${sessionId}`);
    return response.data;
  },

  /**
   * End/delete a session
   */
  async endSession(sessionId: string, apiClient: AxiosInstance = api): Promise<void> {
    await apiClient.delete(`/sessions/${sessionId}`);
  },

  /**
   * Validate session exists and is active
   */
  async validateSession(sessionId: string, apiClient: AxiosInstance = api): Promise<boolean> {
    try {
      const session = await this.getSession(sessionId, apiClient);
      return session.isActive;
    } catch (error) {
      return false;
    }
  },

  /**
   * Get session models information
   */
  async getSessionModels(sessionId: string, apiClient: AxiosInstance = api): Promise<string[]> {
    const session = await this.getSession(sessionId, apiClient);
    return session.selectedModels;
  }
};