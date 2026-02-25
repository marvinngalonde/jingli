import { Controller, Get, Post, Body, Patch, Param, Delete, Query, UseGuards, Req } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth, ApiQuery } from '@nestjs/swagger';
import { DisciplineService } from './discipline.service';
import { SupabaseGuard } from '../auth/supabase.guard';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/roles.decorator';
import { UserRole } from '@prisma/client';

@ApiTags('discipline')
@ApiBearerAuth()
@UseGuards(SupabaseGuard, RolesGuard)
@Controller('discipline')
export class DisciplineController {
    constructor(private readonly service: DisciplineService) { }

    @Post()
    @Roles(UserRole.TEACHER, UserRole.SUPER_ADMIN, UserRole.SCHOOL_HEAD)
    @ApiOperation({ summary: 'Add Discipline Record' })
    create(@Req() req: any, @Body() dto: any) { return this.service.create(dto, req.user.schoolId); }

    @Get()
    @ApiQuery({ name: 'studentId', required: false })
    @ApiQuery({ name: 'type', required: false })
    @Roles(UserRole.TEACHER, UserRole.SUPER_ADMIN, UserRole.SCHOOL_HEAD)
    @ApiOperation({ summary: 'List Records' })
    findAll(@Req() req: any, @Query('studentId') studentId?: string, @Query('type') type?: string) {
        return this.service.findAll(req.user.schoolId, studentId, type);
    }

    @Get('summary/:studentId')
    @Roles(UserRole.TEACHER, UserRole.SUPER_ADMIN, UserRole.SCHOOL_HEAD, UserRole.PARENT)
    @ApiOperation({ summary: 'Student Summary' })
    getSummary(@Req() req: any, @Param('studentId') studentId: string) {
        return this.service.getStudentSummary(req.user.schoolId, studentId);
    }

    @Patch(':id')
    @Roles(UserRole.SUPER_ADMIN, UserRole.SCHOOL_HEAD)
    update(@Req() req: any, @Param('id') id: string, @Body() dto: any) { return this.service.update(id, dto, req.user.schoolId); }

    @Delete(':id')
    @Roles(UserRole.SUPER_ADMIN)
    remove(@Req() req: any, @Param('id') id: string) { return this.service.remove(id, req.user.schoolId); }
}
