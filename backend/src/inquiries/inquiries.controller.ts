import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards, Req, Query } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth, ApiQuery } from '@nestjs/swagger';
import { InquiriesService } from './inquiries.service';
import { CreateInquiryDto } from './dto/create-inquiry.dto';
import { UpdateInquiryDto } from './dto/update-inquiry.dto';
import { SupabaseGuard } from '../auth/supabase.guard';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/roles.decorator';
import { UserRole } from '@prisma/client';

@ApiTags('inquiries')
@ApiBearerAuth()
@UseGuards(SupabaseGuard, RolesGuard)
@Controller('inquiries')
export class InquiriesController {
    constructor(private readonly inquiriesService: InquiriesService) { }

    @Post()
    @ApiOperation({ summary: 'Create new inquiry' })
    @Roles(UserRole.RECEPTION, UserRole.SENIOR_CLERK, UserRole.ADMIN, UserRole.SUPER_ADMIN)
    create(@Req() req: any, @Body() createDto: CreateInquiryDto) {
        createDto.schoolId = req.user.schoolId;
        return this.inquiriesService.create(createDto);
    }

    @Get()
    @ApiOperation({ summary: 'Get all inquiries' })
    @ApiQuery({ name: 'page', required: false })
    @ApiQuery({ name: 'limit', required: false })
    @Roles(UserRole.RECEPTION, UserRole.SENIOR_CLERK, UserRole.ADMIN, UserRole.SUPER_ADMIN)
    findAll(
        @Req() req: any,
        @Query('page') page?: string,
        @Query('limit') limit?: string
    ) {
        return this.inquiriesService.findAll(
            req.user.schoolId,
            page ? parseInt(page) : 1,
            limit ? parseInt(limit) : 20
        );
    }

    @Get(':id')
    findOne(@Param('id') id: string) {
        return this.inquiriesService.findOne(id);
    }

    @Patch(':id')
    @Roles(UserRole.RECEPTION, UserRole.SENIOR_CLERK, UserRole.ADMIN, UserRole.SUPER_ADMIN)
    update(@Param('id') id: string, @Body() updateDto: UpdateInquiryDto) {
        return this.inquiriesService.update(id, updateDto);
    }

    @Delete(':id')
    @Roles(UserRole.ADMIN, UserRole.SUPER_ADMIN)
    remove(@Param('id') id: string) {
        return this.inquiriesService.remove(id);
    }
}
