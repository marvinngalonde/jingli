import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class SubjectsService {
    constructor(private readonly prisma: PrismaService) { }

    async create(createSubjectDto: any, schoolId: string) {
        return this.prisma.subject.create({
            data: {
                ...createSubjectDto,
                schoolId,
            }
        });
    }

    async findAll(schoolId: string) {
        return this.prisma.subject.findMany({
            where: { schoolId },
            orderBy: { name: 'asc' }
        });
    }

    async findOne(id: string, schoolId: string) {
        const record = await this.prisma.subject.findFirst({
            where: { id, schoolId }
        });
        if (!record) throw new NotFoundException('Subject not found');
        return record;
    }

    async update(id: string, updateSubjectDto: any, schoolId: string) {
        await this.findOne(id, schoolId);
        return this.prisma.subject.update({
            where: { id },
            data: updateSubjectDto
        });
    }

    async remove(id: string, schoolId: string) {
        await this.findOne(id, schoolId);
        return this.prisma.subject.delete({ where: { id } });
    }

    async allocate(allocationDto: any, schoolId: string) {
        const { subjectId, sectionId, staffId } = allocationDto;

        // 1. Verify existence and ownership
        const subject = await this.prisma.subject.findFirst({ where: { id: subjectId, schoolId } });
        if (!subject) throw new NotFoundException('Subject not found');

        const section = await this.prisma.classSection.findFirst({ where: { id: sectionId, schoolId } });
        if (!section) throw new NotFoundException('Section not found');

        const staff = await this.prisma.staff.findFirst({ where: { id: staffId, schoolId } });
        if (!staff) throw new NotFoundException('Staff not found');

        // 2. Check strict subject-level constraint? 
        // Some schools assign "Maths" generally, some exact "Maths 101".
        // Schema allows allocating 'Subject' to 'Section' handled by 'Staff'.

        // 3. Create allocation
        return this.prisma.subjectAllocation.create({
            data: {
                subjectId,
                sectionId,
                staffId
            }
        });
    }
}
