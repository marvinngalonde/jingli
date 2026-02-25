import { Controller, Get, Post, Body, Param, Delete, UseGuards, Req } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { GradeScalesService } from './grade-scales.service';
import { SupabaseGuard } from '../auth/supabase.guard';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/roles.decorator';
import { UserRole } from '@prisma/client';

@ApiTags('grade-scales')
@ApiBearerAuth()
@UseGuards(SupabaseGuard, RolesGuard)
@Controller('grade-scales')
export class GradeScalesController {
    constructor(private readonly service: GradeScalesService) { }

    @Post()
    @Roles(UserRole.SUPER_ADMIN, UserRole.SCHOOL_HEAD)
    @ApiOperation({ summary: 'Create Grade Scale with Ranges' })
    create(@Req() req: any, @Body() dto: any) { return this.service.create(dto, req.user.schoolId); }

    @Get()
    @Roles(UserRole.SUPER_ADMIN, UserRole.SCHOOL_HEAD, UserRole.TEACHER)
    @ApiOperation({ summary: 'List Grade Scales' })
    findAll(@Req() req: any) { return this.service.findAll(req.user.schoolId); }

    @Get(':id')
    @Roles(UserRole.SUPER_ADMIN, UserRole.SCHOOL_HEAD, UserRole.TEACHER)
    @ApiOperation({ summary: 'Get Grade Scale' })
    findOne(@Req() req: any, @Param('id') id: string) { return this.service.findOne(id, req.user.schoolId); }

    @Delete(':id')
    @Roles(UserRole.SUPER_ADMIN)
    @ApiOperation({ summary: 'Delete Grade Scale' })
    remove(@Req() req: any, @Param('id') id: string) { return this.service.remove(id, req.user.schoolId); }
}
