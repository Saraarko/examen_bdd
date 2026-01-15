"use server"

import db from './db'

export type ExamSessionWithDetails = {
    id: number
    sessionDate: Date
    startTime: string
    endTime: string
    duration: number
    type: string
    module: {
        name: string
        code: string
    }
    examRoom: {
        name: string
        building: string | null
    }
    professor: {
        firstName: string
        lastName: string
    }
}

export async function getStudentPlanning(email: string) {
    if (!db) throw new Error("Database not connected");

    const student = db.prepare('SELECT * FROM Student WHERE email = ?').get(email);

    if (!student) {
        throw new Error("Student not found")
    }

    // Get formation
    const formation = db.prepare('SELECT * FROM Formation WHERE id = ?').get(student.formationId);
    student.formation = formation;

    // Get exams via enrollments with JOINs to reconstruct the nested structure
    const rows = db.prepare(`
    SELECT 
      es.id as examId, es.sessionDate, es.startTime, es.endTime, es.duration, es.type,
      m.name as moduleName, m.code as moduleCode,
      er.name as roomName, er.building as roomBuilding,
      p.firstName as profFirstName, p.lastName as profLastName
    FROM ModuleEnrollment me
    JOIN ExamSession es ON me.moduleId = es.moduleId
    JOIN Module m ON es.moduleId = m.id
    JOIN ExamRoom er ON es.examRoomId = er.id
    JOIN Professor p ON es.professorId = p.id
    WHERE me.studentId = ? AND es.status = 'PUBLISHED'
    ORDER BY es.sessionDate ASC
  `).all(student.id);

    const exams = rows.map((row: any) => ({
        id: row.examId,
        sessionDate: new Date(row.sessionDate), // Parse from ISO string
        startTime: row.startTime,
        endTime: row.endTime,
        duration: row.duration,
        type: row.type,
        module: {
            name: row.moduleName,
            code: row.moduleCode
        },
        examRoom: {
            name: row.roomName,
            building: row.roomBuilding
        },
        professor: {
            firstName: row.profFirstName,
            lastName: row.profLastName
        }
    }));

    return {
        ...student,
        exams
    }
}

export async function getTeacherPlanning(email: string) {
    if (!db) throw new Error("Database not connected");

    const prof = db.prepare('SELECT * FROM Professor WHERE email = ?').get(email);
    if (!prof) throw new Error("Professor not found");

    const rows = db.prepare(`
        SELECT 
          es.id as examId, es.sessionDate, es.startTime, es.endTime, es.duration, es.type,
          m.id as moduleId, m.name as moduleName, m.code as moduleCode, m.credits, m.semester,
          (SELECT COUNT(*) FROM ModuleEnrollment me WHERE me.moduleId = m.id) as studentCount,
          f.name as formationName,
          er.name as roomName, er.building as roomBuilding
        FROM ExamSession es
        JOIN Module m ON es.moduleId = m.id
        JOIN Formation f ON m.formationId = f.id
        JOIN ExamRoom er ON es.examRoomId = er.id
        WHERE es.professorId = ? AND es.status = 'PUBLISHED'
        ORDER BY es.sessionDate ASC
    `).all(prof.id);

    const exams = rows.map((row: any) => ({
        id: row.examId,
        sessionDate: new Date(row.sessionDate),
        startTime: row.startTime,
        endTime: row.endTime,
        duration: row.duration,
        type: row.type,
        module: {
            id: row.moduleId,
            name: row.moduleName,
            code: row.moduleCode,
            credits: row.credits,
            semester: row.semester,
            formation: row.formationName,
            studentCount: row.studentCount
        },
        examRoom: { name: row.roomName, building: row.roomBuilding }
    }));

    // Get department schedule status
    const deptExams = db.prepare(`
        SELECT es.status FROM ExamSession es 
        JOIN Module m ON es.moduleId = m.id 
        JOIN Formation f ON m.formationId = f.id 
        WHERE f.departmentId = ?
    `).all(prof.departmentId);

    const statuses = deptExams.map((e: any) => e.status);
    let scheduleStatus = 'none';
    if (statuses.length > 0) {
        if (statuses.includes('PENDING_CHEF')) scheduleStatus = 'pending_chef';
        else if (statuses.includes('PENDING_DEAN')) scheduleStatus = 'pending_dean';
        else if (statuses.includes('PUBLISHED')) scheduleStatus = 'published';
        else scheduleStatus = 'draft';
    }

    return {
        ...prof,
        exams,
        scheduleStatus
    }
}

