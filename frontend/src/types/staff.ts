export interface Staff {
    id: string;
    schoolId: string;
    userId: string;
    employeeId: string;
    firstName: string;
    lastName: string;
    designation: string;
    department: string;
    joinDate: string; // ISO Date
    phone?: string;

    // Relations
    user?: {
        email: string;
        role: string;
        status: string;
    };
}

export interface CreateStaffDto {
    employeeId: string;
    firstName: string;
    lastName: string;
    email: string; // Used to create User
    designation: string;
    department: string;
    joinDate: string; // ISO Date
    phone?: string;
}

export interface UpdateStaffDto extends Partial<CreateStaffDto> { }
