import { Controller, Get, Post, Patch, Delete, Body, Param, UseGuards, Req } from '@nestjs/common';
import { SenService } from './sen.service';
import { SupabaseJwtGuard } from '../auth/supabase-jwt.guard';
import { Request } from 'express';

@Controller('sen')
@UseGuards(SupabaseJwtGuard)
export class SenController {
  constructor(private readonly senService: SenService) {}

  @Get('profiles')
  async getProfiles(@Req() req: Request & { user: any }) {
    return this.senService.getSenStudents(req.user.schoolId);
  }

  @Post('profiles')
  async createProfile(@Req() req: Request & { user: any }, @Body() dto: any) {
    return this.senService.createProfile(req.user.schoolId, dto);
  }

  @Patch('profiles/:id')
  async updateProfile(@Param('id') id: string, @Body() dto: any) {
    return this.senService.updateProfile(id, dto);
  }

  @Get('profiles/:id/ieps')
  async getIEPs(@Param('id') id: string) {
    return this.senService.getIEPs(id);
  }

  @Post('profiles/:id/ieps')
  async createIEP(@Param('id') id: string, @Body() dto: any) {
    return this.senService.createIEP(id, dto);
  }

  @Patch('ieps/:id')
  async updateIEP(@Param('id') id: string, @Body() dto: any) {
    return this.senService.updateIEP(id, dto);
  }

  @Delete('ieps/:id')
  async deleteIEP(@Param('id') id: string) {
    return this.senService.deleteIEP(id);
  }

  @Delete('profiles/:id')
  async deleteProfile(@Param('id') id: string) {
    return this.senService.deleteProfile(id);
  }
}
