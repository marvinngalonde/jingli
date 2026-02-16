import { Injectable, CanActivate, ExecutionContext, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { jwtVerify } from 'jose';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class SupabaseGuard implements CanActivate {
    constructor(
        private readonly configService: ConfigService,
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
            // Verify JWT using the Supabase JWT secret
            const jwtSecret = this.configService.get<string>('SUPABASE_JWT_SECRET');
            if (!jwtSecret) {
                throw new UnauthorizedException('JWT secret not configured');
            }
            const secret = new TextEncoder().encode(jwtSecret);
            const { payload } = await jwtVerify(token, secret, {
                algorithms: ['HS256'],
            });

            const supabaseUserId = payload.sub as string;
            const email = payload.email as string;

            // ---------------------------------------------------------
            // MULTI-TENANCY RESOLUTION
            // ---------------------------------------------------------
            const internalUser = await this.prisma.user.findFirst({
                where: {
                    OR: [
                        { supabaseUid: supabaseUserId },
                        { email: email },
                    ]
                },
                select: { id: true, schoolId: true, role: true, supabaseUid: true }
            });

            if (!internalUser) {
                throw new UnauthorizedException('User record not found in system');
            }

            // Sync Supabase UID if missing (Lazy Linking for RLS)
            if (internalUser.supabaseUid !== supabaseUserId) {
                await this.prisma.user.update({
                    where: { id: internalUser.id },
                    data: { supabaseUid: supabaseUserId }
                });
            }

            // Attach user and tenant context to request
            request.user = {
                id: internalUser.id,
                supabaseId: supabaseUserId,
                email: email,
                role: internalUser.role,
                schoolId: internalUser.schoolId,
            };

            return true;
        } catch (err) {
            if (err instanceof UnauthorizedException) throw err;
            console.error('SupabaseGuard Error:', err);
            throw new UnauthorizedException('Authentication failed');
        }
    }
}

