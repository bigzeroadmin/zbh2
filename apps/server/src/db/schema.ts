import { sqliteTable, text, integer } from 'drizzle-orm/sqlite-core';

export const users = sqliteTable('users', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  username: text('username').notNull().unique(),
  passwordHash: text('password_hash').notNull(),
  role: text('role', { enum: ['admin', 'user'] }).notNull().default('user'),
  status: text('status', { enum: ['active', 'disabled'] }).notNull().default('active'),
  createdAt: text('created_at').notNull().$defaultFn(() => new Date().toISOString()),
});

export const sessions = sqliteTable('sessions', {
  id: text('id').primaryKey(),
  userId: integer('user_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
  expiresAt: text('expires_at').notNull(),
  createdAt: text('created_at').notNull().$defaultFn(() => new Date().toISOString()),
});

export const softwareCategories = sqliteTable('software_categories', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  name: text('name').notNull(),
  sort: integer('sort').notNull().default(0),
  createdAt: text('created_at').notNull().$defaultFn(() => new Date().toISOString()),
});

export const files = sqliteTable('files', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  originalName: text('original_name').notNull(),
  storagePath: text('storage_path').notNull(),
  mime: text('mime').notNull().default('application/octet-stream'),
  size: integer('size').notNull().default(0),
  hash: text('hash').default(''),
  uploaderId: integer('uploader_id').references(() => users.id),
  createdAt: text('created_at').notNull().$defaultFn(() => new Date().toISOString()),
});

export const softwareItems = sqliteTable('software_items', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  title: text('title').notNull(),
  description: text('description').notNull().default(''),
  categoryId: integer('category_id').notNull().references(() => softwareCategories.id),
  version: text('version').notNull().default(''),
  fileId: integer('file_id').references(() => files.id),
  iconFileId: integer('icon_file_id').references(() => files.id),
  sort: integer('sort').notNull().default(0),
  status: text('status', { enum: ['draft', 'published'] }).notNull().default('draft'),
  createdAt: text('created_at').notNull().$defaultFn(() => new Date().toISOString()),
  updatedAt: text('updated_at').notNull().$defaultFn(() => new Date().toISOString()),
});

export const helpCategories = sqliteTable('help_categories', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  name: text('name').notNull(),
  sort: integer('sort').notNull().default(0),
  createdAt: text('created_at').notNull().$defaultFn(() => new Date().toISOString()),
});

export const helpDocuments = sqliteTable('help_documents', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  title: text('title').notNull(),
  body: text('body').notNull().default(''),
  categoryId: integer('category_id').notNull().references(() => helpCategories.id),
  sort: integer('sort').notNull().default(0),
  status: text('status', { enum: ['draft', 'published', 'archived'] }).notNull().default('draft'),
  publishedAt: text('published_at'),
  archivedAt: text('archived_at'),
  createdAt: text('created_at').notNull().$defaultFn(() => new Date().toISOString()),
  updatedAt: text('updated_at').notNull().$defaultFn(() => new Date().toISOString()),
});

export const activationProducts = sqliteTable('activation_products', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  code: text('code').notNull().unique(),
  name: text('name').notNull(),
  description: text('description').notNull().default(''),
  clientDownloadUrl: text('client_download_url').notNull().default(''),
  clientFileId: integer('client_file_id').references(() => files.id),
  createdAt: text('created_at').notNull().$defaultFn(() => new Date().toISOString()),
});

export const activationCodes = sqliteTable('activation_codes', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  productId: integer('product_id').notNull().references(() => activationProducts.id),
  code6: text('code6').notNull(),
  status: text('status', { enum: ['available', 'granted', 'revoked'] }).notNull().default('available'),
  batchId: text('batch_id').notNull().default(''),
  createdAt: text('created_at').notNull().$defaultFn(() => new Date().toISOString()),
});

export const activationCodeGrants = sqliteTable('activation_code_grants', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  codeId: integer('code_id').notNull().references(() => activationCodes.id),
  userId: integer('user_id').notNull().references(() => users.id),
  productId: integer('product_id').notNull().references(() => activationProducts.id),
  grantedAt: text('granted_at').notNull().$defaultFn(() => new Date().toISOString()),
});

// ─── 工单系统 ──────────────────────────────────────
export const tickets = sqliteTable('tickets', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  title: text('title').notNull(),
  description: text('description').notNull().default(''),
  type: text('type', { enum: ['bug', 'request', 'question', 'other'] }).notNull().default('question'),
  priority: text('priority', { enum: ['low', 'medium', 'high', 'urgent'] }).notNull().default('medium'),
  status: text('status', { enum: ['open', 'assigned', 'in_progress', 'resolved', 'closed'] }).notNull().default('open'),
  submitterId: integer('submitter_id').notNull().references(() => users.id),
  assigneeId: integer('assignee_id').references(() => users.id),
  createdAt: text('created_at').notNull().$defaultFn(() => new Date().toISOString()),
  updatedAt: text('updated_at').notNull().$defaultFn(() => new Date().toISOString()),
  resolvedAt: text('resolved_at'),
});

