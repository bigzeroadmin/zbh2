import { db, schema } from '../db/index.js';

export async function logAudit(params: {
  userId?: number;
  username: string;
  action: string;
  targetType: string;
  targetId?: string;
  targetName?: string;
  detail?: any;
  ipAddress?: string;
  userAgent?: string;
  result?: 'success' | 'failure';
}): Promise<void> {
  db.insert(schema.auditLogs).values({
    userId: params.userId ?? null,
    username: params.username,
    action: params.action as any,
    targetType: params.targetType as any,
    targetId: params.targetId ?? null,
    targetName: params.targetName ?? null,
    detail: params.detail ? JSON.stringify(params.detail) : null,
    ipAddress: params.ipAddress ?? null,
    userAgent: params.userAgent ?? null,
    result: params.result ?? 'success',
  }).run();
}
