import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class UsersService {
    constructor(private readonly prisma: PrismaService) { }

    async findMe(userId: string) {
        // 1. Fetch User with basic info
        const user = await this.prisma.user.findUnique({
            where: { id: userId },
            select: {
                id: true,
                email: true,
                role: true,
                schoolId: true,
                supabaseUid: true,
            },
        });

        if (!user) return null;

        // 2. Fetch associated profile based on Role
        let profile = null;

        switch (user.role) {
            case 'STUDENT':
                profile = await this.prisma.student.findFirst({
                    where: { userId: user.id },
                    include: { section: { include: { classLevel: true } } },
                });
                break;
            case 'TEACHER':
            case 'ADMIN': // Admin might also be Staff? For now assume Staff table.
            case 'RECEPTION':
                profile = await this.prisma.staff.findFirst({
                    where: { userId: user.id },
                });
                break;
            case 'PARENT':
                profile = await this.prisma.guardian.findUnique({
                    where: { userId: user.id },
                    include: { students: { include: { student: true } } }
                });
                break;
        }

        return {
            ...user,
            profile,
        };
    }
}
