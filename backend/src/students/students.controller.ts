import { Controller, Get, Post, Body, Patch, Param, Delete, Query, UseGuards, Req, Res } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiQuery, ApiBearerAuth } from '@nestjs/swagger';
import { StudentsService } from './students.service';
import { CreateStudentDto } from './dto/create-student.dto';
import { UpdateStudentDto } from './dto/update-student.dto';
import { SupabaseGuard } from '../auth/supabase.guard';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/roles.decorator';
import { UserRole } from '@prisma/client';
import { PdfService } from '../reports/pdf.service';
import type { Response } from 'express';

@ApiTags('students')
@ApiBearerAuth()
@UseGuards(SupabaseGuard, RolesGuard)
@Controller('students')
export class StudentsController {
    constructor(
        private readonly studentsService: StudentsService,
        private readonly pdfService: PdfService
    ) { }

    @Post()
    @ApiOperation({ summary: 'Create new student' })
    @Roles(UserRole.SENIOR_CLERK, UserRole.DEPUTY_HEAD, UserRole.SUPER_ADMIN)
    create(@Req() req: any, @Body() createDto: CreateStudentDto) {
        createDto.schoolId = req.user.schoolId;
        return this.studentsService.create(createDto);
    }

    @Get()
    @ApiOperation({ summary: 'Get all students' })
    @ApiQuery({ name: 'sectionId', required: false })
    @ApiQuery({ name: 'teacherId', required: false })
    @Roles(UserRole.SENIOR_CLERK, UserRole.CLASS_TEACHER, UserRole.SUBJECT_TEACHER, UserRole.HOD, UserRole.SCHOOL_HEAD, UserRole.DEPUTY_HEAD, UserRole.SUPER_ADMIN, UserRole.SEN_COORDINATOR)
    findAll(@Req() req: any, @Query('sectionId') sectionId?: string, @Query('teacherId') teacherId?: string) {
        // Strict scope enforcement: if caller is a teacher, they can ONLY fetch their own students
        const role = req.user.role as UserRole;
        const isTeacher = ([UserRole.SUBJECT_TEACHER, UserRole.CLASS_TEACHER, UserRole.SENIOR_TEACHER, UserRole.HOD, UserRole.SEN_COORDINATOR] as UserRole[]).includes(role);

        // Force teacherId to be the logged-in user if they are a teacher, preventing them from querying other teachers' scopes
        const enforcedTeacherId = isTeacher ? req.user.id : teacherId;

        return this.studentsService.findAll(req.user.schoolId, sectionId, enforcedTeacherId);
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
    findOne(@Req() req: any, @Param('id') id: string) {
        return this.studentsService.findOne(id, req.user.schoolId);
    }

    @Patch(':id')
    @Roles(UserRole.SENIOR_CLERK, UserRole.DEPUTY_HEAD, UserRole.SUPER_ADMIN, UserRole.SEN_COORDINATOR)
    update(@Param('id') id: string, @Body() updateDto: UpdateStudentDto) {
        return this.studentsService.update(id, updateDto);
    }

    @Delete(':id')
    @Roles(UserRole.SUPER_ADMIN)
    remove(@Param('id') id: string) {
        return this.studentsService.remove(id);
    }
}
