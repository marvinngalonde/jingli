import { Controller, Get, Post, Body, Patch, Param, Delete, Query } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiQuery } from '@nestjs/swagger';
import { StudentsService } from './students.service';
import { CreateStudentDto } from './dto/create-student.dto';
import { UpdateStudentDto } from './dto/update-student.dto';

@ApiTags('students')
@Controller('students')
export class StudentsController {
    constructor(private readonly studentsService: StudentsService) { }

    @Post()
    @ApiOperation({ summary: 'Create new student' })
    create(@Body() createDto: CreateStudentDto) {
        return this.studentsService.create(createDto);
    }

    @Get()
    @ApiOperation({ summary: 'Get all students' })
    @ApiQuery({ name: 'schoolId' })
    @ApiQuery({ name: 'sectionId', required: false })
    findAll(@Query('schoolId') schoolId: string, @Query('sectionId') sectionId?: string) {
        return this.studentsService.findAll(schoolId, sectionId);
    }

    @Get(':id')
    findOne(@Param('id') id: string) {
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
