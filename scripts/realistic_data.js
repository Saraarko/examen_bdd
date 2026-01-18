const fs = require('fs');
const path = require('path');

const departmentsFile = path.join(__dirname, '../prisma/data/departments.csv');
const formationsFile = path.join(__dirname, '../prisma/data/formations.csv');
const modulesFile = path.join(__dirname, '../prisma/data/modules.csv');

const departmentsData = fs.readFileSync(departmentsFile, 'utf8').split('\n').filter(l => l.trim() !== '').slice(1).map(line => {
    const parts = line.split(',');
    return { id: parseInt(parts[0]), name: parts[1] };
});

const formationTemplates = {
    "Informatique": ["Informatique", "Systèmes d'Information", "Sécurité Informatique", "Big Data", "Intelligence Artificielle"],
    "Mathématiques": ["Mathématiques Appliquées", "Analyse Numérique", "Statistiques", "Algèbre", "Probabilités"],
    "Physique": ["Physique Fondamentale", "Énergétique", "Optique et Photonique", "Mécanique Quantique"],
    "Chimie": ["Chimie des Matériaux", "Chimie Organique", "Chimie Analytique", "Génie Chimique"],
    "Biologie": ["Biologie Moléculaire", "Biotechnologie", "Environnement", "Génétique"],
    "Géologie": ["Géologie Appliquée", "Ressources Minières", "Hydrogéologie", "Sismologie"],
    "Génie Civil": ["Bâtiment", "Travaux Publics", "Hydraulique", "Géotechnique"],
    "Génie Électrique": ["Électrotechnique", "Automatique", "Électronique", "Télécommunications"],
    "Génie Mécanique": ["Construction Mécanique", "Fabrication Mécanique", "Thermodynamique", "Productique"],
    "Économie": ["Économie Appliquée", "Économétrie", "Finance", "Monnaie et Banque"],
    "Gestion": ["Management des Entreprises", "Marketing", "Ressources Humaines", "Comptabilité et Audit"],
    "Langues": ["Études Anglaises", "Traduction", "Littérature Comparée", "Sciences du Langage"]
};

const moduleTemplates = {
    "Informatique": ["Algorithmique", "Structures de Données", "Systèmes d'Exploitation", "Réseaux", "Bases de Données", "Développement Web", "Théorie des Graphes", "Compilation", "Architecture des Ordinateurs", "Génie Logiciel", "Interface Homme-Machine", "Sécurité Réseaux"],
    "Mathématiques": ["Analyse I", "Algèbre Linéaire", "Topologie", "Calcul Différentiel", "Probabilités I", "Statistiques Inférencielles", "Analyse Complexe", "Géométrie Différentielle", "Théorie des Nombres", "Optimisation"],
    "Physique": ["Mécanique du Point", "Thermodynamique", "Électromagnétisme", "Optique Géométrique", "Physique Quantique", "Électronique Analogique", "Mécanique des Fluides", "Physique Nucléaire", "Relativité"],
    "Chimie": ["Liaisons Chimiques", "Thermodynamique Chimique", "Chimie des Solutions", "Cinétique Chimique", "Chimie Organique I", "Structure de la Matière", "Spectroscopie", "Electrochimie"],
    "Biologie": ["Biologie Cellulaire", "Biochimie Structurale", "Botanique", "Zoologie", "Immunologie", "Microbiologie", "Physiologie Animale", "Ecologie Générale"],
    "Géologie": ["Stratigraphie", "Pétrographie", "Paléontologie", "Tectonique", "Minéralogie", "Géophysique", "Sédimentologie", "Cartographie"],
    "Génie Civil": ["Résistance des Matériaux", "Mécanique des Sols", "Béton Armé", "Charpente Métallique", "Routes et Voiries", "Topographie", "Matériaux de Construction"],
    "Génie Électrique": ["Circuits Électriques", "Logique Combinatoire", "Machines Électriques", "Traitement du Signal", "Microprocesseurs", "Électronique de Puissance", "Asservissements"],
    "Génie Mécanique": ["Dessin Industriel", "Mécanique des Solides", "Dynamique des Systèmes", "Science des Matériaux", "Transferts Thermiques", "Moteurs thermiques"],
    "Économie": ["Microéconomie", "Macroéconomie", "Histoire des Faits Économiques", "Mathématiques pour l'Économie", "Économie de l'Entreprise", "Comptabilité Nationale"],
    "Gestion": ["Théorie des Organisations", "Comptabilité Générale", "Droit des Affaires", "Audit Financier", "Gestion de Projet", "Comportement du Consommateur"],
    "Langues": ["Grammaire Française", "Compréhension Orale", "Expression Écrite", "Cultures et Civilisations", "Phonétique", "Techniques d'Expression"]
};

// 1. Update Formations
const formationsInput = fs.readFileSync(formationsFile, 'utf8').split('\n').filter(l => l.trim() !== '');
const formationsHeader = formationsInput[0];
const formationLines = formationsInput.slice(1);

const formationMap = new Map(); // id -> deptName

const updatedFormationLines = formationLines.map(line => {
    const parts = line.split(',');
    const id = parseInt(parts[0]);
    const deptId = parseInt(parts[3]);
    const dept = departmentsData.find(d => d.id === deptId);
    const deptName = dept ? dept.name : "Informatique";

    formationMap.set(id, deptName);

    const templates = formationTemplates[deptName] || formationTemplates["Informatique"];
    const index = (id - 1) % templates.length;
    const name = templates[index];
    const code = name.toUpperCase().substring(0, 4) + id;

    return `${id},${name},${code},${deptId},${parts[4]}`;
});

fs.writeFileSync(formationsFile, [formationsHeader, ...updatedFormationLines].join('\n') + '\n');
console.log('✅ Formations updated with realistic names.');

// 2. Update Modules
const modulesInput = fs.readFileSync(modulesFile, 'utf8').split('\n').filter(l => l.trim() !== '');
const modulesHeader = modulesInput[0];
const moduleLines = modulesInput.slice(1);

const updatedModuleLines = moduleLines.map(line => {
    const parts = line.split(',');
    const id = parseInt(parts[0]);
    const formationId = parseInt(parts[4]);
    const deptName = formationMap.get(formationId) || "Informatique";

    const templates = moduleTemplates[deptName] || moduleTemplates["Informatique"];
    const index = (id - 1) % templates.length;
    const name = templates[index];
    const code = name.toUpperCase().substring(0, 4) + id;

    return `${id},${name},${code},${parts[3]},${formationId},${parts[5]}`;
});

fs.writeFileSync(modulesFile, [modulesHeader, ...updatedModuleLines].join('\n') + '\n');
console.log('✅ Modules updated with realistic names.');
