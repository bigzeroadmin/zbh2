import { FastifyInstance } from 'fastify';
import { requireAuth, requireAdmin } from '../middleware/auth.js';
import { db, schema } from '../db/index.js';
import { eq, desc, and } from 'drizzle-orm';

export default async function ticketRoutes(app: FastifyInstance) {
  // User: submit a ticket
  app.post('/api/me/tickets', { preHandler: requireAuth }, async (request, reply) => {
    const body = request.body as { title: string; description: string; type?: string; priority?: string };
    if (!body.title) return reply.status(400).send({ success: false, error: '请填写标题' });
    const row = db.insert(schema.tickets).values({
      title: body.title,
      description: body.description || '',
      type: (body.type as any) || 'question',
      priority: (body.priority as any) || 'medium',
      submitterId: request.sessionUser!.id,
    }).returning().get();
    return { success: true, data: row };
  });

  // User: list own tickets
  app.get('/api/me/tickets', { preHandler: requireAuth }, async (request) => {
    const rows = db.select().from(schema.tickets)
      .where(eq(schema.tickets.submitterId, request.sessionUser!.id))
      .orderBy(desc(schema.tickets.createdAt)).all();
    return { success: true, data: rows };
  });

  // User: get ticket detail with replies
  app.get('/api/me/tickets/:id', { preHandler: requireAuth }, async (request, reply) => {
    const { id } = request.params as { id: string };
    const ticket = db.select().from(schema.tickets)
      .where(and(eq(schema.tickets.id, Number(id)), eq(schema.tickets.submitterId, request.sessionUser!.id))).get();
    if (!ticket) return reply.status(404).send({ success: false, error: '工单不存在' });
    const replies = db.select({
      id: schema.ticketReplies.id,
      content: schema.ticketReplies.content,
      createdAt: schema.ticketReplies.createdAt,
      userId: schema.ticketReplies.userId,
      username: schema.users.username,
    }).from(schema.ticketReplies)
      .leftJoin(schema.users, eq(schema.ticketReplies.userId, schema.users.id))
      .where(eq(schema.ticketReplies.ticketId, Number(id)))
      .orderBy(schema.ticketReplies.createdAt).all();
    return { success: true, data: { ...ticket, replies } };
  });

  // User: reply to own ticket
  app.post('/api/me/tickets/:id/reply', { preHandler: requireAuth }, async (request, reply) => {
    const { id } = request.params as { id: string };
    const body = request.body as { content: string };
    if (!body.content) return reply.status(400).send({ success: false, error: '请填写内容' });
    const ticket = db.select().from(schema.tickets)
      .where(and(eq(schema.tickets.id, Number(id)), eq(schema.tickets.submitterId, request.sessionUser!.id))).get();
    if (!ticket) return reply.status(404).send({ success: false, error: '工单不存在' });
    const row = db.insert(schema.ticketReplies).values({
      ticketId: Number(id),
      userId: request.sessionUser!.id,
      content: body.content,
    }).returning().get();
    return { success: true, data: row };
  });

  // Admin: list all tickets
  app.get('/api/admin/tickets', { preHandler: requireAdmin }, async (request) => {
    const query = request.query as { status?: string };
    let rows;
    if (query.status) {
      rows = db.select({
        id: schema.tickets.id, title: schema.tickets.title, type: schema.tickets.type,
        priority: schema.tickets.priority, status: schema.tickets.status,
        submitterId: schema.tickets.submitterId, assigneeId: schema.tickets.assigneeId,
        createdAt: schema.tickets.createdAt, updatedAt: schema.tickets.updatedAt,
        resolvedAt: schema.tickets.resolvedAt, description: schema.tickets.description,
        submitter: schema.users.username,
      }).from(schema.tickets)
        .leftJoin(schema.users, eq(schema.tickets.submitterId, schema.users.id))
        .where(eq(schema.tickets.status, query.status as any))
        .orderBy(desc(schema.tickets.createdAt)).all();
    } else {
      rows = db.select({
        id: schema.tickets.id, title: schema.tickets.title, type: schema.tickets.type,
        priority: schema.tickets.priority, status: schema.tickets.status,
        submitterId: schema.tickets.submitterId, assigneeId: schema.tickets.assigneeId,
        createdAt: schema.tickets.createdAt, updatedAt: schema.tickets.updatedAt,
        resolvedAt: schema.tickets.resolvedAt, description: schema.tickets.description,
        submitter: schema.users.username,
      }).from(schema.tickets)
        .leftJoin(schema.users, eq(schema.tickets.submitterId, schema.users.id))
        .orderBy(desc(schema.tickets.createdAt)).all();
    }
    return { success: true, data: rows };
  });

  // Admin: get ticket detail
  app.get('/api/admin/tickets/:id', { preHandler: requireAdmin }, async (request, reply) => {
    const { id } = request.params as { id: string };
    const ticket = db.select().from(schema.tickets).where(eq(schema.tickets.id, Number(id))).get();
    if (!ticket) return reply.status(404).send({ success: false, error: '工单不存在' });
    const replies = db.select({
      id: schema.ticketReplies.id, content: schema.ticketReplies.content,
      createdAt: schema.ticketReplies.createdAt, userId: schema.ticketReplies.userId,
      username: schema.users.username,
    }).from(schema.ticketReplies)
      .leftJoin(schema.users, eq(schema.ticketReplies.userId, schema.users.id))
      .where(eq(schema.ticketReplies.ticketId, Number(id)))
      .orderBy(schema.ticketReplies.createdAt).all();
    return { success: true, data: { ...ticket, replies } };
  });

  // Admin: assign / change status
  app.put('/api/admin/tickets/:id', { preHandler: requireAdmin }, async (request) => {
    const { id } = request.params as { id: string };
    const body = request.body as { status?: string; assigneeId?: number };
    const update: Record<string, unknown> = { updatedAt: new Date().toISOString() };
    if (body.status) update.status = body.status;
    if (body.assigneeId !== undefined) update.assigneeId = body.assigneeId;
    if (body.status === 'resolved') update.resolvedAt = new Date().toISOString();
    db.update(schema.tickets).set(update).where(eq(schema.tickets.id, Number(id))).run();
    return { success: true };
  });

  // Admin: reply to ticket
  app.post('/api/admin/tickets/:id/reply', { preHandler: requireAdmin }, async (request, reply) => {
    const { id } = request.params as { id: string };
    const body = request.body as { content: string };
    if (!body.content) return reply.status(400).send({ success: false, error: '请填写内容' });
    const row = db.insert(schema.ticketReplies).values({
      ticketId: Number(id),
      userId: request.sessionUser!.id,
      content: body.content,
    }).returning().get();
    db.update(schema.tickets).set({ updatedAt: new Date().toISOString() }).where(eq(schema.tickets.id, Number(id))).run();
    return { success: true, data: row };
  });
}
