import { atom } from 'jotai';
import { PromptComparisonResponse, HistoryItem } from '../types/api';

// History atoms
export const historyAtom = atom<HistoryItem[]>([]);
export const historyLoadingAtom = atom<boolean>(false);
export const historyErrorAtom = atom<string | null>(null);

// Current session history
export const sessionHistoryAtom = atom<HistoryItem[]>([]);

// Search and filter atoms
export const historySearchQueryAtom = atom<string>('');
export const historyProviderFilterAtom = atom<string | null>(null);
export const historyDateFilterAtom = atom<{ from?: Date; to?: Date } | null>(null);


// Filtered history atom
export const filteredHistoryAtom = atom((get) => {
  const history = get(historyAtom);
  const searchQuery = get(historySearchQueryAtom);
  const providerFilter = get(historyProviderFilterAtom);
  const dateFilter = get(historyDateFilterAtom);


  let filtered = history;

  // Filter by search query
  if (searchQuery) {
    const query = searchQuery.toLowerCase();
    filtered = filtered.filter(item =>
      item.prompt.toLowerCase().includes(query) ||
      Object.values(item.results).some(result =>
        result.response?.toLowerCase().includes(query)
      )
    );
  }

  // Filter by provider
  if (providerFilter) {
    filtered = filtered.filter(item =>
      Object.keys(item.results).some(modelId =>
        modelId.toLowerCase().includes(providerFilter.toLowerCase())
      )
    );
  }

  // Filter by date range
  if (dateFilter) {
    filtered = filtered.filter(item => {
      const itemDate = new Date(item.createdAt);
      const { from, to } = dateFilter;
      
      if (from && itemDate < from) return false;
      if (to && itemDate > to) return false;
      
      return true;
    });
  }



  return filtered.sort((a, b) => 
    new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
  );
});

// History statistics
export const historyStatsAtom = atom((get) => {
  const history = get(historyAtom);
  
  const stats = {
    totalComparisons: history.length,
    totalTokensUsed: 0,
    totalCost: 0,
    averageResponseTime: 0,
    modelUsageCount: {} as Record<string, number>,
    providerUsageCount: {} as Record<string, number>
  };

  let totalResponseTime = 0;
  let totalResponses = 0;

  history.forEach(item => {
    
    Object.entries(item.results).forEach(([modelId, result]) => {
      // Token and cost tracking
      if (result.tokens) {
        stats.totalTokensUsed += result.tokens.total_tokens;
      }
      if (result.costEstimateUsd) {
        stats.totalCost += result.costEstimateUsd;
      }
      
      // Response time tracking
      totalResponseTime += result.timeTakenMs;
      totalResponses++;
      
      // Model usage counting
      stats.modelUsageCount[modelId] = (stats.modelUsageCount[modelId] || 0) + 1;
      
      // Provider usage counting
      const provider = modelId.split('-')[0];
      stats.providerUsageCount[provider] = (stats.providerUsageCount[provider] || 0) + 1;
    });
  });

  if (totalResponses > 0) {
    stats.averageResponseTime = totalResponseTime / totalResponses;
  }

  return stats;
});

// Actions for managing history
export const addHistoryItemAtom = atom(
  null,
  (get, set, item: PromptComparisonResponse) => {
    const current = get(historyAtom);
    
    const historyItem: HistoryItem = {
      ...item,
      id: `${item.sessionId}-${Date.now()}`
    };
    
    set(historyAtom, [historyItem, ...current]);
  }
);



export const removeHistoryItemAtom = atom(
  null,
  (get, set, itemId: string) => {
    const current = get(historyAtom);
    set(historyAtom, current.filter(item => item.id !== itemId));
  }
);