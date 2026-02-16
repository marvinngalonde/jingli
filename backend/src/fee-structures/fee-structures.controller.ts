import { Controller, Get, Post, Body, Patch, Param, Delete, Query, UseGuards, Req } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth, ApiQuery } from '@nestjs/swagger';
import { FeeStructuresService } from './fee-structures.service';
import { CreateFeeStructureDto } from './dto/create-fee-structure.dto';
import { CreateFeeHeadDto } from './dto/create-fee-head.dto';
import { SupabaseGuard } from '../auth/supabase.guard';

@ApiTags('finance')
@ApiBearerAuth()
@UseGuards(SupabaseGuard)
@Controller('fee-structures')
export class FeeStructuresController {
    constructor(private readonly feeStructuresService: FeeStructuresService) { }

    // --- Fee Heads ---
    @Post('heads')
    @ApiOperation({ summary: 'Create a Fee Head (e.g. Tuition, Transport)' })
    createHead(@Req() req: any, @Body() createDto: CreateFeeHeadDto) {
        return this.feeStructuresService.createHead(createDto, req.user.schoolId);
    }

    @Get('heads')
    @ApiOperation({ summary: 'List all Fee Heads' })
    findAllHeads(@Req() req: any) {
        return this.feeStructuresService.findAllHeads(req.user.schoolId);
    }

    // --- Fee Structures ---
    @Post()
    @ApiOperation({ summary: 'Create a Fee Structure (Assign Head to Class)' })
    create(@Req() req: any, @Body() createDto: CreateFeeStructureDto) {
        return this.feeStructuresService.create(createDto, req.user.schoolId);
    }

    @Get()
    @ApiOperation({ summary: 'List Fee Structures' })
    @ApiQuery({ name: 'academicYearId', required: false })
    @ApiQuery({ name: 'classLevelId', required: false })
    findAll(
        @Req() req: any,
        @Query('academicYearId') academicYearId?: string,
        @Query('classLevelId') classLevelId?: string
    ) {
        return this.feeStructuresService.findAll(req.user.schoolId, academicYearId, classLevelId);
    }

    @Get(':id')
    @ApiOperation({ summary: 'Get Fee Structure details' })
    findOne(@Req() req: any, @Param('id') id: string) {
        return this.feeStructuresService.findOne(id, req.user.schoolId);
    }

    @Patch(':id')
    @ApiOperation({ summary: 'Update Fee Structure' })
    update(@Req() req: any, @Param('id') id: string, @Body() updateDto: any) {
        return this.feeStructuresService.update(id, updateDto, req.user.schoolId);
    }

    @Delete(':id')
    @ApiOperation({ summary: 'Delete Fee Structure' })
    remove(@Req() req: any, @Param('id') id: string) {
        return this.feeStructuresService.remove(id, req.user.schoolId);
    }
}
