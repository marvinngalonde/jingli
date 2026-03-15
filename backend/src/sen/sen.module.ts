import { Module } from '@nestjs/common';
import { SenController } from './sen.controller';
import { SenService } from './sen.service';
import { PrismaModule } from '../prisma/prisma.module';

@Module({
  imports: [PrismaModule],
  controllers: [SenController],
  providers: [SenService],
  exports: [SenService],
})
export class SenModule {}
