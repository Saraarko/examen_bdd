const Database = require('better-sqlite3');
const path = require('path');
const dbPath = path.join(__dirname, '../prisma/dev.db');
const db = new Database(dbPath);

console.log('--- PROFESSORS ---');
const profs = db.prepare("SELECT * FROM Professor").all();
console.log(JSON.stringify(profs, null, 2));

console.log('--- STUDENTS ---');
const students = db.prepare("SELECT * FROM Student").all();
console.log(JSON.stringify(students, null, 2));
