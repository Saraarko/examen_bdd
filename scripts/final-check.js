const Database = require('better-sqlite3');
const path = require('path');

const dbPath = path.join(__dirname, '..', 'prisma', 'dev.db');
const db = new Database(dbPath);

console.log('--- ADMINS ---');
console.log(JSON.stringify(db.prepare("SELECT email, password FROM Admin").all(), null, 2));

console.log('\n--- DEANS ---');
console.log(JSON.stringify(db.prepare("SELECT email, password FROM Dean").all(), null, 2));

console.log('\n--- DEPT HEADS ---');
console.log(JSON.stringify(db.prepare("SELECT email, password, role FROM Professor WHERE role = 'department_head'").all(), null, 2));

db.close();
