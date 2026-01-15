const Database = require('better-sqlite3');
const path = require('path');

const dbPath = path.join(process.cwd(), 'prisma/dev.db');
let db;

try {
    db = new Database(dbPath);
    console.log('Database connected');

    const kpis = db.prepare('SELECT * FROM KPI').get();
    const nbExamsQuery = db.prepare('SELECT COUNT(*) as count FROM ExamSession').get();
    const nbExams = nbExamsQuery ? nbExamsQuery.count : 0;

    const conflits = db.prepare('SELECT * FROM Conflict').all();
    const salles = db.prepare('SELECT * FROM ExamRoom').all();
    const university = db.prepare('SELECT * FROM UniversityInfo').get();
    const departments = db.prepare('SELECT * FROM Department').all();

    console.log('Structural data fetched');

    const departmentsWithStats = departments.map((dept) => {
        const profCount = db.prepare('SELECT COUNT(*) as count FROM Professor WHERE departmentId = ?').get(dept.id).count;
        const formationCount = db.prepare('SELECT COUNT(*) as count FROM Formation WHERE departmentId = ?').get(dept.id).count;
        const studentCountQuery = db.prepare(`
            SELECT COUNT(*) as count FROM Student s
            JOIN Formation f ON s.formationId = f.id
            WHERE f.departmentId = ?
        `).get(dept.id);
        const studentCount = studentCountQuery ? studentCountQuery.count : 0;

        return {
            name: dept.name,
            totalProfessors: profCount,
            formations: formationCount,
            totalStudents: studentCount
        };
    });

    console.log('Mapping results:', departmentsWithStats.length);
    process.exit(0);
} catch (e) {
    console.error('FATAL ERROR:', e.message);
    process.exit(1);
}