export async function authenticateUser(email: string, password: string, role: string) {
    console.log('[authenticateUser] Called with:', { email, role });
    if (!db) {
        console.error('[authenticateUser] Database not connected');
        return { success: false, error: "DB not connected" };
    }

    if (role === 'admin') {
        const admin = db.prepare('SELECT * FROM Admin WHERE email = ?').get(email);
        console.log('[authenticateUser] Admin query result:', admin);
        if (admin && admin.password === password) {
            return { success: true, user: { id: String(admin.id), name: `${admin.firstName} ${admin.lastName}`, email: admin.email, role: 'admin' } }
        }
    } else if (role === 'dean') {
        const dean = db.prepare('SELECT * FROM Dean WHERE email = ?').get(email);
        console.log('[authenticateUser] Dean query result:', dean);
        if (dean && dean.password === password) {
            return { success: true, user: { id: String(dean.id), name: `${dean.firstName} ${dean.lastName}`, email: dean.email, role: 'dean', title: dean.title } }
        }
    } else if (role === 'department') {
        const prof = db.prepare('SELECT * FROM Professor WHERE email = ? AND role = ?').get(email, 'chef_de_departement');
        console.log('[authenticateUser] Department head query result:', prof);
        if (prof && prof.password === password) {
            return { success: true, user: { id: String(prof.id), name: `${prof.firstName} ${prof.lastName}`, email: prof.email, role: 'department', department: prof.departmentId } }
        }
    } else if (role === 'student') {
        const student = db.prepare('SELECT * FROM Student WHERE email = ?').get(email);
        console.log('[authenticateUser] Student query result:', student);
        if (student && student.password === password) {
            return { success: true, user: { id: String(student.id), name: `${student.firstName} ${student.lastName}`, email: student.email, role: 'student', formation: student.formationId } }
        }
    } else if (role === 'teacher') {
        const prof = db.prepare('SELECT * FROM Professor WHERE email = ?').get(email);
        console.log('[authenticateUser] Professor query result:', prof);
        if (prof && prof.password === password) {
            return { success: true, user: { id: String(prof.id), name: `${prof.firstName} ${prof.lastName}`, email: prof.email, role: 'teacher', department: prof.departmentId } }
        }
    }
    console.log('[authenticateUser] Authentication failed');
    return { success: false }
}

export async function getAdminDashboard() {
    console.log('[getAdminDashboard] Starting fetch...');
    if (!db) throw new Error("Database not connected");

    const start = Date.now();

    try {
        const kpis = db.prepare('SELECT * FROM KPI').get();
        const nbExamsQuery = db.prepare('SELECT COUNT(*) as count FROM ExamSession').get();
        const nbExams = nbExamsQuery ? nbExamsQuery.count : 0;
        if (kpis) kpis.nbExamensPlanifies = nbExams;

        const conflits = db.prepare('SELECT * FROM Conflict').all();
        const salles = db.prepare('SELECT * FROM ExamRoom').all();
        const university = db.prepare('SELECT * FROM UniversityInfo').get();
        const departments = db.prepare('SELECT * FROM Department').all();

        console.log('[getAdminDashboard] Structural data fetched. Mapping departments...');

        // Map departments to include some stats
        const departmentsWithStats = departments.map((dept: any) => {
            const profCount = db.prepare('SELECT COUNT(*) as count FROM Professor WHERE departmentId = ?').get(dept.id).count;
            const formationCount = db.prepare('SELECT COUNT(*) as count FROM Formation WHERE departmentId = ?').get(dept.id).count;
            const studentCountQuery = db.prepare(`
                SELECT COUNT(*) as count FROM Student s
                JOIN Formation f ON s.formationId = f.id
                WHERE f.departmentId = ?
            `).get(dept.id);
            const studentCount = studentCountQuery ? studentCountQuery.count : 0;

            return {
                ...dept,
                totalProfessors: profCount,
                formations: formationCount,
                totalStudents: studentCount
            };
        });

        console.log(`[getAdminDashboard] Completed in ${Date.now() - start}ms`);

        return {
            kpis,
            conflits,
            salles,
            university,
            departments: departmentsWithStats
        };
    } catch (e: any) {
        console.error('[getAdminDashboard] FATAL ERROR:', e);
        throw e;
    }
}

