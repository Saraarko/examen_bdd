const Database = require('better-sqlite3');
const path = require('path');
const dbPath = path.join(__dirname, '../prisma/dev.db');
const db = new Database(dbPath);

console.log('Fixing authentication for Demo Users...');

// 1. Get valid Formation and Department
// We try to find the "first" ones to attach our demo users to
let dept = db.prepare('SELECT id FROM Department LIMIT 1').get();
if (!dept) {
    console.log('No departments found. Please run seed first.');
    process.exit(1);
}
let deptId = dept.id;

let formation = db.prepare('SELECT id FROM Formation WHERE departmentId = ? LIMIT 1').get(deptId);
if (!formation) {
    formation = db.prepare('SELECT id FROM Formation LIMIT 1').get();
}
if (!formation) {
    console.log('No formations found. Please run seed first.');
    process.exit(1);
}
let formationId = formation.id;

console.log(`Using Department ID: ${deptId}, Formation ID: ${formationId}`);

// 2. Fix Teacher
const teacherEmail = 'professeur@univ.ma';
const teacher = db.prepare('SELECT * FROM Professor WHERE email = ?').get(teacherEmail);

if (!teacher) {
    console.log('Creating Teacher (professeur@univ.ma)...');
    try {
        db.prepare(`
            INSERT INTO Professor (professorNumber, firstName, lastName, email, password, departmentId, role)
            VALUES (?, ?, ?, ?, ?, ?, ?)
        `).run('PROF_DEMO', 'Dr', 'Professeur', teacherEmail, 'prof123', deptId, 'professor');
    } catch (e) { console.error('Error creating teacher:', e.message); }
} else {
    console.log('Updating Teacher (professeur@univ.ma)...');
    db.prepare('UPDATE Professor SET password = ?, departmentId = ?, role = ? WHERE email = ?')
        .run('prof123', deptId, 'professor', teacherEmail);
}

// 3. Fix Student
const studentEmail = 'rayankh@univ.ma';
const student = db.prepare('SELECT * FROM Student WHERE email = ?').get(studentEmail);

if (!student) {
    console.log('Creating Student (rayankh@univ.ma)...');
    try {
        db.prepare(`
            INSERT INTO Student (studentNumber, firstName, lastName, email, password, formationId)
            VALUES (?, ?, ?, ?, ?, ?)
        `).run('STU_DEMO', 'Rayan', 'Kh', studentEmail, 'rayan123', formationId);
    } catch (e) { console.error('Error creating student:', e.message); }
} else {
    console.log('Updating Student (rayankh@univ.ma)...');
    db.prepare('UPDATE Student SET password = ?, formationId = ? WHERE email = ?')
        .run('rayan123', formationId, studentEmail);
}

console.log('Fix complete.');
