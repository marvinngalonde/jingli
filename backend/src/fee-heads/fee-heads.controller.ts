import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards, Request } from '@nestjs/common';
import { FeeHeadsService } from './fee-heads.service';
import { CreateFeeHeadDto } from './dto/create-fee-head.dto';
import { UpdateFeeHeadDto } from './dto/update-fee-head.dto';
import { SupabaseGuard } from '../auth/supabase.guard';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/roles.decorator';
import { UserRole } from '@prisma/client';

@Controller('fee-heads')
@UseGuards(SupabaseGuard, RolesGuard)
export class FeeHeadsController {
    constructor(private readonly feeHeadsService: FeeHeadsService) { }

    @Post()
    @Roles(UserRole.BURSAR, UserRole.SUPER_ADMIN)
    create(@Body() createFeeHeadDto: CreateFeeHeadDto, @Request() req: any) {
        return this.feeHeadsService.create(createFeeHeadDto, req.user.schoolId);
    }

    @Get()
    @Roles(UserRole.BURSAR, UserRole.SCHOOL_HEAD, UserRole.SUPER_ADMIN)
    findAll(@Request() req: any) {
        return this.feeHeadsService.findAll(req.user.schoolId);
    }

    @Get(':id')
    @Roles(UserRole.BURSAR, UserRole.SCHOOL_HEAD, UserRole.SUPER_ADMIN)
    findOne(@Param('id') id: string, @Request() req: any) {
        return this.feeHeadsService.findOne(id, req.user.schoolId);
    }

    @Patch(':id')
    @Roles(UserRole.BURSAR, UserRole.SUPER_ADMIN)
    update(@Param('id') id: string, @Body() updateFeeHeadDto: UpdateFeeHeadDto, @Request() req: any) {
        return this.feeHeadsService.update(id, updateFeeHeadDto, req.user.schoolId);
    }

    @Delete(':id')
    @Roles(UserRole.BURSAR, UserRole.SUPER_ADMIN)
    remove(@Param('id') id: string, @Request() req: any) {
        return this.feeHeadsService.remove(id, req.user.schoolId);
    }
}
