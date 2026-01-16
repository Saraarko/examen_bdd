const fs = require('fs');
const path = require('path');

// Paths
const modulesPath = path.join(__dirname, '../prisma/data/modules.csv');
const sessionsPath = path.join(__dirname, '../prisma/data/exam_sessions.csv');
const formationsPath = path.join(__dirname, '../prisma/data/formations.csv');

// --- 1. Regenerate Modules (target ~1500) ---
// 45 Formations. to get 1500 modules, ~33.3 per formation. Let's do 34 per formation.
// 45 * 34 = 1530 modules.

console.log('📦 Generating ~1530 modules...');
const modulesHeader = 'id,name,code,credits,formationId,semester\n';
let moduleRows = [];
let moduleIdCounter = 1;

// Read IDs from formations.csv roughly or just assume 1..45
// Actually let's assume formations 1..45 exist from the file I read.
for (let formId = 1; formId <= 45; formId++) {
    for (let m = 1; m <= 34; m++) {
        const semester = Math.ceil(m / 6); // Just rough semester distribution
        moduleRows.push(`${moduleIdCounter},Module ${m} F${formId},M${moduleIdCounter}_F${formId},4,${formId},${semester}`);
        moduleIdCounter++;
    }
}
fs.writeFileSync(modulesPath, modulesHeader + moduleRows.join('\n') + '\n');
console.log(`✅ Written ${moduleRows.length} modules.`);

// --- 2. Generate Smart Schedule (target ~1530 exams, 20 conflicts) ---

// Parameters
const NUM_DAYS = 14;
const SLOTS_PER_DAY = 4; // 08:30, 10:30, 13:30, 15:30
const ROOMS_COUNT = 65; // 15 Amphis + 50 TPs
const PROFS_COUNT = 65;
const FORMATIONS_COUNT = 45;

// Slots list: [{ day, timeStr, index }]
let slots = [];
const times = ['08:30', '10:30', '13:30', '15:30'];
let slotIndex = 0;
for (let d = 0; d < NUM_DAYS; d++) {
    // Skip weekends? Let's Assume continuous days or just skip index 5,6.
    // Let's just generate dates. Start tomorrow.
    for (let t = 0; t < 4; t++) {
        slots.push({
            dayOffset: d,
            startTime: times[t],
            endTime: times[t].replace('30', '30').replace('08', '10').replace('10', '12').replace('13', '15').replace('15', '17'), // Rough
            globalIndex: slotIndex++
        });
    }
}
// Total slots = 56. 
// Modules per formation = 34. 
// 34 < 56. So we can assign every module of a formation to a UNIQUE slot. -> 0 Student Conflicts.

// Global Resources Busy State
// busyRooms[slotIndex] = Set of roomIds
// busyProfs[slotIndex] = Set of profIds
let busyRooms = new Array(slots.length).fill(0).map(() => new Set());
let busyProfs = new Array(slots.length).fill(0).map(() => new Set());

let examRows = [];
let examIdCounter = 1;

const startDate = new Date();
startDate.setDate(startDate.getDate() + 5); // Start in 5 days

// For each formation, schedule its 34 modules
// We shuffle the 56 slots and pick the first 34 for this formation.
// This ensures within the formation, no overlap.
// But we must also check Global Room/Prof availability.

