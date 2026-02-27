import { Controller, Get, Post, Body, Patch, Param, Delete, Query, UseGuards, Req } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth, ApiQuery } from '@nestjs/swagger';
import { CalaService } from './cala.service';
import { SupabaseGuard } from '../auth/supabase.guard';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/roles.decorator';
import { UserRole } from '@prisma/client';

@ApiTags('cala')
@ApiBearerAuth()
@UseGuards(SupabaseGuard, RolesGuard)
@Controller('cala')
export class CalaController {
    constructor(private readonly service: CalaService) { }

    @Post()
    @ApiOperation({ summary: 'Create CALA Record' })
    @Roles(UserRole.TEACHER, UserRole.SUPER_ADMIN, UserRole.SCHOOL_HEAD)
    create(@Req() req: any, @Body() dto: any) {
        if (!dto.assessedBy) {
            dto.assessedBy = req.user.id;
        }
        return this.service.create(dto, req.user.schoolId);
    }

    @Get()
    @ApiOperation({ summary: 'List CALA Records' })
    @ApiQuery({ name: 'subjectId', required: false })
    @ApiQuery({ name: 'termId', required: false })
    @ApiQuery({ name: 'studentId', required: false })
    @Roles(UserRole.TEACHER, UserRole.SUPER_ADMIN, UserRole.SCHOOL_HEAD)
    findAll(@Req() req: any, @Query('subjectId') subjectId?: string, @Query('termId') termId?: string, @Query('studentId') studentId?: string) {
        return this.service.findAll(req.user.schoolId, subjectId, termId, studentId);
    }

    @Get('report/:studentId/:termId')
    @ApiOperation({ summary: 'Student CALA Report' })
    @Roles(UserRole.TEACHER, UserRole.SUPER_ADMIN, UserRole.SCHOOL_HEAD, UserRole.PARENT)
    getStudentReport(@Req() req: any, @Param('studentId') studentId: string, @Param('termId') termId: string) {
        return this.service.getStudentReport(req.user.schoolId, studentId, termId);
    }

    @Patch(':id')
    @ApiOperation({ summary: 'Update CALA Record' })
    @Roles(UserRole.TEACHER, UserRole.SUPER_ADMIN)
    update(@Req() req: any, @Param('id') id: string, @Body() dto: any) {
        return this.service.update(id, dto, req.user.schoolId);
    }

    @Delete(':id')
    @ApiOperation({ summary: 'Delete CALA Record' })
    @Roles(UserRole.SUPER_ADMIN)
    remove(@Req() req: any, @Param('id') id: string) {
        return this.service.remove(id, req.user.schoolId);
    }
}
