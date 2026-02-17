import { Controller, Get, Post, Body, Patch, Param, Delete, Query, UseGuards, Req } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiQuery, ApiBearerAuth } from '@nestjs/swagger';
import { StudentsService } from './students.service';
import { CreateStudentDto } from './dto/create-student.dto';
import { UpdateStudentDto } from './dto/update-student.dto';
import { SupabaseGuard } from '../auth/supabase.guard';

@ApiTags('students')
@ApiBearerAuth()
@UseGuards(SupabaseGuard)
@Controller('students')
export class StudentsController {
    constructor(private readonly studentsService: StudentsService) { }

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
