import { Controller, Get, Patch, Param, UseGuards, Req, Query } from '@nestjs/common';
import { NotificationsService } from './notifications.service';
import { SupabaseJwtGuard } from '../auth/supabase-jwt.guard';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';

@ApiTags('Notifications')
@ApiBearerAuth()
@UseGuards(SupabaseJwtGuard)
@Controller('notifications')
export class NotificationsController {
    constructor(private readonly notificationsService: NotificationsService) { }

    @Get()
    @ApiOperation({ summary: 'Get recent notifications for the current user' })
    async getNotifications(@Req() req: any, @Query('unreadOnly') unreadOnly?: boolean) {
        return this.notificationsService.getUserNotifications(req.user.userId, unreadOnly === true || unreadOnly === 'true' as any);
    }

    @Get('unread-count')
    @ApiOperation({ summary: 'Get total unread notifications count' })
    async getUnreadCount(@Req() req: any) {
        const count = await this.notificationsService.getUnreadCount(req.user.userId);
        return { count };
    }

    @Patch(':id/read')
    @ApiOperation({ summary: 'Mark a specific notification as read' })
    async markAsRead(@Req() req: any, @Param('id') id: string) {
        return this.notificationsService.markAsRead(id, req.user.userId);
    }

    @Patch('read-all')
    @ApiOperation({ summary: 'Mark all notifications as read for current user' })
    async markAllAsRead(@Req() req: any) {
        return this.notificationsService.markAllAsRead(req.user.userId);
    }
}
