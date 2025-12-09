import { Hono } from 'hono';
import { zValidator } from '@hono/zod-validator';
import { z } from 'zod';
import { setCookie, getCookie, deleteCookie } from 'hono/cookie';
import { authService } from '../services/authService.js';

const auth = new Hono();

const loginSchema = z.object({
  benutzername: z.string().min(3, 'Benutzername muss mindestens 3 Zeichen haben').max(50),
  passwort: z.string().min(8, 'Passwort muss mindestens 8 Zeichen haben').max(100),
});

const registerSchema = z.object({
  benutzername: z.string().min(3, 'Benutzername muss mindestens 3 Zeichen haben').max(50),
  passwort: z.string().min(8, 'Passwort muss mindestens 8 Zeichen haben').max(100),
  anzeigename: z.string().max(100).optional(),
});

// POST /api/auth/login
auth.post('/login', zValidator('json', loginSchema), async (c) => {
  const { benutzername, passwort } = c.req.valid('json');

  const result = await authService.login(benutzername, passwort);
  if (!result.success) {
    return c.json({ error: result.error }, 401);
  }

  setCookie(c, 'session', result.token!, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'Lax',
    maxAge: 60 * 60 * 24 * 7, // 7 days
    path: '/',
  });

  return c.json({ benutzer: result.benutzer });
});

// POST /api/auth/register
auth.post('/register', zValidator('json', registerSchema), async (c) => {
  const data = c.req.valid('json');

  const result = await authService.register(data);
  if (!result.success) {
    return c.json({ error: result.error }, 400);
  }

  return c.json({ benutzer: result.benutzer }, 201);
});

// POST /api/auth/logout
auth.post('/logout', async (c) => {
  const token = getCookie(c, 'session');
  if (token) {
    await authService.logout(token);
  }
  deleteCookie(c, 'session');
  return c.json({ success: true });
});

// GET /api/auth/me
auth.get('/me', async (c) => {
  const token = getCookie(c, 'session');
  if (!token) {
    return c.json({ error: 'Nicht authentifiziert' }, 401);
  }

  const benutzer = await authService.validateSession(token);
  if (!benutzer) {
    return c.json({ error: 'Ungültige Sitzung' }, 401);
  }

  return c.json({ benutzer });
});

export { auth as authRoutes };
