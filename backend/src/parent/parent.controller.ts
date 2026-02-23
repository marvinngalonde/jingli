import { Controller, Get, Req, UseGuards, Param } from '@nestjs/common';
import { ParentService } from './parent.service';
import { SupabaseGuard } from '../auth/supabase.guard';

@Controller('parent')
@UseGuards(SupabaseGuard)
export class ParentController {
    constructor(private readonly parentService: ParentService) { }

    @Get('children')
    getChildren(@Req() req: any) {
        return this.parentService.getChildren(req.user);
    }

    @Get('dashboard-stats/:studentId')
    getDashboardStats(@Req() req: any, @Param('studentId') studentId: string) {
        return this.parentService.getDashboardStats(req.user, studentId);
    }

    @Get('performance/:studentId')
    getPerformance(@Req() req: any, @Param('studentId') studentId: string) {
        return this.parentService.getPerformance(req.user, studentId);
    }

    @Get('financials/:studentId')
    getFinancials(@Req() req: any, @Param('studentId') studentId: string) {
        return this.parentService.getFinancials(req.user, studentId);
    }
}
