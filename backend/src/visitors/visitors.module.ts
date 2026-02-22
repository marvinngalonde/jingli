import { Module } from '@nestjs/common';
import { VisitorsService } from './visitors.service';
import { VisitorsController } from './visitors.controller';
import { PrismaModule } from '../prisma/prisma.module';
import { ReportsModule } from '../reports/reports.module';

@Module({
    imports: [PrismaModule, ReportsModule],
    controllers: [VisitorsController],
    providers: [VisitorsService],
})
export class VisitorsModule { }
