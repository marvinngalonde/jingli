import { IsString, IsNotEmpty, IsNumber, IsDateString, IsOptional, Min } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateInvoiceDto {
    @ApiProperty({ example: 'student-uuid' })
    @IsString()
    @IsNotEmpty()
    studentId: string;

    @ApiProperty({ example: 'fee-structure-uuid', required: false })
    @IsString()
    @IsOptional()
    feeStructureId?: string;

    @ApiProperty({ example: 5000 })
    @IsNumber()
    @Min(0)
    amount: number;

    @ApiProperty({ example: '2024-02-01' })
    @IsDateString()
    dueDate: string;
}
