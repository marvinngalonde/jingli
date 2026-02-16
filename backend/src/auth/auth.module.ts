import { Module } from '@nestjs/common';
import { SupabaseGuard } from './supabase.guard';
import { SupabaseJwtGuard } from './supabase-jwt.guard';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { SupabaseModule } from '../supabase/supabase.module';
import { PrismaModule } from '../prisma/prisma.module';

@Module({
    imports: [SupabaseModule, PrismaModule],
    controllers: [AuthController],
    providers: [SupabaseGuard, SupabaseJwtGuard, AuthService],
    exports: [SupabaseGuard, AuthService],
})
export class AuthModule { }
