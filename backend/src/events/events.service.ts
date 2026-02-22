import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateEventDto } from './dto/create-event.dto';
import { UpdateEventDto } from './dto/update-event.dto';

@Injectable()
export class EventsService {
    constructor(private readonly prisma: PrismaService) { }

    async create(createDto: CreateEventDto, schoolId: string) {
        return this.prisma.event.create({
            data: {
                ...createDto,
                schoolId,
                startDate: new Date(createDto.startDate),
                endDate: new Date(createDto.endDate),
            },
        });
    }

    async findAll(schoolId: string, start?: string, end?: string) {
        return this.prisma.event.findMany({
            where: {
                schoolId,
                ...(start && end ? {
                    startDate: {
                        gte: new Date(start)
                    },
                    endDate: {
                        lte: new Date(end)
                    }
                } : {})
            },
            orderBy: {
                startDate: 'asc',
            },
        });
    }

    async findOne(id: string, schoolId: string) {
        return this.prisma.event.findFirst({
            where: { id, schoolId },
        });
    }

    async update(id: string, updateDto: UpdateEventDto, schoolId: string) {
        const data: any = { ...updateDto };
        if (updateDto.startDate) data.startDate = new Date(updateDto.startDate);
        if (updateDto.endDate) data.endDate = new Date(updateDto.endDate);

        return this.prisma.event.update({
            where: { id, schoolId },
            data,
        });
    }

    async remove(id: string, schoolId: string) {
        return this.prisma.event.delete({
            where: { id, schoolId },
        });
    }
}
