import { Controller, Get, Post, Body, Patch, Param, Delete, Query, UseGuards, Req } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth, ApiQuery } from '@nestjs/swagger';
import { FeeStructuresService } from './fee-structures.service';
import { CreateFeeStructureDto } from './dto/create-fee-structure.dto';
import { SupabaseGuard } from '../auth/supabase.guard';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/roles.decorator';
import { UserRole } from '@prisma/client';

@ApiTags('finance')
@ApiBearerAuth()
@UseGuards(SupabaseGuard, RolesGuard)
@Controller('fee-structures')
export class FeeStructuresController {
    constructor(private readonly feeStructuresService: FeeStructuresService) { }

    @Post()
    @ApiOperation({ summary: 'Create a Fee Structure (Assign Head to Class)' })
    @Roles(UserRole.BURSAR, UserRole.SUPER_ADMIN)
    create(@Req() req: any, @Body() createDto: CreateFeeStructureDto) {
        return this.feeStructuresService.create(createDto, req.user.schoolId);
    }

    @Get()
    @ApiOperation({ summary: 'List Fee Structures' })
    @ApiQuery({ name: 'academicYearId', required: false })
    @ApiQuery({ name: 'classLevelId', required: false })
    @Roles(UserRole.BURSAR, UserRole.SCHOOL_HEAD, UserRole.SUPER_ADMIN)
    findAll(
        @Req() req: any,
        @Query('academicYearId') academicYearId?: string,
        @Query('classLevelId') classLevelId?: string
    ) {
        return this.feeStructuresService.findAll(req.user.schoolId, academicYearId, classLevelId);
    }

    @Get(':id')
    @ApiOperation({ summary: 'Get Fee Structure details' })
    @Roles(UserRole.BURSAR, UserRole.SCHOOL_HEAD, UserRole.SUPER_ADMIN)
    findOne(@Req() req: any, @Param('id') id: string) {
        return this.feeStructuresService.findOne(id, req.user.schoolId);
    }

    @Patch(':id')
    @ApiOperation({ summary: 'Update Fee Structure' })
    @Roles(UserRole.BURSAR, UserRole.SUPER_ADMIN)
    update(@Req() req: any, @Param('id') id: string, @Body() updateDto: any) {
        return this.feeStructuresService.update(id, updateDto, req.user.schoolId);
    }

    @Delete(':id')
    @ApiOperation({ summary: 'Delete Fee Structure' })
    @Roles(UserRole.BURSAR, UserRole.SUPER_ADMIN)
    remove(@Req() req: any, @Param('id') id: string) {
        return this.feeStructuresService.remove(id, req.user.schoolId);
    }
}
