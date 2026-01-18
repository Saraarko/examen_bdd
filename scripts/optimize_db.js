const Database = require('better-sqlite3');
const path = require('path');

const dbPath = path.join(process.cwd(), 'prisma/dev.db');
const db = new Database(dbPath);

console.log('🚀 Démarrage de l\'optimisation de la base de données...');

try {
    // 1. Ajouter un index sur ModuleEnrollment(moduleId) pour accélérer le comptage des étudiants par examen
    console.log('📦 Création de l\'index sur ModuleEnrollment(moduleId)...');
    db.prepare('CREATE INDEX IF NOT EXISTS idx_moduleenrollment_moduleid ON ModuleEnrollment(moduleId)').run();

    // 2. Ajouter un index sur ModuleEnrollment(studentId) pour accélérer le planning étudiant
    console.log('📦 Création de l\'index sur ModuleEnrollment(studentId)...');
    db.prepare('CREATE INDEX IF NOT EXISTS idx_moduleenrollment_studentid ON ModuleEnrollment(studentId)').run();

    // 3. Ajouter des index sur ExamSession pour accélérer les jointures et filtres
    console.log('📦 Création des index sur ExamSession...');
    db.prepare('CREATE INDEX IF NOT EXISTS idx_examsession_moduleid ON ExamSession(moduleId)').run();
    db.prepare('CREATE INDEX IF NOT EXISTS idx_examsession_status ON ExamSession(status)').run();
    db.prepare('CREATE INDEX IF NOT EXISTS idx_examsession_date ON ExamSession(sessionDate)').run();

    console.log('✅ Optimisation terminée avec succès !');
} catch (error) {
    console.error('❌ Erreur lors de l\'optimisation:', error);
} finally {
    db.close();
}
