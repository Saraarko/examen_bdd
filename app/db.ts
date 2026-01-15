import Database from 'better-sqlite3';
import path from 'path';

// Ensure we find the DB in the right place relative to execution
// Next.js server execution might vary, but process.cwd() is usually root
const dbPath = path.join(process.cwd(), 'prisma/dev.db');

let db: any;

try {
    db = new Database(dbPath);
    // db.pragma('journal_mode = WAL'); // Optional but good for concurrency
} catch (error) {
    console.error("Failed to open database:", error);
}

export default db;
