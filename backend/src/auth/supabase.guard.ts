import { Injectable, CanActivate, ExecutionContext, UnauthorizedException } from '@nestjs/common';
import { SupabaseService } from '../supabase/supabase.service';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class SupabaseGuard implements CanActivate {
    constructor(
        private readonly supabaseService: SupabaseService,
        private readonly prisma: PrismaService,
    ) { }

    async canActivate(context: ExecutionContext): Promise<boolean> {
        const request = context.switchToHttp().getRequest();
        const authHeader = request.headers.authorization;

        if (!authHeader) {
            throw new UnauthorizedException('No authorization header found');
        }

        const token = authHeader.split(' ')[1];
        if (!token) {
            throw new UnauthorizedException('No token provided');
        }

        try {
            const { data: { user }, error } = await this.supabaseService.getClient().auth.getUser(token);

            if (error || !user) {
                throw new UnauthorizedException('Invalid token');
            }

            // ---------------------------------------------------------
            // MULTI-TENANCY RESOLUTION
            // ---------------------------------------------------------
            // We need to find the internal User record to get the school_id
            // In a real scenario, we might cache this or store school_id in JWT metadata.
            // For now, we query the DB.

            const internalUser = await this.prisma.user.findFirst({
                where: { email: user.email },
                select: { id: true, schoolId: true, role: true, supabaseUid: true } // Added supabaseUid to select
            });

            if (!internalUser) {
                // Option: Auto-create user if they exist in Supabase but not in DB?
                // Or throw error. For now, throw error as registration should be explicit.
                throw new UnauthorizedException('User record not found in system');
            }

            // Sync Supabase UID if missing (Lazy Linking for RLS)
            if (internalUser.supabaseUid !== user.id) {
                await this.prisma.user.update({
                    where: { id: internalUser.id },
                    data: { supabaseUid: user.id }
                });
            }

            // Attach user and tenant context to request
            request.user = {
                id: internalUser.id,
                supabaseId: user.id,
                email: user.email,
                role: internalUser.role,
                schoolId: internalUser.schoolId, // TENANT ID
            };

            return true;
        } catch (err) {
            throw new UnauthorizedException('Authentication failed');
        }
    }
}
