import { Controller, Get, Post, Body, Patch, Param, Delete, Query } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { AcademicYearsService } from './academic-years.service';

@ApiTags('academics')
@Controller('academic-years')
export class AcademicYearsController {
    constructor(private readonly academicYearsService: AcademicYearsService) { }

    @Post()
    create(@Body() createDto: any) {
        return this.academicYearsService.create(createDto);
    }

    @Get()
    findAll(@Query('school_id') schoolId: string) {
        return this.academicYearsService.findAll(schoolId);
    }

    @Get(':id')
    findOne(@Param('id') id: string) {
        return this.academicYearsService.findOne(id);
    }

    @Patch(':id')
    update(@Param('id') id: string, @Body() updateDto: any) {
        return this.academicYearsService.update(id, updateDto);
    }

    @Delete(':id')
    remove(@Param('id') id: string) {
        return this.academicYearsService.remove(id);
    }
}
