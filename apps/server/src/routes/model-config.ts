import { FastifyInstance } from 'fastify';
import { requireAdmin } from '../middleware/auth.js';
import { db, schema } from '../db/index.js';
import { eq } from 'drizzle-orm';

/** Ensure boolean values are converted to 0/1 for SQLite */
function toInt(v: unknown): number | undefined {
  if (v === undefined) return undefined;
  if (typeof v === 'boolean') return v ? 1 : 0;
  return Number(v);
}

export default async function modelConfigRoutes(app: FastifyInstance) {
  // ─── Admin: list model configs ───────────────────
  app.get('/api/admin/model-configs', { preHandler: requireAdmin }, async () => {
    const rows = db.select().from(schema.aiModelConfigs).all();
    // Mask API keys for security
    const masked = rows.map(r => ({
      ...r,
      apiKey: r.apiKey ? r.apiKey.slice(0, 6) + '****' + r.apiKey.slice(-4) : '',
    }));
    return { success: true, data: masked };
  });

  // ─── Admin: get single model config (with full key) ──
  app.get('/api/admin/model-configs/:id', { preHandler: requireAdmin }, async (request) => {
    const { id } = request.params as { id: string };
    const row = db.select().from(schema.aiModelConfigs).where(eq(schema.aiModelConfigs.id, Number(id))).get();
    if (!row) return { success: false, error: '未找到配置' };
    return { success: true, data: row };
  });

  // ─── Admin: create model config ──────────────────
  app.post('/api/admin/model-configs', { preHandler: requireAdmin }, async (request) => {
    const body = request.body as {
      name: string;
      provider?: string;
      model: string;
      apiKey: string;
      baseUrl?: string;
      systemPrompt?: string;
      temperature?: number;
      maxTokens?: number;
      isDefault?: number;
      enabled?: number;
    };

    // If this is set as default, clear other defaults
    if (body.isDefault) {
      db.update(schema.aiModelConfigs).set({ isDefault: 0 }).run();
    }

    const row = db.insert(schema.aiModelConfigs).values({
      name: body.name,
      provider: (body.provider || 'kimi') as any,
      model: body.model,
      apiKey: body.apiKey,
      baseUrl: body.baseUrl || 'https://api.moonshot.cn/v1',
      systemPrompt: body.systemPrompt || '',
      temperature: Number(body.temperature) || 0.7,
      maxTokens: Number(body.maxTokens) || 2048,
      isDefault: toInt(body.isDefault) ?? 0,
      enabled: toInt(body.enabled) ?? 1,
    }).returning().get();

    return { success: true, data: row };
  });

  // ─── Admin: update model config ──────────────────
  app.put('/api/admin/model-configs/:id', { preHandler: requireAdmin }, async (request) => {
    const { id } = request.params as { id: string };
    const body = request.body as Record<string, any>;
    const update: Record<string, unknown> = {};

    for (const k of ['name', 'provider', 'model', 'apiKey', 'baseUrl', 'systemPrompt', 'temperature', 'maxTokens', 'isDefault', 'enabled']) {
      if (body[k] !== undefined) {
        if (k === 'isDefault' || k === 'enabled') {
          update[k] = toInt(body[k]) ?? 0;
        } else if (k === 'temperature' || k === 'maxTokens') {
          update[k] = Number(body[k]);
        } else {
          update[k] = body[k];
        }
      }
    }
    update['updatedAt'] = new Date().toISOString();

    // If setting as default, clear others
    if (body.isDefault) {
      db.update(schema.aiModelConfigs).set({ isDefault: 0 }).run();
    }

    db.update(schema.aiModelConfigs).set(update).where(eq(schema.aiModelConfigs.id, Number(id))).run();
    return { success: true };
  });

  // ─── Admin: delete model config ──────────────────
  app.delete('/api/admin/model-configs/:id', { preHandler: requireAdmin }, async (request) => {
    const { id } = request.params as { id: string };
    db.delete(schema.aiModelConfigs).where(eq(schema.aiModelConfigs.id, Number(id))).run();
    return { success: true };
  });

  // ─── Admin: test model config connection ─────────
  app.post('/api/admin/model-configs/:id/test', { preHandler: requireAdmin }, async (request) => {
    const { id } = request.params as { id: string };
    const config = db.select().from(schema.aiModelConfigs).where(eq(schema.aiModelConfigs.id, Number(id))).get();
    if (!config) return { success: false, error: '配置不存在' };

    try {
      const response = await fetch(`${config.baseUrl}/chat/completions`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${config.apiKey}`,
        },
        body: JSON.stringify({
          model: config.model,
          messages: [{ role: 'user', content: '你好' }],
          max_tokens: 50,
          stream: false,
        }),
      });

      if (!response.ok) {
        const errText = await response.text();
        return { success: false, error: `API 返回错误 (${response.status}): ${errText}` };
      }

      const data = await response.json() as any;
      return { success: true, data: { reply: data.choices?.[0]?.message?.content || '连接成功但无回复' } };
    } catch (err: any) {
      return { success: false, error: `连接失败: ${err.message}` };
    }
  });
}
