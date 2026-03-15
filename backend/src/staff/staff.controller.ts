import { Controller, Get, Post, Body, Patch, Param, Delete, Query, Req, Res, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiQuery } from '@nestjs/swagger';
import { StaffService } from './staff.service';
import { CreateStaffDto } from './dto/create-staff.dto';
import { UpdateStaffDto } from './dto/update-staff.dto';
import { PdfService } from '../reports/pdf.service';
import { SupabaseGuard } from '../auth/supabase.guard';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/roles.decorator';
import { UserRole } from '@prisma/client';
import type { Response } from 'express';

@ApiTags('staff')
@UseGuards(SupabaseGuard, RolesGuard)
@Controller('staff')
export class StaffController {
    constructor(
        private readonly staffService: StaffService,
        private readonly pdfService: PdfService
    ) { }

    @Post()
    @ApiOperation({ summary: 'Create new staff member (and user account)' })
    @Roles(UserRole.HR_MANAGER, UserRole.SUPER_ADMIN)
    create(@Req() req: any, @Body() createDto: CreateStaffDto) {
        return this.staffService.create(req.user.schoolId, createDto);
    }

    @Get()
    @ApiOperation({ summary: 'Get all staff for a school' })
    @ApiQuery({ name: 'page', required: false })
    @ApiQuery({ name: 'limit', required: false })
    @Roles(UserRole.HR_MANAGER, UserRole.SCHOOL_HEAD, UserRole.DEPUTY_HEAD, UserRole.HOD, UserRole.SENIOR_CLERK, UserRole.SUPER_ADMIN)
    findAll(
        @Req() req: any,
        @Query('page') page?: string,
        @Query('limit') limit?: string
    ) {
        return this.staffService.findAll(
            req.user.schoolId,
            page ? parseInt(page) : 1,
            limit ? parseInt(limit) : 7
        );
    }

    @Get('export/pdf')
    @ApiOperation({ summary: 'Export staff directory as PDF' })
    async exportPdf(@Req() req: any, @Res() res: Response) {
        // Fetch a large number of staff for the directory export
        const paginatedResult = await this.staffService.findAll(req.user.schoolId, 1, 10000);
        const staff = paginatedResult.data;
        const rows = (staff as any[]).map(s => ({
            employeeId: s.employeeId,
            name: `${s.firstName} ${s.lastName}`,
            department: s.department,
            designation: s.designation,
            email: s.user?.email || '—',
            joined: new Date(s.joinDate).toLocaleDateString(),
        }));
        const columns = [
            { header: 'Employee ID', key: 'employeeId' },
            { header: 'Full Name', key: 'name' },
            { header: 'Department', key: 'department' },
            { header: 'Designation', key: 'designation' },
            { header: 'Email', key: 'email' },
            { header: 'Joined', key: 'joined' },
        ];
        await this.pdfService.generateTablePdf('Staff Directory', columns, rows, res);
    }

    @Get(':id')
    findOne(@Param('id') id: string) {
        return this.staffService.findOne(id);
    }

    @Patch(':id')
    @Roles(UserRole.HR_MANAGER, UserRole.SUPER_ADMIN)
    update(@Param('id') id: string, @Body() updateDto: UpdateStaffDto) {
        return this.staffService.update(id, updateDto);
    }

    @Delete(':id')
    @Roles(UserRole.HR_MANAGER, UserRole.SUPER_ADMIN)
    remove(@Param('id') id: string) {
        return this.staffService.remove(id);
    }
}
