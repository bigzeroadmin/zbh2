import { FastifyInstance } from 'fastify';
import { requireAdmin } from '../middleware/auth.js';
import { db, schema } from '../db/index.js';
import { eq, desc, like, or } from 'drizzle-orm';

export default async function aiFaqRoutes(app: FastifyInstance) {
  // ─── Admin: manage FAQ entries ───────────────────
  app.get('/api/admin/faq', { preHandler: requireAdmin }, async () => {
    const rows = db.select().from(schema.faqEntries).orderBy(schema.faqEntries.sort).all();
    return { success: true, data: rows };
  });

  app.post('/api/admin/faq', { preHandler: requireAdmin }, async (request) => {
    const body = request.body as { question: string; answer: string; keywords?: string; category?: string; sort?: number };
    const row = db.insert(schema.faqEntries).values({
      question: body.question,
      answer: body.answer,
      keywords: body.keywords || '',
      category: body.category || '通用',
      sort: body.sort || 0,
    }).returning().get();
    return { success: true, data: row };
  });

  app.put('/api/admin/faq/:id', { preHandler: requireAdmin }, async (request) => {
    const { id } = request.params as { id: string };
    const body = request.body as any;
    const update: Record<string, unknown> = {};
    for (const k of ['question', 'answer', 'keywords', 'category', 'sort']) {
      if (body[k] !== undefined) update[k] = body[k];
    }
    db.update(schema.faqEntries).set(update).where(eq(schema.faqEntries.id, Number(id))).run();
    return { success: true };
  });

  app.delete('/api/admin/faq/:id', { preHandler: requireAdmin }, async (request) => {
    const { id } = request.params as { id: string };
    db.delete(schema.faqEntries).where(eq(schema.faqEntries.id, Number(id))).run();
    return { success: true };
  });

  // ─── Public: AI chat / FAQ matching ──────────────
  app.post('/api/public/ai-chat', async (request) => {
    const body = request.body as { message: string };
    if (!body.message || body.message.trim().length === 0) {
      return { success: true, data: { reply: '请输入您的问题，我会尽力为您解答。', matches: [] } };
    }

    const query = body.message.trim().toLowerCase();
    const allFaq = db.select().from(schema.faqEntries).all();

    // Keyword-based matching with scoring
    const scored = allFaq.map(faq => {
      let score = 0;
      const qLower = faq.question.toLowerCase();
      const kLower = faq.keywords.toLowerCase();
      const aLower = faq.answer.toLowerCase();

      // Exact substring in question (highest weight)
      if (qLower.includes(query)) score += 10;
      // Keywords match
      const keywords = kLower.split(/[,;，；\s]+/).filter(Boolean);
      for (const kw of keywords) {
        if (query.includes(kw) || kw.includes(query)) score += 5;
      }
      // Per-character overlap in question
      for (const char of query) {
        if (qLower.includes(char)) score += 0.5;
      }
      // Partial word match
      const queryWords = query.split(/\s+/);
      for (const word of queryWords) {
        if (word.length >= 2 && (qLower.includes(word) || kLower.includes(word))) score += 3;
      }

      return { ...faq, score };
    }).filter(f => f.score > 2).sort((a, b) => b.score - a.score);

    const topMatches = scored.slice(0, 3);

    let reply: string;
    if (topMatches.length > 0) {
      reply = topMatches[0].answer;
      if (topMatches.length > 1) {
        reply += '\n\n---\n您可能还想了解：\n' + topMatches.slice(1).map((m, i) => `${i + 1}. ${m.question}`).join('\n');
      }
    } else {
      reply = '抱歉，我暂时无法找到与您问题匹配的解决方案。建议您：\n1. 尝试使用不同的关键词描述问题\n2. 提交工单获取人工帮助\n3. 查看帮助文档中的常见问题';
    }

    return {
      success: true,
      data: {
        reply,
        matches: topMatches.map(m => ({ id: m.id, question: m.question, category: m.category })),
      },
    };
  });
}
