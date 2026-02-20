import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateAttendanceDto } from './dto/create-attendance.dto';
import { UpdateAttendanceDto } from './dto/update-attendance.dto';
import { AttendanceStatus } from '@prisma/client';

@Injectable()
export class AttendanceService {
    constructor(private readonly prisma: PrismaService) { }

    async create(createDto: CreateAttendanceDto, schoolId: string) {
        // Validate student belongs to school
        const student = await this.prisma.student.findFirst({
            where: { id: createDto.studentId, schoolId }
        });
        if (!student) throw new Error('Student not found or does not belong to school');

        return this.prisma.attendance.create({
            data: {
                schoolId,
                sectionId: student.sectionId,
                studentId: createDto.studentId,
                date: new Date(createDto.date),
                status: createDto.status as AttendanceStatus,
                remarks: createDto.remarks,
                recordedBy: createDto.recordedBy,
            },
        });
    }

    async findAll(schoolId: string, date?: string, classId?: string, studentId?: string, startDate?: string, endDate?: string) {
        const where: any = {
            student: { schoolId }
        };

        // Date Filtering Logic
        if (startDate && endDate) {
            where.date = {
                gte: new Date(startDate),
                lte: new Date(endDate)
            };
        } else if (date) {
            where.date = new Date(date);
        }

        if (classId) {
            where.student.sectionId = classId;
        }
        if (studentId) {
            where.studentId = studentId;
        }

        return this.prisma.attendance.findMany({
            where,
            include: {
                student: {
                    select: {
                        firstName: true,
                        lastName: true,
                        admissionNo: true,
                        sectionId: true
                    }
                }
            },
            orderBy: {
                date: 'desc', // Order by date first for reports
            }
        });
    }

    async findOne(id: string, schoolId: string) {
        return this.prisma.attendance.findFirst({
            where: {
                id,
                student: { schoolId }
            },
            include: {
                student: true
            }
        });
    }

    async update(id: string, updateDto: UpdateAttendanceDto, schoolId: string) {
        await this.findOne(id, schoolId); // Ensure exists and belongs to school

        const data: any = {};
        if (updateDto.status) data.status = updateDto.status as AttendanceStatus;
        if (updateDto.remarks) data.remarks = updateDto.remarks;

        return this.prisma.attendance.update({
            where: { id },
            data,
        });
    }

    async remove(id: string, schoolId: string) {
        await this.findOne(id, schoolId);
        return this.prisma.attendance.delete({
            where: { id },
        });
    }

    // Bulk create for a whole class
    async bulkCreate(records: CreateAttendanceDto[], schoolId: string) {
        // 1. Validate all students belong to school and get their sections
        const studentIds = records.map(r => r.studentId);
        const students = await this.prisma.student.findMany({
            where: {
                id: { in: studentIds },
                schoolId
            },
            select: { id: true, sectionId: true }
        });

        if (students.length !== new Set(studentIds).size) {
            throw new Error('One or more students do not belong to this school');
        }

        const studentMap = new Map(students.map(s => [s.id, s.sectionId]));

        const data = records.map(r => ({
            schoolId,
            sectionId: studentMap.get(r.studentId)!, // We validated existence above
            studentId: r.studentId,
            date: new Date(r.date),
            status: r.status as AttendanceStatus,
            remarks: r.remarks,
            recordedBy: r.recordedBy,
        }));

        return this.prisma.attendance.createMany({
            data,
            skipDuplicates: true
        });
    }
}
