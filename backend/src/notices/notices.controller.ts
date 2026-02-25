import { Controller, Get, Post, Body, Patch, Param, Delete, Query, Req, UseGuards } from '@nestjs/common';
import { SupabaseGuard } from '../auth/supabase.guard';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/roles.decorator';
import { UserRole } from '@prisma/client';
import { ApiTags, ApiOperation, ApiQuery, ApiBearerAuth } from '@nestjs/swagger';
import { NoticesService } from './notices.service';
import { CreateNoticeDto } from './dto/create-notice.dto';
import { UpdateNoticeDto } from './dto/update-notice.dto';

@ApiTags('notices')
@ApiBearerAuth()
@UseGuards(SupabaseGuard, RolesGuard)
@Controller('notices')
export class NoticesController {
    constructor(private readonly noticesService: NoticesService) { }

    @Post()
    @ApiOperation({ summary: 'Create a notice' })
    @Roles(UserRole.SCHOOL_HEAD, UserRole.DEPUTY_HEAD, UserRole.HOD, UserRole.SENIOR_CLERK, UserRole.SUPER_ADMIN)
    create(@Req() req: any, @Body() createDto: CreateNoticeDto) {
        return this.noticesService.create(createDto, req.user.schoolId, req.user.id);
    }

    @Get()
    @ApiOperation({ summary: 'Get all notices' })
    @ApiQuery({ name: 'audience', required: false, description: 'Target Audience filter' })
    findAll(@Req() req: any, @Query('audience') audience?: string) {
        // All authenticated users can read notices — no @Roles restriction
        return this.noticesService.findAll(req.user.schoolId, audience);
    }

    @Get(':id')
    @ApiOperation({ summary: 'Get specific notice' })
    findOne(@Req() req: any, @Param('id') id: string) {
        return this.noticesService.findOne(id, req.user.schoolId);
    }

    @Patch(':id')
    @Roles(UserRole.SCHOOL_HEAD, UserRole.DEPUTY_HEAD, UserRole.HOD, UserRole.SUPER_ADMIN)
    update(@Req() req: any, @Param('id') id: string, @Body() updateDto: UpdateNoticeDto) {
        return this.noticesService.update(id, updateDto, req.user.schoolId);
    }

    @Delete(':id')
    @Roles(UserRole.SCHOOL_HEAD, UserRole.SUPER_ADMIN)
    remove(@Req() req: any, @Param('id') id: string) {
        return this.noticesService.remove(id, req.user.schoolId);
    }
}
