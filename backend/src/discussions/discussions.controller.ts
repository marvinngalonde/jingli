import { Controller, Get, Post, Body, Param, Put, Query, UseGuards, Req } from '@nestjs/common';
import { DiscussionsService } from './discussions.service';
import { SupabaseGuard } from '../auth/supabase.guard';

@Controller('discussions')
@UseGuards(SupabaseGuard)
export class DiscussionsController {
    constructor(private readonly discussionsService: DiscussionsService) {}

    @Get()
    findAll(@Req() req: any, @Query('subjectId') subjectId?: string) {
        return this.discussionsService.findAll(req.user.schoolId, subjectId);
    }

    @Post()
    create(@Req() req: any, @Body() dto: any) {
        return this.discussionsService.create(req.user.schoolId, req.user, dto);
    }

    @Post(':id/replies')
    addReply(@Req() req: any, @Param('id') id: string, @Body() dto: any) {
        return this.discussionsService.addReply(id, req.user, dto);
    }

    @Put(':id/pin')
    togglePin(@Req() req: any, @Param('id') id: string) {
        return this.discussionsService.togglePin(id, req.user.schoolId);
    }

    @Put(':id/lock')
    toggleLock(@Req() req: any, @Param('id') id: string) {
        return this.discussionsService.toggleLock(id, req.user.schoolId);
    }
}
