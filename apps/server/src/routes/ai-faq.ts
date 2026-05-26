import { FastifyInstance } from 'fastify';
import { requireAdmin, loadSession } from '../middleware/auth.js';
import { db, schema } from '../db/index.js';
import { eq } from 'drizzle-orm';

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

  // ─── Public: AI chat with conversation support ──
  // Get or create conversation
  app.post('/api/public/ai-chat/conversation', { preHandler: loadSession }, async (request) => {
    const userId = (request as any).user?.id || null;
    const body = request.body as { title?: string } | undefined;
    const row = db.insert(schema.aiChatConversations).values({
      userId,
      title: body?.title || '新对话',
    }).returning().get();
    return { success: true, data: row };
  });

  // List conversations
  app.get('/api/public/ai-chat/conversations', { preHandler: loadSession }, async (request) => {
    const userId = (request as any).user?.id || null;
    const rows = db.select().from(schema.aiChatConversations)
      .where(userId ? eq(schema.aiChatConversations.userId, userId) : undefined as any)
      .orderBy(schema.aiChatConversations.updatedAt).all();
    return { success: true, data: rows };
  });

  // Get conversation messages
  app.get('/api/public/ai-chat/conversations/:id/messages', async (request) => {
    const { id } = request.params as { id: string };
    const rows = db.select().from(schema.aiChatMessages)
      .where(eq(schema.aiChatMessages.conversationId, Number(id)))
      .orderBy(schema.aiChatMessages.createdAt).all();
    return { success: true, data: rows };
  });

  // Delete conversation
  app.delete('/api/public/ai-chat/conversations/:id', { preHandler: loadSession }, async (request) => {
    const { id } = request.params as { id: string };
    db.delete(schema.aiChatMessages).where(eq(schema.aiChatMessages.conversationId, Number(id))).run();
    db.delete(schema.aiChatConversations).where(eq(schema.aiChatConversations.id, Number(id))).run();
    return { success: true };
  });

  // ─── Public: AI chat stream (SSE) ────────────────
  app.post('/api/public/ai-chat', async (request, reply) => {
    const body = request.body as { message: string; conversationId?: number };
    if (!body.message || body.message.trim().length === 0) {
      return { success: true, data: { reply: '请输入您的问题，我会尽力为您解答。', matches: [] } };
    }

    // Get the default enabled model config
    const modelConfig = db.select().from(schema.aiModelConfigs)
      .where(eq(schema.aiModelConfigs.isDefault, 1))
      .get() || db.select().from(schema.aiModelConfigs)
      .where(eq(schema.aiModelConfigs.enabled, 1))
      .get();

    // If no AI model configured, fallback to FAQ matching
    if (!modelConfig) {
      const query = body.message.trim().toLowerCase();
      const allFaq = db.select().from(schema.faqEntries).all();

      const scored = allFaq.map(faq => {
        let score = 0;
        const qLower = faq.question.toLowerCase();
        const kLower = faq.keywords.toLowerCase();

        if (qLower.includes(query)) score += 10;
        const keywords = kLower.split(/[,;，；\s]+/).filter(Boolean);
        for (const kw of keywords) {
          if (query.includes(kw) || kw.includes(query)) score += 5;
        }
        for (const char of query) {
          if (qLower.includes(char)) score += 0.5;
        }
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
        data: { reply, matches: topMatches.map(m => ({ id: m.id, question: m.question, category: m.category })) },
      };
    }

    // Build messages array with conversation history
    let conversationId = body.conversationId;
    const messages: { role: string; content: string }[] = [];

    // System prompt
    const allFaq = db.select().from(schema.faqEntries).all();
    let systemPrompt = modelConfig.systemPrompt || '你是正版化软件管理平台的智能客服，专业解答软件正版化、激活、安装、许可证管理等相关问题。';
    if (allFaq.length > 0) {
      systemPrompt += '\n\n以下为知识库参考内容，请优先基于知识库回答：\n' +
        allFaq.map(f => `Q: ${f.question}\nA: ${f.answer}`).join('\n\n');
    }
    messages.push({ role: 'system', content: systemPrompt });

    // Load conversation history
    if (conversationId) {
      const history = db.select().from(schema.aiChatMessages)
        .where(eq(schema.aiChatMessages.conversationId, conversationId))
        .orderBy(schema.aiChatMessages.createdAt).all();
      for (const msg of history) {
        messages.push({ role: msg.role, content: msg.content });
      }
    }

    // Add current user message
    messages.push({ role: 'user', content: body.message });

    // Save user message to DB
    if (!conversationId) {
      const conv = db.insert(schema.aiChatConversations).values({
        userId: (request as any).user?.id || null,
        title: body.message.slice(0, 30),
      }).returning().get();
      conversationId = conv.id;
    }
    db.insert(schema.aiChatMessages).values({
      conversationId,
      role: 'user',
      content: body.message,
    }).run();

    // Call AI model with streaming — hijack the reply to take over raw socket
    reply.hijack();
    reply.raw.writeHead(200, {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache',
      'Connection': 'keep-alive',
      'X-Accel-Buffering': 'no',
    });

    let fullReply = '';

    try {
      const response = await fetch(`${modelConfig.baseUrl}/chat/completions`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${modelConfig.apiKey}`,
        },
        body: JSON.stringify({
          model: modelConfig.model,
          messages,
          temperature: modelConfig.temperature,
          max_tokens: modelConfig.maxTokens,
          stream: true,
        }),
      });

      if (!response.ok) {
        const errText = await response.text();
        reply.raw.write(`data: ${JSON.stringify({ error: `API 错误 (${response.status}): ${errText}` })}\n\n`);
        reply.raw.end();
        return;
      }

      const reader = response.body?.getReader();
      if (!reader) {
        reply.raw.write(`data: ${JSON.stringify({ error: '无法读取响应流' })}\n\n`);
        reply.raw.end();
        return;
      }

      const decoder = new TextDecoder();
      let buffer = '';

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split('\n');
        buffer = lines.pop() || '';

        for (const line of lines) {
          const trimmed = line.trim();
          if (!trimmed || !trimmed.startsWith('data: ')) continue;
          const data = trimmed.slice(6);
          if (data === '[DONE]') continue;

          try {
            const parsed = JSON.parse(data);
            const delta = parsed.choices?.[0]?.delta?.content;
            if (delta) {
              fullReply += delta;
              reply.raw.write(`data: ${JSON.stringify({ content: delta, conversationId })}\n\n`);
            }
          } catch {
            // skip malformed JSON
          }
        }
      }

      // Save assistant reply
      if (fullReply) {
        db.insert(schema.aiChatMessages).values({
          conversationId,
          role: 'assistant',
          content: fullReply,
        }).run();
      }

      reply.raw.write(`data: ${JSON.stringify({ done: true, conversationId })}\n\n`);
    } catch (err: any) {
      reply.raw.write(`data: ${JSON.stringify({ error: `请求失败: ${err.message}` })}\n\n`);
    }

    reply.raw.end();
  });
}
