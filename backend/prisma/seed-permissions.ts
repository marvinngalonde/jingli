import { PrismaClient, UserRole } from '@prisma/client';

const prisma = new PrismaClient();

/**
 * All modules and their available actions.
 */
const MODULES: Record<string, string[]> = {
    dashboard: ['read'],
    students: ['read', 'write', 'delete'],
    staff: ['read', 'write', 'delete'],
    classes: ['read', 'write', 'delete'],
    subjects: ['read', 'write', 'delete'],
    academics: ['read', 'write', 'approve'],
    attendance: ['read', 'write'],
    exams: ['read', 'write', 'approve'],
    exam_results: ['read', 'write'],
    assignments: ['read', 'write'],
    timetable: ['read', 'write'],
    finance: ['read', 'write', 'approve'],
    invoices: ['read', 'write', 'delete'],
    transactions: ['read', 'write'],
    fee_structures: ['read', 'write'],
    library: ['read', 'write', 'delete'],
    visitors: ['read', 'write'],
    gate_passes: ['read', 'write'],
    reception: ['read', 'write'],
    notices: ['read', 'write'],
    messages: ['read', 'write'],
    reports: ['read', 'write', 'delete'],
    settings: ['read', 'write'],
    events: ['read', 'write', 'delete'],
    notifications: ['read', 'write'],
};

/**
 * RBAC Matrix: which roles get which module permissions.
 * SUPER_ADMIN and ADMIN get everything (handled in guard), so not listed here.
 */
const RBAC_MATRIX: Record<string, { modules: Record<string, string[]> }> = {
    SCHOOL_HEAD: {
        modules: {
            dashboard: ['read'],
            students: ['read'],
            staff: ['read'],
            classes: ['read'],
            subjects: ['read'],
            academics: ['read', 'approve'],
            attendance: ['read'],
            exams: ['read', 'approve'],
            exam_results: ['read'],
            assignments: ['read'],
            timetable: ['read'],
            finance: ['read', 'approve'],
            invoices: ['read'],
            transactions: ['read'],
            fee_structures: ['read'],
            library: ['read'],
            visitors: ['read'],
            gate_passes: ['read'],
            reception: ['read'],
            notices: ['read', 'write'],
            messages: ['read', 'write'],
            reports: ['read', 'write'],
            settings: ['read'],
            events: ['read', 'write'],
            notifications: ['read', 'write'],
        },
    },
    DEPUTY_HEAD: {
        modules: {
            dashboard: ['read'],
            students: ['read', 'write'],
            staff: ['read'],
            classes: ['read'],
            subjects: ['read'],
            academics: ['read'],
            attendance: ['read', 'write'],
            exams: ['read'],
            exam_results: ['read'],
            assignments: ['read'],
            timetable: ['read'],
            visitors: ['read', 'write'],
            gate_passes: ['read', 'write'],
            reception: ['read', 'write'],
            notices: ['read', 'write'],
            messages: ['read', 'write'],
            reports: ['read'],
            events: ['read', 'write'],
            notifications: ['read', 'write'],
        },
    },
    BURSAR: {
        modules: {
            dashboard: ['read'],
            students: ['read'],
            finance: ['read', 'write'],
            invoices: ['read', 'write', 'delete'],
            transactions: ['read', 'write'],
            fee_structures: ['read', 'write'],
            reports: ['read', 'write'],
            notices: ['read'],
            messages: ['read', 'write'],
            notifications: ['read', 'write'],
        },
    },
    HR_MANAGER: {
        modules: {
            dashboard: ['read'],
            staff: ['read', 'write', 'delete'],
            reports: ['read', 'write'],
            notices: ['read'],
            messages: ['read', 'write'],
            notifications: ['read', 'write'],
        },
    },
    SENIOR_CLERK: {
        modules: {
            dashboard: ['read'],
            students: ['read', 'write'],
            staff: ['read'],
            classes: ['read'],
            visitors: ['read', 'write'],
            gate_passes: ['read', 'write'],
            reception: ['read', 'write'],
            notices: ['read', 'write'],
            messages: ['read', 'write'],
            notifications: ['read', 'write'],
        },
    },
    HOD: {
        modules: {
            dashboard: ['read'],
            students: ['read'],
            staff: ['read'],
            classes: ['read'],
            subjects: ['read', 'write'],
            academics: ['read', 'write'],
            attendance: ['read'],
            exams: ['read', 'write'],
            exam_results: ['read', 'write'],
            assignments: ['read', 'write'],
            timetable: ['read', 'write'],
            reports: ['read', 'write'],
            notices: ['read', 'write'],
            messages: ['read', 'write'],
            notifications: ['read', 'write'],
        },
    },
    SENIOR_TEACHER: {
        modules: {
            dashboard: ['read'],
            students: ['read'],
            classes: ['read'],
            subjects: ['read'],
            academics: ['read', 'write'],
            attendance: ['read', 'write'],
            exams: ['read', 'write'],
            exam_results: ['read', 'write'],
            assignments: ['read', 'write'],
            timetable: ['read'],
            notices: ['read'],
            messages: ['read', 'write'],
            notifications: ['read', 'write'],
        },
    },
    CLASS_TEACHER: {
        modules: {
            dashboard: ['read'],
            students: ['read'],
            classes: ['read'],
            attendance: ['read', 'write'],
            exams: ['read'],
            exam_results: ['read'],
            assignments: ['read', 'write'],
            timetable: ['read'],
            notices: ['read'],
            messages: ['read', 'write'],
            notifications: ['read', 'write'],
        },
    },
    SUBJECT_TEACHER: {
        modules: {
            dashboard: ['read'],
            students: ['read'],
            classes: ['read'],
            attendance: ['read', 'write'],
            exams: ['read'],
            exam_results: ['read', 'write'],
            assignments: ['read', 'write'],
            timetable: ['read'],
            notices: ['read'],
            messages: ['read', 'write'],
            notifications: ['read', 'write'],
        },
    },
    SEN_COORDINATOR: {
        modules: {
            dashboard: ['read'],
            students: ['read', 'write'],
            attendance: ['read'],
            notices: ['read'],
            messages: ['read', 'write'],
            notifications: ['read', 'write'],
        },
    },
    LIBRARIAN: {
        modules: {
            dashboard: ['read'],
            library: ['read', 'write', 'delete'],
            notices: ['read'],
            messages: ['read', 'write'],
            notifications: ['read', 'write'],
        },
    },
    LAB_TECHNICIAN: {
        modules: {
            dashboard: ['read'],
            library: ['read', 'write'],
            notices: ['read'],
            messages: ['read', 'write'],
            notifications: ['read', 'write'],
        },
    },
    ICT_COORDINATOR: {
        modules: {
            dashboard: ['read'],
            settings: ['read', 'write'],
            reports: ['read'],
            notices: ['read'],
            messages: ['read', 'write'],
            notifications: ['read', 'write'],
        },
    },
    SCHOOL_NURSE: {
        modules: {
            dashboard: ['read'],
            students: ['read'],
            notices: ['read'],
            messages: ['read', 'write'],
            notifications: ['read', 'write'],
        },
    },
    SPORTS_DIRECTOR: {
        modules: {
            dashboard: ['read'],
            students: ['read'],
            events: ['read', 'write'],
            notices: ['read'],
            messages: ['read', 'write'],
            notifications: ['read', 'write'],
        },
    },
    SECURITY_GUARD: {
        modules: {
            visitors: ['read', 'write'],
            gate_passes: ['read', 'write'],
            notifications: ['read'],
        },
    },
    PARENT: {
        modules: {
            dashboard: ['read'],
            students: ['read'],
            attendance: ['read'],
            exams: ['read'],
            exam_results: ['read'],
            assignments: ['read'],
            timetable: ['read'],
            finance: ['read'],
            invoices: ['read'],
            notices: ['read'],
            messages: ['read', 'write'],
            notifications: ['read', 'write'],
            events: ['read'],
        },
    },
    STUDENT: {
        modules: {
            dashboard: ['read'],
            attendance: ['read'],
            exams: ['read'],
            exam_results: ['read'],
            assignments: ['read', 'write'],
            timetable: ['read'],
            notices: ['read'],
            messages: ['read', 'write'],
            notifications: ['read', 'write'],
            events: ['read'],
        },
    },
    SDC_MEMBER: {
        modules: {
            dashboard: ['read'],
            finance: ['read'],
            invoices: ['read'],
            reports: ['read'],
            notices: ['read'],
            events: ['read'],
        },
    },
};

