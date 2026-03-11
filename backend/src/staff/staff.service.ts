import { Injectable, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { SupabaseService } from '../supabase/supabase.service';
import { CreateStaffDto } from './dto/create-staff.dto';
import { UpdateStaffDto } from './dto/update-staff.dto';

@Injectable()
export class StaffService {
    constructor(
        private readonly prisma: PrismaService,
        private readonly supabaseService: SupabaseService
    ) { }

    async create(schoolId: string, createDto: CreateStaffDto) {
        const username = `${createDto.firstName.toLowerCase()}.${createDto.lastName.toLowerCase()}${Math.floor(Math.random() * 1000)}`;
        const email = createDto.email;
        const tempPassword = 'Temp1234!'; // Default temporary password

        // 1. Create User in Supabase Auth first
        const supabase = this.supabaseService.getClient();
        const { data: authUser, error: authError } = await supabase.auth.admin.createUser({
            email: email,
            password: tempPassword,
            email_confirm: true,
            user_metadata: {
                username: username,
                firstName: createDto.firstName,
                lastName: createDto.lastName,
                role: 'TEACHER', // You could map designation to role here if needed
                schoolId: schoolId,
            }
        });

        if (authError) {
            console.error('Supabase Auth Creation Error in Staff:', authError);
            throw new BadRequestException(`Auth creation failed: ${authError.message}`);
        }

        const supabaseUid = authUser.user.id;

        // 2. Create local User and Staff Profile
        const user = await this.prisma.user.create({
            data: {
                username: username,
                schoolId: schoolId,
                email: email,
                passwordHash: 'SUPABASE_MANAGED',
                role: 'TEACHER', // Defaulting to teacher, could be dynamic
                supabaseUid: supabaseUid,
            }
        });

        return this.prisma.staff.create({
            data: {
                schoolId: schoolId,
                userId: user.id,
                employeeId: createDto.employeeId,
                firstName: createDto.firstName,
                lastName: createDto.lastName,
                designation: createDto.designation,
                department: createDto.department,
                joinDate: new Date(createDto.joinDate),
                phone: createDto.phone,
                baseSalary: createDto.baseSalary || 0,
            },
            include: {
                user: true
            }
        });
    }

    async findAll(schoolId: string, page = 1, limit = 20) {
        const skip = (page - 1) * limit;
        const where: any = {
            schoolId,
            user: { status: 'ACTIVE' }
        };

        const [data, total] = await Promise.all([
            this.prisma.staff.findMany({
                where,
                skip,
                take: limit,
                include: {
                    user: {
                        select: {
                            email: true,
                            role: true,
                            status: true
                        }
                    }
                },
                orderBy: {
                    lastName: 'asc',
                }
            }),
            this.prisma.staff.count({ where })
        ]);

        return {
            data,
            total,
            page,
            pageSize: limit,
            totalPages: Math.ceil(total / limit)
        };
    }

    async findOne(id: string) {
        return this.prisma.staff.findUnique({
            where: { id },
            include: {
                user: true,
                classTeacherOf: true,
                subjectAllocations: {
                    include: {
                        subject: true,
                        section: true
                    }
                }
            }
        });
    }

    async update(id: string, updateDto: UpdateStaffDto) {
        // Only pick scalar fields that belong to the Staff table.
        // The frontend sends the full staff object (with nested user, sections, etc.)
        // which Prisma would reject. We whitelist only what we can safely update.
        const data: any = {};
        if (updateDto.firstName !== undefined) data.firstName = updateDto.firstName;
        if (updateDto.lastName !== undefined) data.lastName = updateDto.lastName;
        if (updateDto.phone !== undefined) data.phone = updateDto.phone;
        if (updateDto.designation !== undefined) data.designation = updateDto.designation;
        if (updateDto.department !== undefined) data.department = updateDto.department;
        if (updateDto.joinDate !== undefined) data.joinDate = new Date(updateDto.joinDate);
        if (updateDto.baseSalary !== undefined) data.baseSalary = updateDto.baseSalary;

        return this.prisma.staff.update({
            where: { id },
            data,
        });
    }

    async remove(id: string) {
        // Also delete (or soft delete) the User?
        // Cascading delete might handle it if configured, strictly we should deactivate.
        // Let's just delete the staff profile for now.
        return this.prisma.staff.delete({
            where: { id },
        });
    }
}
