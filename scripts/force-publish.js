const Database = require('better-sqlite3');
const path = require('path');

try {
    const dbPath = path.join(process.cwd(), 'prisma', 'dev.db');
    const db = new Database(dbPath);

    console.log('Connexion à la base de données...');

    // Forcer tous les examens en PUBLISHED
    const info = db.prepare("UPDATE ExamSession SET status = 'PUBLISHED'").run();

    console.log(`Succès ! ${info.changes} examens ont été mis à jour vers le statut 'PUBLISHED'.`);
    console.log("Les étudiants et professeurs devraient maintenant voir leur planning.");

} catch (error) {
    console.error('Erreur :', error);
}
