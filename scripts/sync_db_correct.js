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
        const values = line.split(',');
        return headers.reduce((obj, header, index) => {
            obj[header] = values[index]?.trim();
            return obj;
        }, {});
    });
}

try {
    console.log('🔄 Fixing Database Synchronization (including Professors)...');

    db.transaction(() => {
        // Clear tables
        db.prepare('DELETE FROM ExamEnrollment').run();
        db.prepare('DELETE FROM ModuleEnrollment').run();
        db.prepare('DELETE FROM ExamSession').run();
        db.prepare('DELETE FROM Student').run();
        db.prepare('DELETE FROM Professor').run();
        db.prepare('DELETE FROM Module').run();
        db.prepare('DELETE FROM Formation').run();
        db.prepare('DELETE FROM Department').run();
        db.prepare('DELETE FROM Admin').run();
        db.prepare('DELETE FROM Dean').run();

        // 1. Departments
        const depts = readCsv('departments.csv');
        const insDept = db.prepare('INSERT INTO Department (id, name, code, description) VALUES (?, ?, ?, ?)');
        for (const d of depts) insDept.run(d.id, d.name, d.code, d.description);
        console.log(`✓ Depts: ${depts.length}`);

        // 2. Formations
        const formations = readCsv('formations.csv');
        const insForm = db.prepare('INSERT INTO Formation (id, name, code, departmentId, level) VALUES (?, ?, ?, ?, ?)');
        for (const f of formations) insForm.run(f.id, f.name, f.code, f.departmentId, f.level);
        console.log(`✓ Formations: ${formations.length}`);

        // 3. Professors (ESSENTIAL for Belkacemi)
        const professors = readCsv('professors.csv');
        const insProf = db.prepare('INSERT INTO Professor (id, professorNumber, firstName, lastName, email, password, departmentId, role) VALUES (?, ?, ?, ?, ?, ?, ?, ?)');
        for (const p of professors) {
            insProf.run(p.id, p.professorNumber, p.firstName, p.lastName, p.email, p.password, p.departmentId, p.role || 'professor');
        }
        console.log(`✓ Professors: ${professors.length}`);

        // 4. Students
        const students = readCsv('students.csv');
        const insStu = db.prepare('INSERT INTO Student (id, studentNumber, firstName, lastName, email, password, formationId) VALUES (?, ?, ?, ?, ?, ?, ?)');
        for (const s of students) insStu.run(s.id, s.studentNumber, s.firstName, s.lastName, s.email, s.password, s.formationId);
        console.log(`✓ Students: ${students.length}`);

        // 5. Admins
        const admins = readCsv('admins.csv');
        const insAdmin = db.prepare('INSERT INTO Admin (id, firstName, lastName, email, password) VALUES (?, ?, ?, ?, ?)');
        for (const a of admins) insAdmin.run(a.id, a.firstName, a.lastName, a.email, a.password);
        console.log(`✓ Admins: ${admins.length}`);

        // 6. Deans
        const deans = readCsv('deans.csv');
        const insDean = db.prepare('INSERT INTO Dean (id, firstName, lastName, email, password, title) VALUES (?, ?, ?, ?, ?, ?)');
        for (const d of deans) insDean.run(d.id, d.firstName, d.lastName, d.email, d.password, d.title);
        console.log(`✓ Deans: ${deans.length}`);

        // 7. Exam Sessions
        const sessions = readCsv('exam_sessions.csv');
        const insSess = db.prepare('INSERT INTO ExamSession (id, moduleId, examRoomId, professorId, sessionDate, startTime, endTime, duration, type, status) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)');
        for (const s of sessions) insSess.run(s.id, s.moduleId, s.examRoomId, s.professorId, s.sessionDate, s.startTime, s.endTime, s.duration, s.type, 'PUBLISHED');
        console.log(`✓ Exam Sessions: ${sessions.length}`);
    })();

    console.log('\n✅ Database fully synchronized with ALL CSV files.');
} catch (err) {
    console.error('❌ Sync failed:', err);
} finally {
    db.close();
}
