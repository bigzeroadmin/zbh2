import { FastifyInstance } from 'fastify';
import { requireAdmin } from '../middleware/auth.js';
import { db, schema } from '../db/index.js';
import { eq, desc, asc, sql } from 'drizzle-orm';

export default async function assetRoutes(app: FastifyInstance) {
  app.addHook('preHandler', requireAdmin);

  // ─── Asset Categories ────────────────────────────
  app.get('/api/admin/asset-categories', async () => {
    return { success: true, data: db.select().from(schema.assetCategories).orderBy(asc(schema.assetCategories.sort)).all() };
  });
  app.post('/api/admin/asset-categories', async (request) => {
    const body = request.body as { name: string; sort?: number };
    const row = db.insert(schema.assetCategories).values({ name: body.name, sort: body.sort || 0 }).returning().get();
    return { success: true, data: row };
  });
  app.put('/api/admin/asset-categories/:id', async (request) => {
    const { id } = request.params as { id: string };
    const body = request.body as { name?: string; sort?: number };
    db.update(schema.assetCategories).set(body).where(eq(schema.assetCategories.id, Number(id))).run();
    return { success: true };
  });
  app.delete('/api/admin/asset-categories/:id', async (request) => {
    const { id } = request.params as { id: string };
    db.delete(schema.assetCategories).where(eq(schema.assetCategories.id, Number(id))).run();
    return { success: true };
  });

  // ─── Assets CRUD ─────────────────────────────────
  app.get('/api/admin/assets', async () => {
    const rows = db.select().from(schema.assets).orderBy(desc(schema.assets.createdAt)).all();
    return { success: true, data: rows };
  });

  app.post('/api/admin/assets', async (request) => {
    const body = request.body as any;
    const row = db.insert(schema.assets).values({
      assetCode: body.assetCode,
      name: body.name,
      categoryId: body.categoryId || null,
      brand: body.brand || '',
      model: body.model || '',
      serialNumber: body.serialNumber || '',
      status: body.status || 'in_stock',
      purchaseDate: body.purchaseDate || null,
      purchasePrice: body.purchasePrice || 0,
      warrantyExpiry: body.warrantyExpiry || null,
      location: body.location || '',
      notes: body.notes || '',
    }).returning().get();
    return { success: true, data: row };
  });

  app.put('/api/admin/assets/:id', async (request) => {
    const { id } = request.params as { id: string };
    const body = request.body as any;
    const update: Record<string, unknown> = { updatedAt: new Date().toISOString() };
    for (const key of ['name', 'categoryId', 'brand', 'model', 'serialNumber', 'status', 'assigneeId', 'purchaseDate', 'purchasePrice', 'warrantyExpiry', 'location', 'notes']) {
      if (body[key] !== undefined) update[key] = body[key];
    }
    db.update(schema.assets).set(update).where(eq(schema.assets.id, Number(id))).run();
    return { success: true };
  });

  app.delete('/api/admin/assets/:id', async (request) => {
    const { id } = request.params as { id: string };
    db.delete(schema.assets).where(eq(schema.assets.id, Number(id))).run();
    return { success: true };
  });

  // ─── Asset Operations (check_in, check_out, etc.) ─
  app.post('/api/admin/assets/:id/operate', async (request, reply) => {
    const { id } = request.params as { id: string };
    const body = request.body as { action: string; targetUserId?: number; notes?: string };
    const asset = db.select().from(schema.assets).where(eq(schema.assets.id, Number(id))).get();
    if (!asset) return reply.status(404).send({ success: false, error: '资产不存在' });

    const statusMap: Record<string, string> = {
      check_out: 'in_use', check_in: 'in_stock', maintenance: 'maintenance',
      return: 'in_stock', retire: 'retired', scrap: 'scrapped',
    };
    const newStatus = statusMap[body.action];
    if (!newStatus) return reply.status(400).send({ success: false, error: '无效操作' });

    db.insert(schema.assetRecords).values({
      assetId: Number(id),
      action: body.action as any,
      operatorId: request.sessionUser!.id,
      targetUserId: body.targetUserId || null,
      notes: body.notes || '',
    }).run();

    const assetUpdate: Record<string, unknown> = { status: newStatus, updatedAt: new Date().toISOString() };
    if (body.action === 'check_out' && body.targetUserId) assetUpdate.assigneeId = body.targetUserId;
    if (['check_in', 'return'].includes(body.action)) assetUpdate.assigneeId = null;
    db.update(schema.assets).set(assetUpdate).where(eq(schema.assets.id, Number(id))).run();

    return { success: true };
  });

  // ─── Asset Records ───────────────────────────────
  app.get('/api/admin/asset-records', async (request) => {
    const query = request.query as { assetId?: string };
    let rows;
    if (query.assetId) {
      rows = db.select().from(schema.assetRecords)
        .where(eq(schema.assetRecords.assetId, Number(query.assetId)))
        .orderBy(desc(schema.assetRecords.createdAt)).all();
    } else {
      rows = db.select().from(schema.assetRecords).orderBy(desc(schema.assetRecords.createdAt)).all();
    }
    return { success: true, data: rows };
  });

  // ─── Asset Approvals ─────────────────────────────
  app.get('/api/admin/asset-approvals', async () => {
    const rows = db.select().from(schema.assetApprovals).orderBy(desc(schema.assetApprovals.createdAt)).all();
    return { success: true, data: rows };
  });

  app.post('/api/admin/asset-approvals', async (request) => {
    const body = request.body as { assetId: number; type: string; reason?: string };
    const row = db.insert(schema.assetApprovals).values({
      assetId: body.assetId,
      type: body.type as any,
      requesterId: request.sessionUser!.id,
      reason: body.reason || '',
    }).returning().get();
    return { success: true, data: row };
  });

  app.put('/api/admin/asset-approvals/:id', async (request) => {
    const { id } = request.params as { id: string };
    const body = request.body as { status: string; comment?: string };
    db.update(schema.assetApprovals).set({
      status: body.status as any,
      approverId: request.sessionUser!.id,
      comment: body.comment || '',
      updatedAt: new Date().toISOString(),
    }).where(eq(schema.assetApprovals.id, Number(id))).run();
    return { success: true };
  });

  // ─── Asset Statistics ────────────────────────────
  app.get('/api/admin/asset-stats', async () => {
    const all = db.select().from(schema.assets).all();
    const byStatus: Record<string, number> = {};
    const byCategory: Record<string, number> = {};
    let totalValue = 0;
    for (const a of all) {
      byStatus[a.status] = (byStatus[a.status] || 0) + 1;
      const catId = String(a.categoryId || '未分类');
      byCategory[catId] = (byCategory[catId] || 0) + 1;
      totalValue += a.purchasePrice || 0;
    }
    const categories = db.select().from(schema.assetCategories).all();
    const catMap = Object.fromEntries(categories.map(c => [String(c.id), c.name]));
    const byCategoryNamed = Object.fromEntries(
      Object.entries(byCategory).map(([k, v]) => [catMap[k] || k, v])
    );
    return { success: true, data: { total: all.length, byStatus, byCategory: byCategoryNamed, totalValue } };
  });
}
