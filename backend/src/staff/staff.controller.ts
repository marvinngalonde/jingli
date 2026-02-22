import { Controller, Get, Post, Body, Patch, Param, Delete, Query, Req, Res, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiQuery } from '@nestjs/swagger';
import { StaffService } from './staff.service';
import { CreateStaffDto } from './dto/create-staff.dto';
import { UpdateStaffDto } from './dto/update-staff.dto';
import { PdfService } from '../reports/pdf.service';
import { SupabaseGuard } from '../auth/supabase.guard';
import type { Response } from 'express';

@ApiTags('staff')
@UseGuards(SupabaseGuard)
@Controller('staff')
export class StaffController {
    constructor(
        private readonly staffService: StaffService,
        private readonly pdfService: PdfService
    ) { }

    @Post()
    @ApiOperation({ summary: 'Create new staff member (and user account)' })
    create(@Body() createDto: CreateStaffDto) {
        return this.staffService.create(createDto);
    }

    @Get()
    @ApiOperation({ summary: 'Get all staff for a school' })
    @ApiQuery({ name: 'schoolId' })
    findAll(@Query('schoolId') schoolId: string) {
        return this.staffService.findAll(schoolId);
    }

    @Get('export/pdf')
    @ApiOperation({ summary: 'Export staff directory as PDF' })
    async exportPdf(@Query('schoolId') schoolId: string, @Res() res: Response) {
        const staff = await this.staffService.findAll(schoolId);
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
    update(@Param('id') id: string, @Body() updateDto: UpdateStaffDto) {
        return this.staffService.update(id, updateDto);
    }

    @Delete(':id')
    remove(@Param('id') id: string) {
        return this.staffService.remove(id);
    }
}
