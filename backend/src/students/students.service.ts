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
        if (!createDto.schoolId) {
            throw new Error('School ID is required'); // Should be injected by Controller
        }

        // Generate Admission No if not provided
        let admissionNo = createDto.admissionNo;
        if (!admissionNo) {
            const year = new Date().getFullYear();
            const prefix = `${year}-`;

            // Find last student with this prefix to determine sequence
            const lastStudent = await this.prisma.student.findFirst({
                where: {
                    schoolId: createDto.schoolId,
                    admissionNo: { startsWith: prefix }
                },
                orderBy: { admissionNo: 'desc' }
            });

            let sequence = 1;
            if (lastStudent) {
                const parts = lastStudent.admissionNo.split('-');
                if (parts.length === 2 && !isNaN(parseInt(parts[1]))) {
                    sequence = parseInt(parts[1]) + 1;
                }
            }

            admissionNo = `${prefix}${sequence.toString().padStart(4, '0')}`;
        }

        // Generate Roll No if not provided
        let rollNo = createDto.rollNo;
        if (!rollNo) {
            // Count students in this section to determine next roll no
            const count = await this.prisma.student.count({
                where: {
                    sectionId: createDto.sectionId
                }
            });
            rollNo = (count + 1).toString();
        }

        const email = createDto.email || `${admissionNo}@student.school.com`; // Fallback

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
                admissionNo: admissionNo,
                firstName: createDto.firstName,
                lastName: createDto.lastName,
                sectionId: createDto.sectionId,
                enrollmentDate: new Date(createDto.enrollmentDate),
                rollNo: rollNo,
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
