import { FastifyInstance } from 'fastify';
import { db, schema } from '../db/index.js';
import { eq, asc } from 'drizzle-orm';

export default async function publicRoutes(app: FastifyInstance) {
  // Software categories with published items
  app.get('/api/public/software', async () => {
    const categories = db.select().from(schema.softwareCategories).orderBy(asc(schema.softwareCategories.sort)).all();
    const items = db.select().from(schema.softwareItems).where(eq(schema.softwareItems.status, 'published')).orderBy(asc(schema.softwareItems.sort)).all();
    const tree = categories.map((cat) => ({
      ...cat,
      items: items.filter((i) => i.categoryId === cat.id),
    }));
    return { success: true, data: tree };
  });

  app.get('/api/public/software/:id', async (request, reply) => {
    const { id } = request.params as { id: string };
    const item = db.select().from(schema.softwareItems).where(eq(schema.softwareItems.id, Number(id))).get();
    if (!item || item.status !== 'published') {
      return reply.status(404).send({ success: false, error: '未找到软件' });
    }
    return { success: true, data: item };
  });

  // Help categories with published documents
  app.get('/api/public/help', async () => {
    const categories = db.select().from(schema.helpCategories).orderBy(asc(schema.helpCategories.sort)).all();
    const docs = db.select().from(schema.helpDocuments).where(eq(schema.helpDocuments.status, 'published')).orderBy(asc(schema.helpDocuments.sort)).all();
    const tree = categories.map((cat) => ({
      ...cat,
      documents: docs.filter((d) => d.categoryId === cat.id),
    }));
    return { success: true, data: tree };
  });

  app.get('/api/public/help/:id', async (request, reply) => {
    const { id } = request.params as { id: string };
    const doc = db.select().from(schema.helpDocuments).where(eq(schema.helpDocuments.id, Number(id))).get();
    if (!doc || doc.status !== 'published') {
      return reply.status(404).send({ success: false, error: '未找到文档' });
    }
    return { success: true, data: doc };
  });

  // Activation products (public listing)
  app.get('/api/public/activation-products', async () => {
    const products = db.select().from(schema.activationProducts).all();
    return { success: true, data: products };
  });
}
