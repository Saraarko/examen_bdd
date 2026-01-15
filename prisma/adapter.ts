import { PrismaBetterSqlite3 } from '@prisma/adapter-better-sqlite3';
import { connection } from './seed';

const adapter = new PrismaBetterSqlite3(connection);
