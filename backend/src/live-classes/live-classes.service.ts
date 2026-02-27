import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class LiveClassesService {
  constructor(private prisma: PrismaService) { }

  async getAll(user: any) {
    const staff = await this.prisma.staff.findFirst({ where: { userId: user.id } });
    if (!staff) throw new NotFoundException('Teacher not found');

    return this.prisma.liveClass.findMany({
      where: { teacherId: staff.id },
      include: {
        subject: { select: { name: true, code: true } },
        section: { select: { name: true, classLevel: { select: { name: true } } } },
      },
      orderBy: { scheduledFor: 'asc' }
    });
  }

  async create(dto: any, user: any) {
    const staff = await this.prisma.staff.findFirst({ where: { userId: user.id } });
    if (!staff) throw new NotFoundException('Teacher not found');

    return this.prisma.liveClass.create({
      data: {
        title: dto.title,
        description: dto.description || '',
        provider: dto.provider,
        meetingUrl: dto.meetingUrl,
        meetingId: dto.meetingId,
        scheduledFor: new Date(dto.scheduledFor),
        duration: dto.duration || 45,
        status: dto.status || 'SCHEDULED',
        subjectId: dto.subjectId || null,
        sectionId: dto.sectionId || null,
        teacherId: staff.id,
        schoolId: staff.schoolId,
      },
      include: {
        subject: { select: { name: true, code: true } },
        section: { select: { name: true, classLevel: { select: { name: true } } } }
      }
    });
  }

  async update(id: string, dto: any, user: any) {
    const staff = await this.prisma.staff.findFirst({ where: { userId: user.id } });
    if (!staff) throw new NotFoundException('Teacher not found');

    const liveClass = await this.prisma.liveClass.findFirst({ where: { id, teacherId: staff.id } });
    if (!liveClass) throw new NotFoundException('Live class not found');

    return this.prisma.liveClass.update({
      where: { id },
      data: {
        title: dto.title,
        description: dto.description,
        provider: dto.provider,
        meetingUrl: dto.meetingUrl,
        meetingId: dto.meetingId,
        scheduledFor: dto.scheduledFor ? new Date(dto.scheduledFor) : undefined,
        duration: dto.duration,
        status: dto.status,
        subjectId: dto.subjectId || null,
        sectionId: dto.sectionId || null,
      },
      include: {
        subject: { select: { name: true, code: true } },
        section: { select: { name: true, classLevel: { select: { name: true } } } }
      }
    });
  }

  async updateStatus(id: string, status: string, user: any) {
    const staff = await this.prisma.staff.findFirst({ where: { userId: user.id } });
    if (!staff) throw new NotFoundException('Teacher not found');

    const liveClass = await this.prisma.liveClass.findFirst({ where: { id, teacherId: staff.id } });
    if (!liveClass) throw new NotFoundException('Live class not found');

    return this.prisma.liveClass.update({
      where: { id },
      data: { status }
    });
  }

  async delete(id: string, user: any) {
    const staff = await this.prisma.staff.findFirst({ where: { userId: user.id } });
    if (!staff) throw new NotFoundException('Teacher not found');

    const liveClass = await this.prisma.liveClass.findFirst({ where: { id, teacherId: staff.id } });
    if (!liveClass) throw new NotFoundException('Live class not found');

    return this.prisma.liveClass.delete({ where: { id } });
  }
}
