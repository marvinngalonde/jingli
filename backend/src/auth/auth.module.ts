import { Module } from '@nestjs/common';
import { SupabaseGuard } from './supabase.guard';
import { SupabaseModule } from '../supabase/supabase.module';
import { PrismaModule } from '../prisma/prisma.module';

@Module({
    imports: [SupabaseModule, PrismaModule],
    providers: [SupabaseGuard],
    exports: [SupabaseGuard],
})
export class AuthModule { }
