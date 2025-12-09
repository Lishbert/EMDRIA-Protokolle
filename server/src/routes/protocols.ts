import { Hono } from 'hono';
import { zValidator } from '@hono/zod-validator';
import { z } from 'zod';
import { authMiddleware } from '../middleware/auth.js';
import { protocolService } from '../services/protocolService.js';

const protocols = new Hono();

// Apply auth middleware to all routes
protocols.use('*', authMiddleware);

// Schema for protocol validation
const protocolSchema = z.object({
  chiffre: z.string().min(1, 'Chiffre ist erforderlich'),
  datum: z.string().min(1, 'Datum ist erforderlich'),
  protokollnummer: z.string().min(1, 'Protokollnummer ist erforderlich'),
  protocolType: z.enum(['Reprozessieren', 'IRI', 'CIPOS', 'Sicherer Ort']),
}).passthrough(); // Allow additional protocol-specific fields

// GET /api/protocols - List all protocols (metadata only)
protocols.get('/', async (c) => {
  const benutzerId = c.get('benutzerId');
  const list = await protocolService.getProtocolsList(benutzerId);
  return c.json(list);
});

// GET /api/protocols/export/json - Export all protocols as JSON
protocols.get('/export/json', async (c) => {
  const benutzerId = c.get('benutzerId');
  const protokolle = await protocolService.exportAllProtocols(benutzerId);

  const timestamp = new Date().toISOString().split('T')[0];
  c.header('Content-Type', 'application/json');
  c.header(
    'Content-Disposition',
    `attachment; filename="EMDR_Protokolle_${timestamp}.json"`
  );

  return c.json(protokolle);
});

// GET /api/protocols/:id - Get single protocol
protocols.get('/:id', async (c) => {
  const benutzerId = c.get('benutzerId');
  const id = c.req.param('id');

  const protokoll = await protocolService.getProtocol(benutzerId, id);
  if (!protokoll) {
    return c.json({ error: 'Protokoll nicht gefunden' }, 404);
  }

  return c.json(protokoll);
});

// POST /api/protocols - Create new protocol
protocols.post('/', zValidator('json', protocolSchema), async (c) => {
  const benutzerId = c.get('benutzerId');
  const data = c.req.valid('json');

  const protokoll = await protocolService.createProtocol(benutzerId, data);
  return c.json(protokoll, 201);
});

// POST /api/protocols/import - Import protocols from JSON
protocols.post('/import', async (c) => {
  const benutzerId = c.get('benutzerId');
  const body = await c.req.json();

  if (!body.protocols || !Array.isArray(body.protocols)) {
    return c.json({ error: 'Ungültiges Import-Format' }, 400);
  }

  const count = await protocolService.importProtocols(benutzerId, body.protocols);
  return c.json({ imported: count });
});

// PUT /api/protocols/:id - Update protocol
protocols.put('/:id', zValidator('json', protocolSchema), async (c) => {
  const benutzerId = c.get('benutzerId');
  const id = c.req.param('id');
  const data = c.req.valid('json');

  const protokoll = await protocolService.updateProtocol(benutzerId, id, data);
  if (!protokoll) {
    return c.json({ error: 'Protokoll nicht gefunden' }, 404);
  }

  return c.json(protokoll);
});

// DELETE /api/protocols/:id - Delete protocol
protocols.delete('/:id', async (c) => {
  const benutzerId = c.get('benutzerId');
  const id = c.req.param('id');

  const success = await protocolService.deleteProtocol(benutzerId, id);
  if (!success) {
    return c.json({ error: 'Protokoll nicht gefunden' }, 404);
  }

  return c.json({ success: true });
});

export { protocols as protocolRoutes };
