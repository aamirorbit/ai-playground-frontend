import api from './api';
import { SubmitPromptRequest, PromptComparisonResponse } from '../types/api';
import { AxiosInstance } from 'axios';

export const promptsService = {
  /**
   * Submit a prompt for comparison across selected models
   * Note: This is the HTTP fallback. WebSocket streaming is preferred for real-time responses.
   */
  async submitPrompt(sessionId: string, data: SubmitPromptRequest, apiClient: AxiosInstance = api): Promise<PromptComparisonResponse> {
    const response = await apiClient.post<PromptComparisonResponse>(`/prompts/${sessionId}`, data);
    return response.data;
  },

  /**
   * Get recent comparison history (last 10)
   */
  async getHistory(apiClient: AxiosInstance = api): Promise<PromptComparisonResponse[]> {
    const response = await apiClient.get<PromptComparisonResponse[]>('/prompts/history');
    return response.data;
  },

  /**
   * Get comparison history for a specific session
   */
  async getSessionHistory(sessionId: string, apiClient: AxiosInstance = api): Promise<PromptComparisonResponse[]> {
    const response = await apiClient.get<PromptComparisonResponse[]>(`/prompts/sessions/${sessionId}/history`);
    return response.data;
  },

  /**
   * Search history by prompt text
   */
  async searchHistory(query: string, apiClient: AxiosInstance = api): Promise<PromptComparisonResponse[]> {
    const history = await this.getHistory(apiClient);
    return history.filter(item => 
      item.prompt.toLowerCase().includes(query.toLowerCase()) ||
      Object.values(item.results).some(result => 
        result.response?.toLowerCase().includes(query.toLowerCase())
      )
    );
  },

  /**
   * Get comparison statistics
   */
  async getComparisonStats(sessionId?: string, apiClient: AxiosInstance = api): Promise<{
    totalComparisons: number;
    totalTokensUsed: number;
    totalCost: number;
    averageResponseTime: number;
    modelUsageStats: Record<string, number>;
  }> {
    const history = sessionId 
      ? await this.getSessionHistory(sessionId, apiClient)
      : await this.getHistory(apiClient);

    const stats = {
      totalComparisons: history.length,
      totalTokensUsed: 0,
      totalCost: 0,
      averageResponseTime: 0,
      modelUsageStats: {} as Record<string, number>
    };

    let totalTime = 0;
    
    history.forEach(comparison => {
      Object.entries(comparison.results).forEach(([model, result]) => {
        if (result.tokens) {
          stats.totalTokensUsed += result.tokens.total_tokens;
        }
        if (result.costEstimateUsd) {
          stats.totalCost += result.costEstimateUsd;
        }
        totalTime += result.timeTakenMs;
        
        stats.modelUsageStats[model] = (stats.modelUsageStats[model] || 0) + 1;
      });
    });

    if (history.length > 0) {
      const totalResponses = history.reduce((acc, comp) => acc + Object.keys(comp.results).length, 0);
      stats.averageResponseTime = totalTime / totalResponses;
    }

    return stats;
  }
};