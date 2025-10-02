'use client';

import { useCallback, useEffect } from 'react';
import { useAtom } from 'jotai';
import { useRouter } from 'next/navigation';
import { useAuth } from '@clerk/nextjs';
import { useApi } from './use-api';
import { sessionsService } from '@/services/sessions.service';
import {
  currentSessionAtom,
  isCreatingSessionAtom,
  sessionErrorAtom,
  resetSessionAtom
} from '@/stores/session.store';
import { selectedModelsAtom, clearSelectedModelsAtom } from '@/stores/models.store';
import { addNotificationAtom } from '@/stores/ui.store';

export function useSessionManagement() {
  const [currentSession] = useAtom(currentSessionAtom);
  const [selectedModels] = useAtom(selectedModelsAtom);
  const [isCreatingSession, setIsCreatingSession] = useAtom(isCreatingSessionAtom);
  const [sessionError, setSessionError] = useAtom(sessionErrorAtom);
  const { isLoaded, isSignedIn } = useAuth();
  const api = useApi();
  
  const [, setCurrentSession] = useAtom(currentSessionAtom);
  const [, clearSelectedModels] = useAtom(clearSelectedModelsAtom);
  const [, resetSession] = useAtom(resetSessionAtom);
  const [, addNotification] = useAtom(addNotificationAtom);
  const router = useRouter();

  // Clear session when user signs out
  useEffect(() => {
    if (isLoaded && !isSignedIn && currentSession) {
      console.log('[useSessionManagement] User signed out, clearing session');
      resetSession();
    }
  }, [isLoaded, isSignedIn, currentSession, resetSession]);

  const createSession = useCallback(async (modelIds?: string[]) => {
    const modelsToUse = modelIds || selectedModels;
    
    if (modelsToUse.length === 0) {
      addNotification({
        type: 'error',
        title: 'No Models Selected',
        message: 'Please select at least one model to create a session',
        duration: 5000
      });
      return null;
    }

    try {
      setIsCreatingSession(true);
      setSessionError(null);

      const session = await sessionsService.createSession({
        selectedModels: modelsToUse
      }, api);

      setCurrentSession(session);
      
      addNotification({
        type: 'success',
        title: 'Session Created',
        message: `Ready to compare ${session.selectedModels.length} AI models`,
        duration: 3000
      });

      // Navigate to playground
      router.push('/playground');
      
      return session;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to create session';
      setSessionError(errorMessage);
      
      addNotification({
        type: 'error',
        title: 'Session Creation Failed',
        message: errorMessage,
        duration: 8000
      });
      
      return null;
    } finally {
      setIsCreatingSession(false);
    }
  }, [
    selectedModels,
    setIsCreatingSession,
    setSessionError,
    setCurrentSession,
    router,
    addNotification,
    api
  ]);

  const endSession = useCallback(async () => {
    if (!currentSession) return;

    try {
      await sessionsService.endSession(currentSession.sessionId, api);
      resetSession();
      
      addNotification({
        type: 'info',
        title: 'Session Ended',
        message: 'Your comparison session has been ended',
        duration: 3000
      });

      // Navigate back to playground
      router.push('/playground');
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to end session';
      
      addNotification({
        type: 'error',
        title: 'Failed to End Session',
        message: errorMessage,
        duration: 5000
      });
    }
  }, [currentSession, resetSession, router, addNotification, api]);

  const validateSession = useCallback(async () => {
    // Don't validate if no session or not signed in
    if (!currentSession || !isSignedIn) return false;

    try {
      const isValid = await sessionsService.validateSession(currentSession.sessionId, api);
      
      if (!isValid) {
        addNotification({
          type: 'warning',
          title: 'Session Expired',
          message: 'Your session has expired. Please create a new one.',
          duration: 5000
        });
        resetSession();
        router.push('/playground');
      }
      
      return isValid;
    } catch (error) {
      // Silently handle validation errors (likely due to sign out or network issues)
      const message = error instanceof Error ? error.message : 'Unknown error';
      console.log('Session validation skipped:', message);
      return false;
    }
  }, [currentSession, isSignedIn, resetSession, router, addNotification, api]);

  const startNewSession = useCallback(() => {
    if (currentSession) {
      resetSession();
    }
    clearSelectedModels();
    router.push('/playground');
  }, [currentSession, resetSession, clearSelectedModels, router]);

  return {
    currentSession,
    selectedModels,
    isCreatingSession,
    sessionError,
    hasActiveSession: !!currentSession?.isActive,
    canCreateSession: selectedModels.length > 0,
    
    // Actions
    createSession,
    endSession,
    validateSession,
    startNewSession
  };
}