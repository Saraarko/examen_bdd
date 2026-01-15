const { PrismaClient } = require('@prisma/client')
const fs = require('fs')
const path = require('path')

const prisma = new PrismaClient()

async function main() {
    console.log('Start seeding ...')

    const dataDir = path.join(__dirname, 'data')

    const readCsv = (filename) => {
        const filePath = path.join(dataDir, filename)
        if (!fs.existsSync(filePath)) {
            console.warn(`File not found: ${filename}`)
            return []
        }
        const fileContent = fs.readFileSync(filePath, 'utf-8')
        const lines = fileContent.replace(/\r\n/g, '\n').trim().split('\n')
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

    // 0. Admins
    const admins = readCsv('admins.csv')
    for (const admin of admins) {
        if (!admin.id) continue
        await prisma.admin.upsert({
            where: { email: admin.email },
            update: {},
            create: {
                id: parseInt(admin.id),
                firstName: admin.firstName,
                lastName: admin.lastName,
                email: admin.email,
                password: admin.password
            }
        })
    }
    console.log(`Seeded ${admins.length} admins`)

    // 0.5 Deans
    const deans = readCsv('deans.csv')
    for (const dean of deans) {
        if (!dean.id) continue
        await prisma.dean.upsert({
            where: { email: dean.email },
            update: {},
            create: {
                id: parseInt(dean.id),
                firstName: dean.firstName,
                lastName: dean.lastName,
                email: dean.email,
                password: dean.password,
                title: dean.title
            }
        })
    }
    console.log(`Seeded ${deans.length} deans`)

    // 1. Departments
    const departments = readCsv('departments.csv')
    for (const dept of departments) {
        if (!dept.id) continue
        await prisma.department.upsert({
            where: { code: dept.code },
            update: {},
            create: {
                id: parseInt(dept.id),
                name: dept.name,
                code: dept.code,
                description: dept.description
            }
        })
    }
    console.log(`Seeded ${departments.length} departments`)

    // 2. Formations
    const formations = readCsv('formations.csv')
    for (const f of formations) {
        if (!f.id) continue
        await prisma.formation.upsert({
            where: { code: f.code },
            update: {},
            create: {
                id: parseInt(f.id),
                name: f.name,
                code: f.code,
                level: f.level,
                departmentId: parseInt(f.departmentId)
            }
        })
    }
    console.log(`Seeded ${formations.length} formations`)

    // 3. Modules
    const modules = readCsv('modules.csv')
    for (const m of modules) {
        if (!m.id) continue
        await prisma.module.upsert({
            where: { code: m.code },
            update: {},
            create: {
                id: parseInt(m.id),
                name: m.name,
                code: m.code,
                credits: parseInt(m.credits),
                semester: parseInt(m.semester),
                formationId: parseInt(m.formationId)
            }
        })
    }
    console.log(`Seeded ${modules.length} modules`)

    // 4. Professors
    const professors = readCsv('professors.csv')
    for (const p of professors) {
        if (!p.id) continue
        await prisma.professor.upsert({
            where: { email: p.email },
            update: {},
            create: {
                id: parseInt(p.id),
                professorNumber: p.professorNumber,
                firstName: p.firstName,
                lastName: p.lastName,
                email: p.email,
                password: p.password,
                departmentId: parseInt(p.departmentId),
                role: p.role || 'professor'
            }
        })
    }
    console.log(`Seeded ${professors.length} professors`)

    // 5. Students
    const students = readCsv('students.csv')
    for (const s of students) {
        if (!s.id) continue
        await prisma.student.upsert({
            where: { email: s.email },
            update: {},
            create: {
                id: parseInt(s.id),
                studentNumber: s.studentNumber,
                firstName: s.firstName,
                lastName: s.lastName,
                email: s.email,
                password: s.password,
                formationId: parseInt(s.formationId)
            }
        })
    }
    console.log(`Seeded ${students.length} students`)

    // 6. ExamRooms
    const rooms = readCsv('exam_rooms.csv')
    for (const r of rooms) {
        if (!r.id) continue
        await prisma.examRoom.upsert({
            where: { id: parseInt(r.id) },
            update: {},
            create: {
                id: parseInt(r.id),
                name: r.name,
                capacity: parseInt(r.capacity),
                building: r.building
            }
        })
    }
    console.log(`Seeded ${rooms.length} exam rooms`)

    // 7. ExamSessions
    const sessions = readCsv('exam_sessions.csv')
    for (const s of sessions) {
        if (!s.id) continue
        await prisma.examSession.upsert({
            where: { id: parseInt(s.id) },
            update: {},
            create: {
                id: parseInt(s.id),
                moduleId: parseInt(s.moduleId),
                examRoomId: parseInt(s.examRoomId),
                professorId: parseInt(s.professorId),
                sessionDate: new Date(s.sessionDate),
                startTime: s.startTime,
                endTime: s.endTime,
                duration: parseInt(s.duration),
                type: s.type
            }
        })
    }
    console.log(`Seeded ${sessions.length} exam sessions`)

    // 8. Enrollments
    const allStudents = await prisma.student.findMany()

    for (const student of allStudents) {
        const modulesForFormation = await prisma.module.findMany({
            where: { formationId: student.formationId }
        })

        for (const module of modulesForFormation) {
            await prisma.moduleEnrollment.upsert({
                where: {
                    studentId_moduleId: {
                        studentId: student.id,
                        moduleId: module.id
                    }
                },
                update: {},
                create: {
                    studentId: student.id,
                    moduleId: module.id
                }
            })

            const sessions = await prisma.examSession.findMany({
                where: { moduleId: module.id }
            })

            for (const session of sessions) {
                await prisma.examEnrollment.upsert({
                    where: {
                        studentId_examSessionId: {
                            studentId: student.id,
                            examSessionId: session.id
                        }
                    },
                    update: {},
                    create: {
                        studentId: student.id,
                        examSessionId: session.id
                    }
                })
            }
        }
    }
    console.log('Enrollments generated')
}

main()
    .then(async () => {
        await prisma.$disconnect()
    })
    .catch(async (e) => {
        console.error(e)
        await prisma.$disconnect()
        process.exit(1)
    })
