const Database = require('better-sqlite3');
const fs = require('fs');
const path = require('path');

const dbPath = path.join(__dirname, '../prisma/dev.db');
const migrationPath = path.join(__dirname, '../migrations.sql');

console.log(`Initializing database at ${dbPath}`);

try {
    const db = new Database(dbPath);
    const migration = fs.readFileSync(migrationPath, 'utf-8');
    db.exec(migration);
    console.log('Database initialized successfully.');
} catch (error) {
    console.error('Failed to initialize database:', error);
    process.exit(1);
}
