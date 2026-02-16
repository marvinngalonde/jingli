import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateGuardianDto } from './dto/create-guardian.dto';
import { UpdateGuardianDto } from './dto/update-guardian.dto';

@Injectable()
export class GuardiansService {
    constructor(private readonly prisma: PrismaService) { }

    async create(createDto: CreateGuardianDto) {
        // Same pattern: Create User first, then Guardian profile
        // Check if user exists by email first? 
        // For now, simple create flow.

        let userId: string;

        // Try finding user first
        const existingUser = await this.prisma.user.findUnique({
            where: {
                schoolId_email: {
                    schoolId: createDto.schoolId,
                    email: createDto.email
                }
            }
        });

        if (existingUser) {
            userId = existingUser.id;
            // Check if guardian profile already exists for this user?
            const existingGuardian = await this.prisma.guardian.findUnique({
                where: { userId }
            });
            if (existingGuardian) {
                return existingGuardian; // Or throw conflict?
            }
        } else {
            const newUser = await this.prisma.user.create({
                data: {
                    schoolId: createDto.schoolId,
                    email: createDto.email,
                    passwordHash: 'temp_hash_parent',
                    role: 'PARENT',
                }
            });
            userId = newUser.id;
        }

        return this.prisma.guardian.create({
            data: {
                schoolId: createDto.schoolId,
                userId: userId,
                firstName: createDto.firstName,
                lastName: createDto.lastName,
                relationship: createDto.relationship,
                phone: createDto.phone,
                address: createDto.address,
                occupation: createDto.occupation,
            },
            include: {
                user: true
            }
        });
    }

    async findAll(schoolId: string) {
        return this.prisma.guardian.findMany({
            where: { schoolId },
            include: {
                user: { select: { email: true, status: true } },
                students: {
                    include: {
                        student: {
                            select: { firstName: true, lastName: true, admissionNo: true }
                        }
                    }
                }
            },
            orderBy: {
                lastName: 'asc',
            }
        });
    }

    async findOne(id: string) {
        return this.prisma.guardian.findUnique({
            where: { id },
            include: {
                user: true,
                students: {
                    include: {
                        student: true
                    }
                }
            }
        });
    }

    async update(id: string, updateDto: UpdateGuardianDto) {
        const data: any = { ...updateDto };
        delete data.email;
        delete data.schoolId;

        return this.prisma.guardian.update({
            where: { id },
            data,
        });
    }

    async remove(id: string) {
        return this.prisma.guardian.delete({
            where: { id },
        });
    }

    async assignStudent(guardianId: string, studentId: string, isPrimary: boolean = false) {
        return this.prisma.studentGuardian.create({
            data: {
                guardianId,
                studentId,
                isPrimary
            }
        });
    }
}
