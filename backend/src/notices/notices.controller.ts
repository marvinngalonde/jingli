import { Controller, Get, Post, Body, Patch, Param, Delete, Query, Req, UseGuards } from '@nestjs/common';
import { SupabaseGuard } from '../auth/supabase.guard';
import { ApiTags, ApiOperation, ApiQuery, ApiBearerAuth } from '@nestjs/swagger';
import { NoticesService } from './notices.service';
import { CreateNoticeDto } from './dto/create-notice.dto';
import { UpdateNoticeDto } from './dto/update-notice.dto';

@ApiTags('notices')
@ApiBearerAuth()
@UseGuards(SupabaseGuard)
@Controller('notices')
export class NoticesController {
    constructor(private readonly noticesService: NoticesService) { }

    @Post()
    @ApiOperation({ summary: 'Create a notice' })
    create(@Req() req: any, @Body() createDto: CreateNoticeDto) {
        return this.noticesService.create(createDto, req.user.schoolId, req.user.id);
    }

    @Get()
    @ApiOperation({ summary: 'Get all notices' })
    @ApiQuery({ name: 'audience', required: false, description: 'Target Audience filter' })
    findAll(@Req() req: any, @Query('audience') audience?: string) {
        return this.noticesService.findAll(req.user.schoolId, audience);
    }

    @Get(':id')
    @ApiOperation({ summary: 'Get specific notice' })
    findOne(@Req() req: any, @Param('id') id: string) {
        return this.noticesService.findOne(id, req.user.schoolId);
    }

    @Patch(':id')
    update(@Req() req: any, @Param('id') id: string, @Body() updateDto: UpdateNoticeDto) {
        return this.noticesService.update(id, updateDto, req.user.schoolId);
    }

    @Delete(':id')
    remove(@Req() req: any, @Param('id') id: string) {
        return this.noticesService.remove(id, req.user.schoolId);
    }
}
