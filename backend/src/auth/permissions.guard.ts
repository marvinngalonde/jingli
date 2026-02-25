import { Injectable, CanActivate, ExecutionContext, ForbiddenException } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { UserRole } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { PERMISSION_KEY } from './permissions.decorator';

/**
 * Maps legacy role values to their modern equivalents.
 */
const LEGACY_ROLE_MAP: Partial<Record<UserRole, UserRole>> = {
    ADMIN: UserRole.SUPER_ADMIN,
    TEACHER: UserRole.SUBJECT_TEACHER,
    RECEPTION: UserRole.SENIOR_CLERK,
    FINANCE: UserRole.BURSAR,
};

@Injectable()
export class PermissionsGuard implements CanActivate {
    constructor(
        private reflector: Reflector,
        private prisma: PrismaService,
    ) { }

    async canActivate(context: ExecutionContext): Promise<boolean> {
        const requiredPermission = this.reflector.getAllAndOverride<{ module: string; action: string }>(
            PERMISSION_KEY,
            [context.getHandler(), context.getClass()],
        );

        // If no @RequirePermission() decorator is present, allow access
        if (!requiredPermission) {
            return true;
        }

        const request = context.switchToHttp().getRequest();
        const user = request.user;

        if (!user || !user.role) {
            throw new ForbiddenException('No role found on authenticated user');
        }

        const userRole = user.role as UserRole;

        // SUPER_ADMIN and ADMIN always pass
        if (userRole === UserRole.SUPER_ADMIN || userRole === UserRole.ADMIN) {
            return true;
        }

        // Resolve the effective role (handle legacy aliases)
        const effectiveRole = LEGACY_ROLE_MAP[userRole] || userRole;

        // Look up in the role_permissions table
        const permission = await this.prisma.rolePermission.findFirst({
            where: {
                role: effectiveRole,
                permission: {
                    module: requiredPermission.module,
                    action: requiredPermission.action,
                },
            },
        });

        // Also check the original role if it differs from effectiveRole
        if (!permission && effectiveRole !== userRole) {
            const originalCheck = await this.prisma.rolePermission.findFirst({
                where: {
                    role: userRole,
                    permission: {
                        module: requiredPermission.module,
                        action: requiredPermission.action,
                    },
                },
            });
            if (originalCheck) return true;
        }

        if (!permission) {
            throw new ForbiddenException(
                `Role '${userRole}' does not have '${requiredPermission.action}' permission on '${requiredPermission.module}' module`,
            );
        }

        return true;
    }
}