export async function getDeanDashboard() {
    if (!db) throw new Error("Database not connected");

    const kpis = db.prepare('SELECT * FROM KPI').get();
    const university = db.prepare('SELECT * FROM UniversityInfo').get();
    const departments = db.prepare('SELECT * FROM Department').all();

    const departmentsWithStats = departments.map((dept: any) => {
        const profCount = db.prepare('SELECT COUNT(*) as count FROM Professor WHERE departmentId = ?').get(dept.id).count;
        const formationCount = db.prepare('SELECT COUNT(*) as count FROM Formation WHERE departmentId = ?').get(dept.id).count;

        const statuses = db.prepare(`
            SELECT DISTINCT status FROM ExamSession es 
            JOIN Module m ON es.moduleId = m.id 
            JOIN Formation f ON m.formationId = f.id 
            WHERE f.departmentId = ?
        `).all(dept.id).map((r: any) => r.status);

        let status = 'none';
        if (statuses.length > 0) {
            if (statuses.includes('PENDING_CHEF')) status = 'pending_chef';
            else if (statuses.includes('PENDING_DEAN')) status = 'pending_dean';
            else if (statuses.includes('PUBLISHED')) status = 'published';
            else status = 'draft';
        }

        const studentCount = db.prepare(`
            SELECT COUNT(*) as count FROM Student s
            JOIN Formation f ON s.formationId = f.id
            WHERE f.departmentId = ?
        `).get(dept.id).count;

        return {
            ...dept,
            totalProfessors: profCount,
            formations: formationCount,
            totalStudents: studentCount,
            status
        };
    });

    return {
        kpis,
        university,
        departments: departmentsWithStats
    };
}

export async function getDepartmentDashboard(departmentId: number) {
    if (!db) throw new Error("Database not connected");

    const dept = db.prepare('SELECT * FROM Department WHERE id = ?').get(departmentId);
    if (!dept) throw new Error("Department not found");

    const kpis = db.prepare('SELECT * FROM KPI').get();
    const conflits = db.prepare('SELECT * FROM Conflict WHERE departement = ?').all(dept.name);

    const formations = db.prepare('SELECT * FROM Formation WHERE departmentId = ?').all(departmentId);
    const formationsWithStats = formations.map((f: any) => {
        const studentCount = db.prepare('SELECT COUNT(*) as count FROM Student WHERE formationId = ?').get(f.id).count;
        const examCount = db.prepare('SELECT COUNT(*) as count FROM ExamSession es JOIN Module m ON es.moduleId = m.id WHERE m.formationId = ?').get(f.id).count;

        // Dynamic status calculation
        const formationStatuses = db.prepare(`
            SELECT DISTINCT es.status 
            FROM ExamSession es 
            JOIN Module m ON es.moduleId = m.id 
            WHERE m.formationId = ?
        `).all(f.id).map((r: any) => r.status);

        let status = "none";
        if (formationStatuses.length > 0) {
            if (formationStatuses.some((s: any) => s === 'PUBLISHED' || s === 'PENDING_DEAN')) status = "validated";
            else if (formationStatuses.includes('PENDING_CHEF')) status = "pending";
            else status = "draft";
        }

        return {
            name: f.name,
            exams: examCount,
            status,
            conflicts: 0,
            students: studentCount,
            modules: db.prepare('SELECT COUNT(*) as count FROM Module WHERE formationId = ?').get(f.id).count
        };
    });

    const profCount = db.prepare('SELECT COUNT(*) as count FROM Professor WHERE departmentId = ?').get(departmentId).count;

    const deptExams = db.prepare(`
        SELECT es.status FROM ExamSession es 
        JOIN Module m ON es.moduleId = m.id 
        JOIN Formation f ON m.formationId = f.id 
        WHERE f.departmentId = ?
    `).all(departmentId);

    const statuses = deptExams.map((e: any) => e.status);
    let scheduleStatus = 'none';
    if (statuses.length > 0) {
        if (statuses.includes('PENDING_CHEF')) scheduleStatus = 'pending_chef';
        else if (statuses.includes('PENDING_DEAN')) scheduleStatus = 'pending_dean';
        else if (statuses.includes('PUBLISHED')) scheduleStatus = 'published';
        else scheduleStatus = 'draft';
    }

    return {
        department: {
            ...dept,
            totalProfessors: profCount,
            formations: formations.length,
            scheduleStatus
        },
        stats: [
            { label: "Examens Planifiés", value: deptExams.length.toString(), color: "text-chart-3" },
            { label: "Formations", value: formations.length.toString(), color: "text-chart-3" },
            { label: "Conflits Actifs", value: conflits.length.toString(), color: conflits.length > 0 ? "text-destructive" : "text-green-500" },
            { label: "Étudiants Totaux", value: db.prepare('SELECT COUNT(*) as count FROM Student s JOIN Formation f ON s.formationId = f.id WHERE f.departmentId = ?').get(departmentId).count.toString(), color: "text-chart-3" }
        ],
        formations: formationsWithStats,
        conflits
    };
}

