-- 1. Create Default School
INSERT INTO "schools" ("id", "name", "subdomain", "logo_url", "config", "created_at")
VALUES (
  '11111111-1111-1111-1111-111111111111', 
  'Demo International School', 
  'demo', 
  'https://placehold.co/200x200.png', 
  '{"theme": "blue", "modules": ["ACADEMIC", "FINANCE", "RECEPTION"]}', 
  NOW()
) ON CONFLICT DO NOTHING;

-- 2. Create Admin User
-- NOTE: 'supabase_uid' is initially NULL.
-- It will be auto-linked when the admin logs in via the Frontend for the first time (SupabaseGuard handles this).
INSERT INTO "users" ("id", "school_id", "email", "password_hash", "role", "status", "avatar_url", "created_at", "supabase_uid")
VALUES (
  '22222222-2222-2222-2222-222222222222',
  '11111111-1111-1111-1111-111111111111',
  'admin@demo.com',
  'placeholder',
  'ADMIN',
  'ACTIVE',
  'https://i.pravatar.cc/150?u=admin',
  NOW(),
  NULL
) ON CONFLICT DO NOTHING;

-- 3. Create Staff Profile for Admin
INSERT INTO "staff" ("id", "school_id", "user_id", "employee_id", "designation", "department", "join_date", "first_name", "last_name", "phone")
VALUES (
  '33333333-3333-3333-3333-333333333333',
  '11111111-1111-1111-1111-111111111111',
  '22222222-2222-2222-2222-222222222222',
  'EMP-001',
  'Super Admin',
  'IT',
  NOW(),
  'System',
  'Admin',
  '123-456-7890'
) ON CONFLICT DO NOTHING;
