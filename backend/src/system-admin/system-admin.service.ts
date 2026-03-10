import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { UserRole } from '@prisma/client';

@Injectable()
export class SystemAdminService {
    constructor(private readonly prisma: PrismaService) { }

    async getStats() {
        const now = new Date();
        const startOfThisMonth = new Date(now.getFullYear(), now.getMonth(), 1);
        const startOfLastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);

        const [
            totalSchools, totalStudents, totalStaff, totalUsers,
            newSchoolsThisMonth, newSchoolsLastMonth,
            newStudentsThisMonth, newStudentsLastMonth,
        ] = await Promise.all([
            this.prisma.school.count(),
            this.prisma.student.count(),
            this.prisma.staff.count(),
            this.prisma.user.count(),
            this.prisma.school.count({ where: { createdAt: { gte: startOfThisMonth } } }),
            this.prisma.school.count({ where: { createdAt: { gte: startOfLastMonth, lt: startOfThisMonth } } }),
            // Use User creation date as a proxy for student growth (students correspond to users created that month)
            this.prisma.user.count({ where: { role: 'STUDENT', createdAt: { gte: startOfThisMonth } } }),
            this.prisma.user.count({ where: { role: 'STUDENT', createdAt: { gte: startOfLastMonth, lt: startOfThisMonth } } }),
        ]);

        const pct = (current: number, prev: number) =>
            prev === 0 ? null : Math.round(((current - prev) / prev) * 100);

        // 6-month school growth
        const sixMonthsAgo = new Date(now.getFullYear(), now.getMonth() - 5, 1);
        const monthlySchoolGrowthRaw = await this.prisma.$queryRaw<{ month: string; count: bigint }[]>`
            SELECT TO_CHAR(DATE_TRUNC('month', created_at), 'Mon YY') as month,
                   COUNT(*) as count
            FROM schools
            WHERE created_at >= ${sixMonthsAgo}
            GROUP BY DATE_TRUNC('month', created_at)
            ORDER BY DATE_TRUNC('month', created_at)
        `;

        const monthlyStudentGrowthRaw = await this.prisma.$queryRaw<{ month: string; count: bigint }[]>`
            SELECT TO_CHAR(DATE_TRUNC('month', u.created_at), 'Mon YY') as month,
                   COUNT(*) as count
            FROM users u
            WHERE u.created_at >= ${sixMonthsAgo} AND u.role = 'STUDENT'
            GROUP BY DATE_TRUNC('month', u.created_at)
            ORDER BY DATE_TRUNC('month', u.created_at)
        `;

        // Count active vs suspended
        const [activeSchools, suspendedSchools] = await Promise.all([
            this.prisma.school.count({ where: { status: 'ACTIVE' } }),
            this.prisma.school.count({ where: { status: 'SUSPENDED' } }),
        ]);

        return {
            totalSchools,
            totalStudents,
            totalStaff,
            totalUsers,
            activeSchools,
            suspendedSchools,
            newSchoolsThisMonth,
            newStudentsThisMonth,
            schoolsGrowthPct: pct(newSchoolsThisMonth, newSchoolsLastMonth),
            studentsGrowthPct: pct(newStudentsThisMonth, newStudentsLastMonth),
            monthlySchoolGrowth: monthlySchoolGrowthRaw.map(r => ({ month: r.month, count: Number(r.count) })),
            monthlyStudentGrowth: monthlyStudentGrowthRaw.map(r => ({ month: r.month, count: Number(r.count) })),
        };
    }

    async getSchools(page = 1, pageSize = 20, search = '') {
        const skip = (page - 1) * pageSize;
        const where: any = search
            ? { OR: [{ name: { contains: search, mode: 'insensitive' } }, { subdomain: { contains: search, mode: 'insensitive' } }] }
            : {};

        const [schools, total] = await Promise.all([
            this.prisma.school.findMany({
                where,
                orderBy: { createdAt: 'desc' },
                skip,
                take: pageSize,
                include: { _count: { select: { students: true, staff: true, users: true } } }
            }),
            this.prisma.school.count({ where }),
        ]);

        return { data: schools, total, page, pageSize, totalPages: Math.ceil(total / pageSize) };
    }

    async toggleSchoolStatus(id: string, status: 'ACTIVE' | 'SUSPENDED') {
        const school = await this.prisma.school.findUnique({ where: { id } });
        if (!school) throw new NotFoundException('School not found');
        return this.prisma.school.update({ where: { id }, data: { status: status as any } });
    }

    async toggleAiEnabled(id: string, aiEnabled: boolean) {
        const school = await this.prisma.school.findUnique({ where: { id } });
        if (!school) throw new NotFoundException('School not found');
        return this.prisma.school.update({ where: { id }, data: { aiEnabled } });
    }

    async getGlobalUsers(page = 1, pageSize = 25, search = '') {
        const skip = (page - 1) * pageSize;
        const where: any = search
            ? { OR: [{ username: { contains: search, mode: 'insensitive' } }, { email: { contains: search, mode: 'insensitive' } }] }
            : {};

        const [users, total] = await Promise.all([
            this.prisma.user.findMany({
                where,
                orderBy: { createdAt: 'desc' },
                skip,
                take: pageSize,
                select: {
                    id: true, username: true, email: true, role: true,
                    status: true, createdAt: true, lastLogin: true,
                    school: { select: { id: true, name: true, subdomain: true } },
                }
            }),
            this.prisma.user.count({ where }),
        ]);

        return { data: users, total, page, pageSize, totalPages: Math.ceil(total / pageSize) };
    }

    async bootstrapAdmin(email: string) {
        const user = await this.prisma.user.findFirst({ where: { email } });
        if (!user) throw new NotFoundException(`User with email ${email} not found.`);
        return this.prisma.user.update({
            where: { id: user.id },
            data: { role: UserRole.SYSTEM_ADMIN, schoolId: null } as any
        });
    }
}
