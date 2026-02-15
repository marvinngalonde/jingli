-- 006_academic_core.sql

-- 1. Academic Years
CREATE TABLE IF NOT EXISTS academic_years (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    school_id UUID REFERENCES schools(id) NOT NULL,
    name TEXT NOT NULL, -- e.g., "2023-2024"
    start_date DATE NOT NULL,
    end_date DATE NOT NULL,
    is_active BOOLEAN DEFAULT false,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE academic_years ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Tenant Isolation: Academic Years" ON academic_years 
    FOR ALL USING (school_id = (SELECT school_id FROM profiles WHERE id = auth.uid()));

-- 2. Terms (Semesters/Quarters)
CREATE TABLE IF NOT EXISTS terms (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    school_id UUID REFERENCES schools(id) NOT NULL,
    academic_year_id UUID REFERENCES academic_years(id) ON DELETE CASCADE,
    name TEXT NOT NULL, -- e.g., "Term 1", "Semester 1"
    start_date DATE NOT NULL,
    end_date DATE NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE terms ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Tenant Isolation: Terms" ON terms 
    FOR ALL USING (school_id = (SELECT school_id FROM profiles WHERE id = auth.uid()));

-- 3. Subjects (Global list for the school)
CREATE TABLE IF NOT EXISTS subjects (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    school_id UUID REFERENCES schools(id) NOT NULL,
    name TEXT NOT NULL, -- e.g., "Mathematics", "Physics"
    code TEXT, -- e.g., "MATH101"
    type TEXT DEFAULT 'theory' CHECK (type IN ('theory', 'practical', 'both')),
    created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE subjects ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Tenant Isolation: Subjects" ON subjects 
    FOR ALL USING (school_id = (SELECT school_id FROM profiles WHERE id = auth.uid()));

-- 4. Subject Allocations (Mapping Class + Subject + Teacher)
CREATE TABLE IF NOT EXISTS subject_allocations (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    school_id UUID REFERENCES schools(id) NOT NULL,
    class_id UUID REFERENCES classes(id) ON DELETE CASCADE,
    subject_id UUID REFERENCES subjects(id) ON DELETE CASCADE,
    teacher_id UUID REFERENCES profiles(id) ON DELETE SET NULL,
    academic_year_id UUID REFERENCES academic_years(id), -- Optional, can inherit from class
    created_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(class_id, subject_id, teacher_id)
);

ALTER TABLE subject_allocations ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Tenant Isolation: Subject Allocations" ON subject_allocations 
    FOR ALL USING (school_id = (SELECT school_id FROM profiles WHERE id = auth.uid()));

-- Indexes
CREATE INDEX idx_academic_years_school ON academic_years(school_id);
CREATE INDEX idx_terms_school ON terms(school_id);
CREATE INDEX idx_subjects_school ON subjects(school_id);
CREATE INDEX idx_allocations_class ON subject_allocations(class_id);
CREATE INDEX idx_allocations_teacher ON subject_allocations(teacher_id);
