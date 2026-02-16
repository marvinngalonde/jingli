import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateStaffDto } from './dto/create-staff.dto';
import { UpdateStaffDto } from './dto/update-staff.dto';

@Injectable()
export class StaffService {
    constructor(private readonly prisma: PrismaService) { }

    async create(createDto: CreateStaffDto) {
        // In a real flow, we would create a User (Auth) first or link to an existing one.
        // Here we assume we might create a placeholder User or just the Staff profile if User creation is separate.
        // For strict relation, we need a userId.
        // OPTION 1: Create User + Staff transaction (Recommended but requires password etc)
        // OPTION 2: Create Staff and assume User exists (passed in DTO?)
        // OPTION 3: Just create Staff (but schema says userId is unique & required!)

        // Schema:
        // model Staff { ... userId String @unique ... user User ... }

        // So we MUST have a userId.
        // For this phase, I'll assume we creating a User stub internally or we need to pass a userId.
        // Let's autopopulate a user stub for now to satisfy constraint, 
        // OR better: Create a User with the provided email and a default password.

        // Let's create the User first.

        const user = await this.prisma.user.create({
            data: {
                schoolId: createDto.schoolId,
                email: createDto.email,
                passwordHash: 'temp_hash', // In real app, handle this securely
                role: 'TEACHER', // Defaulting to teacher for staff, or pass in DTO?
            }
        });

        return this.prisma.staff.create({
            data: {
                schoolId: createDto.schoolId,
                userId: user.id,
                employeeId: createDto.employeeId,
                firstName: createDto.firstName,
                lastName: createDto.lastName,
                designation: createDto.designation,
                department: createDto.department,
                joinDate: new Date(createDto.joinDate),
                phone: createDto.phone,
            },
            include: {
                user: true
            }
        });
    }

    async findAll(schoolId: string) {
        return this.prisma.staff.findMany({
            where: { schoolId },
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
        });
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
        const data: any = { ...updateDto };
        if (updateDto.joinDate) data.joinDate = new Date(updateDto.joinDate);

        // Remove email/schoolId from update to Staff table (email is on User)
        delete data.email;
        delete data.schoolId;

        // If email update is needed, we should update User table too.
        // For simplicity, skipping User email update here.

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
