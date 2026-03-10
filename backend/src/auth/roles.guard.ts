import { Injectable, CanActivate, ExecutionContext, ForbiddenException } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { UserRole } from '@prisma/client';
import { ROLES_KEY } from './roles.decorator';

/**
 * Maps legacy role values to their modern equivalents so that
 * existing users with old roles still pass guards written for new roles.
 */
const LEGACY_ROLE_MAP: Partial<Record<UserRole, UserRole>> = {
    ADMIN: UserRole.SUPER_ADMIN,
    TEACHER: UserRole.SUBJECT_TEACHER,
    RECEPTION: UserRole.SENIOR_CLERK,
    FINANCE: UserRole.BURSAR,
};

@Injectable()
export class RolesGuard implements CanActivate {
    constructor(private reflector: Reflector) { }

    canActivate(context: ExecutionContext): boolean {
        const requiredRoles = this.reflector.getAllAndOverride<UserRole[]>(ROLES_KEY, [
            context.getHandler(),
            context.getClass(),
        ]);

        // If no @Roles() decorator is present, allow access
        if (!requiredRoles || requiredRoles.length === 0) {
            return true;
        }

        const request = context.switchToHttp().getRequest();
        const user = request.user;

        if (!user || !user.role) {
            throw new ForbiddenException('No role found on authenticated user');
        }

        const userRole = user.role as UserRole;

        // Check direct match
        if (requiredRoles.includes(userRole)) {
            return true;
        }

        // Check legacy alias match (e.g., ADMIN → SUPER_ADMIN)
        const mappedRole = LEGACY_ROLE_MAP[userRole];
        if (mappedRole && requiredRoles.includes(mappedRole)) {
            return true;
        }

        // SUPER_ADMIN, ADMIN, and SYSTEM_ADMIN always pass (superuser override)
        if (userRole === UserRole.SUPER_ADMIN || userRole === UserRole.ADMIN || userRole === UserRole.SYSTEM_ADMIN) {
            return true;
        }

        throw new ForbiddenException(
            `Role '${userRole}' does not have access to this resource. Required: ${requiredRoles.join(', ')}`,
        );
    }
}