for (let formId = 1; formId <= 45; formId++) {
    // Get modules for this formation
    // IDs are predictable based on loop above: (formId-1)*34 + 1 ... + 34

    // Create a local shuffle of slot indices for this formation
    let formationSlotIndices = Array.from({ length: slots.length }, (_, i) => i);
    formationSlotIndices.sort(() => Math.random() - 0.5);

    for (let m = 1; m <= 34; m++) {
        const modId = (formId - 1) * 34 + m;

        // Find a slot that has available room and prof
        let assigned = false;

        for (let i = 0; i < formationSlotIndices.length; i++) {
            const sIdx = formationSlotIndices[i];

            // Find a free room
            let chosenRoom = -1;
            // Prefer Amphis (1-15) for first few modules (assuming they are big), TPs (16-65) for others?
            // Randomly pick a room.
            for (let r = 1; r <= ROOMS_COUNT; r++) {
                // Try random room offset to distribute
                const rRand = ((r + m + formId) % ROOMS_COUNT) + 1;
                if (!busyRooms[sIdx].has(rRand)) {
                    chosenRoom = rRand;
                    break;
                }
            }

            // Find a free prof
            let chosenProf = -1;
            for (let p = 1; p <= PROFS_COUNT; p++) {
                const pRand = ((p + m + formId) % PROFS_COUNT) + 1;
                if (!busyProfs[sIdx].has(pRand)) {
                    chosenProf = pRand;
                    break;
                }
            }

            if (chosenRoom !== -1 && chosenProf !== -1) {
                // Assign
                busyRooms[sIdx].add(chosenRoom);
                busyProfs[sIdx].add(chosenProf);

                // Calculate Date string
                const exDate = new Date(startDate);
                exDate.setDate(exDate.getDate() + slots[sIdx].dayOffset);
                const dateStr = exDate.toISOString().split('T')[0];

                examRows.push({
                    id: examIdCounter++,
                    moduleId: modId,
                    examRoomId: chosenRoom,
                    professorId: chosenProf,
                    sessionDate: dateStr,
                    startTime: slots[sIdx].startTime,
                    endTime: slots[sIdx].endTime,
                    duration: 120,
                    type: 'Session Normale',
                    status: 'DRAFT', // DEFAULT STATUS
                    slotIndex: sIdx, // Keep for creating conflicts later
                    formationId: formId // Keep for ref
                });

                // Remove this slot from formation's choices (already done by iterating once per module)
                // actually we just break and go to next module
                assigned = true;
                break;
            }
        }

        if (!assigned) {
            console.warn(`⚠️ Could not schedule Module ${modId} (Form ${formId}) - standard grid full?`);
            // Force assign mostly to avoid crash, will create conflict naturally
            examRows.push({
                id: examIdCounter++,
                moduleId: modId,
                examRoomId: 1,
                professorId: 1,
                sessionDate: '2025-01-01',
                startTime: '08:00',
                endTime: '10:00',
                duration: 120,
                type: 'ERROR',
                status: 'DRAFT'
            });
        }
    }
}

console.log(`📅 Scheduled ${examRows.length} exams cleanly.`);

// --- 3. CREATE INTENTIONAL CONFLICTS (Target: ~20) ---
// Strategy: Pick 20 exams (Victims) and change their time/room to clash with 20 other exams (Sources).
// Or simple: Pick 10 pairs. Make Victim A clash with Source B.
// Types:
// 1. Room Conflict: Same Slot, Same Room.
// 2. Prof Conflict: Same Slot, Same Prof.
// 3. Student Conflict: Same Slot, Same Formation.

const VICTIM_COUNT = 20;
// We will create ~7 of each type.

console.log('⚔️ Injecting 20 conflicts...');

for (let k = 0; k < VICTIM_COUNT; k++) {
    // Pick a random victim (not already modified effectively)
    const victimIdx = Math.floor(Math.random() * (examRows.length / 2)); // Pick from first half
    const sourceIdx = Math.floor(Math.random() * (examRows.length / 2)) + (examRows.length / 2); // Pick from second half

    // We modify Victim to clash with Source
    const source = examRows[Math.floor(sourceIdx)];
    const victim = examRows[victimIdx];

    const type = k % 3;

    // Set Victim time to Source time
    victim.sessionDate = source.sessionDate;
    victim.startTime = source.startTime;
    victim.endTime = source.endTime;

    if (type === 0) {
        // Room Conflict
        victim.examRoomId = source.examRoomId;
        // Ensure different prof/formation to isolate conflict type? Not strictly necessary.
    } else if (type === 1) {
        // Prof Conflict
        victim.professorId = source.professorId;
        // Ensure different room
        victim.examRoomId = (source.examRoomId % ROOMS_COUNT) + 1;
    } else {
        // Student Conflict (Same Formation)
        // Harder because formation is tied to module.
        // We can't change the formation of the module easily without changing the module ID.
        // But we can check if we can find a victim in the SAME formation as source.

        // Let's search for a sibling in same formation
        const sibling = examRows.find(e => e.formationId === source.formationId && e.id !== source.id);
        if (sibling) {
            // Make sibling clash with source time
            sibling.sessionDate = source.sessionDate;
            sibling.startTime = source.startTime;
            sibling.endTime = source.endTime;
            // Sibling already has same formation -> Conflict!
            // Ensure diff room/prof to be clean
            sibling.examRoomId = (source.examRoomId % ROOMS_COUNT) + 1;
            sibling.professorId = (source.professorId % PROFS_COUNT) + 1;
        }
    }
}

// --- 4. Write CSV ---
const sessHeader = 'id,moduleId,examRoomId,professorId,sessionDate,startTime,endTime,duration,type,status\n';
const sessLines = examRows.map(e =>
    `${e.id},${e.moduleId},${e.examRoomId},${e.professorId},${e.sessionDate},${e.startTime},${e.endTime},${e.duration},${e.type},${e.status}`
);

fs.writeFileSync(sessionsPath, sessHeader + sessLines.join('\n') + '\n');
console.log(`✅ Written ${sessLines.length} exam sessions with ~20 conflicts.`);
