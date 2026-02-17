import type { ClassSection } from './academics';

export interface Student {
    id: string;
    schoolId: string;
    userId: string;
    admissionNo: string;
    rollNo?: string;
    firstName: string;
    lastName: string;
    sectionId: string;
    enrollmentDate: string;
    dob?: string;
    gender: 'MALE' | 'FEMALE' | 'OTHER';
    address?: string;
    status?: 'ACTIVE' | 'INACTIVE' | 'SUSPENDED' | 'GRADUATED' | 'TRANSFERRED';
    photoUrl?: string; // Not in backend DTO yet, but useful for UI

    // Relations
    section?: ClassSection;
    user?: {
        email: string;
        // status: string; // User status might differ from Student status
    };
    guardians?: {
        id: string;
        relation: string;
        guardian: {
            id: string;
            firstName: string;
            lastName: string;
            email: string;
            phone: string;
        }
    }[];
}

export type Gender = 'MALE' | 'FEMALE' | 'OTHER';

export interface CreateStudentDto {
    admissionNo: string;
    rollNo?: string;
    firstName: string;
    lastName: string;
    sectionId: string;
    enrollmentDate: string; // ISO date string
    dob?: string; // ISO date string
    gender: Gender;
    address?: string;
    email?: string; // For creating the User account
}

export interface UpdateStudentDto extends Partial<CreateStudentDto> { }
