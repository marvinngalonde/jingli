import { IsString, IsNumber, IsOptional, IsEnum, IsDateString } from 'class-validator';

export enum ExpenseCategory {
    OPERATIONS = 'Operations',
    MAINTENANCE = 'Maintenance',
    EQUIPMENT = 'Equipment',
    UTILITIES = 'Utilities',
    SUPPLIES = 'Supplies',
    TRANSPORT = 'Transport',
    CATERING = 'Catering',
    OTHER = 'Other',
}

export class CreateExpenseDto {
    @IsString()
    description: string;

    @IsString()
    category: string;

    @IsNumber()
    amount: number;

    @IsString()
    @IsOptional()
    currency?: string;

    @IsDateString()
    date: string;

    @IsString()
    @IsOptional()
    notes?: string;

    @IsString()
    @IsOptional()
    receiptUrl?: string;
}

export class UpdateExpenseDto {
    @IsString()
    @IsOptional()
    description?: string;

    @IsString()
    @IsOptional()
    category?: string;

    @IsNumber()
    @IsOptional()
    amount?: number;

    @IsString()
    @IsOptional()
    currency?: string;

    @IsDateString()
    @IsOptional()
    date?: string;

    @IsString()
    @IsOptional()
    status?: string;

    @IsString()
    @IsOptional()
    notes?: string;

    @IsString()
    @IsOptional()
    receiptUrl?: string;
}
