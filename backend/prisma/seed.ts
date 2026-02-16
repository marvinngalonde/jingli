import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
    console.log('🌱 Seeding database...');

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
            passwordHash: 'hashed_password_placeholder', // unique per auth provider
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

    console.log(`👨‍💼 Created Staff Profile for Admin`);

    // 4. Create Academic Year
    let academicYear = await prisma.academicYear.findFirst({
        where: {
            schoolId: school.id,
            name: '2024-2025'
        }
    });

    if (!academicYear) {
        academicYear = await prisma.academicYear.create({
            data: {
                schoolId: school.id,
                name: '2024-2025',
                startDate: new Date('2024-09-01'),
                endDate: new Date('2025-06-30'),
                current: true
            }
        });
    }

    console.log(`📅 Created Academic Year: ${academicYear.name}`);

    // 5. Create Class Levels (Grades 1-12)
    const classLevels = [];
    for (let i = 1; i <= 12; i++) {
        let classLevel = await prisma.classLevel.findFirst({
            where: {
                schoolId: school.id,
                level: i
            }
        });

        if (!classLevel) {
            classLevel = await prisma.classLevel.create({
                data: {
                    schoolId: school.id,
                    name: `Grade ${i}`,
                    level: i
                }
            });
        }
        classLevels.push(classLevel);
    }

    console.log(`🎓 Created ${classLevels.length} Class Levels (Grade 1-12)`);

    // 6. Create Class Sections (A, B for each grade)
    const sections = ['A', 'B'];
    let sectionCount = 0;
    for (const classLevel of classLevels) {
        for (const sectionName of sections) {
            const existing = await prisma.classSection.findFirst({
                where: {
                    schoolId: school.id,
                    classLevelId: classLevel.id,
                    name: sectionName
                }
            });

            if (!existing) {
                await prisma.classSection.create({
                    data: {
                        schoolId: school.id,
                        classLevelId: classLevel.id,
                        name: sectionName,
                        capacity: 30
                    }
                });
                sectionCount++;
            }
        }
    }

    console.log(`📚 Created ${sectionCount} Class Sections`);

    // 7. Create Core Subjects
    const subjectsData = [
        { name: 'Mathematics', code: 'MATH', department: 'Science' },
        { name: 'English Language', code: 'ENG', department: 'Languages' },
        { name: 'Science', code: 'SCI', department: 'Science' },
        { name: 'Social Studies', code: 'SOC', department: 'Humanities' },
        { name: 'Physical Education', code: 'PE', department: 'Sports' },
        { name: 'Computer Science', code: 'CS', department: 'Technology' },
        { name: 'Art & Design', code: 'ART', department: 'Arts' },
        { name: 'Music', code: 'MUS', department: 'Arts' },
    ];

    let subjectCount = 0;
    for (const subject of subjectsData) {
        const existing = await prisma.subject.findFirst({
            where: {
                schoolId: school.id,
                code: subject.code
            }
        });

        if (!existing) {
            await prisma.subject.create({
                data: {
                    schoolId: school.id,
                    name: subject.name,
                    code: subject.code,
                    department: subject.department
                }
            });
            subjectCount++;
        }
    }

    console.log(`📖 Created ${subjectCount} Subjects`);

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
