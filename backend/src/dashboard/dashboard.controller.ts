import { Controller, Get, Query, UseGuards, Req } from '@nestjs/common';
import { DashboardService } from './dashboard.service';
import { ApiTags, ApiOperation, ApiQuery } from '@nestjs/swagger';
import { SupabaseGuard } from '../auth/supabase.guard';

@ApiTags('dashboard')
@UseGuards(SupabaseGuard)
@Controller('dashboard')
export class DashboardController {
  constructor(private readonly dashboardService: DashboardService) { }

  @Get('stats')
  @ApiOperation({ summary: 'Get dashboard statistics' })
  getStats(@Req() req: any) {
    return this.dashboardService.getStats(req.user.schoolId);
  }
}
