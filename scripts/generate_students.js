const fs = require('fs');
const path = require('path');

// Prénoms arabes/marocains masculins et féminins
const firstNamesMale = [
    "Amine", "Mustapha", "Youssef", "Mohamed", "Ahmed", "Khalid", "Omar", "Ali", "Hassan", "Mehdi",
    "Yassine", "Karim", "Hamza", "Ayoub", "Rachid", "Nabil", "Said", "Samir", "Bilal", "Ismail",
    "Adil", "Zakaria", "Brahim", "Driss", "Hicham", "Jamal", "Fouad", "Aziz", "Hakim", "Mounir",
    "Reda", "Soufiane", "Walid", "Farid", "Tarik", "Younes", "Abdelkader", "Abdelaziz", "Abdellah", "Abderrahim",
    "Anass", "Badr", "Chafik", "Chakib", "El Mehdi", "Fayçal", "Ghali", "Hafid", "Idriss", "Jalal",
    "Kamal", "Lahcen", "Marouane", "Noureddine", "Othmane", "Radouane", "Salim", "Taha", "Wassim", "Yahya",
    "Zouhair", "Achraf", "Adnane", "Aymane", "Bassam", "Chadi", "Elias", "Fares", "Ghazi", "Hachem",
    "Imad", "Jaouad", "Kais", "Lamrani", "Moad", "Nassim", "Oussama", "Riad", "Sami", "Tariq"
];

const firstNamesFemale = [
    "Fatima", "Khadija", "Aicha", "Meryem", "Sara", "Nadia", "Layla", "Samira", "Zineb", "Salma",
    "Hiba", "Amina", "Houda", "Iman", "Loubna", "Mariam", "Najat", "Oumaima", "Rania", "Sanaa",
    "Wafaa", "Yasmine", "Zahra", "Asmae", "Btissam", "Chaima", "Dounia", "Fadoua", "Ghita", "Hajar",
    "Ikram", "Jamila", "Karima", "Latifa", "Malika", "Naima", "Ouafa", "Rachida", "Siham", "Touria",
    "Wijdan", "Yousra", "Zainab", "Abir", "Basma", "Chaimae", "Dina", "Fatiha", "Ghizlane", "Hanae",
    "Ilham", "Kawtar", "Lina", "Manal", "Nisrine", "Oumayma", "Rajae", "Safae", "Saida", "Soukaina"
];

// Noms de famille arabes/marocains
const lastNames = [
    "Alaoui", "Benjelloun", "Benkirane", "Bensaid", "Berrada", "Bouazzaoui", "Bouhaj", "Bouzid", "Chaoui", "Daoudi",
    "El Amrani", "El Fassi", "El Hachimi", "El Idrissi", "El Kadiri", "El Moussaoui", "Ezzahiri", "Filali", "Hajji", "Hamidi",
    "Idrissi", "Jazouli", "Jermoumi", "Kettani", "Lahlou", "Lamrani", "Laroui", "Loudiyi", "Mernissi", "Meziane",
    "Naciri", "Ouazzani", "Oukacha", "Rachidi", "Raji", "Rhazi", "Sabri", "Sefrioui", "Soussi", "Tazi",
    "Yamani", "Zaidi", "Zaki", "Zerhouni", "Ziani", "Amiri", "Bachiri", "Belkadi", "Bennani", "Boutaleb",
    "Chami", "Dahbi", "El Baz", "El Ghazi", "El Harrak", "El Maachi", "El Omari", "Ennaji", "Faouzi", "Ghannam",
    "Haddad", "Ibrahimi", "Jouahri", "Kadmiri", "Laaroussi", "Machkour", "Mansouri", "Mouline", "Naji", "Ouhssain",
    "Qadiri", "Rahmani", "Saadi", "Tahiri", "Touimi", "Wahbi", "Yaacoubi", "Zeroual", "Abouzaid", "Benabdallah",
    "Chraibi", "Doukkali", "Errachidi", "Fikri", "Guessous", "Hassani", "Ismaili", "Jaidi", "Khaldi", "Lachgar",
    "Makhloufi", "Nejjar", "Ouladali", "Prefsi", "Qorchi", "Raissouni", "Skalli", "Tadlaoui", "Oulhaj", "Bekkali"
];

// Lire le fichier original pour obtenir la structure
const inputPath = path.join(__dirname, '..', 'prisma', 'data', 'students.csv');
const outputPath = path.join(__dirname, '..', 'prisma', 'data', 'students_new.csv');

// Lire le fichier existant
const content = fs.readFileSync(inputPath, 'utf-8');
const lines = content.split('\n');

// En-tête
const header = lines[0];
const newLines = [header];

// Générer les nouvelles lignes
for (let i = 1; i < lines.length; i++) {
    const line = lines[i].trim();
    if (!line) continue;

    const parts = line.split(',');
    if (parts.length < 7) continue;

    const id = parts[0];
    const studentNumber = parts[1];
    const formationId = parts[6];

    // Choisir un prénom (50% masculin, 50% féminin)
    const isMale = Math.random() > 0.5;
    const firstNames = isMale ? firstNamesMale : firstNamesFemale;
    const firstName = firstNames[Math.floor(Math.random() * firstNames.length)];

    // Choisir un nom de famille
    const lastName = lastNames[Math.floor(Math.random() * lastNames.length)];

    // Générer l'email basé sur le nom
    const email = `${firstName.toLowerCase().replace(/ /g, '')}.${lastName.toLowerCase().replace(/ /g, '')}${id}@univ.dz`;

    const newLine = `${id},${studentNumber},${firstName},${lastName},${email},password123,${formationId}`;
    newLines.push(newLine);
}

// Écrire le nouveau fichier
fs.writeFileSync(outputPath, newLines.join('\r\n'), 'utf-8');

console.log(`✅ Fichier généré avec succès: ${outputPath}`);
console.log(`📊 Nombre total d'étudiants: ${newLines.length - 1}`);
