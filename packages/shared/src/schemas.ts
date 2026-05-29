import { z } from 'zod';

export const loginSchema = z.object({
  username: z.string().min(2).max(50),
  password: z.string().min(6).max(100),
});

export const createUserSchema = z.object({
  username: z.string().min(2).max(50),
  password: z.string().min(6).max(100),
  role: z.enum(['admin', 'user']).default('user'),
});

export const softwareCategorySchema = z.object({
  name: z.string().min(1).max(100),
  sort: z.number().int().default(0),
});

export const helpCategorySchema = z.object({
  name: z.string().min(1).max(100),
  sort: z.number().int().default(0),
});

export const softwareItemSchema = z.object({
  title: z.string().min(1).max(200),
  description: z.string().default(''),
  categoryId: z.number().int().positive(),
  version: z.string().max(50).default(''),
  sort: z.number().int().default(0),
  status: z.enum(['draft', 'published']).default('draft'),
});

export const helpDocumentSchema = z.object({
  title: z.string().min(1).max(200),
  body: z.string().default(''),
  categoryId: z.number().int().positive(),
  sort: z.number().int().default(0),
  status: z.enum(['draft', 'published', 'archived']).default('draft'),
});

export const activationProductSchema = z.object({
  code: z.string().min(1).max(20),
  name: z.string().min(1).max(100),
  description: z.string().default(''),
  clientDownloadUrl: z.string().url().or(z.literal('')).default(''),
});

export const claimCodeSchema = z.object({
  productId: z.number().int().positive(),
});

// 管理员手动发放：将指定产品分配给指定用户
export const adminGrantSchema = z.object({
  userId: z.number().int().positive(),
  productId: z.number().int().positive(),
});
