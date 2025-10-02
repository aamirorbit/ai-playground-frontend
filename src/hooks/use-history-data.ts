'use client';

import { useEffect, useCallback, useState } from 'react';
import { useAtom } from 'jotai';
import { useAuth } from '@clerk/nextjs';
import { useApi } from './use-api';
import { promptsService } from '@/services/prompts.service';
import {
  historyAtom,
  historyLoadingAtom,
  historyErrorAtom
} from '@/stores/history.store';
import { addNotificationAtom } from '@/stores/ui.store';
import { HistoryItem } from '@/types/api';

export function useHistoryData() {
  const [history, setHistory] = useAtom(historyAtom);
  const [historyLoading, setHistoryLoading] = useAtom(historyLoadingAtom);
  const [historyError, setHistoryError] = useAtom(historyErrorAtom);
  const { isLoaded, isSignedIn } = useAuth();
  const api = useApi();
  const [, addNotification] = useAtom(addNotificationAtom);
  
  // Track whether we've attempted to fetch data to prevent excessive requests
  const [hasFetchedHistory, setHasFetchedHistory] = useState(false);

  const fetchHistory = useCallback(async () => {
    // Don't fetch if not authenticated or auth not loaded
    if (!isLoaded || !isSignedIn) {
      return;
    }

    try {
      setHistoryLoading(true);
      setHistoryError(null);

      const historyData = await promptsService.getHistory(api);
      
      // Convert to HistoryItem format with IDs
      const historyItems: HistoryItem[] = historyData.map((item, index) => ({
        ...item,
        id: `${item.sessionId}-${item.createdAt}-${index}`,
        isFavorite: false // Will be managed by local state
      }));

      setHistory(historyItems);
      setHasFetchedHistory(true);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to load history';
      setHistoryError(errorMessage);
      setHasFetchedHistory(true); // Still mark as fetched even on error
      
      addNotification({
        type: 'error',
        title: 'Failed to Load History',
        message: errorMessage,
        duration: 8000
      });
    } finally {
      setHistoryLoading(false);
    }
  }, [isLoaded, isSignedIn, api, setHistoryLoading, setHistoryError, setHistory, addNotification]);

  const fetchSessionHistory = useCallback(async (sessionId: string) => {
    // Don't fetch if not authenticated or auth not loaded
    if (!isLoaded || !isSignedIn) {
      return [];
    }

    try {
      setHistoryLoading(true);
      setHistoryError(null);

      const sessionHistoryData = await promptsService.getSessionHistory(sessionId, api);
      
      const sessionHistoryItems: HistoryItem[] = sessionHistoryData.map((item, index) => ({
        ...item,
        id: `${item.sessionId}-${item.createdAt}-${index}`,
        isFavorite: false
      }));

      return sessionHistoryItems;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to load session history';
      setHistoryError(errorMessage);
      
      addNotification({
        type: 'error',
        title: 'Failed to Load Session History',
        message: errorMessage,
        duration: 5000
      });
      
      return [];
    } finally {
      setHistoryLoading(false);
    }
  }, [isLoaded, isSignedIn, api, setHistoryLoading, setHistoryError, addNotification]);

  const fetchHistorySilently = useCallback(async () => {
    // Only fetch if authenticated and loaded
    if (!isLoaded || !isSignedIn) {
      return;
    }
    
    try {
      setHistoryError(null);

      const historyData = await promptsService.getHistory(api);
      
      // Convert to HistoryItem format with IDs
      const historyItems: HistoryItem[] = historyData.map((item, index) => ({
        ...item,
        id: `${item.sessionId}-${item.createdAt}-${index}`,
        isFavorite: false // Will be managed by local state
      }));

      setHistory(historyItems);
      setHasFetchedHistory(true);
      console.log('History refreshed silently in background');
    } catch (error) {
      console.error('Background history fetch failed:', error);
      setHasFetchedHistory(true); // Still mark as fetched even on error
      // Don't show error notifications for background fetches
    }
  }, [isLoaded, isSignedIn, api, setHistoryError, setHistory]);

  const refetchHistory = useCallback(() => {
    fetchHistory();
  }, [fetchHistory]);

  const forceRefreshHistory = useCallback(() => {
    fetchHistory();
  }, [fetchHistory]);

  useEffect(() => {
    // Only proceed if auth is loaded
    if (!isLoaded) {
      return;
    }
    
    if (isSignedIn) {
      // Auto-fetch history if authenticated and we haven't fetched before and aren't currently loading
      // Small delay to allow Clerk to initialize, but the API client will retry if needed
      if (!hasFetchedHistory && !historyLoading) {
        const timer = setTimeout(() => {
          console.log('[useHistoryData] Fetching history after auth settled');
          fetchHistory();
        }, 500); // 500ms delay + API client will retry if token not ready
        
        return () => clearTimeout(timer);
      }
    } else {
      // Clear history and reset fetch status when not authenticated
      if (history.length > 0 || hasFetchedHistory) {
        setHistory([]);
        setHistoryError(null);
        setHasFetchedHistory(false);
      }
    }
  }, [isLoaded, isSignedIn, hasFetchedHistory, historyLoading, history.length, setHistory, setHistoryError, fetchHistory]);

  return {
    historyLoading,
    historyError,
    hasHistory: history.length > 0,
    hasFetchedHistory,
    refetchHistory,
    forceRefreshHistory,
    fetchHistorySilently,
    fetchSessionHistory
  };
}