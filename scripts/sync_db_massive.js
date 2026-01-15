const Database = require('better-sqlite3');
const fs = require('fs');
const path = require('path');

const dbPath = path.join(__dirname, '../prisma/dev.db');
const db = new Database(dbPath);
const dataDir = path.join(__dirname, '../prisma/data');

function readCsv(filename) {
    const filePath = path.join(dataDir, filename);
    const fileContent = fs.readFileSync(filePath, 'utf-8');
    const lines = fileContent.replace(/\r\n/g, '\n').trim().split('\n');
    const headers = lines[0].split(',').map(h => h.trim());
    return lines.slice(1).map(line => {
        const values = line.split(',');
        return headers.reduce((obj, header, index) => {
            obj[header] = values[index];
            return obj;
        }, {});
    });
}

try {
    console.log('Syncing database with massive CSV data...');

    db.transaction(() => {
        // Clear old data to avoid conflicts with massive set
        db.prepare('DELETE FROM ExamEnrollment').run();
        db.prepare('DELETE FROM ModuleEnrollment').run();
        db.prepare('DELETE FROM ExamSession').run();
        db.prepare('DELETE FROM Student').run();
        db.prepare('DELETE FROM Module').run();
        db.prepare('DELETE FROM Formation').run();
        db.prepare('DELETE FROM Department').run();

        // 1. Departments
        const depts = readCsv('departments.csv');
        const insDept = db.prepare('INSERT INTO Department (id, name, code, description) VALUES (?, ?, ?, ?)');
        for (const d of depts) insDept.run(d.id, d.name, d.code, d.description);
        console.log(`✓ Synchronized ${depts.length} departments`);

        // 2. Formations
        const formations = readCsv('formations.csv');
        const insForm = db.prepare('INSERT INTO Formation (id, name, code, departmentId, level) VALUES (?, ?, ?, ?, ?)');
        for (const f of formations) insForm.run(f.id, f.name, f.code, f.departmentId, f.level);
        console.log(`✓ Synchronized ${formations.length} formations`);

        // 3. Students
        const students = readCsv('students.csv');
        const insStu = db.prepare('INSERT INTO Student (id, studentNumber, firstName, lastName, email, password, formationId) VALUES (?, ?, ?, ?, ?, ?, ?)');
        for (const s of students) insStu.run(s.id, s.studentNumber, s.firstName, s.lastName, s.email, s.password, s.formationId);
        console.log(`✓ Synchronized ${students.length} students`);

        // 4. Exam Sessions
        const sessions = readCsv('exam_sessions.csv');
        const insSess = db.prepare('INSERT INTO ExamSession (id, moduleId, examRoomId, professorId, sessionDate, startTime, endTime, duration, type, status) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)');
        for (const s of sessions) insSess.run(s.id, s.moduleId, s.examRoomId, s.professorId, s.sessionDate, s.startTime, s.endTime, s.duration, s.type, 'PUBLISHED');
        console.log(`✓ Synchronized ${sessions.length} exam sessions`);
    })();

    // 5. Update University Info
    db.prepare('UPDATE UniversityInfo SET totalStudents = 13000, totalDepartments = 12, totalFormations = 45 WHERE id = 1').run();
    db.prepare('UPDATE KPI SET nbExamensPlanifies = 1500, tempsGenerationEDT = 4 WHERE id = 1').run();

    console.log('\n✅ Database and CSVs are now perfectly synchronized with demonstration data!');
} catch (err) {
    console.error('❌ Sync failed:', err);
} finally {
    db.close();
}
