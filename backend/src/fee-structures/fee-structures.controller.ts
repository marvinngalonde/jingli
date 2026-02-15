import { Controller, Get, Post, Body, Patch, Param, Delete, Query } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { FeeStructuresService } from './fee-structures.service';

@ApiTags('finance')
@Controller('fee-structures')
export class FeeStructuresController {
    constructor(private readonly feeStructuresService: FeeStructuresService) { }

    @Post()
    create(@Body() createDto: any) {
        return this.feeStructuresService.create(createDto);
    }

    @Get()
    findAll(@Query('school_id') schoolId: string) {
        return this.feeStructuresService.findAll(schoolId);
    }

    @Get(':id')
    findOne(@Param('id') id: string) {
        return this.feeStructuresService.findOne(id);
    }

    @Patch(':id')
    update(@Param('id') id: string, @Body() updateDto: any) {
        return this.feeStructuresService.update(id, updateDto);
    }

    @Delete(':id')
    remove(@Param('id') id: string) {
        return this.feeStructuresService.remove(id);
    }
}
