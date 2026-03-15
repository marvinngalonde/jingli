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
                username: true,
                school: {
                    select: {
                        name: true,
                        config: true,
                        logoUrl: true,
                        aiEnabled: true,
                    }
                }
            },
        });

        if (!user) return null;

        // 2. Fetch associated profile based on Role
        let profile = null;

        const STAFF_ROLES = [
            'SUPER_ADMIN', 'ADMIN', 'SCHOOL_HEAD', 'DEPUTY_HEAD',
            'TEACHER', 'SUBJECT_TEACHER', 'SENIOR_TEACHER', 'CLASS_TEACHER',
            'HOD', 'SEN_COORDINATOR',
            'BURSAR', 'FINANCE', 'HR_MANAGER', 'SENIOR_CLERK', 'RECEPTION',
            'ICT_COORDINATOR', 'SDC_MEMBER',
            'LIBRARIAN', 'LAB_TECHNICIAN', 'SCHOOL_NURSE', 'SPORTS_DIRECTOR',
            'HOSTEL_WARDEN', 'TRANSPORT_MANAGER', 'SECURITY_GUARD',
        ];

        if (user.role === 'STUDENT') {
            profile = await this.prisma.student.findFirst({
                where: { userId: user.id },
                include: { section: { include: { classLevel: true } } },
            });
        } else if (user.role === 'PARENT') {
            profile = await this.prisma.guardian.findUnique({
                where: { userId: user.id },
                include: { students: { include: { student: true } } }
            });
        } else if (STAFF_ROLES.includes(user.role)) {
            profile = await this.prisma.staff.findFirst({
                where: { userId: user.id },
            });
        }

        // Update last login (fire and forget)
        this.prisma.user.update({
            where: { id: userId },
            data: { lastLogin: new Date() }
        }).catch(err => console.error('Failed to update last login:', err));

        return {
            ...user,
            profile,
            username: user.username,
        };
    }

    async updateUsername(userId: string, username: string) {
        // Check for duplicates
        const existing = await this.prisma.user.findFirst({
            where: { username, id: { not: userId } }
        });
        if (existing) {
            throw new BadRequestException('Username is already taken');
        }

        return this.prisma.user.update({
            where: { id: userId },
            data: { username }
        });
    }

    async findAll(schoolId: string, page = 1, limit = 7, includeInactive = false) {
        const skip = (page - 1) * limit;
        const where: any = {
            schoolId,
            ...(!includeInactive ? { status: 'ACTIVE' } : {}),
        };

        const [data, total] = await Promise.all([
            this.prisma.user.findMany({
                where,
                skip,
                take: limit,
                include: {
                    staffProfile: { select: { firstName: true, lastName: true, employeeId: true } },
                    studentProfile: { select: { firstName: true, lastName: true, admissionNo: true } },
                    guardianProfile: { select: { firstName: true, lastName: true, students: { select: { studentId: true } } } },
                },
                orderBy: { createdAt: 'desc' }
            }),
            this.prisma.user.count({ where })
        ]);

        return {
            data,
            total,
            page,
            pageSize: limit,
            totalPages: Math.ceil(total / limit)
        };
    }

    async getStats(schoolId: string) {
        const [total, admins, teachers, students, active, inactive] = await Promise.all([
            this.prisma.user.count({ where: { schoolId, status: 'ACTIVE' } }),
            this.prisma.user.count({ where: { schoolId, status: 'ACTIVE', role: 'ADMIN' } }),
            this.prisma.user.count({ where: { schoolId, status: 'ACTIVE', role: 'TEACHER' } }),
            this.prisma.user.count({ where: { schoolId, status: 'ACTIVE', role: 'STUDENT' } }),
            this.prisma.user.count({ where: { schoolId, status: 'ACTIVE' } }),
            this.prisma.user.count({ where: { schoolId, status: 'INACTIVE' } }),
        ]);

        return { total, admins, teachers, students, active, inactive };
    }

    async create(
        schoolId: string,
        data: {
            username: string;
            email: string;
            role: string;
            firstName: string;
            lastName: string;
            password?: string;
            studentIds?: string[];
        }
    ) {
        const password = data.password || 'Temporary123!';

        // 0. Check for duplicate username within the same school
        const existingUser = await this.prisma.user.findFirst({
            where: { schoolId, username: data.username }
        });
        if (existingUser) {
            throw new BadRequestException(`The username "${data.username}" is already taken. Please choose a different username.`);
        }

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

                const STAFF_ROLES_FOR_PROFILE = [
                    'SUPER_ADMIN', 'ADMIN', 'SCHOOL_HEAD', 'DEPUTY_HEAD',
                    'TEACHER', 'SUBJECT_TEACHER', 'SENIOR_TEACHER', 'CLASS_TEACHER',
                    'HOD', 'SEN_COORDINATOR',
                    'BURSAR', 'FINANCE', 'HR_MANAGER', 'SENIOR_CLERK', 'RECEPTION',
                    'ICT_COORDINATOR', 'SDC_MEMBER',
                    'LIBRARIAN', 'LAB_TECHNICIAN', 'SCHOOL_NURSE', 'SPORTS_DIRECTOR',
                    'HOSTEL_WARDEN', 'TRANSPORT_MANAGER', 'SECURITY_GUARD',
                ];

                // Create Profile
                if (STAFF_ROLES_FOR_PROFILE.includes(data.role)) {
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

                    if (!section) {
                        throw new BadRequestException('Cannot create student: No class sections exist for this school. Please create a Class and Section first.');
                    }

                    await tx.student.create({
                        data: {
                            userId: user.id,
                            schoolId: schoolId,
                            firstName: data.firstName,
                            lastName: data.lastName,
                            admissionNo: `ADM-${Date.now()}`,
                            sectionId: section.id,
                            enrollmentDate: new Date(),
                        }
                    });
                } else if (data.role === 'PARENT') {
                    const guardian = await tx.guardian.create({
                        data: {
                            userId: user.id,
                            schoolId: schoolId,
                            firstName: data.firstName,
                            lastName: data.lastName,
                            relationship: 'Parent/Guardian',
                        }
                    });

                    // Link students if provided
                    if (data.studentIds && data.studentIds.length > 0) {
                        for (const studentId of data.studentIds) {
                            await tx.studentGuardian.create({
                                data: {
                                    studentId: studentId,
                                    guardianId: guardian.id,
                                    isPrimary: true, // Default to primary when linked on creation
                                }
                            });
                        }
                    }
                }

                return user;
            });
        } catch (error) {
            // Cleanup Supabase user if local DB fails
            await supabase.auth.admin.deleteUser(supabaseUid);
            throw error;
        }
    }

    async update(userId: string, data: { username?: string; email?: string; role?: string; firstName?: string; lastName?: string; password?: string; studentIds?: string[] }) {
        const user = await this.prisma.user.findUnique({
            where: { id: userId },
            include: { staffProfile: true, studentProfile: true, guardianProfile: true }
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
            } else if (user.guardianProfile) {
                if (data.firstName || data.lastName) {
                    await tx.guardian.update({
                        where: { id: user.guardianProfile.id },
                        data: {
                            firstName: data.firstName,
                            lastName: data.lastName,
                        }
                    });
                }

                if (data.studentIds !== undefined) {
                    // Delete existing links
                    await tx.studentGuardian.deleteMany({
                        where: { guardianId: user.guardianProfile.id }
                    });

                    // Create new links
                    if (data.studentIds.length > 0) {
                        for (const studentId of data.studentIds) {
                            await tx.studentGuardian.create({
                                data: {
                                    studentId: studentId,
                                    guardianId: user.guardianProfile.id,
                                    isPrimary: true,
                                }
                            });
                        }
                    }
                }
            }

            return updatedUser;
        });
    }

    async remove(userId: string) {
        const user = await this.prisma.user.findUnique({
            where: { id: userId },
        });

        if (!user) throw new BadRequestException('User not found');

        // Soft delete — mark as INACTIVE
        await this.prisma.user.update({
            where: { id: userId },
            data: { status: 'INACTIVE' },
        });

        // Disable Supabase Auth (ban the user so they can't log in)
        if (user.supabaseUid) {
            try {
                const supabase = this.supabase.getClient();
                await supabase.auth.admin.updateUserById(user.supabaseUid, {
                    ban_duration: '876000h', // ~100 years = effectively permanent
                });
            } catch (err) {
                console.warn(`Could not disable Supabase auth for ${user.supabaseUid}:`, err);
            }
        }

        return { success: true, message: 'User deactivated (soft delete)' };
    }

    async restore(userId: string) {
        const user = await this.prisma.user.findUnique({
            where: { id: userId },
        });

        if (!user) throw new BadRequestException('User not found');

        // Reactivate
        await this.prisma.user.update({
            where: { id: userId },
            data: { status: 'ACTIVE' },
        });

        // Re-enable Supabase Auth
        if (user.supabaseUid) {
            try {
                const supabase = this.supabase.getClient();
                await supabase.auth.admin.updateUserById(user.supabaseUid, {
                    ban_duration: 'none',
                });
            } catch (err) {
                console.warn(`Could not re-enable Supabase auth for ${user.supabaseUid}:`, err);
            }
        }

        return { success: true, message: 'User reactivated' };
    }
}
