import { Controller, Get, Post, Body, Patch, Param, Delete, Query, UseGuards, Req } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth, ApiQuery } from '@nestjs/swagger';
import { InvoicesService } from './invoices.service';
import { CreateInvoiceDto } from './dto/create-invoice.dto';
import { CreateTransactionDto } from './dto/create-transaction.dto';
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

    @Delete(':id')
    @ApiOperation({ summary: 'Delete Invoice' })
    remove(@Req() req: any, @Param('id') id: string) {
        return this.invoicesService.remove(id, req.user.schoolId);
    }
}
