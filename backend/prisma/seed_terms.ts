import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
    const schoolId = '11111111-1111-1111-1111-111111111111'; // Default Tenant

    // Get current academic year
    const currentYear = await prisma.academicYear.findFirst({
        where: { schoolId, current: true }
    });

    if (!currentYear) {
        console.error('No active academic year found. Please seed academic years first.');
        return;
    }

    const terms = [
        { name: 'Term 1', startDate: new Date('2024-09-01'), endDate: new Date('2024-12-15') },
        { name: 'Term 2', startDate: new Date('2025-01-05'), endDate: new Date('2025-03-30') },
        { name: 'Finals', startDate: new Date('2025-04-15'), endDate: new Date('2025-06-30') },
    ];

    for (const term of terms) {
        await prisma.examTerm.create({
            data: {
                schoolId,
                academicYearId: currentYear.id,
                ...term
            }
        });
        console.log(`Created term: ${term.name}`);
    }
}

main()
    .catch((e) => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
