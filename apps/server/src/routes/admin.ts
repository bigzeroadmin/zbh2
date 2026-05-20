import { FastifyInstance } from 'fastify';
import { requireAdmin } from '../middleware/auth.js';
import { db, schema } from '../db/index.js';
import { eq, asc, desc, sql } from 'drizzle-orm';
import { hash } from 'argon2';
import {
  softwareCategorySchema,
  helpCategorySchema,
  softwareItemSchema,
  helpDocumentSchema,
  activationProductSchema,
  createUserSchema,
} from 'shared';

export default async function adminRoutes(app: FastifyInstance) {
  app.addHook('preHandler', requireAdmin);

  // ─── Software Categories ─────────────────────────
  app.get('/api/admin/software-categories', async () => {
    const rows = db.select().from(schema.softwareCategories).orderBy(asc(schema.softwareCategories.sort)).all();
    return { success: true, data: rows };
  });

  app.post('/api/admin/software-categories', async (request, reply) => {
    const parsed = softwareCategorySchema.safeParse(request.body);
    if (!parsed.success) return reply.status(400).send({ success: false, error: parsed.error.message });
    const row = db.insert(schema.softwareCategories).values(parsed.data).returning().get();
    return { success: true, data: row };
  });

  app.put('/api/admin/software-categories/:id', async (request, reply) => {
    const { id } = request.params as { id: string };
    const parsed = softwareCategorySchema.safeParse(request.body);
    if (!parsed.success) return reply.status(400).send({ success: false, error: parsed.error.message });
    db.update(schema.softwareCategories).set(parsed.data).where(eq(schema.softwareCategories.id, Number(id))).run();
    return { success: true };
  });

  app.delete('/api/admin/software-categories/:id', async (request) => {
    const { id } = request.params as { id: string };
    db.delete(schema.softwareCategories).where(eq(schema.softwareCategories.id, Number(id))).run();
    return { success: true };
  });

  // ─── Software Items ──────────────────────────────
  app.get('/api/admin/software-items', async () => {
    const rows = db.select().from(schema.softwareItems).orderBy(asc(schema.softwareItems.sort)).all();
    return { success: true, data: rows };
  });

  app.post('/api/admin/software-items', async (request, reply) => {
    const parsed = softwareItemSchema.safeParse(request.body);
    if (!parsed.success) return reply.status(400).send({ success: false, error: parsed.error.message });
    const row = db.insert(schema.softwareItems).values(parsed.data).returning().get();
    return { success: true, data: row };
  });

  app.put('/api/admin/software-items/:id', async (request, reply) => {
    const { id } = request.params as { id: string };
    const body = request.body as Record<string, unknown>;
    const updateData: Record<string, unknown> = { updatedAt: new Date().toISOString() };
    for (const key of ['title', 'description', 'categoryId', 'version', 'fileId', 'iconFileId', 'sort', 'status']) {
      if (body[key] !== undefined) updateData[key] = body[key];
    }
    db.update(schema.softwareItems).set(updateData).where(eq(schema.softwareItems.id, Number(id))).run();
    return { success: true };
  });

  app.delete('/api/admin/software-items/:id', async (request) => {
    const { id } = request.params as { id: string };
    db.delete(schema.softwareItems).where(eq(schema.softwareItems.id, Number(id))).run();
    return { success: true };
  });

  // ─── Help Categories ─────────────────────────────
  app.get('/api/admin/help-categories', async () => {
    const rows = db.select().from(schema.helpCategories).orderBy(asc(schema.helpCategories.sort)).all();
    return { success: true, data: rows };
  });

  app.post('/api/admin/help-categories', async (request, reply) => {
    const parsed = helpCategorySchema.safeParse(request.body);
    if (!parsed.success) return reply.status(400).send({ success: false, error: parsed.error.message });
    const row = db.insert(schema.helpCategories).values(parsed.data).returning().get();
    return { success: true, data: row };
  });

  app.put('/api/admin/help-categories/:id', async (request, reply) => {
    const { id } = request.params as { id: string };
    const parsed = helpCategorySchema.safeParse(request.body);
    if (!parsed.success) return reply.status(400).send({ success: false, error: parsed.error.message });
    db.update(schema.helpCategories).set(parsed.data).where(eq(schema.helpCategories.id, Number(id))).run();
    return { success: true };
  });

  app.delete('/api/admin/help-categories/:id', async (request) => {
    const { id } = request.params as { id: string };
    db.delete(schema.helpCategories).where(eq(schema.helpCategories.id, Number(id))).run();
    return { success: true };
  });

  // ─── Help Documents ──────────────────────────────
  app.get('/api/admin/help-documents', async () => {
    const rows = db.select().from(schema.helpDocuments).orderBy(desc(schema.helpDocuments.createdAt)).all();
    return { success: true, data: rows };
  });

  app.post('/api/admin/help-documents', async (request, reply) => {
    const parsed = helpDocumentSchema.safeParse(request.body);
    if (!parsed.success) return reply.status(400).send({ success: false, error: parsed.error.message });
    const values: Record<string, unknown> = { ...parsed.data };
    if (parsed.data.status === 'published') values.publishedAt = new Date().toISOString();
    const row = db.insert(schema.helpDocuments).values(values as any).returning().get();
    return { success: true, data: row };
  });

  app.put('/api/admin/help-documents/:id', async (request, reply) => {
    const { id } = request.params as { id: string };
    const body = request.body as Record<string, unknown>;
    const updateData: Record<string, unknown> = { updatedAt: new Date().toISOString() };
    for (const key of ['title', 'body', 'categoryId', 'sort', 'status']) {
      if (body[key] !== undefined) updateData[key] = body[key];
    }
    if (body.status === 'published') updateData.publishedAt = new Date().toISOString();
    if (body.status === 'archived') updateData.archivedAt = new Date().toISOString();
    db.update(schema.helpDocuments).set(updateData).where(eq(schema.helpDocuments.id, Number(id))).run();
    return { success: true };
  });

  app.delete('/api/admin/help-documents/:id', async (request) => {
    const { id } = request.params as { id: string };
    db.delete(schema.helpDocuments).where(eq(schema.helpDocuments.id, Number(id))).run();
    return { success: true };
  });

  // ─── Activation Products ─────────────────────────
  app.get('/api/admin/activation-products', async () => {
    const rows = db.select().from(schema.activationProducts).all();
    return { success: true, data: rows };
  });

  app.post('/api/admin/activation-products', async (request, reply) => {
    const parsed = activationProductSchema.safeParse(request.body);
    if (!parsed.success) return reply.status(400).send({ success: false, error: parsed.error.message });
    const row = db.insert(schema.activationProducts).values(parsed.data).returning().get();
    return { success: true, data: row };
  });

  app.put('/api/admin/activation-products/:id', async (request, reply) => {
    const { id } = request.params as { id: string };
    const body = request.body as Record<string, unknown>;
    const updateData: Record<string, unknown> = {};
    for (const key of ['code', 'name', 'description', 'clientDownloadUrl', 'clientFileId']) {
      if (body[key] !== undefined) updateData[key] = body[key];
    }
    db.update(schema.activationProducts).set(updateData).where(eq(schema.activationProducts.id, Number(id))).run();
    return { success: true };
  });

  // ─── Activation Codes (batch import & list) ──────
  app.get('/api/admin/activation-codes', async (request) => {
    const query = request.query as { productId?: string; page?: string; pageSize?: string };
    const page = Math.max(1, Number(query.page) || 1);
    const pageSize = Math.min(100, Math.max(1, Number(query.pageSize) || 20));

    let baseQuery = db.select().from(schema.activationCodes).orderBy(desc(schema.activationCodes.createdAt));
    if (query.productId) {
      baseQuery = db.select().from(schema.activationCodes)
        .where(eq(schema.activationCodes.productId, Number(query.productId)))
        .orderBy(desc(schema.activationCodes.createdAt)) as any;
    }
    const all = (baseQuery as any).all() as any[];
    const total = all.length;
    const items = all.slice((page - 1) * pageSize, page * pageSize);
    return { success: true, data: { items, total, page, pageSize } };
  });

  app.post('/api/admin/activation-codes/import', async (request, reply) => {
    const body = request.body as { productId: number; codes: string[] };
    if (!body.productId || !Array.isArray(body.codes) || body.codes.length === 0) {
      return reply.status(400).send({ success: false, error: '请提供产品ID和激活码列表' });
    }
    const batchId = Date.now().toString(36);
    let imported = 0;
    for (const code6 of body.codes) {
      const trimmed = code6.trim();
      if (trimmed.length !== 6) continue;
      db.insert(schema.activationCodes).values({
        productId: body.productId,
        code6: trimmed,
        batchId,
        status: 'available',
      }).run();
      imported++;
    }
    return { success: true, data: { imported, batchId } };
  });

  // ─── Activation Grants (audit) ───────────────────
  app.get('/api/admin/activation-grants', async () => {
    const rows = db
      .select({
        id: schema.activationCodeGrants.id,
        codeId: schema.activationCodeGrants.codeId,
        userId: schema.activationCodeGrants.userId,
        productId: schema.activationCodeGrants.productId,
        grantedAt: schema.activationCodeGrants.grantedAt,
        code6: schema.activationCodes.code6,
        username: schema.users.username,
        productName: schema.activationProducts.name,
      })
      .from(schema.activationCodeGrants)
      .leftJoin(schema.activationCodes, eq(schema.activationCodeGrants.codeId, schema.activationCodes.id))
      .leftJoin(schema.users, eq(schema.activationCodeGrants.userId, schema.users.id))
      .leftJoin(schema.activationProducts, eq(schema.activationCodeGrants.productId, schema.activationProducts.id))
      .orderBy(desc(schema.activationCodeGrants.grantedAt))
      .all();
    return { success: true, data: rows };
  });

  // ─── Users Management ────────────────────────────
  app.get('/api/admin/users', async () => {
    const rows = db
      .select({
        id: schema.users.id,
        username: schema.users.username,
        role: schema.users.role,
        status: schema.users.status,
        createdAt: schema.users.createdAt,
      })
      .from(schema.users)
      .orderBy(desc(schema.users.createdAt))
      .all();
    return { success: true, data: rows };
  });

  app.post('/api/admin/users', async (request, reply) => {
    const parsed = createUserSchema.safeParse(request.body);
    if (!parsed.success) return reply.status(400).send({ success: false, error: parsed.error.message });
    const existing = db.select().from(schema.users).where(eq(schema.users.username, parsed.data.username)).get();
    if (existing) return reply.status(409).send({ success: false, error: '用户名已存在' });
    const passwordHash = await hash(parsed.data.password);
    const row = db.insert(schema.users).values({
      username: parsed.data.username,
      passwordHash,
      role: parsed.data.role,
    }).returning().get();
    return { success: true, data: { id: row.id, username: row.username, role: row.role } };
  });

  app.put('/api/admin/users/:id', async (request, reply) => {
    const { id } = request.params as { id: string };
    const body = request.body as Record<string, unknown>;
    const updateData: Record<string, unknown> = {};
    if (body.role) updateData.role = body.role;
    if (body.status) updateData.status = body.status;
    if (typeof body.password === 'string' && body.password.length >= 6) {
      updateData.passwordHash = await hash(body.password as string);
    }
    db.update(schema.users).set(updateData).where(eq(schema.users.id, Number(id))).run();
    return { success: true };
  });

  app.delete('/api/admin/users/:id', async (request, reply) => {
    const { id } = request.params as { id: string };
    if (request.sessionUser!.id === Number(id)) {
      return reply.status(400).send({ success: false, error: '不能删除自己' });
    }
    db.delete(schema.users).where(eq(schema.users.id, Number(id))).run();
    return { success: true };
  });

  // ─── Files list ──────────────────────────────────
  app.get('/api/admin/files', async () => {
    const rows = db.select().from(schema.files).orderBy(desc(schema.files.createdAt)).all();
    return { success: true, data: rows };
  });
}
