// Academic Module Types
export interface AcademicYear {
    id: string;
    schoolId: string;
    name: string;
    startDate: string;
    endDate: string;
    current: boolean;
}

export interface ClassLevel {
    id: string;
    schoolId: string;
    name: string;
    level: number;
    sections?: ClassSection[];
}

export interface ClassSection {
    id: string;
    schoolId: string;
    classLevelId: string;
    name: string;
    capacity: number;
    classTeacherId?: string;
    classLevel?: ClassLevel;
    _count?: {
        students: number;
    };
}

export interface Subject {
    id: string;
    schoolId: string;
    name: string;
    code: string;
    department?: string;
}

// DTOs
export interface CreateClassLevelDto {
    name: string;
    level: number;
}

export interface CreateClassSectionDto {
    classLevelId: string;
    name: string;
    capacity?: number;
    classTeacherId?: string;
}

export interface CreateSubjectDto {
    name: string;
    code: string;
    department?: string;
}

export interface CreateAcademicYearDto {
    name: string;
    startDate: string;
    endDate: string;
    current?: boolean;
}

// Timetable Types
export type DayOfWeek = 'MON' | 'TUE' | 'WED' | 'THU' | 'FRI' | 'SAT' | 'SUN';

export interface TimetableEntry {
    id: string;
    sectionId: string;
    subjectId: string;
    teacherId: string;
    day: DayOfWeek;
    startTime: string;
    endTime: string;
    roomNo?: string;
    subject?: Subject;
    section?: ClassSection;
    teacher?: any; // Ideally Teacher interface
}

export interface CreateTimetableDto {
    sectionId: string;
    subjectId: string;
    teacherId: string;
    day: DayOfWeek;
    startTime: string;
    endTime: string;
    roomNo?: string;
}

export interface BulkCreateTimetableDto {
    entries: CreateTimetableDto[];
}
