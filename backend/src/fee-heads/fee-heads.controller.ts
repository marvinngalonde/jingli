import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards, Request } from '@nestjs/common';
import { FeeHeadsService } from './fee-heads.service';
import { CreateFeeHeadDto } from './dto/create-fee-head.dto';
import { UpdateFeeHeadDto } from './dto/update-fee-head.dto';
import { SupabaseGuard } from '../auth/supabase.guard';

@Controller('fee-heads')
@UseGuards(SupabaseGuard)
export class FeeHeadsController {
    constructor(private readonly feeHeadsService: FeeHeadsService) { }

    @Post()
    create(@Body() createFeeHeadDto: CreateFeeHeadDto, @Request() req: any) {
        return this.feeHeadsService.create(createFeeHeadDto, req.user.schoolId);
    }

    @Get()
    findAll(@Request() req: any) {
        return this.feeHeadsService.findAll(req.user.schoolId);
    }

    @Get(':id')
    findOne(@Param('id') id: string, @Request() req: any) {
        return this.feeHeadsService.findOne(id, req.user.schoolId);
    }

    @Patch(':id')
    update(@Param('id') id: string, @Body() updateFeeHeadDto: UpdateFeeHeadDto, @Request() req: any) {
        return this.feeHeadsService.update(id, updateFeeHeadDto, req.user.schoolId);
    }

    @Delete(':id')
    remove(@Param('id') id: string, @Request() req: any) {
        return this.feeHeadsService.remove(id, req.user.schoolId);
    }
}
