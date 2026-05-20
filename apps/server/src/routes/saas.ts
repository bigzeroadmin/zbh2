import { FastifyInstance } from 'fastify';
import { requireAuth, requireAdmin } from '../middleware/auth.js';
import { db, schema } from '../db/index.js';
import { eq, desc, and } from 'drizzle-orm';
import { nanoid } from 'nanoid';

function generatePassword() {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZabcdefghjkmnpqrstuvwxyz23456789!@#$';
  let pwd = '';
  for (let i = 0; i < 12; i++) pwd += chars[Math.floor(Math.random() * chars.length)];
  return pwd;
}

export default async function saasRoutes(app: FastifyInstance) {
  // ─── Admin: Services & Plans ─────────────────────
  app.get('/api/admin/saas-services', { preHandler: requireAdmin }, async () => {
    const services = db.select().from(schema.saasServices).all();
    const plans = db.select().from(schema.saasPlans).orderBy(schema.saasPlans.sort).all();
    const result = services.map(s => ({
      ...s,
      plans: plans.filter(p => p.serviceId === s.id),
    }));
    return { success: true, data: result };
  });

  app.post('/api/admin/saas-services', { preHandler: requireAdmin }, async (request) => {
    const body = request.body as { name: string; code: string; description?: string };
    const row = db.insert(schema.saasServices).values({
      name: body.name, code: body.code, description: body.description || '',
    }).returning().get();
    return { success: true, data: row };
  });

  app.put('/api/admin/saas-services/:id', { preHandler: requireAdmin }, async (request) => {
    const { id } = request.params as { id: string };
    const body = request.body as any;
    const update: Record<string, unknown> = {};
    for (const k of ['name', 'code', 'description', 'status']) {
      if (body[k] !== undefined) update[k] = body[k];
    }
    db.update(schema.saasServices).set(update).where(eq(schema.saasServices.id, Number(id))).run();
    return { success: true };
  });

  // ─── Admin: Plans ────────────────────────────────
  app.post('/api/admin/saas-plans', { preHandler: requireAdmin }, async (request) => {
    const body = request.body as any;
    const row = db.insert(schema.saasPlans).values({
      serviceId: body.serviceId, name: body.name,
      description: body.description || '', maxUsers: body.maxUsers || 0,
      price: body.price || 0, sort: body.sort || 0,
    }).returning().get();
    return { success: true, data: row };
  });

  app.put('/api/admin/saas-plans/:id', { preHandler: requireAdmin }, async (request) => {
    const { id } = request.params as { id: string };
    const body = request.body as any;
    const update: Record<string, unknown> = {};
    for (const k of ['name', 'description', 'maxUsers', 'price', 'sort']) {
      if (body[k] !== undefined) update[k] = body[k];
    }
    db.update(schema.saasPlans).set(update).where(eq(schema.saasPlans.id, Number(id))).run();
    return { success: true };
  });

  app.delete('/api/admin/saas-plans/:id', { preHandler: requireAdmin }, async (request) => {
    const { id } = request.params as { id: string };
    db.delete(schema.saasPlans).where(eq(schema.saasPlans.id, Number(id))).run();
    return { success: true };
  });

  // ─── Admin: Accounts management ──────────────────
  app.get('/api/admin/saas-accounts', { preHandler: requireAdmin }, async () => {
    const rows = db.select({
      id: schema.saasAccounts.id, serviceId: schema.saasAccounts.serviceId,
      planId: schema.saasAccounts.planId, userId: schema.saasAccounts.userId,
      accountName: schema.saasAccounts.accountName, status: schema.saasAccounts.status,
      expiresAt: schema.saasAccounts.expiresAt, createdAt: schema.saasAccounts.createdAt,
      username: schema.users.username, serviceName: schema.saasServices.name,
    }).from(schema.saasAccounts)
      .leftJoin(schema.users, eq(schema.saasAccounts.userId, schema.users.id))
      .leftJoin(schema.saasServices, eq(schema.saasAccounts.serviceId, schema.saasServices.id))
      .orderBy(desc(schema.saasAccounts.createdAt)).all();
    return { success: true, data: rows };
  });

  // Admin: provision account (auto-generate password)
  app.post('/api/admin/saas-accounts', { preHandler: requireAdmin }, async (request, reply) => {
    const body = request.body as { serviceId: number; planId?: number; userId: number; accountName?: string };
    const user = db.select().from(schema.users).where(eq(schema.users.id, body.userId)).get();
    if (!user) return reply.status(404).send({ success: false, error: '用户不存在' });
    const password = generatePassword();
    const acctName = body.accountName || user.username;
    const row = db.insert(schema.saasAccounts).values({
      serviceId: body.serviceId, planId: body.planId || null,
      userId: body.userId, accountName: acctName, accountPassword: password, status: 'active',
    }).returning().get();
    return { success: true, data: { ...row, generatedPassword: password } };
  });

  // Admin: reset password
  app.post('/api/admin/saas-accounts/:id/reset-password', { preHandler: requireAdmin }, async (request) => {
    const { id } = request.params as { id: string };
    const password = generatePassword();
    db.update(schema.saasAccounts).set({ accountPassword: password, updatedAt: new Date().toISOString() })
      .where(eq(schema.saasAccounts.id, Number(id))).run();
    return { success: true, data: { newPassword: password } };
  });

  // Admin: enable / disable account
  app.put('/api/admin/saas-accounts/:id', { preHandler: requireAdmin }, async (request) => {
    const { id } = request.params as { id: string };
    const body = request.body as { status?: string; planId?: number };
    const update: Record<string, unknown> = { updatedAt: new Date().toISOString() };
    if (body.status) update.status = body.status;
    if (body.planId !== undefined) update.planId = body.planId;
    db.update(schema.saasAccounts).set(update).where(eq(schema.saasAccounts.id, Number(id))).run();
    return { success: true };
  });

  // ─── User: apply for SaaS account ────────────────
  app.get('/api/public/saas-services', async () => {
    const services = db.select().from(schema.saasServices).where(eq(schema.saasServices.status, 'active')).all();
    const plans = db.select().from(schema.saasPlans).orderBy(schema.saasPlans.sort).all();
    return {
      success: true,
      data: services.map(s => ({ ...s, plans: plans.filter(p => p.serviceId === s.id) })),
    };
  });

  app.post('/api/me/saas-apply', { preHandler: requireAuth }, async (request, reply) => {
    const body = request.body as { serviceId: number; planId?: number };
    const userId = request.sessionUser!.id;
    const existing = db.select().from(schema.saasAccounts)
      .where(and(eq(schema.saasAccounts.userId, userId), eq(schema.saasAccounts.serviceId, body.serviceId))).get();
    if (existing) return reply.status(409).send({ success: false, error: '您已拥有该服务的账号' });

    const password = generatePassword();
    const user = db.select().from(schema.users).where(eq(schema.users.id, userId)).get();
    const row = db.insert(schema.saasAccounts).values({
      serviceId: body.serviceId, planId: body.planId || null,
      userId, accountName: user!.username, accountPassword: password, status: 'active',
    }).returning().get();
    return { success: true, data: { accountName: row.accountName, password } };
  });

  app.get('/api/me/saas-accounts', { preHandler: requireAuth }, async (request) => {
    const rows = db.select({
      id: schema.saasAccounts.id, accountName: schema.saasAccounts.accountName,
      status: schema.saasAccounts.status, serviceName: schema.saasServices.name,
      planName: schema.saasPlans.name, createdAt: schema.saasAccounts.createdAt,
    }).from(schema.saasAccounts)
      .leftJoin(schema.saasServices, eq(schema.saasAccounts.serviceId, schema.saasServices.id))
      .leftJoin(schema.saasPlans, eq(schema.saasAccounts.planId, schema.saasPlans.id))
      .where(eq(schema.saasAccounts.userId, request.sessionUser!.id)).all();
    return { success: true, data: rows };
  });
}
