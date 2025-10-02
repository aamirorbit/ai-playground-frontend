'use client';

import { useMemo } from 'react';
import { useAuth } from '@clerk/nextjs';
import { createApiClient } from '@/services/api';
import { waitForClerkToken } from '@/lib/clerk-utils';

/**
 * Hook that provides an authenticated API client instance.
 * This hook uses Clerk's useAuth to get the session token.
 * 
 * Use this hook in components that need to make authenticated API calls.
 */
export function useApi() {
  const { getToken, isLoaded, isSignedIn } = useAuth();

  const apiClient = useMemo(() => {
    // Only provide token getter if auth is loaded and user is signed in
    if (!isLoaded || !isSignedIn) {
      return createApiClient();
    }
    
    return createApiClient(async () => {
      try {
        // Use utility function to wait for a valid token
        // This retries with backoff to handle new sign-ins
        const token = await waitForClerkToken(getToken, 10, 300);
        
        if (!token) {
          console.error('[useApi] Could not get valid token from Clerk after retries');
        }
        
        return token;
      } catch (error) {
        console.error('[useApi] Failed to get Clerk token:', error);
        return null;
      }
    });
  }, [getToken, isLoaded, isSignedIn]);

  return apiClient;
}

