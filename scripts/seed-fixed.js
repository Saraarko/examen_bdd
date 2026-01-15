const Database = require('better-sqlite3');
const fs = require('fs');
const path = require('path');

const dbPath = path.join(__dirname, '../prisma/dev.db');
const dataDir = path.join(__dirname, '../prisma/data');

const db = new Database(dbPath);

function readCsv(filename) {
    const filePath = path.join(dataDir, filename);
    if (!fs.existsSync(filePath)) {
        console.warn(`File not found: ${filename}`);
        return [];
    }
    const fileContent = fs.readFileSync(filePath, 'utf-8');
    const lines = fileContent.replace(/\r\n/g, '\n').trim().split('\n');
    if (lines.length < 2) return [];

    const headers = lines[0].split(',').map(h => h.trim());

    return lines.slice(1).map(line => {
        const values = [];
        let current = '';
        let inQuote = false;
        for (let i = 0; i < line.length; i++) {
            const char = line[i];
            if (char === '"') {
                inQuote = !inQuote;
            } else if (char === ',' && !inQuote) {
                values.push(current);
                current = '';
            } else {
                current += char;
            }
        }
        values.push(current);

        return headers.reduce((obj, header, index) => {
            let val = values[index]?.trim();
            if (val?.startsWith('"') && val?.endsWith('"')) {
                val = val.slice(1, -1);
            }
            obj[header] = val;
            return obj;
        }, {});
    });
}

console.log('Skipping foreign key checks for seeding...');
db.pragma('foreign_keys = OFF');

db.transaction(() => {
    // 1. Admins
    console.log('Seeding Admins...');
    const admins = readCsv('admins.csv');
    for (const a of admins) {
        db.prepare(`
            INSERT OR REPLACE INTO Admin (id, firstName, lastName, email, password)
            VALUES (?, ?, ?, ?, ?)
        `).run(parseInt(a.id), a.firstName, a.lastName, a.email, a.password);
    }

    // 2. Deans
    console.log('Seeding Deans...');
    const deans = readCsv('deans.csv');
    for (const d of deans) {
        db.prepare(`
            INSERT OR REPLACE INTO Dean (id, firstName, lastName, email, password, title)
            VALUES (?, ?, ?, ?, ?, ?)
        `).run(parseInt(d.id), d.firstName, d.lastName, d.email, d.password, d.title);
    }

    // 3. Professors (with role)
    console.log('Seeding Professors...');
    const professors = readCsv('professors.csv');
    for (const p of professors) {
        db.prepare(`
            INSERT OR REPLACE INTO Professor (id, professorNumber, firstName, lastName, email, password, departmentId, role)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?)
        `).run(parseInt(p.id), p.professorNumber, p.firstName, p.lastName, p.email, p.password, parseInt(p.departmentId), p.role || 'professor');
    }

    // 4. KPI
    console.log('Seeding KPIs...');
    db.prepare(`DELETE FROM KPI`).run();
    db.prepare(`
        INSERT INTO KPI (id, tempsGenerationEDT, nbExamensPlanifies, tauxConflits, tauxValidation, heuresProfPlanifiees, amphisUtilises, sallesUtilisees)
        VALUES (1, 12, 120, 1.5, 95.0, 450, 8, 25)
    `).run();

    // 5. UniversityInfo
    console.log('Seeding UniversityInfo...');
    db.prepare(`DELETE FROM UniversityInfo`).run();
    db.prepare(`
        INSERT INTO UniversityInfo (id, name, totalStudents, totalDepartments, totalFormations)
        VALUES (1, 'Université de Science et Technologie', 5000, 4, 12)
    `).run();

    console.log('Database synced successfully with CSV data and default KPIs.');
})();

db.close();
