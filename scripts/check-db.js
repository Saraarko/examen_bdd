const Database = require('better-sqlite3');
const path = require('path');

const dbPath = path.join(__dirname, '..', 'prisma', 'dev.db');
const db = new Database(dbPath);

function dump(title, table, query) {
    console.log(`\n=== ${title} ===`);
    const rows = db.prepare(query || `SELECT * FROM ${table}`).all();
    rows.forEach(r => console.log(JSON.stringify(r)));
}

dump('ADMINS', 'Admin');
dump('DEANS', 'Dean');
dump('DEPARTMENT HEADS', 'Professor', "SELECT email, password, role FROM Professor WHERE role = 'department_head'");

db.close();
