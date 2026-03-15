import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateChemicalDto } from './dto/create-chemical.dto';
import { CreateBookingDto } from './dto/create-booking.dto';
import { CreateEquipmentDto } from './dto/create-equipment.dto';

@Injectable()
export class LabService {
  constructor(private prisma: PrismaService) {}

  // Chemicals CRUD
  async getAllChemicals(schoolId: string) {
    return this.prisma.labChemical.findMany({
      where: { schoolId },
      orderBy: { name: 'asc' },
    });
  }

  async createChemical(schoolId: string, dto: CreateChemicalDto) {
    return this.prisma.labChemical.create({
      data: {
        ...dto,
        schoolId,
        expiryDate: dto.expiryDate ? new Date(dto.expiryDate) : null,
      },
    });
  }

  async updateChemical(id: string, dto: any) {
    return this.prisma.labChemical.update({
      where: { id },
      data: {
        ...dto,
        expiryDate: dto.expiryDate ? new Date(dto.expiryDate) : undefined,
      },
    });
  }

  async deleteChemical(id: string) {
    return this.prisma.labChemical.delete({ where: { id } });
  }

  // Bookings CRUD
  async getAllBookings(schoolId: string) {
    return this.prisma.labBooking.findMany({
      where: { schoolId },
      include: {
        teacher: true,
        section: { include: { classLevel: true } },
        subject: true,
      },
      orderBy: { date: 'desc' },
    });
  }

  async createBooking(schoolId: string, teacherId: string, dto: CreateBookingDto) {
    return this.prisma.labBooking.create({
      data: {
        ...dto,
        schoolId,
        teacherId,
        date: new Date(dto.date),
        startTime: new Date(dto.startTime),
        endTime: new Date(dto.endTime),
      },
    });
  }

  async updateBookingStatus(id: string, status: string) {
    return this.prisma.labBooking.update({
      where: { id },
      data: { status },
    });
  }

  async deleteBooking(id: string) {
    return this.prisma.labBooking.delete({ where: { id } });
  }

  async getLabEquipment(schoolId: string) {
    return this.prisma.asset.findMany({
      where: {
        schoolId,
        category: {
          name: {
            contains: 'Lab',
            mode: 'insensitive',
          },
        },
      },
      include: { category: true },
      orderBy: { name: 'asc' },
    });
  }

  async createLabEquipment(schoolId: string, dto: CreateEquipmentDto) {
    let category = await this.prisma.assetCategory.findFirst({
      where: { 
        schoolId,
        name: { equals: dto.categoryName, mode: 'insensitive' }
      }
    });

    if (!category) {
      category = await this.prisma.assetCategory.create({
        data: {
          name: dto.categoryName,
          schoolId
        }
      });
    }

    return this.prisma.asset.create({
      data: {
        name: dto.name,
        quantity: dto.quantity,
        condition: dto.condition,
        categoryId: category.id,
        schoolId
      },
      include: { category: true }
    });
  }

  async updateLabEquipment(id: string, dto: Partial<CreateEquipmentDto>) {
    const updateData: any = {
      name: dto.name,
      quantity: dto.quantity,
      condition: dto.condition,
    };

    if (dto.categoryName) {
      const asset = await this.prisma.asset.findUnique({ where: { id } });
      if (!asset) throw new NotFoundException('Equipment not found');
      
      let category = await this.prisma.assetCategory.findFirst({
        where: { 
          schoolId: asset.schoolId,
          name: { equals: dto.categoryName, mode: 'insensitive' }
        }
      });

      if (!category) {
        category = await this.prisma.assetCategory.create({
          data: {
            name: dto.categoryName,
            schoolId: asset.schoolId
          }
        });
      }
      updateData.categoryId = category.id;
    }

    return this.prisma.asset.update({
      where: { id },
      data: updateData,
      include: { category: true }
    });
  }

  async deleteLabEquipment(id: string) {
    return this.prisma.asset.delete({ where: { id } });
  }
}
