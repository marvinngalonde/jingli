import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsNotEmpty, IsDateString, IsNumber } from 'class-validator';

export class BulkGenerateInvoiceDto {
    @ApiProperty({ description: 'ID of the Class Level (e.g., Grade 10) to generate invoices for' })
    @IsString()
    @IsNotEmpty()
    classLevelId: string;

    @ApiProperty({ description: 'ID of the Fee Structure to apply' })
    @IsString()
    @IsNotEmpty()
    feeStructureId: string;

    @ApiProperty({ description: 'Due date for the invoices' })
    @IsDateString()
    @IsNotEmpty()
    dueDate: string;
}
