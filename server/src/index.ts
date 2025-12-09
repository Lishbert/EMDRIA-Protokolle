import { Hono } from 'hono';
import { cors } from 'hono/cors';
import { logger } from 'hono/logger';
import { serve } from '@hono/node-server';
import { authRoutes } from './routes/auth.js';
import { protocolRoutes } from './routes/protocols.js';

const app = new Hono();

// Middleware
app.use('*', logger());
app.use(
  '*',
  cors({
    origin: ['http://localhost:5173'], // Vite dev server
    credentials: true,
  })
);

// Error handling
app.onError((err, c) => {
  console.error('Server error:', err);
  return c.json(
    {
      error: process.env.NODE_ENV === 'production'
        ? 'Interner Serverfehler'
        : err.message,
    },
    500
  );
});

// Routes
const routes = app
  .route('/api/auth', authRoutes)
  .route('/api/protocols', protocolRoutes);

// Health check
app.get('/api/health', (c) => c.json({ status: 'ok', timestamp: Date.now() }));

// Start server
const port = Number(process.env.PORT) || 3001;

console.log(`🚀 Server läuft auf http://localhost:${port}`);

serve({
  fetch: app.fetch,
  port,
});

// Export type for Hono RPC client
export type AppType = typeof routes;
