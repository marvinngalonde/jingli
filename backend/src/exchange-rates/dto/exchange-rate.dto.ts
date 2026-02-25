import { IsString, IsNumber, IsOptional, IsDateString } from 'class-validator';

export class CreateExchangeRateDto {
    @IsString()
    fromCurrency: string;

    @IsString()
    toCurrency: string;

    @IsNumber()
    rate: number;

    @IsDateString()
    effectiveDate: string;

    @IsString()
    @IsOptional()
    source?: string;
}
