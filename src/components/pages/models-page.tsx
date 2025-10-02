'use client';

import React from 'react';
import { useAtom } from 'jotai';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Loader2, AlertCircle, Zap } from 'lucide-react';
import { ModelSelectionGrid } from '@/components/models/model-selection-grid';
import { useModelData } from '@/hooks/use-model-data';
import { useSessionManagement } from '@/hooks/use-session-management';
import { selectedModelsAtom } from '@/stores/models.store';

export function ModelsPage() {
  const { modelsLoading, modelsError, hasModels, refetchModelData } = useModelData();
  const { createSession, isCreatingSession, canCreateSession } = useSessionManagement();
  const [selectedModels] = useAtom(selectedModelsAtom);

  const handleStartComparison = () => {
    createSession();
  };

  if (modelsLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-center space-y-4">
          <Loader2 className="h-8 w-8 animate-spin mx-auto text-primary" />
          <div className="space-y-2">
            <h3 className="text-lg font-medium">Loading AI Models</h3>
            <p className="text-muted-foreground">
              Fetching available models from the API...
            </p>
          </div>
        </div>
      </div>
    );
  }

  if (modelsError) {
    return (
      <div className="py-12">
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription className="flex items-center justify-between">
            <div>
              <strong>Failed to load models:</strong> {modelsError}
            </div>
            <Button variant="outline" size="sm" onClick={refetchModelData}>
              Retry
            </Button>
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  if (!hasModels) {
    return (
      <div className="text-center py-12">
        <Zap className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
        <h3 className="text-lg font-medium mb-2">No Models Available</h3>
        <p className="text-muted-foreground mb-4">
          No AI models were found. Please check your API connection.
        </p>
        <Button variant="outline" onClick={refetchModelData}>
          Refresh Models
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <ModelSelectionGrid />
      
      {/* Start Comparison Button */}
      {selectedModels.length > 0 && (
        <div className="fixed bottom-6 right-6 z-40">
          <Button
            size="lg"
            onClick={handleStartComparison}
            disabled={!canCreateSession || isCreatingSession}
            className="shadow-lg"
          >
            {isCreatingSession ? (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            ) : (
              <Zap className="mr-2 h-4 w-4" />
            )}
            {isCreatingSession ? 'Creating Session...' : 'Start Comparison'}
          </Button>
        </div>
      )}
    </div>
  );
}