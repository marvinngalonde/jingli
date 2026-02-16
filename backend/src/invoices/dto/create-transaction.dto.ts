import { IsString, IsNotEmpty, IsNumber, IsEnum, Min, IsOptional } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export enum PaymentMethod {
    CASH = 'CASH',
    CARD = 'CARD',
    ONLINE = 'ONLINE',
    CHEQUE = 'CHEQUE',
}

export class CreateTransactionDto {
    @ApiProperty({ example: 'invoice-uuid' })
    @IsString()
    @IsNotEmpty()
    invoiceId: string;

    @ApiProperty({ example: 5000 })
    @IsNumber()
    @Min(0)
    amount: number;

    @ApiProperty({ enum: PaymentMethod, example: PaymentMethod.CASH })
    @IsEnum(PaymentMethod)
    @IsNotEmpty()
    method: PaymentMethod;

    @ApiProperty({ example: 'REF123456', required: false })
    @IsString()
    @IsOptional()
    referenceNo?: string;
}
