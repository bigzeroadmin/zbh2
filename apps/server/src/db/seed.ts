import { db, schema } from './index.js';
import { hash } from 'argon2';
import { eq } from 'drizzle-orm';

async function seed() {
  const existing = db.select().from(schema.users).where(eq(schema.users.username, 'admin')).get();
  if (!existing) {
    const passwordHash = await hash('admin123');
    db.insert(schema.users).values({
      username: 'admin',
      passwordHash,
      role: 'admin',
      status: 'active',
    }).run();
    console.log('Seeded admin user (admin / admin123)');
  } else {
    console.log('Admin user already exists, skipping');
  }

  const cats = [
    { name: '操作系统', sort: 1 },
    { name: '办公软件', sort: 2 },
    { name: '安全软件', sort: 3 },
    { name: '工具软件', sort: 4 },
  ];
  for (const cat of cats) {
    const exists = db.select().from(schema.softwareCategories)
      .where(eq(schema.softwareCategories.name, cat.name)).get();
    if (!exists) {
      db.insert(schema.softwareCategories).values(cat).run();
    }
  }

  const helpCats = [
    { name: '安装指南', sort: 1 },
    { name: '激活说明', sort: 2 },
    { name: '常见问题', sort: 3 },
  ];
  for (const cat of helpCats) {
    const exists = db.select().from(schema.helpCategories)
      .where(eq(schema.helpCategories.name, cat.name)).get();
    if (!exists) {
      db.insert(schema.helpCategories).values(cat).run();
    }
  }

  const products = [
    { code: 'WIN', name: 'Windows 激活', description: 'Windows 操作系统正版激活' },
    { code: 'OFFICE', name: 'Office 激活', description: 'Microsoft Office 正版激活' },
    { code: 'WPS', name: 'WPS 激活', description: 'WPS Office 正版激活' },
  ];
  for (const p of products) {
    const exists = db.select().from(schema.activationProducts)
      .where(eq(schema.activationProducts.code, p.code)).get();
    if (!exists) {
      db.insert(schema.activationProducts).values(p).run();
    }
  }

  // FAQ / AI knowledge base seed data
  const faqs = [
    { question: 'Windows 激活失败怎么办？', answer: '请确保：\n1. 网络连接正常\n2. 使用管理员权限运行激活客户端\n3. 确认激活码尚未被使用\n4. 如仍失败，请提交工单联系管理员', keywords: 'Windows,激活,失败,错误', category: '激活问题' },
    { question: 'Office 激活码在哪里获取？', answer: '登录本平台后，进入「软件激活」页面，选择 Office 产品，点击「获取激活码」即可领取 6 位激活码。', keywords: 'Office,激活码,获取,领取', category: '激活问题' },
    { question: '如何下载正版软件？', answer: '在平台首页点击「软件下载」，选择对应分类，找到需要的软件后点击下载按钮即可。无需登录。', keywords: '下载,软件,安装', category: '下载问题' },
    { question: 'WPS 安装后无法启动', answer: '请尝试以下步骤：\n1. 卸载当前版本并重启电脑\n2. 从本平台重新下载最新版本\n3. 右键选择「以管理员身份运行」安装\n4. 安装完成后再次重启', keywords: 'WPS,安装,启动,打不开', category: '安装问题' },
    { question: '忘记登录密码怎么办？', answer: '请联系管理员重置密码。您可以：\n1. 提交工单说明情况\n2. 联系本单位IT管理员\n管理员会在后台为您重置密码。', keywords: '密码,忘记,重置,登录', category: '账号问题' },
    { question: '激活码已使用但软件显示未激活', answer: '这种情况可能原因：\n1. 激活服务器延迟，请等待几分钟后重试\n2. 网络问题导致激活信息未同步\n3. 请确认激活的产品版本与码匹配\n如持续出现请提交工单。', keywords: '激活码,已使用,未激活,无效', category: '激活问题' },
    { question: '如何申请云服务账号？', answer: '登录平台后，进入「云服务」页面，选择需要的服务，点击「申请开通」。系统将自动为您创建账号并显示密码。', keywords: '云服务,账号,申请,开通', category: 'SaaS服务' },
    { question: '电脑蓝屏怎么处理？', answer: '常见处理方法：\n1. 记录蓝屏错误代码\n2. 重启电脑进入安全模式\n3. 检查最近安装的软件或驱动\n4. 运行系统自带的故障排除工具\n5. 如反复出现请提交工单附上错误代码', keywords: '蓝屏,死机,崩溃,错误', category: '系统故障' },
  ];
  for (const faq of faqs) {
    const exists = db.select().from(schema.faqEntries)
      .where(eq(schema.faqEntries.question, faq.question)).get();
    if (!exists) {
      db.insert(schema.faqEntries).values({ ...faq, sort: faqs.indexOf(faq) }).run();
    }
  }

  // Asset categories seed
  const assetCats = [
    { name: '软件许可', sort: 1 },
    { name: '计算设备', sort: 2 },
    { name: '外设配件', sort: 3 },
    { name: '网络设备', sort: 4 },
  ];
  for (const cat of assetCats) {
    const exists = db.select().from(schema.assetCategories)
      .where(eq(schema.assetCategories.name, cat.name)).get();
    if (!exists) {
      db.insert(schema.assetCategories).values(cat).run();
    }
  }

  console.log('Seed complete');
}

seed().catch(console.error);
