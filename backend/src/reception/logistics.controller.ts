import { Controller, Get, Post, Body, UseGuards, Req } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { LogisticsService } from './logistics.service';
import { CreateGatePassDto, CreateLateArrivalDto } from './dto/logistics.dto';
import { SupabaseGuard } from '../auth/supabase.guard';

@ApiTags('logistics')
@ApiBearerAuth()
@UseGuards(SupabaseGuard)
@Controller('logistics')
export class LogisticsController {
    constructor(private readonly logisticsService: LogisticsService) { }

    @Post('gate-pass')
    @ApiOperation({ summary: 'Issue a gate pass for a student' })
    async issuePass(@Req() req: any, @Body() dto: CreateGatePassDto) {
        return this.logisticsService.createGatePass(dto, req.user.schoolId, req.user.id);
    }

    @Get('gate-pass')
    @ApiOperation({ summary: 'List all gate passes' })
    async getPasses(@Req() req: any) {
        return this.logisticsService.findAllGatePasses(req.user.schoolId);
    }

    @Post('late-arrival')
    @ApiOperation({ summary: 'Log a student late arrival' })
    async logLate(@Req() req: any, @Body() dto: CreateLateArrivalDto) {
        return this.logisticsService.createLateArrival(dto, req.user.schoolId, req.user.id);
    }

    @Get('late-arrival')
    @ApiOperation({ summary: 'List all late arrivals' })
    async getLateArrivals(@Req() req: any) {
        return this.logisticsService.findAllLateArrivals(req.user.schoolId);
    }
}