export const ticketReplies = sqliteTable('ticket_replies', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  ticketId: integer('ticket_id').notNull().references(() => tickets.id, { onDelete: 'cascade' }),
  userId: integer('user_id').notNull().references(() => users.id),
  content: text('content').notNull(),
  createdAt: text('created_at').notNull().$defaultFn(() => new Date().toISOString()),
});

// ─── 数字资产管理 ──────────────────────────────────
export const assetCategories = sqliteTable('asset_categories', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  name: text('name').notNull(),
  sort: integer('sort').notNull().default(0),
  createdAt: text('created_at').notNull().$defaultFn(() => new Date().toISOString()),
});

export const assets = sqliteTable('assets', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  assetCode: text('asset_code').notNull().unique(),
  name: text('name').notNull(),
  categoryId: integer('category_id').references(() => assetCategories.id),
  brand: text('brand').notNull().default(''),
  model: text('model').notNull().default(''),
  serialNumber: text('serial_number').notNull().default(''),
  status: text('status', { enum: ['in_stock', 'in_use', 'maintenance', 'retired', 'scrapped'] }).notNull().default('in_stock'),
  assigneeId: integer('assignee_id').references(() => users.id),
  purchaseDate: text('purchase_date'),
  purchasePrice: integer('purchase_price').default(0),
  warrantyExpiry: text('warranty_expiry'),
  location: text('location').notNull().default(''),
  notes: text('notes').notNull().default(''),
  createdAt: text('created_at').notNull().$defaultFn(() => new Date().toISOString()),
  updatedAt: text('updated_at').notNull().$defaultFn(() => new Date().toISOString()),
});

export const assetRecords = sqliteTable('asset_records', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  assetId: integer('asset_id').notNull().references(() => assets.id),
  action: text('action', { enum: ['check_in', 'check_out', 'maintenance', 'return', 'retire', 'scrap'] }).notNull(),
  operatorId: integer('operator_id').notNull().references(() => users.id),
  targetUserId: integer('target_user_id').references(() => users.id),
  notes: text('notes').notNull().default(''),
  createdAt: text('created_at').notNull().$defaultFn(() => new Date().toISOString()),
});

export const assetApprovals = sqliteTable('asset_approvals', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  assetId: integer('asset_id').notNull().references(() => assets.id),
  type: text('type', { enum: ['check_out', 'return', 'scrap'] }).notNull(),
  requesterId: integer('requester_id').notNull().references(() => users.id),
  approverId: integer('approver_id').references(() => users.id),
  status: text('status', { enum: ['pending', 'approved', 'rejected'] }).notNull().default('pending'),
  reason: text('reason').notNull().default(''),
  comment: text('comment').notNull().default(''),
  createdAt: text('created_at').notNull().$defaultFn(() => new Date().toISOString()),
  updatedAt: text('updated_at').notNull().$defaultFn(() => new Date().toISOString()),
});

// ─── SaaS 云服务管理 ───────────────────────────────
export const saasServices = sqliteTable('saas_services', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  name: text('name').notNull(),
  code: text('code').notNull().unique(),
  description: text('description').notNull().default(''),
  status: text('status', { enum: ['active', 'disabled'] }).notNull().default('active'),
  createdAt: text('created_at').notNull().$defaultFn(() => new Date().toISOString()),
});

export const saasPlans = sqliteTable('saas_plans', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  serviceId: integer('service_id').notNull().references(() => saasServices.id),
  name: text('name').notNull(),
  description: text('description').notNull().default(''),
  maxUsers: integer('max_users').notNull().default(0),
  price: integer('price').notNull().default(0),
  sort: integer('sort').notNull().default(0),
  createdAt: text('created_at').notNull().$defaultFn(() => new Date().toISOString()),
});

export const saasAccounts = sqliteTable('saas_accounts', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  serviceId: integer('service_id').notNull().references(() => saasServices.id),
  planId: integer('plan_id').references(() => saasPlans.id),
  userId: integer('user_id').notNull().references(() => users.id),
  accountName: text('account_name').notNull(),
  accountPassword: text('account_password').notNull().default(''),
  status: text('status', { enum: ['pending', 'active', 'disabled', 'expired'] }).notNull().default('pending'),
  expiresAt: text('expires_at'),
  createdAt: text('created_at').notNull().$defaultFn(() => new Date().toISOString()),
  updatedAt: text('updated_at').notNull().$defaultFn(() => new Date().toISOString()),
});

// ─── AI 知识库 / FAQ ───────────────────────────────
export const faqEntries = sqliteTable('faq_entries', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  question: text('question').notNull(),
  answer: text('answer').notNull(),
  keywords: text('keywords').notNull().default(''),
  category: text('category').notNull().default('通用'),
  sort: integer('sort').notNull().default(0),
  createdAt: text('created_at').notNull().$defaultFn(() => new Date().toISOString()),
});
