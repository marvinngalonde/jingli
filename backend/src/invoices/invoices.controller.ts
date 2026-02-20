import { Controller, Get, Post, Body, Patch, Param, Delete, Query, UseGuards, Req } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth, ApiQuery } from '@nestjs/swagger';
import { InvoicesService } from './invoices.service';
import { CreateInvoiceDto } from './dto/create-invoice.dto';
import { CreateTransactionDto } from './dto/create-transaction.dto';
import { BulkGenerateInvoiceDto } from './dto/bulk-generate-invoice.dto';
import { SupabaseGuard } from '../auth/supabase.guard';

@ApiTags('finance')
@ApiBearerAuth()
@UseGuards(SupabaseGuard)
@Controller('invoices')
export class InvoicesController {
    constructor(private readonly invoicesService: InvoicesService) { }

    @Post()
    @ApiOperation({ summary: 'Create Invoice' })
    create(@Req() req: any, @Body() createDto: CreateInvoiceDto) {
        return this.invoicesService.create(createDto, req.user.schoolId);
    }

    @Post('bulk')
    @ApiOperation({ summary: 'Bulk Generate Invoices' })
    generateBulk(@Req() req: any, @Body() dto: BulkGenerateInvoiceDto) {
        return this.invoicesService.generateBulk(dto, req.user.schoolId);
    }

    @Post('collect')
    @ApiOperation({ summary: 'Collect Payment (Record Transaction)' })
    collectPayment(@Req() req: any, @Body() createDto: CreateTransactionDto) {
        return this.invoicesService.collectPayment(createDto, req.user.schoolId, req.user.id);
    }

    @Get()
    @ApiOperation({ summary: 'List Invoices' })
    @ApiQuery({ name: 'studentId', required: false })
    findAll(@Req() req: any, @Query('studentId') studentId?: string) {
        return this.invoicesService.findAll(req.user.schoolId, studentId);
    }

    @Get(':id')
    @ApiOperation({ summary: 'Get Invoice Details' })
    findOne(@Req() req: any, @Param('id') id: string) {
        return this.invoicesService.findOne(id, req.user.schoolId);
    }

    @Patch(':id')
    @ApiOperation({ summary: 'Update Invoice' })
    update(@Req() req: any, @Param('id') id: string, @Body() updateDto: any) {
        return this.invoicesService.update(id, updateDto, req.user.schoolId);
    }

    @Delete(':id')
    @ApiOperation({ summary: 'Delete Invoice' })
    remove(@Req() req: any, @Param('id') id: string) {
        return this.invoicesService.remove(id, req.user.schoolId);
    }
}
