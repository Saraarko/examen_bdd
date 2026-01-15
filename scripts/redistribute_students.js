const fs = require('fs');
const path = require('path');

const dataDir = path.join(__dirname, '../prisma/data');

function generateStudents(count) {
    const students = ['id,studentNumber,firstName,lastName,email,password,formationId'];
    for (let i = 1; i <= count; i++) {
        const formationId = (i % 45) + 1;
        students.push(`${i},STU${i.toString().padStart(5, '0')},FirstName${i},LastName${i},student${i}@univ.dz,password123,${formationId}`);
    }
    fs.writeFileSync(path.join(dataDir, 'students.csv'), students.join('\n'));
}

generateStudents(13000);
console.log('✅ Updated 13,000 students across 45 formations');
