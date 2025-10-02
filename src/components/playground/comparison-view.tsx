'use client';

import React from 'react';
import { useAtom } from 'jotai';
import { Users, Clock } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Separator } from '@/components/ui/separator';
import { 
  Tooltip, 
  TooltipContent, 
  TooltipProvider, 
  TooltipTrigger 
} from '@/components/ui/tooltip';
import { StreamingResponse } from './streaming-response';
import { 
  showModelMetricsAtom,
  showPerformanceMetricsAtom 
} from '@/stores/ui.store';
import { streamingStateAtom, sessionModelsAtom } from '@/stores/session.store';



export function ComparisonView() {

  const [showMetrics] = useAtom(showModelMetricsAtom);
  const [showPerformance] = useAtom(showPerformanceMetricsAtom);
  const [streamingState] = useAtom(streamingStateAtom);
  const [sessionModels] = useAtom(sessionModelsAtom);

  const completionPercentage = streamingState.totalModels > 0 
    ? (streamingState.completedModels.length / streamingState.totalModels) * 100 
    : 0;

  const averageCharsPerSec = Object.values(streamingState.performanceMetrics)
    .filter(m => m.charsPerSec > 0)
    .reduce((acc, m, _, arr) => acc + m.charsPerSec / arr.length, 0);

  const totalCost = Object.values(streamingState.performanceMetrics)
    .reduce((acc, m) => acc + (m.cost || 0), 0);

  if (sessionModels.length === 0) {
    return (
      <div className="text-center py-12">
        <Users className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
        <h3 className="text-lg font-medium mb-2">No models selected</h3>
        <p className="text-muted-foreground">
          Please select some models to start comparing responses
        </p>
      </div>
    );
  }

  return (
    <TooltipProvider>
      <div className="space-y-6">


        {/* Global Progress and Stats */}
        {streamingState.isStreaming && (
          <div className="space-y-3 p-4 bg-muted/50 rounded-lg">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <Clock className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm font-medium">
                  Progress: {streamingState.completedModels.length}/{streamingState.totalModels} models
                </span>
              </div>
              <Badge variant="secondary" className="text-xs">
                {completionPercentage.toFixed(0)}% complete
              </Badge>
            </div>
            
            <Progress value={completionPercentage} className="h-2" />
            
            {showPerformance && averageCharsPerSec > 0 && (
              <div className="flex items-center justify-between text-xs text-muted-foreground">
                <div className="flex items-center space-x-4">
                  <span>Avg Speed: {averageCharsPerSec.toFixed(1)} chars/sec</span>
                  {totalCost > 0 && <span>Total Cost: ${totalCost.toFixed(6)}</span>}
                </div>
                <div className="flex space-x-2">
                  {streamingState.completedModels.map(modelId => (
                    <Badge key={modelId} variant="outline" className="text-xs">
                      ✓ {modelId.split('-').slice(-1)[0]}
                    </Badge>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        <Separator />

        {/* Summary Stats (shown when all models complete and performance metrics enabled) */}
        {!streamingState.isStreaming && streamingState.completedModels.length > 0 && showPerformance && (
          <div className="p-4 bg-green-50 dark:bg-green-950 rounded-lg border border-green-200 dark:border-green-800">
            <div className="flex items-center justify-between mb-3">
              <h3 className="font-medium text-green-900 dark:text-green-100">
                Comparison Complete
              </h3>
              <Badge variant="default" className="bg-green-500">
                All {sessionModels.length} models responded
              </Badge>
            </div>
            
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-sm">
              <div>
                <div className="text-green-700 dark:text-green-300">Total Time</div>
                <div className="font-semibold text-green-900 dark:text-green-100">
                  {Math.max(...Object.values(streamingState.performanceMetrics).map(m => m.duration)) / 1000}s
                </div>
              </div>
              <div>
                <div className="text-green-700 dark:text-green-300">Avg Speed</div>
                <div className="font-semibold text-green-900 dark:text-green-100">
                  {averageCharsPerSec.toFixed(1)} chars/sec
                </div>
              </div>
              <div>
                <div className="text-green-700 dark:text-green-300">Total Cost</div>
                <div className="font-semibold text-green-900 dark:text-green-100">
                  ${totalCost.toFixed(6)}
                </div>
              </div>
              <div>
                <div className="text-green-700 dark:text-green-300">Total Tokens</div>
                <div className="font-semibold text-green-900 dark:text-green-100">
                  {Object.values(streamingState.performanceMetrics)
                    .reduce((acc, m) => acc + (m.tokens?.total_tokens || 0), 0)}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </TooltipProvider>
  );
}