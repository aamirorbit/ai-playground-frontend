'use client';

import { useEffect, useCallback, useState } from 'react';
import { useAtom } from 'jotai';
import { modelsService } from '@/services/models.service';
import {
  allModelsAtom,
  groupedModelsAtom,
  modelCapabilitiesAtom,
  modelStatsAtom,
  modelsLoadingAtom,
  modelsErrorAtom
} from '@/stores/models.store';
import { addNotificationAtom } from '@/stores/ui.store';

export function useModelData() {
  const [allModels, setAllModels] = useAtom(allModelsAtom);
  const [, setGroupedModels] = useAtom(groupedModelsAtom);
  const [, setModelCapabilities] = useAtom(modelCapabilitiesAtom);
  const [, setModelStats] = useAtom(modelStatsAtom);
  const [modelsLoading, setModelsLoading] = useAtom(modelsLoadingAtom);
  const [modelsError, setModelsError] = useAtom(modelsErrorAtom);
  const [, addNotification] = useAtom(addNotificationAtom);
  
  // Track whether we've attempted to fetch data to prevent excessive requests
  const [hasFetchedModels, setHasFetchedModels] = useState(false);

  const fetchModelData = async () => {
    try {
      setModelsLoading(true);
      setModelsError(null);

      // Fetch all model data in parallel
      const [models, groupedModels, capabilities, stats] = await Promise.all([
        modelsService.getAllModels(),
        modelsService.getGroupedModels(),
        modelsService.getCapabilities(),
        modelsService.getStats()
      ]);

      setAllModels(models);
      setGroupedModels(groupedModels);
      setModelCapabilities(capabilities);
      setModelStats(stats);
      setHasFetchedModels(true);

    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to load model data';
      setModelsError(errorMessage);
      setHasFetchedModels(true); // Still mark as fetched even on error
      
      addNotification({
        type: 'error',
        title: 'Failed to Load Models',
        message: errorMessage,
        duration: 8000
      });
    } finally {
      setModelsLoading(false);
    }
  };

  const fetchModelDataSilently = useCallback(async () => {
    try {
      setModelsError(null);

      // Fetch all model data in parallel without loading state
      const [models, groupedModels, capabilities, stats] = await Promise.all([
        modelsService.getAllModels(),
        modelsService.getGroupedModels(),
        modelsService.getCapabilities(),
        modelsService.getStats()
      ]);

      setAllModels(models);
      setGroupedModels(groupedModels);
      setModelCapabilities(capabilities);
      setModelStats(stats);
      setHasFetchedModels(true);

      console.log('Models refreshed silently in background');
    } catch (error) {
      console.error('Background model fetch failed:', error);
      setHasFetchedModels(true); // Still mark as fetched even on error
      // Don't show error notifications for background fetches
    }
  }, []);

  const refetchModelData = useCallback(() => {
    fetchModelData();
  }, []);

  const forceRefreshModels = useCallback(() => {
    fetchModelData();
  }, []);

  useEffect(() => {
    // Only fetch if we haven't fetched before and aren't currently loading
    if (!hasFetchedModels && !modelsLoading) {
      fetchModelData();
    }
  }, [hasFetchedModels, modelsLoading]);

  return {
    modelsLoading,
    modelsError,
    hasModels: allModels.length > 0,
    hasFetchedModels,
    refetchModelData,
    forceRefreshModels,
    fetchModelDataSilently
  };
}