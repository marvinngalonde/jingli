import { Controller, Get, Post, Body, Patch, Param, Delete, Query, UseGuards, Req, Res } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiQuery, ApiBearerAuth } from '@nestjs/swagger';
import { VisitorsService } from './visitors.service';
import { CreateVisitorDto, VisitorStatus } from './dto/create-visitor.dto';
import { UpdateVisitorDto } from './dto/update-visitor.dto';
import { SupabaseGuard } from '../auth/supabase.guard';
import { PdfService } from '../reports/pdf.service';
import type { Response } from 'express';

@ApiTags('visitors')
@ApiBearerAuth()
@UseGuards(SupabaseGuard)
@Controller('visitors')
export class VisitorsController {
    constructor(
        private readonly visitorsService: VisitorsService,
        private readonly pdfService: PdfService
    ) { }

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

    @Get('export/pdf')
    @ApiOperation({ summary: 'Export visitor log as PDF' })
    async exportPdf(@Req() req: any, @Res() res: Response) {
        const visitors = await this.visitorsService.findAll(req.user.schoolId);
        const rows = (visitors as any[]).map(v => ({
            name: v.name,
            phone: v.phone,
            purpose: v.purpose,
            personToMeet: v.personToMeet || '—',
            idProof: v.idProof || '—',
            vehicleNo: v.vehicleNo || '—',
            checkIn: new Date(v.checkIn).toLocaleString(),
            checkOut: v.checkOut ? new Date(v.checkOut).toLocaleString() : 'Not out',
            status: v.status,
        }));
        const columns = [
            { header: 'Name', key: 'name' },
            { header: 'Phone', key: 'phone' },
            { header: 'Purpose', key: 'purpose' },
            { header: 'Meeting', key: 'personToMeet' },
            { header: 'ID Proof', key: 'idProof' },
            { header: 'Vehicle', key: 'vehicleNo' },
            { header: 'Check In', key: 'checkIn' },
            { header: 'Check Out', key: 'checkOut' },
            { header: 'Status', key: 'status' },
        ];
        await this.pdfService.generateTablePdf('Visitor Log', columns, rows, res);
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
