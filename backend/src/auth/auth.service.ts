import { Injectable, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
// import { SupabaseService } from './supabase.service'; // If needed for admin tasks

@Injectable()
export class AuthService {
    constructor(private prisma: PrismaService) { }

    async resolveEmail(username: string) {
        const user = await this.prisma.user.findFirst({
            where: { username },
            select: { email: true }
        });

        if (!user || !user.email) {
            throw new BadRequestException('User not found');
        }

        return { email: user.email };
    }

    async syncUser(user: any, metadata: any) {
        if (!user || !user.id || !user.email) {
            throw new BadRequestException('Invalid user data');
        }

        // Check if user exists
        const existingUser = await this.prisma.user.findFirst({
            where: {
                OR: [
                    { supabaseUid: user.id },
                    { email: user.email }
                ]
            }
        });

        if (existingUser) {
            // Update Supabase UID if missing
            if (!existingUser.supabaseUid) {
                return this.prisma.user.update({
                    where: { id: existingUser.id },
                    data: { supabaseUid: user.id }
                });
            }
            return existingUser;
        }

        // Create new user
        // Default school ID is needed. Since we are multi-tenant, 
        // usually we need a schoolId. For this MVP/Demo, we might 
        // pick the first school or fail if none.
        // Let's assume a default school or '1' or require one.

        const school = await this.prisma.school.findFirst();
        if (!school) {
            throw new BadRequestException('No school configured in system');
        }

        // Determine Role from metadata or default
        const role = metadata?.role ? metadata.role.toUpperCase() : 'STUDENT';

        // Validate Role enum
        const validRoles = ['ADMIN', 'TEACHER', 'STUDENT', 'PARENT', 'RECEPTION', 'FINANCE'];
        if (!validRoles.includes(role)) {
            throw new BadRequestException('Invalid role');
        }

        const email = user.email || 'unknown@example.com';
        const username = email.split('@')[0] + Math.floor(Math.random() * 1000);

        const newUser = await this.prisma.user.create({
            data: {
                username: username,
                email: email,
                passwordHash: 'SUPABASE_MANAGED', // Placeholder
                supabaseUid: user.id,
                role: role as any,
                schoolId: school.id,
                status: 'ACTIVE',
            }
        });

        // Create Linked Profile based on Role
        // This is simplified. In real app, we need more data.
        if (role === 'STUDENT') {
            const section = await this.prisma.classSection.findFirst();
            if (section) {
                // Create student profile linked to a section
                await this.prisma.student.create({
                    data: {
                        userId: newUser.id,
                        schoolId: school.id,
                        firstName: metadata?.firstName || 'New',
                        lastName: metadata?.lastName || 'Student',
                        admissionNo: `ADM-${Date.now()}`,
                        sectionId: section.id,
                        enrollmentDate: new Date(),
                    }
                });
            }
            // If no sections exist, skip student profile — it can be created later by admin
        } else if (role === 'TEACHER' || role === 'ADMIN') {
            await this.prisma.staff.create({
                data: {
                    userId: newUser.id,
                    schoolId: school.id,
                    firstName: metadata?.firstName || 'New',
                    lastName: metadata?.lastName || 'Staff',
                    employeeId: `EMP-${Date.now()}`,
                    designation: 'Staff',
                    department: 'General',
                    joinDate: new Date(),
                }
            });
        }

        return newUser;
    }
}
