import { PrismaClient } from '@prisma/client';
import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';

dotenv.config();

const prisma = new PrismaClient();
const supabaseUrl = process.env.SUPABASE_URL || '';
const supabaseKey = process.env.SUPABASE_KEY || '';
const supabase = createClient(supabaseUrl, supabaseKey);

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
    const adminEmail = 'admin@school.com'; // Updated email
    const adminPassword = 'Password123!';
    let supabaseUid = 'admin-123';

    try {
        const { data: { users }, error: listError } = await supabase.auth.admin.listUsers();
        let authUser = users?.find((u: any) => u.email === adminEmail);

        if (!authUser) {
            const { data, error } = await supabase.auth.admin.createUser({
                email: adminEmail,
                password: adminPassword,
                email_confirm: true,
                user_metadata: {
                    role: 'ADMIN',
                    username: 'admin',
                    firstName: 'System',
                    lastName: 'Admin'
                }
            });
            if (error) throw error;
            authUser = data.user;
            console.log('🔒 Created Admin in Supabase Auth');
        } else {
            // Update password just in case
            await supabase.auth.admin.updateUserById(authUser.id, { password: adminPassword });
            console.log('🔒 Updated Admin password in Supabase Auth');
        }
        supabaseUid = authUser.id;
    } catch (e) {
        console.error('Error with Supabase Auth:', e);
    }

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
            supabaseUid: supabaseUid,
            username: 'admin',
            email: adminEmail,
            passwordHash: 'SUPABASE_MANAGED',
            role: 'ADMIN',
            status: 'ACTIVE',
            avatarUrl: 'https://ui-avatars.com/api/?name=System+Admin'
        }
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
