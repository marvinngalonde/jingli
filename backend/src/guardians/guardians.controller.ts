import { Controller, Get, Post, Body, Patch, Param, Delete, Query } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiQuery } from '@nestjs/swagger';
import { GuardiansService } from './guardians.service';
import { CreateGuardianDto } from './dto/create-guardian.dto';
import { UpdateGuardianDto } from './dto/update-guardian.dto';

@ApiTags('guardians')
@Controller('guardians')
export class GuardiansController {
    constructor(private readonly guardiansService: GuardiansService) { }

    @Post()
    @ApiOperation({ summary: 'Create new guardian (and user account if needed)' })
    create(@Body() createDto: CreateGuardianDto) {
        return this.guardiansService.create(createDto);
    }

    @Get()
    @ApiOperation({ summary: 'Get all guardians' })
    @ApiQuery({ name: 'schoolId' })
    findAll(@Query('schoolId') schoolId: string) {
        return this.guardiansService.findAll(schoolId);
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
