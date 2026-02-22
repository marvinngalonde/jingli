import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards, Query, Req } from '@nestjs/common';
import { EventsService } from './events.service';
import { CreateEventDto } from './dto/create-event.dto';
import { UpdateEventDto } from './dto/update-event.dto';
import { SupabaseGuard } from '../auth/supabase.guard';

@Controller('events')
@UseGuards(SupabaseGuard)
export class EventsController {
    constructor(private readonly eventsService: EventsService) { }

    @Post()
    create(@Req() req: any, @Body() createDto: CreateEventDto) {
        return this.eventsService.create(createDto, req.user.schoolId);
    }

    @Get()
    findAll(
        @Req() req: any,
        @Query('start') start?: string,
        @Query('end') end?: string
    ) {
        return this.eventsService.findAll(req.user.schoolId, start, end);
    }

    @Get(':id')
    findOne(@Req() req: any, @Param('id') id: string) {
        return this.eventsService.findOne(id, req.user.schoolId);
    }

    @Patch(':id')
    update(
        @Req() req: any,
        @Param('id') id: string,
        @Body() updateDto: UpdateEventDto
    ) {
        return this.eventsService.update(id, updateDto, req.user.schoolId);
    }

    @Delete(':id')
    remove(@Req() req: any, @Param('id') id: string) {
        return this.eventsService.remove(id, req.user.schoolId);
    }
}
