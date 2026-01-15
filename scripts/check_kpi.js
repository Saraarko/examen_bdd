const Database = require('better-sqlite3');
const path = require('path');

const dbPath = path.join(process.cwd(), 'prisma/dev.db');
console.log('Opening DB at:', dbPath);
const db = new Database(dbPath);

const kpis = db.prepare('SELECT * FROM KPI').get();
console.log('KPIs:', kpis);

const university = db.prepare('SELECT * FROM UniversityInfo').get();
console.log('University:', university);

const conflicts = db.prepare('SELECT * FROM Conflict').all();
console.log('Conflicts:', conflicts);
