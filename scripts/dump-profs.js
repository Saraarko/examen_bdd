const Database = require('better-sqlite3');
const path = require('path');

const dbPath = path.join(__dirname, '..', 'prisma', 'dev.db');
const db = new Database(dbPath);

console.log('--- ALL PROFESSORS ---');
const profs = db.prepare("SELECT id, firstName, lastName, email, role FROM Professor").all();
console.log(JSON.stringify(profs, null, 2));

db.close();
