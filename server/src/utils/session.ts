import { randomUUID } from 'crypto';

export function generateSessionToken(): string {
  return randomUUID();
}

export function getSessionExpiryDate(days: number = 7): Date {
  return new Date(Date.now() + days * 24 * 60 * 60 * 1000);
}
