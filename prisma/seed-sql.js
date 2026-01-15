const Database = require('better-sqlite3');
const fs = require('fs')
const path = require('path')

const dbPath = path.join(__dirname, 'dev.db');
const db = new Database(dbPath);

async function main() {
    console.log('Start seeding SQL ...')

    const dataDir = path.join(__dirname, 'data')

    const readCsv = (filename) => {
        const filePath = path.join(dataDir, filename)
        if (!fs.existsSync(filePath)) {
            console.warn(`File not found: ${filename}`)
            return []
        }
        const fileContent = fs.readFileSync(filePath, 'utf-8')
        const lines = fileContent.trim().split('\n')
        if (lines.length < 2) return []

        const headers = lines[0].split(',').map(h => h.trim())

        return lines.slice(1).map(line => {
            const values = []
            let current = ''
            let inQuote = false
            for (let i = 0; i < line.length; i++) {
                const char = line[i]
                if (char === '"') {
                    inQuote = !inQuote
                } else if (char === ',' && !inQuote) {
                    values.push(current)
                    current = ''
                } else {
                    current += char
                }
            }
            values.push(current)

            return headers.reduce((obj, header, index) => {
                let val = values[index]?.trim()
                if (val?.startsWith('"') && val?.endsWith('"')) {
                    val = val.slice(1, -1)
                }
                obj[header] = val
                return obj
            }, {})
        })
    }

    // 1. Departments
    const departments = readCsv('departments.csv')
    const insertDept = db.prepare('INSERT OR REPLACE INTO Department (id, name, code, description) VALUES (@id, @name, @code, @description)');
    for (const dept of departments) {
        if (!dept.id) continue
        insertDept.run(dept)
    }
    console.log(`Seeded ${departments.length} departments`)

    // 2. Formations
    const formations = readCsv('formations.csv')
    const insertFormation = db.prepare('INSERT OR REPLACE INTO Formation (id, name, code, departmentId, level) VALUES (@id, @name, @code, @departmentId, @level)');
    for (const f of formations) {
        if (!f.id) continue
        insertFormation.run(f)
    }
    console.log(`Seeded ${formations.length} formations`)

    // 3. Modules
    const modules = readCsv('modules.csv')
    const insertModule = db.prepare('INSERT OR REPLACE INTO Module (id, name, code, credits, formationId, semester) VALUES (@id, @name, @code, @credits, @formationId, @semester)');
    for (const m of modules) {
        if (!m.id) continue
        insertModule.run(m)
    }
    console.log(`Seeded ${modules.length} modules`)

    // 4. Professors
    const professors = readCsv('professors.csv')
    const insertProf = db.prepare('INSERT OR REPLACE INTO Professor (id, professorNumber, firstName, lastName, email, password, departmentId) VALUES (@id, @professorNumber, @firstName, @lastName, @email, @password, @departmentId)');
    for (const p of professors) {
        if (!p.id) continue
        insertProf.run(p)
    }
    console.log(`Seeded ${professors.length} professors`)

    // 5. Students
    const students = readCsv('students.csv')
    const insertStudent = db.prepare('INSERT OR REPLACE INTO Student (id, studentNumber, firstName, lastName, email, password, formationId) VALUES (@id, @studentNumber, @firstName, @lastName, @email, @password, @formationId)');
    for (const s of students) {
        if (!s.id) continue
        insertStudent.run(s)
    }
    console.log(`Seeded ${students.length} students`)

    // 6. ExamRooms
    const rooms = readCsv('exam_rooms.csv')
    const insertRoom = db.prepare('INSERT OR REPLACE INTO ExamRoom (id, name, capacity, building) VALUES (@id, @name, @capacity, @building)');
    for (const r of rooms) {
        if (!r.id) continue
        insertRoom.run(r)
    }
    console.log(`Seeded ${rooms.length} exam rooms`)

    // 7. ExamSessions
    const sessions = readCsv('exam_sessions.csv')
    const insertSession = db.prepare('INSERT OR REPLACE INTO ExamSession (id, moduleId, examRoomId, professorId, sessionDate, startTime, endTime, duration, type) VALUES (@id, @moduleId, @examRoomId, @professorId, @sessionDate, @startTime, @endTime, @duration, @type)');
    for (const s of sessions) {
        if (!s.id) continue
        // Need to format date to ISO/Timestamp? JS Date is fine usually, but SQLite stores as string/int?
        // Prisma uses TEXT (ISO8601) or REAL (timestamp).
        // In migrations.sql I used DATETIME.
        // I will store ISO string.
        const isoDate = new Date(s.sessionDate).toISOString();
        insertSession.run({ ...s, sessionDate: isoDate })
    }
    console.log(`Seeded ${sessions.length} exam sessions`)

    // 8. Enrollments
    const allStudents = db.prepare('SELECT * FROM Student').all();
    const insertModuleEnrollment = db.prepare('INSERT OR IGNORE INTO ModuleEnrollment (studentId, moduleId) VALUES (@studentId, @moduleId)');
    const insertExamEnrollment = db.prepare('INSERT OR IGNORE INTO ExamEnrollment (studentId, examSessionId) VALUES (@studentId, @examSessionId)');

    for (const student of allStudents) {
        const modulesForFormation = db.prepare('SELECT * FROM Module WHERE formationId = ?').all(student.formationId);

        for (const module of modulesForFormation) {
            insertModuleEnrollment.run({ studentId: student.id, moduleId: module.id });

            const examSessions = db.prepare('SELECT * FROM ExamSession WHERE moduleId = ?').all(module.id);

            for (const session of examSessions) {
                insertExamEnrollment.run({ studentId: student.id, examSessionId: session.id });
            }
        }
    }
    console.log('Enrollments generated')
}

main()
