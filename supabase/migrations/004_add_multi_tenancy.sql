-- 004_add_multi_tenancy.sql

-- 1. Create Schools Table
CREATE TABLE IF NOT EXISTS schools (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT NOT NULL,
    subdomain TEXT UNIQUE, -- for school-a.jingli.com identification
    address TEXT,
    contact_email TEXT,
    contact_phone TEXT,
    logo_url TEXT,
    config JSONB DEFAULT '{}', -- timezone, currency, etc.
    status TEXT DEFAULT 'active' CHECK (status IN ('active', 'inactive', 'suspended')),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE schools ENABLE ROW LEVEL SECURITY;

-- 2. Insert Default School (so existing data has a home)
INSERT INTO schools (id, name, subdomain) 
VALUES ('00000000-0000-0000-0000-000000000000', 'Default School', 'default')
ON CONFLICT DO NOTHING;

-- 3. Add school_id to all core tables
DO $$
DECLARE
    tbl text;
    tables text[] := ARRAY[
        'profiles', 'students', 'classes', 'staff', 
        'attendance', 'finance_transactions', 'library_books', 
        'transport_routes', 'facilities', 'visitor_logs'
    ];
BEGIN
    FOREACH tbl IN ARRAY tables
    LOOP
        -- Add column
        EXECUTE format('ALTER TABLE %I ADD COLUMN IF NOT EXISTS school_id UUID REFERENCES schools(id) DEFAULT ''00000000-0000-0000-0000-000000000000'';', tbl);
        
        -- Create index
        EXECUTE format('CREATE INDEX IF NOT EXISTS idx_%I_school_id ON %I(school_id);', tbl, tbl);
    END LOOP;
END $$;

-- 4. Update RLS Policies (Example for schools table)
-- Note: Updating ALL existing policies to check school_id is a larger task 
-- and will be done in 005_update_rls_policies.sql to avoid a massive single migration file.

CREATE POLICY "Super Admin can manage schools" ON schools 
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM profiles 
            WHERE id = auth.uid() AND role = 'admin'
        ) -- In future, check for 'super_admin'
    );
