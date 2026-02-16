import { Controller, Get, Post, Body, Patch, Param, Delete, Query, UseGuards, Req } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiQuery, ApiBearerAuth } from '@nestjs/swagger';
import { VisitorsService } from './visitors.service';
import { CreateVisitorDto, VisitorStatus } from './dto/create-visitor.dto';
import { UpdateVisitorDto } from './dto/update-visitor.dto';
import { SupabaseGuard } from '../auth/supabase.guard';

@ApiTags('visitors')
@ApiBearerAuth()
@UseGuards(SupabaseGuard)
@Controller('visitors')
export class VisitorsController {
    constructor(private readonly visitorsService: VisitorsService) { }

    @Post()
    @ApiOperation({ summary: 'Register a visitor' })
    create(@Req() req: any, @Body() createDto: CreateVisitorDto) {
        return this.visitorsService.create(createDto, req.user.schoolId);
    }

    @Get()
    @ApiOperation({ summary: 'Get all visitors' })
    @ApiQuery({ name: 'status', required: false, enum: VisitorStatus })
    findAll(@Req() req: any, @Query('status') status?: VisitorStatus) {
        return this.visitorsService.findAll(req.user.schoolId, status);
    }

    @Get(':id')
    @ApiOperation({ summary: 'Get specific visitor' })
    findOne(@Req() req: any, @Param('id') id: string) {
        return this.visitorsService.findOne(id, req.user.schoolId);
    }

    @Patch(':id')
    @ApiOperation({ summary: 'Update visitor details' })
    update(@Req() req: any, @Param('id') id: string, @Body() updateDto: UpdateVisitorDto) {
        return this.visitorsService.update(id, updateDto, req.user.schoolId);
    }

    @Patch(':id/checkout')
    @ApiOperation({ summary: 'Checkout a visitor' })
    checkout(@Req() req: any, @Param('id') id: string) {
        return this.visitorsService.checkout(id, req.user.schoolId);
    }

    @Delete(':id')
    remove(@Req() req: any, @Param('id') id: string) {
        return this.visitorsService.remove(id, req.user.schoolId);
    }
}
