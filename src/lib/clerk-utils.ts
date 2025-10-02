/**
 * Utility functions for working with Clerk authentication
 */

/**
 * Wait for Clerk session to be fully ready with a valid token.
 * This is useful after sign-in to ensure the token is available before making API calls.
 * 
 * @param getToken - The getToken function from useAuth()
 * @param maxAttempts - Maximum number of attempts to get a token (default: 10)
 * @param delayMs - Delay between attempts in milliseconds (default: 300ms)
 * @returns Promise that resolves with the token or null if timeout
 */
export async function waitForClerkToken(
  getToken: () => Promise<string | null>,
  maxAttempts: number = 10,
  delayMs: number = 300
): Promise<string | null> {
  for (let attempt = 1; attempt <= maxAttempts; attempt++) {
    try {
      const token = await getToken();
      
      if (token) {
        console.log(`[ClerkUtils] Token retrieved successfully on attempt ${attempt}`);
        return token;
      }
      
      console.log(`[ClerkUtils] No token yet, attempt ${attempt}/${maxAttempts}`);
      
      if (attempt < maxAttempts) {
        await new Promise(resolve => setTimeout(resolve, delayMs));
      }
    } catch (error) {
      console.error(`[ClerkUtils] Error getting token on attempt ${attempt}:`, error);
      
      if (attempt < maxAttempts) {
        await new Promise(resolve => setTimeout(resolve, delayMs));
      }
    }
  }
  
  console.error('[ClerkUtils] Failed to get token after max attempts');
  return null;
}

/**
 * Check if a Clerk token is valid (not expired, properly formatted)
 * This is a basic check and doesn't verify the signature
 */
export function isTokenValid(token: string | null): boolean {
  if (!token) return false;
  
  // Basic JWT format check (three parts separated by dots)
  const parts = token.split('.');
  if (parts.length !== 3) {
    console.warn('[ClerkUtils] Token does not have valid JWT format');
    return false;
  }
  
  try {
    // Decode the payload (second part)
    const payload = JSON.parse(atob(parts[1]));
    
    // Check if token has expired
    if (payload.exp) {
      const expirationTime = payload.exp * 1000; // Convert to milliseconds
      const now = Date.now();
      
      if (now >= expirationTime) {
        console.warn('[ClerkUtils] Token has expired');
        return false;
      }
    }
    
    return true;
  } catch (error) {
    console.error('[ClerkUtils] Error validating token:', error);
    return false;
  }
}

