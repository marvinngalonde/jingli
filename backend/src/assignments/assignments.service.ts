import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateAssignmentDto, UpdateAssignmentDto } from './dto/create-assignment.dto';

@Injectable()
export class AssignmentsService {
    constructor(private readonly prisma: PrismaService) { }

    async create(createDto: CreateAssignmentDto, schoolId: string) {
        // Validate section belongs to school
        const section = await this.prisma.classSection.findFirst({ where: { id: createDto.sectionId, schoolId } });
        if (!section) throw new Error('Section not found or does not belong to school');

        return this.prisma.assignment.create({
            data: {
                sectionId: createDto.sectionId,
                subjectId: createDto.subjectId,
                teacherId: createDto.teacherId,
                title: createDto.title,
                description: createDto.description,
                dueDate: new Date(createDto.dueDate),
                maxMarks: createDto.maxMarks,
                type: createDto.type,
            },
        });
    }

    async findAll(schoolId: string, sectionId?: string, subjectId?: string) {
        const where: any = {
            section: { schoolId }
        };
        if (sectionId) where.sectionId = sectionId;
        if (subjectId) where.subjectId = subjectId;

        return this.prisma.assignment.findMany({
            where,
            include: {
                subject: { select: { name: true, code: true } },
                teacher: { select: { firstName: true, lastName: true } },
                _count: {
                    select: { submissions: true }
                }
            },
            orderBy: {
                dueDate: 'desc',
            }
        });
    }

    async findOne(id: string, schoolId: string) {
        return this.prisma.assignment.findFirst({
            where: {
                id,
                section: { schoolId }
            },
            include: {
                submissions: {
                    include: {
                        student: { select: { firstName: true, lastName: true, rollNo: true } }
                    }
                }
            }
        });
    }

    async update(id: string, updateDto: UpdateAssignmentDto, schoolId: string) {
        await this.findOne(id, schoolId); // Check ownership

        const data: any = { ...updateDto };
        if (updateDto.dueDate) data.dueDate = new Date(updateDto.dueDate);

        return this.prisma.assignment.update({
            where: { id },
            data,
        });
    }

    async remove(id: string, schoolId: string) {
        await this.findOne(id, schoolId); // Check ownership
        return this.prisma.assignment.delete({
            where: { id },
        });
    }
}
