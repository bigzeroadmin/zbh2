import Fastify from 'fastify';
import cookie from '@fastify/cookie';
import cors from '@fastify/cors';
import helmet from '@fastify/helmet';
import multipart from '@fastify/multipart';
import rateLimit from '@fastify/rate-limit';
import fastifyStatic from '@fastify/static';
import { resolve } from 'path';
import { mkdirSync } from 'fs';

import { loadSession } from './middleware/auth.js';
import authRoutes from './routes/auth.js';
import publicRoutes from './routes/public.js';
import adminRoutes from './routes/admin.js';
import uploadRoutes from './routes/upload.js';
import activationRoutes from './routes/activation.js';
import ticketRoutes from './routes/tickets.js';
import assetRoutes from './routes/assets.js';
import saasRoutes from './routes/saas.js';
import reportRoutes from './routes/reports.js';
import aiFaqRoutes from './routes/ai-faq.js';
import monitorRoutes from './routes/monitor.js';

const UPLOAD_DIR = resolve(process.cwd(), '../../data/uploads');
mkdirSync(UPLOAD_DIR, { recursive: true });

const app = Fastify({ logger: true });

async function start() {
  await app.register(helmet, { contentSecurityPolicy: false });
  await app.register(cors, { origin: true, credentials: true });
  await app.register(cookie);
  await app.register(multipart, { limits: { fileSize: 500 * 1024 * 1024 } });
  await app.register(rateLimit, { max: 200, timeWindow: '1 minute' });
  await app.register(fastifyStatic, { root: UPLOAD_DIR, prefix: '/uploads/', decorateReply: true });

  app.addHook('preHandler', loadSession);

  await app.register(authRoutes);
  await app.register(publicRoutes);
  await app.register(adminRoutes);
  await app.register(uploadRoutes);
  await app.register(activationRoutes);
  await app.register(ticketRoutes);
  await app.register(assetRoutes);
  await app.register(saasRoutes);
  await app.register(reportRoutes);
  await app.register(aiFaqRoutes);
  await app.register(monitorRoutes);

  const port = Number(process.env.PORT) || 7500;
  await app.listen({ port, host: '0.0.0.0' });
  console.log(`Server running on http://localhost:${port}`);
}

start().catch((err) => {
  console.error(err);
  process.exit(1);
});
