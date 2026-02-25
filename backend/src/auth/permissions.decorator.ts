import { SetMetadata } from '@nestjs/common';

export const PERMISSION_KEY = 'permission';

/**
 * Decorator to require a specific module+action permission.
 * Usage: @RequirePermission('finance', 'write')
 */
export const RequirePermission = (module: string, action: string) =>
    SetMetadata(PERMISSION_KEY, { module, action });
