'use client';

import React, { useEffect } from 'react';
import { useAuth, SignInButton } from '@clerk/nextjs';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { AlertCircle, Calendar, Lock } from 'lucide-react';
import { HistoryList } from '@/components/history/history-list';
import { HistoryLoading, AuthLoading } from '@/components/history/history-loading';
import { useHistoryData } from '@/hooks/use-history-data';
import { useModelData } from '@/hooks/use-model-data';

export function HistoryPage() {
  const { isLoaded, isSignedIn } = useAuth();
  const { historyLoading, historyError, hasHistory, hasFetchedHistory, refetchHistory } = useHistoryData();
  const { hasModels, hasFetchedModels, fetchModelDataSilently } = useModelData();

  useEffect(() => {
    // Fetch models silently in background only if not already fetched
    if (!hasFetchedModels) {
      fetchModelDataSilently();
    }
    
    // Note: History will be fetched automatically by the useHistoryData hook 
    // when user is authenticated, no need to force fetch it here
  }, [hasFetchedModels, fetchModelDataSilently]);

  // Wait for auth initialization before showing any auth-related UI
  if (!isLoaded) {
    return <AuthLoading />;
  }

  // Authentication check (only after initialization)
  if (!isSignedIn) {
    return (
      <div className="text-center py-12">
        <div className="mx-auto w-16 h-16 bg-muted/20 rounded-full flex items-center justify-center mb-6">
          <Lock className="h-8 w-8 text-muted-foreground" />
        </div>
        <h3 className="text-xl font-medium mb-2">Authentication Required</h3>
        <p className="text-muted-foreground mb-6 max-w-md mx-auto">
          Sign in to view your comparison history and access saved AI model conversations.
        </p>
        <SignInButton mode="modal">
          <Button>
            Sign In to View History
          </Button>
        </SignInButton>
      </div>
    );
  }

  if (historyError) {
    return (
      <div className="py-12">
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription className="flex items-center justify-between">
            <div>
              <strong>Failed to load history:</strong> {historyError}
            </div>
            <Button variant="outline" size="sm" onClick={refetchHistory}>
              Retry
            </Button>
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  // Show empty state if we've fetched but have no history
  if (!hasHistory && hasFetchedHistory) {
    return (
      <div className="text-center py-12">
        <Calendar className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
        <h3 className="text-lg font-medium mb-2">No History Yet</h3>
        <p className="text-muted-foreground mb-6">
          Your AI model comparisons will appear here once you start using the playground
        </p>
        {/* Only show refresh button if there was an error */}
        {historyError && (
          <Button variant="outline" onClick={refetchHistory}>
            Retry
          </Button>
        )}
      </div>
    );
  }

  // Show loading state only if we haven't fetched yet and we're loading
  if (!hasFetchedHistory && historyLoading) {
    return <HistoryLoading />;
  }

  return <HistoryList />;
}