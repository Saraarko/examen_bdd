-- =================================================
-- SCHÉMA DE BASE DE DONNÉES - SYSTÈME DE PLANIFICATION D'EXAMENS
-- Structure adaptée à l'échelle réelle avec séparation par dashboard
-- =================================================

-- =================================================
-- TABLES GLOBALES (partagées par tous les dashboards)
-- =================================================

-- Départements universitaires
CREATE TABLE departments (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL UNIQUE,
    code VARCHAR(10) NOT NULL UNIQUE,
    description TEXT,
    total_students INTEGER DEFAULT 0,
    total_professors INTEGER DEFAULT 0,
    total_formations INTEGER DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Formations par département
CREATE TABLE formations (
    id SERIAL PRIMARY KEY,
    name VARCHAR(150) NOT NULL,
    code VARCHAR(20) NOT NULL UNIQUE,
    department_id INTEGER NOT NULL REFERENCES departments(id) ON DELETE CASCADE,
    level VARCHAR(20) CHECK (level IN ('L1', 'L2', 'L3', 'M1', 'M2', 'Doctorat')),
    duration_years INTEGER DEFAULT 1,
    total_students INTEGER DEFAULT 0,
    nb_modules INTEGER DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(department_id, code)
);

-- Modules d'enseignement
CREATE TABLE modules (
    id SERIAL PRIMARY KEY,
    name VARCHAR(150) NOT NULL,
    code VARCHAR(20) NOT NULL UNIQUE,
    credits INTEGER NOT NULL CHECK (credits > 0),
    formation_id INTEGER NOT NULL REFERENCES formations(id) ON DELETE CASCADE,
    semester INTEGER CHECK (semester IN (1, 2)),
    prerequisite_id INTEGER REFERENCES modules(id) ON DELETE SET NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Étudiants
CREATE TABLE students (
    id SERIAL PRIMARY KEY,
    student_number VARCHAR(20) NOT NULL UNIQUE,
    first_name VARCHAR(50) NOT NULL,
    last_name VARCHAR(50) NOT NULL,
    email VARCHAR(100) NOT NULL UNIQUE,
    phone VARCHAR(20),
    formation_id INTEGER NOT NULL REFERENCES formations(id) ON DELETE CASCADE,
    promotion_year INTEGER NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Professeurs
CREATE TABLE professors (
    id SERIAL PRIMARY KEY,
    professor_number VARCHAR(20) NOT NULL UNIQUE,
    first_name VARCHAR(50) NOT NULL,
    last_name VARCHAR(50) NOT NULL,
    email VARCHAR(100) NOT NULL UNIQUE,
    phone VARCHAR(20),
    department_id INTEGER NOT NULL REFERENCES departments(id) ON DELETE CASCADE,
    speciality VARCHAR(100),
    max_exams_per_day INTEGER DEFAULT 3,
    is_department_head BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Salles d'examen
CREATE TABLE exam_rooms (
    id SERIAL PRIMARY KEY,
    name VARCHAR(50) NOT NULL,
    code VARCHAR(10) NOT NULL UNIQUE,
    capacity INTEGER NOT NULL CHECK (capacity > 0),
    room_type VARCHAR(20) CHECK (room_type IN ('amphitheater', 'classroom', 'lab')),
    building VARCHAR(100) NOT NULL,
    floor INTEGER,
    has_projector BOOLEAN DEFAULT FALSE,
    has_computers BOOLEAN DEFAULT FALSE,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Sessions d'examen
CREATE TABLE exam_sessions (
    id SERIAL PRIMARY KEY,
    module_id INTEGER NOT NULL REFERENCES modules(id) ON DELETE CASCADE,
    exam_room_id INTEGER NOT NULL REFERENCES exam_rooms(id) ON DELETE CASCADE,
    professor_id INTEGER NOT NULL REFERENCES professors(id) ON DELETE CASCADE,
    session_date DATE NOT NULL,
    start_time TIME NOT NULL,
    end_time TIME NOT NULL,
    duration_minutes INTEGER NOT NULL CHECK (duration_minutes > 0),
    exam_type VARCHAR(20) CHECK (exam_type IN ('written', 'oral', 'practical', 'project')),
    expected_students INTEGER NOT NULL DEFAULT 0,
    status VARCHAR(20) DEFAULT 'planned' CHECK (status IN ('planned', 'confirmed', 'in_progress', 'completed', 'cancelled')),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    -- Contrainte : une salle ne peut avoir qu'un examen à la fois
    UNIQUE(exam_room_id, session_date, start_time),
    -- Contrainte : durée cohérente avec les horaires
    CHECK (end_time > start_time)
);

-- Inscriptions aux modules (relation étudiant-module)
CREATE TABLE module_enrollments (
    id SERIAL PRIMARY KEY,
    student_id INTEGER NOT NULL REFERENCES students(id) ON DELETE CASCADE,
    module_id INTEGER NOT NULL REFERENCES modules(id) ON DELETE CASCADE,
    enrollment_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    final_grade DECIMAL(4,2) CHECK (final_grade >= 0 AND final_grade <= 20),
    status VARCHAR(20) DEFAULT 'enrolled' CHECK (status IN ('enrolled', 'completed', 'failed', 'withdrawn')),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(student_id, module_id)
);

-- Inscriptions aux examens (relation étudiant-session)
CREATE TABLE exam_enrollments (
    id SERIAL PRIMARY KEY,
    student_id INTEGER NOT NULL REFERENCES students(id) ON DELETE CASCADE,
    exam_session_id INTEGER NOT NULL REFERENCES exam_sessions(id) ON DELETE CASCADE,
    enrollment_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    attendance_status VARCHAR(20) DEFAULT 'registered' CHECK (attendance_status IN ('registered', 'present', 'absent', 'excused')),
    grade DECIMAL(4,2) CHECK (grade >= 0 AND grade <= 20),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(student_id, exam_session_id)
);

-- =================================================
-- TABLES SPÉCIFIQUES AU DASHBOARD ADMIN
-- =================================================

-- Configurations système pour l'optimisation
CREATE TABLE admin_system_configs (
    id SERIAL PRIMARY KEY,
    config_key VARCHAR(50) NOT NULL UNIQUE,
    config_value JSONB NOT NULL,
    description TEXT,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Historique des générations d'emplois du temps
CREATE TABLE admin_schedule_generations (
    id SERIAL PRIMARY KEY,
    generation_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    algorithm_used VARCHAR(50) NOT NULL,
    execution_time_seconds DECIMAL(8,2) NOT NULL,
    total_exams INTEGER NOT NULL,
    conflicts_found INTEGER DEFAULT 0,
    optimization_score DECIMAL(5,2),
    status VARCHAR(20) DEFAULT 'completed' CHECK (status IN ('running', 'completed', 'failed')),
    parameters_used JSONB,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Métriques de performance système
CREATE TABLE admin_performance_metrics (
    id SERIAL PRIMARY KEY,
    metric_date DATE NOT NULL,
    metric_type VARCHAR(50) NOT NULL,
    metric_value DECIMAL(10,2) NOT NULL,
    target_value DECIMAL(10,2),
    department_id INTEGER REFERENCES departments(id) ON DELETE SET NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(metric_date, metric_type, department_id)
);

-- =================================================
-- TABLES SPÉCIFIQUES AU DASHBOARD DOYEN
-- =================================================

-- Validations par département
CREATE TABLE dean_department_validations (
    id SERIAL PRIMARY KEY,
    department_id INTEGER NOT NULL REFERENCES departments(id) ON DELETE CASCADE,
    validation_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    validated_by INTEGER NOT NULL REFERENCES professors(id),
    academic_year VARCHAR(9) NOT NULL, -- Format: 2023-2024
    semester INTEGER CHECK (semester IN (1, 2)),
    status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending', 'validated', 'rejected')),
    comments TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(department_id, academic_year, semester)
);

-- KPIs stratégiques du doyen
CREATE TABLE dean_strategic_kpis (
    id SERIAL PRIMARY KEY,
    kpi_date DATE NOT NULL,
    kpi_name VARCHAR(100) NOT NULL,
    kpi_value DECIMAL(10,2) NOT NULL,
    target_value DECIMAL(10,2),
    department_id INTEGER REFERENCES departments(id) ON DELETE CASCADE,
    formation_id INTEGER REFERENCES formations(id) ON DELETE CASCADE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(kpi_date, kpi_name, department_id, formation_id)
);

-- =================================================
-- TABLES SPÉCIFIQUES AU DASHBOARD DÉPARTEMENT
-- =================================================

-- Chefs de département
CREATE TABLE department_heads (
    id SERIAL PRIMARY KEY,
    professor_id INTEGER NOT NULL REFERENCES professors(id) ON DELETE CASCADE,
    department_id INTEGER NOT NULL REFERENCES departments(id) ON DELETE CASCADE,
    start_date DATE NOT NULL,
    end_date DATE,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(professor_id, department_id),
    CHECK (end_date IS NULL OR end_date > start_date)
);

-- Planifications par formation
CREATE TABLE department_formation_schedules (
    id SERIAL PRIMARY KEY,
    formation_id INTEGER NOT NULL REFERENCES formations(id) ON DELETE CASCADE,
    academic_year VARCHAR(9) NOT NULL,
    semester INTEGER CHECK (semester IN (1, 2)),
    planning_status VARCHAR(20) DEFAULT 'draft' CHECK (planning_status IN ('draft', 'submitted', 'validated', 'published')),
    submitted_by INTEGER REFERENCES professors(id),
    submitted_date TIMESTAMP,
    validated_by INTEGER REFERENCES professors(id),
    validated_date TIMESTAMP,
    conflicts_count INTEGER DEFAULT 0,
    total_exams INTEGER DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(formation_id, academic_year, semester)
);

-- Répartition des surveillances par professeur
CREATE TABLE department_professor_assignments (
    id SERIAL PRIMARY KEY,
    professor_id INTEGER NOT NULL REFERENCES professors(id) ON DELETE CASCADE,
    exam_session_id INTEGER NOT NULL REFERENCES exam_sessions(id) ON DELETE CASCADE,
    assignment_type VARCHAR(20) DEFAULT 'supervisor' CHECK (assignment_type IN ('supervisor', 'backup', 'coordinator')),
    assignment_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    assigned_by INTEGER NOT NULL REFERENCES professors(id),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(professor_id, exam_session_id)
);

-- =================================================
-- TABLES SPÉCIFIQUES AU DASHBOARD ÉTUDIANT
-- =================================================

-- Préférences d'examen par étudiant
CREATE TABLE student_exam_preferences (
    id SERIAL PRIMARY KEY,
    student_id INTEGER NOT NULL REFERENCES students(id) ON DELETE CASCADE,
    preferred_times JSONB, -- ["morning", "afternoon"]
    unavailable_dates JSONB, -- Liste des dates non disponibles
    preferred_rooms JSONB, -- Liste des salles préférées
    medical_conditions TEXT,
    special_needs BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(student_id)
);

-- Notifications pour étudiants
CREATE TABLE student_notifications (
    id SERIAL PRIMARY KEY,
    student_id INTEGER NOT NULL REFERENCES students(id) ON DELETE CASCADE,
    notification_type VARCHAR(50) NOT NULL,
    title VARCHAR(150) NOT NULL,
    message TEXT NOT NULL,
    is_read BOOLEAN DEFAULT FALSE,
    read_date TIMESTAMP,
    related_exam_session_id INTEGER REFERENCES exam_sessions(id) ON DELETE SET NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- =================================================
-- TABLES DE CONTRAINTES ET RÈGLES MÉTIER
-- =================================================

-- Conflits détectés
CREATE TABLE conflicts (
    id SERIAL PRIMARY KEY,
    conflict_type VARCHAR(30) NOT NULL CHECK (conflict_type IN ('room_capacity', 'professor_availability', 'student_schedule', 'room_availability', 'prerequisites')),
    severity VARCHAR(10) DEFAULT 'medium' CHECK (severity IN ('low', 'medium', 'high', 'critical')),
    title VARCHAR(200) NOT NULL,
    description TEXT NOT NULL,
    affected_entities JSONB NOT NULL, -- IDs des entités concernées
    department_id INTEGER REFERENCES departments(id) ON DELETE CASCADE,
    exam_session_id INTEGER REFERENCES exam_sessions(id) ON DELETE CASCADE,
    status VARCHAR(20) DEFAULT 'open' CHECK (status IN ('open', 'investigating', 'resolved', 'closed')),
    resolved_by INTEGER REFERENCES professors(id),
    resolved_date TIMESTAMP,
    resolution_notes TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Règles de priorité pour l'optimisation
CREATE TABLE priority_rules (
    id SERIAL PRIMARY KEY,
    rule_name VARCHAR(100) NOT NULL UNIQUE,
    rule_type VARCHAR(30) NOT NULL CHECK (rule_type IN ('department_priority', 'professor_balance', 'room_optimization', 'student_distribution')),
    rule_conditions JSONB NOT NULL,
    priority_score INTEGER DEFAULT 1 CHECK (priority_score >= 1 AND priority_score <= 10),
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- =================================================
-- INDEXES POUR LES PERFORMANCES
-- =================================================

-- Indexes pour les contraintes critiques
CREATE INDEX idx_exam_sessions_date_room ON exam_sessions(session_date, exam_room_id);
CREATE INDEX idx_exam_sessions_professor_date ON exam_sessions(professor_id, session_date);
CREATE INDEX idx_exam_enrollments_student_date ON exam_enrollments(student_id, (SELECT session_date FROM exam_sessions WHERE id = exam_session_id));
CREATE INDEX idx_department_professor_assignments_prof_date ON department_professor_assignments(professor_id, (SELECT session_date FROM exam_sessions WHERE id = exam_session_id));

-- Indexes pour les recherches fréquentes
CREATE INDEX idx_students_formation ON students(formation_id);
CREATE INDEX idx_modules_formation ON modules(formation_id);
CREATE INDEX idx_exam_sessions_module ON exam_sessions(module_id);
CREATE INDEX idx_conflicts_department_status ON conflicts(department_id, status);
CREATE INDEX idx_conflicts_severity_status ON conflicts(severity, status);

-- =================================================
-- VUES POUR LES DASHBOARDS
-- =================================================

-- Vue pour le dashboard Admin
CREATE VIEW admin_dashboard_metrics AS
SELECT
    DATE_TRUNC('day', created_at) as metric_date,
    COUNT(*) as total_exams,
    COUNT(CASE WHEN status = 'completed' THEN 1 END) as completed_exams,
    AVG(execution_time_seconds) as avg_generation_time,
    SUM(conflicts_found) as total_conflicts
FROM admin_schedule_generations
GROUP BY DATE_TRUNC('day', created_at);

-- Vue pour le dashboard Doyen
CREATE VIEW dean_department_overview AS
SELECT
    d.id,
    d.name,
    d.total_students,
    d.total_professors,
    COUNT(f.id) as total_formations,
    COUNT(CASE WHEN dvs.status = 'validated' THEN 1 END) as validated_schedules,
    COUNT(c.id) as active_conflicts
FROM departments d
LEFT JOIN formations f ON d.id = f.department_id
LEFT JOIN dean_department_validations dvs ON d.id = dvs.department_id
LEFT JOIN conflicts c ON d.id = c.department_id AND c.status = 'open'
GROUP BY d.id, d.name, d.total_students, d.total_professors;

-- Vue pour le dashboard Département
CREATE VIEW department_schedule_status AS
SELECT
    f.id,
    f.name,
    f.level,
    dfs.planning_status,
    dfs.conflicts_count,
    dfs.total_exams,
    COUNT(es.id) as actual_exams,
    COUNT(CASE WHEN es.status = 'confirmed' THEN 1 END) as confirmed_exams
FROM formations f
LEFT JOIN department_formation_schedules dfs ON f.id = dfs.formation_id
LEFT JOIN modules m ON f.id = m.formation_id
LEFT JOIN exam_sessions es ON m.id = es.module_id
GROUP BY f.id, f.name, f.level, dfs.planning_status, dfs.conflicts_count, dfs.total_exams;

-- Vue pour le dashboard Étudiant
CREATE VIEW student_exam_schedule AS
SELECT
    s.id as student_id,
    s.first_name,
    s.last_name,
    es.session_date,
    es.start_time,
    es.end_time,
    m.name as module_name,
    er.name as room_name,
    er.building,
    p.first_name || ' ' || p.last_name as professor_name,
    ee.grade,
    ee.attendance_status
FROM students s
JOIN exam_enrollments ee ON s.id = ee.student_id
JOIN exam_sessions es ON ee.exam_session_id = es.id
JOIN modules m ON es.module_id = m.id
JOIN exam_rooms er ON es.exam_room_id = er.id
JOIN professors p ON es.professor_id = p.id
ORDER BY es.session_date, es.start_time;

-- =================================================
-- FONCTIONS ET TRIGGERS POUR LES CONTRAINTES
-- =================================================

-- Fonction pour vérifier la contrainte "1 examen par jour par étudiant"
CREATE OR REPLACE FUNCTION check_student_daily_exam_limit()
RETURNS TRIGGER AS $$
BEGIN
    IF EXISTS (
        SELECT 1 FROM exam_enrollments ee
        JOIN exam_sessions es ON ee.exam_session_id = es.id
        WHERE ee.student_id = NEW.student_id
        AND es.session_date = (SELECT session_date FROM exam_sessions WHERE id = NEW.exam_session_id)
        AND ee.id != NEW.id
    ) THEN
        RAISE EXCEPTION 'Un étudiant ne peut avoir qu''un seul examen par jour';
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger pour la contrainte étudiant
CREATE TRIGGER trg_check_student_daily_exam_limit
    BEFORE INSERT OR UPDATE ON exam_enrollments
    FOR EACH ROW EXECUTE FUNCTION check_student_daily_exam_limit();

-- Fonction pour vérifier la contrainte "3 surveillances max par jour par professeur"
CREATE OR REPLACE FUNCTION check_professor_daily_supervision_limit()
RETURNS TRIGGER AS $$
BEGIN
    IF (
        SELECT COUNT(*)
        FROM department_professor_assignments dpa
        JOIN exam_sessions es ON dpa.exam_session_id = es.id
        WHERE dpa.professor_id = NEW.professor_id
        AND es.session_date = (SELECT session_date FROM exam_sessions WHERE id = NEW.exam_session_id)
    ) >= (
        SELECT COALESCE(max_exams_per_day, 3)
        FROM professors
        WHERE id = NEW.professor_id
    ) THEN
        RAISE EXCEPTION 'Un professeur ne peut superviser que % examens par jour maximum', (
            SELECT COALESCE(max_exams_per_day, 3) FROM professors WHERE id = NEW.professor_id
        );
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger pour la contrainte professeur
CREATE TRIGGER trg_check_professor_daily_supervision_limit
    BEFORE INSERT OR UPDATE ON department_professor_assignments
    FOR EACH ROW EXECUTE FUNCTION check_professor_daily_supervision_limit();

-- Fonction pour vérifier la capacité des salles
CREATE OR REPLACE FUNCTION check_room_capacity()
RETURNS TRIGGER AS $$
DECLARE
    room_cap INTEGER;
    enrolled_count INTEGER;
BEGIN
    SELECT capacity INTO room_cap FROM exam_rooms WHERE id = NEW.exam_room_id;

    SELECT COUNT(*) INTO enrolled_count
    FROM exam_enrollments
    WHERE exam_session_id = NEW.id;

    IF enrolled_count >= room_cap THEN
        RAISE EXCEPTION 'La salle a atteint sa capacité maximale de % places', room_cap;
    END IF;

    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger pour la capacité des salles
CREATE TRIGGER trg_check_room_capacity
    AFTER INSERT OR UPDATE ON exam_enrollments
    FOR EACH ROW EXECUTE FUNCTION check_room_capacity();

-- =================================================
-- DONNÉES D'INITIALISATION
-- =================================================

-- Insertion des configurations système par défaut
INSERT INTO admin_system_configs (config_key, config_value, description) VALUES
('max_student_exams_per_day', '1', 'Nombre maximum d''examens par jour pour un étudiant'),
('max_professor_supervisions_per_day', '3', 'Nombre maximum de surveillances par jour pour un professeur'),
('optimization_algorithm', '"genetic"', 'Algorithme d''optimisation utilisé'),
('auto_resolve_conflicts', 'false', 'Résolution automatique des conflits de faible priorité'),
('notification_enabled', 'true', 'Envoi de notifications aux étudiants');

-- Insertion des règles de priorité
INSERT INTO priority_rules (rule_name, rule_type, rule_conditions, priority_score) VALUES
('Priorité départementale', 'department_priority', '{"same_department": true}', 9),
('Équilibre charge professeurs', 'professor_balance', '{"balance_load": true}', 8),
('Optimisation salles', 'room_optimization', '{"prefer_large_rooms": true}', 7),
('Répartition étudiants', 'student_distribution', '{"avoid_overload_days": true}', 6);
