import Database from 'better-sqlite3';
import { drizzle } from 'drizzle-orm/better-sqlite3';
import * as schema from './schema.js';
import { resolve } from 'path';
import { mkdirSync } from 'fs';

const dbPath = process.env.DATABASE_URL || resolve(process.cwd(), '../../data/app.sqlite');
mkdirSync(resolve(dbPath, '..'), { recursive: true });

const sqlite = new Database(dbPath);
sqlite.pragma('journal_mode = WAL');
sqlite.pragma('foreign_keys = ON');

export const db = drizzle(sqlite, { schema });
export { schema };
