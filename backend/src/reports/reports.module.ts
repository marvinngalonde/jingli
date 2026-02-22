import { Module } from '@nestjs/common';
import { ReportsController } from './reports.controller';
import { ReportsService } from './reports.service';
import { ReportsDataService } from './reports-data.service';
import { PdfService } from './pdf.service';

@Module({
    controllers: [ReportsController],
    providers: [ReportsService, ReportsDataService, PdfService],
    exports: [ReportsService, PdfService],
})
export class ReportsModule { }
