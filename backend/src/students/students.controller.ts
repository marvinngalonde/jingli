import { Controller, Get, Post, Body, Patch, Param, Delete, Query, UseGuards, Req, Res } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiQuery, ApiBearerAuth } from '@nestjs/swagger';
import { StudentsService } from './students.service';
import { CreateStudentDto } from './dto/create-student.dto';
import { UpdateStudentDto } from './dto/update-student.dto';
import { SupabaseGuard } from '../auth/supabase.guard';
import { PdfService } from '../reports/pdf.service';
import type { Response } from 'express';

@ApiTags('students')
@ApiBearerAuth()
@UseGuards(SupabaseGuard)
@Controller('students')
export class StudentsController {
    constructor(
        private readonly studentsService: StudentsService,
        private readonly pdfService: PdfService
    ) { }

    @Post()
    @ApiOperation({ summary: 'Create new student' })
    create(@Req() req: any, @Body() createDto: CreateStudentDto) {
        createDto.schoolId = req.user.schoolId;
        return this.studentsService.create(createDto);
    }

    @Get()
    @ApiOperation({ summary: 'Get all students' })
    @ApiQuery({ name: 'sectionId', required: false })
    findAll(@Req() req: any, @Query('sectionId') sectionId?: string) {
        return this.studentsService.findAll(req.user.schoolId, sectionId);
    }

    @Get('export/pdf')
    @ApiOperation({ summary: 'Export students directory as PDF' })
    async exportPdf(@Req() req: any, @Res() res: Response) {
        const students = await this.studentsService.findAll(req.user.schoolId);
        const rows = (students as any[]).map(s => ({
            admissionNo: s.admissionNo,
            name: `${s.firstName} ${s.lastName}`,
            gender: s.gender || '—',
            status: s.status || 'Active',
            section: s.section ? `${s.section.classLevel?.name} - ${s.section.name}` : 'Unassigned',
            email: s.user?.email || '—',
            enrolled: new Date(s.enrollmentDate).toLocaleDateString(),
        }));
        const columns = [
            { header: 'Adm. No', key: 'admissionNo' },
            { header: 'Full Name', key: 'name' },
            { header: 'Gender', key: 'gender' },
            { header: 'Status', key: 'status' },
            { header: 'Class/Section', key: 'section' },
            { header: 'Email', key: 'email' },
            { header: 'Enrolled', key: 'enrolled' },
        ];
        await this.pdfService.generateTablePdf('Student Directory', columns, rows, res);
    }

    @Get(':id')
    findOne(@Param('id') id: string) {
        // TODO: Ensure student belongs to school (add robust check in service or implicit filter)
        return this.studentsService.findOne(id);
    }

    @Patch(':id')
    update(@Param('id') id: string, @Body() updateDto: UpdateStudentDto) {
        return this.studentsService.update(id, updateDto);
    }

    @Delete(':id')
    remove(@Param('id') id: string) {
        return this.studentsService.remove(id);
    }
}
