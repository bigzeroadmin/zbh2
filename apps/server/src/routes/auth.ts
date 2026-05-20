import { FastifyInstance } from 'fastify';
import { verify, hash } from 'argon2';
import { nanoid } from 'nanoid';
import { eq } from 'drizzle-orm';
import { db, schema } from '../db/index.js';
import { loginSchema } from 'shared';

export default async function authRoutes(app: FastifyInstance) {
  app.post('/api/auth/login', async (request, reply) => {
    const parsed = loginSchema.safeParse(request.body);
    if (!parsed.success) {
      return reply.status(400).send({ success: false, error: '请输入有效的用户名和密码' });
    }
    const { username, password } = parsed.data;
    const user = db.select().from(schema.users).where(eq(schema.users.username, username)).get();
    if (!user || user.status !== 'active') {
      return reply.status(401).send({ success: false, error: '用户名或密码错误' });
    }
    const valid = await verify(user.passwordHash, password);
    if (!valid) {
      return reply.status(401).send({ success: false, error: '用户名或密码错误' });
    }
    const sid = nanoid(32);
    const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString();
    db.insert(schema.sessions).values({ id: sid, userId: user.id, expiresAt }).run();
    reply.setCookie('sid', sid, {
      path: '/',
      httpOnly: true,
      sameSite: 'lax',
      maxAge: 7 * 24 * 60 * 60,
    });
    return { success: true, data: { id: user.id, username: user.username, role: user.role } };
  });

  app.post('/api/auth/logout', async (request, reply) => {
    const sid = request.cookies?.sid;
    if (sid) {
      db.delete(schema.sessions).where(eq(schema.sessions.id, sid)).run();
    }
    reply.clearCookie('sid', { path: '/' });
    return { success: true };
  });

  app.get('/api/auth/me', async (request) => {
    if (!request.sessionUser) {
      return { success: true, data: null };
    }
    return { success: true, data: request.sessionUser };
  });
}
