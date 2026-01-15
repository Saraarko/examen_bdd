const fs = require('fs');
const path = require('path');

const dataDir = path.join(__dirname, '../prisma/data');

function generateModules(formationCount) {
    const data = ['id,name,code,credits,formationId,semester'];
    let id = 1;
    for (let fId = 1; fId <= formationCount; fId++) {
        // 4 modules per formation
        for (let m = 1; m <= 4; m++) {
            data.push(`${id},Module ${id} Formation ${fId},MOD${id},${(m % 3) + 2},${fId},${(m % 2) + 1}`);
            id++;
        }
    }
    fs.writeFileSync(path.join(dataDir, 'modules.csv'), data.join('\n'));
    return id - 1;
}

const count = generateModules(45);
console.log(`✅ Generated ${count} modules across 45 formations`);
