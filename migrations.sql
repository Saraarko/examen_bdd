CREATE TABLE IF NOT EXISTS "Department" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "name" TEXT NOT NULL,
    "code" TEXT NOT NULL,
    "description" TEXT
);
CREATE UNIQUE INDEX IF NOT EXISTS "Department_name_key" ON "Department"("name");
CREATE UNIQUE INDEX IF NOT EXISTS "Department_code_key" ON "Department"("code");

CREATE TABLE IF NOT EXISTS "Formation" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "name" TEXT NOT NULL,
    "code" TEXT NOT NULL,
    "departmentId" INTEGER NOT NULL,
    "level" TEXT NOT NULL,
    FOREIGN KEY ("departmentId") REFERENCES "Department" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);
CREATE UNIQUE INDEX IF NOT EXISTS "Formation_code_key" ON "Formation"("code");

CREATE TABLE IF NOT EXISTS "Module" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "name" TEXT NOT NULL,
    "code" TEXT NOT NULL,
    "credits" INTEGER NOT NULL,
    "formationId" INTEGER NOT NULL,
    "semester" INTEGER NOT NULL,
    FOREIGN KEY ("formationId") REFERENCES "Formation" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);
CREATE UNIQUE INDEX IF NOT EXISTS "Module_code_key" ON "Module"("code");

CREATE TABLE IF NOT EXISTS "Student" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "studentNumber" TEXT NOT NULL,
    "firstName" TEXT NOT NULL,
    "lastName" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "password" TEXT NOT NULL,
    "formationId" INTEGER NOT NULL,
    FOREIGN KEY ("formationId") REFERENCES "Formation" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);
CREATE UNIQUE INDEX IF NOT EXISTS "Student_studentNumber_key" ON "Student"("studentNumber");
CREATE UNIQUE INDEX IF NOT EXISTS "Student_email_key" ON "Student"("email");

CREATE TABLE IF NOT EXISTS "Professor" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "professorNumber" TEXT NOT NULL,
    "firstName" TEXT NOT NULL,
    "lastName" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "password" TEXT NOT NULL,
    "departmentId" INTEGER NOT NULL,
    "role" TEXT NOT NULL DEFAULT 'professor',
    FOREIGN KEY ("departmentId") REFERENCES "Department" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);
CREATE UNIQUE INDEX IF NOT EXISTS "Professor_professorNumber_key" ON "Professor"("professorNumber");
CREATE UNIQUE INDEX IF NOT EXISTS "Professor_email_key" ON "Professor"("email");

CREATE TABLE IF NOT EXISTS "ExamRoom" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "name" TEXT NOT NULL,
    "capacity" INTEGER NOT NULL,
    "building" TEXT
);

CREATE TABLE IF NOT EXISTS "ExamSession" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "moduleId" INTEGER NOT NULL,
    "examRoomId" INTEGER NOT NULL,
    "professorId" INTEGER NOT NULL,
    "sessionDate" DATETIME NOT NULL,
    "startTime" TEXT NOT NULL,
    "endTime" TEXT NOT NULL,
    "duration" INTEGER NOT NULL,
    "type" TEXT NOT NULL,
    FOREIGN KEY ("moduleId") REFERENCES "Module" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    FOREIGN KEY ("examRoomId") REFERENCES "ExamRoom" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    FOREIGN KEY ("professorId") REFERENCES "Professor" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

CREATE TABLE IF NOT EXISTS "ExamEnrollment" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "studentId" INTEGER NOT NULL,
    "examSessionId" INTEGER NOT NULL,
    "grade" REAL,
    "attendance" TEXT NOT NULL DEFAULT 'registered',
    FOREIGN KEY ("studentId") REFERENCES "Student" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    FOREIGN KEY ("examSessionId") REFERENCES "ExamSession" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);
CREATE UNIQUE INDEX IF NOT EXISTS "ExamEnrollment_studentId_examSessionId_key" ON "ExamEnrollment"("studentId", "examSessionId");

CREATE TABLE IF NOT EXISTS "ModuleEnrollment" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "studentId" INTEGER NOT NULL,
    "moduleId" INTEGER NOT NULL,
    FOREIGN KEY ("studentId") REFERENCES "Student" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    FOREIGN KEY ("moduleId") REFERENCES "Module" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);
CREATE UNIQUE INDEX IF NOT EXISTS "ModuleEnrollment_studentId_moduleId_key" ON "ModuleEnrollment"("studentId", "moduleId");

CREATE TABLE IF NOT EXISTS "Admin" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "firstName" TEXT NOT NULL,
    "lastName" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "password" TEXT NOT NULL
);
CREATE UNIQUE INDEX IF NOT EXISTS "Admin_email_key" ON "Admin"("email");

CREATE TABLE IF NOT EXISTS "Dean" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "firstName" TEXT NOT NULL,
    "lastName" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "password" TEXT NOT NULL,
    "title" TEXT NOT NULL
);
CREATE UNIQUE INDEX IF NOT EXISTS "Dean_email_key" ON "Dean"("email");

CREATE TABLE IF NOT EXISTS "KPI" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "tempsGenerationEDT" INTEGER NOT NULL,
    "nbExamensPlanifies" INTEGER NOT NULL,
    "tauxConflits" REAL NOT NULL,
    "tauxValidation" REAL NOT NULL,
    "heuresProfPlanifiees" INTEGER NOT NULL,
    "amphisUtilises" INTEGER NOT NULL,
    "sallesUtilisees" INTEGER NOT NULL
);

CREATE TABLE IF NOT EXISTS "Conflict" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "type" TEXT NOT NULL,
    "severite" TEXT NOT NULL,
    "message" TEXT NOT NULL,
    "details" TEXT,
    "departement" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'non_resolu'
);

CREATE TABLE IF NOT EXISTS "UniversityInfo" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "name" TEXT NOT NULL,
    "totalStudents" INTEGER NOT NULL,
    "totalDepartments" INTEGER NOT NULL,
    "totalFormations" INTEGER NOT NULL
);

