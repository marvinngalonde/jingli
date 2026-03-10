import { Injectable, CanActivate, ExecutionContext, ForbiddenException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

/**
 * Guard that blocks AI endpoints for schools that have not enabled AI access.
 * Must be used AFTER SupabaseGuard (which attaches request.user).
 */
@Injectable()
export class AiEnabledGuard implements CanActivate {
    constructor(private readonly prisma: PrismaService) { }

    async canActivate(context: ExecutionContext): Promise<boolean> {
        const request = context.switchToHttp().getRequest();
        const user = request.user;

        // SYSTEM_ADMIN users bypass this check
        if (user?.role === 'SYSTEM_ADMIN') return true;

        // Users without a schoolId (e.g. system admins) pass through
        if (!user?.schoolId) return true;

        const school = await this.prisma.school.findUnique({
            where: { id: user.schoolId },
            select: { aiEnabled: true },
        });

        if (!school?.aiEnabled) {
            throw new ForbiddenException(
                'AI features are not enabled for your school. Please contact your system administrator.',
            );
        }

        return true;
    }
}
