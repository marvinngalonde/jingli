const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function main() {
    console.log('🌱 Seeding database (JS)...');

    // 1. Create Default School
    const school = await prisma.school.upsert({
        where: { subdomain: 'demo' },
        update: {},
        create: {
            name: 'Demo International School',
            subdomain: 'demo',
            logoUrl: 'https://placehold.co/200x200.png',
            config: {
                theme: 'blue',
                modules: ['ACADEMIC', 'FINANCE', 'RECEPTION']
            }
        },
    });

    console.log(`🏫 Created School: ${school.name} (${school.id})`);

    // 2. Create Admin User
    const adminEmail = 'admin@demo.com';
    // Use a query to check for existence first to avoid complex upsert if nested fields vary
    // But upsert is fine with composite key logic if defined specificially.
    // Our schema defines @@unique([schoolId, email]) for User.
    // But upsert requires a unique identifier.
    // The Prisma generated client for @@unique uses composed input.

    const adminUser = await prisma.user.upsert({
        where: {
            schoolId_email: {
                schoolId: school.id,
                email: adminEmail
            }
        },
        update: {},
        create: {
            schoolId: school.id,
            email: adminEmail,
            passwordHash: 'hashed_password_placeholder',
            role: 'ADMIN',
            status: 'ACTIVE',
            avatarUrl: 'https://i.pravatar.cc/150?u=admin'
        },
    });

    console.log(`👤 Created Admin: ${adminUser.email} (${adminUser.id})`);

    // 3. Create Generic Staff Profile for Admin
    await prisma.staff.upsert({
        where: {
            schoolId_employeeId: {
                schoolId: school.id,
                employeeId: 'EMP-001'
            }
        },
        update: {},
        create: {
            schoolId: school.id,
            userId: adminUser.id,
            employeeId: 'EMP-001',
            firstName: 'System',
            lastName: 'Admin',
            designation: 'Super Admin',
            department: 'IT',
            joinDate: new Date(),
        }
    });

    console.log(`✅ Seeding complete!`);
}

main()
    .catch((e) => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
