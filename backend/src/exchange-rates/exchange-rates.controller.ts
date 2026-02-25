import { Controller, Get, Post, Body, Param, Delete, Query, UseGuards, Req } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth, ApiQuery } from '@nestjs/swagger';
import { ExchangeRatesService } from './exchange-rates.service';
import { CreateExchangeRateDto } from './dto/exchange-rate.dto';
import { SupabaseGuard } from '../auth/supabase.guard';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/roles.decorator';
import { UserRole } from '@prisma/client';

@ApiTags('exchange-rates')
@ApiBearerAuth()
@UseGuards(SupabaseGuard, RolesGuard)
@Controller('exchange-rates')
export class ExchangeRatesController {
    constructor(private readonly service: ExchangeRatesService) { }

    @Post()
    @ApiOperation({ summary: 'Create Exchange Rate' })
    @Roles(UserRole.BURSAR, UserRole.SUPER_ADMIN)
    create(@Req() req: any, @Body() dto: CreateExchangeRateDto) {
        return this.service.create(dto, req.user.schoolId);
    }

    @Get()
    @ApiOperation({ summary: 'List Exchange Rates' })
    @Roles(UserRole.BURSAR, UserRole.SUPER_ADMIN, UserRole.SCHOOL_HEAD)
    findAll(@Req() req: any) {
        return this.service.findAll(req.user.schoolId);
    }

    @Get('latest')
    @ApiOperation({ summary: 'Get Latest Rate' })
    @ApiQuery({ name: 'from', required: true })
    @ApiQuery({ name: 'to', required: true })
    @Roles(UserRole.BURSAR, UserRole.SUPER_ADMIN, UserRole.SCHOOL_HEAD)
    getLatest(@Req() req: any, @Query('from') from: string, @Query('to') to: string) {
        return this.service.getLatest(req.user.schoolId, from, to);
    }

    @Get('convert')
    @ApiOperation({ summary: 'Convert Currency' })
    @ApiQuery({ name: 'amount', required: true })
    @ApiQuery({ name: 'from', required: true })
    @ApiQuery({ name: 'to', required: true })
    @Roles(UserRole.BURSAR, UserRole.SUPER_ADMIN, UserRole.SCHOOL_HEAD)
    convert(@Req() req: any, @Query('amount') amount: string, @Query('from') from: string, @Query('to') to: string) {
        return this.service.convert(req.user.schoolId, parseFloat(amount), from, to);
    }

    @Delete(':id')
    @ApiOperation({ summary: 'Delete Exchange Rate' })
    @Roles(UserRole.BURSAR, UserRole.SUPER_ADMIN)
    remove(@Req() req: any, @Param('id') id: string) {
        return this.service.remove(id, req.user.schoolId);
    }
}
