import { Controller, Get, Post, Patch, Delete, Body, Param, UseGuards, Req } from '@nestjs/common';
import { LabService } from './lab.service';
import { CreateChemicalDto } from './dto/create-chemical.dto';
import { CreateBookingDto } from './dto/create-booking.dto';
import { CreateEquipmentDto } from './dto/create-equipment.dto';
import { SupabaseJwtGuard } from '../auth/supabase-jwt.guard';
import { Request } from 'express';

@Controller('lab')
@UseGuards(SupabaseJwtGuard)
export class LabController {
  constructor(private readonly labService: LabService) {}

  @Get('chemicals')
  async getChemicals(@Req() req: Request & { user: any }) {
    return this.labService.getAllChemicals(req.user.schoolId);
  }

  @Post('chemicals')
  async createChemical(@Req() req: Request & { user: any }, @Body() dto: CreateChemicalDto) {
    return this.labService.createChemical(req.user.schoolId, dto);
  }

  @Patch('chemicals/:id')
  async updateChemical(@Param('id') id: string, @Body() dto: any) {
    return this.labService.updateChemical(id, dto);
  }

  @Delete('chemicals/:id')
  async deleteChemical(@Param('id') id: string) {
    return this.labService.deleteChemical(id);
  }

  @Get('bookings')
  async getBookings(@Req() req: Request & { user: any }) {
    return this.labService.getAllBookings(req.user.schoolId);
  }

  @Post('bookings')
  async createBooking(@Req() req: Request & { user: any }, @Body() dto: CreateBookingDto) {
    const user = await this.labService['prisma'].user.findUnique({
      where: { id: req.user.id },
      include: { staffProfile: true },
    });
    if (!user || !user.staffProfile) {
      throw new Error('Only staff can book lab slots');
    }
    return this.labService.createBooking(req.user.schoolId, user.staffProfile.id, dto);
  }

  @Patch('bookings/:id/status')
  async updateBookingStatus(@Param('id') id: string, @Body('status') status: string) {
    return this.labService.updateBookingStatus(id, status);
  }

  @Delete('bookings/:id')
  async deleteBooking(@Param('id') id: string) {
    return this.labService.deleteBooking(id);
  }

  @Get('equipment')
  async getEquipment(@Req() req: Request & { user: any }) {
    return this.labService.getLabEquipment(req.user.schoolId);
  }

  @Post('equipment')
  async createEquipment(@Req() req: Request & { user: any }, @Body() dto: CreateEquipmentDto) {
    return this.labService.createLabEquipment(req.user.schoolId, dto);
  }

  @Patch('equipment/:id')
  async updateEquipment(@Param('id') id: string, @Body() dto: any) {
    return this.labService.updateLabEquipment(id, dto);
  }

  @Delete('equipment/:id')
  async deleteEquipment(@Param('id') id: string) {
    return this.labService.deleteLabEquipment(id);
  }
}
