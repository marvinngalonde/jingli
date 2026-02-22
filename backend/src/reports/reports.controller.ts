import { Controller, Get, UseGuards, Req, Post, Body, Param, Res, NotFoundException, Delete, Query } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { ReportsService } from './reports.service';
import { ReportsDataService } from './reports-data.service';
import { PdfService } from './pdf.service';
import { SupabaseGuard } from '../auth/supabase.guard';
import type { Response } from 'express';

@ApiTags('reports')
@ApiBearerAuth()
@UseGuards(SupabaseGuard)
@Controller('reports')
export class ReportsController {
    constructor(
        private readonly reportsService: ReportsService,
        private readonly reportsDataService: ReportsDataService,
        private readonly pdfService: PdfService
    ) { }

    @Get('history')
    @ApiOperation({ summary: 'Get report generation history' })
    getHistory(@Req() req: any) {
        return this.reportsService.getReportHistory(req.user.schoolId);
    }

    @Get('stats')
    @ApiOperation({ summary: 'Get reporting stats' })
    getStats(@Req() req: any) {
        return this.reportsService.getStats(req.user.schoolId);
    }

    @Post('generate')
    @ApiOperation({ summary: 'Generate a new report' })
    generate(@Req() req: any, @Body() data: any) {
        return this.reportsService.generateReport(req.user.schoolId, req.user.username || 'Admin', data);
    }

    // ─── Live data report endpoints ─────────────────────────────────────────────

    @Get('data')
    @ApiOperation({ summary: 'Get tabular report data (JSON rows)' })
    async getData(
        @Req() req: any,
        @Query('type') type: string,
        @Query() filters: Record<string, string>
    ) {
        const { type: _t, ...rest } = filters;
        return this.reportsDataService.getReport(type, req.user.schoolId, rest);
    }

    @Get('data/pdf')
    @ApiOperation({ summary: 'Download tabular report as PDF' })
    async getDataPdf(
        @Req() req: any,
        @Query('type') type: string,
        @Query() filters: Record<string, string>,
        @Res() res: Response
    ) {
        const { type: _t, ...rest } = filters;
        const result = await this.reportsDataService.getReport(type, req.user.schoolId, rest);
        await this.pdfService.generateTablePdf(result.title, result.columns, result.rows, res);
    }

    @Get(':id')
    @ApiOperation({ summary: 'Get specific report details' })
    findOne(@Req() req: any, @Param('id') id: string) {
        return this.reportsService.getReportById(id, req.user.schoolId);
    }

    @Get(':id/pdf')
    @ApiOperation({ summary: 'Download report as PDF' })
    async downloadPdf(@Req() req: any, @Param('id') id: string, @Res() res: Response) {
        const report = await this.reportsService.getReportById(id, req.user.schoolId);
        if (!report) {
            throw new NotFoundException('Report not found');
        }

        await this.pdfService.generateReportPdf(report, res);
    }

    @Delete(':id')
    @ApiOperation({ summary: 'Delete a generated report log' })
    async remove(@Req() req: any, @Param('id') id: string) {
        return this.reportsService.deleteReport(id, req.user.schoolId);
    }
}
