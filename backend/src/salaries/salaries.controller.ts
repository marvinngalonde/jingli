import { Controller, Get, Post, Body, Patch, Param, Delete, Query, UseGuards, Req } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth, ApiQuery } from '@nestjs/swagger';
import { SalariesService } from './salaries.service';
import { CreateSalaryPaymentDto, RunPayrollDto, UpdateSalaryPaymentDto } from './dto/salary.dto';
import { SupabaseGuard } from '../auth/supabase.guard';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/roles.decorator';
import { UserRole } from '@prisma/client';

@ApiTags('salaries')
@ApiBearerAuth()
@UseGuards(SupabaseGuard, RolesGuard)
@Controller('salaries')
export class SalariesController {
    constructor(private readonly salariesService: SalariesService) { }

    @Post()
    @ApiOperation({ summary: 'Create Salary Payment' })
    @Roles(UserRole.BURSAR, UserRole.SUPER_ADMIN)
    create(@Req() req: any, @Body() dto: CreateSalaryPaymentDto) {
        return this.salariesService.create(dto, req.user.schoolId);
    }

    @Post('run-payroll')
    @ApiOperation({ summary: 'Run Payroll (bulk create entries)' })
    @Roles(UserRole.BURSAR, UserRole.SUPER_ADMIN, UserRole.SCHOOL_HEAD)
    runPayroll(@Req() req: any, @Body() dto: RunPayrollDto) {
        return this.salariesService.runPayroll(dto, req.user.schoolId, req.user.id);
    }

    @Get()
    @ApiOperation({ summary: 'List Salary Payments' })
    @ApiQuery({ name: 'month', required: false })
    @ApiQuery({ name: 'year', required: false })
    @ApiQuery({ name: 'page', required: false })
    @ApiQuery({ name: 'limit', required: false })
    @Roles(UserRole.BURSAR, UserRole.SUPER_ADMIN, UserRole.SCHOOL_HEAD)
    findAll(
        @Req() req: any,
        @Query('month') month?: string,
        @Query('year') year?: string,
        @Query('page') page?: string,
        @Query('limit') limit?: string
    ) {
        return this.salariesService.findAll(
            req.user.schoolId,
            month ? parseInt(month) : undefined,
            year ? parseInt(year) : undefined,
            page ? parseInt(page) : 1,
            limit ? parseInt(limit) : 20,
        );
    }

    @Get('stats')
    @ApiOperation({ summary: 'Payroll Stats' })
    @Roles(UserRole.BURSAR, UserRole.SUPER_ADMIN, UserRole.SCHOOL_HEAD)
    getStats(@Req() req: any) {
        return this.salariesService.getStats(req.user.schoolId);
    }

    @Get(':id')
    @ApiOperation({ summary: 'Get Salary Payment' })
    @Roles(UserRole.BURSAR, UserRole.SUPER_ADMIN)
    findOne(@Req() req: any, @Param('id') id: string) {
        return this.salariesService.findOne(id, req.user.schoolId);
    }

    @Patch(':id')
    @ApiOperation({ summary: 'Update Salary Payment' })
    @Roles(UserRole.BURSAR, UserRole.SUPER_ADMIN)
    update(@Req() req: any, @Param('id') id: string, @Body() dto: UpdateSalaryPaymentDto) {
        return this.salariesService.update(id, dto, req.user.schoolId);
    }

    @Patch(':id/pay')
    @ApiOperation({ summary: 'Mark as Paid' })
    @Roles(UserRole.BURSAR, UserRole.SUPER_ADMIN)
    markAsPaid(@Req() req: any, @Param('id') id: string, @Body() body: { referenceNo?: string }) {
        return this.salariesService.markAsPaid(id, req.user.schoolId, req.user.id, body.referenceNo);
    }

    @Delete(':id')
    @ApiOperation({ summary: 'Delete Salary Payment' })
    @Roles(UserRole.SUPER_ADMIN)
    remove(@Req() req: any, @Param('id') id: string) {
        return this.salariesService.remove(id, req.user.schoolId);
    }
}
