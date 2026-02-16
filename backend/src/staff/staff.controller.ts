import { Controller, Get, Post, Body, Patch, Param, Delete, Query } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiQuery } from '@nestjs/swagger';
import { StaffService } from './staff.service';
import { CreateStaffDto } from './dto/create-staff.dto';
import { UpdateStaffDto } from './dto/update-staff.dto';

@ApiTags('staff')
@Controller('staff')
export class StaffController {
    constructor(private readonly staffService: StaffService) { }

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
