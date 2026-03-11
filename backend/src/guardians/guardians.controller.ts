import { Controller, Get, Post, Body, Patch, Param, Delete, Query, UseGuards, Req } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiQuery, ApiBearerAuth } from '@nestjs/swagger';
import { GuardiansService } from './guardians.service';
import { CreateGuardianDto } from './dto/create-guardian.dto';
import { UpdateGuardianDto } from './dto/update-guardian.dto';
import { SupabaseGuard } from '../auth/supabase.guard';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/roles.decorator';
import { UserRole } from '@prisma/client';

@ApiTags('guardians')
@ApiBearerAuth()
@UseGuards(SupabaseGuard, RolesGuard)
@Controller('guardians')
export class GuardiansController {
    constructor(private readonly guardiansService: GuardiansService) { }

    @Post()
    @ApiOperation({ summary: 'Create new guardian (and user account if needed)' })
    @Roles(UserRole.SUPER_ADMIN, UserRole.SCHOOL_HEAD, UserRole.SENIOR_CLERK, UserRole.RECEPTION)
    create(@Req() req: any, @Body() createDto: CreateGuardianDto) {
        return this.guardiansService.create({ ...createDto, schoolId: req.user.schoolId });
    }

    @Get()
    @ApiOperation({ summary: 'Get all guardians' })
    @ApiQuery({ name: 'page', required: false })
    @ApiQuery({ name: 'limit', required: false })
    @Roles(UserRole.SUPER_ADMIN, UserRole.SCHOOL_HEAD, UserRole.SENIOR_CLERK, UserRole.RECEPTION)
    findAll(
        @Req() req: any,
        @Query('page') page?: string,
        @Query('limit') limit?: string
    ) {
        return this.guardiansService.findAll(
            req.user.schoolId,
            page ? parseInt(page) : 1,
            limit ? parseInt(limit) : 20
        );
    }

    @Get(':id')
    findOne(@Param('id') id: string) {
        return this.guardiansService.findOne(id);
    }

    @Patch(':id')
    update(@Param('id') id: string, @Body() updateDto: UpdateGuardianDto) {
        return this.guardiansService.update(id, updateDto);
    }

    @Delete(':id')
    remove(@Param('id') id: string) {
        return this.guardiansService.remove(id);
    }

    @Post(':id/students')
    @ApiOperation({ summary: 'Assign a student to a guardian' })
    assignStudent(
        @Param('id') guardianId: string,
        @Body() body: { studentId: string; isPrimary?: boolean }
    ) {
        return this.guardiansService.assignStudent(guardianId, body.studentId, body.isPrimary);
    }
}
