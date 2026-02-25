import { Module } from '@nestjs/common';
import { GradeScalesController } from './grade-scales.controller';
import { GradeScalesService } from './grade-scales.service';
import { PrismaModule } from '../prisma/prisma.module';

@Module({
    imports: [PrismaModule],
    controllers: [GradeScalesController],
    providers: [GradeScalesService],
    exports: [GradeScalesService],
})
export class GradeScalesModule { }
