import api from './api';
import { AIModel, GroupedModels, ModelCapabilities, ModelStats } from '../types/api';
import { AxiosInstance } from 'axios';

export const modelsService = {
  /**
   * Get all available AI models
   */
  async getAllModels(apiClient: AxiosInstance = api): Promise<AIModel[]> {
    const response = await apiClient.get<AIModel[]>('/models');
    return response.data;
  },

  /**
   * Get models grouped by provider (OpenAI, Anthropic, xAI)
   */
  async getGroupedModels(apiClient: AxiosInstance = api): Promise<GroupedModels> {
    const response = await apiClient.get<GroupedModels>('/models/grouped');
    return response.data;
  },

  /**
   * Get list of available providers
   */
  async getProviders(apiClient: AxiosInstance = api): Promise<string[]> {
    const response = await apiClient.get<string[]>('/models/providers');
    return response.data;
  },

  /**
   * Get model capabilities mapping
   */
  async getCapabilities(apiClient: AxiosInstance = api): Promise<ModelCapabilities> {
    const response = await apiClient.get<ModelCapabilities>('/models/capabilities');
    return response.data;
  },

  /**
   * Get model statistics and analytics
   */
  async getStats(apiClient: AxiosInstance = api): Promise<ModelStats> {
    const response = await apiClient.get<ModelStats>('/models/stats');
    return response.data;
  },

  /**
   * Get model by ID
   */
  async getModelById(modelId: string, allModels?: AIModel[], apiClient: AxiosInstance = api): Promise<AIModel | null> {
    if (allModels) {
      return allModels.find(model => model.id === modelId) || null;
    }
    
    const models = await this.getAllModels(apiClient);
    return models.find(model => model.id === modelId) || null;
  },

  /**
   * Filter models by capability
   */
  async getModelsByCapability(capability: string, apiClient: AxiosInstance = api): Promise<AIModel[]> {
    const [models, capabilities] = await Promise.all([
      this.getAllModels(apiClient),
      this.getCapabilities(apiClient)
    ]);
    
    const modelIds = capabilities[capability] || [];
    return models.filter(model => modelIds.includes(model.id));
  },

  /**
   * Get models by provider
   */
  async getModelsByProvider(provider: string, apiClient: AxiosInstance = api): Promise<AIModel[]> {
    const groupedModels = await this.getGroupedModels(apiClient);
    return groupedModels[provider] || [];
  }
};