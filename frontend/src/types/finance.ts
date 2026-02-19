export enum FeeFrequency {
    MONTHLY = 'MONTHLY',
    TERM = 'TERM',
    ANNUAL = 'ANNUAL',
    ONE_TIME = 'ONE_TIME',
}

export enum InvoiceStatus {
    PENDING = 'PENDING',
    PARTIAL = 'PARTIAL',
    PAID = 'PAID',
    OVERDUE = 'OVERDUE',
}

export interface FeeHead {
    id: string;
    schoolId: string;
    name: string;
    type: string; // 'RECURRING' | 'ONE_TIME'
}

export interface FeeStructureItem {
    id: string;
    feeStructureId: string;
    feeHeadId: string;
    amount: number;
    head?: FeeHead;
}

export interface FeeStructure {
    id: string;
    schoolId: string;
    academicYearId: string;
    classLevelId: string;
    feeHeadId?: string;
    name: string;
    amount: number;
    frequency: FeeFrequency;

    // Relations
    items?: FeeStructureItem[];
    feeHead?: FeeHead;
    classLevel?: { id: string; name: string };
    academicYear?: { id: string; name: string };
}

export interface Transaction {
    id: string;
    schoolId: string;
    invoiceId: string;
    amount: number;
    method: 'CASH' | 'CARD' | 'ONLINE' | 'CHEQUE';
    date: string;
    referenceNo?: string;
    collectedBy: string;
}

export interface Invoice {
    id: string;
    schoolId: string;
    studentId: string;
    feeStructureId?: string;
    amount: number;
    dueDate: string;
    status: InvoiceStatus;
    issueDate: string;

    // Relations
    student?: { id: string; firstName: string; lastName: string; admissionNo: string };
    feeStructure?: FeeStructure;
    transactions?: Transaction[];
}

export interface CreateFeeHeadDto {
    name: string;
    type: string;
}

export interface CreateFeeStructureDto {
    name: string;
    academicYearId: string;
    classLevelId: string;
    feeHeadId?: string;
    amount: number;
    frequency: FeeFrequency;
    items?: { feeHeadId: string; amount: number }[];
}

export interface CreateFeeStructureDto {
    name: string;
    academicYearId: string;
    classLevelId: string;
    feeHeadId?: string;
    amount: number;
    frequency: FeeFrequency;
    items?: { feeHeadId: string; amount: number }[];
}
