const Database = require('better-sqlite3');
const path = require('path');

const db = new Database(path.join(__dirname, '../prisma/dev.db'));

try {
    db.prepare('PRAGMA foreign_keys = OFF').run();

    // Clear professors
    db.prepare('DELETE FROM Professor').run();

    // Insert just the essentials for testing
    const stmt = db.prepare('INSERT INTO Professor (id, professorNumber, firstName, lastName, email, password, departmentId, role) VALUES (?, ?, ?, ?, ?, ?, ?, ?)');
    stmt.run(1, 'PROF001', 'Martin', 'Ahmed', 'martin.ahmed@univ.edu', 'password123', 1, 'professor');
    stmt.run(4, 'PROF004', 'Belkacemi', 'Chef', 'belkacemi@gmail.com', 'belkacemi123', 1, 'chef_de_departement');

    console.log('✅ Success: Belkacemi and Martin added to database.');
} catch (e) {
    console.error('❌ Error:', e.message);
} finally {
    db.close();
}
