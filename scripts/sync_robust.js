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
        return headers.reduce((obj, h, i) => { obj[h] = values[i]; return obj; }, {});
    });
}

try {
    db.prepare('PRAGMA foreign_keys = OFF').run();

    // Quick clear
    ['ExamEnrollment', 'ModuleEnrollment', 'ExamSession', 'Student', 'Module', 'Formation', 'Department', 'Admin', 'Dean', 'ExamRoom', 'KPI', 'UniversityInfo'].forEach(t => {
        try { db.prepare(`DELETE FROM ${t}`).run(); } catch (e) { }
    });

    console.log('Syncing structural data...');
    const depts = readCsv('departments.csv');
    depts.forEach(d => db.prepare('INSERT INTO Department (id, name, code, description) VALUES (?, ?, ?, ?)').run(d.id, d.name, d.code, d.description));

    const forms = readCsv('formations.csv');
    forms.forEach(f => db.prepare('INSERT INTO Formation (id, name, code, departmentId, level) VALUES (?, ?, ?, ?, ?)').run(f.id, f.name, f.code, f.departmentId, f.level));

    const mods = readCsv('modules.csv');
    mods.forEach(m => db.prepare('INSERT INTO Module (id, name, code, credits, formationId, semester) VALUES (?, ?, ?, ?, ?, ?)').run(m.id, m.name, m.code, m.credits, m.formationId, m.semester));

    console.log('Syncing users...');
    const profs = readCsv('professors.csv');
    profs.forEach(p => db.prepare('INSERT INTO Professor (id, professorNumber, firstName, lastName, email, password, departmentId, role) VALUES (?, ?, ?, ?, ?, ?, ?, ?)').run(p.id, p.professorNumber, p.firstName, p.lastName, p.email, p.password, p.departmentId, p.role));

    const admins = readCsv('admins.csv');
    admins.forEach(a => db.prepare('INSERT INTO Admin (id, firstName, lastName, email, password) VALUES (?, ?, ?, ?, ?)').run(a.id, a.firstName, a.lastName, a.email, a.password));

    const deans = readCsv('deans.csv');
    deans.forEach(d => db.prepare('INSERT INTO Dean (id, firstName, lastName, email, password, title) VALUES (?, ?, ?, ?, ?, ?)').run(d.id, d.firstName, d.lastName, d.email, d.password, d.title));

    console.log('Syncing 13,000 students...');
    const students = readCsv('students.csv');
    const stuStmt = db.prepare('INSERT INTO Student (id, studentNumber, firstName, lastName, email, password, formationId) VALUES (?, ?, ?, ?, ?, ?, ?)');
    db.transaction((list) => {
        for (const s of list) stuStmt.run(s.id, s.studentNumber, s.firstName, s.lastName, s.email, s.password, s.formationId);
    })(students);

    console.log('Syncing 1,500 exams...');
    const rooms = readCsv('exam_rooms.csv');
    rooms.forEach(r => db.prepare('INSERT INTO ExamRoom (id, name, capacity, building) VALUES (?, ?, ?, ?)').run(r.id, r.name, r.capacity, r.building));

    const sessions = readCsv('exam_sessions.csv');
    const sessStmt = db.prepare('INSERT INTO ExamSession (id, moduleId, examRoomId, professorId, sessionDate, startTime, endTime, duration, type, status) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)');
    db.transaction((list) => {
        for (const s of list) sessStmt.run(s.id, s.moduleId, s.examRoomId, s.professorId, s.sessionDate, s.startTime, s.endTime, s.duration, s.type, 'PUBLISHED');
    })(sessions);

    console.log('Generating Enrollments...');
    db.prepare(`INSERT INTO ModuleEnrollment (studentId, moduleId) SELECT s.id, m.id FROM Student s JOIN Module m ON s.formationId = m.formationId`).run();
    db.prepare(`INSERT INTO ExamEnrollment (studentId, examSessionId) SELECT me.studentId, es.id FROM ModuleEnrollment me JOIN ExamSession es ON me.moduleId = es.moduleId`).run();

    db.prepare('INSERT INTO UniversityInfo (id, name, totalStudents, totalDepartments, totalFormations) VALUES (1, "Demo Univ", 13000, 12, 45)').run();
    db.prepare('INSERT INTO KPI (id, tempsGenerationEDT, nbExamensPlanifies, tauxConflits, tauxValidation, heuresProfPlanifiees, amphisUtilises, sallesUtilisees) VALUES (1, 4, 1500, 0, 100, 0, 0, 0)').run();

    db.prepare('PRAGMA foreign_keys = ON').run();
    console.log('🏁 SUCCESS! Everything is synced and enrollments are created.');
} catch (e) {
    console.error('💥 FATAL ERROR:', e.message);
} finally {
    db.close();
}
