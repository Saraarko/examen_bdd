const fs = require('fs');
const path = require('path');

const dataDir = path.join(__dirname, '../prisma/data');

function generateStudents(count) {
    const students = ['id,studentNumber,firstName,lastName,email,password,formationId'];
    for (let i = 1; i <= count; i++) {
        // We use 1 or 2 as formationId since they are the ones existing in the base CSVs
        const formationId = (i % 2) + 1;
        students.push(`${i},STU${i.toString().padStart(5, '0')},FirstName${i},LastName${i},student${i}@univ.dz,password123,${formationId}`);
    }
    fs.writeFileSync(path.join(dataDir, 'students.csv'), students.join('\n'));
}

function generateExamSessions(count) {
    const sessions = ['id,moduleId,examRoomId,professorId,sessionDate,startTime,endTime,duration,type'];
    const moduleIds = [101, 102, 201]; // Existing IDs in modules.csv (approx)
    const roomIds = [1, 2, 3, 4];
    const profIds = [1, 2, 3];
    const types = ['Écrit', 'TP', 'Oral'];

    for (let i = 1; i <= count; i++) {
        const moduleId = moduleIds[i % moduleIds.length];
        const roomId = roomIds[i % roomIds.length];
        const profId = profIds[i % profIds.length];
        const day = (i % 14) + 1;
        const date = `2025-06-${day.toString().padStart(2, '0')}`;
        const hours = [8, 10, 13, 15];
        const startH = hours[i % 4];
        const start = `${startH.toString().padStart(2, '0')}:00`;
        const end = `${(startH + 2).toString().padStart(2, '0')}:00`;
        const type = types[i % types.length];

        sessions.push(`${i},${moduleId},${roomId},${profId},${date},${start},${end},120,${type}`);
    }
    fs.writeFileSync(path.join(dataDir, 'exam_sessions.csv'), sessions.join('\n'));
}

console.log('Generating massive CSV data...');
generateStudents(13000);
console.log('✅ Generated 13,000 students in students.csv');
generateExamSessions(1500);
console.log('✅ Generated 1,500 exam sessions in exam_sessions.csv');

// Also update KPI and University Info if they exist as CSVs or just ensure they are in the DB via seed
// The user asked for "les fichiers csv"
