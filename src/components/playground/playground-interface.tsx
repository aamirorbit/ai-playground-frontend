'use client';

import React, { useEffect, useCallback, useState } from 'react';
import { useAtom } from 'jotai';
import { AlertCircle, Wifi, WifiOff, RotateCcw, Settings, LayoutGrid, FileText, BarChart3, Zap } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { cn } from '@/lib/utils';
import { 
  Tooltip, 
  TooltipContent, 
  TooltipProvider, 
  TooltipTrigger 
} from '@/components/ui/tooltip';
import { PromptInput } from './prompt-input';
import { ComparisonView } from './comparison-view';
import { StreamingResponse } from './streaming-response';
import { webSocketService } from '@/services/websocket.service';
import { 
  currentSessionAtom,
  sessionModelsAtom,
  isWebSocketConnectedAtom,
  initializeStreamingAtom,
  updateModelStatusAtom,
  appendModelResponseAtom,
  completeModelResponseAtom,
  setModelErrorAtom,
  updateWebSocketStatusAtom,
  resetSessionAtom
} from '@/stores/session.store';
import { 
  isSubmittingPromptAtom,
  addNotificationAtom,
  comparisonViewModeAtom,
  currentPromptAtom,
  showPerformanceMetricsAtom
} from '@/stores/ui.store';
import { addHistoryItemAtom } from '@/stores/history.store';
import { clearSelectedModelsAtom } from '@/stores/models.store';
import { useHistoryData } from '@/hooks/use-history-data';

const viewModes = [
  { id: 'side-by-side', icon: LayoutGrid, label: 'Side by Side' },
  { id: 'tabs', icon: FileText, label: 'Tabs' },
];

