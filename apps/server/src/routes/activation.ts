import { FastifyInstance } from 'fastify';
import { requireAuth } from '../middleware/auth.js';
import { db, schema } from '../db/index.js';
import { eq, and } from 'drizzle-orm';
import { claimCodeSchema } from 'shared';

export default async function activationRoutes(app: FastifyInstance) {
  app.post('/api/me/activation-codes/claim', { preHandler: requireAuth }, async (request, reply) => {
    const parsed = claimCodeSchema.safeParse(request.body);
    if (!parsed.success) {
      return reply.status(400).send({ success: false, error: '请提供有效的产品ID' });
    }
    const { productId } = parsed.data;
    const userId = request.sessionUser!.id;

    const product = db.select().from(schema.activationProducts)
      .where(eq(schema.activationProducts.id, productId)).get();
    if (!product) {
      return reply.status(404).send({ success: false, error: '激活产品不存在' });
    }

    // Idempotency: check if user already has an active grant for this product
    const existingGrant = db.select({
      id: schema.activationCodeGrants.id,
      code6: schema.activationCodes.code6,
    })
      .from(schema.activationCodeGrants)
      .leftJoin(schema.activationCodes, eq(schema.activationCodeGrants.codeId, schema.activationCodes.id))
      .where(
        and(
          eq(schema.activationCodeGrants.userId, userId),
          eq(schema.activationCodeGrants.productId, productId)
        )
      )
      .get();

    if (existingGrant) {
      return {
        success: true,
        data: { code6: existingGrant.code6, alreadyClaimed: true },
      };
    }

    // Find an available code
    const availableCode = db.select().from(schema.activationCodes)
      .where(
        and(
          eq(schema.activationCodes.productId, productId),
          eq(schema.activationCodes.status, 'available')
        )
      )
      .limit(1)
      .get();

    if (!availableCode) {
      return reply.status(409).send({ success: false, error: '暂无可用激活码，请联系管理员' });
    }

    // Grant the code
    db.update(schema.activationCodes)
      .set({ status: 'granted' })
      .where(eq(schema.activationCodes.id, availableCode.id))
      .run();

    db.insert(schema.activationCodeGrants).values({
      codeId: availableCode.id,
      userId,
      productId,
    }).run();

    return {
      success: true,
      data: { code6: availableCode.code6, alreadyClaimed: false },
    };
  });

  // User's own grants
  app.get('/api/me/activation-codes', { preHandler: requireAuth }, async (request) => {
    const userId = request.sessionUser!.id;
    const grants = db.select({
      id: schema.activationCodeGrants.id,
      code6: schema.activationCodes.code6,
      productName: schema.activationProducts.name,
      productCode: schema.activationProducts.code,
      grantedAt: schema.activationCodeGrants.grantedAt,
    })
      .from(schema.activationCodeGrants)
      .leftJoin(schema.activationCodes, eq(schema.activationCodeGrants.codeId, schema.activationCodes.id))
      .leftJoin(schema.activationProducts, eq(schema.activationCodeGrants.productId, schema.activationProducts.id))
      .where(eq(schema.activationCodeGrants.userId, userId))
      .all();
    return { success: true, data: grants };
  });
}
