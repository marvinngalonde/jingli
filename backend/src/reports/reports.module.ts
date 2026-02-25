import { Module } from '@nestjs/common';
import { ReportsController } from './reports.controller';
import { ReportsService } from './reports.service';
import { ReportsDataService } from './reports-data.service';
import { PdfService } from './pdf.service';
import { ZimsecExportService } from './zimsec-export.service';

@Module({
    controllers: [ReportsController],
    providers: [ReportsService, ReportsDataService, PdfService, ZimsecExportService],
    exports: [ReportsService, PdfService, ZimsecExportService],
})
export class ReportsModule { }
