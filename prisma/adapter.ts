import { PrismaBetterSqlite3 } from '@prisma/adapter-better-sqlite3';
import Database from 'better-sqlite3';
import path from 'path';

const dbPath = path.join(process.cwd(), 'prisma/dev.db');
const connection = new Database(dbPath);
const adapter = new PrismaBetterSqlite3(connection);

export { adapter, connection };
