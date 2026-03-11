import { Controller, Get, Post, Body, Patch, Param, Delete, Query, UseGuards, Req } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth, ApiQuery } from '@nestjs/swagger';
import { InvoicesService } from './invoices.service';
import { CreateInvoiceDto } from './dto/create-invoice.dto';
import { CreateTransactionDto } from './dto/create-transaction.dto';
import { BulkGenerateInvoiceDto } from './dto/bulk-generate-invoice.dto';
import { SupabaseGuard } from '../auth/supabase.guard';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/roles.decorator';
import { UserRole } from '@prisma/client';

@ApiTags('finance')
@ApiBearerAuth()
@UseGuards(SupabaseGuard, RolesGuard)
@Controller('invoices')
export class InvoicesController {
    constructor(private readonly invoicesService: InvoicesService) { }

    @Post()
    @ApiOperation({ summary: 'Create Invoice' })
    @Roles(UserRole.BURSAR, UserRole.SUPER_ADMIN)
    create(@Req() req: any, @Body() createDto: CreateInvoiceDto) {
        return this.invoicesService.create(createDto, req.user.schoolId);
    }

    @Post('bulk')
    @ApiOperation({ summary: 'Bulk Generate Invoices' })
    @Roles(UserRole.BURSAR, UserRole.SUPER_ADMIN)
    generateBulk(@Req() req: any, @Body() dto: BulkGenerateInvoiceDto) {
        return this.invoicesService.generateBulk(dto, req.user.schoolId);
    }

    @Post('collect')
    @ApiOperation({ summary: 'Collect Payment (Record Transaction)' })
    @Roles(UserRole.BURSAR, UserRole.RECEPTION, UserRole.SENIOR_CLERK, UserRole.SUPER_ADMIN)
    collectPayment(@Req() req: any, @Body() createDto: CreateTransactionDto) {
        return this.invoicesService.collectPayment(createDto, req.user.schoolId, req.user.id);
    }

    @Get('stats')
    @ApiOperation({ summary: 'Get Financial Stats' })
    @Roles(UserRole.BURSAR, UserRole.SCHOOL_HEAD, UserRole.SUPER_ADMIN)
    getStats(@Req() req: any) {
        return this.invoicesService.getStats(req.user.schoolId);
    }

    @Get()
    @ApiOperation({ summary: 'List Invoices' })
    @ApiQuery({ name: 'studentId', required: false })
    @ApiQuery({ name: 'page', required: false })
    @ApiQuery({ name: 'limit', required: false })
    @Roles(UserRole.BURSAR, UserRole.SCHOOL_HEAD, UserRole.RECEPTION, UserRole.SENIOR_CLERK, UserRole.SUPER_ADMIN, UserRole.PARENT, UserRole.STUDENT)
    findAll(
        @Req() req: any,
        @Query('studentId') studentId?: string,
        @Query('page') page?: string,
        @Query('limit') limit?: string
    ) {
        return this.invoicesService.findAll(
            req.user.schoolId,
            studentId,
            page ? parseInt(page) : 1,
            limit ? parseInt(limit) : 20
        );
    }

    @Get(':id')
    @ApiOperation({ summary: 'Get Invoice Details' })
    @Roles(UserRole.BURSAR, UserRole.SCHOOL_HEAD, UserRole.SUPER_ADMIN, UserRole.PARENT, UserRole.STUDENT)
    findOne(@Req() req: any, @Param('id') id: string) {
        return this.invoicesService.findOne(id, req.user.schoolId);
    }

    @Patch(':id')
    @ApiOperation({ summary: 'Update Invoice' })
    @Roles(UserRole.BURSAR, UserRole.SUPER_ADMIN)
    update(@Req() req: any, @Param('id') id: string, @Body() updateDto: any) {
        return this.invoicesService.update(id, updateDto, req.user.schoolId);
    }

    @Delete(':id')
    @ApiOperation({ summary: 'Delete Invoice' })
    @Roles(UserRole.BURSAR, UserRole.SUPER_ADMIN)
    remove(@Req() req: any, @Param('id') id: string) {
        return this.invoicesService.remove(id, req.user.schoolId);
    }
}
