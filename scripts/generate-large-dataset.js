const Database = require('better-sqlite3');
const path = require('path');

const dbPath = path.join(__dirname, '..', 'prisma', 'dev.db');
const db = new Database(dbPath);

console.log('--- STARTING LARGE DATA GENERATION ---');

db.pragma('foreign_keys = OFF');

db.transaction(() => {
    // 1. Departments (10)
    console.log('Generating 10 Departments...');
    db.prepare('DELETE FROM Department').run();
    for (let i = 1; i <= 10; i++) {
        db.prepare(`
            INSERT INTO Department (id, name, code, description)
            VALUES (?, ?, ?, ?)
        `).run(i, `Département ${i}`, `DEPT${i}`, `Description for Dept ${i}`);
    }

    // 2. Formations (80)
    console.log('Generating 80 Formations...');
    db.prepare('DELETE FROM Formation').run();
    for (let i = 1; i <= 80; i++) {
        const deptId = ((i - 1) % 10) + 1;
        db.prepare(`
            INSERT INTO Formation (id, name, code, departmentId, level)
            VALUES (?, ?, ?, ?, ?)
        `).run(i, `Formation ${i}`, `FORM${i}`, deptId, i % 2 === 0 ? 'Master' : 'Licence');
    }

    // 3. Modules (50)
    console.log('Generating 50 Modules...');
    db.prepare('DELETE FROM Module').run();
    for (let i = 1; i <= 50; i++) {
        const formationId = ((i - 1) % 80) + 1; // Modules distributed across first 50 formations
        db.prepare(`
            INSERT INTO Module (id, name, code, credits, formationId, semester)
            VALUES (?, ?, ?, ?, ?, ?)
        `).run(i, `Module ${i}`, `MOD${i}`, 6, formationId, (i % 2) + 1);
    }

    // 4. Students (2800)
    console.log('Generating 2800 Students...');
    db.prepare('DELETE FROM Student').run();
    for (let i = 1; i <= 2800; i++) {
        const formationId = ((i - 1) % 80) + 1;
        db.prepare(`
            INSERT INTO Student (id, studentNumber, firstName, lastName, email, password, formationId)
            VALUES (?, ?, ?, ?, ?, ?, ?)
        `).run(
            i,
            `STU${String(i).padStart(4, '0')}`,
            `FirstName${i}`,
            `LastName${i}`,
            `student${i}@univ.dz`,
            'password123',
            formationId
        );
    }

    // 5. Teachers (157)
    console.log('Generating 157 Teachers...');
    db.prepare("DELETE FROM Professor WHERE role = 'professor' OR role IS NULL").run();
    // Keep department heads if they exist, but actually user wants a specific volume.
    // I'll clear all Professors to ensure count is exactly 157.
    db.prepare('DELETE FROM Professor').run();
    for (let i = 1; i <= 157; i++) {
        const deptId = ((i - 1) % 10) + 1;
        const role = (i <= 10) ? 'department_head' : 'professor';
        db.prepare(`
            INSERT INTO Professor (id, professorNumber, firstName, lastName, email, password, departmentId, role)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?)
        `).run(
            i,
            `PROF${String(i).padStart(3, '0')}`,
            `ProfName${i}`,
            `ProfLast${i}`,
            `prof${i}@univ.dz`,
            'password123',
            deptId,
            role
        );
    }

    // 6. Exam Rooms (60)
    console.log('Generating 60 Exam Rooms...');
    db.prepare('DELETE FROM ExamRoom').run();
    for (let i = 1; i <= 60; i++) {
        db.prepare(`
            INSERT INTO ExamRoom (id, name, capacity, building)
            VALUES (?, ?, ?, ?)
        `).run(i, `Salle ${i}`, i <= 10 ? 100 : 40, i <= 10 ? 'Amphi' : 'Bloc A');
    }

    // 7. Exam Sessions (30)
    console.log('Generating 30 Exam Sessions...');
    db.prepare('DELETE FROM ExamSession').run();
    const startDate = new Date('2025-06-01');
    for (let i = 1; i <= 30; i++) {
        const moduleId = i; // Use first 30 modules
        const roomId = ((i - 1) % 60) + 1;
        const profId = ((i - 1) % 157) + 1;
        const sessionDate = new Date(startDate);
        sessionDate.setDate(startDate.getDate() + Math.floor(i / 5));

        db.prepare(`
            INSERT INTO ExamSession (id, moduleId, examRoomId, professorId, sessionDate, startTime, endTime, duration, type, status)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        `).run(
            i,
            moduleId,
            roomId,
            profId,
            sessionDate.toISOString(),
            '09:00',
            '11:00',
            120,
            'Écrit',
            'DRAFT'
        );
    }

    // 8. Module Enrollments (consistent with students/modules)
    console.log('Generating Module Enrollments...');
    db.prepare('DELETE FROM ModuleEnrollment').run();
    // Each student is enrolled in modules of their formation
    const students = db.prepare('SELECT id, formationId FROM Student').all();
    const modules = db.prepare('SELECT id, formationId FROM Module').all();

    for (const student of students) {
        const formationModules = modules.filter(m => m.formationId === student.formationId);
        for (const module of formationModules) {
            db.prepare(`
                INSERT INTO ModuleEnrollment (studentId, moduleId)
                VALUES (?, ?)
            `).run(student.id, module.id);
        }
    }

    // 9. KPIs & University Info
    console.log('Updating KPIs & University Info...');
    db.prepare('DELETE FROM KPI').run();
    db.prepare(`
        INSERT INTO KPI (id, tempsGenerationEDT, nbExamensPlanifies, tauxConflits, tauxValidation, heuresProfPlanifiees, amphisUtilises, sallesUtilisees)
        VALUES (1, 45, 30, 0, 0, 60, 10, 20)
    `).run();

    db.prepare('DELETE FROM UniversityInfo').run();
    db.prepare(`
        INSERT INTO UniversityInfo (id, name, totalStudents, totalDepartments, totalFormations)
        VALUES (1, 'UMBB Faculté de Science (Extended)', 2800, 10, 80)
    `).run();

    console.log('DONE. Generated dataset as requested.');

})();

db.close();