export async function generateAutoSchedule() {
    if (!db) throw new Error("Database not connected");

    console.log('[generateAutoSchedule] Starting generation...');

    // 1. Clear existing DRAFT/PENDING exams
    db.prepare("DELETE FROM ExamEnrollment WHERE examSessionId IN (SELECT id FROM ExamSession WHERE status IN ('DRAFT', 'PENDING_CHEF', 'PENDING_DEAN'))").run();
    db.prepare("DELETE FROM ExamSession WHERE status IN ('DRAFT', 'PENDING_CHEF', 'PENDING_DEAN')").run();
    db.prepare('DELETE FROM Conflict').run();

    // 2. Get all modules
    const modules = db.prepare('SELECT m.*, f.departmentId FROM Module m JOIN Formation f ON m.formationId = f.id').all();
    const rooms = db.prepare('SELECT * FROM ExamRoom').all();
    const professors = db.prepare('SELECT * FROM Professor').all();

    const startDate = new Date();
    startDate.setDate(startDate.getDate() + 7); // Start in a week

    let examsCreated = 0;

    for (let i = 0; i < modules.length; i++) {
        const module = modules[i];

        // Simple heuristic: pick a room and prof
        const room = rooms[i % rooms.length];
        const prof = professors[i % professors.length];

        const date = new Date(startDate);
        date.setDate(date.getDate() + Math.floor(i / 3)); // 3 exams per day

        const startTime = (8 + (i % 3) * 3).toString().padStart(2, '0') + ':00';
        const endTime = (8 + (i % 3) * 3 + 2).toString().padStart(2, '0') + ':00';

        db.prepare(`
            INSERT INTO ExamSession (moduleId, examRoomId, professorId, sessionDate, startTime, endTime, duration, type, status)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
        `).run(module.id, room.id, prof.id, date.toISOString(), startTime, endTime, 120, 'Écrit', 'DRAFT');

        examsCreated++;
    }

    // 3. Detect Conflicts
    const sessions = db.prepare(`
        SELECT es.*, m.name as moduleName, er.name as roomName, p.firstName as profName, f.departmentId, d.name as deptName
        FROM ExamSession es
        JOIN Module m ON es.moduleId = m.id
        JOIN ExamRoom er ON es.examRoomId = er.id
        JOIN Professor p ON es.professorId = p.id
        JOIN Formation f ON m.formationId = f.id
        JOIN Department d ON f.departmentId = d.id
    `).all();

    for (let i = 0; i < sessions.length; i++) {
        const s1 = sessions[i];
        for (let j = i + 1; j < sessions.length; j++) {
            const s2 = sessions[j];

            if (s1.sessionDate === s2.sessionDate && s1.startTime === s2.startTime) {
                // Room conflict
                if (s1.examRoomId === s2.examRoomId) {
                    db.prepare('INSERT INTO Conflict (type, severite, message, details, departement) VALUES (?, ?, ?, ?, ?)')
                        .run('Conflit de Salle', 'haute', `La salle ${s1.roomName} est occupée par ${s1.moduleName} et ${s2.moduleName}`, `Date: ${s1.sessionDate}, Heure: ${s1.startTime}`, s1.deptName);
                }
                // Professor conflict
                if (s1.professorId === s2.professorId) {
                    db.prepare('INSERT INTO Conflict (type, severite, message, details, departement) VALUES (?, ?, ?, ?, ?)')
                        .run('Conflit de Surveillant', 'moyenne', `Le professeur ${s1.profName} surveille ${s1.moduleName} et ${s2.moduleName}`, `Date: ${s1.sessionDate}, Heure: ${s1.startTime}`, s1.deptName);
                }
            }
        }
    }

    // Update KPIs
    db.prepare('UPDATE KPI SET nbExamensPlanifies = ?, tempsGenerationEDT = ?').run(examsCreated, 5);

    return { success: true, count: examsCreated };
}

