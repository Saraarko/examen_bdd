const Database = require('better-sqlite3');
const path = require('path');
const dbPath = path.join(__dirname, '../prisma/dev.db');
const db = new Database(dbPath);

console.log('Checking Teacher...');
const teacher = db.prepare("SELECT * FROM Professor WHERE email = 'professeur@univ.ma'").get();
console.log('Teacher Result:', teacher);

console.log('Checking Student...');
const student = db.prepare("SELECT * FROM Student WHERE email = 'rayankh@univ.ma'").get();
console.log('Student Result:', student);
