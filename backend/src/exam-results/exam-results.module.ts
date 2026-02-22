import { Module } from '@nestjs/common';
import { ExamResultsService } from './exam-results.service';
import { ExamResultsController } from './exam-results.controller';
import { PrismaModule } from '../prisma/prisma.module';
import { NotificationsModule } from '../notifications/notifications.module';

@Module({
    imports: [PrismaModule, NotificationsModule],
    controllers: [ExamResultsController],
    providers: [ExamResultsService],
})
export class ExamResultsModule { }
