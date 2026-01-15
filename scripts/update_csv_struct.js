const fs = require('fs');
const path = require('path');

const dataDir = path.join(__dirname, '../prisma/data');

function generateDepartments(count) {
    const data = ['id,name,code,description'];
    for (let i = 1; i <= count; i++) {
        data.push(`${i},Département ${String.fromCharCode(64 + i)},DEPT_${i},Description du département ${i}`);
    }
    fs.writeFileSync(path.join(dataDir, 'departments.csv'), data.join('\n'));
}

function generateFormations(count) {
    const data = ['id,name,code,departmentId,level'];
    for (let i = 1; i <= count; i++) {
        const deptId = (i % 12) + 1;
        data.push(`${i},Formation ${i},FORM_${i},${deptId},Licence`);
    }
    fs.writeFileSync(path.join(dataDir, 'formations.csv'), data.join('\n'));
}

generateDepartments(12);
console.log('✅ Generated 12 departments');
generateFormations(45);
console.log('✅ Generated 45 formations');
