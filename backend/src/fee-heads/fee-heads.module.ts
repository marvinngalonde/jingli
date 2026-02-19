import { Module } from '@nestjs/common';
import { FeeHeadsService } from './fee-heads.service';
import { FeeHeadsController } from './fee-heads.controller';

@Module({
    controllers: [FeeHeadsController],
    providers: [FeeHeadsService],
    exports: [FeeHeadsService],
})
export class FeeHeadsModule { }
