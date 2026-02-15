-- 005_update_rls_policies.sql

-- Helper function to get current user's school_id
-- We use SECURITY DEFINER to ensure it runs with privileges to read profiles even if RLS blocks it initially (though infinite recursion is a risk, so be careful).
-- Actually, simple lookup is safer if we ensure profiles key works.
CREATE OR REPLACE FUNCTION get_my_school_id()
RETURNS UUID AS $$
    SELECT school_id FROM profiles WHERE id = auth.uid() LIMIT 1;
$$ LANGUAGE sql STABLE;

-- 1. PROFILES
-- Drop old policies if needed (omitted for brevity, usually we use CREATE OR REPLACE or DROP IF EXISTS)
DROP POLICY IF EXISTS "Users can view own profile" ON profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON profiles;

CREATE POLICY "Users can view profiles in their school" ON profiles 
    FOR SELECT 
    USING (school_id = (SELECT school_id FROM profiles WHERE id = auth.uid()));

CREATE POLICY "Users can view own profile" ON profiles 
    FOR SELECT 
    USING (auth.uid() = id);

-- 2. STUDENTS
DROP POLICY IF EXISTS "Admin and staff can view all students" ON students;
CREATE POLICY "Tenant Isolation: View Students" ON students 
    FOR SELECT 
    USING (school_id = (SELECT school_id FROM profiles WHERE id = auth.uid()));

-- 3. CLASSES
DROP POLICY IF EXISTS "view_classes" ON classes; -- assuming name
CREATE POLICY "Tenant Isolation: Classes" ON classes 
    FOR ALL 
    USING (school_id = (SELECT school_id FROM profiles WHERE id = auth.uid()));

-- Note: We need to repeat this pattern for ALL tables.
-- Ideally, Supabase claims (app_metadata) should hold the school_id to avoid the subquery join on every row,
-- but for Phase 1, the subquery lookup is acceptable.