export function PlaygroundInterface() {
  const [currentSession] = useAtom(currentSessionAtom);
  const [sessionModels] = useAtom(sessionModelsAtom);
  const [isWSConnected] = useAtom(isWebSocketConnectedAtom);
  const [isSubmitting, setIsSubmitting] = useAtom(isSubmittingPromptAtom);
  const [viewMode, setViewMode] = useAtom(comparisonViewModeAtom);
  const [hasSubmittedPrompt, setHasSubmittedPrompt] = useState(false);
  const [, setCurrentPrompt] = useAtom(currentPromptAtom);
  const [showPerformance, setShowPerformance] = useAtom(showPerformanceMetricsAtom);
  
  const [, initializeStreaming] = useAtom(initializeStreamingAtom);
  const [, updateModelStatus] = useAtom(updateModelStatusAtom);
  const [, appendModelResponse] = useAtom(appendModelResponseAtom);
  const [, completeModelResponse] = useAtom(completeModelResponseAtom);
  const [, setModelError] = useAtom(setModelErrorAtom);
  const [, updateWebSocketStatus] = useAtom(updateWebSocketStatusAtom);
  const [, addNotification] = useAtom(addNotificationAtom);
  const [, addHistoryItem] = useAtom(addHistoryItemAtom);
  const [, resetSession] = useAtom(resetSessionAtom);
  const [, clearSelectedModels] = useAtom(clearSelectedModelsAtom);
  
  const { forceRefreshHistory } = useHistoryData();

  // Initialize WebSocket connection
  useEffect(() => {
    if (!currentSession) return;

    const socket = webSocketService.connect();
    
    const handleConnect = () => {
      updateWebSocketStatus(true, undefined, 0);
      webSocketService.joinSession(currentSession.sessionId);
    };

    const handleDisconnect = () => {
      updateWebSocketStatus(false);
    };

    const handleConnectError = () => {
      updateWebSocketStatus(false, 'Connection failed');
      addNotification({
        type: 'error',
        title: 'Connection Error',
        message: 'Failed to connect for real-time streaming',
        duration: 5000
      });
    };

    socket.on('connect', handleConnect);
    socket.on('disconnect', handleDisconnect);
    socket.on('connect_error', handleConnectError);

    // Set up streaming event listeners
    webSocketService.onPromptReceived((data) => {
      console.log('Prompt received:', data);
      initializeStreaming(sessionModels);
    });

    webSocketService.onModelTyping((data) => {
      console.log('Model typing:', data);
      updateModelStatus(data.model, data.isTyping ? 'typing' : 'idle');
    });

    webSocketService.onModelStream((data) => {
      console.log('Model stream:', data);
      updateModelStatus(data.model, 'streaming');
      appendModelResponse(data.model, data.chunk);
    });

    webSocketService.onModelComplete((data) => {
      console.log('Model complete:', data);
      const metrics = {
        chars: data.finalResponse.length,
        duration: data.timeTakenMs,
        charsPerSec: Math.round((data.finalResponse.length / (data.timeTakenMs / 1000)) * 10) / 10,
        tokens: data.tokens,
        cost: data.costEstimateUsd
      };
      
      completeModelResponse(data.model, data.finalResponse, metrics);
      
    });

    webSocketService.onComparisonComplete((data) => {
      console.log('Comparison complete:', data);
      setIsSubmitting(false);
      
      // Add to history
      addHistoryItem(data);
      
      // Refresh history to get the latest data including this new comparison
      setTimeout(() => {
        forceRefreshHistory();
      }, 1000); // Small delay to ensure backend has processed the new data
      
    });

    webSocketService.onError((error) => {
      console.error('WebSocket error:', error);
      setIsSubmitting(false);
      setModelError(error.model || 'unknown', error.error);
      
      addNotification({
        type: 'error',
        title: 'Streaming Error',
        message: error.error,
        duration: 8000
      });
    });

    return () => {
      webSocketService.removeAllListeners();
      webSocketService.disconnect();
    };
  }, [
    currentSession,
    sessionModels,
    initializeStreaming,
    updateModelStatus,
    appendModelResponse,
    completeModelResponse,
    setModelError,
    updateWebSocketStatus,
    addNotification,
    addHistoryItem,
    setIsSubmitting,
    forceRefreshHistory
  ]);

  const handleSubmitPrompt = useCallback((prompt: string) => {
    if (!currentSession || !isWSConnected) {
      addNotification({
        type: 'error',
        title: 'Connection Required',
        message: 'WebSocket connection is required for real-time streaming',
        duration: 5000
      });
      return;
    }

    setIsSubmitting(true);
    setHasSubmittedPrompt(true); // Show model responses after prompt submission
    
    try {
      webSocketService.submitPrompt(currentSession.sessionId, prompt);
      
    } catch (error) {
      setIsSubmitting(false);
      addNotification({
        type: 'error',
        title: 'Submission Failed',
        message: error instanceof Error ? error.message : 'Failed to submit prompt',
        duration: 5000
      });
    }
  }, [currentSession, isWSConnected, sessionModels.length, setIsSubmitting, addNotification]);

  const handleReconnect = () => {
    webSocketService.disconnect();
    setTimeout(() => {
      webSocketService.connect();
    }, 1000);
  };

  const handleSuggestionClick = (suggestion: string) => {
    setCurrentPrompt(suggestion);
    // Auto-submit the prompt immediately
    setTimeout(() => {
      handleSubmitPrompt(suggestion);
    }, 100); // Small delay to ensure state is updated
  };

  const handleNewBattle = () => {
    // Reset all states
    setHasSubmittedPrompt(false);
    setCurrentPrompt('');
    resetSession();
    clearSelectedModels();
    
  };

  if (!currentSession) {
    return (
      <div className="text-center py-12">
        <AlertCircle className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
        <h3 className="text-lg font-medium mb-2">No Active Session</h3>
        <p className="text-muted-foreground">
          Please create a session by selecting models first
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Enhanced Professional Control Bar */}
      <div className="bg-gradient-to-r from-primary/10 via-primary/5 to-primary/10 rounded-2xl border-2 border-primary/20 shadow-glow overflow-hidden">
        <TooltipProvider>
          <div className="flex items-center justify-between p-5 backdrop-blur-sm">
            <div className="flex items-center space-x-6">
              {/* View Mode Controls */}
              <div className="flex items-center space-x-3">
                <span className="text-sm font-semibold text-muted-foreground">View Mode:</span>
                <div className="flex items-center border-2 border-border/50 rounded-xl p-1 bg-card/50 backdrop-blur-sm shadow-sm">
                  {viewModes.map((mode) => (
                    <Tooltip key={mode.id}>
                      <TooltipTrigger asChild>
                        <Button
                          variant={viewMode === mode.id ? "default" : "ghost"}
                          size="sm"
                          className={cn(
                            "h-9 px-4 text-xs font-medium rounded-lg transition-all duration-200",
                            viewMode === mode.id && "shadow-md"
                          )}
                          onClick={() => setViewMode(mode.id as any)}
                        >
                          <mode.icon className="h-3.5 w-3.5 mr-1.5" />
                          <span>{mode.label}</span>
                        </Button>
                      </TooltipTrigger>
                      <TooltipContent>
                        <p>{mode.label}</p>
                      </TooltipContent>
                    </Tooltip>
                  ))}
                </div>
              </div>

              {/* Performance Metrics Toggle */}
              <div className="flex items-center space-x-3">
                <span className="text-sm font-semibold text-muted-foreground">Metrics:</span>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      variant={showPerformance ? "default" : "outline"}
                      size="sm"
                      className={cn(
                        "h-9 px-4 text-xs font-medium rounded-xl transition-all duration-200",
                        showPerformance && "shadow-md shadow-primary/25"
                      )}
                      onClick={() => setShowPerformance(!showPerformance)}
                    >
                      <BarChart3 className="h-3.5 w-3.5 mr-1.5" />
                      <span>{showPerformance ? 'Enabled' : 'Disabled'}</span>
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>Toggle Performance Metrics Display</p>
                  </TooltipContent>
                </Tooltip>
              </div>
            </div>

            {/* New Comparison Button */}
            <div className="flex items-center">
              <Button 
                variant="outline" 
                size="sm" 
                onClick={handleNewBattle}
                className="flex items-center space-x-2 bg-card/80 hover:bg-card border-2 border-border/50 hover:border-primary/40 rounded-xl px-4 py-2 h-9 font-medium shadow-sm hover:shadow-md transition-all duration-200"
              >
                <RotateCcw className="h-4 w-4" />
                <span>New Comparison</span>
              </Button>
            </div>
          </div>
        </TooltipProvider>
      </div>

      {/* Connection Status Alert - Always visible if disconnected */}
      {/* {!isWSConnected && (
        <Alert>
          <WifiOff className="h-4 w-4" />
          <AlertDescription className="flex items-center justify-between">
            <span>
              Real-time streaming is unavailable. Please check your connection.
            </span>
            <Button variant="outline" size="sm" onClick={handleReconnect}>
              Reconnect
            </Button>
          </AlertDescription>
        </Alert>
      )} */}

      {/* AI Battle Animation & Prompt Input - Show when no prompt submitted */}
      {!hasSubmittedPrompt && (
        <div className="w-full min-h-[70vh] flex flex-col justify-center space-y-12 mt-8">
          {/* AI Battle Animation Section - Full Width */}
          <div className="w-full space-y-10">
            {/* Center Battle Zone */}
            <div className="flex flex-col items-center space-y-6">
              <div className="text-center space-y-3">
                <div className="inline-flex items-center justify-center w-20 h-20 rounded-2xl bg-gradient-to-br from-primary to-primary/70 shadow-lg shadow-primary/25 mb-4">
                  <Zap className="w-10 h-10 text-primary-foreground" />
                </div>
                <h2 className="text-3xl font-bold bg-gradient-to-r from-primary to-primary/70 bg-clip-text text-transparent">
                  {sessionModels.length} AI Models Ready
                </h2>
                <p className="text-muted-foreground text-lg">
                  Start comparing responses by entering a prompt or selecting a suggestion below
                </p>
              </div>
            </div>

            {/* Enhanced Prompt Suggestions */}
            <div className="text-center space-y-6">
              <div className="space-y-4">
                <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">Try These Prompts</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 max-w-5xl mx-auto">
                    <div 
                      className="p-4 bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-950/30 dark:to-indigo-950/30 border-2 border-blue-200/50 dark:border-blue-800/30 rounded-xl hover:shadow-lg hover:border-blue-300 dark:hover:border-blue-700 transition-all duration-200 cursor-pointer group hover:scale-[1.02]"
                      onClick={() => handleSuggestionClick("Explain quantum physics in simple terms")}
                    >
                      <p className="text-sm font-medium text-blue-700 dark:text-blue-300 group-hover:text-blue-800 dark:group-hover:text-blue-200">
                        "Explain quantum physics in simple terms"
                      </p>
                    </div>
                    
                    <div 
                      className="p-4 bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-950/30 dark:to-emerald-950/30 border-2 border-green-200/50 dark:border-green-800/30 rounded-xl hover:shadow-lg hover:border-green-300 dark:hover:border-green-700 transition-all duration-200 cursor-pointer group hover:scale-[1.02]"
                      onClick={() => handleSuggestionClick("Write a short story about time travel")}
                    >
                      <p className="text-sm font-medium text-green-700 dark:text-green-300 group-hover:text-green-800 dark:group-hover:text-green-200">
                        "Write a short story about time travel"
                      </p>
                    </div>
                    
                    <div 
                      className="p-4 bg-gradient-to-br from-purple-50 to-violet-50 dark:from-purple-950/30 dark:to-violet-950/30 border-2 border-purple-200/50 dark:border-purple-800/30 rounded-xl hover:shadow-lg hover:border-purple-300 dark:hover:border-purple-700 transition-all duration-200 cursor-pointer group hover:scale-[1.02]"
                      onClick={() => handleSuggestionClick("Describe the benefits of meditation")}
                    >
                      <p className="text-sm font-medium text-purple-700 dark:text-purple-300 group-hover:text-purple-800 dark:group-hover:text-purple-200">
                        "Describe the benefits of meditation"
                      </p>
                    </div>
                    
                    <div 
                      className="p-4 bg-gradient-to-br from-orange-50 to-red-50 dark:from-orange-950/30 dark:to-red-950/30 border-2 border-orange-200/50 dark:border-orange-800/30 rounded-xl hover:shadow-lg hover:border-orange-300 dark:hover:border-orange-700 transition-all duration-200 cursor-pointer group hover:scale-[1.02]"
                      onClick={() => handleSuggestionClick("Explain climate change and its impact")}
                    >
                      <p className="text-sm font-medium text-orange-700 dark:text-orange-300 group-hover:text-orange-800 dark:group-hover:text-orange-200">
                        "Explain climate change and its impact"
                      </p>
                    </div>
                    
                    <div 
                      className="p-4 bg-gradient-to-br from-teal-50 to-cyan-50 dark:from-teal-950/30 dark:to-cyan-950/30 border-2 border-teal-200/50 dark:border-teal-800/30 rounded-xl hover:shadow-lg hover:border-teal-300 dark:hover:border-teal-700 transition-all duration-200 cursor-pointer group hover:scale-[1.02]"
                      onClick={() => handleSuggestionClick("Create a haiku about artificial intelligence")}
                    >
                      <p className="text-sm font-medium text-teal-700 dark:text-teal-300 group-hover:text-teal-800 dark:group-hover:text-teal-200">
                        "Create a haiku about artificial intelligence"
                      </p>
                    </div>
                    
                    <div 
                      className="p-4 bg-gradient-to-br from-pink-50 to-rose-50 dark:from-pink-950/30 dark:to-rose-950/30 border-2 border-pink-200/50 dark:border-pink-800/30 rounded-xl hover:shadow-lg hover:border-pink-300 dark:hover:border-pink-700 transition-all duration-200 cursor-pointer group hover:scale-[1.02]"
                      onClick={() => handleSuggestionClick("Compare different types of renewable energy")}
                    >
                      <p className="text-sm font-medium text-pink-700 dark:text-pink-300 group-hover:text-pink-800 dark:group-hover:text-pink-200">
                        "Compare different types of renewable energy"
                      </p>
                    </div>
                  </div>
                  
                  <p className="text-sm font-medium text-muted-foreground mt-4">
                    Click any suggestion to instantly start the comparison, or enter your own prompt below
                  </p>
                </div>
              </div>
          </div>

          {/* Full Width Prompt Input */}
          <div className="w-full">
            <PromptInput 
              onSubmit={handleSubmitPrompt}
              disabled={!isWSConnected || isSubmitting}
            />
          </div>
        </div>
      )}



      {/* Model Responses - Show only after prompt submission */}
      {hasSubmittedPrompt && (
        <>
      {/* Model Responses - Dynamic layout based on view mode */}
      <div className="space-y-6">
        {viewMode === 'side-by-side' && (
          <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-3 gap-6">
            {sessionModels.map((modelId) => (
              <div key={modelId}>
                <StreamingResponse modelId={modelId} />
              </div>
            ))}
          </div>
        )}

        {viewMode === 'tabs' && (
          <Tabs defaultValue={sessionModels[0]} className="w-full">
            <TabsList className="grid w-full grid-cols-2 lg:grid-cols-3 xl:grid-cols-3 mb-6">
              {sessionModels.map((modelId) => (
                <TabsTrigger key={modelId} value={modelId} className="text-sm">
                  {modelId.replace('gpt-', 'GPT-').replace('claude-', 'Claude ').replace('grok-', 'Grok ')}
                </TabsTrigger>
              ))}
            </TabsList>
            {sessionModels.map((modelId) => (
              <TabsContent key={modelId} value={modelId}>
                <StreamingResponse modelId={modelId} />
              </TabsContent>
            ))}
          </Tabs>
        )}
      </div>

          {/* Comparison Controls and Stats - After responses */}
      <ComparisonView />

          {/* Prompt Input - Show again after responses for follow-up prompts */}
      <PromptInput 
        onSubmit={handleSubmitPrompt}
        disabled={!isWSConnected || isSubmitting}
      />
        </>
      )}
    </div>
  );
}