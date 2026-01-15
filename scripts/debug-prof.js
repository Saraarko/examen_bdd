const Database = require('better-sqlite3');
const path = require('path');

const dbPath = path.join(__dirname, '..', 'prisma', 'dev.db');
const db = new Database(dbPath);

console.log('--- BELKACEMI QUERY ---');
const prof = db.prepare("SELECT * FROM Professor WHERE email = 'belkacemi@gmail.com'").get();
console.log(JSON.stringify(prof, null, 2));

db.close();
