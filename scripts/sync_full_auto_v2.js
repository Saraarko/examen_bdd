const Database = require('better-sqlite3');
const fs = require('fs');
const path = require('path');

const dbPath = path.join(__dirname, '../prisma/dev.db');
const db = new Database(dbPath);
const dataDir = path.join(__dirname, '../prisma/data');

function readCsv(filename) {
    const filePath = path.join(dataDir, filename);
    if (!fs.existsSync(filePath)) return [];
    const fileContent = fs.readFileSync(filePath, 'utf-8');
    const lines = fileContent.replace(/\r\n/g, '\n').trim().split('\n');
    if (lines.length < 2) return [];
    const headers = lines[0].split(',').map(h => h.trim());
    return lines.slice(1).map(line => {
        const values = [];
        let current = '';
        let inQuote = false;
        for (let i = 0; i < line.length; i++) {
            const char = line[i];
            if (char === '"') inQuote = !inQuote;
            else if (char === ',' && !inQuote) { values.push(current); current = ''; }
            else current += char;
        }
        values.push(current);
        return headers.reduce((obj, header, index) => {
            obj[header] = values[index]?.trim();
            return obj;
        }, {});
    });
}

try {
    console.log('🔄 Re-syncing CSV to DB...');

    db.prepare('PRAGMA foreign_keys = OFF').run();

    db.transaction(() => {
        // Clear all relevant tables
        const tables = ['ExamEnrollment', 'ModuleEnrollment', 'ExamSession', 'Student', 'Professor', 'Module', 'Formation', 'Department', 'Admin', 'Dean', 'ExamRoom', 'KPI', 'UniversityInfo'];
        for (const t of tables) {
            try { db.prepare(`DELETE FROM ${t}`).run(); } catch (e) { }
        }

        // 1. Depts
        const depts = readCsv('departments.csv');
        const insDept = db.prepare('INSERT OR REPLACE INTO Department (id, name, code, description) VALUES (?, ?, ?, ?)');
        for (const d of depts) insDept.run(d.id, d.name, d.code, d.description);

        // 2. Rooms
        const rooms = readCsv('exam_rooms.csv');
        const insRoom = db.prepare('INSERT OR REPLACE INTO ExamRoom (id, name, capacity, building) VALUES (?, ?, ?, ?)');
        for (const r of rooms) insRoom.run(r.id, r.name, r.capacity, r.building);

        // 3. Formations
        const formations = readCsv('formations.csv');
        const insForm = db.prepare('INSERT OR REPLACE INTO Formation (id, name, code, departmentId, level) VALUES (?, ?, ?, ?, ?)');
        for (const f of formations) insForm.run(f.id, f.name, f.code, f.departmentId, f.level);

        // 4. Modules
        const modules = readCsv('modules.csv');
        const insMod = db.prepare('INSERT OR REPLACE INTO Module (id, name, code, credits, formationId, semester) VALUES (?, ?, ?, ?, ?, ?)');
        for (const m of modules) insMod.run(m.id, m.name, m.code, m.credits, m.formationId, m.semester);

        // 5. Professors
        const professors = readCsv('professors.csv');
        const insProf = db.prepare('INSERT OR REPLACE INTO Professor (id, professorNumber, firstName, lastName, email, password, departmentId, role) VALUES (?, ?, ?, ?, ?, ?, ?, ?)');
        for (const p of professors) {
            insProf.run(p.id, p.professorNumber, p.firstName, p.lastName, p.email, p.password, p.departmentId, p.role || 'professor');
        }

        // 6. Students
        const students = readCsv('students.csv');
        const insStu = db.prepare('INSERT OR REPLACE INTO Student (id, studentNumber, firstName, lastName, email, password, formationId) VALUES (?, ?, ?, ?, ?, ?, ?)');
        for (const s of students) insStu.run(s.id, s.studentNumber, s.firstName, s.lastName, s.email, s.password, s.formationId);

        // 7. Sessions
        const sessions = readCsv('exam_sessions.csv');
        const insSess = db.prepare('INSERT OR REPLACE INTO ExamSession (id, moduleId, examRoomId, professorId, sessionDate, startTime, endTime, duration, type, status) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)');
        for (const s of sessions) insSess.run(s.id, s.moduleId, s.examRoomId, s.professorId, s.sessionDate, s.startTime, s.endTime, s.duration, s.type, 'PUBLISHED');

        // 8. Admins/Deans
        const admins = readCsv('admins.csv');
        const insAdmin = db.prepare('INSERT OR REPLACE INTO Admin (id, firstName, lastName, email, password) VALUES (?, ?, ?, ?, ?)');
        for (const a of admins) insAdmin.run(a.id, a.firstName, a.lastName, a.email, a.password);

        const deans = readCsv('deans.csv');
        const insDean = db.prepare('INSERT OR REPLACE INTO Dean (id, firstName, lastName, email, password, title) VALUES (?, ?, ?, ?, ?, ?)');
        for (const d of deans) insDean.run(d.id, d.firstName, d.lastName, d.email, d.password, d.title);

        db.prepare('INSERT OR REPLACE INTO UniversityInfo (id, name, totalStudents, totalDepartments, totalFormations) VALUES (1, "Univ Demo", 13000, 12, 45)').run();
        db.prepare('INSERT OR REPLACE INTO KPI (id, tempsGenerationEDT, nbExamensPlanifies, tauxConflits, tauxValidation, heuresProfPlanifiees, amphisUtilises, sallesUtilisees) VALUES (1, 4, 1500, 0, 100, 0, 0, 0)').run();

        // 9. AUTOMATIC ENROLLMENTS
        console.log('🔗 Generating automatic Enrollments...');

        db.prepare(`
            INSERT OR IGNORE INTO ModuleEnrollment (studentId, moduleId)
            SELECT s.id, m.id 
            FROM Student s
            JOIN Module m ON s.formationId = m.formationId
        `).run();

        db.prepare(`
            INSERT OR IGNORE INTO ExamEnrollment (studentId, examSessionId)
            SELECT me.studentId, es.id
            FROM ModuleEnrollment me
            JOIN ExamSession es ON me.moduleId = es.moduleId
        `).run();

    })();

    db.prepare('PRAGMA foreign_keys = ON').run();
    console.log('✅ Sync Successfully Finished. Enrollments generated.');
} catch (err) {
    console.error('❌ Sync failed:', err);
} finally {
    db.close();
}
