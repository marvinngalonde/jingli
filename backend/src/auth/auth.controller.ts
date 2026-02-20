import { Controller, Post, Body, UseGuards, Request, BadRequestException } from '@nestjs/common';
import { AuthService } from './auth.service';
import { SupabaseJwtGuard } from './supabase-jwt.guard';

@Controller('auth')
export class AuthController {
    constructor(private authService: AuthService) { }

    @Post('resolve-email')
    async resolveEmail(@Body() body: { username: string }) {
        if (!body.username) {
            throw new BadRequestException('Username is required');
        }
        return this.authService.resolveEmail(body.username);
    }

    @Post('sync')
    @UseGuards(SupabaseJwtGuard) // Use JWT-only guard
    async syncUser(@Request() req: any, @Body() body: any) {
        // req.user from SupabaseGuard might not be fully populated if user is not in Prisma yet.
        // But SupabaseGuard tries to fetch Prisma user.
        // If Prisma user doesn't exist, SupabaseGuard might fail or return just the decoded token?
        // Let's check SupabaseGuard.

        // Actually, for the FIRST sync, SupabaseGuard will fail to find the Prisma user.
        // We need a Guard that only checks the JWT, not the DB user.

        // Let's handle generic JWT verification/decoding here or assume validation passed.
        // Ideally, we need a 'SupabaseAuthOnlyGuard' or similar.
        // For simplicity, let's assume the body has the data and we trust it? NO.
        // The token is in the header.

        // Wait, check SupabaseGuard implementation.
        return this.authService.syncUser(req.user, body);
    }
}
