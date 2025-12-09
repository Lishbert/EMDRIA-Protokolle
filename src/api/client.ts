import { hc } from 'hono/client';
import type { AppType } from '../../server/src/index.js';

// Create type-safe Hono RPC client
export const api = hc<AppType>('', {
  init: {
    credentials: 'include', // Include cookies for session auth
  },
});

// Helper to handle API errors
export async function handleApiResponse<T>(response: Response): Promise<T> {
  if (!response.ok) {
    const error = await response.json().catch(() => ({ error: 'Unbekannter Fehler' }));
    throw new Error(error.error || `HTTP ${response.status}`);
  }
  return response.json();
}

// Type for API errors
export interface ApiError {
  error: string;
}
