import { FastifyInstance } from 'fastify';
import { requireAdmin } from '../middleware/auth.js';
import { db, schema } from '../db/index.js';
import { createWriteStream, mkdirSync } from 'fs';
import { resolve } from 'path';
import { nanoid } from 'nanoid';
import { pipeline } from 'stream/promises';
import { createHash } from 'crypto';
import { eq } from 'drizzle-orm';

const UPLOAD_DIR = resolve(process.cwd(), '../../data/uploads');
mkdirSync(UPLOAD_DIR, { recursive: true });

export default async function uploadRoutes(app: FastifyInstance) {
  app.post('/api/admin/upload', { preHandler: requireAdmin }, async (request, reply) => {
    const data = await request.file();
    if (!data) {
      return reply.status(400).send({ success: false, error: '未提供文件' });
    }
    const ext = data.filename.includes('.') ? '.' + data.filename.split('.').pop() : '';
    const storageName = nanoid(16) + ext;
    const storagePath = resolve(UPLOAD_DIR, storageName);

    const hashStream = createHash('sha256');
    let size = 0;
    const ws = createWriteStream(storagePath);

    const chunks: Buffer[] = [];
    for await (const chunk of data.file) {
      const buf = Buffer.isBuffer(chunk) ? chunk : Buffer.from(chunk);
      chunks.push(buf);
      hashStream.update(buf);
      size += buf.length;
      ws.write(buf);
    }
    ws.end();
    const fileHash = hashStream.digest('hex');

    const inserted = db.insert(schema.files).values({
      originalName: data.filename,
      storagePath: storageName,
      mime: data.mimetype,
      size,
      hash: fileHash,
      uploaderId: request.sessionUser!.id,
    }).returning().get();

    return { success: true, data: inserted };
  });

  app.get('/api/public/download/:fileId', async (request, reply) => {
    const { fileId } = request.params as { fileId: string };
    const file = db.select().from(schema.files).where(eq(schema.files.id, Number(fileId))).get();
    if (!file) {
      return reply.status(404).send({ success: false, error: '文件不存在' });
    }
    const filePath = resolve(UPLOAD_DIR, file.storagePath);
    reply.header('Content-Disposition', `attachment; filename="${encodeURIComponent(file.originalName)}"`);
    reply.header('Content-Type', file.mime);
    return reply.sendFile(file.storagePath, UPLOAD_DIR);
  });
}
