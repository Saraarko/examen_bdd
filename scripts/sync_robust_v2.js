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
        return headers.reduce((obj, h, i) => { obj[h] = values[i]?.trim(); return obj; }, {});
    });
}

try {
    console.log('🔄 Re-syncing CSV to DB...');
    db.prepare('PRAGMA foreign_keys = OFF').run();

    // Deletions
    ['ExamEnrollment', 'ModuleEnrollment', 'ExamSession', 'Student', 'Professor', 'Module', 'Formation', 'Department', 'Admin', 'Dean', 'ExamRoom', 'KPI', 'UniversityInfo'].forEach(t => {
        try { db.prepare(`DELETE FROM ${t}`).run(); } catch (e) { }
    });

    console.log('Structural Data...');
    const depts = readCsv('departments.csv');
    const insDept = db.prepare('INSERT OR REPLACE INTO Department (id, name, code, description) VALUES (?, ?, ?, ?)');
    depts.forEach(d => insDept.run(d.id, d.name, d.code, d.description));

    const forms = readCsv('formations.csv');
    const insForm = db.prepare('INSERT OR REPLACE INTO Formation (id, name, code, departmentId, level) VALUES (?, ?, ?, ?, ?)');
    forms.forEach(f => insForm.run(f.id, f.name, f.code, f.departmentId, f.level));

    const mods = readCsv('modules.csv');
    const insMod = db.prepare('INSERT OR REPLACE INTO Module (id, name, code, credits, formationId, semester) VALUES (?, ?, ?, ?, ?, ?)');
    mods.forEach(m => insMod.run(m.id, m.name, m.code, m.credits, m.formationId, m.semester));

    console.log('Users...');
    const profs = readCsv('professors.csv');
    const insProf = db.prepare('INSERT OR REPLACE INTO Professor (id, professorNumber, firstName, lastName, email, password, departmentId, role) VALUES (?, ?, ?, ?, ?, ?, ?, ?)');
    profs.forEach(p => insProf.run(p.id, p.professorNumber, p.firstName, p.lastName, p.email, p.password, p.departmentId, p.role));

    const admins = readCsv('admins.csv');
    const insAdmin = db.prepare('INSERT OR REPLACE INTO Admin (id, firstName, lastName, email, password) VALUES (?, ?, ?, ?, ?)');
    admins.forEach(a => insAdmin.run(a.id, a.firstName, a.lastName, a.email, a.password));

    const deans = readCsv('deans.csv');
    const insDean = db.prepare('INSERT OR REPLACE INTO Dean (id, firstName, lastName, email, password, title) VALUES (?, ?, ?, ?, ?, ?)');
    deans.forEach(d => insDean.run(d.id, d.firstName, d.lastName, d.email, d.password, d.title));

    console.log('13,000 Students...');
    const students = readCsv('students.csv');
    const stuStmt = db.prepare('INSERT OR REPLACE INTO Student (id, studentNumber, firstName, lastName, email, password, formationId) VALUES (?, ?, ?, ?, ?, ?, ?)');
    db.transaction((list) => {
        for (const s of list) stuStmt.run(s.id, s.studentNumber, s.firstName, s.lastName, s.email, s.password, s.formationId);
    })(students);

    console.log('1,500 Exams...');
    const rooms = readCsv('exam_rooms.csv');
    const insRoom = db.prepare('INSERT OR REPLACE INTO ExamRoom (id, name, capacity, building) VALUES (?, ?, ?, ?)');
    rooms.forEach(r => insRoom.run(r.id, r.name, r.capacity, r.building));

    const sessions = readCsv('exam_sessions.csv');
    const sessStmt = db.prepare('INSERT OR REPLACE INTO ExamSession (id, moduleId, examRoomId, professorId, sessionDate, startTime, endTime, duration, type, status) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)');
    db.transaction((list) => {
        for (const s of list) sessStmt.run(s.id, s.moduleId, s.examRoomId, s.professorId, s.sessionDate, s.startTime, s.endTime, s.duration, s.type, 'PUBLISHED');
    })(sessions);

    console.log('Enrollments...');
    db.prepare(`INSERT OR IGNORE INTO ModuleEnrollment (studentId, moduleId) SELECT s.id, m.id FROM Student s JOIN Module m ON s.formationId = m.formationId`).run();
    db.prepare(`INSERT OR IGNORE INTO ExamEnrollment (studentId, examSessionId) SELECT me.studentId, es.id FROM ModuleEnrollment me JOIN ExamSession es ON me.moduleId = es.moduleId`).run();

    db.prepare('INSERT OR REPLACE INTO UniversityInfo (id, name, totalStudents, totalDepartments, totalFormations) VALUES (1, "Demo Univ", 13000, 12, 45)').run();
    db.prepare('INSERT OR REPLACE INTO KPI (id, tempsGenerationEDT, nbExamensPlanifies, tauxConflits, tauxValidation, heuresProfPlanifiees, amphisUtilises, sallesUtilisees) VALUES (1, 4, 1500, 0, 100, 0, 0, 0)').run();

    db.prepare('PRAGMA foreign_keys = ON').run();
    console.log('✅ Final SUCCESS! Dashboard fixed.');
} catch (e) {
    console.error('💥 ERROR:', e.message);
} finally {
    db.close();
}
