import { Controller, Get, Post, Body, Patch, Param, Delete, Query } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { SubjectsService } from './subjects.service';

@ApiTags('academics')
@Controller('subjects')
export class SubjectsController {
    constructor(private readonly subjectsService: SubjectsService) { }

    @Post()
    create(@Body() createSubjectDto: any) {
        return this.subjectsService.create(createSubjectDto);
    }

    @Get()
    findAll(@Query('school_id') schoolId: string) {
        return this.subjectsService.findAll(schoolId);
    }

    @Get(':id')
    findOne(@Param('id') id: string) {
        return this.subjectsService.findOne(id);
    }

    @Patch(':id')
    update(@Param('id') id: string, @Body() updateSubjectDto: any) {
        return this.subjectsService.update(id, updateSubjectDto);
    }

    @Delete(':id')
    remove(@Param('id') id: string) {
        return this.subjectsService.remove(id);
    }
}
