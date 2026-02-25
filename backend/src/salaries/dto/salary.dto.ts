import { IsString, IsNumber, IsOptional, IsInt, IsEnum, IsDateString } from 'class-validator';

export class CreateSalaryPaymentDto {
    @IsString()
    staffId: string;

    @IsNumber()
    amount: number;

    @IsString()
    @IsOptional()
    currency?: string;

    @IsInt()
    month: number;

    @IsInt()
    year: number;

    @IsString()
    @IsOptional()
    method?: string;

    @IsString()
    @IsOptional()
    notes?: string;
}

export class RunPayrollDto {
    @IsInt()
    month: number;

    @IsInt()
    year: number;

    @IsString()
    @IsOptional()
    currency?: string;
}

export class UpdateSalaryPaymentDto {
    @IsNumber()
    @IsOptional()
    amount?: number;

    @IsString()
    @IsOptional()
    status?: string;

    @IsString()
    @IsOptional()
    method?: string;

    @IsString()
    @IsOptional()
    referenceNo?: string;

    @IsString()
    @IsOptional()
    notes?: string;
}
