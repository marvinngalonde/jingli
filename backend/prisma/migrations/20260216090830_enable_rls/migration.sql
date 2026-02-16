-- Enable RLS on all tables
ALTER TABLE "schools" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "users" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "academic_years" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "classes" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "sections" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "subjects" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "subject_allocations" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "students" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "student_guardians" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "guardians" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "staff" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "timetables" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "assignments" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "submissions" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "attendance" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "fee_heads" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "fee_structures" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "invoices" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "transactions" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "visitors" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "gate_passes" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "late_arrivals" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "inquiries" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "notices" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "messages" ENABLE ROW LEVEL SECURITY;

-- Create helper function to get current user's school_id
-- This assumes auth.uid() matches users.supabase_uid
CREATE OR REPLACE FUNCTION public.current_school_id()
RETURNS uuid AS $$
  SELECT school_id::uuid FROM public.users WHERE supabase_uid = auth.uid()::text LIMIT 1;
$$ LANGUAGE sql SECURITY DEFINER; 

-- Policies

-- 1. Schools: Users can only see their own school
CREATE POLICY "Tenant Isolation" ON "schools"
    USING (id::uuid = public.current_school_id());

-- 2. Generic Policy for all tables with school_id
-- We need to apply this to every table except those with special rules (none so far, maybe messages?)

-- Macro-style execution isn't supported in standard SQL migrations easily without dynamic SQL, 
-- so we list them explicitely for safety.

CREATE POLICY "Tenant Isolation" ON "users" USING (school_id::uuid = public.current_school_id());
CREATE POLICY "Tenant Isolation" ON "academic_years" USING (school_id::uuid = public.current_school_id());
CREATE POLICY "Tenant Isolation" ON "classes" USING (school_id::uuid = public.current_school_id());
CREATE POLICY "Tenant Isolation" ON "sections" USING (school_id::uuid = public.current_school_id());
CREATE POLICY "Tenant Isolation" ON "subjects" USING (school_id::uuid = public.current_school_id());
CREATE POLICY "Tenant Isolation" ON "subject_allocations" USING (
    EXISTS (SELECT 1 FROM "staff" WHERE id = "subject_allocations".staff_id AND school_id::uuid = public.current_school_id())
); 
-- subject_allocations doesn't have school_id directly in previous schema? 
-- Wait, let's check schema.prisma.
-- SubjectAllocation does NOT have school_id. It links to Staff, Subject, Section.
-- Staff, Subject, Section HAVE school_id.
-- So we check via connection.

-- RE-CHECK SCHEMA FOR SubjectAllocation
-- model SubjectAllocation { id, staffId, subjectId, sectionId ... }
-- It does NOT have school_id.
-- RLS Policy must join.

-- Optimization: Add school_id to SubjectAllocation? Or join.
-- Join is fine for now. "section" has school_id.
DROP POLICY IF EXISTS "Tenant Isolation" ON "subject_allocations";
CREATE POLICY "Tenant Isolation" ON "subject_allocations" USING (
    EXISTS (SELECT 1 FROM "sections" WHERE id = "subject_allocations".section_id AND school_id::uuid = public.current_school_id())
);

CREATE POLICY "Tenant Isolation" ON "students" USING (school_id::uuid = public.current_school_id());

-- StudentGuardian: No school_id. Join Student.
CREATE POLICY "Tenant Isolation" ON "student_guardians" USING (
    EXISTS (SELECT 1 FROM "students" WHERE id = "student_guardians".student_id AND school_id::uuid = public.current_school_id())
);

CREATE POLICY "Tenant Isolation" ON "guardians" USING (school_id::uuid = public.current_school_id());
CREATE POLICY "Tenant Isolation" ON "staff" USING (school_id::uuid = public.current_school_id());

-- Timetable: No school_id?
-- model Timetable { sectionId ... } -> Link to Section
CREATE POLICY "Tenant Isolation" ON "timetables" USING (
    EXISTS (SELECT 1 FROM "sections" WHERE id = "timetables".section_id AND school_id::uuid = public.current_school_id())
);

-- Assignment: Link to Section
CREATE POLICY "Tenant Isolation" ON "assignments" USING (
    EXISTS (SELECT 1 FROM "sections" WHERE id = "assignments".section_id AND school_id::uuid = public.current_school_id())
);

-- Submission: Link to student? 
-- model Submission { assignmentId, studentId ... }
-- Link to Student is safer.
CREATE POLICY "Tenant Isolation" ON "submissions" USING (
    EXISTS (SELECT 1 FROM "students" WHERE id = "submissions".student_id AND school_id::uuid = public.current_school_id())
);

CREATE POLICY "Tenant Isolation" ON "attendance" USING (
    EXISTS (SELECT 1 FROM "students" WHERE id = "attendance".student_id AND school_id::uuid = public.current_school_id())
);

CREATE POLICY "Tenant Isolation" ON "fee_heads" USING (school_id::uuid = public.current_school_id());
CREATE POLICY "Tenant Isolation" ON "fee_structures" USING (school_id::uuid = public.current_school_id());
CREATE POLICY "Tenant Isolation" ON "invoices" USING (school_id::uuid = public.current_school_id());
CREATE POLICY "Tenant Isolation" ON "transactions" USING (school_id::uuid = public.current_school_id());
CREATE POLICY "Tenant Isolation" ON "visitors" USING (school_id::uuid = public.current_school_id());
CREATE POLICY "Tenant Isolation" ON "gate_passes" USING (school_id::uuid = public.current_school_id());
CREATE POLICY "Tenant Isolation" ON "late_arrivals" USING (school_id::uuid = public.current_school_id());
CREATE POLICY "Tenant Isolation" ON "inquiries" USING (school_id::uuid = public.current_school_id());
CREATE POLICY "Tenant Isolation" ON "notices" USING (school_id::uuid = public.current_school_id());

-- Messages: sender or receiver must be in current school?
-- model Message { senderId, receiverId ... } -> Link to User.
-- User has school_id.
-- Policy: Sender OR Receiver is in current school? 
-- Actually, strict tenant isolation means users from School A only msg School A.
-- So Sender AND Receiver are in School A.
-- And the viewer (current_user) must be in School A.
-- So we can check generic "sender" link.
CREATE POLICY "Tenant Isolation" ON "messages" USING (
    EXISTS (SELECT 1 FROM "users" WHERE id = "messages".sender_id AND school_id::uuid = public.current_school_id())
);