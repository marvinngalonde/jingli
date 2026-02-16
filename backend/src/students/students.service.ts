import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateStudentDto } from './dto/create-student.dto';
import { UpdateStudentDto } from './dto/update-student.dto';

@Injectable()
export class StudentsService {
    constructor(private readonly prisma: PrismaService) { }

    async create(createDto: CreateStudentDto) {
        // Similar to Staff, we need a User. 
        // Student email might be optional or generated? 
        // If email provided, create user. If not, generate dummy?
        // Schema says User email is required. 
        // So we must have an email. If DTO doesn't have it, we should error or generate one.
        // Assuming for now DTO provides it or we generate strictly.

        const email = createDto.email || `${createDto.admissionNo}@student.school.com`; // Fallback

        const user = await this.prisma.user.create({
            data: {
                schoolId: createDto.schoolId,
                email: email,
                passwordHash: 'temp_hash_student',
                role: 'STUDENT',
                // Profiles handle names
            }
        });

        return this.prisma.student.create({
            data: {
                schoolId: createDto.schoolId,
                userId: user.id,
                admissionNo: createDto.admissionNo,
                firstName: createDto.firstName,
                lastName: createDto.lastName,
                sectionId: createDto.sectionId,
                enrollmentDate: new Date(createDto.enrollmentDate),
                rollNo: createDto.rollNo,
                dob: createDto.dob ? new Date(createDto.dob) : undefined,
                gender: createDto.gender,
                address: createDto.address,
            },
            include: {
                user: true,
                section: {
                    include: { classLevel: true }
                }
            }
        });
    }

    async findAll(schoolId: string, sectionId?: string) {
        const where: any = { schoolId };
        if (sectionId) where.sectionId = sectionId;

        return this.prisma.student.findMany({
            where,
            include: {
                // user: { select: { email: true, status: true } }, // User might not be needed for simple lists
                section: {
                    include: { classLevel: true }
                }
            },
            orderBy: {
                lastName: 'asc',
            }
        });
    }

    async findOne(id: string) {
        return this.prisma.student.findUnique({
            where: { id },
            include: {
                user: true,
                section: {
                    include: { classLevel: true }
                },
                guardians: {
                    include: {
                        guardian: true
                    }
                }
            }
        });
    }

    async update(id: string, updateDto: UpdateStudentDto) {
        const data: any = { ...updateDto };
        if (updateDto.enrollmentDate) data.enrollmentDate = new Date(updateDto.enrollmentDate);
        if (updateDto.dob) data.dob = new Date(updateDto.dob);

        delete data.email;
        delete data.schoolId;

        return this.prisma.student.update({
            where: { id },
            data,
        });
    }

    async remove(id: string) {
        return this.prisma.student.delete({
            where: { id },
        });
    }
}
