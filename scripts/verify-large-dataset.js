const Database = require('better-sqlite3');
const path = require('path');

const dbPath = path.join(__dirname, '..', 'prisma', 'dev.db');
const db = new Database(dbPath);

const counts = {
    departments: db.prepare('SELECT COUNT(*) as count FROM Department').get().count,
    formations: db.prepare('SELECT COUNT(*) as count FROM Formation').get().count,
    modules: db.prepare('SELECT COUNT(*) as count FROM Module').get().count,
    students: db.prepare('SELECT COUNT(*) as count FROM Student').get().count,
    professors: db.prepare('SELECT COUNT(*) as count FROM Professor').get().count,
    rooms: db.prepare('SELECT COUNT(*) as count FROM ExamRoom').get().count,
    sessions: db.prepare('SELECT COUNT(*) as count FROM ExamSession').get().count
};

console.log('--- DATABASE COUNTS ---');
console.log(JSON.stringify(counts, null, 2));

db.close();
