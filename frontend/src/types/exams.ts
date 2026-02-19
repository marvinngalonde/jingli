export interface ExamTerm {
    id: string;
    schoolId: string;
    name: string;
    startDate: string;
    endDate: string;
    academicYearId: string;
}

export interface Exam {
    id: string;
    schoolId: string;
    subjectId: string;
    classLevelId: string;
    termId: string;
    name: string;
    date: string;
    startTime: string;
    duration: number;
    maxMarks: number;
    subject?: {
        name: string;
        code: string;
    };
    classLevel?: {
        name: string;
    };
    term?: {
        name: string;
    };
}

export interface ExamResult {
    id: string;
    examId: string;
    studentId: string;
    marksObtained: number;
    remarks?: string;
    gradedBy: string;
    student?: {
        firstName: string;
        lastName: string;
        admissionNo: string;
    };
}

export interface CreateExamDto {
    subjectId: string;
    classLevelId: string;
    termId: string;
    name: string;
    date: Date;
    startTime: Date;
    duration: number;
    maxMarks: number;
}
