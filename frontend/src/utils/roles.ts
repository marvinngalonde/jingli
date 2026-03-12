/**
 * Role helper utilities for the Jingli frontend.
 * Maps the expanded Zimbabwean UserRole enum to logical groups
 * for UI routing, navigation filtering, and access control.
 */

// All roles that should route to the main admin dashboard
export const ADMIN_ROLES = [
    'SUPER_ADMIN', 'ADMIN',
    'SCHOOL_HEAD', 'DEPUTY_HEAD',
    'BURSAR', 'FINANCE',
    'HR_MANAGER',
    'SENIOR_CLERK', 'RECEPTION',
    'HOD',
    'ICT_COORDINATOR',
    'SDC_MEMBER',
];

// All roles that should route to the teacher portal
export const TEACHER_ROLES = [
    'SUBJECT_TEACHER', 'TEACHER',
    'SENIOR_TEACHER',
    'CLASS_TEACHER',
    'SEN_COORDINATOR',
];

// Specialist/support staff who use the admin dashboard but with limited access
export const SPECIALIST_ROLES = [
    'LIBRARIAN',
    'LAB_TECHNICIAN',
    'SCHOOL_NURSE',
    'SPORTS_DIRECTOR',
    'HOSTEL_WARDEN',
    'TRANSPORT_MANAGER',
    'SECURITY_GUARD',
];

// All staff-like roles (everyone except STUDENT, PARENT)
export const ALL_STAFF_ROLES = [...ADMIN_ROLES, ...TEACHER_ROLES, ...SPECIALIST_ROLES];

/**
 * Determines the default dashboard path for a given role.
 */
export function getDashboardPath(role: string): string {
    const upper = role?.toUpperCase() || '';

    if (upper === 'SYSTEM_ADMIN') {
        return '/system-admin';
    }
    if (TEACHER_ROLES.map(r => r.toUpperCase()).includes(upper)) {
        return '/teacher/dashboard';
    }
    if (upper === 'STUDENT') {
        return '/student/dashboard';
    }
    if (upper === 'PARENT') {
        return '/parent/dashboard';
    }

    // Specialist Roles specific dashboards
    if (upper === 'LIBRARIAN') return '/dashboard/library';
    if (upper === 'SECURITY_GUARD') return '/dashboard/security';
    if (upper === 'SCHOOL_NURSE') return '/dashboard/clinic';
    if (upper === 'HOSTEL_WARDEN') return '/dashboard/hostel';

    // All admin and remaining specialist roles go to main dashboard
    return '/dashboard';
}

/**
 * Checks if a role is considered a "teacher" role for UI purposes.
 */
export function isTeacherRole(role: string): boolean {
    return TEACHER_ROLES.map(r => r.toUpperCase()).includes(role?.toUpperCase() || '');
}

/**
 * Checks if a role is considered an "admin" role (full dashboard access).
 */
export function isAdminRole(role: string): boolean {
    return ADMIN_ROLES.map(r => r.toUpperCase()).includes(role?.toUpperCase() || '');
}

/**
 * Checks if a role has write access to a given module.
 * This is a frontend-only hint — the backend enforces actual permissions.
 */
export function canWrite(role: string, module: string): boolean {
    const upper = role?.toUpperCase() || '';

    // Super admins can always write
    if (upper === 'SUPER_ADMIN' || upper === 'ADMIN') return true;

    // Simple heuristic mappings for common UI checks
    const WRITE_MAP: Record<string, string[]> = {
        finance: ['BURSAR', 'FINANCE'],
        students: ['SENIOR_CLERK', 'RECEPTION', 'DEPUTY_HEAD', 'SEN_COORDINATOR'],
        staff: ['HR_MANAGER'],
        academics: ['HOD', 'SENIOR_TEACHER'],
        attendance: ['CLASS_TEACHER', 'SUBJECT_TEACHER', 'TEACHER', 'SENIOR_TEACHER'],
        exams: ['HOD', 'SENIOR_TEACHER'],
        exam_results: ['SUBJECT_TEACHER', 'TEACHER', 'HOD', 'SENIOR_TEACHER'],
        assignments: ['CLASS_TEACHER', 'SUBJECT_TEACHER', 'TEACHER', 'SENIOR_TEACHER'],
        library: ['LIBRARIAN'],
        visitors: ['SECURITY_GUARD', 'SENIOR_CLERK', 'RECEPTION', 'DEPUTY_HEAD'],
        notices: ['SCHOOL_HEAD', 'DEPUTY_HEAD', 'HOD', 'SENIOR_CLERK', 'RECEPTION'],
        settings: ['ICT_COORDINATOR'],
        events: ['SCHOOL_HEAD', 'DEPUTY_HEAD', 'SPORTS_DIRECTOR'],
    };

    return WRITE_MAP[module]?.includes(upper) || false;
}