export async function optimizeConflictsAction() {
    if (!db) throw new Error("Database not connected");

    console.log('[optimizeConflictsAction] Starting optimization...');

    // 1. Get all draft exams that have conflicts
    const draftExams = db.prepare(`
        SELECT es.*, m.name as moduleName, er.name as roomName, p.firstName as profName
        FROM ExamSession es
        JOIN Module m ON es.moduleId = m.id
        JOIN ExamRoom er ON es.examRoomId = er.id
        JOIN Professor p ON es.professorId = p.id
        WHERE es.status = 'DRAFT'
    `).all();

    const rooms = db.prepare('SELECT * FROM ExamRoom').all();
    const professors = db.prepare('SELECT * FROM Professor').all();

    // Helper to check for conflicts for a specific slot
    const hasConflict = (examId: number, roomId: number, profId: number, date: string, start: string, end: string) => {
        const conflict = db.prepare(`
            SELECT id FROM ExamSession
            WHERE id != ? 
            AND sessionDate = ?
            AND (
                (examRoomId = ? AND ((startTime <= ? AND endTime > ?) OR (startTime < ? AND endTime >= ?) OR (? <= startTime AND ? >= endTime)))
                OR
                (professorId = ? AND ((startTime <= ? AND endTime > ?) OR (startTime < ? AND endTime >= ?) OR (? <= startTime AND ? >= endTime)))
            )
        `).get(examId, date, roomId, start, start, end, end, start, end, profId, start, start, end, end, start, end);
        return !!conflict;
    };

    let optimizedCount = 0;

    for (const exam of draftExams) {
        // Check if this exam currently has a conflict
        if (hasConflict(exam.id, exam.examRoomId, exam.professorId, exam.sessionDate, exam.startTime, exam.endTime)) {
            // Try to find a new slot
            let found = false;

            // Try different times (between 8:00 and 18:00)
            const timeSlots = ['08:00', '10:00', '13:00', '15:00'];

            // Try different days (next 10 days)
            const baseDate = new Date(exam.sessionDate);

            for (let d = 0; d < 10 && !found; d++) {
                const nextDate = new Date(baseDate);
                nextDate.setDate(nextDate.getDate() + d);
                const dateStr = nextDate.toISOString();

                for (const time of timeSlots) {
                    const start = time;
                    const end = (parseInt(time.split(':')[0]) + 2).toString().padStart(2, '0') + ':00';

                    // Try different rooms
                    for (const room of rooms) {
                        if (!hasConflict(exam.id, room.id, exam.professorId, dateStr, start, end)) {
                            // Found a free slot!
                            db.prepare('UPDATE ExamSession SET sessionDate = ?, startTime = ?, endTime = ?, examRoomId = ? WHERE id = ?')
                                .run(dateStr, start, end, room.id, exam.id);
                            optimizedCount++;
                            found = true;
                            break;
                        }
                    }
                    if (found) break;
                }
            }
        }
    }

    // Refresh conflicts table
    db.prepare('DELETE FROM Conflict').run();
    const allSessions = db.prepare(`
        SELECT es.*, m.name as moduleName, er.name as roomName, p.firstName as profName, f.departmentId, d.name as deptName
        FROM ExamSession es
        JOIN Module m ON es.moduleId = m.id
        JOIN ExamRoom er ON es.examRoomId = er.id
        JOIN Professor p ON es.professorId = p.id
        JOIN Formation f ON m.formationId = f.id
        JOIN Department d ON f.departmentId = d.id
    `).all();

    for (let i = 0; i < allSessions.length; i++) {
        const s1 = allSessions[i];
        for (let j = i + 1; j < allSessions.length; j++) {
            const s2 = allSessions[j];

            if (s1.sessionDate === s2.sessionDate) {
                const overlap = (s1.startTime <= s2.startTime && s1.endTime > s2.startTime) ||
                    (s1.startTime < s2.endTime && s1.endTime >= s2.endTime) ||
                    (s2.startTime <= s1.startTime && s2.endTime >= s1.endTime);

                if (overlap) {
                    if (s1.examRoomId === s2.examRoomId) {
                        db.prepare('INSERT INTO Conflict (type, severite, message, details, departement) VALUES (?, ?, ?, ?, ?)')
                            .run('Conflit de Salle', 'haute', `La salle ${s1.roomName} est occupée par ${s1.moduleName} et ${s2.moduleName}`, `Date: ${s1.sessionDate}, Heure: ${s1.startTime}`, s1.deptName);
                    }
                    if (s1.professorId === s2.professorId) {
                        db.prepare('INSERT INTO Conflict (type, severite, message, details, departement) VALUES (?, ?, ?, ?, ?)')
                            .run('Conflit de Surveillant', 'moyenne', `Le professeur ${s1.profName} surveille ${s1.moduleName} et ${s2.moduleName}`, `Date: ${s1.sessionDate}, Heure: ${s1.startTime}`, s1.deptName);
                    }
                }
            }
        }
    }

    return { success: true, optimizedCount };
}

