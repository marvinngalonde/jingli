import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class SenService {
  constructor(private prisma: PrismaService) {}

  async getSenStudents(schoolId: string) {
    return this.prisma.senProfile.findMany({
      where: { schoolId },
      include: {
        student: {
          include: {
            section: { include: { classLevel: true } }
          }
        },
        ieps: true
      },
      orderBy: { student: { lastName: 'asc' } }
    });
  }

  async createProfile(schoolId: string, dto: any) {
    return this.prisma.senProfile.create({
      data: {
        ...dto,
        schoolId
      }
    });
  }

  async updateProfile(id: string, dto: any) {
    return this.prisma.senProfile.update({
      where: { id },
      data: dto
    });
  }

  async getIEPs(senProfileId: string) {
    return this.prisma.iEP.findMany({
      where: { senProfileId },
      orderBy: { createdAt: 'desc' }
    });
  }

  async createIEP(senProfileId: string, dto: any) {
    return this.prisma.iEP.create({
      data: {
        ...dto,
        senProfileId,
        startDate: new Date(dto.startDate),
        endDate: new Date(dto.endDate)
      }
    });
  }

  async updateIEP(id: string, dto: any) {
    return this.prisma.iEP.update({
      where: { id },
      data: {
        ...dto,
        startDate: dto.startDate ? new Date(dto.startDate) : undefined,
        endDate: dto.endDate ? new Date(dto.endDate) : undefined
      }
    });
  }

  async deleteIEP(id: string) {
    return this.prisma.iEP.delete({ where: { id } });
  }

  async deleteProfile(id: string) {
    return this.prisma.senProfile.delete({ where: { id } });
  }
}
