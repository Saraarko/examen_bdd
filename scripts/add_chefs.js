const fs = require('fs');
const path = require('path');

const professorsFile = path.join(__dirname, '../prisma/data/professors.csv');
const data = fs.readFileSync(professorsFile, 'utf8').split('\n');

const header = data[0];
const lines = data.slice(1).filter(l => l.trim() !== '');

const professors = lines.map(line => {
    const parts = line.split(',');
    return {
        id: parts[0],
        professorNumber: parts[1],
        firstName: parts[2],
        lastName: parts[3],
        email: parts[4],
        password: parts[5],
        departmentId: parts[6],
        role: parts[7]
    };
});

const deptsWithChefs = new Set(
    professors
        .filter(p => p.role === 'chef_de_departement')
        .map(p => p.departmentId)
);

console.log('Departments with chefs:', Array.from(deptsWithChefs));

const updatedProfessors = [...professors];

for (let deptId = 1; deptId <= 12; deptId++) {
    const sDeptId = deptId.toString();
    if (!deptsWithChefs.has(sDeptId)) {
        // Find the first professor for this department
        const profIndex = updatedProfessors.findIndex(p => p.departmentId === sDeptId);
        if (profIndex !== -1) {
            console.log(`Setting professor ${updatedProfessors[profIndex].email} as chef for dept ${sDeptId}`);
            updatedProfessors[profIndex].role = 'chef_de_departement';
            deptsWithChefs.add(sDeptId);
        } else {
            console.log(`No professor found for department ${sDeptId}`);
        }
    }
}

const csvLines = [header];
updatedProfessors.forEach(p => {
    csvLines.push(`${p.id},${p.professorNumber},${p.firstName},${p.lastName},${p.email},${p.password},${p.departmentId},${p.role}`);
});

fs.writeFileSync(professorsFile, csvLines.join('\n') + '\n');
console.log('✅ Done updating professors roles.');
