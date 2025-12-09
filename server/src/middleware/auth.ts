import { createMiddleware } from 'hono/factory';
import { getCookie } from 'hono/cookie';
import { authService, type BenutzerInfo } from '../services/authService.js';

// Extend Hono context variables
declare module 'hono' {
  interface ContextVariableMap {
    benutzerId: string;
    benutzer: BenutzerInfo;
  }
}

export const authMiddleware = createMiddleware(async (c, next) => {
  const token = getCookie(c, 'session');

  if (!token) {
    return c.json({ error: 'Authentifizierung erforderlich' }, 401);
  }

  const benutzer = await authService.validateSession(token);
  if (!benutzer) {
    return c.json({ error: 'Ungültige oder abgelaufene Sitzung' }, 401);
  }

  c.set('benutzerId', benutzer.id);
  c.set('benutzer', benutzer);

  await next();
});
