import { Injectable, CanActivate, ExecutionContext, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { jwtVerify } from 'jose';
import { SupabaseService } from '../supabase/supabase.service';

@Injectable()
export class SupabaseJwtGuard implements CanActivate {
    constructor(
        private readonly supabaseService: SupabaseService,
        private readonly configService: ConfigService,
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
            // Self-hosted Supabase uses HS256 with a dedicated JWT secret
            const jwtSecret = this.configService.get<string>('SUPABASE_JWT_SECRET');

            if (!jwtSecret) {
                throw new UnauthorizedException('JWT secret not configured');
            }

            // Convert the JWT secret to the proper format for jose
            const secret = new TextEncoder().encode(jwtSecret);

            // Verify the JWT using HS256
            const { payload } = await jwtVerify(token, secret, {
                algorithms: ['HS256'],
            });

            console.log('JWT verified successfully for user:', payload.sub);

            // Attach basic user info from JWT payload
            request.user = {
                id: payload.sub, // Supabase user ID
                email: payload.email,
            };

            return true;
        } catch (err) {
            console.error('JWT Verification Error:', err);
            throw new UnauthorizedException('Authentication failed');
        }
    }
}
