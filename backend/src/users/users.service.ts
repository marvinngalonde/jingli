import { Injectable, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { SupabaseService } from '../supabase/supabase.service';

@Injectable()
export class UsersService {
    constructor(
        private readonly prisma: PrismaService,
        private readonly supabase: SupabaseService,
    ) { }

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

    async findAll(schoolId: string) {
        return this.prisma.user.findMany({
            where: { schoolId },
            include: {
                staffProfile: { select: { firstName: true, lastName: true, employeeId: true } },
                studentProfile: { select: { firstName: true, lastName: true, admissionNo: true } },
            },
            orderBy: { createdAt: 'desc' }
        });
    }

    async create(schoolId: string, data: { username: string; email: string; role: string; firstName: string; lastName: string; password?: string }) {
        const password = data.password || 'Temporary123!';

        // 1. Create User in Supabase Auth via Admin API
        const supabase = this.supabase.getClient();
        const { data: authUser, error: authError } = await supabase.auth.admin.createUser({
            email: data.email,
            password: password,
            email_confirm: true,
            user_metadata: {
                role: data.role,
                username: data.username,
                firstName: data.firstName,
                lastName: data.lastName,
                schoolId: schoolId,
            }
        });

        if (authError) {
            console.error('Supabase Auth Creation Error:', authError);
            throw new BadRequestException(`Auth creation failed: ${authError.message}`);
        }

        const supabaseUid = authUser.user.id;

        // 2. Create in Local DB
        try {
            return await this.prisma.$transaction(async (tx) => {
                const user = await tx.user.create({
                    data: {
                        username: data.username,
                        email: data.email,
                        role: data.role as any,
                        schoolId: schoolId,
                        status: 'ACTIVE',
                        supabaseUid: supabaseUid,
                        passwordHash: 'SUPABASE_MANAGED',
                    }
                });

                // Create Profile
                if (['ADMIN', 'TEACHER', 'RECEPTION', 'FINANCE'].includes(data.role)) {
                    await tx.staff.create({
                        data: {
                            userId: user.id,
                            schoolId: schoolId,
                            firstName: data.firstName,
                            lastName: data.lastName,
                            employeeId: `EMP-${Date.now()}`,
                            designation: data.role === 'ADMIN' ? 'Administrator' : 'Staff',
                            department: 'General',
                            joinDate: new Date(),
                        }
                    });
                } else if (data.role === 'STUDENT') {
                    const section = await tx.classSection.findFirst({ where: { schoolId } });
                    await tx.student.create({
                        data: {
                            userId: user.id,
                            schoolId: schoolId,
                            firstName: data.firstName,
                            lastName: data.lastName,
                            admissionNo: `ADM-${Date.now()}`,
                            sectionId: section?.id || '',
                            enrollmentDate: new Date(),
                        }
                    });
                }

                return user;
            });
        } catch (error) {
            // Cleanup Supabase user if local DB fails
            await supabase.auth.admin.deleteUser(supabaseUid);
            throw error;
        }
    }

    async update(userId: string, data: { username?: string; email?: string; role?: string; firstName?: string; lastName?: string; password?: string }) {
        const user = await this.prisma.user.findUnique({
            where: { id: userId },
            include: { staffProfile: true, studentProfile: true }
        });

        if (!user) throw new BadRequestException('User not found');

        // 1. Update Supabase Auth if needed
        if (user.supabaseUid && (data.email || data.password || data.username || data.firstName || data.lastName)) {
            const supabase = this.supabase.getClient();
            const updateData: any = {};
            if (data.email) updateData.email = data.email;
            if (data.password) updateData.password = data.password;

            const metadata: any = { ...user.staffProfile, ...user.studentProfile }; // Current metadata
            if (data.username) metadata.username = data.username;
            if (data.firstName) metadata.firstName = data.firstName;
            if (data.lastName) metadata.lastName = data.lastName;
            if (data.role) metadata.role = data.role;

            updateData.user_metadata = metadata;

            const { error: authError } = await supabase.auth.admin.updateUserById(user.supabaseUid, updateData);
            if (authError) throw new BadRequestException(`Auth update failed: ${authError.message}`);
        }

        // 2. Update Local DB
        return await this.prisma.$transaction(async (tx) => {
            const updatedUser = await tx.user.update({
                where: { id: userId },
                data: {
                    username: data.username,
                    email: data.email,
                    role: data.role as any,
                }
            });

            // Update Profile
            if (user.staffProfile && (data.firstName || data.lastName)) {
                await tx.staff.update({
                    where: { id: user.staffProfile.id },
                    data: {
                        firstName: data.firstName,
                        lastName: data.lastName,
                    }
                });
            } else if (user.studentProfile && (data.firstName || data.lastName)) {
                await tx.student.update({
                    where: { id: user.studentProfile.id },
                    data: {
                        firstName: data.firstName,
                        lastName: data.lastName,
                    }
                });
            }

            return updatedUser;
        });
    }

    async remove(userId: string) {
        // Profiles are deleted via Cascade in many setups, but let's be safe or check schema
        // According to schema.prisma, profiles have fields: userId String @unique.
        return this.prisma.user.delete({
            where: { id: userId }
        });
    }
}
