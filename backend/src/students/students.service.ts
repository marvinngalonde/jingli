import { Injectable, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { SupabaseService } from '../supabase/supabase.service';
import { CreateStudentDto } from './dto/create-student.dto';
import { UpdateStudentDto } from './dto/update-student.dto';

@Injectable()
export class StudentsService {
    constructor(
        private readonly prisma: PrismaService,
        private readonly supabaseService: SupabaseService
    ) { }

    async create(createDto: CreateStudentDto) {
        if (!createDto.schoolId) {
            throw new Error('School ID is required');
        }

        let admissionNo = createDto.admissionNo;
        if (!admissionNo) {
            const year = new Date().getFullYear();
            const prefix = `${year}-`;
            const lastStudent = await this.prisma.student.findFirst({
                where: { schoolId: createDto.schoolId, admissionNo: { startsWith: prefix } },
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

        let rollNo = createDto.rollNo;
        if (!rollNo) {
            const count = await this.prisma.student.count({
                where: { sectionId: createDto.sectionId }
            });
            rollNo = (count + 1).toString();
        }

        const email = createDto.email || `${admissionNo.toLowerCase()}@student.school.com`;
        const tempPassword = 'Temp1234!'; // Define a default or get from createDto

        // 1. Create User in Supabase Auth first
        const supabase = this.supabaseService.getClient();
        const { data: authUser, error: authError } = await supabase.auth.admin.createUser({
            email: email,
            password: tempPassword,
            email_confirm: true,
            user_metadata: {
                username: admissionNo,
                firstName: createDto.firstName,
                lastName: createDto.lastName,
                role: 'STUDENT',
                schoolId: createDto.schoolId,
            }
        });

        if (authError) {
            console.error('Supabase Auth Creation Error in Student:', authError);
            throw new BadRequestException(`Auth creation failed: ${authError.message}`);
        }

        const supabaseUid = authUser.user.id;

        // 2. Create local User and Student
        const user = await this.prisma.user.create({
            data: {
                username: admissionNo,
                schoolId: createDto.schoolId,
                email: email,
                passwordHash: 'SUPABASE_MANAGED',
                role: 'STUDENT',
                supabaseUid: supabaseUid,
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

    async findAll(schoolId: string, page = 1, limit = 7, sectionId?: string, teacherId?: string) {
        const where: any = {
            schoolId,
            user: { status: 'ACTIVE' }
        };
        if (sectionId) where.sectionId = sectionId;

        if (teacherId) {
            // Find staff record for this user
            const staff = await this.prisma.staff.findUnique({ where: { userId: teacherId } });
            if (!staff) return { data: [], total: 0, page, pageSize: limit, totalPages: 0 };

            // Find all sections this teacher is assigned to
            const [subjectAllocs, classSections] = await Promise.all([
                this.prisma.subjectAllocation.findMany({ where: { staffId: staff.id }, select: { sectionId: true } }),
                this.prisma.classSection.findMany({ where: { classTeacherId: staff.id }, select: { id: true } })
            ]);

            const teacherSectionIds = new Set([
                ...subjectAllocs.map(a => a.sectionId),
                ...classSections.map(s => s.id)
            ]);

            if (teacherSectionIds.size === 0) return { data: [], total: 0, page, pageSize: limit, totalPages: 0 };

            if (where.sectionId) {
                if (!teacherSectionIds.has(where.sectionId)) return { data: [], total: 0, page, pageSize: limit, totalPages: 0 };
            } else {
                where.sectionId = { in: Array.from(teacherSectionIds) };
            }
        }

        const skip = (page - 1) * limit;

        const [data, total] = await Promise.all([
            this.prisma.student.findMany({
                where,
                skip,
                take: limit,
                include: {
                    section: {
                        include: { classLevel: true }
                    },
                    guardians: {
                        include: { guardian: true }
                    }
                },
                orderBy: {
                    lastName: 'asc',
                }
            }),
            this.prisma.student.count({ where })
        ]);

        return {
            data,
            total,
            page,
            pageSize: limit,
            totalPages: Math.ceil(total / limit)
        };
    }

    async findOne(id: string, schoolId: string) {
        return this.prisma.student.findFirst({
            where: { id, schoolId },
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
        // Find the student to get the userId before deletion
        const student = await this.prisma.student.findUnique({ where: { id } });
        if (!student) return null;

        return this.prisma.$transaction(async (tx) => {
            // Delete dependent records
            await tx.attendance.deleteMany({ where: { studentId: id } });
            await tx.studentGuardian.deleteMany({ where: { studentId: id } });
            await tx.submission.deleteMany({ where: { studentId: id } });
            await tx.gatePass.deleteMany({ where: { studentId: id } });
            await tx.lateArrival.deleteMany({ where: { studentId: id } });
            await tx.examResult.deleteMany({ where: { studentId: id } });
            await tx.bookCirculation.deleteMany({ where: { studentId: id } });

            // Delete Invoices and associated Transactions
            const invoices = await tx.invoice.findMany({ where: { studentId: id }, select: { id: true } });
            const invoiceIds = invoices.map((i: any) => i.id);
            if (invoiceIds.length > 0) {
                await tx.transaction.deleteMany({ where: { invoiceId: { in: invoiceIds } } });
                await tx.invoice.deleteMany({ where: { studentId: id } });
            }

            // Finally, delete the student record
            const deletedStudent = await tx.student.delete({ where: { id } });

            // Also delete the associated User record to prevent orphans
            if (student.userId) {
                await tx.user.delete({ where: { id: student.userId } });
            }

            return deletedStudent;
        });
    }
}
