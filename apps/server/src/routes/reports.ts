import { FastifyInstance } from 'fastify';
import { requireAdmin } from '../middleware/auth.js';
import { db, schema } from '../db/index.js';
import { eq, desc, sql } from 'drizzle-orm';

export default async function reportRoutes(app: FastifyInstance) {
  app.addHook('preHandler', requireAdmin);

  // Software asset report
  app.get('/api/admin/reports/software-assets', async () => {
    const items = db.select().from(schema.softwareItems).all();
    const categories = db.select().from(schema.softwareCategories).all();
    const catMap = Object.fromEntries(categories.map(c => [c.id, c.name]));

    const byCategory: Record<string, { total: number; published: number; draft: number }> = {};
    for (const item of items) {
      const catName = catMap[item.categoryId] || '未分类';
      if (!byCategory[catName]) byCategory[catName] = { total: 0, published: 0, draft: 0 };
      byCategory[catName].total++;
      if (item.status === 'published') byCategory[catName].published++;
      else byCategory[catName].draft++;
    }

    return {
      success: true,
      data: {
        totalSoftware: items.length,
        publishedCount: items.filter(i => i.status === 'published').length,
        draftCount: items.filter(i => i.status === 'draft').length,
        byCategory,
        generatedAt: new Date().toISOString(),
      },
    };
  });

  // Activation usage report
  app.get('/api/admin/reports/activation', async () => {
    const products = db.select().from(schema.activationProducts).all();
    const codes = db.select().from(schema.activationCodes).all();
    const grants = db.select().from(schema.activationCodeGrants).all();

    const productStats = products.map(p => {
      const productCodes = codes.filter(c => c.productId === p.id);
      return {
        productId: p.id,
        productName: p.name,
        productCode: p.code,
        totalCodes: productCodes.length,
        available: productCodes.filter(c => c.status === 'available').length,
        granted: productCodes.filter(c => c.status === 'granted').length,
        revoked: productCodes.filter(c => c.status === 'revoked').length,
        usageRate: productCodes.length > 0
          ? Math.round((productCodes.filter(c => c.status === 'granted').length / productCodes.length) * 100)
          : 0,
      };
    });

    // Monthly grant trend (last 12 months)
    const monthlyGrants: Record<string, number> = {};
    for (const g of grants) {
      const month = g.grantedAt.substring(0, 7);
      monthlyGrants[month] = (monthlyGrants[month] || 0) + 1;
    }

    return {
      success: true,
      data: {
        productStats,
        totalGrants: grants.length,
        monthlyGrants,
        generatedAt: new Date().toISOString(),
      },
    };
  });

  // Digital asset report
  app.get('/api/admin/reports/digital-assets', async () => {
    const allAssets = db.select().from(schema.assets).all();
    const categories = db.select().from(schema.assetCategories).all();
    const catMap = Object.fromEntries(categories.map(c => [String(c.id), c.name]));

    const statusLabels: Record<string, string> = {
      in_stock: '库存中', in_use: '使用中', maintenance: '维护中', retired: '已退役', scrapped: '已报废',
    };

    const byStatus: Record<string, number> = {};
    const byCategory: Record<string, number> = {};
    let totalValue = 0;
    let activeValue = 0;

    for (const a of allAssets) {
      const sl = statusLabels[a.status] || a.status;
      byStatus[sl] = (byStatus[sl] || 0) + 1;
      const cn = catMap[String(a.categoryId)] || '未分类';
      byCategory[cn] = (byCategory[cn] || 0) + 1;
      totalValue += a.purchasePrice || 0;
      if (['in_stock', 'in_use', 'maintenance'].includes(a.status)) activeValue += a.purchasePrice || 0;
    }

    return {
      success: true,
      data: {
        totalAssets: allAssets.length,
        byStatus,
        byCategory,
        totalValue,
        activeValue,
        generatedAt: new Date().toISOString(),
      },
    };
  });

  // Combined exportable report
  app.get('/api/admin/reports/export', async () => {
    const software = db.select().from(schema.softwareItems).all();
    const categories = db.select().from(schema.softwareCategories).all();
    const catMap = Object.fromEntries(categories.map(c => [c.id, c.name]));
    const products = db.select().from(schema.activationProducts).all();
    const codes = db.select().from(schema.activationCodes).all();
    const grants = db.select({
      id: schema.activationCodeGrants.id,
      code6: schema.activationCodes.code6,
      username: schema.users.username,
      productName: schema.activationProducts.name,
      grantedAt: schema.activationCodeGrants.grantedAt,
    }).from(schema.activationCodeGrants)
      .leftJoin(schema.activationCodes, eq(schema.activationCodeGrants.codeId, schema.activationCodes.id))
      .leftJoin(schema.users, eq(schema.activationCodeGrants.userId, schema.users.id))
      .leftJoin(schema.activationProducts, eq(schema.activationCodeGrants.productId, schema.activationProducts.id))
      .orderBy(desc(schema.activationCodeGrants.grantedAt)).all();
    const allAssets = db.select().from(schema.assets).all();

    return {
      success: true,
      data: {
        reportTitle: '正版化软件资产报表',
        generatedAt: new Date().toISOString(),
        software: software.map(s => ({ ...s, categoryName: catMap[s.categoryId] || '' })),
        activationProducts: products,
        activationGrants: grants,
        digitalAssets: allAssets,
      },
    };
  });
}
