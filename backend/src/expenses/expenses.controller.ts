import { Controller, Get, Post, Body, Patch, Param, Delete, Query, UseGuards, Req } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth, ApiQuery } from '@nestjs/swagger';
import { ExpensesService } from './expenses.service';
import { CreateExpenseDto, UpdateExpenseDto } from './dto/expense.dto';
import { SupabaseGuard } from '../auth/supabase.guard';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/roles.decorator';
import { UserRole } from '@prisma/client';

@ApiTags('expenses')
@ApiBearerAuth()
@UseGuards(SupabaseGuard, RolesGuard)
@Controller('expenses')
export class ExpensesController {
    constructor(private readonly expensesService: ExpensesService) { }

    @Post()
    @ApiOperation({ summary: 'Record Expense' })
    @Roles(UserRole.BURSAR, UserRole.SUPER_ADMIN, UserRole.SCHOOL_HEAD)
    create(@Req() req: any, @Body() dto: CreateExpenseDto) {
        return this.expensesService.create(dto, req.user.schoolId);
    }

    @Get()
    @ApiOperation({ summary: 'List Expenses' })
    @ApiQuery({ name: 'category', required: false })
    @ApiQuery({ name: 'status', required: false })
    @Roles(UserRole.BURSAR, UserRole.SUPER_ADMIN, UserRole.SCHOOL_HEAD)
    findAll(@Req() req: any, @Query('category') category?: string, @Query('status') status?: string) {
        return this.expensesService.findAll(req.user.schoolId, category, status);
    }

    @Get('stats')
    @ApiOperation({ summary: 'Expense Stats' })
    @Roles(UserRole.BURSAR, UserRole.SUPER_ADMIN, UserRole.SCHOOL_HEAD)
    getStats(@Req() req: any) {
        return this.expensesService.getStats(req.user.schoolId);
    }

    @Get(':id')
    @ApiOperation({ summary: 'Get Expense' })
    @Roles(UserRole.BURSAR, UserRole.SUPER_ADMIN, UserRole.SCHOOL_HEAD)
    findOne(@Req() req: any, @Param('id') id: string) {
        return this.expensesService.findOne(id, req.user.schoolId);
    }

    @Patch(':id')
    @ApiOperation({ summary: 'Update Expense' })
    @Roles(UserRole.BURSAR, UserRole.SUPER_ADMIN)
    update(@Req() req: any, @Param('id') id: string, @Body() dto: UpdateExpenseDto) {
        return this.expensesService.update(id, dto, req.user.schoolId);
    }

    @Patch(':id/approve')
    @ApiOperation({ summary: 'Approve Expense' })
    @Roles(UserRole.SCHOOL_HEAD, UserRole.SUPER_ADMIN)
    approve(@Req() req: any, @Param('id') id: string) {
        return this.expensesService.approve(id, req.user.schoolId, req.user.id);
    }

    @Delete(':id')
    @ApiOperation({ summary: 'Delete Expense' })
    @Roles(UserRole.BURSAR, UserRole.SUPER_ADMIN)
    remove(@Req() req: any, @Param('id') id: string) {
        return this.expensesService.remove(id, req.user.schoolId);
    }
}
