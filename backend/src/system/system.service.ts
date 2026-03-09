import { Injectable, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { SupabaseService } from '../supabase/supabase.service';

@Injectable()
export class SystemService {
    constructor(
        private readonly prisma: PrismaService,
        private readonly supabaseService: SupabaseService,
    ) { }

    async checkStatus() {
        const adminCount = await this.prisma.user.count({ where: { role: 'ADMIN' } });
        const schoolCount = await this.prisma.school.count();

        return {
            isInstalled: adminCount > 0 && schoolCount > 0,
        };
    }

    async installSystem(data: any) {

        const {
            schoolName,
            subdomain,
            adminFirstName,
            adminLastName,
            adminUsername,
            adminEmail,
            adminPassword
        } = data;

        // 1. Create School
        const school = await this.prisma.school.create({
            data: {
                name: schoolName,
                subdomain: subdomain,
                logoUrl: 'https://ui-avatars.com/api/?name=' + schoolName,
                config: { theme: 'blue', modules: ['ACADEMIC', 'FINANCE', 'RECEPTION'] },
            },
        });

        const supabase = this.supabaseService.getClient();
        let supabaseUid = '';

        // 2. Create Admin User in Supabase Auth
        try {
            const { data: authData, error } = await supabase.auth.admin.createUser({
                email: adminEmail,
                password: adminPassword,
                email_confirm: true,
                user_metadata: {
                    role: 'ADMIN',
                    username: adminUsername,
                    firstName: adminFirstName,
                    lastName: adminLastName,
                }
            });
            if (error) throw error;
            supabaseUid = authData.user.id;
        } catch (error: any) {
            await this.prisma.school.delete({ where: { id: school.id } });
            throw new BadRequestException(`Failed to create admin in auth: ${error.message}`);
        }

        // 3. Create Admin User in Database
        try {
            const adminUser = await this.prisma.user.create({
                data: {
                    schoolId: school.id,
                    supabaseUid: supabaseUid,
                    username: adminUsername,
                    email: adminEmail,
                    passwordHash: 'SUPABASE_MANAGED',
                    role: 'ADMIN',
                    status: 'ACTIVE',
                    avatarUrl: `https://ui-avatars.com/api/?name=${adminFirstName}+${adminLastName}`
                }
            });

            // 4. Create Staff Profile for Admin
            await this.prisma.staff.create({
                data: {
                    schoolId: school.id,
                    userId: adminUser.id,
                    employeeId: `EMP-${Date.now()}`,
                    firstName: adminFirstName,
                    lastName: adminLastName,
                    designation: 'Super Admin',
                    department: 'IT',
                    joinDate: new Date(),
                }
            });

            return { success: true, message: 'System installed successfully.' };
        } catch (error: any) {
            // Cleanup on failure
            await supabase.auth.admin.deleteUser(supabaseUid);
            await this.prisma.school.delete({ where: { id: school.id } });
            throw new BadRequestException(`Failed to create records: ${error.message}`);
        }
    }

    async getSchoolSettings(schoolId: string) {
        return this.prisma.school.findUnique({
            where: { id: schoolId },
            select: {
                id: true,
                name: true,
                logoUrl: true,
                config: true,
            }
        });
    }

    async updateSchoolSettings(schoolId: string, data: any) {
        const { name, logoUrl, config } = data;
        return this.prisma.school.update({
            where: { id: schoolId },
            data: {
                name,
                logoUrl,
                config: config ? config : undefined,
            }
        });
    }
}
