'use client';

import React, { useEffect, useState } from 'react';
import { useAtom } from 'jotai';
import { LayoutGrid, FileText, BarChart3 } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { 
  Tooltip, 
  TooltipContent, 
  TooltipProvider, 
  TooltipTrigger 
} from '@/components/ui/tooltip';
import { PlaygroundInterface } from '@/components/playground/playground-interface';
import { ModelSelector } from '@/components/playground/model-selector';
import { ModelLoading } from '@/components/playground/playground-loading';
import { useSessionManagement } from '@/hooks/use-session-management';
import { hasActiveSessionAtom, sessionModelsAtom } from '@/stores/session.store';
import { comparisonViewModeAtom, showPerformanceMetricsAtom } from '@/stores/ui.store';
import { useModelData } from '@/hooks/use-model-data';
import { useHistoryData } from '@/hooks/use-history-data';

const viewModes = [
  { id: 'side-by-side', icon: LayoutGrid, label: 'Side by Side' },
  { id: 'tabs', icon: FileText, label: 'Tabs' },
] as const;

export function PlaygroundPage() {
  const [hasActiveSession] = useAtom(hasActiveSessionAtom);
  const [sessionModels] = useAtom(sessionModelsAtom);
  const [viewMode, setViewMode] = useAtom(comparisonViewModeAtom);
  const [showPerformance, setShowPerformance] = useAtom(showPerformanceMetricsAtom);
  const { validateSession } = useSessionManagement();
  const { modelsLoading, hasModels, hasFetchedModels, forceRefreshModels } = useModelData();
  const { hasHistory, hasFetchedHistory } = useHistoryData();
  const [showInterface, setShowInterface] = useState(false);

  useEffect(() => {
    // Only fetch models if we haven't fetched them before
    if (!hasFetchedModels && !modelsLoading) {
      forceRefreshModels();
    }
    
    // Note: History will be fetched automatically by the useHistoryData hook 
    // when user is authenticated, no need to fetch it here
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    // Validate session when component mounts
    if (hasActiveSession) {
      validateSession();
      setShowInterface(true);
    }
  }, [hasActiveSession, validateSession]);

  const handleSessionCreated = () => {
    setShowInterface(true);
  };

  if (modelsLoading) {
    return <ModelLoading />;
  }

  return (
    <div className="space-y-8">
      {/* Enhanced Header with Gradient */}
      <div className="relative">
        <div className="absolute inset-0 bg-gradient-to-r from-primary/10 via-primary/5 to-transparent rounded-3xl blur-3xl" />
        <div className="relative space-y-3 pb-2">
          <div className="flex items-center space-x-3">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-primary to-primary/70 shadow-lg shadow-primary/25 flex items-center justify-center">
              <LayoutGrid className="w-6 h-6 text-primary-foreground" />
            </div>
            <div>
              <h1 className="text-4xl font-bold tracking-tight bg-gradient-to-r from-foreground to-foreground/70 bg-clip-text text-transparent">
                AI Model Playground
              </h1>
              <p className="text-lg text-muted-foreground mt-1">
                Compare and analyze responses from multiple AI models in real-time
              </p>
            </div>
          </div>
        </div>
      </div>

      {!hasActiveSession || !showInterface ? (
        /* Model Selection - Show when no active session */
        <ModelSelector onSessionCreated={handleSessionCreated} />
      ) : (
        /* Chat Interface - Show when session is active */
        <PlaygroundInterface />
      )}
    </div>
  );
}