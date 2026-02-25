import { Module } from '@nestjs/common';
import { CalaController } from './cala.controller';
import { CalaService } from './cala.service';
import { PrismaModule } from '../prisma/prisma.module';

@Module({
    imports: [PrismaModule],
    controllers: [CalaController],
    providers: [CalaService],
    exports: [CalaService],
})
export class CalaModule { }