export async function submitDepartmentSchedule(departmentId: number) {
    if (!db) throw new Error("Database not connected");

    db.prepare(`
        UPDATE ExamSession 
        SET status = 'PENDING_CHEF'
        WHERE status = 'DRAFT' AND moduleId IN (
            SELECT m.id FROM Module m JOIN Formation f ON m.formationId = f.id WHERE f.departmentId = ?
        )
    `).run(departmentId);

    return { success: true };
}

export async function approveDepartmentSchedule(departmentId: number) {
    if (!db) throw new Error("Database not connected");

    db.prepare(`
        UPDATE ExamSession 
        SET status = 'PENDING_DEAN'
        WHERE status = 'PENDING_CHEF' AND moduleId IN (
            SELECT m.id FROM Module m JOIN Formation f ON m.formationId = f.id WHERE f.departmentId = ?
        )
    `).run(departmentId);

    return { success: true };
}

export async function rejectDepartmentSchedule(departmentId: number, reason: string) {
    if (!db) throw new Error("Database not connected");

    db.prepare(`
        UPDATE ExamSession 
        SET status = 'DRAFT', rejectionReason = ?
        WHERE status = 'PENDING_CHEF' AND moduleId IN (
            SELECT m.id FROM Module m JOIN Formation f ON m.formationId = f.id WHERE f.departmentId = ?
        )
    `).run(reason, departmentId);

    return { success: true };
}

export async function approveFacultySchedule() {
    if (!db) throw new Error("Database not connected");

    db.prepare(`
        UPDATE ExamSession 
        SET status = 'PUBLISHED'
        WHERE status = 'PENDING_DEAN'
    `).run();

    return { success: true };
}

export async function rejectFacultySchedule(reason: string) {
    if (!db) throw new Error("Database not connected");

    db.prepare(`
        UPDATE ExamSession 
        SET status = 'PENDING_CHEF', rejectionReason = ?
        WHERE status = 'PENDING_DEAN'
    `).run(reason);

    return { success: true };
}

export async function getExams() {
    if (!db) throw new Error("Database not connected");
    return db.prepare(`
        SELECT 
            es.*, 
            m.name as moduleName, 
            f.name as formation, 
            d.name as department,
            er.name as room,
            p.firstName || ' ' || p.lastName as professor,
            (SELECT COUNT(*) FROM ModuleEnrollment me WHERE me.moduleId = es.moduleId) as studentCount
        FROM ExamSession es
        JOIN Module m ON es.moduleId = m.id
        JOIN Formation f ON m.formationId = f.id
        JOIN Department d ON f.departmentId = d.id
        JOIN ExamRoom er ON es.examRoomId = er.id
        JOIN Professor p ON es.professorId = p.id
    `).all();
}

export async function createExam(data: any) {
    if (!db) throw new Error("Database not connected");
    const { moduleId, examRoomId, professorId, sessionDate, startTime, endTime, duration, type } = data;

    db.prepare(`
        INSERT INTO ExamSession (moduleId, examRoomId, professorId, sessionDate, startTime, endTime, duration, type, status)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, 'DRAFT')
    `).run(moduleId, examRoomId, professorId, sessionDate, startTime, endTime, duration, type);

    return { success: true };
}

export async function updateExamAction(id: number, data: any) {
    if (!db) throw new Error("Database not connected");
    const { moduleId, examRoomId, professorId, sessionDate, startTime, endTime, duration, type, status } = data;

    db.prepare(`
        UPDATE ExamSession 
        SET moduleId = ?, examRoomId = ?, professorId = ?, sessionDate = ?, startTime = ?, endTime = ?, duration = ?, type = ?, status = ?
        WHERE id = ?
    `).run(moduleId, examRoomId, professorId, sessionDate, startTime, endTime, duration, type, status, id);

    return { success: true };
}

export async function deleteExamAction(id: number) {
    if (!db) throw new Error("Database not connected");
    db.prepare('DELETE FROM ExamSession WHERE id = ?').run(id);
    return { success: true };
}

export async function submitAllDraftExams() {
    if (!db) throw new Error("Database not connected");
    db.prepare("UPDATE ExamSession SET status = 'PENDING_CHEF' WHERE status = 'DRAFT'").run();
    return { success: true };
}
