import { Controller, Get, Post, Body, Patch, Param, Delete, Query, UseGuards, Req, Res } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiQuery, ApiBearerAuth } from '@nestjs/swagger';
import { VisitorsService } from './visitors.service';
import { CreateVisitorDto, VisitorStatus } from './dto/create-visitor.dto';
import { UpdateVisitorDto } from './dto/update-visitor.dto';
import { SupabaseGuard } from '../auth/supabase.guard';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/roles.decorator';
import { UserRole } from '@prisma/client';
import { PdfService } from '../reports/pdf.service';
import type { Response } from 'express';

@ApiTags('visitors')
@ApiBearerAuth()
@UseGuards(SupabaseGuard, RolesGuard)
@Controller('visitors')
export class VisitorsController {
    constructor(
        private readonly visitorsService: VisitorsService,
        private readonly pdfService: PdfService
    ) { }

    @Post()
    @ApiOperation({ summary: 'Register a visitor' })
    @Roles(UserRole.SECURITY_GUARD, UserRole.SENIOR_CLERK, UserRole.DEPUTY_HEAD, UserRole.SUPER_ADMIN)
    create(@Req() req: any, @Body() createDto: CreateVisitorDto) {
        return this.visitorsService.create(createDto, req.user.schoolId);
    }

    @Get()
    @ApiOperation({ summary: 'Get all visitors' })
    @ApiQuery({ name: 'status', required: false, enum: VisitorStatus })
    @ApiQuery({ name: 'page', required: false })
    @ApiQuery({ name: 'limit', required: false })
    @Roles(UserRole.SECURITY_GUARD, UserRole.SENIOR_CLERK, UserRole.DEPUTY_HEAD, UserRole.SCHOOL_HEAD, UserRole.SUPER_ADMIN)
    findAll(
        @Req() req: any,
        @Query('status') status?: VisitorStatus,
        @Query('page') page?: string,
        @Query('limit') limit?: string
    ) {
        return this.visitorsService.findAll(
            req.user.schoolId,
            status,
            page ? parseInt(page) : 1,
            limit ? parseInt(limit) : 7
        );
    }

    @Get('export/pdf')
    @ApiOperation({ summary: 'Export visitor log as PDF' })
    @Roles(UserRole.SECURITY_GUARD, UserRole.SENIOR_CLERK, UserRole.DEPUTY_HEAD, UserRole.SCHOOL_HEAD, UserRole.SUPER_ADMIN)
    async exportPdf(@Req() req: any, @Res() res: Response) {
        const result = await this.visitorsService.findAll(req.user.schoolId, undefined, 1, 10000);
        const visitors = result.data;
        const rows = visitors.map(v => ({
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
    @Roles(UserRole.SECURITY_GUARD, UserRole.SENIOR_CLERK, UserRole.DEPUTY_HEAD, UserRole.SCHOOL_HEAD, UserRole.SUPER_ADMIN)
    findOne(@Req() req: any, @Param('id') id: string) {
        return this.visitorsService.findOne(id, req.user.schoolId);
    }

    @Patch(':id')
    @ApiOperation({ summary: 'Update visitor details' })
    @Roles(UserRole.SECURITY_GUARD, UserRole.SENIOR_CLERK, UserRole.DEPUTY_HEAD, UserRole.SUPER_ADMIN)
    update(@Req() req: any, @Param('id') id: string, @Body() updateDto: UpdateVisitorDto) {
        return this.visitorsService.update(id, updateDto, req.user.schoolId);
    }

    @Patch(':id/checkout')
    @ApiOperation({ summary: 'Checkout a visitor' })
    @Roles(UserRole.SECURITY_GUARD, UserRole.SENIOR_CLERK, UserRole.SUPER_ADMIN)
    checkout(@Req() req: any, @Param('id') id: string) {
        return this.visitorsService.checkout(id, req.user.schoolId);
    }

    @Delete(':id')
    @Roles(UserRole.DEPUTY_HEAD, UserRole.SUPER_ADMIN)
    remove(@Req() req: any, @Param('id') id: string) {
        return this.visitorsService.remove(id, req.user.schoolId);
    }
}
