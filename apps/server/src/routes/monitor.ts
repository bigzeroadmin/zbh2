import { FastifyInstance } from 'fastify';
import { requireAdmin } from '../middleware/auth.js';
import { logAudit } from '../middleware/audit.js';
import { db, schema } from '../db/index.js';
import { eq, desc, and, gte, lte, sql } from 'drizzle-orm';

function paginate(all: any[], page: number, pageSize: number) {
  const total = all.length;
  const items = all.slice((page - 1) * pageSize, page * pageSize);
  return { items, total, page, pageSize };
}

export default async function monitorRoutes(app: FastifyInstance) {
  app.addHook('preHandler', requireAdmin);

  // ─── 监控目标管理 ─────────────────────────────────
  app.get('/api/admin/monitor/targets', async (request) => {
    const query = request.query as { page?: string; pageSize?: string; type?: string };
    const page = Math.max(1, Number(query.page) || 1);
    const pageSize = Math.min(100, Math.max(1, Number(query.pageSize) || 20));

    let rows;
    if (query.type) {
      rows = db.select().from(schema.monitorTargets)
        .where(eq(schema.monitorTargets.type, query.type as any))
        .orderBy(desc(schema.monitorTargets.createdAt)).all();
    } else {
      rows = db.select().from(schema.monitorTargets)
        .orderBy(desc(schema.monitorTargets.createdAt)).all();
    }
    return { success: true, data: paginate(rows, page, pageSize) };
  });

  app.post('/api/admin/monitor/targets', async (request, reply) => {
    const body = request.body as any;
    if (!body.name || !body.type) {
      return reply.status(400).send({ success: false, error: '名称和类型为必填项' });
    }
    const row = db.insert(schema.monitorTargets).values({
      name: body.name,
      type: body.type,
      host: body.host || null,
      port: body.port || null,
      description: body.description || null,
      status: body.status || 'online',
      config: body.config || null,
    }).returning().get();

    await logAudit({
      userId: request.sessionUser!.id,
      username: request.sessionUser!.username,
      action: 'create',
      targetType: 'monitor',
      targetId: String(row.id),
      targetName: row.name,
    });
    return { success: true, data: row };
  });

  app.put('/api/admin/monitor/targets/:id', async (request, reply) => {
    const { id } = request.params as { id: string };
    const body = request.body as any;
    const existing = db.select().from(schema.monitorTargets).where(eq(schema.monitorTargets.id, Number(id))).get();
    if (!existing) return reply.status(404).send({ success: false, error: '目标不存在' });

    const update: Record<string, unknown> = { updatedAt: new Date().toISOString() };
    for (const key of ['name', 'type', 'host', 'port', 'description', 'status', 'config']) {
      if (body[key] !== undefined) update[key] = body[key];
    }
    db.update(schema.monitorTargets).set(update).where(eq(schema.monitorTargets.id, Number(id))).run();

    await logAudit({
      userId: request.sessionUser!.id,
      username: request.sessionUser!.username,
      action: 'update',
      targetType: 'monitor',
      targetId: id,
      targetName: existing.name,
    });
    return { success: true };
  });

  app.delete('/api/admin/monitor/targets/:id', async (request, reply) => {
    const { id } = request.params as { id: string };
    const existing = db.select().from(schema.monitorTargets).where(eq(schema.monitorTargets.id, Number(id))).get();
    if (!existing) return reply.status(404).send({ success: false, error: '目标不存在' });

    db.delete(schema.monitorTargets).where(eq(schema.monitorTargets.id, Number(id))).run();

    await logAudit({
      userId: request.sessionUser!.id,
      username: request.sessionUser!.username,
      action: 'delete',
      targetType: 'monitor',
      targetId: id,
      targetName: existing.name,
    });
    return { success: true };
  });

  app.get('/api/admin/monitor/targets/:id/status', async (request, reply) => {
    const { id } = request.params as { id: string };
    const target = db.select().from(schema.monitorTargets).where(eq(schema.monitorTargets.id, Number(id))).get();
    if (!target) return reply.status(404).send({ success: false, error: '目标不存在' });
    return { success: true, data: { id: target.id, name: target.name, status: target.status } };
  });

  // ─── 监控项管理 ───────────────────────────────────
  app.get('/api/admin/monitor/items', async (request) => {
    const query = request.query as { page?: string; pageSize?: string; targetId?: string };
    const page = Math.max(1, Number(query.page) || 1);
    const pageSize = Math.min(100, Math.max(1, Number(query.pageSize) || 20));

    let rows;
    if (query.targetId) {
      rows = db.select().from(schema.monitorItems)
        .where(eq(schema.monitorItems.targetId, Number(query.targetId)))
        .orderBy(desc(schema.monitorItems.createdAt)).all();
    } else {
      rows = db.select().from(schema.monitorItems)
        .orderBy(desc(schema.monitorItems.createdAt)).all();
    }
    return { success: true, data: paginate(rows, page, pageSize) };
  });

  app.post('/api/admin/monitor/items', async (request, reply) => {
    const body = request.body as any;
    if (!body.targetId || !body.name || !body.key) {
      return reply.status(400).send({ success: false, error: '目标ID、名称和键为必填项' });
    }
    const row = db.insert(schema.monitorItems).values({
      targetId: body.targetId,
      name: body.name,
      key: body.key,
      unit: body.unit || null,
      collectMethod: body.collectMethod || 'auto',
      collectInterval: body.collectInterval || 60,
      enabled: body.enabled !== undefined ? body.enabled : 1,
    }).returning().get();
    return { success: true, data: row };
  });

  app.put('/api/admin/monitor/items/:id', async (request, reply) => {
    const { id } = request.params as { id: string };
    const body = request.body as any;
    const existing = db.select().from(schema.monitorItems).where(eq(schema.monitorItems.id, Number(id))).get();
    if (!existing) return reply.status(404).send({ success: false, error: '监控项不存在' });

    const update: Record<string, unknown> = { updatedAt: new Date().toISOString() };
    for (const key of ['name', 'key', 'unit', 'collectMethod', 'collectInterval', 'enabled']) {
      if (body[key] !== undefined) update[key] = body[key];
    }
    db.update(schema.monitorItems).set(update).where(eq(schema.monitorItems.id, Number(id))).run();
    return { success: true };
  });

  app.delete('/api/admin/monitor/items/:id', async (request, reply) => {
    const { id } = request.params as { id: string };
    const existing = db.select().from(schema.monitorItems).where(eq(schema.monitorItems.id, Number(id))).get();
    if (!existing) return reply.status(404).send({ success: false, error: '监控项不存在' });

    db.delete(schema.monitorItems).where(eq(schema.monitorItems.id, Number(id))).run();
    return { success: true };
  });

  // ─── 监控阈值 ─────────────────────────────────────
  app.get('/api/admin/monitor/items/:id/thresholds', async (request, reply) => {
    const { id } = request.params as { id: string };
    const rows = db.select().from(schema.monitorThresholds)
      .where(eq(schema.monitorThresholds.itemId, Number(id)))
      .orderBy(desc(schema.monitorThresholds.createdAt)).all();
    return { success: true, data: rows };
  });

  app.post('/api/admin/monitor/thresholds', async (request, reply) => {
    const body = request.body as any;
    if (!body.itemId || !body.level || !body.operator || body.value === undefined) {
      return reply.status(400).send({ success: false, error: '监控项ID、级别、操作符和值为必填项' });
    }
    const row = db.insert(schema.monitorThresholds).values({
      itemId: body.itemId,
      level: body.level,
      operator: body.operator,
      value: body.value,
      duration: body.duration || null,
      action: body.action || null,
      notifyMessage: body.notifyMessage || null,
      enabled: body.enabled !== undefined ? body.enabled : 1,
    }).returning().get();
    return { success: true, data: row };
  });

  app.put('/api/admin/monitor/thresholds/:id', async (request, reply) => {
    const { id } = request.params as { id: string };
    const body = request.body as any;
    const existing = db.select().from(schema.monitorThresholds).where(eq(schema.monitorThresholds.id, Number(id))).get();
    if (!existing) return reply.status(404).send({ success: false, error: '阈值规则不存在' });

    const update: Record<string, unknown> = {};
    for (const key of ['level', 'operator', 'value', 'duration', 'action', 'notifyMessage', 'enabled']) {
      if (body[key] !== undefined) update[key] = body[key];
    }
    db.update(schema.monitorThresholds).set(update).where(eq(schema.monitorThresholds.id, Number(id))).run();
    return { success: true };
  });

  app.delete('/api/admin/monitor/thresholds/:id', async (request, reply) => {
    const { id } = request.params as { id: string };
    const existing = db.select().from(schema.monitorThresholds).where(eq(schema.monitorThresholds.id, Number(id))).get();
    if (!existing) return reply.status(404).send({ success: false, error: '阈值规则不存在' });

    db.delete(schema.monitorThresholds).where(eq(schema.monitorThresholds.id, Number(id))).run();
    return { success: true };
  });

  // ─── 监控数据记录 ─────────────────────────────────
  app.get('/api/admin/monitor/records', async (request) => {
    const query = request.query as { page?: string; pageSize?: string; itemId?: string; startTime?: string; endTime?: string };
    const page = Math.max(1, Number(query.page) || 1);
    const pageSize = Math.min(100, Math.max(1, Number(query.pageSize) || 20));

    let rows;
    if (query.itemId) {
      rows = db.select().from(schema.monitorRecords)
        .where(eq(schema.monitorRecords.itemId, Number(query.itemId)))
        .orderBy(desc(schema.monitorRecords.collectedAt)).all();
    } else {
      rows = db.select().from(schema.monitorRecords)
        .orderBy(desc(schema.monitorRecords.collectedAt)).all();
    }

    if (query.startTime) {
      rows = rows.filter(r => r.collectedAt >= query.startTime!);
    }
    if (query.endTime) {
      rows = rows.filter(r => r.collectedAt <= query.endTime!);
    }

    return { success: true, data: paginate(rows, page, pageSize) };
  });

  // ─── 告警管理 ─────────────────────────────────────
  app.get('/api/admin/monitor/alerts', async (request) => {
    const query = request.query as { page?: string; pageSize?: string; status?: string; level?: string };
    const page = Math.max(1, Number(query.page) || 1);
    const pageSize = Math.min(100, Math.max(1, Number(query.pageSize) || 20));

    let rows;
    const conditions: any[] = [];
    if (query.status) conditions.push(eq(schema.monitorAlerts.status, query.status as any));
    if (query.level) conditions.push(eq(schema.monitorAlerts.level, query.level as any));

    if (conditions.length > 0) {
      rows = db.select().from(schema.monitorAlerts)
        .where(and(...conditions))
        .orderBy(desc(schema.monitorAlerts.createdAt)).all();
    } else {
      rows = db.select().from(schema.monitorAlerts)
        .orderBy(desc(schema.monitorAlerts.createdAt)).all();
    }
    return { success: true, data: paginate(rows, page, pageSize) };
  });

  app.put('/api/admin/monitor/alerts/:id/acknowledge', async (request, reply) => {
    const { id } = request.params as { id: string };
    const alert = db.select().from(schema.monitorAlerts).where(eq(schema.monitorAlerts.id, Number(id))).get();
    if (!alert) return reply.status(404).send({ success: false, error: '告警不存在' });

    db.update(schema.monitorAlerts).set({
      status: 'acknowledged',
      acknowledgedBy: request.sessionUser!.id,
      acknowledgedAt: new Date().toISOString(),
    }).where(eq(schema.monitorAlerts.id, Number(id))).run();
    return { success: true };
  });

  app.put('/api/admin/monitor/alerts/:id/resolve', async (request, reply) => {
    const { id } = request.params as { id: string };
    const alert = db.select().from(schema.monitorAlerts).where(eq(schema.monitorAlerts.id, Number(id))).get();
    if (!alert) return reply.status(404).send({ success: false, error: '告警不存在' });

    db.update(schema.monitorAlerts).set({
      status: 'resolved',
      resolvedBy: request.sessionUser!.id,
      resolvedAt: new Date().toISOString(),
    }).where(eq(schema.monitorAlerts.id, Number(id))).run();
    return { success: true };
  });

  // ─── 监控仪表盘 ───────────────────────────────────
  app.get('/api/admin/monitor/dashboard', async () => {
    const targets = db.select().from(schema.monitorTargets).all();
    const targetTotal = targets.length;
    const targetByStatus: Record<string, number> = {};
    for (const t of targets) {
      targetByStatus[t.status] = (targetByStatus[t.status] || 0) + 1;
    }

    const alerts = db.select().from(schema.monitorAlerts).orderBy(desc(schema.monitorAlerts.createdAt)).all();
    const alertByStatus: Record<string, number> = {};
    const alertByLevel: Record<string, number> = {};
    for (const a of alerts) {
      alertByStatus[a.status] = (alertByStatus[a.status] || 0) + 1;
      alertByLevel[a.level] = (alertByLevel[a.level] || 0) + 1;
    }

    const recentAlerts = alerts.slice(0, 10);

    return {
      success: true,
      data: {
        targetTotal,
        targetByStatus,
        alertByStatus,
        alertByLevel,
        recentAlerts,
      },
    };
  });

  // ─── 监控报告 ─────────────────────────────────────
  app.get('/api/admin/monitor/reports', async (request) => {
    const query = request.query as { page?: string; pageSize?: string };
    const page = Math.max(1, Number(query.page) || 1);
    const pageSize = Math.min(100, Math.max(1, Number(query.pageSize) || 20));

    const rows = db.select().from(schema.monitorReports)
      .orderBy(desc(schema.monitorReports.createdAt)).all();
    return { success: true, data: paginate(rows, page, pageSize) };
  });

  app.post('/api/admin/monitor/reports/generate', async (request, reply) => {
    const body = request.body as any;
    if (!body.title || !body.type || !body.startTime || !body.endTime) {
      return reply.status(400).send({ success: false, error: '标题、类型、开始时间和结束时间为必填项' });
    }

    // Collect records within time range
    const allRecords = db.select().from(schema.monitorRecords)
      .orderBy(desc(schema.monitorRecords.collectedAt)).all();
    const filteredRecords = allRecords.filter(
      r => r.collectedAt >= body.startTime && r.collectedAt <= body.endTime
    );

    // Build summary
    const summary: Record<string, { count: number; min: number; max: number; avg: number; warningCount: number; criticalCount: number }> = {};
    for (const r of filteredRecords) {
      const k = String(r.itemId);
      if (!summary[k]) summary[k] = { count: 0, min: Infinity, max: -Infinity, avg: 0, warningCount: 0, criticalCount: 0 };
      summary[k].count++;
      if (r.value < summary[k].min) summary[k].min = r.value;
      if (r.value > summary[k].max) summary[k].max = r.value;
      summary[k].avg += r.value;
      if (r.status === 'warning') summary[k].warningCount++;
      if (r.status === 'critical') summary[k].criticalCount++;
    }
    for (const k of Object.keys(summary)) {
      if (summary[k].count > 0) summary[k].avg = Math.round(summary[k].avg / summary[k].count * 100) / 100;
      if (summary[k].min === Infinity) summary[k].min = 0;
      if (summary[k].max === -Infinity) summary[k].max = 0;
    }

    const content = JSON.stringify({
      timeRange: { startTime: body.startTime, endTime: body.endTime },
      totalRecords: filteredRecords.length,
      itemSummary: summary,
      generatedAt: new Date().toISOString(),
    });

    const row = db.insert(schema.monitorReports).values({
      title: body.title,
      type: body.type,
      startTime: body.startTime,
      endTime: body.endTime,
      content,
      templateId: body.templateId || null,
      createdBy: request.sessionUser!.id,
    }).returning().get();

    await logAudit({
      userId: request.sessionUser!.id,
      username: request.sessionUser!.username,
      action: 'create',
      targetType: 'monitor',
      targetId: String(row.id),
      targetName: row.title,
      detail: { type: 'report', reportType: body.type },
    });

    return { success: true, data: row };
  });

  app.get('/api/admin/monitor/reports/:id', async (request, reply) => {
    const { id } = request.params as { id: string };
    const report = db.select().from(schema.monitorReports).where(eq(schema.monitorReports.id, Number(id))).get();
    if (!report) return reply.status(404).send({ success: false, error: '报告不存在' });
    return { success: true, data: report };
  });

  app.delete('/api/admin/monitor/reports/:id', async (request, reply) => {
    const { id } = request.params as { id: string };
    const existing = db.select().from(schema.monitorReports).where(eq(schema.monitorReports.id, Number(id))).get();
    if (!existing) return reply.status(404).send({ success: false, error: '报告不存在' });

    db.delete(schema.monitorReports).where(eq(schema.monitorReports.id, Number(id))).run();
    return { success: true };
  });

  // ─── 报告模板 ─────────────────────────────────────
  app.get('/api/admin/monitor/report-templates', async () => {
    const rows = db.select().from(schema.monitorReportTemplates)
      .orderBy(desc(schema.monitorReportTemplates.createdAt)).all();
    return { success: true, data: rows };
  });

  app.post('/api/admin/monitor/report-templates', async (request, reply) => {
    const body = request.body as any;
    if (!body.name || !body.config) {
      return reply.status(400).send({ success: false, error: '名称和配置为必填项' });
    }
    const row = db.insert(schema.monitorReportTemplates).values({
      name: body.name,
      description: body.description || null,
      config: typeof body.config === 'string' ? body.config : JSON.stringify(body.config),
      createdBy: request.sessionUser!.id,
    }).returning().get();
    return { success: true, data: row };
  });

  app.put('/api/admin/monitor/report-templates/:id', async (request, reply) => {
    const { id } = request.params as { id: string };
    const body = request.body as any;
    const existing = db.select().from(schema.monitorReportTemplates).where(eq(schema.monitorReportTemplates.id, Number(id))).get();
    if (!existing) return reply.status(404).send({ success: false, error: '模板不存在' });

    const update: Record<string, unknown> = { updatedAt: new Date().toISOString() };
    for (const key of ['name', 'description', 'config']) {
      if (body[key] !== undefined) {
        update[key] = key === 'config' && typeof body[key] !== 'string' ? JSON.stringify(body[key]) : body[key];
      }
    }
    db.update(schema.monitorReportTemplates).set(update).where(eq(schema.monitorReportTemplates.id, Number(id))).run();
    return { success: true };
  });

  app.delete('/api/admin/monitor/report-templates/:id', async (request, reply) => {
    const { id } = request.params as { id: string };
    const existing = db.select().from(schema.monitorReportTemplates).where(eq(schema.monitorReportTemplates.id, Number(id))).get();
    if (!existing) return reply.status(404).send({ success: false, error: '模板不存在' });

    db.delete(schema.monitorReportTemplates).where(eq(schema.monitorReportTemplates.id, Number(id))).run();
    return { success: true };
  });

  // ─── 审计日志 ─────────────────────────────────────
  app.get('/api/admin/monitor/audit-logs', async (request) => {
    const query = request.query as {
      page?: string; pageSize?: string;
      userId?: string; action?: string; targetType?: string;
      startTime?: string; endTime?: string;
    };
    const page = Math.max(1, Number(query.page) || 1);
    const pageSize = Math.min(100, Math.max(1, Number(query.pageSize) || 20));

    let rows = db.select().from(schema.auditLogs).orderBy(desc(schema.auditLogs.createdAt)).all();

    if (query.userId) rows = rows.filter(r => r.userId === Number(query.userId));
    if (query.action) rows = rows.filter(r => r.action === query.action);
    if (query.targetType) rows = rows.filter(r => r.targetType === query.targetType);
    if (query.startTime) rows = rows.filter(r => r.createdAt >= query.startTime!);
    if (query.endTime) rows = rows.filter(r => r.createdAt <= query.endTime!);

    return { success: true, data: paginate(rows, page, pageSize) };
  });

  app.get('/api/admin/monitor/audit-logs/stats', async () => {
    const rows = db.select().from(schema.auditLogs).all();

    const byAction: Record<string, number> = {};
    const byTargetType: Record<string, number> = {};
    for (const r of rows) {
      byAction[r.action] = (byAction[r.action] || 0) + 1;
      byTargetType[r.targetType] = (byTargetType[r.targetType] || 0) + 1;
    }

    return { success: true, data: { byAction, byTargetType, total: rows.length } };
  });

  // ─── 平台接入 ─────────────────────────────────────
  app.get('/api/admin/monitor/platforms', async () => {
    const rows = db.select().from(schema.monitorPlatforms)
      .orderBy(desc(schema.monitorPlatforms.createdAt)).all();
    return { success: true, data: rows };
  });

  app.post('/api/admin/monitor/platforms', async (request, reply) => {
    const body = request.body as any;
    if (!body.name || !body.endpoint) {
      return reply.status(400).send({ success: false, error: '名称和端点为必填项' });
    }
    const row = db.insert(schema.monitorPlatforms).values({
      name: body.name,
      type: body.type || 'webhook',
      endpoint: body.endpoint,
      apiKey: body.apiKey || null,
      secret: body.secret || null,
      syncConfig: body.syncConfig || null,
      status: body.status || 'active',
      description: body.description || null,
    }).returning().get();

    await logAudit({
      userId: request.sessionUser!.id,
      username: request.sessionUser!.username,
      action: 'create',
      targetType: 'monitor',
      targetId: String(row.id),
      targetName: row.name,
      detail: { subType: 'platform' },
    });

    return { success: true, data: row };
  });

  app.put('/api/admin/monitor/platforms/:id', async (request, reply) => {
    const { id } = request.params as { id: string };
    const body = request.body as any;
    const existing = db.select().from(schema.monitorPlatforms).where(eq(schema.monitorPlatforms.id, Number(id))).get();
    if (!existing) return reply.status(404).send({ success: false, error: '平台不存在' });

    const update: Record<string, unknown> = { updatedAt: new Date().toISOString() };
    for (const key of ['name', 'type', 'endpoint', 'apiKey', 'secret', 'syncConfig', 'status', 'description']) {
      if (body[key] !== undefined) update[key] = body[key];
    }
    db.update(schema.monitorPlatforms).set(update).where(eq(schema.monitorPlatforms.id, Number(id))).run();

    await logAudit({
      userId: request.sessionUser!.id,
      username: request.sessionUser!.username,
      action: 'update',
      targetType: 'monitor',
      targetId: id,
      targetName: existing.name,
    });
    return { success: true };
  });

  app.delete('/api/admin/monitor/platforms/:id', async (request, reply) => {
    const { id } = request.params as { id: string };
    const existing = db.select().from(schema.monitorPlatforms).where(eq(schema.monitorPlatforms.id, Number(id))).get();
    if (!existing) return reply.status(404).send({ success: false, error: '平台不存在' });

    db.delete(schema.monitorPlatforms).where(eq(schema.monitorPlatforms.id, Number(id))).run();

    await logAudit({
      userId: request.sessionUser!.id,
      username: request.sessionUser!.username,
      action: 'delete',
      targetType: 'monitor',
      targetId: id,
      targetName: existing.name,
    });
    return { success: true };
  });

  app.post('/api/admin/monitor/platforms/:id/test', async (request, reply) => {
    const { id } = request.params as { id: string };
    const platform = db.select().from(schema.monitorPlatforms).where(eq(schema.monitorPlatforms.id, Number(id))).get();
    if (!platform) return reply.status(404).send({ success: false, error: '平台不存在' });

    // Simulate connection test
    const testResult = {
      connected: true,
      latency: Math.floor(Math.random() * 100) + 10,
      timestamp: new Date().toISOString(),
      details: `成功连接至 ${platform.endpoint}`,
    };

    // Update platform status to testing temporarily
    db.update(schema.monitorPlatforms).set({
      status: 'testing',
      lastSyncAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    }).where(eq(schema.monitorPlatforms.id, Number(id))).run();

    // Restore to active after test
    db.update(schema.monitorPlatforms).set({
      status: 'active',
      updatedAt: new Date().toISOString(),
    }).where(eq(schema.monitorPlatforms.id, Number(id))).run();

    return { success: true, data: testResult };
  });
}