async function seedPermissions() {
    console.log('🔐 Seeding permissions...');

    // 1. Create all permissions
    const permissionRecords: Record<string, string> = {};
    for (const [module, actions] of Object.entries(MODULES)) {
        for (const action of actions) {
            const perm = await prisma.permission.upsert({
                where: { module_action: { module, action } },
                update: {},
                create: {
                    module,
                    action,
                    description: `${action} access to ${module}`,
                },
            });
            permissionRecords[`${module}:${action}`] = perm.id;
        }
    }
    console.log(`  ✅ Created ${Object.keys(permissionRecords).length} permissions`);

    // 2. Assign permissions to roles
    let assignmentCount = 0;
    for (const [roleName, config] of Object.entries(RBAC_MATRIX)) {
        const role = roleName as UserRole;
        for (const [module, actions] of Object.entries(config.modules)) {
            for (const action of actions) {
                const key = `${module}:${action}`;
                const permId = permissionRecords[key];
                if (!permId) {
                    console.warn(`  ⚠️  Permission '${key}' not found, skipping for role ${roleName}`);
                    continue;
                }
                await prisma.rolePermission.upsert({
                    where: { role_permissionId: { role, permissionId: permId } },
                    update: {},
                    create: { role, permissionId: permId },
                });
                assignmentCount++;
            }
        }
    }
    console.log(`  ✅ Created ${assignmentCount} role-permission assignments`);
    console.log('🔐 Permission seeding complete!');
}

async function migrateExistingUsers() {
    console.log('👥 Migrating existing users to new roles...');

    const migrations = [
        { from: 'ADMIN' as UserRole, to: 'SUPER_ADMIN' as UserRole },
        { from: 'TEACHER' as UserRole, to: 'SUBJECT_TEACHER' as UserRole },
        { from: 'RECEPTION' as UserRole, to: 'SENIOR_CLERK' as UserRole },
        { from: 'FINANCE' as UserRole, to: 'BURSAR' as UserRole },
    ];

    for (const { from, to } of migrations) {
        const result = await prisma.user.updateMany({
            where: { role: from },
            data: { role: to },
        });
        if (result.count > 0) {
            console.log(`  ✅ Migrated ${result.count} users: ${from} → ${to}`);
        }
    }

    console.log('👥 User role migration complete!');
}

async function main() {
    try {
        await seedPermissions();
        await migrateExistingUsers();
    } catch (error) {
        console.error('❌ Seed error:', error);
        throw error;
    } finally {
        await prisma.$disconnect();
    }
}

main();
