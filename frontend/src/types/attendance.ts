export const AttendanceStatus = {
    PRESENT: 'PRESENT',
    ABSENT: 'ABSENT',
    LATE: 'LATE',
    EXCUSED: 'EXCUSED'
} as const;

export type AttendanceStatus = typeof AttendanceStatus[keyof typeof AttendanceStatus];

export interface AttendanceRecord {
    id: string;
    studentId: string;
    sectionId: string;
    date: string; // ISO date string
    status: AttendanceStatus;
    remarks?: string;
    recordedBy: string;
    student?: {
        id: string;
        firstName: string;
        lastName: string;
        admissionNo: string;
    };
}

export interface CreateAttendanceDto {
    studentId: string;
    date: Date;
    status: AttendanceStatus;
    remarks?: string;
    recordedBy: string; // user ID
}

export interface BulkCreateAttendanceDto {
    sectionId: string;
    date: Date;
    records: {
        studentId: string;
        status: AttendanceStatus;
        remarks?: string;
    }[];
}
