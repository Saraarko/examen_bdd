const fs = require('fs');
const path = require('path');

const dataDir = path.join(__dirname, '../prisma/data');

function generateExamSessions(count) {
    const sessions = ['id,moduleId,examRoomId,professorId,sessionDate,startTime,endTime,duration,type'];
    const roomIds = [1, 2, 3, 4];
    const profIds = [1, 2, 3, 4, 5];
    const types = ['Écrit', 'TP', 'Oral'];

    for (let i = 1; i <= count; i++) {
        // Module IDs are 1 to 180
        const moduleId = (i % 180) + 1;
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

generateExamSessions(1500);
console.log('✅ Generated 1,500 exam sessions matched with 180 modules.');
