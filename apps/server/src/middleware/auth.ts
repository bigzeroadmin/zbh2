import { FastifyRequest, FastifyReply } from 'fastify';
import { db, schema } from '../db/index.js';
import { eq, and, gt } from 'drizzle-orm';

export interface SessionUser {
  id: number;
  username: string;
  role: 'admin' | 'user';
}

declare module 'fastify' {
  interface FastifyRequest {
    sessionUser?: SessionUser;
  }
}

export async function loadSession(request: FastifyRequest) {
  const sid = request.cookies?.sid;
  if (!sid) return;
  const session = db
    .select()
    .from(schema.sessions)
    .where(
      and(
        eq(schema.sessions.id, sid),
        gt(schema.sessions.expiresAt, new Date().toISOString())
      )
    )
    .get();
  if (!session) return;
  const user = db
    .select()
    .from(schema.users)
    .where(
      and(eq(schema.users.id, session.userId), eq(schema.users.status, 'active'))
    )
    .get();
  if (!user) return;
  request.sessionUser = { id: user.id, username: user.username, role: user.role as 'admin' | 'user' };
}

export async function requireAuth(request: FastifyRequest, reply: FastifyReply) {
  if (!request.sessionUser) {
    return reply.status(401).send({ success: false, error: '请先登录' });
  }
}

export async function requireAdmin(request: FastifyRequest, reply: FastifyReply) {
  if (!request.sessionUser) {
    return reply.status(401).send({ success: false, error: '请先登录' });
  }
  if (request.sessionUser.role !== 'admin') {
    return reply.status(403).send({ success: false, error: '权限不足' });
  }
}
