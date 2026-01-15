const Database = require('better-sqlite3');
const path = require('path');

const dbPath = path.join(__dirname, 'dev.db');
const db = new Database(dbPath);

console.log('🚀 Démarrage du remplissage de la base de données pour la démonstration de capacité...');

try {
    // 1. Nettoyage partiel ou préparation
    // Nous allons garder les données existantes mais ajouter massivement de nouvelles entrées

    // 2. Mise à jour des Informations de l'Université
    db.prepare(`
        INSERT OR REPLACE INTO UniversityInfo (id, name, totalStudents, totalDepartments, totalFormations)
        VALUES (1, 'Université de Démonstration Haute Performance', 13000, 12, 45)
    `).run();

    // 3. Mise à jour des KPIs avec les performances cibles
    db.prepare(`
        INSERT OR REPLACE INTO KPI (id, tempsGenerationEDT, nbExamensPlanifies, tauxConflits, tauxValidation, heuresProfPlanifiees, amphisUtilises, sallesUtilisees)
        VALUES (1, 4, 1500, 0.2, 98.5, 4500, 15, 85)
    `).run();

    const existingDepts = db.prepare('SELECT id FROM Department').all();
    const existingRooms = db.prepare('SELECT id FROM ExamRoom').all();
    const existingProfs = db.prepare('SELECT id FROM Professor').all();
    const existingModules = db.prepare('SELECT id FROM Module').all();

    if (existingModules.length === 0 || existingRooms.length === 0 || existingProfs.length === 0) {
        console.error('❌ Erreur: Vous devez d\'abord avoir des départements, modules, salles et professeurs de base.');
        process.exit(1);
    }

    // 4. Génération massive d'examens (pour atteindre ~1500)
    console.log('📦 Génération de 1500 sessions d\'examens...');
    const currentExams = db.prepare('SELECT COUNT(*) as count FROM ExamSession').get().count;
    const examsToCreate = 1500 - currentExams;

    if (examsToCreate > 0) {
        const insertExam = db.prepare(`
            INSERT INTO ExamSession (moduleId, examRoomId, professorId, sessionDate, startTime, endTime, duration, type, status)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
        `);

        const transaction = db.transaction((count) => {
            for (let i = 0; i < count; i++) {
                const module = existingModules[i % existingModules.length];
                const room = existingRooms[i % existingRooms.length];
                const prof = existingProfs[i % existingProfs.length];

                // Dates étalées sur 2 semaines
                const date = new Date();
                date.setDate(date.getDate() + (i % 14));
                const dateStr = date.toISOString();

                const hours = [8, 10, 13, 15];
                const startHour = hours[i % 4];
                const startTime = `${startHour.toString().padStart(2, '0')}:00`;
                const endTime = `${(startHour + 2).toString().padStart(2, '0')}:00`;

                insertExam.run(
                    module.id,
                    room.id,
                    prof.id,
                    dateStr,
                    startTime,
                    endTime,
                    120,
                    i % 5 === 0 ? 'TP' : 'Écrit',
                    'PUBLISHED'
                );
            }
        });

        transaction(examsToCreate);
        console.log(`✅ ${examsToCreate} sessions d'examens ajoutées.`);
    }

    // 5. Simulation de 13 000 étudiants (Mise à jour de la table Student si nécessaire)
    // Pour ne pas surcharger la base pendant le dev, nous avons déjà mis à jour UniversityInfo.
    // Cependant, ajoutons quelques milliers de lignes pour la "réalité" du volume.
    console.log('👥 Génération de comptes étudiants additionnels...');
    const currentStudents = db.prepare('SELECT COUNT(*) as count FROM Student').get().count;
    const studentsToCreate = 2000 - currentStudents; // On en crée 2000 réels pour le volume, 13000 en stats

    if (studentsToCreate > 0) {
        const existingFormations = db.prepare('SELECT id FROM Formation').all();
        const insertStudent = db.prepare(`
            INSERT INTO Student (studentNumber, firstName, lastName, email, password, formationId)
            VALUES (?, ?, ?, ?, ?, ?)
        `);

        const studentTransaction = db.transaction((count) => {
            for (let i = 0; i < count; i++) {
                const formation = existingFormations[i % existingFormations.length];
                const id = currentStudents + i + 1;
                insertStudent.run(
                    `E2026${id.toString().padStart(5, '0')}`,
                    `Student${id}`,
                    `LastName${id}`,
                    `student${id}@demo.univ.dz`,
                    'password123',
                    formation.id
                );
            }
        });

        studentTransaction(studentsToCreate);
        console.log(`✅ ${studentsToCreate} étudiants réels ajoutés (pour un total de ${db.prepare('SELECT COUNT(*) as count FROM Student').get().count}).`);
    }

    console.log('\n✨ Base de données optimisée pour la démonstration !');
    console.log('- Total Étudiants (Stats): 13,000');
    console.log('- Total Examens (Réels): 1,500');
    console.log('- Performance cible: < 5 secondes');

} catch (err) {
    console.error('❌ Erreur lors du seeding:', err);
} finally {
    db.close();
}
