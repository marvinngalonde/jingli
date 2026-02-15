-- 007_finance_engine.sql

-- 1. Fee Heads (Types of fees)
CREATE TABLE IF NOT EXISTS fee_heads (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    school_id UUID REFERENCES schools(id) NOT NULL,
    name TEXT NOT NULL, -- "Tuition", "Transport", "Lab"
    description TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE fee_heads ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Tenant Isolation: Fee Heads" ON fee_heads FOR ALL USING (school_id = (SELECT school_id FROM profiles WHERE id = auth.uid()));

-- 2. Fee Structures (Templates)
CREATE TABLE IF NOT EXISTS fee_structures (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    school_id UUID REFERENCES schools(id) NOT NULL,
    name TEXT NOT NULL, -- "Grade 10 General", "Grade 12 Science"
    academic_year_id UUID REFERENCES academic_years(id),
    total_amount DECIMAL(10,2) DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE fee_structures ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Tenant Isolation: Fee Structures" ON fee_structures FOR ALL USING (school_id = (SELECT school_id FROM profiles WHERE id = auth.uid()));

-- 3. Fee Structure Items (Line items in a template)
CREATE TABLE IF NOT EXISTS fee_structure_items (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    fee_structure_id UUID REFERENCES fee_structures(id) ON DELETE CASCADE,
    fee_head_id UUID REFERENCES fee_heads(id),
    amount DECIMAL(10,2) NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    school_id UUID REFERENCES schools(id) NOT NULL -- Denormalized for RLS efficiency
);

ALTER TABLE fee_structure_items ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Tenant Isolation: Fee Structure Items" ON fee_structure_items FOR ALL USING (school_id = (SELECT school_id FROM profiles WHERE id = auth.uid()));

-- 4. Invoices (The Bill)
CREATE TABLE IF NOT EXISTS invoices (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    school_id UUID REFERENCES schools(id) NOT NULL,
    student_id UUID REFERENCES students(id) NOT NULL,
    fee_structure_id UUID REFERENCES fee_structures(id),
    invoice_number TEXT NOT NULL, -- Auto-generated sequence ideally
    issue_date DATE NOT NULL,
    due_date DATE NOT NULL,
    total_amount DECIMAL(10,2) NOT NULL,
    paid_amount DECIMAL(10,2) DEFAULT 0,
    status TEXT DEFAULT 'unpaid' CHECK (status IN ('unpaid', 'partial', 'paid', 'overdue', 'cancelled')),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE invoices ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Tenant Isolation: Invoices" ON invoices FOR ALL USING (school_id = (SELECT school_id FROM profiles WHERE id = auth.uid()));

-- 5. Invoice Items (Line items in a bill)
CREATE TABLE IF NOT EXISTS invoice_items (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    invoice_id UUID REFERENCES invoices(id) ON DELETE CASCADE,
    fee_head_id UUID REFERENCES fee_heads(id),
    description TEXT NOT NULL, 
    amount DECIMAL(10,2) NOT NULL,
    school_id UUID REFERENCES schools(id) NOT NULL
);

ALTER TABLE invoice_items ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Tenant Isolation: Invoice Items" ON invoice_items FOR ALL USING (school_id = (SELECT school_id FROM profiles WHERE id = auth.uid()));

-- 6. Payments (Collections)
CREATE TABLE IF NOT EXISTS payments (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    school_id UUID REFERENCES schools(id) NOT NULL,
    invoice_id UUID REFERENCES invoices(id),
    student_id UUID REFERENCES students(id),
    amount DECIMAL(10,2) NOT NULL,
    payment_date DATE NOT NULL,
    payment_mode TEXT CHECK (payment_mode IN ('cash', 'card', 'bank_transfer', 'online', 'cheque')),
    reference_number TEXT,
    remarks TEXT,
    created_by UUID REFERENCES profiles(id),
    created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE payments ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Tenant Isolation: Payments" ON payments FOR ALL USING (school_id = (SELECT school_id FROM profiles WHERE id = auth.uid()));

-- Indexes
CREATE INDEX idx_invoices_student ON invoices(student_id);
CREATE INDEX idx_invoices_status ON invoices(status);
CREATE INDEX idx_payments_invoice ON payments(invoice_id);
