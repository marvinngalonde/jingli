import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards, Req } from '@nestjs/common';
import { ApiTags, ApiBearerAuth } from '@nestjs/swagger';
import { AcademicYearsService } from './academic-years.service';
import { SupabaseGuard } from '../auth/supabase.guard';

@ApiTags('academics')
@ApiBearerAuth()
@UseGuards(SupabaseGuard)
@Controller('academic-years')
export class AcademicYearsController {
    constructor(private readonly academicYearsService: AcademicYearsService) { }

    @Post()
    create(@Req() req: any, @Body() createDto: any) {
        return this.academicYearsService.create(createDto, req.user.schoolId);
    }

    @Get()
    findAll(@Req() req: any) {
        return this.academicYearsService.findAll(req.user.schoolId);
    }

    @Get(':id')
    findOne(@Req() req: any, @Param('id') id: string) {
        return this.academicYearsService.findOne(id, req.user.schoolId);
    }

    @Patch(':id')
    update(@Req() req: any, @Param('id') id: string, @Body() updateDto: any) {
        return this.academicYearsService.update(id, updateDto, req.user.schoolId);
    }

    @Patch(':id/activate')
    activate(@Req() req: any, @Param('id') id: string) {
        return this.academicYearsService.activate(id, req.user.schoolId);
    }

    @Delete(':id')
    remove(@Req() req: any, @Param('id') id: string) {
        return this.academicYearsService.remove(id, req.user.schoolId);
    }
}
