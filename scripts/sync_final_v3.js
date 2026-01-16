const Database = require('better-sqlite3');
const fs = require('fs');
const path = require('path');

const db = new Database(path.join(__dirname, '../prisma/dev.db'));
const dataDir = path.join(__dirname, '../prisma/data');

function readCsv(filename) {
    const filePath = path.join(dataDir, filename);
    if (!fs.existsSync(filePath)) return [];
    const content = fs.readFileSync(filePath, 'utf-8');
    const lines = content.replace(/\r\n/g, '\n').trim().split('\n');
    const headers = lines[0].split(',').map(h => h.trim());
    return lines.slice(1).map(line => {
        const values = line.split(',');
        const obj = {};
        headers.forEach((h, i) => { obj[h] = values[i]?.trim(); });
        return obj;
    });
}

try {
    console.log('🔄 Final Sync Attempt...');
    db.prepare('PRAGMA foreign_keys = OFF').run();

    const tables = ['ExamEnrollment', 'ModuleEnrollment', 'ExamSession', 'Student', 'Professor', 'Module', 'Formation', 'Department', 'Admin', 'Dean', 'ExamRoom', 'KPI', 'UniversityInfo'];
    for (const t of tables) db.prepare(`DELETE FROM ${t}`).run();

    // Structural
    readCsv('departments.csv').forEach(d => db.prepare('INSERT INTO Department (id, name, code, description) VALUES (?, ?, ?, ?)').run(d.id, d.name, d.code, d.description));
    readCsv('formations.csv').forEach(f => db.prepare('INSERT INTO Formation (id, name, code, departmentId, level) VALUES (?, ?, ?, ?, ?)').run(f.id, f.name, f.code, f.departmentId, f.level));
    readCsv('modules.csv').forEach(m => db.prepare('INSERT INTO Module (id, name, code, credits, formationId, semester) VALUES (?, ?, ?, ?, ?, ?)').run(m.id, m.name, m.code, m.credits, m.formationId, m.semester));
    readCsv('exam_rooms.csv').forEach(r => db.prepare('INSERT INTO ExamRoom (id, name, capacity, building) VALUES (?, ?, ?, ?)').run(r.id, r.name, r.capacity, r.building));

    // Users
    readCsv('professors.csv').forEach(p => db.prepare('INSERT INTO Professor (id, professorNumber, firstName, lastName, email, password, departmentId, role) VALUES (?, ?, ?, ?, ?, ?, ?, ?)').run(p.id, p.professorNumber, p.firstName, p.lastName, p.email, p.password, p.departmentId, p.role));
    readCsv('admins.csv').forEach(a => db.prepare('INSERT INTO Admin (id, firstName, lastName, email, password) VALUES (?, ?, ?, ?, ?)').run(a.id, a.firstName, a.lastName, a.email, a.password));
    readCsv('deans.csv').forEach(d => db.prepare('INSERT INTO Dean (id, firstName, lastName, email, password, title) VALUES (?, ?, ?, ?, ?, ?)').run(d.id, d.firstName, d.lastName, d.email, d.password, d.title));

    // Massive data
    console.log('Inserting students...');
    const students = readCsv('students.csv');
    const insStu = db.prepare('INSERT INTO Student (id, studentNumber, firstName, lastName, email, password, formationId) VALUES (?, ?, ?, ?, ?, ?, ?)');
    db.transaction(() => { for (const s of students) insStu.run(s.id, s.studentNumber, s.firstName, s.lastName, s.email, s.password, s.formationId); })();

    console.log('Inserting exams...');
    const sessions = readCsv('exam_sessions.csv');
    const insSess = db.prepare('INSERT INTO ExamSession (id, moduleId, examRoomId, professorId, sessionDate, startTime, endTime, duration, type, status) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)');
    db.transaction(() => { for (const s of sessions) insSess.run(s.id, s.moduleId, s.examRoomId, s.professorId, s.sessionDate, s.startTime, s.endTime, s.duration, s.type, 'DRAFT'); })();

    // Enrollments
    console.log('Generating enrollments...');
    db.prepare(`INSERT INTO ModuleEnrollment (studentId, moduleId) SELECT s.id, m.id FROM Student s JOIN Module m ON s.formationId = m.formationId`).run();
    db.prepare(`INSERT INTO ExamEnrollment (studentId, examSessionId) SELECT me.studentId, es.id FROM ModuleEnrollment me JOIN ExamSession es ON me.moduleId = es.moduleId`).run();

    // Stats
    db.prepare('INSERT INTO UniversityInfo (id, name, totalStudents, totalDepartments, totalFormations) VALUES (1, \'Demo University\', 13000, 12, 45)').run();
    db.prepare('INSERT INTO KPI (id, tempsGenerationEDT, nbExamensPlanifies, tauxConflits, tauxValidation, heuresProfPlanifiees, amphisUtilises, sallesUtilisees) VALUES (1, 4, 1500, 0, 100, 0, 0, 0)').run();

    db.prepare('PRAGMA foreign_keys = ON').run();
    console.log('✅ DONE! Student dashboard is restored and fully populated.');
} catch (e) {
    console.error('❌ FAILED:', e.message);
} finally {
    db.close();
}
